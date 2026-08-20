import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { VesselComponentProps } from "../../engine/types";

// Expanded Dedicated Image Pool (22 Unique High-Res Assets)
const GALLERY_IMAGES = [
  "/images/components/3d-shatter-sphere/tile-01.webp",
  "/images/components/3d-shatter-sphere/tile-02.webp",
  "/images/components/3d-shatter-sphere/tile-03.webp",
  "/images/components/3d-shatter-sphere/tile-04.webp",
  "/images/components/3d-shatter-sphere/tile-05.webp",
  "/images/components/3d-shatter-sphere/tile-06.webp",
  "/images/components/3d-shatter-sphere/tile-07.webp",
  "/images/components/3d-shatter-sphere/tile-08.webp",
  "/images/components/3d-shatter-sphere/tile-09.webp",
  "/images/components/3d-shatter-sphere/tile-10.webp",
  "/images/components/3d-shatter-sphere/tile-11.webp",
  "/images/components/3d-shatter-sphere/tile-12.webp",
  "/images/components/3d-shatter-sphere/art-01.webp",
  "/images/components/3d-shatter-sphere/art-02.webp",
  "/images/components/3d-shatter-sphere/art-03.webp",
  "/images/components/3d-shatter-sphere/art-04.webp",
  "/images/components/3d-shatter-sphere/art-05.webp",
  "/images/components/3d-shatter-sphere/art-06.webp",
  "/images/components/3d-shatter-sphere/art-07.webp",
  "/images/components/3d-shatter-sphere/art-08.webp",
  "/images/components/3d-shatter-sphere/art-09.webp",
  "/images/components/3d-shatter-sphere/art-10.webp",
];

export interface Apparatus3DShatterSphereProps extends VesselComponentProps {
  sphereRadius?: number; // 3D Sphere/Cuboid radius (200 - 650)
  shatterForce?: number; // Radial explosion magnitude (0.5 - 3.5)
  cardScale?: number; // Tile scale multiplier (0.5 - 2.0)
  autoRotateSpeed?: number; // Idle 3D spin speed (0 - 2.5)
  itemCount?: number; // Number of cards on 3D sphere (20 - 60)
  shapeMode?: "sphere" | "cuboid" | "cuboid-grid"; // 3D Geometry variant
  showCenterText?: boolean; // Control visibility of center text overlay
  autoShatterDelay?: number; // Delay in ms to automatically shatter on mount
  disableRebuildOnClick?: boolean; // Prevent clicking from re-assembling once shattered
}

interface MeshData {
  mesh: THREE.Mesh;
  unitPos: THREE.Vector3; // Position normalized at unit radius 1.0
  baseRot: THREE.Euler;
  material: THREE.MeshBasicMaterial;
  currentProx?: number;
}

export default function Apparatus3DShatterSphere({
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
}: Apparatus3DShatterSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamic Prop Refs for 60FPS Slider Performance
  const sphereRadiusRef = useRef<number>(sphereRadius);
  const shatterForceRef = useRef<number>(shatterForce);
  const cardScaleRef = useRef<number>(cardScale);
  const autoRotateSpeedRef = useRef<number>(autoRotateSpeed);
  const itemCountRef = useRef<number>(itemCount);
  const shapeModeRef = useRef<"sphere" | "cuboid" | "cuboid-grid">(shapeMode);

  useEffect(() => {
    sphereRadiusRef.current = sphereRadius;
    shatterForceRef.current = shatterForce;
    cardScaleRef.current = cardScale;
    autoRotateSpeedRef.current = autoRotateSpeed;
    itemCountRef.current = itemCount;
    shapeModeRef.current = shapeMode;
  }, [sphereRadius, shatterForce, cardScale, autoRotateSpeed, itemCount, shapeMode]);

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
        // Right Click: 3D Rotation
        isRotatingRef.current = true;
        rotVelRef.current = { x: 0, y: 0 };
      } else if (e.button === 0) {
        // Left Click: 3D Spatial Translation
        isDraggingPosRef.current = true;
        posVelRef.current = { x: 0, y: 0 };
        pointerStartRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };

      // Update Normalized Device Coordinates for Magnetic Proximity Wave
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

    // 1. Scene & Camera Setup (Spacious Arena Framing)
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 12000);
    camera.position.set(0, 0, 1900);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. 3D Structure Root Group
    const structureGroup = new THREE.Group();
    scene.add(structureGroup);

    // 4. 3D Core Center Typography Mesh
    const textCanvas = document.createElement("canvas");
    textCanvas.width = 1024;
    textCanvas.height = 512;
    const textCtx = textCanvas.getContext("2d");

    const drawCenterText = () => {
      if (!textCtx) return;
      textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);

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

      textCtx.fillStyle = "rgba(240, 240, 245, 0.95)";
      textCtx.font = "900 80px sans-serif";
      textCtx.textAlign = "center";
      textCtx.textBaseline = "middle";
      textCtx.fillText(title, 512, 220);

      textCtx.fillStyle = "rgba(160, 160, 175, 0.75)";
      textCtx.font = "600 22px monospace";
      textCtx.fillText(subtext, 512, 310);
    };

    drawCenterText();

    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.colorSpace = THREE.SRGBColorSpace;

    updateTextRef.current = () => {
      drawCenterText();
      textTexture.needsUpdate = true;
    };

    const textGeo = new THREE.PlaneGeometry(540, 270);
    const textMat = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    textMesh.position.set(0, 0, 0);
    textMesh.visible = showCenterText;
    structureGroup.add(textMesh);

    // 5. Load Texture Pool & Create Vibrant 3D Image Planes
    const textureLoader = new THREE.TextureLoader();
    const textures = GALLERY_IMAGES.map((src) => {
      const tex = textureLoader.load(src);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    });

    // Helper: Deform plane geometry vertices to curve along 3D sphere radius arc
    const createSphericalCurvedPlaneGeo = (width: number, height: number, radius: number) => {
      const geo = new THREE.PlaneGeometry(width, height, 16, 16);
      const posAttr = geo.attributes.position;

      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const distSq = x * x + y * y;
        const maxRadiusSq = radius * radius;

        if (distSq < maxRadiusSq) {
          const zOffset = radius - Math.sqrt(maxRadiusSq - distSq);
          posAttr.setZ(i, -zOffset * 0.95);
        }
      }

      posAttr.needsUpdate = true;
      geo.computeVertexNormals();
      return geo;
    };

    const defaultPlaneGeo = new THREE.PlaneGeometry(120, 155);
    let meshesData: MeshData[] = [];
    let activeShapeMode = shapeModeRef.current;
    let activeItemCount = itemCountRef.current;

    const rebuildMeshes = () => {
      meshesData.forEach((d) => {
        structureGroup.remove(d.mesh);
        d.mesh.geometry.dispose();
      });
      meshesData = [];

      const mode = shapeModeRef.current;
      const count = itemCountRef.current;

      const faces = [
        { normal: new THREE.Vector3(0, 0, 1), rotY: 0, rotX: 0 }, // Front (+Z)
        { normal: new THREE.Vector3(0, 0, -1), rotY: Math.PI, rotX: 0 }, // Back (-Z)
        { normal: new THREE.Vector3(1, 0, 0), rotY: Math.PI / 2, rotX: 0 }, // Right (+X)
        { normal: new THREE.Vector3(-1, 0, 0), rotY: -Math.PI / 2, rotX: 0 }, // Left (-X)
        { normal: new THREE.Vector3(0, 1, 0), rotY: 0, rotX: -Math.PI / 2 }, // Top (+Y)
        { normal: new THREE.Vector3(0, -1, 0), rotY: 0, rotX: Math.PI / 2 }, // Bottom (-Y)
      ];

      if (mode === "cuboid") {
        // 3D SINGLE IMAGE MONOLITH CUBE: 6 Large Face Monoliths (1 per face)
        const monolithGeo = new THREE.PlaneGeometry(330, 420);

        faces.forEach((face, idx) => {
          const unitPos = face.normal.clone().multiplyScalar(0.75);
          const texture = textures[idx % textures.length];
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1.0,
          });

          const mesh = new THREE.Mesh(monolithGeo, material);
          mesh.rotation.set(face.rotX, face.rotY, 0);
          const baseRot = mesh.rotation.clone();

          structureGroup.add(mesh);

          meshesData.push({
            mesh,
            unitPos,
            baseRot,
            material,
          });
        });
      } else if (mode === "cuboid-grid") {
        // 3D CUBOID GRID: 6 Faces x 4 Image Panels = 24 panels
        let imgIdx = 0;
        faces.forEach((face) => {
          const offsets = [-0.38, 0.38];
          offsets.forEach((ox) => {
            offsets.forEach((oy) => {
              const unitPos = new THREE.Vector3();
              if (face.normal.z !== 0) {
                unitPos.set(ox, oy, face.normal.z * 0.85);
              } else if (face.normal.x !== 0) {
                unitPos.set(face.normal.x * 0.85, oy, ox);
              } else {
                unitPos.set(ox, face.normal.y * 0.85, oy);
              }

              const texture = textures[imgIdx % textures.length];
              imgIdx++;

              const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 1.0,
              });

              const mesh = new THREE.Mesh(defaultPlaneGeo.clone(), material);
              mesh.rotation.set(face.rotX, face.rotY, 0);
              const baseRot = mesh.rotation.clone();

              structureGroup.add(mesh);

              meshesData.push({
                mesh,
                unitPos,
                baseRot,
                material,
              });
            });
          });
        });
      } else {
        // 3D SPHERE MODE: Fibonacci Point Shell Distribution with Spherical Arc Curved Geometry
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        const curvedGeo = createSphericalCurvedPlaneGeo(120, 155, sphereRadiusRef.current);

        for (let i = 0; i < count; i++) {
          const theta = Math.acos(1 - (2 * (i + 0.5)) / count);
          const phi = (2 * Math.PI * i) / goldenRatio;

          const nx = Math.sin(theta) * Math.cos(phi);
          const ny = Math.sin(theta) * Math.sin(phi);
          const nz = Math.cos(theta);

          const unitPos = new THREE.Vector3(nx, ny, nz).normalize();

          const texture = textures[i % textures.length];
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1.0,
          });

          const mesh = new THREE.Mesh(curvedGeo.clone(), material);
          mesh.lookAt(unitPos.clone().multiplyScalar(2));
          const baseRot = mesh.rotation.clone();

          structureGroup.add(mesh);

          meshesData.push({
            mesh,
            unitPos,
            baseRot,
            material,
          });
        }
        curvedGeo.dispose();
      }
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

      // Handle tab-out / frame drop pause cleanly (prevents velocity spikes)
      if (rawDt > 0.08) {
        posVelRef.current.x = 0;
        posVelRef.current.y = 0;
        rotVelRef.current.x = 0;
        rotVelRef.current.y = 0;
      }
      const dt = Math.min(rawDt, 0.033);

      // Rebuild mesh geometry structure if shape mode or item count changes
      if (
        shapeModeRef.current !== activeShapeMode ||
        itemCountRef.current !== activeItemCount
      ) {
        activeShapeMode = shapeModeRef.current;
        activeItemCount = itemCountRef.current;
        rebuildMeshes();
        if (updateTextRef.current) updateTextRef.current();
      }

      // Inertial translation coasting when left-click released
      if (!isDraggingPosRef.current) {
        posRef.current.x += posVelRef.current.x;
        posRef.current.y += posVelRef.current.y;
        posVelRef.current.x *= 0.92;
        posVelRef.current.y *= 0.92;
      }

      // Spacious Soft World Viewport Bounds
      const boundX = 1600;
      const boundY = 1100;
      posRef.current.x = Math.max(-boundX, Math.min(boundX, posRef.current.x));
      posRef.current.y = Math.max(-boundY, Math.min(boundY, posRef.current.y));

      // Cinematic Multi-Harmonic Bio-Levitation (Alien species breathing/floating)
      const bioFloatX = Math.sin(time * 0.00072) * 18 + Math.cos(time * 0.00038) * 12;
      const bioFloatY = Math.sin(time * 0.00095) * 36 + Math.cos(time * 0.00052) * 20;
      const bioFloatZ = Math.sin(time * 0.00082) * 28 + Math.cos(time * 0.00044) * 14;
      const bioRoll = Math.sin(time * 0.00065) * 0.04;
      const bioPitch = Math.cos(time * 0.00058) * 0.035;

      // Track previous position to compute motion velocity
      const prevX = structureGroup.position.x;
      const prevY = structureGroup.position.y;

      // Ultra-fluid 60fps translation follow with bio-levitation drift
      const targetX = posRef.current.x + bioFloatX;
      const targetY = posRef.current.y + bioFloatY;
      structureGroup.position.x += (targetX - structureGroup.position.x) * (1 - Math.exp(-10.0 * dt));
      structureGroup.position.y += (targetY - structureGroup.position.y) * (1 - Math.exp(-10.0 * dt));

      const moveVx = (structureGroup.position.x - prevX) / (dt || 0.016);
      const moveVy = (structureGroup.position.y - prevY) / (dt || 0.016);
      const speedMag = Math.hypot(moveVx, moveVy);

      // Rotational angular velocity magnitude
      const rotSpeedMag = Math.hypot(rotVelRef.current.x, rotVelRef.current.y);

      // Dynamic High-Velocity Jelly Stretch (Allows up to +28% stretch on hard fast drags)
      const stretchAmount = Math.min(0.28, speedMag * 0.00016);
      const squashAmount = stretchAmount * 0.46;
      const moveAngle = Math.atan2(moveVy, moveVx);

      // Rotational Centrifugal Bulge
      const spinStretch = Math.min(0.18, rotSpeedMag * 14.0);
      const spinBulgeX = spinStretch * (Math.abs(rotVelRef.current.y) / (rotSpeedMag || 1));
      const spinBulgeY = spinStretch * (Math.abs(rotVelRef.current.x) / (rotSpeedMag || 1));

      const targetScaleX = 1.0 + stretchAmount * Math.abs(Math.cos(moveAngle)) - squashAmount * Math.abs(Math.sin(moveAngle)) + spinBulgeX * 0.75;
      const targetScaleY = 1.0 + stretchAmount * Math.abs(Math.sin(moveAngle)) - squashAmount * Math.abs(Math.cos(moveAngle)) + spinBulgeY * 0.75;
      const targetScaleZ = 1.0 - (stretchAmount - squashAmount) * 0.5 - spinStretch * 0.6;

      // Spring-loaded viscoelastic recovery
      structureGroup.scale.x += (targetScaleX - structureGroup.scale.x) * (1 - Math.exp(-8.5 * dt));
      structureGroup.scale.y += (targetScaleY - structureGroup.scale.y) * (1 - Math.exp(-8.5 * dt));
      structureGroup.scale.z += (targetScaleZ - structureGroup.scale.z) * (1 - Math.exp(-8.5 * dt));

      // Fluid Momentum Lean + Spin Torsion Wobble
      const targetTiltZ = -moveVx * 0.00009;
      const targetTiltX = moveVy * 0.00009;
      momentumTiltRef.current.z += (targetTiltZ - momentumTiltRef.current.z) * (1 - Math.exp(-8.0 * dt));
      momentumTiltRef.current.x += (targetTiltX - momentumTiltRef.current.x) * (1 - Math.exp(-8.0 * dt));

      // 3D Rotation with Right-Drag Inertial Momentum + Ambient Spin
      const speed = autoRotateSpeedRef.current;
      if (!isRotatingRef.current) {
        rotVelRef.current.x *= 0.94;
        rotVelRef.current.y *= 0.94;
        rotAngleRef.current.y += speed * 0.45 * dt + rotVelRef.current.y;
        rotAngleRef.current.x += rotVelRef.current.x;
      } else {
        rotAngleRef.current.y += rotVelRef.current.y;
        rotAngleRef.current.x += rotVelRef.current.x;
        rotVelRef.current.x *= 0.8;
        rotVelRef.current.y *= 0.8;
      }

      // Smooth application of full 360-degree rotation + dynamic centrifugal torsion + bio-drift
      const spinTorsion = Math.sin(time * 0.015) * rotSpeedMag * 0.35;
      structureGroup.rotation.x = rotAngleRef.current.x + momentumTiltRef.current.x + bioPitch;
      structureGroup.rotation.y = rotAngleRef.current.y;
      structureGroup.rotation.z = momentumTiltRef.current.z + spinTorsion + bioRoll;

      // Tactile Depth Plunge on left-click drag + bio depth breathing
      const targetPosZ = (isDraggingPosRef.current ? -100 : 0) + bioFloatZ;
      structureGroup.position.z += (targetPosZ - structureGroup.position.z) * (1 - Math.exp(-5.5 * dt));

      // Smooth Shatter Explosion Lerp Progress with Elastic Overshoot
      const targetShatter = isShatteredRef.current ? 1 : 0;
      shatterProgressRef.current += (targetShatter - shatterProgressRef.current) * (1 - Math.exp(-6.5 * dt));
      const sP = shatterProgressRef.current;

      const currentRadius = sphereRadiusRef.current;
      const currentShatterForce = shatterForceRef.current;
      const currentCardScale = cardScaleRef.current;

      // Dynamically scale 3D structure layout distance proportionally with cardScale & sphereRadius at 60FPS
      const layoutMultiplier = Math.max(1.0, 0.5 + currentCardScale * 0.5);
      const effectiveDistance = currentRadius * layoutMultiplier;

      // Dynamic Camera Z Framing: Spacious arena distance
      const targetCameraZ = Math.max(
        1900,
        effectiveDistance * (1 + sP * currentShatterForce * 0.7) * 1.5
      );
      camera.position.z += (targetCameraZ - camera.position.z) * (1 - Math.exp(-8 * dt));

      const totalItems = Math.max(1, meshesData.length - 1);
      const mouseNDC = mouseNDCRef.current;
      const tempWorldPos = new THREE.Vector3();
      const tempNDC = new THREE.Vector3();

      // Assembly Build Animation Progress (3.5s Staggered Entrance)
      const elapsedSec = (time - mountTimeRef.current) / 1000;

      meshesData.forEach((data, i) => {
        // Micro Stagger + Spring Elastic Overshoot
        const staggerRatio = i / totalItems;
        const tileSP = Math.max(0, Math.min(1, (sP - staggerRatio * 0.12) / 0.88));
        const elasticBounce = Math.sin(tileSP * Math.PI) * 0.05;
        const progress = tileSP + elasticBounce;

        // Assembly Build Calculation (7.0s total window, 4.0s stagger spread)
        const staggerDelay = (i / totalItems) * 4.0;
        const tileElapsed = Math.max(0, elapsedSec - staggerDelay);
        const tileDuration = 3.0;
        const rawBuildProgress = Math.min(1, tileElapsed / tileDuration);
        const buildProgress = 1 - Math.pow(1 - rawBuildProgress, 3); // cubic ease out
        const buildDisplacement = (1 - buildProgress) * 2.2;
        let buildScale = currentCardScale * (0.3 + buildProgress * 0.7);
        const buildOpacity = Math.min(1, buildProgress * 1.5);

        // Pre-Shatter Anticipation Tremor & Compression (750ms right before auto-shatter)
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

        // Base layout push distance
        const pushMultiplier = activeShapeMode === "cuboid" ? 1.25 : activeShapeMode === "cuboid-grid" ? 1.1 : 0.85;
        const pushDist = (1 + buildDisplacement + anticipationDisplace) + progress * currentShatterForce * pushMultiplier;
        let dist = effectiveDistance * pushDist;

        // 3D Magnetic Proximity Wave with Per-Tile Smoothstep & Viscous Momentum
        tempWorldPos.copy(data.unitPos).multiplyScalar(dist).applyMatrix4(structureGroup.matrixWorld);
        tempNDC.copy(tempWorldPos).project(camera);

        let targetProx = 0;
        if (tempNDC.z > 0 && tempNDC.z < 1.0) {
          const distScreen = Math.hypot(tempNDC.x - mouseNDC.x, tempNDC.y - mouseNDC.y);
          if (distScreen < 0.44) {
            const t = 1 - distScreen / 0.44;
            // Cubic Hermite smoothstep for buttery bell-curve
            targetProx = t * t * (3 - 2 * t);
          }
        }

        // 60FPS per-card smooth exponential momentum dampening
        data.currentProx = (data.currentProx ?? 0) + (targetProx - (data.currentProx ?? 0)) * (1 - Math.exp(-7.5 * dt));
        const proximity = data.currentProx;

        // Soft, fluid physical displacement
        dist += proximity * 48;
        buildScale *= (1.0 + proximity * 0.12);
        const proxTiltX = (mouseNDC.y - tempNDC.y) * proximity * 0.22;
        const proxTiltY = (mouseNDC.x - tempNDC.x) * proximity * 0.22;

        data.mesh.position.set(data.unitPos.x * dist, data.unitPos.y * dist, data.unitPos.z * dist);
        const finalOpacity = Math.min(1.0, buildOpacity + proximity * 0.18);

        if (activeShapeMode === "cuboid") {
          // Monolith Cube: 6 Monolith Vault Wall Unfold & Sliding Displacement
          const hAngle = progress * 0.65 * (i % 2 === 0 ? 1 : -1);
          data.mesh.rotation.set(
            data.baseRot.x + proxTiltX + hAngle,
            data.baseRot.y + proxTiltY + hAngle * 0.5,
            data.baseRot.z
          );
        } else if (activeShapeMode === "cuboid-grid") {
          // Cuboid Grid: Deconstructed Matrix Blueprint Dispersal
          const zSpin = progress * Math.PI * (i % 2 === 0 ? 0.4 : -0.4);
          data.mesh.rotation.set(
            data.baseRot.x + proxTiltX,
            data.baseRot.y + proxTiltY,
            data.baseRot.z + zSpin
          );
        } else {
          // Default Sphere: Spherical Radial Burst
          data.mesh.rotation.set(
            data.baseRot.x + proxTiltX,
            data.baseRot.y + proxTiltY,
            data.baseRot.z
          );
        }

        data.material.opacity = finalOpacity;
        data.mesh.scale.set(buildScale, buildScale, buildScale);
      });

      // Render WebGL Frame
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      renderer.dispose();
      defaultPlaneGeo.dispose();
      textGeo.dispose();
      textMat.dispose();
      textTexture.dispose();
      textures.forEach((t) => t.dispose());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen bg-[#050507] overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      style={style}
    >
      {/* High-Performance 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
}
