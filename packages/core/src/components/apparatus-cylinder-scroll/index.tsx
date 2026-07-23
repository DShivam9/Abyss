import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ApparatusCylinderScrollProps } from "./types";

const DEFAULT_IMAGES = [
  "/images/components images/scroll/cosmos_1309660817.jpeg",
  "/images/components images/scroll/cosmos_1859262512.jpeg",
  "/images/components images/scroll/cosmos_2063063057.jpeg",
  "/images/components images/scroll/cosmos_679994644.jpeg",
  "/images/components images/scroll/cosmos_1244425812.jpeg",
  "/images/components images/scroll/cosmos_1994819013.jpeg",
  "/images/components images/scroll/cosmos_2086495860.jpeg",
  "/images/components images/scroll/cosmos_51259133.jpeg",
  "/images/components images/scroll/cosmos_1067833670.jpeg",
  "/images/components images/scroll/cosmos_1207399578.jpeg",
  "/images/components images/scroll/cosmos_1215932660.jpeg",
  "/images/components images/scroll/cosmos_1225764898.jpeg",
  "/images/components images/scroll/cosmos_1298955025.jpeg",
  "/images/components images/scroll/cosmos_1452408749.jpeg",
  "/images/components images/scroll/cosmos_1556080729.jpeg"
];

// Content Satoshi text mock bank
const LABELS = [
  "Cosmic Aperture",
  "Phase Shift",
  "Tectonic Depth",
  "Vector Expansion",
  "Spectral Drift",
  "Erosion Wave",
  "Gilded Patina",
  "Molten Core",
  "Chronos Nebula",
  "Event Horizon",
  "Quantum Horizon",
  "Galactic Horizon",
  "Nova Aperture",
  "Stellar Drift",
  "Solar Core"
];



export const ApparatusCylinderScroll: React.FC<ApparatusCylinderScrollProps & {
  baseSigma?: number;
  maxBlur?: number;
  cardGap?: number;
  pathBend?: number;
}> = ({
  images,
  imageSrc,
  scrollProgress,
  className = "",
  style,
  onLifecycleChange,
  baseSigma: propBaseSigma,
  maxBlur: propMaxBlur,
  cardGap: propCardGap,
  pathBend: propPathBend,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastStateRef = useRef<"idle" | "discovery" | "buildUp" | "peak" | "recovery" >("idle");

  // Config States
  const baseSigma = propBaseSigma ?? 350; // Width of the Gaussian swell
  const [smoothFactor] = useState(0.03); // Scroll smoothness
  const [containerHeight, setContainerHeight] = useState(800);
  const maxBlur = propMaxBlur ?? 2; // Maximum blur (0 to 24px)
  const [minScaleY] = useState(0.2); // Card height scale when off-focus
  const cardGap = propCardGap ?? 28; // Gap spacing between cards
  const [activeWidth] = useState(0.5); // In-focus card width factor
  const [tiltPower] = useState(0); // Interaction tilt power
  const pathBend = propPathBend ?? 0; // 3D cylindrical bend factor

  const targetScrollRef = useRef(-0.08);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  const lastScrollTimeRef = useRef(performance.now());
  const mountProgressRef = useRef(0);

  const rawImages = (() => {
    const baseList = images && images.length > 0
      ? images
      : imageSrc
        ? [imageSrc, ...DEFAULT_IMAGES.slice(1)]
        : DEFAULT_IMAGES;

    let expanded = [...baseList];
    while (expanded.length < 35) {
      expanded = [...expanded, ...baseList];
    }
    return expanded;
  })();
  
  const totalCount = rawImages.length;
  const BASE_HEIGHT = 280; // Base layout height of each card in pixels
  const BASE_WIDTH = 460;  // Base layout width of each card in pixels

  // Resize listener to cache container height
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.getBoundingClientRect().height);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Trigger Page Load Sweep and 3D Mount Reveal on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      targetScrollRef.current = 0;
    }, 100);

    gsap.fromTo(mountProgressRef,
      { current: 0 },
      {
        current: 1,
        duration: 2.2,
        ease: "power4.out"
      }
    );

    return () => clearTimeout(timer);
  }, []);

  // Virtual Scroll mouse/touch wheel integration (fallback when scrollProgress is undefined)
  useEffect(() => {
    if (scrollProgress !== undefined) return;

    const handleWheel = (e: WheelEvent) => {
      lastScrollTimeRef.current = performance.now();
      // Accumulate target scroll offset directly for smooth easing
      targetScrollRef.current = targetScrollRef.current + e.deltaY * 0.00025;
    };

    let lastTouchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      lastScrollTimeRef.current = performance.now();
      lastTouchY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      lastScrollTimeRef.current = performance.now();
      const touchY = e.touches[0].clientY;
      const deltaY = lastTouchY - touchY;
      lastTouchY = touchY;

      // Accumulate touch swipe distance
      targetScrollRef.current = targetScrollRef.current + deltaY * 0.0008;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: true });
      container.addEventListener("touchstart", handleTouchStart, { passive: true });
      container.addEventListener("touchmove", handleTouchMove, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, [scrollProgress]);

  // Sync state values to refs for safe tick access
  const smoothRef = useRef(smoothFactor);
  const baseSigmaRef = useRef(baseSigma);
  const containerHeightRef = useRef(containerHeight);
  const maxBlurRef = useRef(maxBlur);
  const minScaleYRef = useRef(minScaleY);
  const cardGapRef = useRef(cardGap);
  const activeWidthRef = useRef(activeWidth);
  const pathBendRef = useRef(pathBend);

  useEffect(() => {
    smoothRef.current = smoothFactor;
    baseSigmaRef.current = baseSigma;
    containerHeightRef.current = containerHeight;
    maxBlurRef.current = maxBlur;
    minScaleYRef.current = minScaleY;
    cardGapRef.current = cardGap;
    activeWidthRef.current = activeWidth;
    pathBendRef.current = pathBend;
  }, [smoothFactor, baseSigma, containerHeight, maxBlur, minScaleY, cardGap, activeWidth, pathBend]);

  // Main animation render loop
  useGSAP(() => {
    let lastFrameTime = performance.now() / 1000;
    let cameraZ = targetScrollRef.current;
    let lastCameraZ = 0;
    let smoothedVelocity = 0;
    let animFrame: number;

    const tick = () => {
      const now = performance.now() / 1000;
      const dt = Math.min(0.1, now - lastFrameTime);
      lastFrameTime = now;

      // Idle auto-scroll: crawl slowly if no interaction for 3 seconds
      const nowMs = performance.now();
      const timeSinceLastScroll = nowMs - lastScrollTimeRef.current;
      if (scrollProgress === undefined && timeSinceLastScroll > 3000) {
        targetScrollRef.current += 0.006 * dt;
      }

      // Smooth scroll interpolation (Lenis-style target easing)
      if (scrollProgress !== undefined) {
        const targetZ = scrollProgress;
        cameraZ += (targetZ - cameraZ) * (1 - Math.pow(1 - smoothRef.current, dt * 60));
      } else {
        cameraZ += (targetScrollRef.current - cameraZ) * (1 - Math.pow(1 - smoothRef.current, dt * 60));
      }

      // Calculate real frame-by-frame velocity
      const rawVelocity = Math.abs(cameraZ - lastCameraZ) * 60;
      lastCameraZ = cameraZ;
      // Damped low-pass filter to smooth out scroll noise for vignette opacity
      smoothedVelocity += (rawVelocity - smoothedVelocity) * 0.1;

      // Stable focus width (sigma is locked and stable to prevent layout stutters)
      const sigma = baseSigmaRef.current;
      const viewportHeight = containerHeightRef.current;
      const viewportCenter = viewportHeight / 2;

      // Active card index dynamically based on cameraZ
      const activeVirtualIdx = cameraZ * (totalCount - 1);
      const centerVirtualIndex = Math.round(activeVirtualIdx);
      
      const currentActive = ((centerVirtualIndex % totalCount) + totalCount) % totalCount;
      if (currentActive !== activeIdxRef.current) {
        activeIdxRef.current = currentActive;
        setActiveIdx(currentActive);
      }

      const startV = centerVirtualIndex - Math.floor(totalCount / 2);

      const currentGap = cardGapRef.current;
      const minScale = minScaleYRef.current;
      const baseW = activeWidthRef.current;
      const limitBlur = maxBlurRef.current;
      const bend = pathBendRef.current;

      // 1. Initial rough calculation of scaleY per card using virtual scroll positions
      const scales: number[] = [];
      const visualHeights: number[] = [];
      
      // Calculate dynamic min scaleY to prevent excessive flattening at 100% path bend
      const bendFactor = bend / 100;
      const dynamicMinScaleY = minScale + (1.0 - minScale) * bendFactor;

      for (let j = 0; j < totalCount; j++) {
        const v = startV + j;
        const distance = (v - activeVirtualIdx) * (BASE_HEIGHT + currentGap);
        const scaleY = dynamicMinScaleY + (1.0 - dynamicMinScaleY) * Math.exp(-Math.pow(distance / sigma, 2));
        scales.push(scaleY);
        visualHeights.push(BASE_HEIGHT * scaleY);
      }

      // 2. Perform integration to calculate the exact stacked Y centers
      const cardCenters: number[] = [];
      cardCenters[0] = visualHeights[0] / 2;
      for (let j = 1; j < totalCount; j++) {
        cardCenters[j] = cardCenters[j - 1] + (visualHeights[j - 1] + visualHeights[j]) / 2 + currentGap;
      }

      // Calculate target camera Y focus position (interpolated between centers)
      const fraction = activeVirtualIdx - startV;
      const intPart = Math.floor(fraction);
      const fracPart = fraction - intPart;
      
      let cameraY = 0;
      if (intPart >= 0 && intPart < totalCount - 1) {
        cameraY = cardCenters[intPart] + fracPart * (cardCenters[intPart + 1] - cardCenters[intPart]);
      } else {
        cameraY = cardCenters[Math.floor(totalCount / 2)];
      }

      // 3. Map final styling attributes, update DOM elements
      for (let j = 0; j < totalCount; j++) {
        const v = startV + j;
        const i = ((v % totalCount) + totalCount) % totalCount;
        
        const el = itemRefs.current[i];
        if (!el) continue;

        const scaleY = scales[j];
        const dynamicBaseW = baseW + (1.0 - baseW) * bendFactor;
        const scaleX = dynamicBaseW + (1.0 - dynamicBaseW) * Math.exp(-Math.pow((cardCenters[j] - cameraY) / sigma, 2));
        
        // Read current mount reveal progress
        const mountProgress = mountProgressRef.current;

        // Relative Z calculated by stacking offset
        const distFromCenterRaw = cardCenters[j] - cameraY;
        const distFromCenter = distFromCenterRaw * mountProgress; // Accordion vertical collapse/fan-out
        const relativeZ = distFromCenter / (BASE_HEIGHT + currentGap);

        // Opacity fade: completely fade out cards that are far away to bypass rendering
        const opacityFactor = Math.exp(-Math.pow(distFromCenter / (sigma * 1.6), 2));
        const opacity = (opacityFactor < 0.02 ? 0 : opacityFactor) * mountProgress; // Mount fade-in

        if (opacity === 0) {
          el.style.visibility = "hidden";
        } else {
          const blurRaw = Math.max(0, limitBlur * (1.0 - Math.exp(-Math.pow(distFromCenter / (sigma * 0.8), 2))));
          const blur = blurRaw + (1 - mountProgress) * 12; // Mount lens focus blur fade
          const saturate = 0.35 + 0.65 * Math.exp(-Math.pow(distFromCenter / sigma, 2));

          // Calculate 3D cylindrical bend transforms
          const bendRatio = bend / 100;
          const radius = 650 / (bendRatio + 0.0001);
          const theta = distFromCenter / radius;

          // Projected Y coordinate on the cylinder (spacing compresses as it curves away)
          const cylinderY = Math.sin(theta) * radius;
          const translateY = viewportCenter + cylinderY;

          // Projected Z coordinate (depth) on the cylinder + 3D Fly-in recess
          const cylinderZ = (Math.cos(theta) - 1) * radius;
          const translateZ = cylinderZ + (1 - mountProgress) * 450;

          // Tangential tilt angle
          const rotateX = -theta * (180 / Math.PI);

          // Smooth scale progression
          const finalScaleX = scaleX * (0.25 + 0.75 * mountProgress);
          const finalScaleY = scaleY * (0.25 + 0.75 * mountProgress);

          el.style.visibility = "visible";
          el.style.transform = `translate3d(-50%, calc(-50% + ${translateY}px), ${translateZ}px) rotateX(${rotateX}deg) scale(${finalScaleX}, ${finalScaleY})`;
          el.style.filter = blur > 0.5 ? `blur(${blur}px) saturate(${saturate})` : "none";
          el.style.opacity = `${opacity}`;
          el.style.zIndex = `${Math.round(1000 - Math.abs(relativeZ) * 100)}`;

          // Dynamic image source update
          const imgEl = el.querySelector(".ripple-image") as HTMLImageElement | null;
          if (imgEl) {
            const currentImg = rawImages[((v % totalCount) + totalCount) % totalCount];
            if (imgEl.src !== currentImg && !imgEl.src.endsWith(currentImg)) {
              imgEl.src = currentImg;
            }
          }
        }


      }

      // Calculate active index and lifecycle states
      let activeIndex = 0;
      let minDistance = 9999;
      for (let i = 0; i < totalCount; i++) {
        const dist = Math.abs(cardCenters[i] - cameraY);
        if (dist < minDistance) {
          minDistance = dist;
          activeIndex = i;
        }
      }

      let state: "idle" | "discovery" | "buildUp" | "peak" | "recovery" = "idle";
      const isMoving = Math.abs(cameraZ - (scrollProgress !== undefined ? scrollProgress : targetScrollRef.current)) > 0.001 || smoothedVelocity > 0.01;

      if (!isMoving) {
        state = "idle";
      } else {
        const distFromCenter = cardCenters[activeIndex] - cameraY;
        if (Math.abs(distFromCenter) < 40) {
          state = "peak";
        } else if (distFromCenter > 40) {
          state = "buildUp";
        } else {
          state = "recovery";
        }
      }

      if (state !== lastStateRef.current) {
        lastStateRef.current = state;
        onLifecycleChange?.(state);
      }

      // Dynamic camera vignette update based on scroll velocity
      const vignetteEl = containerRef.current?.querySelector(".vignette-overlay") as HTMLDivElement | null;
      if (vignetteEl) {
        const baseOpacity = 0.5;
        const targetOpacity = Math.min(0.95, baseOpacity + smoothedVelocity * 0.4);
        vignetteEl.style.opacity = `${targetOpacity}`;
      }

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [scrollProgress, totalCount]);

  // Dynamic cursor interactive tilt on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const el = innerRefs.current[idx];
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    gsap.to(el, {
      rotateX: -y * tiltPower,
      rotateY: x * tiltPower,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto"
    });
  };

  const handleMouseLeave = (idx: number) => {
    const el = innerRefs.current[idx];
    if (!el) return;

    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto"
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-[#070708] overflow-hidden select-none ${className}`}
      style={style}
    >
      {/* Ripple Stack Container */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center [perspective:850px] [transform-style:preserve-3d] pointer-events-none">
        {rawImages.map((img, idx) => (
          <div
            key={idx}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            className="absolute left-1/2 top-1/2 pointer-events-auto origin-center [transform-style:preserve-3d]"
            style={{
              width: `${BASE_WIDTH}px`,
              height: `${BASE_HEIGHT}px`,
              willChange: "transform, opacity, filter"
            }}
          >
            {/* Flex wrapper for placing label next to image */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Card Image */}
              <div
                ref={(el) => {
                  innerRefs.current[idx] = el;
                }}
                onMouseMove={(e) => handleMouseMove(e, idx)}
                onMouseLeave={() => handleMouseLeave(idx)}
                className="w-full h-full origin-center bg-neutral-900 overflow-hidden cursor-crosshair [transform-style:preserve-3d]"
                style={{
                  willChange: "transform",
                  boxShadow: "0 25px 60px rgba(0, 0, 0, 0.65)"
                }}
              >
                <img
                  src={img}
                  alt={`Ripple Image ${idx + 1}`}
                  className="w-full h-full object-cover pointer-events-none select-none ripple-image"
                />
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Premium Editorial HUD Overlay (Bottom corners) */}
      <div 
        style={{
          position: "absolute",
          left: "40px",
          right: "40px",
          bottom: "40px",
          zIndex: 80,
          pointerEvents: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end"
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes titleFocusReveal {
            0% {
              opacity: 0;
              filter: blur(5px);
              letter-spacing: 0.18em;
              transform: translateY(6px);
            }
            100% {
              opacity: 1;
              filter: blur(0);
              letter-spacing: 0.04em;
              transform: translateY(0);
            }
          }
          @keyframes digitRollUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .title-focus {
            display: inline-block;
            animation: titleFocusReveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .digit-roll {
            display: inline-block;
            opacity: 0;
            animation: digitRollUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}} />

        {/* Left Bottom HUD - Title & Specimen Tagline */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px", width: "300px", textAlign: "left" }}>
          {/* Card Title - Premium Serif Font with Optical Focus Swell Reveal */}
          <h2 
            key={`title-${activeIdx}`}
            style={{ 
              fontFamily: "var(--font-editorial), Georgia, serif",
              fontSize: "34px",
              fontWeight: 200,
              fontStyle: "italic",
              color: "white",
              textTransform: "uppercase",
              lineHeight: "1.1",
              margin: 0
            }}
            className="title-focus"
          >
            {LABELS[activeIdx % LABELS.length]}
          </h2>

          {/* Specimen Tagline */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "14px", overflow: "hidden" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#6ec49a] animate-pulse" />
            <span 
              key={`spec-${activeIdx}`}
              className="font-mono text-[9px] text-[#6ec49a] uppercase tracking-widest block"
              style={{
                opacity: 0,
                animation: "digitRollUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 150ms forwards"
              }}
            >
              Vessel Specimen
            </span>
          </div>
        </div>

        {/* Right Bottom HUD - Card Index Number */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", width: "160px", textAlign: "right" }}>
          {/* Card Number indicator with mechanical digit roll */}
          <div 
            key={`num-${activeIdx}`}
            className="font-mono text-[11px] text-white font-bold uppercase tracking-[0.2em] flex items-center"
          >
            {/* Active digit */}
            {(activeIdx + 1).toString().padStart(2, "0").split("").map((digit, charIdx) => (
              <span
                key={charIdx}
                className="inline-block digit-roll text-[#6ec49a]"
                style={{ animationDelay: `${charIdx * 50}ms` }}
              >
                {digit}
              </span>
            ))}
            <span className="text-white/20 mx-1.5 font-light">/</span>
            {/* Total digit */}
            {totalCount.toString().padStart(2, "0").split("").map((digit, charIdx) => (
              <span
                key={charIdx}
                className="inline-block text-white/30"
              >
                {digit}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Cinematic Vignette Overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] vignette-overlay"
        style={{
          mixBlendMode: "multiply",
          opacity: 0.5,
          willChange: "opacity"
        }}
      />
    </div>
  );
};

export default ApparatusCylinderScroll;
