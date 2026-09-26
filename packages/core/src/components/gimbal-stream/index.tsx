"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GimbalStreamProps } from "./types";
import { CARD_TITLES, TIER_CONFIGS, GIMBAL_LAYOUT } from "./constants";
import { usePerformance } from "../../engine/PerformanceProvider";
import { useLatestRef } from "../../hooks";
import { expDamp } from "../../engine/utils";
import { setupGimbalScene, disposeGimbalScene } from "./scene";
import styles from "./styles.module.css";

export type { GimbalStreamProps };

export function GimbalStream({
  gridVariant = "plus",
  autoRotateSpeed = 0.10,
  scrollSpeed = 0.0045,
  cardBendMultiplier: _cardBendMultiplier = 6.5,
  glowIntensity: _glowIntensity = 3.2,
  waveBrightness = 1.0,
  waveSpeed = 1.0,
  className = "",
  style
}: GimbalStreamProps) {
  const perf = usePerformance();
  const perfRef = useLatestRef(perf);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const rightTextRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const pillTextRef = useRef<HTMLSpanElement>(null);

  const targetWeightsRef = useRef(new THREE.Vector3(1.0, 0.0, 0.0));
  const autoRotateSpeedRef = useLatestRef(autoRotateSpeed);
  const scrollSpeedRef = useLatestRef(scrollSpeed);
  const waveBrightnessRef = useLatestRef(waveBrightness);
  const waveSpeedRef = useLatestRef(waveSpeed);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setPixelRatio(perf.dpr);
    }
  }, [perf.dpr]);

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
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Fast fallback to ensure display within 350ms regardless of network stalls
    const readyTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 350);

    const {
      scene,
      camera,
      renderer,
      backGlow,
      logoMount,
      logoSpinner,
      chamberMat,
      customUniforms,
      voyageRoot,
      tiers,
      allCardMeshes,
      sharedMaterials,
    } = setupGimbalScene(
      canvas,
      width,
      height,
      perfRef.current.tier,
      perfRef.current.dpr,
      () => setIsLoaded(true)
    );
    rendererRef.current = renderer;

    const totalVoyageHeight = GIMBAL_LAYOUT.tierSpacingY * TIER_CONFIGS.length;

    // --- Virtual Scroll & Mouse Tracking ---
    let targetScrollY = 0;
    let currentScrollY = 0;
    let lastTouchY = 0;
    let accumulatedAutoTime = 0;
    let accumulatedWaveTime = 0;
    let hasFullyUnlocked = false;
    let lastUserScrollTime = 0;
    let autoDriftWeight = 0.0;
    let lastScroll = 0;
    let scrollEnergy = 0.0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      lastUserScrollTime = performance.now();
      const normalizedDelta = THREE.MathUtils.clamp(e.deltaY, -80, 80) * 0.12 + (e.deltaY * 0.018);
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
        lastUserScrollTime = performance.now();
        const deltaY = (e.touches[0].clientY - lastTouchY) * 0.25;
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
    const currentWeights = new THREE.Vector3(1.0, 0.0, 0.0);
    let animId: number;

    const animate = (now: number) => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      const delta = Math.min((now - lastNow) * 0.001, 0.1);
      lastNow = now;
      const t = now * 0.001;

      // Ambient forward drift: disengages during user scroll and reduced motion
      const isUserActive = (now - lastUserScrollTime) < 1200;
      const targetAutoDrift = (!isUserActive && hasFullyUnlocked && !perfRef.current.reducedMotion) ? 1.0 : 0.0;
      autoDriftWeight = THREE.MathUtils.lerp(autoDriftWeight, targetAutoDrift, 1.0 - Math.exp(-2.5 * delta));
      if (autoDriftWeight > 0.001) {
        targetScrollY += 14.0 * delta * autoDriftWeight;
      }

      accumulatedAutoTime += delta * autoRotateSpeedRef.current;
      currentScrollY = expDamp(currentScrollY, targetScrollY, 1.65, delta);

      // Track user scroll momentum for responsive atmosphere
      const scrollVelocity = Math.abs(currentScrollY - lastScroll);
      lastScroll = currentScrollY;
      const targetEnergy = Math.min(1.0, (scrollVelocity / Math.max(delta, 0.001)) * 0.0018);
      scrollEnergy = expDamp(scrollEnergy, targetEnergy, 3.2, delta);

      currentWeights.lerp(targetWeightsRef.current, 1 - Math.pow(0.92, delta * 60));

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

      camera.position.x = currentMouseX * 8.0;
      camera.position.y = -currentMouseY * 10.0;
      camera.position.z = 0.0;
      camera.rotation.y = -currentMouseX * 0.015;
      camera.rotation.x = currentMouseY * 0.014;
      camera.rotation.z = 0.0;

      voyageRoot.rotation.x = currentMouseY * 0.025;
      voyageRoot.rotation.y = currentMouseX * 0.030;

      // Multi-Harmonic Zero-G Gyroscopic Tumbling + Mouse Reaction + Scroll Momentum
      const energyPitch = Math.sin(t * 2.4) * 0.12 * scrollEnergy;
      const energyRoll = Math.cos(t * 2.1) * 0.14 * scrollEnergy;

      const autoPitch = 0.22 + Math.sin(t * 0.58) * 0.28 + Math.cos(t * 0.31) * 0.18 + Math.sin(currentScrollY * 0.005) * 0.15;
      const autoRoll = 0.38 + Math.cos(t * 0.47) * 0.24 + Math.sin(t * 0.23) * 0.15 + Math.sin(currentScrollY * 0.003) * 0.10;
      logoMount.rotation.set(autoPitch + currentMouseY * 0.05 + energyPitch, currentMouseX * 0.05, autoRoll + energyRoll);
      logoSpinner.rotation.y = -(t * 0.32) + Math.sin(t * 0.42) * 0.35 - currentScrollY * 0.007;

      // Pristine Ring Radius
      const baseRadius = THREE.MathUtils.lerp(GIMBAL_LAYOUT.closedRadius, GIMBAL_LAYOUT.openRadius, currentExplodeProg);
      const corridorScroll = hasFullyUnlocked ? (currentScrollY - GIMBAL_LAYOUT.explodeThreshold) : 0.0;

      for (let i = 0; i < tiers.length; i++) {
        const { config, axis, cards } = tiers[i];
        const unboxedBaseY = THREE.MathUtils.lerp(config.startY, config.baseY, currentExplodeProg);
        const rawY = unboxedBaseY + corridorScroll;
        const wrappedY = (((rawY + halfHeight) % totalVoyageHeight) + totalVoyageHeight) % totalVoyageHeight - halfHeight;
        axis.position.y = wrappedY;

        // Continuous tidal breathing
        const tidalPhase = t * 0.45 + i * 0.85;
        const radialBreath = Math.sin(tidalPhase) * 0.055;
        const tierRadius = baseRadius * (1.0 + radialBreath);

        // Floating zero-G current wobble
        const tidalTiltX = Math.sin(t * 0.55 + i * 1.1) * 0.035;
        const tidalTiltZ = Math.cos(t * 0.48 + i * 0.95) * 0.030;
        const tiltProgress = Math.max(0.0, (currentExplodeProg - 0.10) / 0.90);
        axis.rotation.x = config.tiltX * tiltProgress + currentMouseY * 0.02 + tidalTiltX;
        axis.rotation.z = config.tiltZ * tiltProgress + currentMouseX * 0.02 + tidalTiltZ;

        // Subtle organic phase drift
        const driftFactor = 1.0 + Math.sin(i * 1.6 + t * 0.07) * 0.035;
        const orbitAngle = accumulatedAutoTime * config.direction * driftFactor + currentScrollY * config.speedMultiplier * scrollSpeedRef.current;

        for (let j = 0; j < cards.length; j++) {
          const card = cards[j];
          const theta = card.userData.baseAngle + orbitAngle;
          card.position.set(Math.cos(theta) * tierRadius, 0, Math.sin(theta) * tierRadius);
          card.rotation.y = -theta + Math.PI / 2;
        }
      }

      accumulatedAutoTime += delta * autoRotateSpeedRef.current;
      accumulatedWaveTime += delta * waveSpeedRef.current * (1.0 + scrollEnergy * 3.8);

      customUniforms.uTime.value = t;
      chamberMat.uniforms.uTime.value = accumulatedWaveTime;
      chamberMat.uniforms.uScrollY.value = currentScrollY * 0.0035;
      chamberMat.uniforms.uScrollEnergy.value = scrollEnergy;
      chamberMat.uniforms.uChamberAwake.value = currentExplodeProg;
      chamberMat.uniforms.uMorphWeights.value.copy(currentWeights);

      // Scroll-driven caustic brightness flare & dynamic back glow
      const reactiveWaveBoost = 1.0 + scrollEnergy * 0.70;
      chamberMat.uniforms.uWaveBrightness.value = waveBrightnessRef.current * reactiveWaveBoost;
      backGlow.intensity = (THREE.MathUtils.lerp(0.6, 2.2, currentExplodeProg) + scrollEnergy * 1.4) * waveBrightnessRef.current;

      // 4-Tier Cinematic Slide-Off Physics + Parallax
      const easedProg = Math.pow(currentExplodeProg, 1.6);
      const maxSlide = (container?.clientWidth || window.innerWidth) * 0.75 + 300;
      const textSlide = easedProg * maxSlide;
      
      const dynamicYaw = 36.0 + currentExplodeProg * 22.0;
      const dynamicZ = -currentExplodeProg * 140.0;
      const dynamicPitch = 6.0 - currentExplodeProg * 4.0;
      const dynamicRoll = 3.0 + currentExplodeProg * 5.0;
      const dynamicTracking = 0.04 + currentExplodeProg * 0.08;

      // Interactive 3D Rotational Depth Flare & Auto-Evading Typography
      const leftYaw = dynamicYaw + currentMouseX * 14.0;
      const leftZ = dynamicZ - currentMouseX * 30.0;
      const leftOutwardX = -textSlide - Math.max(0, -currentMouseX) * 24.0;

      const rightYaw = -dynamicYaw + currentMouseX * 14.0;
      const rightZ = dynamicZ + currentMouseX * 30.0;
      const rightOutwardX = textSlide + Math.max(0, currentMouseX) * 24.0;

      if (leftTextRef.current) {
        leftTextRef.current.style.transform = `perspective(1100px) rotateY(${leftYaw}deg) rotateX(${dynamicPitch + currentMouseY * 4.0}deg) rotateZ(${-dynamicRoll + currentMouseX * 2.0}deg) translate3d(${leftOutwardX}px, calc(-50% + ${-currentMouseY * 8}px), ${leftZ}px)`;
        leftTextRef.current.style.letterSpacing = `${dynamicTracking}em`;
      }
      if (rightTextRef.current) {
        rightTextRef.current.style.transform = `perspective(1100px) rotateY(${rightYaw}deg) rotateX(${dynamicPitch + currentMouseY * 4.0}deg) rotateZ(${dynamicRoll + currentMouseX * 2.0}deg) translate3d(${rightOutwardX}px, calc(-50% + ${-currentMouseY * 8}px), ${rightZ}px)`;
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
      clearTimeout(readyTimer);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousemove", onPointerMove);
      container.removeEventListener("mouseleave", onPointerLeave);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);

      disposeGimbalScene(scene, renderer, sharedMaterials);
      rendererRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ opacity: isLoaded ? 1 : 0 }}
      />

      <div
        ref={textContainerRef}
        className={styles.textContainer}
        style={{ opacity: 0 }}
      >
        <div
          ref={leftTextRef}
          className={styles.leftText}
          style={{ transform: "perspective(1000px) rotateY(36deg) rotateX(6deg) rotateZ(-3deg) translate3d(0, -50%, 0)" }}
        >
          <span className={styles.textSpan}>
            GIMBAL
          </span>
        </div>

        <div
          ref={rightTextRef}
          className={styles.rightText}
          style={{ transform: "perspective(1000px) rotateY(-36deg) rotateX(6deg) rotateZ(3deg) translate3d(0, -50%, 0)" }}
        >
          <span className={styles.textSpan}>
            STREAM
          </span>
        </div>
      </div>

      <div
        ref={pillRef}
        className={styles.pill}
        style={{ opacity: 0, transform: "translate3d(-100px, -100px, 0)" }}
      >
        <span ref={pillTextRef} className={styles.pillText}>POSTAL IMPRINT</span>
      </div>
    </div>
  );
}

export default GimbalStream;
