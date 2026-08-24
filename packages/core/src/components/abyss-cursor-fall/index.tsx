import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Apparatus3dCursorTrailProps, SpawnedCard } from "./types";
import {
  DEFAULT_IMAGES,
  STARK_SVG_PALETTE,
  DESATURATED_SVG_GREY,
  DESATURATED_PHOTO_GREY,
  PURE_WHITE,
  DEPTH_LAYERS,
} from "./constants";

export const Apparatus3dCursorTrail: React.FC<Apparatus3dCursorTrailProps> = ({
  images = [],
  spawnDistance = 50,
  spawnInterval = 110,
  imageSize = 2.4,
  lifespan = 3.0,
  fallSpeed = 2.4,
  cameraParallax = 2.8,
  spinSpeed = 1.0,
  spawnFilter = "images-only",
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rawPool = useMemo(() => (images.length > 0 ? images : DEFAULT_IMAGES), [images]);
  const activePool = useMemo(() => {
    if (spawnFilter === "images-only") {
      const filtered = rawPool.filter((url) => !url.toLowerCase().endsWith(".svg"));
      return filtered.length > 0 ? filtered : rawPool;
    }
    if (spawnFilter === "shapes-only") {
      const filtered = rawPool.filter((url) => url.toLowerCase().endsWith(".svg"));
      return filtered.length > 0 ? filtered : rawPool;
    }
    return rawPool;
  }, [rawPool, spawnFilter]);

  const activePoolRef = useRef(activePool);
  activePoolRef.current = activePool;

  // Hot ref for smooth live tuning without tearing down WebGL canvas
  const propsRef = useRef({
    spawnDistance,
    spawnInterval,
    imageSize,
    lifespan,
    fallSpeed,
    cameraParallax,
    spinSpeed,
    spawnFilter,
  });
  propsRef.current = {
    spawnDistance,
    spawnInterval,
    imageSize,
    lifespan,
    fallSpeed,
    cameraParallax,
    spinSpeed,
    spawnFilter,
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

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
    camera.position.set(0, 0, 18);

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

    rawPool.forEach((src: string) => {
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
    const planeGeo = new THREE.PlaneGeometry(0.78, 1.0);
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
        speedMag: 0,
        perpX: 0,
        perpY: 0,
        cutAngle: 0,
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
    let targetZoomZ = 18;

    const spawnCardAt3D = (worldX: number, worldY: number, timeNow: number, dX = 0, dY = 0, moveMag = 1.0) => {
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

      card.active = true;
      card.spawnTime = timeNow;
      card.speedMag = moveMag;

      // Z-depth layer stagger
      const layerZ = DEPTH_LAYERS[layerCounter % DEPTH_LAYERS.length];
      layerCounter++;

      card.x = worldX + (Math.random() - 0.5) * 0.3;
      card.y = worldY + (Math.random() - 0.5) * 0.3;
      card.z = layerZ + 0.4;

      card.baseScale = 1.0;

      // Slicing momentum along physical swipe vector
      const normX = dX !== 0 || dY !== 0 ? dX / (Math.hypot(dX, dY) || 1) : 0;
      const normY = dX !== 0 || dY !== 0 ? -dY / (Math.hypot(dX, dY) || 1) : 0;

      // Incision normal (perpendicular vector along which card slides out)
      card.perpX = -normY;
      card.perpY = normX;

      const swipeAngle = Math.atan2(normY, normX);
      card.cutAngle = swipeAngle;

      card.vx = normX * moveMag * 2.8 + (Math.random() - 0.5) * 0.3;
      card.vy = normY * moveMag * 2.8 + (Math.random() - 0.5) * 0.3 + 0.25;
      card.vz = -0.4;

      // Razor incision blade angle: aligned precisely with incision line
      card.rotZ = swipeAngle;
      card.rotX = -normY * 0.45 + (Math.random() - 0.5) * 0.15;
      card.rotY = normX * 0.45 + (Math.random() - 0.5) * 0.15;

      card.vRotX = (Math.random() - 0.5) * curSpin * 1.5;
      card.vRotY = (Math.random() - 0.5) * curSpin * 1.5;
      card.vRotZ = (Math.random() - 0.5) * curSpin * 0.9;

      const pool = activePoolRef.current;
      const srcUrl = pool[textureCounter % pool.length];
      textureCounter++;

      const tex = textureMap.get(srcUrl);
      if (tex) {
        card.mesh.material.map = tex;
      }

      const isSvg = srcUrl.toLowerCase().endsWith(".svg");
      card.isSvg = isSvg;

      if (isSvg) {
        const neonHex = STARK_SVG_PALETTE[colorCounter % STARK_SVG_PALETTE.length];
        colorCounter++;
        card.initialColor.setHex(neonHex);
      } else {
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
        const dX = lastScreenPos.x === -9999 ? 0 : clientX - lastScreenPos.x;
        const dY = lastScreenPos.y === -9999 ? 0 : clientY - lastScreenPos.y;
        const moveMag = Math.min(2.2, Math.max(0.6, distMoved / 30));

        lastScreenPos = { x: clientX, y: clientY };
        lastSpawnTime = timeNow;
        spawnCardAt3D(target3D.x, target3D.y, timeNow, dX, dY, moveMag);

        if (!hasStarted) {
          hasStarted = true;
          onLifecycleChange?.("discovery");
          onLifecycleChange?.("buildUp");
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoomZ = Math.max(10, Math.min(28, targetZoomZ + e.deltaY * 0.008));
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
      const targetCamX = pointer.x * curCamParallax * 0.7;
      const targetCamY = pointer.y * curCamParallax * 0.5;
      const targetCamZ = targetZoomZ + speedMag * 2.0 - Math.hypot(pointer.x, pointer.y) * 0.5;

      camera.position.x += (targetCamX - camera.position.x) * lerpSpeed;
      camera.position.y += (targetCamY - camera.position.y) * lerpSpeed;
      camera.position.z += (targetCamZ - camera.position.z) * lerpSpeed;

      const lookTargetX = Math.max(-2.5, Math.min(2.5, target3D.x * 0.2));
      const lookTargetY = Math.max(-2.5, Math.min(2.5, target3D.y * 0.2));
      camera.lookAt(lookTargetX, lookTargetY, -2.0);

      const rawRoll = -pointerVel.x * 4.0 - pointer.x * 0.08;
      const targetRoll = Math.max(-0.18, Math.min(0.18, rawRoll));
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

        // Air damping on horizontal momentum
        card.vx *= 0.96;
        card.vy *= 0.96;

        // Progressive void acceleration into deep -Z space & downward gravity
        const gravityFactor = 1.0 + progress * 2.2;
        const voidPlungeZ = -curFallSpeed * (1.4 + progress * 2.6);
        const voidGravityY = -curFallSpeed * 0.45 * gravityFactor;

        card.x += card.vx * dt;
        card.y += (card.vy + voidGravityY) * dt;
        card.z += voidPlungeZ * dt;

        card.rotX += card.vRotX * dt;
        card.rotY += card.vRotY * dt;
        card.rotZ += card.vRotZ * dt;

        // Desaturate color as card falls into void
        const desaturateProgress = Math.max(0, (progress - 0.3) / 0.7);
        if (card.isSvg) {
          card.mesh.material.color.lerpColors(card.initialColor, DESATURATED_SVG_GREY, desaturateProgress);
        } else {
          card.mesh.material.color.lerpColors(PURE_WHITE, DESATURATED_PHOTO_GREY, desaturateProgress);
        }

        // --- RAZOR INCISION REVEAL DYNAMICS ---
        // 1. Incision emergence: slides out perpendicularly from the razor cut slit
        const emergeProgress = Math.min(1.0, age / 0.22);
        const unslit = 1.0 - emergeProgress;
        const unslitEase = unslit * unslit; // Smooth quadratic slide-out ease

        // Offset position along incision normal vector while sliding out
        const slideOffset = unslitEase * 0.48 * card.baseScale;
        const renderX = card.x - card.perpX * slideOffset;
        const renderY = card.y - card.perpY * slideOffset;

        // 2. Razor blade pitch: card cuts through canvas angled on the blade vector
        const bladeTilt = unslitEase * 0.6;
        const currentRotX = card.rotX - card.perpY * bladeTilt;
        const currentRotY = card.rotY + card.perpX * bladeTilt;

        // 3. Razor expansion: expands from sharp slit edge into full card width
        const slitExpansion = 1.0 - unslit * 0.75;
        const scaleX = curSize * card.baseScale * slitExpansion;
        const scaleY = curSize * card.baseScale * (1.0 + unslitEase * 0.15);

        const fadeIn = Math.min(1.0, age / 0.04);
        const fadeOut = progress > 0.8 ? Math.max(0, (1.0 - progress) / 0.2) : 1.0;
        const opacity = fadeIn * fadeOut;

        card.mesh.position.set(renderX, renderY, card.z);
        card.mesh.rotation.set(currentRotX, currentRotY, card.rotZ);
        card.mesh.scale.set(scaleX, scaleY, 1);
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
  }, { scope: containerRef, dependencies: [rawPool] });

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
