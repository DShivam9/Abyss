"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { CascadeGalleryProps } from "./types";
import { DEFAULT_IMAGES, PHOTO_CAPTIONS } from "./constants";
import { GLASS_VERTEX_SHADER, GLASS_FRAGMENT_SHADER } from "./shaders";

export type { CascadeGalleryProps };

interface CardObject {
  group: THREE.Group;
  mesh: THREE.Mesh;
  mat: THREE.ShaderMaterial;
  index: number;
  localPitch: number;
  hoverLift: number;
  introPitch: number;
  introFade: number;
  introThermal: number;
  introOffset?: number;
}

export default function CascadeGallery({
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
  const dateRef = useRef<HTMLDivElement>(null);
  const phraseLeftRef = useRef<HTMLDivElement>(null);
  const phraseRightRef = useRef<HTMLDivElement>(null);

  const stripH1Ref = useRef<HTMLDivElement>(null);
  const stripH2Ref = useRef<HTMLDivElement>(null);
  const stripM1Ref = useRef<HTMLDivElement>(null);
  const stripM2Ref = useRef<HTMLDivElement>(null);
  const stripS1Ref = useRef<HTMLDivElement>(null);
  const stripS2Ref = useRef<HTMLDivElement>(null);

  const ambientDriftSpeedRef = useRef(ambientDriftSpeed);
  const scrollSensitivityRef = useRef(scrollSensitivity);
  const stepDistRef = useRef(stepDist);
  const hoverLiftMultiplierRef = useRef(hoverLiftMultiplier);
  const dominoLeanRef = useRef(dominoLean);

  useEffect(() => {
    ambientDriftSpeedRef.current = ambientDriftSpeed;
    scrollSensitivityRef.current = scrollSensitivity;
    stepDistRef.current = stepDist;
    hoverLiftMultiplierRef.current = hoverLiftMultiplier;
    dominoLeanRef.current = dominoLean;
  }, [ambientDriftSpeed, scrollSensitivity, stepDist, hoverLiftMultiplier, dominoLean]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const phraseLeftEl = phraseLeftRef.current;
    const phraseRightEl = phraseRightRef.current;
    const dateEl = dateRef.current;

    if (!canvas || !container) return;

    let isDisposed = false;
    let animationFrameId: number;

    // --- 1. Three.js Scene Setup ---
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(17, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 42);

    const cardWidth = 3.0;
    const cardHeight = 1.6875;
    const cardGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);
    cardGeo.translate(0, cardHeight / 2, 0);

    const proxyGeo = new THREE.PlaneGeometry(cardWidth * 1.05, cardHeight * 1.15);
    proxyGeo.translate(0, cardHeight / 2, 0);
    const hitProxies: THREE.Mesh[] = [];

    const dirX = 1.62;
    const dirY = 0.90;
    const dirZ = -0.05;
    const totalCards = 120;
    const cards: CardObject[] = [];

    function createCard(tex: THREE.Texture): { group: THREE.Group; mesh: THREE.Mesh; mat: THREE.ShaderMaterial } {
      const mat = new THREE.ShaderMaterial({
        vertexShader: GLASS_VERTEX_SHADER,
        fragmentShader: GLASS_FRAGMENT_SHADER,
        uniforms: {
          uTexture: { value: tex },
          uBlur: { value: 2.8 },
          uAspect: { value: cardWidth / cardHeight },
          uDepthAlpha: { value: 1.0 },
          uIntroFade: { value: 0.0 },
          uThermalNeg: { value: 0.0 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: true,
      });

      const mesh = new THREE.Mesh(cardGeo, mat);
      const group = new THREE.Group();
      group.rotation.set(0.14, -0.84, -0.15);
      group.add(mesh);
      scene.add(group);
      return { group, mesh, mat };
    }

    const introBloom = { fade: 0.0, blur: 6.0 };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1000, -1000);
    let selectedHoverIndex: number | null = null;

    // --- 3. Hero State & Choreography ---
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

    // --- 4. Event Listeners ---
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
        userScrollVelocity -= 35;
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

    // --- 5. Clock Updater ---
    const updateRealTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' };
      if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', options).toUpperCase();
      
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');

      if (stripH1Ref.current) stripH1Ref.current.style.transform = `translateY(-${Number(hours[0]) * 1.15}em)`;
      if (stripH2Ref.current) stripH2Ref.current.style.transform = `translateY(-${Number(hours[1]) * 1.15}em)`;
      if (stripM1Ref.current) stripM1Ref.current.style.transform = `translateY(-${Number(mins[0]) * 1.15}em)`;
      if (stripM2Ref.current) stripM2Ref.current.style.transform = `translateY(-${Number(mins[1]) * 1.15}em)`;
      if (stripS1Ref.current) stripS1Ref.current.style.transform = `translateY(-${Number(secs[0]) * 1.15}em)`;
      if (stripS2Ref.current) stripS2Ref.current.style.transform = `translateY(-${Number(secs[1]) * 1.15}em)`;
    };
    updateRealTime();
    const clockInterval = setInterval(updateRealTime, 1000);

    // --- 6. Render Loop ---
    let lastTime = performance.now();

    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isHeroActive) {
        const driftMultiplier = selectedHoverIndex !== null ? 0.15 : 1.0;
        targetProgress += ambientDriftSpeedRef.current * driftMultiplier * dt * 60;
      }

      const damp = 1 - Math.pow(1 - 0.16, dt * 60);
      currentProgress += (targetProgress - currentProgress) * damp;

      const velDamp = 1 - Math.pow(1 - 0.14, dt * 60);
      userScrollVelocity += (0 - userScrollVelocity) * velDamp;

      const targetDominoBend = THREE.MathUtils.clamp(-userScrollVelocity * 0.025 * dominoLeanRef.current, -0.16, 0.16);

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

    // --- 7. Texture Preloader & Initialization ---
    const textureLoader = new THREE.TextureLoader();
    const loadPromises = images.map((src) => {
      return new Promise<THREE.Texture>((resolve) => {
        textureLoader.load(src, (tex) => {
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          resolve(tex);
        });
      });
    });

    Promise.all(loadPromises).then((loadedTextures) => {
      if (isDisposed) return;
      if (canvas) canvas.style.opacity = '1';

      for (let i = 0; i < totalCards; i++) {
        const tex = loadedTextures[i % loadedTextures.length];
        const cardObj = createCard(tex);
        
        const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
        const proxyMesh = new THREE.Mesh(proxyGeo, proxyMat);
        proxyMesh.userData = { cardIndex: i };
        cardObj.group.add(proxyMesh);
        hitProxies.push(proxyMesh);

        cards.push({
          ...cardObj,
          index: i,
          localPitch: 0,
          hoverLift: 0,
          introPitch: 0.15,
          introFade: 0.0,
          introThermal: 1.0,
          introOffset: 0,
        } as unknown as CardObject);
      }

      cards.forEach((card, idx) => {
        const cardOrder = (idx % 24);
        const delay = 0.06 + cardOrder * 0.045;

        gsap.to(card, {
          introThermal: 0.0,
          introPitch: 0.0,
          introFade: 1.0,
          duration: 1.85,
          delay: delay,
          ease: "power2.inOut",
        });
      });

      gsap.to(introBloom, {
        fade: 1.0,
        blur: 0.0,
        duration: 2.4,
        ease: "power3.out"
      });

      gsap.fromTo(camera.position,
        { z: 47, y: -0.8 },
        { z: 42, y: 0.0, duration: 2.4, ease: "power3.out" }
      );

      gsap.fromTo(".cascade-hud", 
        { opacity: 0, y: -12 }, 
        { opacity: 1, y: 0, duration: 1.4, delay: 0.6, ease: "power2.out" }
      );

      animate();
    });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // --- Cleanup on unmount ---
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      clearInterval(clockInterval);

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);

      cardGeo.dispose();
      proxyGeo.dispose();
      cards.forEach((c) => {
        if (c.mat) c.mat.dispose();
      });
      renderer.dispose();
    };
  }, [images]);

  return (
    <div
      ref={containerRef}
      className={`relative w-screen h-screen overflow-hidden select-none bg-[#f4f1ea] ${className}`}
      style={{
        background: `
          linear-gradient(rgba(0, 0, 0, 0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.025) 1px, transparent 1px),
          radial-gradient(circle at 86% 86%, rgba(0, 0, 0, 0.045) 0%, rgba(0, 0, 0, 0.015) 45%, transparent 74%),
          radial-gradient(circle at 14% 14%, rgba(255, 255, 255, 0.65) 0%, transparent 60%),
          #f4f1ea
        `,
        backgroundSize: '32px 32px, 32px 32px, 100% 100%, 100% 100%, 100% 100%',
        cursor: 'default',
        ...style
      }}
    >
      {/* Minimalist Precision Mechanical Clock & Date HUD */}
      <div className="cascade-hud fixed top-8 left-[94px] z-20 pointer-events-none select-none flex flex-col font-sans">
        <div ref={dateRef} className="text-[11px] font-bold tracking-[0.10em] text-neutral-900/45 uppercase tabular-nums mb-[2px]">
          AUG 26, 2026
        </div>
        <div className="flex items-center text-[14px] font-semibold tracking-[0.04em] text-[#111113] h-[1.15em] leading-[1.15em] overflow-hidden font-mono">
          <div className="h-[1.15em] leading-[1.15em] overflow-hidden inline-block">
            <div ref={stripH1Ref} className="flex flex-col transform transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform">
              <span className="block h-[1.15em] leading-[1.15em] text-center w-[0.65em]">0</span>
              <span className="block h-[1.15em] leading-[1.15em] text-center w-[0.65em]">1</span>
              <span className="block h-[1.15em] leading-[1.15em] text-center w-[0.65em]">2</span>
            </div>
          </div>
          <div className="h-[1.15em] leading-[1.15em] overflow-hidden inline-block">
            <div ref={stripH2Ref} className="flex flex-col transform transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className="block h-[1.15em] leading-[1.15em] text-center w-[0.65em]">{i}</span>
              ))}
            </div>
          </div>
          <span className="inline-block h-[1.15em] leading-[1.15em] mx-[1.5px] opacity-45 font-medium">:</span>
          <div className="h-[1.15em] leading-[1.15em] overflow-hidden inline-block">
            <div ref={stripM1Ref} className="flex flex-col transform transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className="block h-[1.15em] leading-[1.15em] text-center w-[0.65em]">{i}</span>
              ))}
            </div>
          </div>
          <div className="h-[1.15em] leading-[1.15em] overflow-hidden inline-block">
            <div ref={stripM2Ref} className="flex flex-col transform transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className="block h-[1.15em] leading-[1.15em] text-center w-[0.65em]">{i}</span>
              ))}
            </div>
          </div>
          <span className="inline-block h-[1.15em] leading-[1.15em] mx-[1.5px] opacity-45 font-medium">:</span>
          <div className="h-[1.15em] leading-[1.15em] overflow-hidden inline-block">
            <div ref={stripS1Ref} className="flex flex-col transform transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className="block h-[1.15em] leading-[1.15em] text-center w-[0.65em]">{i}</span>
              ))}
            </div>
          </div>
          <div className="h-[1.15em] leading-[1.15em] overflow-hidden inline-block">
            <div ref={stripS2Ref} className="flex flex-col transform transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className="block h-[1.15em] leading-[1.15em] text-center w-[0.65em]">{i}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Flanking Split-Text Backdrop Typography (Intimate Framing) */}
      <div className="fixed top-1/2 left-0 w-screen h-0 pointer-events-none z-[2]">
        <div
          ref={phraseLeftRef}
          className="absolute top-0 right-[71.8vw] -translate-y-1/2 font-serif italic text-[clamp(24px,3.2vw,48px)] text-[#111113]/90 w-[24vw] leading-[1.18] tracking-[-0.015em] text-right opacity-0 select-none will-change-transform"
        >
          In the silent strike,
        </div>
        <div
          ref={phraseRightRef}
          className="absolute top-0 left-[71.8vw] -translate-y-1/2 font-serif italic text-[clamp(24px,3.2vw,48px)] text-[#111113]/90 w-[24vw] leading-[1.18] tracking-[-0.015em] text-left opacity-0 select-none will-change-transform"
        >
          the spirit stays unyielding.
        </div>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block outline-none z-[3] opacity-0 transition-opacity duration-500" />
    </div>
  );
}
