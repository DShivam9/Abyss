import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { ShatterSphereProps, MeshData } from "./types";
import { GALLERY_IMAGES } from "./constants";
import { usePerformance } from "../../engine/PerformanceProvider";
import { useLatestRef } from "../../hooks/use-latest-ref";
import {
  createCenterText,
  loadCoverTextures,
  buildStructureMeshes,
} from "./scene";
import styles from "./styles.module.css";

export function ShatterSphere({
  sphereRadius = 420,
  shatterForce = 1.8,
  cardScale = 1.05,
  autoRotateSpeed = 0.18,
  itemCount = 42,
  shapeMode = "sphere",
  showCenterText = true,
  autoShatterDelay = 0,
  disableRebuildOnClick = false,
  className = "",
  style = {},
  onLifecycleChange,
}: ShatterSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const perf = usePerformance();
  const perfRef = useLatestRef(perf);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setPixelRatio(perf.dpr);
    }
  }, [perf.dpr]);

  // Dynamic Prop Refs for 60FPS Slider Performance
  const sphereRadiusRef = useLatestRef(sphereRadius);
  const shatterForceRef = useLatestRef(shatterForce);
  const cardScaleRef = useLatestRef(cardScale);
  const autoRotateSpeedRef = useLatestRef(autoRotateSpeed);
  const itemCountRef = useLatestRef(itemCount);
  const shapeModeRef = useLatestRef(shapeMode);

  // 3D Shatter & Assembly State
  const mountTimeRef = useRef<number>(performance.now());
  const [, setIsShattered] = useState<boolean>(false);
  const isShatteredRef = useRef<boolean>(false);
  const shatterProgressRef = useRef<number>(0);
  const updateTextRef = useRef<(() => void) | null>(null);

  // 3D Dual-Mode State: Left-Drag (Translation) & Right-Drag (Rotation)
  const isDraggingPosRef = useRef<boolean>(false);
  const isRotatingRef = useRef<boolean>(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseNDCRef = useRef<{ x: number; y: number }>({ x: 9999, y: 9999 });
  const posRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const posVelRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotAngleRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotVelRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const momentumTiltRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const pointerStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  // Toggle Shatter state
  const triggerShatter = useCallback(() => {
    const nextState = !isShatteredRef.current;
    isShatteredRef.current = nextState;
    setIsShattered(nextState);
    if (updateTextRef.current) {
      updateTextRef.current();
    }
    if (onLifecycleChange) {
      onLifecycleChange(nextState ? "peak" : "idle");
    }
  }, [onLifecycleChange]);

  // Optional Auto Shatter on Mount Delay
  useEffect(() => {
    if (autoShatterDelay && autoShatterDelay > 0) {
      const timer = setTimeout(() => {
        if (!isShatteredRef.current) {
          triggerShatter();
        }
      }, autoShatterDelay);
      return () => clearTimeout(timer);
    }
  }, [autoShatterDelay, triggerShatter]);

  // Dual Interaction Handlers: Left-Drag (Spatial Move) vs Right-Drag (3D Rotation)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handlePointerDown = (e: PointerEvent) => {
      lastMouseRef.current = { x: e.clientX, y: e.clientY };

      if (e.button === 2) {
        isRotatingRef.current = true;
        rotVelRef.current = { x: 0, y: 0 };
      } else if (e.button === 0) {
        isDraggingPosRef.current = true;
        posVelRef.current = { x: 0, y: 0 };
        pointerStartRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };

      const rect = container.getBoundingClientRect();
      mouseNDCRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNDCRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isRotatingRef.current) {
        rotVelRef.current.y = -dx * 0.005;
        rotVelRef.current.x = dy * 0.005;
      }

      if (isDraggingPosRef.current) {
        const moveX = dx * 2.2;
        const moveY = -dy * 2.2;
        posRef.current.x += moveX;
        posRef.current.y += moveY;
        posVelRef.current.x = moveX;
        posVelRef.current.y = moveY;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.button === 2) {
        isRotatingRef.current = false;
      }

      if (e.button === 0 && isDraggingPosRef.current) {
        isDraggingPosRef.current = false;

        const dx = e.clientX - pointerStartRef.current.x;
        const dy = e.clientY - pointerStartRef.current.y;
        const dist = Math.hypot(dx, dy);
        const duration = performance.now() - pointerStartRef.current.time;

        if (dist < 6 && duration < 350) {
          if (!disableRebuildOnClick || !isShatteredRef.current) {
            triggerShatter();
          }
        }
      }
    };

    const handlePointerLeave = () => {
      mouseNDCRef.current.x = 9999;
      mouseNDCRef.current.y = 9999;
    };

    container.addEventListener("contextmenu", handleContextMenu);
    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      container.removeEventListener("contextmenu", handleContextMenu);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [disableRebuildOnClick, triggerShatter]);

  // Pure Three.js WebGL Scene Initialization & 60FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 12000);
    camera.position.set(0, 0, 1900);

    // 2. WebGL Renderer
    const isLow = perfRef.current.tier === "low";
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isLow,
      alpha: true,
      powerPreference: "high-performance",
      precision: isLow ? "mediump" : "highp",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(perfRef.current.dpr);
    rendererRef.current = renderer;

    // 3. 3D Structure Root Group
    const structureGroup = new THREE.Group();
    scene.add(structureGroup);

    // 4. Center Typography
    const centerText = createCenterText(structureGroup, showCenterText);

    const refreshCenterText = () => {
      const mode = shapeModeRef.current;
      const title = isShatteredRef.current
        ? "SHATTERED"
        : mode === "cuboid"
        ? "MONOLITH CUBE"
        : mode === "cuboid-grid"
        ? "SHATTER CUBOID"
        : "SHATTER SPHERE";
      const subtext = `LEFT DRAG TO MOVE · RIGHT DRAG TO ROTATE · CLICK TO ${
        isShatteredRef.current ? "REASSEMBLE" : "EXPLODE"
      }`;
      centerText.updateCenterText(title, subtext);
    };

    refreshCenterText();
    updateTextRef.current = refreshCenterText;

    // 5. Textures & Geometry Pool
    const textures = loadCoverTextures(GALLERY_IMAGES);
    const defaultPlaneGeo = new THREE.PlaneGeometry(120, 155);
    let meshesData: MeshData[] = [];
    let activeShapeMode = shapeModeRef.current;
    let activeItemCount = itemCountRef.current;

    const rebuildMeshes = () => {
      meshesData.forEach((d) => {
        structureGroup.remove(d.mesh);
        d.mesh.geometry.dispose();
      });
      meshesData = buildStructureMeshes({
        mode: shapeModeRef.current,
        count: itemCountRef.current,
        radius: sphereRadiusRef.current,
        textures,
        structureGroup,
        isLowTier: perfRef.current.tier === "low",
        defaultPlaneGeo,
      });
    };

    rebuildMeshes();

    // 6. Window Resize & Tab Visibility Handlers
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    const handleVisibilityChange = () => {
      lastTime = performance.now();
      posVelRef.current = { x: 0, y: 0 };
      rotVelRef.current = { x: 0, y: 0 };
      mouseNDCRef.current = { x: 9999, y: 9999 };
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 7. 60FPS High-Performance WebGL Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const rawDt = (time - lastTime) / 1000;
      lastTime = time;

      if (rawDt > 0.08) {
        posVelRef.current.x = 0;
        posVelRef.current.y = 0;
        rotVelRef.current.x = 0;
        rotVelRef.current.y = 0;
      }
      const dt = Math.min(rawDt, 0.033);

      if (
        shapeModeRef.current !== activeShapeMode ||
        itemCountRef.current !== activeItemCount
      ) {
        activeShapeMode = shapeModeRef.current;
        activeItemCount = itemCountRef.current;
        rebuildMeshes();
        if (updateTextRef.current) updateTextRef.current();
      }

      if (!isDraggingPosRef.current) {
        posRef.current.x += posVelRef.current.x;
        posRef.current.y += posVelRef.current.y;
        posVelRef.current.x *= 0.92;
        posVelRef.current.y *= 0.92;
      }

      const boundX = 1600;
      const boundY = 1100;
      posRef.current.x = Math.max(-boundX, Math.min(boundX, posRef.current.x));
      posRef.current.y = Math.max(-boundY, Math.min(boundY, posRef.current.y));

      const isMotionReduced = perfRef.current.reducedMotion;
      const bioFloatX = isMotionReduced ? 0 : Math.sin(time * 0.00072) * 18 + Math.cos(time * 0.00038) * 12;
      const bioFloatY = isMotionReduced ? 0 : Math.sin(time * 0.00095) * 36 + Math.cos(time * 0.00052) * 20;
      const bioFloatZ = isMotionReduced ? 0 : Math.sin(time * 0.00082) * 28 + Math.cos(time * 0.00044) * 14;
      const bioRoll = isMotionReduced ? 0 : Math.sin(time * 0.00065) * 0.04;
      const bioPitch = isMotionReduced ? 0 : Math.cos(time * 0.00058) * 0.035;

      const prevX = structureGroup.position.x;
      const prevY = structureGroup.position.y;

      const targetX = posRef.current.x + bioFloatX;
      const targetY = posRef.current.y + bioFloatY;
      structureGroup.position.x += (targetX - structureGroup.position.x) * (1 - Math.exp(-10.0 * dt));
      structureGroup.position.y += (targetY - structureGroup.position.y) * (1 - Math.exp(-10.0 * dt));

      const moveVx = (structureGroup.position.x - prevX) / (dt || 0.016);
      const moveVy = (structureGroup.position.y - prevY) / (dt || 0.016);
      const speedMag = Math.hypot(moveVx, moveVy);
      const rotSpeedMag = Math.hypot(rotVelRef.current.x, rotVelRef.current.y);

      const stretchAmount = isMotionReduced ? 0 : Math.min(0.28, speedMag * 0.00016);
      const squashAmount = stretchAmount * 0.46;
      const moveAngle = Math.atan2(moveVy, moveVx);

      const spinStretch = isMotionReduced ? 0 : Math.min(0.18, rotSpeedMag * 14.0);
      const spinBulgeX = spinStretch * (Math.abs(rotVelRef.current.y) / (rotSpeedMag || 1));
      const spinBulgeY = spinStretch * (Math.abs(rotVelRef.current.x) / (rotSpeedMag || 1));

      const targetScaleX = 1.0 + stretchAmount * Math.abs(Math.cos(moveAngle)) - squashAmount * Math.abs(Math.sin(moveAngle)) + spinBulgeX * 0.75;
      const targetScaleY = 1.0 + stretchAmount * Math.abs(Math.sin(moveAngle)) - squashAmount * Math.abs(Math.cos(moveAngle)) + spinBulgeY * 0.75;
      const targetScaleZ = 1.0 - (stretchAmount - squashAmount) * 0.5 - spinStretch * 0.6;

      structureGroup.scale.x += (targetScaleX - structureGroup.scale.x) * (1 - Math.exp(-8.5 * dt));
      structureGroup.scale.y += (targetScaleY - structureGroup.scale.y) * (1 - Math.exp(-8.5 * dt));
      structureGroup.scale.z += (targetScaleZ - structureGroup.scale.z) * (1 - Math.exp(-8.5 * dt));

      const targetTiltZ = isMotionReduced ? 0 : -moveVx * 0.00009;
      const targetTiltX = isMotionReduced ? 0 : moveVy * 0.00009;
      momentumTiltRef.current.z += (targetTiltZ - momentumTiltRef.current.z) * (1 - Math.exp(-8.0 * dt));
      momentumTiltRef.current.x += (targetTiltX - momentumTiltRef.current.x) * (1 - Math.exp(-8.0 * dt));

      const speed = isMotionReduced ? 0 : autoRotateSpeedRef.current;
      const dtRatio = dt * 60;
      if (!isRotatingRef.current) {
        const decay = Math.pow(0.94, dtRatio);
        rotVelRef.current.x *= decay;
        rotVelRef.current.y *= decay;
        rotAngleRef.current.y += speed * 0.45 * dt + rotVelRef.current.y;
        rotAngleRef.current.x += rotVelRef.current.x;
      } else {
        rotAngleRef.current.y += rotVelRef.current.y;
        rotAngleRef.current.x += rotVelRef.current.x;
        const dragDecay = Math.pow(0.8, dtRatio);
        rotVelRef.current.x *= dragDecay;
        rotVelRef.current.y *= dragDecay;
      }

      const spinTorsion = Math.sin(time * 0.015) * rotSpeedMag * 0.35;
      structureGroup.rotation.x = rotAngleRef.current.x + momentumTiltRef.current.x + bioPitch;
      structureGroup.rotation.y = rotAngleRef.current.y;
      structureGroup.rotation.z = momentumTiltRef.current.z + spinTorsion + bioRoll;

      const targetPosZ = (isDraggingPosRef.current ? -100 : 0) + bioFloatZ;
      structureGroup.position.z += (targetPosZ - structureGroup.position.z) * (1 - Math.exp(-5.5 * dt));

      const targetShatter = isShatteredRef.current ? 1 : 0;
      shatterProgressRef.current += (targetShatter - shatterProgressRef.current) * (1 - Math.exp(-6.5 * dt));
      const sP = shatterProgressRef.current;

      const currentRadius = sphereRadiusRef.current;
      const currentShatterForce = shatterForceRef.current;
      const currentCardScale = cardScaleRef.current;

      const layoutMultiplier = Math.max(1.0, 0.5 + currentCardScale * 0.5);
      const effectiveDistance = currentRadius * layoutMultiplier;

      const targetCameraZ = Math.max(
        1900,
        effectiveDistance * (1 + sP * currentShatterForce * 0.7) * 1.5
      );
      camera.position.z += (targetCameraZ - camera.position.z) * (1 - Math.exp(-8 * dt));

      const totalItems = Math.max(1, meshesData.length - 1);
      const mouseNDC = mouseNDCRef.current;
      const tempWorldPos = new THREE.Vector3();
      const tempNDC = new THREE.Vector3();

      const elapsedSec = (time - mountTimeRef.current) / 1000;

      meshesData.forEach((data, i) => {
        const staggerRatio = i / totalItems;
        const tileSP = Math.max(0, Math.min(1, (sP - staggerRatio * 0.12) / 0.88));
        const elasticBounce = Math.sin(tileSP * Math.PI) * 0.05;
        const progress = tileSP + elasticBounce;

        const staggerDelay = (i / totalItems) * 4.0;
        const tileElapsed = Math.max(0, elapsedSec - staggerDelay);
        const tileDuration = 3.0;
        const rawBuildProgress = Math.min(1, tileElapsed / tileDuration);
        const buildProgress = 1 - Math.pow(1 - rawBuildProgress, 3);
        const buildDisplacement = (1 - buildProgress) * 2.2;
        let buildScale = currentCardScale * (0.3 + buildProgress * 0.7);
        const buildOpacity = Math.min(1, buildProgress * 1.5);

        let anticipationDisplace = 0;
        if (autoShatterDelay > 0 && !isShatteredRef.current) {
          const shatterTimeSec = autoShatterDelay / 1000;
          const anticipStart = shatterTimeSec - 0.75;
          if (elapsedSec >= anticipStart && elapsedSec < shatterTimeSec) {
            const ratio = (elapsedSec - anticipStart) / 0.75;
            anticipationDisplace = Math.sin(time * 0.045 + i * 1.5) * ratio * 0.05;
            buildScale *= 1.0 - Math.sin(ratio * Math.PI) * 0.07;
          }
        }

        const pushMultiplier = activeShapeMode === "cuboid" ? 1.25 : activeShapeMode === "cuboid-grid" ? 1.1 : 0.85;
        const pushDist = (1 + buildDisplacement + anticipationDisplace) + progress * currentShatterForce * pushMultiplier;
        let dist = effectiveDistance * pushDist;

        tempWorldPos.copy(data.unitPos).multiplyScalar(dist).applyMatrix4(structureGroup.matrixWorld);
        tempNDC.copy(tempWorldPos).project(camera);

        let targetProx = 0;
        if (tempNDC.z > 0 && tempNDC.z < 1.0) {
          const distScreen = Math.hypot(tempNDC.x - mouseNDC.x, tempNDC.y - mouseNDC.y);
          if (distScreen < 0.44) {
            const t = 1 - distScreen / 0.44;
            targetProx = t * t * (3 - 2 * t);
          }
        }

        data.currentProx = (data.currentProx ?? 0) + (targetProx - (data.currentProx ?? 0)) * (1 - Math.exp(-7.5 * dt));
        const proximity = data.currentProx;

        dist += proximity * 48;
        buildScale *= (1.0 + proximity * 0.12);
        const proxTiltX = (mouseNDC.y - tempNDC.y) * proximity * 0.22;
        const proxTiltY = (mouseNDC.x - tempNDC.x) * proximity * 0.22;

        data.mesh.position.set(data.unitPos.x * dist, data.unitPos.y * dist, data.unitPos.z * dist);
        const finalOpacity = Math.min(1.0, buildOpacity + proximity * 0.18);

        if (activeShapeMode === "cuboid") {
          const hAngle = progress * 0.65 * (i % 2 === 0 ? 1 : -1);
          data.mesh.rotation.set(
            data.baseRot.x + proxTiltX + hAngle,
            data.baseRot.y + proxTiltY + hAngle * 0.5,
            data.baseRot.z
          );
        } else if (activeShapeMode === "cuboid-grid") {
          const zSpin = progress * Math.PI * (i % 2 === 0 ? 0.4 : -0.4);
          data.mesh.rotation.set(
            data.baseRot.x + proxTiltX,
            data.baseRot.y + proxTiltY,
            data.baseRot.z + zSpin
          );
        } else {
          data.mesh.rotation.set(
            data.baseRot.x + proxTiltX,
            data.baseRot.y + proxTiltY,
            data.baseRot.z
          );
        }

        data.material.opacity = finalOpacity;
        data.mesh.scale.set(buildScale, buildScale, buildScale);
      });

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      rendererRef.current = null;
      renderer.dispose();
      defaultPlaneGeo.dispose();
      centerText.textGeo.dispose();
      centerText.textMat.dispose();
      centerText.textTexture.dispose();
      textures.forEach((t) => t.dispose());
      meshesData.forEach((d) => {
        structureGroup.remove(d.mesh);
        d.mesh.geometry.dispose();
        d.material.dispose();
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.wrapper} ${className}`}
      style={style}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}

export const ThreeDShatterSphere = ShatterSphere;
export type { ShatterSphereProps };
export default ShatterSphere;
