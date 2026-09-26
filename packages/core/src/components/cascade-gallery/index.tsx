"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { CascadeGalleryProps } from "./types";
import { DEFAULT_IMAGES, PHOTO_CAPTIONS } from "./constants";
import { usePerformance } from "../../engine/PerformanceProvider";
import { useLatestRef } from "../../hooks";
import {
  CardObject,
  CASCADE_CONSTANTS,
  loadCardsAndTextures,
  disposeCascadeScene,
} from "./scene";
import styles from "./styles.module.css";

export type { CascadeGalleryProps };

export function CascadeGallery({
  images = DEFAULT_IMAGES,
  ambientDriftSpeed = 0.016,
  scrollSensitivity = 0.0065,
  stepDist = 0.22,
  hoverLiftMultiplier = 1.75,
  dominoLean = 1.0,
  className = "",
  style
}: CascadeGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const monthRef = useRef<HTMLSpanElement>(null);
  const dayYearRef = useRef<HTMLSpanElement>(null);
  const phraseLeftRef = useRef<HTMLDivElement>(null);
  const phraseRightRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const hoursRef = useRef<HTMLSpanElement>(null);
  const minsRef = useRef<HTMLSpanElement>(null);
  const secsRef = useRef<HTMLSpanElement>(null);

  const perf = usePerformance();
  const perfRef = useLatestRef(perf);

  const ambientDriftSpeedRef = useLatestRef(ambientDriftSpeed);
  const scrollSensitivityRef = useLatestRef(scrollSensitivity);
  const stepDistRef = useLatestRef(stepDist);
  const hoverLiftMultiplierRef = useLatestRef(hoverLiftMultiplier);
  const dominoLeanRef = useLatestRef(dominoLean);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setPixelRatio(perf.dpr);
    }
  }, [perf.dpr]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const phraseLeftEl = phraseLeftRef.current;
    const phraseRightEl = phraseRightRef.current;

    if (!canvas || !container) return;

    let isDisposed = false;
    let animationFrameId: number;

    // --- 1. Three.js Scene Setup ---
    const isLow = perfRef.current.tier === "low";
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isLow,
      alpha: true,
      powerPreference: "high-performance",
      precision: isLow ? "mediump" : "highp",
    });
    renderer.setPixelRatio(perfRef.current.dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(17, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 42);

    const { cardWidth, cardHeight, dirX, dirY, dirZ, totalCards } = CASCADE_CONSTANTS;
    const cardGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);
    cardGeo.translate(0, cardHeight / 2, 0);

    const proxyGeo = new THREE.PlaneGeometry(cardWidth * 1.05, cardHeight * 1.15);
    proxyGeo.translate(0, cardHeight / 2, 0);
    const hitProxies: THREE.Mesh[] = [];
    const cards: CardObject[] = [];

    const introBloom = { fade: 0.0, blur: 6.0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1000, -1000);
    let selectedHoverIndex: number | null = null;

    // --- 2. Hero State & Choreography ---
    let activeHeroIndex: number | null = null;
    let isHeroActive = false;
    let isHeroClosing = false;
    let onHeroCloseCallback: (() => void) | null = null;
    let heroTimeline: gsap.core.Timeline | null = null;

    const heroAnim = {
      gapOpening: 0,
      liftY: 0,
      flyProgress: 0,
      expandScale: 0,
    };

    function openHero(index: number) {
      if (heroTimeline) heroTimeline.kill();
      activeHeroIndex = index;
      isHeroActive = true;
      isHeroClosing = false;
      onHeroCloseCallback = null;

      const cap = PHOTO_CAPTIONS[index % PHOTO_CAPTIONS.length];
      if (phraseLeftEl) phraseLeftEl.textContent = cap.left;
      if (phraseRightEl) phraseRightEl.textContent = cap.right;

      const half = totalCards / 2;
      let offset = index - currentProgress;
      offset = ((((offset + half) % totalCards) + totalCards) % totalCards) - half;

      const absOffset = Math.abs(offset);
      const scrollDuration = THREE.MathUtils.clamp(0.75 + absOffset * 0.04, 0.75, 1.6);

      heroTimeline = gsap.timeline();
      heroAnim.gapOpening = 0;
      heroAnim.liftY = 0;
      heroAnim.flyProgress = 0;
      heroAnim.expandScale = 0;

      const scrollObj = { p: currentProgress };
      heroTimeline.to(scrollObj, {
        p: currentProgress + offset,
        duration: scrollDuration,
        ease: "power2.inOut",
        onUpdate: () => {
          currentProgress = scrollObj.p;
          targetProgress = scrollObj.p;
        }
      }, 0);

      const arriveTime = scrollDuration;
      heroTimeline.to(heroAnim, { gapOpening: 0.5, duration: 0.85, ease: "power2.out" }, arriveTime);
      heroTimeline.to(heroAnim, { liftY: 2.2, duration: 0.55, ease: "power1.out" }, arriveTime);
      heroTimeline.to(heroAnim, { liftY: 0.0, duration: 0.55, ease: "power2.inOut" }, arriveTime + 0.55);
      heroTimeline.to(heroAnim, { flyProgress: 1.0, duration: 0.95, ease: "power2.out" }, arriveTime);

      const bloomTime = arriveTime + 0.90;
      heroTimeline.to(heroAnim, { expandScale: 1.0, duration: 0.70, ease: "power2.out" }, bloomTime);
      heroTimeline.to(heroAnim, { gapOpening: 1.0, duration: 0.70, ease: "power2.out" }, bloomTime);

      if (phraseLeftEl && phraseRightEl) {
        heroTimeline.fromTo([phraseLeftEl, phraseRightEl], 
          { opacity: 0 }, 
          { opacity: 0.90, duration: 0.95, ease: "power2.out" }, 
          bloomTime + 0.05
        );
        heroTimeline.fromTo(phraseLeftEl, 
          { x: -36 }, 
          { x: 0, duration: 0.95, ease: "power2.out" }, 
          bloomTime + 0.05
        );
        heroTimeline.fromTo(phraseRightEl, 
          { x: 36 }, 
          { x: 0, duration: 0.95, ease: "power2.out" }, 
          bloomTime + 0.05
        );
      }
    }

    function closeHero(onCompleteCallback?: () => void) {
      if (isHeroClosing) {
        if (onCompleteCallback) {
          onHeroCloseCallback = onCompleteCallback;
        }
        return;
      }

      if (!isHeroActive && activeHeroIndex === null) {
        if (onCompleteCallback) onCompleteCallback();
        return;
      }

      if (heroTimeline) heroTimeline.kill();
      isHeroActive = false;
      isHeroClosing = true;
      onHeroCloseCallback = onCompleteCallback || null;

      heroTimeline = gsap.timeline({
        onComplete: () => {
          heroAnim.gapOpening = 0;
          heroAnim.liftY = 0;
          heroAnim.flyProgress = 0;
          heroAnim.expandScale = 0;
          if (activeHeroIndex !== null && cards[activeHeroIndex]) {
            cards[activeHeroIndex].hoverLift = 0;
            cards[activeHeroIndex].mesh.position.set(0, 0, 0);
            cards[activeHeroIndex].mesh.scale.setScalar(1.0);
            cards[activeHeroIndex].mat.depthTest = true;
          }
          activeHeroIndex = null;
          isHeroClosing = false;
          const cb = onHeroCloseCallback;
          onHeroCloseCallback = null;
          if (typeof cb === "function") {
            cb();
          }
        }
      });

      if (phraseLeftEl && phraseRightEl) {
        heroTimeline.to([phraseLeftEl, phraseRightEl], {
          opacity: 0,
          duration: 0.22,
          ease: "power2.in"
        }, 0);
        heroTimeline.to(phraseLeftEl, { x: -20, duration: 0.22, ease: "power2.in" }, 0);
        heroTimeline.to(phraseRightEl, { x: 20, duration: 0.22, ease: "power2.in" }, 0);
      }

      heroTimeline.to(heroAnim, { expandScale: 0.0, duration: 0.38, ease: "power2.inOut" }, 0);
      heroTimeline.to(heroAnim, { liftY: 2.5, duration: 0.30, ease: "power2.out" }, 0.20);
      heroTimeline.to(heroAnim, { flyProgress: 0.0, duration: 0.58, ease: "power2.inOut" }, 0.25);
      heroTimeline.to(heroAnim, { liftY: 0.0, duration: 0.35, ease: "power2.in" }, 0.80);
      heroTimeline.to(heroAnim, { gapOpening: 0.0, duration: 0.45, ease: "power2.out" }, 1.05);
    }

    function switchHero(newIndex: number) {
      closeHero(() => {
        openHero(newIndex);
      });
    }

    // --- 3. Event Listeners ---
    const handlePointerMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handlePointerLeave = () => {
      mouse.set(-1000, -1000);
      selectedHoverIndex = null;
      container.style.cursor = "default";
    };

    const handleClick = () => {
      if (selectedHoverIndex !== null) {
        if (isHeroClosing) {
          switchHero(selectedHoverIndex);
        } else if (!isHeroActive) {
          openHero(selectedHoverIndex);
        } else if (selectedHoverIndex === activeHeroIndex) {
          closeHero();
        } else {
          switchHero(selectedHoverIndex);
        }
      } else if (isHeroActive || isHeroClosing) {
        closeHero();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (isHeroActive || isHeroClosing)) {
        closeHero();
      } else if (e.key === "ArrowRight" && !isHeroActive && !isHeroClosing) {
        targetProgress += 1.8;
        userScrollVelocity += 35;
      } else if (e.key === "ArrowLeft" && !isHeroActive && !isHeroClosing) {
        targetProgress -= 1.8;
        userScrollVelocity += 35;
      } else if (e.key === " " && !isHeroActive && !isHeroClosing) {
        e.preventDefault();
        targetProgress += 2.5;
        userScrollVelocity += 45;
      }
    };

    let targetProgress = 0;
    let currentProgress = 0;
    let userScrollVelocity = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isHeroActive || isHeroClosing) return;
      const delta = THREE.MathUtils.clamp(e.deltaY * scrollSensitivityRef.current, -4.0, 4.0);
      targetProgress += delta;
      userScrollVelocity += delta * 18;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });

    // --- 4. Clock Updater ---
    const updateRealTime = () => {
      const now = new Date();
      const monthStr = now.toLocaleDateString('en-US', { month: 'long' });
      const dayYearStr = `${String(now.getDate()).padStart(2, '0')}, ${now.getFullYear()}`;
      if (monthRef.current) monthRef.current.textContent = monthStr;
      if (dayYearRef.current) dayYearRef.current.textContent = dayYearStr;
      
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');

      if (hoursRef.current) hoursRef.current.textContent = hours;
      if (minsRef.current) minsRef.current.textContent = mins;
      if (secsRef.current) secsRef.current.textContent = secs;
    };
    updateRealTime();
    const clockInterval = setInterval(updateRealTime, 1000);

    // --- 5. Render Loop ---
    let lastTime = performance.now();

    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isHeroActive && !perfRef.current.reducedMotion) {
        const driftMultiplier = selectedHoverIndex !== null ? 0.15 : 1.0;
        targetProgress += ambientDriftSpeedRef.current * driftMultiplier * dt * 60;
      }

      const damp = 1 - Math.pow(1 - 0.16, dt * 60);
      currentProgress += (targetProgress - currentProgress) * damp;

      const velDamp = 1 - Math.pow(1 - 0.14, dt * 60);
      userScrollVelocity += (0 - userScrollVelocity) * velDamp;

      const targetDominoBend = perfRef.current.reducedMotion
        ? 0
        : THREE.MathUtils.clamp(-userScrollVelocity * 0.025 * dominoLeanRef.current, -0.16, 0.16);

      if (mouse.x > -900) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(hitProxies);
        if (intersects.length > 0) {
          selectedHoverIndex = (intersects[0].object as THREE.Mesh).userData.cardIndex;
        } else {
          selectedHoverIndex = null;
        }
      } else {
        selectedHoverIndex = null;
      }

      if (selectedHoverIndex !== null || isHeroActive) {
        container.style.cursor = "pointer";
      } else {
        container.style.cursor = "default";
      }

      const half = totalCards / 2;

      for (let i = 0; i < totalCards; i++) {
        const card = cards[i];
        if (!card) continue;
        let offset = i - currentProgress - (card.introOffset || 0);
        offset = ((((offset + half) % totalCards) + totalCards) % totalCards) - half;

        const isThisHero = (i === activeHeroIndex);
        card.group.visible = true;

        card.localPitch += (targetDominoBend - card.localPitch) * (1 - Math.pow(1 - 0.20, dt * 60));
        card.mesh.rotation.x = card.localPitch + (card.introPitch || 0);

        if (isThisHero && activeHeroIndex !== null) {
          const fp = heroAnim.flyProgress;
          const curScale = THREE.MathUtils.lerp(1.0, 1.85, heroAnim.expandScale);

          const slotX = offset * stepDistRef.current * dirX;
          const slotY = offset * stepDistRef.current * dirY + heroAnim.liftY;
          const slotZ = offset * stepDistRef.current * dirZ;

          const targetHeroX = 0;
          const targetHeroY = -(cardHeight * curScale) / 2;
          const targetHeroZ = 16;

          const curX = THREE.MathUtils.lerp(slotX, targetHeroX, fp);
          const curY = THREE.MathUtils.lerp(slotY, targetHeroY, fp);
          const curZ = THREE.MathUtils.lerp(slotZ, targetHeroZ, fp);
          card.group.position.set(curX, curY, curZ);

          card.group.rotation.set(
            THREE.MathUtils.lerp(0.14, 0, fp),
            THREE.MathUtils.lerp(-0.84, 0, fp),
            THREE.MathUtils.lerp(-0.15, 0, fp)
          );

          card.mesh.scale.setScalar(curScale);
          card.mesh.position.set(0, 0, 0);

          if (card.mat && card.mat.uniforms) {
            if (card.mat.uniforms.uBlur) card.mat.uniforms.uBlur.value = THREE.MathUtils.lerp(1.0, 0.0, fp);
            if (card.mat.uniforms.uIntroFade) card.mat.uniforms.uIntroFade.value = 1.0;
          }

          card.group.renderOrder = 10000;
          const dtVal = (heroAnim.liftY < 0.05 && fp < 0.05);
          card.mat.depthTest = dtVal;

        } else {
          if (card.mat && card.mat.uniforms) {
            if (card.mat.uniforms.uBlur) card.mat.uniforms.uBlur.value = introBloom.blur;
            if (card.mat.uniforms.uIntroFade) card.mat.uniforms.uIntroFade.value = (card.introFade !== undefined ? card.introFade : 1.0);
            if (card.mat.uniforms.uThermalNeg) card.mat.uniforms.uThermalNeg.value = (card.introThermal !== undefined ? card.introThermal : 0.0);
          }

          const isThisHovered = (i === selectedHoverIndex && i !== activeHeroIndex);
          const targetHover = isThisHovered ? 1.0 : 0.0;
          card.hoverLift += (targetHover - card.hoverLift) * (1 - Math.pow(1 - 0.08, dt * 60));

          const normalD = offset * stepDistRef.current;
          let compressedD = normalD;
          if (activeHeroIndex !== null) {
            const centerOpening = 3.8;
            const compressedStep = 0.12;
            const absOffset = Math.abs(offset);
            
            if (offset >= 0) {
              compressedD = centerOpening + absOffset * compressedStep;
            } else {
              compressedD = -centerOpening - absOffset * compressedStep;
            }
          }

          const finalD = THREE.MathUtils.lerp(normalD, compressedD, heroAnim.gapOpening);
          card.group.position.set(finalD * dirX, finalD * dirY, finalD * dirZ);
          card.group.rotation.set(0.14, -0.84, -0.15);

          card.mesh.position.x = card.hoverLift * hoverLiftMultiplierRef.current;
          card.mesh.position.y = card.hoverLift * 0.40;
          card.mesh.position.z = card.hoverLift * 0.20;
          card.mesh.scale.setScalar(1.0);

          if (card.hoverLift > 0.02) {
            card.group.renderOrder = 2000 + Math.round(card.hoverLift * 500);
          } else {
            card.group.renderOrder = Math.round(1000 - offset * 10);
          }
          card.mat.depthTest = true;
        }
      }

      renderer.render(scene, camera);
    };

    // --- 6. Texture Loading ---
    const cancelLoader = loadCardsAndTextures(
      images,
      cardGeo,
      proxyGeo,
      scene,
      camera,
      hitProxies,
      cards,
      introBloom,
      () => {
        if (canvas) canvas.style.opacity = '1';
        animate();
      }
    );

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // --- 7. Teardown ---
    return () => {
      isDisposed = true;
      cancelLoader();
      cancelAnimationFrame(animationFrameId);
      clearInterval(clockInterval);

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);

      disposeCascadeScene(cardGeo, proxyGeo, cards, renderer);
      rendererRef.current = null;
      container.style.cursor = "default";
    };
  }, [images]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={style}
    >
      {/* Minimalist Precision Clock & Date HUD */}
      <div className={`cascade-hud ${styles.hud}`}>
        <div className={styles.dateRow}>
          <span ref={monthRef} className={styles.month}>
            September
          </span>
          <span ref={dayYearRef} className={styles.dayYear}>
            20, 2026
          </span>
        </div>
        <div className={styles.timeRow}>
          <span ref={hoursRef}>20</span>
          <span className={styles.timeColon}>:</span>
          <span ref={minsRef}>01</span>
          <span className={styles.timeColon}>:</span>
          <span ref={secsRef}>29</span>
        </div>
      </div>

      {/* Flanking Split-Text Backdrop Typography */}
      <div className={styles.flankingBackdrop}>
        <div ref={phraseLeftRef} className={styles.phraseLeft}>
          In the silent strike,
        </div>
        <div ref={phraseRightRef} className={styles.phraseRight}>
          the spirit stays unyielding.
        </div>
      </div>

      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}

export default CascadeGallery;
