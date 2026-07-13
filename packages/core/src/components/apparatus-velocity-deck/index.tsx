import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { VesselComponentProps } from "../../engine/types";

interface ApparatusVelocityDeckProps extends VesselComponentProps {
  scrollProgress?: number;
}

export const ApparatusVelocityDeck: React.FC<ApparatusVelocityDeckProps> = ({
  imageSrc,
  className = "",
  style,
  onLifecycleChange,
  scrollProgress = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const slicesRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevProgress = useRef(0);
  const prevTime = useRef(typeof window !== "undefined" ? performance.now() : 0);
  
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Lifecycle discovery trigger on mount
  useEffect(() => {
    onLifecycleChange?.("discovery");
    const timer = setTimeout(() => {
      onLifecycleChange?.("idle");
    }, 1000);
    return () => clearTimeout(timer);
  }, [onLifecycleChange]);

  // Track scroll progress delta to compute velocity spikes for lifecycles
  useEffect(() => {
    const now = performance.now();
    const dt = Math.max(1, now - prevTime.current);
    const dp = scrollProgress - prevProgress.current;
    const instantVelocity = (dp / dt) * 1800;
    
    prevProgress.current = scrollProgress;
    prevTime.current = now;

    // Trigger lifecycles based on scroll action
    const absVel = Math.abs(instantVelocity);
    if (absVel > 2.5) {
      onLifecycleChange?.("peak");
    } else if (absVel > 0.4) {
      onLifecycleChange?.("buildUp");
    }
  }, [scrollProgress, onLifecycleChange]);

  // Map scrollProgress to card translations and dynamic cinematic focus blur
  useGSAP(() => {
    slicesRef.current.forEach((slice, idx) => {
      if (!slice) return;

      const offset = idx - 2; // -2, -1, 0, 1, 2

      // --- Last card (idx 0): perspective dive to full-bleed hero instead of flying off ---
      if (idx === 0) {
        const DIVE_START = 0.78;
        const dp = Math.max(0, Math.min(1, (scrollProgress - DIVE_START) / (1 - DIVE_START)));
        const de = dp * dp * (3 - 2 * dp); // smoothstep: eases into a full-bleed rest

        // Cover-scale computed from live container size so the dive always fills,
        // accounting for the perspective enlargement the translateZ dolly adds.
        const container = containerRef.current;
        const cw = container?.clientWidth ?? 1182;
        const ch = container?.clientHeight ?? 664;
        const TZ_END = 500; // how far the card rushes toward the camera
        const persp = 1400 / (1400 - TZ_END); // on-screen enlargement from the dolly (perspective: 1400px)
        const coverScale = Math.max(cw / (185 * persp), ch / (278 * persp)) * 1.04; // 185x278 = base card, 1.04 safety

        const startZ = (0 - 4) * 12; // -48, its resting stack depth
        const startY = offset * 2.5; // -5

        // Depth blur from cards still stacked above, fading out as the dive engages.
        let presenceAbove = 0;
        for (let i = 1; i <= 4; i++) {
          const sA = (4 - i) * 0.15;
          const eA = sA + 0.35;
          presenceAbove += 1 - Math.max(0, Math.min(1, (scrollProgress - sA) / (eA - sA)));
        }
        const blurVal = presenceAbove * 2.0 * (1 - de);

        gsap.to(slice, {
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: startY * (1 - de),
          z: startZ + (TZ_END - startZ) * de,
          rotateY: 0,
          rotateZ: 0,
          scale: 1 + (coverScale - 1) * de,
          opacity: 1,
          filter: `blur(${blurVal}px)`,
          duration: 0.45,
          ease: "power2.out",
          overwrite: "auto",
        });

        // Dissolve the card chrome (radius + border) into a full-bleed frame as it fills.
        const inner = cardInnerRefs.current[idx];
        if (inner) {
          gsap.to(inner, {
            borderRadius: 8 * (1 - de),
            borderColor: `rgba(255, 255, 255, ${0.1 * (1 - de)})`,
            duration: 0.45,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
        return;
      }

      // Invert start time order so the top-most card (idx = 4) flies off first
      const start = (4 - idx) * 0.15;
      const end = start + 0.35;
      const t = Math.max(0, Math.min(1, (scrollProgress - start) / (end - start)));

      // Starting stack coordinates (t = 0) - Cards are stacked completely straight/parallel
      const startX = 0;
      const startY = offset * 2.5;
      const startZ = (idx - 4) * 12; // Linear depth stack (top card idx=4 is at z=0, bottom card idx=0 is at z=-48)
      const startRotY = 0; // Straight parallel rest Y angle
      const startRotZ = 0; // Straight parallel rest Z angle
      const startOpacity = 1;
      const startScale = 1;

      // Ending exit coordinates (t = 1)
      const dir = idx % 2 === 0 ? -1 : 1;
      const endX = dir * 380;
      const endY = -460;
      const endZ = 220;
      const endRotY = dir * 45;
      const endRotZ = dir * 30;
      const endScale = 0.8;

      // Curved LERP interpolation
      const xVal = startX * (1 - t) + endX * Math.pow(t, 1.5);
      const yVal = startY * (1 - t) + endY * Math.pow(t, 1.2);
      const zVal = startZ * (1 - t) + endZ * t;
      const rotY = startRotY * (1 - t) + endRotY * t;
      const rotZ = startRotZ * (1 - t) + endRotZ * t;
      const scaleVal = startScale * (1 - t) + endScale * t;
      const opacityVal = startOpacity * (1 - t * t);

      // --- Cinematic Focus Blur (Depth of Field) ---
      // 1. Exiting cards get blurred as they fly off
      const exitBlur = Math.max(0, (t - 0.45) * 10);
      
      // 2. Stacked cards get blurred based on how many cards are sitting directly on top of them
      let depthBlur = 0;
      if (idx < 4) {
        let presenceAbove = 0;
        for (let i = idx + 1; i <= 4; i++) {
          const startAbove = (4 - i) * 0.15;
          const endAbove = startAbove + 0.35;
          const tAbove = Math.max(0, Math.min(1, (scrollProgress - startAbove) / (endAbove - startAbove)));
          presenceAbove += (1 - tAbove);
        }
        depthBlur = presenceAbove * 2.0; // Dynamic stack depth blur
      }
      
      const totalBlur = Math.max(exitBlur, depthBlur);

      // Animate smoothly to the calculated targets
      gsap.to(slice, {
        xPercent: -50,
        yPercent: -50,
        x: xVal,
        y: yVal,
        z: zVal,
        rotateY: rotY,
        rotateZ: rotZ,
        scale: scaleVal,
        opacity: opacityVal,
        filter: `blur(${totalBlur}px)`,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  }, [scrollProgress]);

  // Handle active card scale & dimming transitions on hover
  useEffect(() => {
    cardInnerRefs.current.forEach((inner, idx) => {
      if (!inner) return;

      let cardScale = 1.0;
      let opacityVal = 1.0;
      let borderColor = "rgba(255, 255, 255, 0.08)";
      let shadow = "0 30px 60px -15px rgba(0, 0, 0, 0.85)";

      if (hoveredIdx === idx) {
        cardScale = 1.06;
        borderColor = "rgba(255, 255, 255, 0.35)";
        shadow = "0 35px 70px -15px rgba(0, 0, 0, 0.95), 0 0 25px rgba(255, 255, 255, 0.04)";
      } else if (hoveredIdx !== null) {
        cardScale = 0.94;
        opacityVal = 0.35;
        borderColor = "rgba(255, 255, 255, 0.03)";
        shadow = "0 10px 20px -10px rgba(0, 0, 0, 0.6)";
      }

      gsap.to(inner, {
        scale: cardScale,
        opacity: opacityVal,
        borderColor: borderColor,
        boxShadow: shadow,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  }, [hoveredIdx]);

  // Track cursor position for stacked 3D tilt interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    cardInnerRefs.current.forEach((inner, idx) => {
      if (!inner) return;
      const factor = 1 - idx * 0.05; // Inner cards tilt slightly less

      gsap.to(inner, {
        rotateY: x * 22 * factor,
        rotateX: -y * 22 * factor,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  };

  const handleMouseLeave = () => {
    onLifecycleChange?.("recovery");
    setHoveredIdx(null);
    cardInnerRefs.current.forEach((inner) => {
      if (!inner) return;
      gsap.to(inner, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  };

  const defaultImages = [
    "/images/components%20images/scroll/cosmos_1309660817.jpeg",
    "/images/components%20images/scroll/cosmos_1859262512.jpeg",
    "/images/components%20images/scroll/cosmos_2063063057.jpeg",
    "/images/components%20images/scroll/cosmos_679994644.jpeg",
    imageSrc, // Dynamic top image (Glowing White Horse)
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      // absolute inset-0 forces the component to fill the parent canvas aspect-video height perfectly
      className={`absolute inset-0 flex justify-center items-center select-none overflow-hidden ${className}`}
      style={{
        backgroundColor: "#070709",
        perspective: "1400px",
        ...style,
      }}
    >
      {/* 3D Scene Viewport */}
      <div 
        className="w-full max-w-5xl h-full relative flex justify-center items-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            ref={(el) => {
              slicesRef.current[idx] = el;
            }}
            // Explicit styles for dimensions to bypass Tailwind arbitrary class watch issues in monorepos
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              width: "185px",
              height: "278px",
              transform: "translate(-50%, -50%)",
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {/* Inner Wrapper (Handles Hover Scaling and mouse move tilt) */}
            <div
              ref={(el) => {
                cardInnerRefs.current[idx] = el;
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="w-full h-full overflow-hidden rounded-[8px] bg-[#0c0c0e] cursor-pointer"
              style={{
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transformStyle: "preserve-3d",
                willChange: "transform, opacity, border-color, box-shadow",
                backfaceVisibility: "hidden",
              }}
            >
              {/* Premium image background styled as cover to prevent letterboxing */}
              <div
                className="w-full h-full transition-all duration-700 ease-out"
                style={{
                  backgroundImage: `url("${defaultImages[idx] || imageSrc}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApparatusVelocityDeck;
