"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GimbalStreamProps } from "./types";
import { IMAGE_LIST, CARD_TITLES, TIER_CONFIGS, TIER_IMAGE_INDICES, GIMBAL_LAYOUT } from "./constants";
import { CHAMBER_VERTEX_SHADER, CHAMBER_FRAGMENT_SHADER, injectCurvatureShader, injectMercuryShader } from "./shaders";
import { createCleanAbyssLogoShape, createLiquidMercuryStudioEnvironment } from "./geometries";

export type { GimbalStreamProps };

export default function GimbalStream({
  gridVariant = "plus",
  autoRotateSpeed = 0.10,
  scrollSpeed = 0.0045,
  cardBendMultiplier = 6.5,
  glowIntensity = 3.2,
  waveBrightness = 1.0,
  className = "",
  style
}: GimbalStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const rightTextRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const pillTextRef = useRef<HTMLSpanElement>(null);

  const targetWeightsRef = useRef(new THREE.Vector3(1.0, 0.0, 0.0));
  const autoRotateSpeedRef = useRef(autoRotateSpeed);
  const scrollSpeedRef = useRef(scrollSpeed);
  const cardBendMultiplierRef = useRef(cardBendMultiplier);
  const glowIntensityRef = useRef(glowIntensity);
  const waveBrightnessRef = useRef(waveBrightness);

  useEffect(() => {
    autoRotateSpeedRef.current = autoRotateSpeed;
    scrollSpeedRef.current = scrollSpeed;
    cardBendMultiplierRef.current = cardBendMultiplier;
    glowIntensityRef.current = glowIntensity;
    waveBrightnessRef.current = waveBrightness;
  }, [autoRotateSpeed, scrollSpeed, cardBendMultiplier, glowIntensity, waveBrightness]);

  useEffect(() => {
    if (gridVariant === "plus") targetWeightsRef.current.set(1.0, 0.0, 0.0);
    else if (gridVariant === "ghost") targetWeightsRef.current.set(0.0, 1.0, 0.0);
    else if (gridVariant === "hex") targetWeightsRef.current.set(0.0, 0.0, 1.0);
  }, [gridVariant]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let isDisposed = false;
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 6000);
    camera.position.set(0, 0, 0);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
      precision: "highp"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // --- Studio Lighting & Environment ---
    const camKey = new THREE.DirectionalLight(0xffffff, 2.5);
    camKey.position.set(0, 4, 7);
    camera.add(camKey);

    const camRim = new THREE.DirectionalLight(0xffffff, 1.8);
    camRim.position.set(0, -4, 5);
    camera.add(camRim);

    const backGlow = new THREE.PointLight(0x7ec8f8, 1.8, 700);
    backGlow.position.set(0, 0, -260);
    scene.add(backGlow);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambLight);

    const studioEnvMap = createLiquidMercuryStudioEnvironment(renderer);
    scene.environment = studioEnvMap;

    // --- 3D Logo Starburst Centerpiece ---
    const logoShape = createCleanAbyssLogoShape();
    const logoGeo = new THREE.ExtrudeGeometry(logoShape, {
      steps: 1,
      depth: 0.24,
      bevelEnabled: true,
      bevelThickness: 0.22,
      bevelSize: 0.12,
      bevelSegments: 14,
      curveSegments: 24
    });
    logoGeo.center();
    logoGeo.computeVertexNormals();

    const logoMount = new THREE.Group();
    logoMount.position.set(0, 0, -180);
    logoMount.scale.set(8, 8, 8);
    scene.add(logoMount);

    const logoSpinner = new THREE.Group();
    logoMount.add(logoSpinner);

    const customUniforms = { uTime: { value: 0.0 } };
    const liquidMercuryMat = new THREE.MeshStandardMaterial({
      color: 0xf5f8fc,
      metalness: 0.88,
      roughness: 0.12,
      envMap: studioEnvMap,
      envMapIntensity: 2.5
    });
    liquidMercuryMat.onBeforeCompile = (shader) => injectMercuryShader(shader, customUniforms);
    logoSpinner.add(new THREE.Mesh(logoGeo, liquidMercuryMat));

    // --- Cylindrical Raymarched Chamber ---
    const cylinderGeo = new THREE.CylinderGeometry(
      GIMBAL_LAYOUT.cylinderRadius,
      GIMBAL_LAYOUT.cylinderRadius,
      GIMBAL_LAYOUT.cylinderHeight,
      96,
      64,
      true
    );
    const chamberMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      fog: false,
      uniforms: {
        uTime: { value: 0 },
        uScrollY: { value: 0 },
        uChamberAwake: { value: 0.20 },
        uMorphWeights: { value: new THREE.Vector3(1.0, 0.0, 0.0) },
        uWaveBrightness: { value: 1.0 },
        uCellSize: { value: 68.0 },
        uCylinderRadius: { value: 1050.0 },
        uBgDark: { value: new THREE.Color(0x020305) },
        uBgMid: { value: new THREE.Color(0x0c1e30) },
        uCausticColor: { value: new THREE.Color(0x7ec8f8) },
        uWireColor: { value: new THREE.Color(0x101522) },
        uWireGlow: { value: new THREE.Color(0x9be5fb) }
      },
      vertexShader: CHAMBER_VERTEX_SHADER,
      fragmentShader: CHAMBER_FRAGMENT_SHADER
    });
    const chamberMesh = new THREE.Mesh(cylinderGeo, chamberMat);
    chamberMesh.position.set(0, 0, -420);
    scene.add(chamberMesh);

    // --- Tourbillon Gimbal Rings ---
    const textureLoader = new THREE.TextureLoader();
    const cardBendUniform = { uCardBend: { value: 0.0 } };
    const sharedMaterials = IMAGE_LIST.map((url) => {
      const tex = textureLoader.load(url);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;

      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1.0,
        toneMapped: false
      });
      mat.onBeforeCompile = (shader) => injectCurvatureShader(shader, cardBendUniform);
      return mat;
    });

    const voyageRoot = new THREE.Group();
    voyageRoot.position.set(0, 0, -180);
    scene.add(voyageRoot);

    const cardGeo = new THREE.PlaneGeometry(GIMBAL_LAYOUT.cardWidth, GIMBAL_LAYOUT.cardHeight, 18, 18);
    const totalVoyageHeight = GIMBAL_LAYOUT.tierSpacingY * TIER_CONFIGS.length;
    const allCardMeshes: THREE.Mesh[] = [];

    const tiers = TIER_CONFIGS.map((cfg, tierIdx) => {
      const gimbalAxis = new THREE.Group();
      voyageRoot.add(gimbalAxis);
      const ringRotator = new THREE.Group();
      gimbalAxis.add(ringRotator);

      const cardMeshes: THREE.Mesh[] = [];
      const tierIndices = TIER_IMAGE_INDICES[tierIdx % TIER_IMAGE_INDICES.length];

      for (let i = 0; i < GIMBAL_LAYOUT.uniformCards; i++) {
        const imgIdx = tierIndices[i % tierIndices.length];
        const mesh = new THREE.Mesh(cardGeo, sharedMaterials[imgIdx]);
        mesh.userData = {
          baseAngle: (i / GIMBAL_LAYOUT.uniformCards) * Math.PI * 2 + cfg.phaseOffset,
          imageIdx: imgIdx,
          hoverScale: 1.0
        };
        ringRotator.add(mesh);
        cardMeshes.push(mesh);
        allCardMeshes.push(mesh);
      }
      return { config: cfg, axis: gimbalAxis, cards: cardMeshes };
    });

    // --- Virtual Scroll & Mouse Tracking ---
    let targetScrollY = 0;
    let currentScrollY = 0;
    let scrollVelocity = 0;
    let lastScroll = 0;
    let lastTouchY = 0;
    let accumulatedAutoTime = 0;
    let currentBend = 0;
    let hasFullyUnlocked = false;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const normalizedDelta = THREE.MathUtils.clamp(e.deltaY, -120, 120) * 0.22 + (e.deltaY * 0.04);
      if (!hasFullyUnlocked) targetScrollY = Math.max(0.0, targetScrollY + normalizedDelta);
      else targetScrollY += normalizedDelta;
    };

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    const pointerNDC = new THREE.Vector2(-999, -999);
    let clientMouseX = -999;
    let clientMouseY = -999;
    let currentPillX = -999;
    let currentPillY = -999;
    let isPillVisible = false;
    let hoveredMesh: THREE.Mesh | null = null;
    const raycaster = new THREE.Raycaster();

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2.0;
      targetMouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2.0;
      pointerNDC.x = targetMouseX;
      pointerNDC.y = -targetMouseY;
      clientMouseX = e.clientX;
      clientMouseY = e.clientY;
    };

    const onPointerLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
      pointerNDC.set(-999, -999);
      isPillVisible = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) lastTouchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const deltaY = (e.touches[0].clientY - lastTouchY) * 0.48;
        if (!hasFullyUnlocked) targetScrollY = Math.max(0.0, targetScrollY - deltaY);
        else targetScrollY -= deltaY;
        lastTouchY = e.touches[0].clientY;
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mousemove", onPointerMove);
    container.addEventListener("mouseleave", onPointerLeave);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: true });

    let lastNow = performance.now();
    const halfHeight = totalVoyageHeight * 0.5;
    let currentExplodeProg = 0.0;

    function expDamp(current: number, target: number, rate: number, dt: number) {
      return THREE.MathUtils.lerp(current, target, 1.0 - Math.exp(-rate * dt));
    }

    const currentWeights = new THREE.Vector3(1.0, 0.0, 0.0);
    let animId: number;

    const animate = (now: number) => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      const delta = Math.min((now - lastNow) * 0.001, 0.1);
      lastNow = now;
      const t = now * 0.001;

      accumulatedAutoTime += delta * autoRotateSpeedRef.current;
      currentScrollY = expDamp(currentScrollY, targetScrollY, 2.4, delta);
      scrollVelocity = currentScrollY - lastScroll;
      lastScroll = currentScrollY;

      currentWeights.lerp(targetWeightsRef.current, 0.08);

      if (!hasFullyUnlocked && currentScrollY >= GIMBAL_LAYOUT.explodeThreshold) {
        hasFullyUnlocked = true;
      }

      if (hasFullyUnlocked) {
        currentExplodeProg = 1.0;
      } else {
        const rawP = THREE.MathUtils.clamp(currentScrollY / GIMBAL_LAYOUT.explodeThreshold, 0.0, 1.0);
        currentExplodeProg = THREE.MathUtils.smoothstep(rawP, 0.0, 1.0);
      }

      // Z-Depth Transition (-310 -> -180) & Centerpiece Scaling
      const currentZ = THREE.MathUtils.lerp(-310.0, -180.0, currentExplodeProg);
      voyageRoot.position.z = currentZ;
      logoMount.position.set(0, 0, currentZ);
      backGlow.position.set(0, 0, currentZ - 80.0);

      const currentCoreScale = THREE.MathUtils.lerp(8.0, 22.0, currentExplodeProg);
      logoMount.scale.set(currentCoreScale, currentCoreScale, currentCoreScale);

      // Smooth Sub-Pixel Mouse Parallax Damping
      currentMouseX = expDamp(currentMouseX, targetMouseX, 3.2, delta);
      currentMouseY = expDamp(currentMouseY, targetMouseY, 3.2, delta);

      camera.position.x = currentMouseX * 18.0;
      camera.position.y = -currentMouseY * 14.0;
      camera.rotation.y = -currentMouseX * 0.028;
      camera.rotation.x = currentMouseY * 0.020;

      voyageRoot.rotation.x = currentMouseY * 0.035;
      voyageRoot.rotation.y = currentMouseX * 0.045;

      // Multi-Harmonic Zero-G Gyroscopic Tumbling + Mouse Reaction
      const autoPitch = 0.22 + Math.sin(t * 0.58) * 0.28 + Math.cos(t * 0.31) * 0.18 + Math.sin(currentScrollY * 0.005) * 0.15;
      const autoRoll = 0.38 + Math.cos(t * 0.47) * 0.24 + Math.sin(t * 0.23) * 0.15 + Math.sin(currentScrollY * 0.003) * 0.10;
      logoMount.rotation.set(autoPitch + currentMouseY * 0.05, currentMouseX * 0.05, autoRoll);
      logoSpinner.rotation.y = -(t * 0.32) + Math.sin(t * 0.42) * 0.35 - currentScrollY * 0.007;

      // Non-linear card bend
      const targetBend = THREE.MathUtils.clamp(scrollVelocity * 0.18, -0.22, 0.22);
      const bendRate = Math.abs(targetBend) > Math.abs(currentBend) ? 6.5 : 3.8;
      currentBend = expDamp(currentBend, targetBend, bendRate, delta);
      cardBendUniform.uCardBend.value = currentBend * (cardBendMultiplierRef.current / 6.5);

      const currentRadius = THREE.MathUtils.lerp(GIMBAL_LAYOUT.closedRadius, GIMBAL_LAYOUT.openRadius, currentExplodeProg);
      const corridorScroll = hasFullyUnlocked ? (currentScrollY - GIMBAL_LAYOUT.explodeThreshold) : 0.0;

      for (let i = 0; i < tiers.length; i++) {
        const { config, axis, cards } = tiers[i];
        const unboxedBaseY = THREE.MathUtils.lerp(config.startY, config.baseY, currentExplodeProg);
        const rawY = unboxedBaseY + corridorScroll;
        const wrappedY = (((rawY + halfHeight) % totalVoyageHeight) + totalVoyageHeight) % totalVoyageHeight - halfHeight;
        axis.position.y = wrappedY;

        const tiltProgress = Math.max(0.0, (currentExplodeProg - 0.10) / 0.90);
        axis.rotation.x = config.tiltX * tiltProgress + currentMouseY * 0.02;
        axis.rotation.z = config.tiltZ * tiltProgress + currentMouseX * 0.02;

        const orbitAngle = accumulatedAutoTime * config.direction + currentScrollY * config.speedMultiplier * scrollSpeedRef.current;

        for (let j = 0; j < cards.length; j++) {
          const card = cards[j];
          const theta = card.userData.baseAngle + orbitAngle;
          card.position.set(Math.cos(theta) * currentRadius, 0, Math.sin(theta) * currentRadius);
          card.rotation.y = -theta + Math.PI / 2;
        }
      }

      customUniforms.uTime.value = t;
      chamberMat.uniforms.uTime.value = t;
      chamberMat.uniforms.uScrollY.value = currentScrollY * 0.01;
      chamberMat.uniforms.uChamberAwake.value = currentExplodeProg;
      chamberMat.uniforms.uMorphWeights.value.copy(currentWeights);
      chamberMat.uniforms.uWaveBrightness.value = waveBrightnessRef.current;
      backGlow.intensity = THREE.MathUtils.lerp(0.6, 2.0, currentExplodeProg) * waveBrightnessRef.current;

      // 4-Tier Cinematic Slide-Off Physics + Parallax
      const easedProg = Math.pow(currentExplodeProg, 1.6);
      const maxSlide = (container?.clientWidth || window.innerWidth) * 0.75 + 300;
      const textSlide = easedProg * maxSlide;
      
      const dynamicYaw = 36.0 + currentExplodeProg * 22.0;
      const dynamicZ = -currentExplodeProg * 140.0;
      const dynamicPitch = 6.0 - currentExplodeProg * 4.0;
      const dynamicRoll = 3.0 + currentExplodeProg * 5.0;
      const dynamicTracking = 0.04 + currentExplodeProg * 0.08;

      if (leftTextRef.current) {
        leftTextRef.current.style.transform = `perspective(1100px) rotateY(${dynamicYaw}deg) rotateX(${dynamicPitch + currentMouseY * 3.5}deg) rotateZ(${-dynamicRoll + currentMouseX * 2.0}deg) translate3d(${-textSlide + currentMouseX * 10}px, calc(-50% + ${-currentMouseY * 7}px), ${dynamicZ}px)`;
        leftTextRef.current.style.letterSpacing = `${dynamicTracking}em`;
      }
      if (rightTextRef.current) {
        rightTextRef.current.style.transform = `perspective(1100px) rotateY(${-dynamicYaw}deg) rotateX(${dynamicPitch + currentMouseY * 3.5}deg) rotateZ(${dynamicRoll + currentMouseX * 2.0}deg) translate3d(${textSlide + currentMouseX * 10}px, calc(-50% + ${-currentMouseY * 7}px), ${dynamicZ}px)`;
        rightTextRef.current.style.letterSpacing = `${dynamicTracking}em`;
      }

      // 3D Raycasting Card Hover & Cursor Pill Tracking
      raycaster.setFromCamera(pointerNDC, camera);
      const intersects = raycaster.intersectObjects(allCardMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        hoveredMesh = hit;
        const idx = hit.userData.imageIdx ?? 0;
        if (pillTextRef.current) {
          pillTextRef.current.textContent = CARD_TITLES[idx] || "STREAM";
        }
        isPillVisible = true;
      } else {
        hoveredMesh = null;
        isPillVisible = false;
      }

      if (clientMouseX > 0 && clientMouseY > 0) {
        if (currentPillX < 0) {
          currentPillX = clientMouseX + 16;
          currentPillY = clientMouseY + 16;
        } else {
          currentPillX = expDamp(currentPillX, clientMouseX + 18, 12.0, delta);
          currentPillY = expDamp(currentPillY, clientMouseY + 18, 12.0, delta);
        }
      }

      if (pillRef.current) {
        pillRef.current.style.transform = `translate3d(${currentPillX}px, ${currentPillY}px, 0)`;
        pillRef.current.style.opacity = isPillVisible ? "1" : "0";
      }

      for (let k = 0; k < allCardMeshes.length; k++) {
        const m = allCardMeshes[k];
        const targetS = m === hoveredMesh ? 1.08 : 1.0;
        m.userData.hoverScale = expDamp(m.userData.hoverScale || 1.0, targetS, 8.0, delta);
        const s = m.userData.hoverScale;
        m.scale.set(s, s, s);
      }

      renderer.render(scene, camera);

      if (textContainerRef.current && textContainerRef.current.style.opacity !== "1") {
        textContainerRef.current.style.opacity = "1";
      }
    };

    animId = requestAnimationFrame(animate);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousemove", onPointerMove);
      container.removeEventListener("mouseleave", onPointerLeave);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[500px] overflow-hidden bg-[#020305] select-none cursor-default ${className}`}
      style={style}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
        .gimbal-stream-font {
          font-family: 'Syne', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 800;
        }
      `}</style>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Flanking Typography Container (Hidden until WebGL paints first frame) */}
      <div
        ref={textContainerRef}
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
        style={{ opacity: 0 }}
      >
        {/* Left Flanking Typography: GIMBAL (Angled & curved into depth) */}
        <div
          ref={leftTextRef}
          className="pointer-events-none absolute top-1/2 right-[calc(50%+100px)] sm:right-[calc(50%+115px)] md:right-[calc(50%+130px)] lg:right-[calc(50%+145px)] -translate-y-1/2 z-10 select-none will-change-transform text-right origin-right"
          style={{ transform: "perspective(1000px) rotateY(36deg) rotateX(6deg) rotateZ(-3deg) translate3d(0, -50%, 0)" }}
        >
          <span className="gimbal-stream-font block uppercase text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem] tracking-[0.04em] text-[#f8fafc] whitespace-nowrap drop-shadow-[0_8px_32px_rgba(0,0,0,0.9)]">
            GIMBAL
          </span>
        </div>

        {/* Right Flanking Typography: STREAM (Angled & curved into depth) */}
        <div
          ref={rightTextRef}
          className="pointer-events-none absolute top-1/2 left-[calc(50%+100px)] sm:left-[calc(50%+115px)] md:left-[calc(50%+130px)] lg:left-[calc(50%+145px)] -translate-y-1/2 z-10 select-none will-change-transform text-left origin-left"
          style={{ transform: "perspective(1000px) rotateY(-36deg) rotateX(6deg) rotateZ(3deg) translate3d(0, -50%, 0)" }}
        >
          <span className="gimbal-stream-font block uppercase text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem] tracking-[0.04em] text-[#f8fafc] whitespace-nowrap drop-shadow-[0_8px_32px_rgba(0,0,0,0.9)]">
            STREAM
          </span>
        </div>
      </div>

      {/* Balanced Satin Glass Cursor Tooltip Box */}
      <div
        ref={pillRef}
        className="pointer-events-none fixed top-0 left-0 z-50 px-3.5 py-1 rounded-[4px] bg-black/45 border border-white/25 backdrop-blur-[6px] shadow-[0_4px_20px_rgba(0,0,0,0.55)] text-white text-[11px] font-medium tracking-wider uppercase transition-opacity duration-150 will-change-transform"
        style={{ opacity: 0, transform: "translate3d(-100px, -100px, 0)" }}
      >
        <span ref={pillTextRef} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-sans">POSTAL IMPRINT</span>
      </div>
    </div>
  );
}
