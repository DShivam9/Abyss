import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { VesselComponentProps } from "../../engine/types";

// Expanded Dedicated Image Pool (22 Unique High-Res Assets)
const GALLERY_IMAGES = [
  "/images/components%20images/Gallary/cosmos_1110264921.webp",
  "/images/components%20images/Gallary/cosmos_1309943729.webp",
  "/images/components%20images/Gallary/cosmos_140351120.webp",
  "/images/components%20images/Gallary/cosmos_1441380570.webp",
  "/images/components%20images/Gallary/cosmos_145253936.webp",
  "/images/components%20images/Gallary/cosmos_1578342658.webp",
  "/images/components%20images/Gallary/cosmos_1724531036.webp",
  "/images/components%20images/Gallary/cosmos_1948095192.webp",
  "/images/components%20images/Gallary/cosmos_2046923474.webp",
  "/images/components%20images/Gallary/cosmos_623139356.webp",
  "/images/components%20images/Gallary/cosmos_842932938.webp",
  "/images/components%20images/Gallary/cosmos_854490082.webp",
  "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015,%202026,%2005_26_02%20PM.webp",
  "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015,%202026,%2005_29_20%20PM.webp",
  "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015,%202026,%2005_37_33%20PM.webp",
  "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015,%202026,%2005_44_29%20PM.webp",
  "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015,%202026,%2005_45_55%20PM.webp",
  "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015,%202026,%2005_54_47%20PM.webp",
  "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2016,%202026,%2006_08_32%20PM.webp",
  "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2016,%202026,%2006_10_44%20PM.webp",
  "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2016,%202026,%2006_11_21%20PM.webp",
  "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2016,%202026,%2006_12_28%20PM.webp",
];

export interface Apparatus3DShatterSphereProps extends VesselComponentProps {
  sphereRadius?: number; // 3D Sphere/Cuboid radius (200 - 650)
  shatterForce?: number; // Radial explosion magnitude (0.5 - 3.5)
  cardScale?: number; // Tile scale multiplier (0.5 - 2.0)
  autoRotateSpeed?: number; // Idle 3D spin speed (0 - 2.5)
  itemCount?: number; // Number of cards on 3D sphere (20 - 60)
  shapeMode?: "sphere" | "cuboid" | "cuboid-grid"; // 3D Geometry variant
}

interface MeshData {
  mesh: THREE.Mesh;
  unitPos: THREE.Vector3; // Position normalized at unit radius 1.0
  baseRot: THREE.Euler;
  material: THREE.MeshBasicMaterial;
}

export default function Apparatus3DShatterSphere({
  sphereRadius = 420,
  shatterForce = 1.8,
  cardScale = 1.05,
  autoRotateSpeed = 0.5,
  itemCount = 42,
  shapeMode = "sphere",
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

  // 3D Shatter State
  const [, setIsShattered] = useState<boolean>(false);
  const isShatteredRef = useRef<boolean>(false);
  const shatterProgressRef = useRef<number>(0);
  const updateTextRef = useRef<(() => void) | null>(null);

  // 3D Drag Rotation & Momentum State
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velXRef = useRef<number>(0);
  const velYRef = useRef<number>(0);
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

  // Intuitive Pointer Drag & Click Disambiguation Handlers (Drag Right -> Move Right)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      velXRef.current = 0;
      velYRef.current = 0;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      pointerStartRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };

      // Inverted Y rotation so dragging mouse right rotates the globe rightward intuitively
      velYRef.current = -dx * 0.0045;
      velXRef.current = dy * 0.0045;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        const dx = e.clientX - pointerStartRef.current.x;
        const dy = e.clientY - pointerStartRef.current.y;
        const dist = Math.hypot(dx, dy);
        const duration = performance.now() - pointerStartRef.current.time;

        if (dist < 6 && duration < 350) {
          triggerShatter();
        }
      }
    };

    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [triggerShatter]);

  // Pure Three.js WebGL Scene Initialization & 60FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(0, 0, 1650);

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
      const subtext = `DRAG TO ROTATE 3D ${mode.startsWith("cuboid") ? "CUBOID" : "GLOBE"} · CLICK TO ${
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
    scene.add(textMesh);

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

    // 6. Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 7. 60FPS High-Performance WebGL Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

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

      // Inertial 3D Drag Rotation & Idle Momentum Spin
      const speed = autoRotateSpeedRef.current;
      if (!isDraggingRef.current) {
        velYRef.current *= 0.94;
        velXRef.current *= 0.94;
        structureGroup.rotation.y += speed * 0.5 * dt + velYRef.current;
        structureGroup.rotation.x += velXRef.current;
      } else {
        structureGroup.rotation.y += velYRef.current;
        structureGroup.rotation.x += velXRef.current;
        velYRef.current *= 0.8;
        velXRef.current *= 0.8;
      }

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

      // Dynamic Camera Z Framing: Prevents tile clipping at high radius & max shatter force
      const targetCameraZ = Math.max(
        1650,
        effectiveDistance * (1 + sP * currentShatterForce * 0.7) * 1.4
      );
      camera.position.z += (targetCameraZ - camera.position.z) * (1 - Math.exp(-8 * dt));

      const totalItems = Math.max(1, meshesData.length - 1);
      const tiltX = velXRef.current * 1.6;
      const tiltY = velYRef.current * 1.6;

      meshesData.forEach((data, i) => {
        // Micro Stagger + Spring Elastic Overshoot
        const staggerRatio = i / totalItems;
        const tileSP = Math.max(0, Math.min(1, (sP - staggerRatio * 0.12) / 0.88));
        const elasticBounce = Math.sin(tileSP * Math.PI) * 0.05;
        const progress = tileSP + elasticBounce;

        if (activeShapeMode === "cuboid") {
          // Monolith Cube: 6 Monolith Vault Wall Unfold & Sliding Displacement
          const pushDist = 1 + progress * currentShatterForce * 1.25;
          const scaledPos = data.unitPos.clone().multiplyScalar(effectiveDistance * pushDist);
          data.mesh.position.copy(scaledPos);

          // Hinge unfold tilt on shatter
          const hAngle = progress * 0.65 * (i % 2 === 0 ? 1 : -1);
          data.mesh.rotation.set(
            data.baseRot.x + tiltX + hAngle,
            data.baseRot.y + tiltY + hAngle * 0.5,
            data.baseRot.z
          );
          data.material.opacity = 1.0;
        } else if (activeShapeMode === "cuboid-grid") {
          // Cuboid Grid: Deconstructed Matrix Blueprint Dispersal
          const matrixDisplace = 1 + progress * currentShatterForce * 1.1;
          const scaledPos = data.unitPos.clone().multiplyScalar(effectiveDistance * matrixDisplace);
          data.mesh.position.copy(scaledPos);

          // Z-axis matrix panel rotation on shatter
          const zSpin = progress * Math.PI * (i % 2 === 0 ? 0.4 : -0.4);
          data.mesh.rotation.set(
            data.baseRot.x + tiltX,
            data.baseRot.y + tiltY,
            data.baseRot.z + zSpin
          );
          data.material.opacity = 1.0;
        } else {
          // Default Sphere: Spherical Radial Burst
          const burstDist = 1 + progress * currentShatterForce * 0.85;
          const scaledPos = data.unitPos.clone().multiplyScalar(effectiveDistance * burstDist);
          data.mesh.position.copy(scaledPos);

          data.mesh.rotation.set(
            data.baseRot.x + tiltX,
            data.baseRot.y + tiltY,
            data.baseRot.z
          );
          data.material.opacity = 1.0;
        }

        data.mesh.scale.set(currentCardScale, currentCardScale, currentCardScale);
      });

      // Render WebGL Frame
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
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
