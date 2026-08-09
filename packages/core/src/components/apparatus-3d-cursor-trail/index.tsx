import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Apparatus3dCursorTrailProps } from "./types";

const DEFAULT_IMAGES = [
  "/images/components images/Gallary/cosmos_1110264921.webp",
  "/images/shapes/Shape 1.svg",
  "/images/components images/Gallary/cosmos_1309943729.webp",
  "/images/shapes/Shape 5.svg",
  "/images/components images/Gallary/cosmos_140351120.webp",
  "/images/shapes/Shape 12.svg",
  "/images/components images/Gallary/cosmos_1441380570.webp",
  "/images/shapes/Shape 18.svg",
  "/images/components images/Gallary/cosmos_1578342658.webp",
  "/images/shapes/Shape 24.svg",
  "/images/components images/Gallary/cosmos_1724531036.webp",
  "/images/shapes/Shape 30.svg",
  "/images/components images/Gallary/cosmos_1948095192.webp",
  "/images/shapes/Shape 36.svg",
  "/images/components images/Gallary/cosmos_2046923474.webp",
  "/images/shapes/Shape 42.svg",
  "/images/components images/Gallary/cosmos_623139356.webp",
  "/images/shapes/Shape 48.svg",
  "/images/components images/Gallary/cosmos_842932938.webp",
  "/images/shapes/Shape 54.svg",
];

// Rich, vivid palette for vector SVGs (Blue, Red, Green, Lime, Purple, Violet, Cyan, Magenta)
const STARK_SVG_PALETTE = [
  0x0088ff, // Electric Blue
  0xff1133, // Stark Crimson Red
  0x00e640, // Bright Emerald Green
  0x76ff03, // Vivid Electric Lime
  0x9c27b0, // Deep Neon Purple
  0x7c4dff, // Bright Electric Violet
  0x00e5ff, // Stark Cyan
  0xff007f, // Stark Magenta
];

const DESATURATED_SVG_GREY = new THREE.Color(0.28, 0.28, 0.32);
const DESATURATED_PHOTO_GREY = new THREE.Color(0.22, 0.22, 0.25);
const PURE_WHITE = new THREE.Color(1.0, 1.0, 1.0);

const DEPTH_LAYERS = [1.2, 0.0, -1.8];

interface SpawnedCard {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  active: boolean;
  spawnTime: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  baseScale: number;
  initialColor: THREE.Color;
  isSvg: boolean;
}

export const Apparatus3dCursorTrail: React.FC<Apparatus3dCursorTrailProps> = ({
  images = [],
  spawnDistance = 50,
  spawnInterval = 110,
  imageSize = 2.4,
  lifespan = 3.0,
  fallSpeed = 2.4,
  cameraParallax = 2.8,
  spinSpeed = 1.0,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imagePool = useMemo(() => (images.length > 0 ? images : DEFAULT_IMAGES), [images]);

  // Hot ref for smooth live tuning without tearing down WebGL canvas
  const propsRef = useRef({
    spawnDistance,
    spawnInterval,
    imageSize,
    lifespan,
    fallSpeed,
    cameraParallax,
    spinSpeed,
  });
  propsRef.current = {
    spawnDistance,
    spawnInterval,
    imageSize,
    lifespan,
    fallSpeed,
    cameraParallax,
    spinSpeed,
  };

  useGSAP(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Three.js Scene, Volumetric Depth Fog & 3D Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070709, 0.032);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // 2. Synchronous Texture Map Keyed by Image URL
    const textureMap = new Map<string, THREE.Texture>();
    const textureLoader = new THREE.TextureLoader();

    imagePool.forEach((src) => {
      if (src.toLowerCase().endsWith(".svg")) {
        // Pre-process SVG into pure white mask
        fetch(src)
          .then((res) => res.text())
          .then((svgText) => {
            const whiteSvg = svgText
              .replace(/fill="[^"]*"/g, 'fill="#ffffff"')
              .replace(/stroke="[^"]*"/g, 'stroke="#ffffff"');
            const blob = new Blob([whiteSvg], { type: "image/svg+xml;charset=utf-8" });
            const blobUrl = URL.createObjectURL(blob);
            textureLoader.load(blobUrl, (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.generateMipmaps = true;
              tex.minFilter = THREE.LinearMipmapLinearFilter;
              textureMap.set(src, tex);
              URL.revokeObjectURL(blobUrl);
            });
          })
          .catch(() => {
            const fallbackTex = textureLoader.load(src);
            textureMap.set(src, fallbackTex);
          });
      } else {
        const tex = textureLoader.load(src);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        textureMap.set(src, tex);
      }
    });

    const poolCapacity = 160;
    const planeGeo = new THREE.PlaneGeometry(1, 1);
    const cardPool: SpawnedCard[] = [];

    for (let i = 0; i < poolCapacity; i++) {
      const mat = new THREE.MeshBasicMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false,
        opacity: 0,
      });

      const mesh = new THREE.Mesh(planeGeo, mat);
      mesh.visible = false;
      scene.add(mesh);

      cardPool.push({
        mesh,
        active: false,
        spawnTime: 0,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        vRotX: 0,
        vRotY: 0,
        vRotZ: 0,
        baseScale: 1.0,
        initialColor: new THREE.Color(1, 1, 1),
        isSvg: false,
      });
    }

    // 3. Screen-to-3D Raycast Tracking & Throw Physics
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(0, 0);
    const prevPointer = new THREE.Vector2(0, 0);
    const pointerVel = new THREE.Vector2(0, 0);
    const rayPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const target3D = new THREE.Vector3(0, 0, 0);

    let lastScreenPos = { x: -9999, y: -9999 };
    let lastSpawnTime = 0;
    let poolIndex = 0;
    let textureCounter = 0;
    let colorCounter = 0;
    let layerCounter = 0;
    let hasStarted = false;
    let targetZoomZ = 10;

    const spawnCardAt3D = (worldX: number, worldY: number, timeNow: number) => {
      let slotIndex = -1;
      for (let k = 0; k < poolCapacity; k++) {
        const checkIdx = (poolIndex + k) % poolCapacity;
        if (!cardPool[checkIdx].active) {
          slotIndex = checkIdx;
          break;
        }
      }
      if (slotIndex === -1) slotIndex = poolIndex;
      poolIndex = (slotIndex + 1) % poolCapacity;

      const card = cardPool[slotIndex];
      const { spinSpeed: curSpin } = propsRef.current;
      const speedMagnitude = Math.hypot(pointerVel.x, pointerVel.y);

      card.active = true;
      card.spawnTime = timeNow;

      // Z-depth layer stagger
      const layerZ = DEPTH_LAYERS[layerCounter % DEPTH_LAYERS.length];
      layerCounter++;

      card.x = worldX + (Math.random() - 0.5) * 0.4;
      card.y = worldY + (Math.random() - 0.5) * 0.4;
      card.z = layerZ + (Math.random() - 0.5) * 0.3;

      card.baseScale = 1.0 + Math.min(0.4, speedMagnitude * 5.0);

      card.vx = pointerVel.x * 4.2 + (Math.random() - 0.5) * 0.6;
      card.vy = pointerVel.y * 4.2 + (Math.random() - 0.5) * 0.6 + 0.35;
      card.vz = (Math.random() - 0.5) * 0.6;

      card.rotX = (Math.random() - 0.5) * 0.45;
      card.rotY = (Math.random() - 0.5) * 0.45;
      card.rotZ = (Math.random() - 0.5) * 0.6;

      card.vRotX = (Math.random() - 0.5) * curSpin * 1.5;
      card.vRotY = (Math.random() - 0.5) * curSpin * 1.5;
      card.vRotZ = (Math.random() - 0.5) * curSpin * 1.0;

      const srcUrl = imagePool[textureCounter % imagePool.length];
      textureCounter++;

      const tex = textureMap.get(srcUrl);
      if (tex) {
        card.mesh.material.map = tex;
      }

      const isSvg = srcUrl.toLowerCase().endsWith(".svg");
      card.isSvg = isSvg;

      if (isSvg) {
        // SVG shape: apply vivid electric neon color
        const neonHex = STARK_SVG_PALETTE[colorCounter % STARK_SVG_PALETTE.length];
        colorCounter++;
        card.initialColor.setHex(neonHex);
      } else {
        // WebP photo: FORCE reset material color to 100% pure #ffffff (natural un-tinted photo colors!)
        card.initialColor.setRGB(1.0, 1.0, 1.0);
      }

      card.mesh.material.color.copy(card.initialColor);
      card.mesh.material.needsUpdate = true;
      card.mesh.visible = true;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      prevPointer.copy(pointer);
      pointer.x = (clientX / rect.width) * 2 - 1;
      pointer.y = -(clientY / rect.height) * 2 + 1;

      pointerVel.x = pointer.x - prevPointer.x;
      pointerVel.y = pointer.y - prevPointer.y;

      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(rayPlane, target3D);

      const timeNow = gsap.ticker.time;
      const distMoved = Math.hypot(clientX - lastScreenPos.x, clientY - lastScreenPos.y);
      const timeSinceLastSpawn = (timeNow - lastSpawnTime) * 1000;

      const { spawnDistance: curDist, spawnInterval: curInterval } = propsRef.current;

      if (distMoved > curDist && timeSinceLastSpawn >= curInterval) {
        lastScreenPos = { x: clientX, y: clientY };
        lastSpawnTime = timeNow;
        spawnCardAt3D(target3D.x, target3D.y, timeNow);

        if (!hasStarted) {
          hasStarted = true;
          onLifecycleChange?.("discovery");
          onLifecycleChange?.("buildUp");
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoomZ = Math.max(5, Math.min(18, targetZoomZ + e.deltaY * 0.008));
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("pointermove", handlePointerMove);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Initial ambient spawn on load
    setTimeout(() => spawnCardAt3D(0, 0, gsap.ticker.time), 150);
    setTimeout(() => spawnCardAt3D(0.6, 0.4, gsap.ticker.time), 250);
    setTimeout(() => spawnCardAt3D(-0.6, -0.4, gsap.ticker.time), 350);

    // 4. 120 FPS HIGH-REFRESH RATE DYNAMIC ENGINE
    const updateLoop = (time: number, deltaTime: number) => {
      const {
        imageSize: curSize,
        lifespan: curLifespan,
        fallSpeed: curFallSpeed,
        cameraParallax: curCamParallax,
      } = propsRef.current;

      const dt = Math.min(deltaTime / 1000, 0.033);
      const lerpSpeed = 0.08;
      const speedMag = Math.hypot(pointerVel.x, pointerVel.y);

      // --- DYNAMIC 3D CAMERA ORBIT & FPV DOLLY ---
      const targetCamX = pointer.x * curCamParallax * 1.8;
      const targetCamY = pointer.y * curCamParallax * 1.2;
      const targetCamZ = targetZoomZ + speedMag * 4.5 - Math.hypot(pointer.x, pointer.y) * 1.5;

      camera.position.x += (targetCamX - camera.position.x) * lerpSpeed;
      camera.position.y += (targetCamY - camera.position.y) * lerpSpeed;
      camera.position.z += (targetCamZ - camera.position.z) * lerpSpeed;

      camera.lookAt(target3D.x * 0.35, target3D.y * 0.35, -2.0);

      const targetRoll = -pointerVel.x * 6.5 - pointer.x * 0.12;
      camera.rotation.z += (targetRoll - camera.rotation.z) * lerpSpeed;

      // --- 3D VOID FALL PHYSICS & DESATURATION ---
      for (let i = 0; i < poolCapacity; i++) {
        const card = cardPool[i];
        if (!card.active) continue;

        const age = time - card.spawnTime;
        const progress = age / curLifespan;

        if (progress >= 1.0) {
          card.active = false;
          card.mesh.visible = false;
          continue;
        }

        // Air damping on horizontal throw physics
        card.vx *= 0.98;
        card.vy *= 0.98;

        const voidPlungeZ = -curFallSpeed * (0.8 + progress * 1.8);
        const voidGravityY = -curFallSpeed * 0.35;

        card.x += card.vx * dt;
        card.y += (card.vy + voidGravityY) * dt;
        card.z += voidPlungeZ * dt;

        card.rotX += card.vRotX * dt;
        card.rotY += card.vRotY * dt;
        card.rotZ += card.vRotZ * dt;

        // Desaturate color as card falls into void
        const desaturateProgress = Math.max(0, (progress - 0.4) / 0.6);
        if (card.isSvg) {
          card.mesh.material.color.lerpColors(card.initialColor, DESATURATED_SVG_GREY, desaturateProgress);
        } else {
          // Photos start at pure #ffffff (natural un-tinted photo colors!)
          card.mesh.material.color.lerpColors(PURE_WHITE, DESATURATED_PHOTO_GREY, desaturateProgress);
        }

        const scalePop = Math.min(1.0, age / 0.12);
        const popOvershoot = 1.0 + 0.14 * Math.sin(Math.min(Math.PI, (age / 0.12) * Math.PI));
        const currentScale = curSize * card.baseScale * scalePop * popOvershoot;

        const opacity = progress > 0.85 ? Math.max(0, (1.0 - progress) / 0.15) : 1.0;

        card.mesh.position.set(card.x, card.y, card.z);
        card.mesh.rotation.set(card.rotX, card.rotY, card.rotZ);
        card.mesh.scale.set(currentScale, currentScale, 1);
        card.mesh.material.opacity = opacity;
      }

      renderer.render(scene, camera);
    };

    gsap.ticker.add(updateLoop);

    return () => {
      gsap.ticker.remove(updateLoop);
      window.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);

      planeGeo.dispose();
      cardPool.forEach((c) => {
        c.mesh.material.dispose();
      });
      textureMap.forEach((t) => t.dispose());
      renderer.dispose();
    };
  }, { scope: containerRef, dependencies: [imagePool] });

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[400px] overflow-hidden bg-[#070709] cursor-crosshair select-none ${className}`}
      style={style}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};

export default Apparatus3dCursorTrail;
