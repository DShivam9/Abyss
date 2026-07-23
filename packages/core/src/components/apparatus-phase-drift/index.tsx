import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ApparatusPhaseDriftProps } from "./types";

const DEFAULT_IMAGES = [
  "/images/components images/scroll/cosmos_1309660817.jpeg",
  "/images/components images/scroll/cosmos_1859262512.jpeg",
  "/images/components images/scroll/cosmos_2063063057.jpeg",
  "/images/components images/scroll/cosmos_679994644.jpeg",
  "/images/components images/scroll/cosmos_1244425812.jpeg",
  "/images/components images/scroll/cosmos_1994819013.jpeg",
  "/images/components images/scroll/cosmos_2086495860.jpeg",
  "/images/components images/scroll/cosmos_51259133.jpeg"
];

// Helper to evaluate winding path horizontal offset
const getPathX = (
  rawY: number,
  totalHeight: number,
  pathType: string,
  amp: number,
  freq: number,
  time: number,
  speed: number,
  cycleLength: number
) => {
  // Normalize rawY relative to the total height of the loop
  const yNorm = (rawY / totalHeight) * Math.PI * 2;
  // Lock waveCycles to a strict integer to guarantee perfect wrapping continuity
  const waveCycles = Math.round(freq * cycleLength);

  switch (pathType) {
    case "zigzag": {
      // Triangle wave path (smoothly wrapped)
      const cycle = yNorm * waveCycles + time * speed * 0.25;
      const val = Math.abs((cycle % 4) - 2) - 1; // range: -1 to 1
      return val * amp;
    }
    case "wandering": {
      // Organic multi-frequency path
      const phase1 = yNorm * waveCycles + time * speed * 0.15;
      const phase2 = yNorm * waveCycles * 0.45 - time * speed * 0.08;
      return Math.sin(phase1) * amp + Math.sin(phase2) * amp * 0.5;
    }
    case "spiral": {
      // 3D-like spiral swing
      const phase = yNorm * waveCycles + time * speed * 0.2;
      return Math.sin(phase) * amp;
    }

    case "sine":
    default: {
      // Pure sine wave path
      const phase = yNorm * waveCycles + time * speed * 0.2;
      return Math.sin(phase) * amp;
    }
  }
};

export const ApparatusPhaseDrift: React.FC<ApparatusPhaseDriftProps & {
  pathType?: "sine" | "zigzag" | "wandering" | "spiral";
  waveAmplitude?: number;
  driftSpeed?: number;
  smoothFactor?: number;
}> = ({
  images,
  amplitude = 150,
  speed = 0.8,
  aspectRatio = "16/9",
  imageWidth = 120, // Default is 120px
  pathType: propPathType = "sine",
  waveAmplitude: propWaveAmplitude,
  driftSpeed: propDriftSpeed,
  smoothFactor: propSmoothFactor = 0.08,
  className = "",
  style,
  onLifecycleChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const imageList = images && images.length > 0 ? images : DEFAULT_IMAGES;
  // Repeat list 4 times for continuous off-screen coverage
  const repeatedImages = [...imageList, ...imageList, ...imageList, ...imageList];

  // Config derived from props
  const pathType = propPathType;
  const customAmplitude = propWaveAmplitude ?? amplitude;
  const customFrequency = 0.5; // Fixed to 0.5 as requested
  const customSpeed = propDriftSpeed ?? speed;
  const customSize = imageWidth;
  const customGap = 0; // Spacing gap is 0 by default (contiguous connection)
  const smoothFactor = propSmoothFactor;

  const scrollOffsetRef = useRef(0);
  const scrollVelocityRef = useRef(0); // ponytail: track velocity for momentum scrolling
  const isScrollingRef = useRef(false);



  // Virtual Scroll Mouse/Touch Bindings
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // ponytail: clamp velocity to limit max speed, scale down delta for heavier feel
      scrollVelocityRef.current = Math.max(-16, Math.min(16, scrollVelocityRef.current + e.deltaY * 0.035));
      isScrollingRef.current = true;
    };

    let lastTouchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = lastTouchY - touchY;
      lastTouchY = touchY;

      // ponytail: clamp touch velocity and scale down delta
      scrollVelocityRef.current = Math.max(-16, Math.min(16, scrollVelocityRef.current + deltaY * 0.065));
      isScrollingRef.current = true;
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
  }, []);

  // Sync state parameters to refs for use inside useGSAP animation loop
  const pathTypeRef = useRef(pathType);
  const amplitudeRef = useRef(customAmplitude);
  const frequencyRef = useRef(customFrequency);
  const speedRef = useRef(customSpeed);
  const sizeRef = useRef(customSize);
  const gapRef = useRef(customGap);
  const smoothRef = useRef(smoothFactor);

  useEffect(() => { pathTypeRef.current = pathType; }, [pathType]);
  useEffect(() => { amplitudeRef.current = customAmplitude; }, [customAmplitude]);
  useEffect(() => { speedRef.current = customSpeed; }, [customSpeed]);
  useEffect(() => { sizeRef.current = customSize; }, [customSize]);
  useEffect(() => { gapRef.current = customGap; }, [customGap]);
  useEffect(() => { smoothRef.current = smoothFactor; }, [smoothFactor]);

  // Lifecycle state emitter
  useEffect(() => {
    const checkLifecycle = () => {
      const isScroll = isScrollingRef.current;
      const currentScroll = scrollOffsetRef.current;
      
      const cardHeight = sizeRef.current * (9 / 16);
      const gap = gapRef.current;
      const itemHeight = cardHeight + gap;
      const totalHeight = itemHeight * repeatedImages.length;
      
      const progress = ((currentScroll % totalHeight) + totalHeight) % totalHeight / totalHeight;

      if (!isScroll) {
        onLifecycleChange?.("idle");
        return;
      }

      if (progress > 0.85) {
        onLifecycleChange?.("recovery");
      } else if (progress > 0.5) {
        onLifecycleChange?.("peak");
      } else if (progress > 0.15) {
        onLifecycleChange?.("buildUp");
      } else {
        onLifecycleChange?.("discovery");
      }
    };

    const interval = setInterval(checkLifecycle, 250);
    return () => clearInterval(interval);
  }, [repeatedImages.length, onLifecycleChange]);

  // Main animation tick loop
  useGSAP(() => {
    let lastFrameTime = performance.now() / 1000;
    let smoothedScrollOffset = 0;
    let animFrame: number;

    const tick = () => {
      const now = performance.now() / 1000;
      const dt = Math.min(0.1, now - lastFrameTime);
      lastFrameTime = now;

      // Local dimensions
      const currentSize = sizeRef.current;
      const currentGap = gapRef.current;
      
      const cardHeight = currentSize * (9 / 16); // 16:9 aspect ratio
      const itemHeight = cardHeight + currentGap;
      const totalHeight = itemHeight * repeatedImages.length;

      // ponytail: physics-based velocity scroll with decay friction for Lenis-like heavy momentum
      const friction = 1.0 - smoothRef.current;
      scrollOffsetRef.current += scrollVelocityRef.current;
      scrollVelocityRef.current *= Math.pow(friction, dt * 60);

      smoothedScrollOffset = scrollOffsetRef.current;

      // Update scrolling active state based on velocity magnitude
      const active = Math.abs(scrollVelocityRef.current) > 0.15;
      isScrollingRef.current = active;

      // Configuration values
      const currentPath = pathTypeRef.current;
      const currentAmp = amplitudeRef.current;
      const currentFreq = frequencyRef.current;
      const currentSpeed = speedRef.current;

      const padding = cardHeight + 200;

      // Position each card absolutely on the winding curve
      for (let i = 0; i < repeatedImages.length; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;

        // 1. Calculate continuous virtual vertical position (Y)
        const rawY = i * itemHeight + smoothedScrollOffset;
        // Modulo logic mapping Y continuously inside totalHeight loop bounds
        let y = ((rawY % totalHeight) + totalHeight) % totalHeight;

        // Shift coordinates so that wrapping triggers safely off-screen
        y = y - padding;

        // 2. Evaluate winding path horizontal coordinate (X)
        const x = getPathX(rawY, totalHeight, currentPath, currentAmp, currentFreq, now, currentSpeed, imageList.length);

        // 3. Flat alignment: 0 rotation angle (as requested)
        const angleDeg = 0;

        // 4. Apply scaleX-only depth calculations to prevent vertical spacing gaps
        let zIndexVal = 10;
        let opacityVal = 1.0;
        let scaleXVal = 1.0;

        if (currentPath === "spiral") {
          const yNorm = (rawY / totalHeight) * Math.PI * 2;
          const waveCycles = Math.round(currentFreq * imageList.length);
          const phase = yNorm * waveCycles + now * currentSpeed * 0.2;
          const zDepth = Math.cos(phase) * 120; // depth amplitude

          // Scale only horizontal width (scaleX) to preserve contiguous vertical alignment
          scaleXVal = 1.0 + zDepth / 450;
          opacityVal = 0.72 + (zDepth / 120) * 0.25; // keep opacity high (0.47 to 0.97) to prevent invisible gaps
          zIndexVal = Math.round(100 + zDepth);
        } else {
          // Flat alignment: standard scale, full opacity, standard layering
          scaleXVal = 1.0;
          opacityVal = 1.0;
          zIndexVal = 10;
        }

        // Apply spatial transformations via direct DOM manipulation for peak performance
        el.style.transform = `translate3d(calc(-50% + ${x}px), ${y}px, 0px) rotate(${angleDeg}deg) scale(${scaleXVal}, 1.0)`;
        el.style.opacity = `${opacityVal}`;
        el.style.zIndex = `${zIndexVal}`;
      }

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Parallax + Contrast Hover Effects
  const handleMouseEnter = (idx: number) => {
    const el = itemRefs.current[idx];
    if (el) {
      const imgEl = el.querySelector("img");
      if (imgEl) {
        gsap.to(imgEl, {
          scale: 1.1,
          filter: "grayscale(0%) contrast(110%) brightness(105%)",
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto"
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const el = itemRefs.current[idx];
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const imgEl = el.querySelector("img");
    if (imgEl) {
      gsap.to(imgEl, {
        x: x * -10,
        y: y * -10,
        rotateX: y * 8,
        rotateY: x * -8,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto"
      });
    }
  };

  const handleMouseLeave = (idx: number) => {
    const el = itemRefs.current[idx];
    if (el) {
      const imgEl = el.querySelector("img");
      if (imgEl) {
        gsap.to(imgEl, {
          scale: 1.0,
          x: 0,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          filter: "grayscale(20%) contrast(100%) brightness(100%)",
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto"
        });
      }
    }
  };



  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden bg-[#070709] select-none ${className}`}
      style={style}
    >


      {/* Absolutely positioned cards following winding path */}
      <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
        {repeatedImages.map((img, idx) => (
          <div
            key={idx}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            className="absolute left-1/2 top-0 pointer-events-auto origin-center bg-neutral-900 cursor-crosshair [perspective:1000px] overflow-hidden"
            style={{
              width: `${customSize}px`,
              aspectRatio: aspectRatio,
              willChange: "transform, opacity"
            }}
            onMouseEnter={() => handleMouseEnter(idx)}
            onMouseLeave={() => handleMouseLeave(idx)}
            onMouseMove={(e) => handleMouseMove(e, idx)}
          >
            {/* Inner image wrapper */}
            <div className="w-full h-full origin-center [transform-style:preserve-3d]">
              <img
                src={img}
                alt={`Specimen ${idx + 1}`}
                className="w-full h-full object-cover select-none pointer-events-none"
                style={{
                  filter: "grayscale(20%) contrast(100%) brightness(100%)",
                  willChange: "transform, filter"
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApparatusPhaseDrift;
