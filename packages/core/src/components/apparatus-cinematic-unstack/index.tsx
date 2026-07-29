import React, { useRef, useEffect } from "react";
import { VesselComponentProps } from "../../engine/types";

// 12 default curated high-resolution imagery with encoded URLs
const DEFAULT_STACK_IMAGES = [
  "/images/components%20images/scroll/cosmos_1067833670.jpeg",
  "/images/components%20images/scroll/cosmos_1215932660.jpeg",
  "/images/components%20images/scroll/cosmos_1292975902.jpeg",
  "/images/components%20images/scroll/cosmos_1309660817.jpeg",
  "/images/components%20images/scroll/cosmos_1633231397.jpeg",
  "/images/components%20images/scroll/cosmos_1859262512.jpeg",
  "/images/components%20images/scroll/cosmos_1067833670.jpeg",
  "/images/components%20images/scroll/cosmos_1215932660.jpeg",
  "/images/components%20images/scroll/cosmos_1292975902.jpeg",
  "/images/components%20images/scroll/cosmos_1309660817.jpeg",
  "/images/components%20images/scroll/cosmos_1633231397.jpeg",
  "/images/components%20images/scroll/cosmos_1859262512.jpeg",
];

export type UnstackVariant = 
  | "cinematic-unstack" 
  | "helical-fan" 
  | "hyper-origami" 
  | "vessel-curtain" 
  | "prism-shutter"
  | "quantum-warp"
  | "vortex-peel";

export interface ApparatusCinematicUnstackProps extends VesselComponentProps {
  variant?: UnstackVariant;
  images?: string[];
  cardCount?: number;
  tiltAngle?: number;
  exitScale?: number;
  exitOpacity?: number;
  borderRadius?: number;
  perspective?: number;
  cardBendAmount?: number;
  scrollSensitivity?: number;
  parallaxIntensity?: number;
  scrollProgress?: number;
}

export const ApparatusCinematicUnstack: React.FC<ApparatusCinematicUnstackProps> = ({
  variant = "cinematic-unstack",
  imageSrc,
  images,
  cardCount: propCardCount,
  tiltAngle: propTiltAngle,
  exitScale: propExitScale,
  exitOpacity: propExitOpacity,
  borderRadius: propBorderRadius,
  perspective: propPerspective,
  cardBendAmount: propCardBendAmount,
  scrollSensitivity: propScrollSensitivity,
  parallaxIntensity: propParallaxIntensity,
  className = "",
  style,
  onLifecycleChange,
  scrollProgress: externalProgress = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  // Dynamic SVG path refs for physical card bending clipPath
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  // Mouse interactive tracking
  const mousePosRef = useRef({ x: 0, y: 0 });
  const mouseTargetRef = useRef({ x: 0, y: 0 });

  // Kinetic physics refs
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  // Interactive controls parameters
  const cardCount = Math.min(Math.max(Number(propCardCount) ?? 6, 3), 12);
  const tiltAngle = Number(propTiltAngle) ?? 10;
  const exitScale = Number(propExitScale) ?? 0.80;
  const exitOpacity = Number(propExitOpacity) ?? 1.0;
  const borderRadius = Number(propBorderRadius) ?? 20;
  const perspective = Number(propPerspective) ?? 1200;
  const maxBend = Number(propCardBendAmount) ?? 35;
  const sensitivity = (Number(propScrollSensitivity) ?? 20) * 0.000004;
  const parallaxFactor = (Number(propParallaxIntensity) ?? 35) * 0.01;

  // Prepare raw direct image dataset
  const cardImages = (
    images && images.length >= cardCount
      ? images
      : [imageSrc || DEFAULT_STACK_IMAGES[0], ...DEFAULT_STACK_IMAGES.slice(1)]
  ).slice(0, cardCount);

  // Sync external scrollProgress into targetProgressRef
  useEffect(() => {
    if (externalProgress > 0) {
      targetProgressRef.current = Math.min(Math.max(externalProgress, 0), 1);
    }
  }, [externalProgress]);

  // Container wheel listener — Smooth continuous 1:1 progressive scroll tracking
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const impulse = e.deltaY * sensitivity;
      const next = Math.min(Math.max(targetProgressRef.current + impulse, 0), 1);
      targetProgressRef.current = next;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      mouseTargetRef.current = { x: nx, y: ny };
    };

    const handleMouseLeave = () => {
      mouseTargetRef.current = { x: 0, y: 0 };
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [sensitivity]);

  // 60FPS Kinetic Engine Loop with Out-of-the-Box Origami & Quantum Warp Mechanics
  useEffect(() => {
    let animFrame: number;

    const updateStack = (now: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.033);
      lastTimeRef.current = now;

      // Mouse position lerp
      mousePosRef.current.x += (mouseTargetRef.current.x - mousePosRef.current.x) * 0.08;
      mousePosRef.current.y += (mouseTargetRef.current.y - mousePosRef.current.y) * 0.08;
      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;

      // Smooth progressive lerp
      const prevProgress = currentProgressRef.current;
      const target = targetProgressRef.current;
      
      const lerpSpeed = 1 - Math.pow(0.0001, dt);
      currentProgressRef.current += (target - currentProgressRef.current) * lerpSpeed;
      
      const current = currentProgressRef.current;
      const instVelocity = (current - prevProgress) / (dt || 0.016);
      velocityRef.current += (instVelocity - velocityRef.current) * 0.15;
      const velocity = velocityRef.current;

      // Lifecycle reporting
      if (onLifecycleChange) {
        if (current < 0.05) onLifecycleChange("idle");
        else if (current < 0.2) onLifecycleChange("discovery");
        else if (current < 0.85) onLifecycleChange("buildUp");
        else if (current < 0.98) onLifecycleChange("peak");
        else onLifecycleChange("recovery");
      }

      const totalSegments = cardCount - 1;
      if (totalSegments <= 0) return;

      const rawProgress = current * totalSegments;
      const currentSegmentIndex = Math.min(
        Math.floor(rawProgress),
        totalSegments - 1
      );

      const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;

      cardRefs.current.forEach((cardEl, idx) => {
        if (!cardEl) return;
        const imgEl = imgRefs.current[idx];

        let x = 0;
        let y = 0;
        let rotX = 0;
        let rotY = 0;
        let rotZ = 0;
        let scale = 1;
        let opacity = 1.0;
        let translateZ = 0;
        let topBend = 0;
        let bottomBend = 0;
        let imgParallaxY = 0;

        if (idx < currentSegmentIndex) {
          // Exited cards above viewport
          y = -viewportH * 1.15;
          rotX = -tiltAngle - Math.min(Math.abs(velocity) * 3, 10);
          scale = exitScale;
          opacity = exitOpacity;
          translateZ = -120;
          topBend = 0;
          bottomBend = 0;
          imgParallaxY = viewportH * 0.2 * parallaxFactor;
        } else if (idx === currentSegmentIndex) {
          // Active unstacking card
          const exitProg = rawProgress - currentSegmentIndex;
          const easedExit = Math.pow(exitProg, 1.5);
          const velMag = Math.abs(velocity);

          // INTERNAL IMAGE PARALLAX
          imgParallaxY = (-viewportH * 0.4 * easedExit) * parallaxFactor;

          if (variant === "helical-fan") {
            // VARIANT 2: HELICAL FAN (3D Spiral Spin & Lateral Arc Translation)
            x = -160 * easedExit;
            y = -viewportH * 1.1 * easedExit;
            rotZ = -45 * easedExit + (mx * 8);
            rotX = (-tiltAngle + velocity * 5) * easedExit;
            rotY = 15 * easedExit + (my * 6);
            scale = 1 - (1 - exitScale) * easedExit;
            opacity = exitOpacity >= 0.99 ? 1.0 : 1 - (1 - exitOpacity) * easedExit;
            translateZ = -40 * easedExit;
            topBend = maxBend * Math.sin(exitProg * Math.PI) * Math.min(1.5, velMag * 3);
            bottomBend = topBend;
          } else if (variant === "hyper-origami") {
            // OUT-OF-THE-BOX VARIANT 3: HYPER ORIGAMI (Multi-Dimensional 3D Origami Unfold & Camera Surge)
            x = -140 * Math.sin(exitProg * Math.PI) + (mx * 12);
            y = -viewportH * 1.1 * easedExit;
            rotX = (-tiltAngle + 45 * Math.sin(exitProg * Math.PI)) * easedExit + (-my * 8);
            rotY = (-55 * Math.sin(exitProg * Math.PI)) + (mx * 10);
            rotZ = (22 * Math.sin(exitProg * Math.PI));
            // Camera forward surge then shrink exit
            const zSurge = Math.sin(exitProg * Math.PI) * 260;
            translateZ = zSurge - 150 * easedExit;
            scale = 1 + (0.28 * Math.sin(exitProg * Math.PI)) - (1 - exitScale) * easedExit;
            opacity = exitOpacity >= 0.99 ? 1.0 : 1 - (1 - exitOpacity) * easedExit;
            // Origami dual-wing asymmetrical fold bend
            topBend = maxBend * 1.6 * Math.sin(exitProg * Math.PI);
            bottomBend = -maxBend * 1.2 * Math.sin(exitProg * Math.PI);
          } else if (variant === "vessel-curtain") {
            // VARIANT 4: VESSEL CURTAIN (Theatrical Pitch Roll & Lateral Shear)
            x = 80 * Math.sin(exitProg * Math.PI);
            y = -viewportH * 1.15 * easedExit;
            rotX = (-tiltAngle * 2.2 + velocity * 6) * easedExit + (-my * 8 * (1 - exitProg));
            rotY = (-25 + velocity * -4) * easedExit + (mx * 8 * (1 - exitProg));
            scale = 1 - (1 - exitScale) * easedExit;
            opacity = exitOpacity >= 0.99 ? 1.0 : 1 - (1 - exitOpacity) * easedExit;
            translateZ = -80 * easedExit;
            topBend = maxBend * Math.sin(exitProg * Math.PI) * Math.min(1.8, velMag * 4);
            bottomBend = topBend;
          } else if (variant === "prism-shutter") {
            // VARIANT 5: PRISM SHUTTER (3D Shear Slide)
            x = 420 * easedExit + (mx * 10 * (1 - exitProg));
            y = -viewportH * 0.7 * easedExit;
            rotX = (-tiltAngle + velocity * 4) * easedExit + (-my * 5);
            rotY = -35 * easedExit + (mx * 8);
            rotZ = 16 * easedExit;
            scale = 1 - (1 - exitScale * 0.9) * easedExit;
            opacity = exitOpacity >= 0.99 ? 1.0 : 1 - (1 - exitOpacity) * easedExit;
            translateZ = -140 * easedExit;
            topBend = maxBend * 0.7 * Math.sin(exitProg * Math.PI);
            bottomBend = topBend;
          } else if (variant === "quantum-warp") {
            // OUT-OF-THE-BOX VARIANT 6: QUANTUM WARP (Asymmetric S-Curve Warp & Wormhole Dive)
            x = 180 * Math.sin(exitProg * Math.PI) * (1 - exitProg);
            y = -viewportH * 0.7 * easedExit;
            rotZ = 75 * easedExit;
            rotY = (50 * easedExit) + (mx * 12);
            rotX = (-35 * easedExit) + (-my * 8);
            scale = Math.max(0.12, 1 - (1 - exitScale * 0.3) * easedExit);
            opacity = exitOpacity >= 0.99 ? 1.0 : 1 - (1 - exitOpacity) * easedExit;
            translateZ = -450 * easedExit; // Deep wormhole Z dive
            // Gravitational S-Curve Warp: top curves positive, bottom curves negative
            topBend = maxBend * 2.2 * Math.sin(exitProg * Math.PI);
            bottomBend = -maxBend * 1.8 * Math.sin(exitProg * Math.PI);
          } else if (variant === "vortex-peel") {
            // VARIANT 7: VORTEX PEEL (Helical Vortex Peel)
            x = 280 * easedExit + (mx * 10);
            y = -viewportH * 1.1 * easedExit;
            rotZ = 38 * easedExit;
            rotX = (-tiltAngle - 15) * easedExit;
            rotY = -30 * easedExit + (mx * 8);
            scale = 1 - (1 - exitScale * 0.65) * easedExit;
            opacity = exitOpacity >= 0.99 ? 1.0 : 1 - (1 - exitOpacity) * easedExit;
            translateZ = -160 * easedExit;
            topBend = maxBend * 1.4 * Math.sin(exitProg * Math.PI) * Math.min(1.8, velMag * 4);
            bottomBend = topBend;
          } else {
            // VARIANT 1: CINEMATIC UNSTACK (Classic Parallax Lift & Parallel Bend)
            const velTilt = Math.min(Math.max(velocity * 6, -12), 12);
            y = -viewportH * 1.15 * easedExit;
            rotX = (-tiltAngle + velTilt) * easedExit + (-my * 5 * (1 - exitProg));
            rotY = (velocity * -3) * (1 - exitProg) + (mx * 6 * (1 - exitProg));
            scale = 1 - (1 - exitScale) * easedExit;
            opacity = exitOpacity >= 0.99 ? 1.0 : 1 - (1 - exitOpacity) * easedExit;
            translateZ = -60 * easedExit;
            topBend = maxBend * Math.sin(exitProg * Math.PI) * Math.min(1.8, velMag * 4);
            bottomBend = topBend;
          }
        } else {
          // STACKED CARDS BELOW
          const stackOffset = idx - currentSegmentIndex;
          imgParallaxY = 0;

          if (variant === "hyper-origami") {
            x = (stackOffset % 2 === 0 ? 1 : -1) * stackOffset * 10;
            y = stackOffset * 22;
            rotY = (stackOffset % 2 === 0 ? -1 : 1) * stackOffset * 5 + (mx * 4);
            rotX = -tiltAngle * 1.3 * Math.min(stackOffset * 0.3, 1.0) + (-my * 3);
            scale = Math.max(0.60, 1 - stackOffset * 0.035);
            translateZ = -stackOffset * 22;
          } else if (variant === "quantum-warp") {
            y = stackOffset * 18;
            rotZ = stackOffset * 3;
            rotX = -tiltAngle * Math.min(stackOffset * 0.3, 1.0) + (-my * 3);
            rotY = (mx * 5);
            scale = Math.max(0.60, 1 - stackOffset * 0.03);
            translateZ = -stackOffset * 20;
          } else {
            y = stackOffset * 18;
            rotX = -tiltAngle * Math.min(stackOffset * 0.3, 1.0) + (-my * 3);
            rotY = (mx * 4);
            scale = Math.max(0.60, 1 - stackOffset * 0.03);
            translateZ = -stackOffset * 18;
          }
          opacity = 1.0;
          topBend = 0;
          bottomBend = 0;
        }

        // Apply 3D transforms & live corner radius
        cardEl.style.transform = `translate3d(${x}px, ${y}px, ${translateZ}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`;
        cardEl.style.opacity = `${opacity}`;
        cardEl.style.borderRadius = `${borderRadius}px`;

        // Apply Internal Image Parallax counter-translation
        if (imgEl) {
          imgEl.style.transform = `translate3d(0, ${imgParallaxY}px, 0) scale(1.15)`;
        }

        // Dynamic SVG Path update for Top and Bottom edge parabolic bending
        const pathEl = pathRefs.current[idx];
        if (pathEl) {
          const W = 760;
          const H = 480;
          const tb = Math.max(-60, Math.min(120, topBend));
          const bb = Math.max(-60, Math.min(120, bottomBend));
          const d = `M 0 0 Q ${W / 2} ${-tb} ${W} 0 L ${W} ${H} Q ${W / 2} ${H - bb} 0 ${H} Z`;
          pathEl.setAttribute("d", d);
        }
      });

      animFrame = requestAnimationFrame(updateStack);
    };

    animFrame = requestAnimationFrame(updateStack);
    return () => cancelAnimationFrame(animFrame);
  }, [variant, cardCount, tiltAngle, exitScale, exitOpacity, borderRadius, perspective, maxBend, parallaxFactor, onLifecycleChange]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen min-h-screen flex items-center justify-center overflow-hidden bg-[#070708] text-white select-none ${className}`}
      style={{
        perspective: `${perspective}px`,
        perspectiveOrigin: "50% 50%",
        ...style,
      }}
    >
      {/* Dynamic SVG ClipPath Definitions for Card Bending */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {cardImages.map((_, idx) => (
            <clipPath id={`vessel-unstack-bend-clip-${idx}`} key={idx} clipPathUnits="userSpaceOnUse">
              <path
                ref={(el) => (pathRefs.current[idx] = el)}
                d="M 0 0 Q 380 0 760 0 L 760 480 Q 380 480 0 480 Z"
              />
            </clipPath>
          ))}
        </defs>
      </svg>

      {/* Centered Stage Container */}
      <div
        className="relative flex items-center justify-center shrink-0 transform-style-3d"
        style={{ width: "760px", height: "480px", maxWidth: "90vw" }}
      >
        {cardImages.map((rawUrl, idx) => {
          const zIndex = cardCount - idx;
          const safeUrl = rawUrl.startsWith("http")
            ? rawUrl
            : encodeURI(decodeURI(rawUrl));

          return (
            <div
              key={idx}
              ref={(el) => (cardRefs.current[idx] = el)}
              className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden block will-change-transform transform-gpu"
              style={{
                zIndex,
                borderRadius: `${borderRadius}px`,
                clipPath: `url(#vessel-unstack-bend-clip-${idx})`,
                WebkitClipPath: `url(#vessel-unstack-bend-clip-${idx})`,
                transform: `translate3d(0, ${idx * 18}px, ${-idx * 18}px) rotateX(${-tiltAngle * Math.min(idx * 0.3, 1.0)}deg) scale(${1 - idx * 0.03})`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {/* RAW DIRECT IMAGE WITH INTERNAL PARALLAX COUNTER-SCROLL */}
              <img
                ref={(el) => (imgRefs.current[idx] = el)}
                src={safeUrl}
                alt={`Vessel Frame ${idx + 1}`}
                className="w-full h-full object-cover block pointer-events-none will-change-transform scale-[1.15]"
                loading="eager"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApparatusCinematicUnstack;
