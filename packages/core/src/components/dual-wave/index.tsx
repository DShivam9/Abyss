import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ApparatusDualWaveProps, DualWaveItem } from "./types";

// 24 unique single-word aesthetic visual, motion, color, and optics titles (zero duplicates)
const DEFAULT_ITEMS: DualWaveItem[] = [
  { id: "01", name: "LUSTER", imageSrc: "/images/components images/scroll/cosmos_1309660817.webp" },
  { id: "02", name: "RADIANCE", imageSrc: "/images/components images/scroll/cosmos_1859262512.webp" },
  { id: "03", name: "SPECTRUM", imageSrc: "/images/components images/scroll/cosmos_2063063057.webp" },
  { id: "04", name: "ROTATION", imageSrc: "/images/components images/scroll/cosmos_679994644.webp" },
  { id: "05", name: "AURORA", imageSrc: "/images/components images/scroll/cosmos_1244425812.webp" },
  { id: "06", name: "EXPOSURE", imageSrc: "/images/components images/scroll/cosmos_1994819013.webp" },
  { id: "07", name: "SOLSTICE", imageSrc: "/images/components images/scroll/cosmos_2086495860.webp" },
  { id: "08", name: "CHROMATIC", imageSrc: "/images/components images/scroll/cosmos_51259133.webp" },
  { id: "09", name: "KINETIC", imageSrc: "/images/components images/scroll/cosmos_586109684.webp" },
  { id: "10", name: "HARMONY", imageSrc: "/images/components images/scroll/cosmos_1452408749.webp" },
  { id: "11", name: "IRIDESCENCE", imageSrc: "/images/components images/scroll/cosmos_1298955025.webp" },
  { id: "12", name: "TRANSITION", imageSrc: "/images/components images/scroll/cosmos_2093433371.webp" },
  { id: "13", name: "PERSPECTIVE", imageSrc: "/images/components images/scroll/cosmos_520815919.webp" },
  { id: "14", name: "APERTURE", imageSrc: "/images/components images/scroll/cosmos_666194661.webp" },
  { id: "15", name: "GRADIENT", imageSrc: "/images/components images/scroll/cosmos_961582572.webp" },
  { id: "16", name: "SILHOUETTE", imageSrc: "/images/components images/scroll/cosmos_1067833670.webp" },
  { id: "17", name: "VELOCITY", imageSrc: "/images/components images/scroll/cosmos_1207399578.webp" },
  { id: "18", name: "REFLECTION", imageSrc: "/images/components images/scroll/cosmos_1215932660.webp" },
  { id: "19", name: "ECLIPSE", imageSrc: "/images/components images/scroll/cosmos_169178344.webp" },
  { id: "20", name: "RESONANCE", imageSrc: "/images/components images/scroll/cosmos_496247602.webp" },
  { id: "21", name: "OPAL", imageSrc: "/images/components images/scroll/cosmos_1225764898.webp" },
  { id: "22", name: "PRISMATIC", imageSrc: "/images/components images/scroll/cosmos_1556080729.webp" },
  { id: "23", name: "HALO", imageSrc: "/images/components images/scroll/cosmos_1633231397.webp" },
  { id: "24", name: "CELESTIAL", imageSrc: "/images/components images/scroll/cosmos_1872135509.webp" },
];

// Baked defaults for refined wave path optics
const BAKED_IRIS_CURVATURE = 0.50;
const BAKED_HORIZON_CURVATURE = 0.60;
const BAKED_HOURGLASS_CURVATURE = 0.35;
const BAKED_CORNER_ALIGNMENT = 1.0;
const BAKED_DUAL_SINE_WAVENUM = 0.45;
const BAKED_COLUMN_LAG = 0.40;
const BAKED_VELOCITY_SQUEEZE = 0.85;

export const ApparatusDualWave: React.FC<ApparatusDualWaveProps & {
  fontFamily?: string;
  amplitude?: number;
  spacing?: number;
  maxBlur?: number;
  maxRotation?: number;
  scrollDamping?: number;
  wavePattern?: "iris" | "horizon" | "hourglass" | "dualSine";
}> = ({
  items,
  imageSrc,
  fontFamily: propFontFamily,
  amplitude,
  spacing: propSpacing,
  maxBlur: propMaxBlur,
  maxRotation: propMaxRotation,
  scrollDamping: propScrollDamping,
  wavePattern: propWavePattern = "iris",
  className = "",
  style,
  onLifecycleChange,
  isFullscreen = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Size bounds
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const activeIdxRef = useRef(0);
  
  // Interactive tuning controls derived from props
  const waveRange = amplitude !== undefined ? (amplitude / 60) * 100 : 125;
  const spacing = propSpacing !== undefined ? Math.max(35, propSpacing) : 72;
  const scrollDamping = propScrollDamping !== undefined ? propScrollDamping : 0.08;
  const maxBlur = propMaxBlur !== undefined ? propMaxBlur : 2.5;
  const maxRotation = propMaxRotation !== undefined ? propMaxRotation : 6.5;
  
  const resolvedFontFamily = propFontFamily || "'Hatton', 'Larken', serif";
  const resolvedFontStyle = "normal";
  
  // Animation loop playheads & layout refs
  const smoothOffsetRef = useRef(0);
  const smoothOffsetRightRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const smoothMouseRef = useRef({ x: 0, y: 0 });
  const centerImageFrameRef = useRef<HTMLDivElement>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const activeImageIdxRef = useRef(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const dimensionsRef = useRef({ width: 800, height: 600 });
  const waveRangeRef = useRef(waveRange);
  const spacingRef = useRef(spacing);
  const scrollDampingRef = useRef(scrollDamping);
  const wavePatternRef = useRef(propWavePattern);
  const maxBlurRef = useRef(maxBlur);
  const maxRotationRef = useRef(maxRotation);

  useEffect(() => {
    dimensionsRef.current = dimensions;
  }, [dimensions]);

  useEffect(() => {
    waveRangeRef.current = waveRange;
    spacingRef.current = spacing;
    scrollDampingRef.current = scrollDamping;
    wavePatternRef.current = propWavePattern;
    maxBlurRef.current = maxBlur;
    maxRotationRef.current = maxRotation;
  }, [waveRange, spacing, scrollDamping, propWavePattern, maxBlur, maxRotation]);
  
  // Animation frame reference to cancel active transitions
  const presetAnimRef = useRef<number | null>(null);



  // Cleanup active animation on unmount
  useEffect(() => {
    return () => {
      if (presetAnimRef.current !== null) {
        cancelAnimationFrame(presetAnimRef.current);
      }
    };
  }, []);

  const scrollOffsetRef = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<any>(null);
  
  // Inertia scrolling momentum refs
  const scrollVelocityRef = useRef(0);
  const isInteractingRef = useRef(false);
  const lastInteractionTimeRef = useRef(0);


  // Listen to container wheel and touch events directly for self-contained infinite scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let wheelTimeout: any = null;
    let lastTouchY = 0;
    let lastTouchTime = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const now = performance.now();
      const dt = Math.max(1, now - lastInteractionTimeRef.current) / 1000;
      lastInteractionTimeRef.current = now;
      
      isInteractingRef.current = true;
      isScrollingRef.current = true;
      
      const deltaY = e.deltaY * 0.45;
      scrollOffsetRef.current += deltaY;
      
      const instantVelocity = deltaY / dt;
      // Cap maximum velocity to prevent chaotic speedups
      const cappedVelocity = Math.max(-3000, Math.min(3000, instantVelocity));
      scrollVelocityRef.current = scrollVelocityRef.current * 0.5 + cappedVelocity * 0.5;
      
      onLifecycleChange?.("buildUp");
      
      if (wheelTimeout) clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        isInteractingRef.current = false;
        isScrollingRef.current = false;
        onLifecycleChange?.("idle");
      }, 100);
    };

    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
      lastTouchTime = performance.now();
      isInteractingRef.current = true;
      isScrollingRef.current = true;
      scrollVelocityRef.current = 0; // stop ongoing spin on touch
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const now = performance.now();
      const currentY = e.touches[0].clientY;
      const deltaY = lastTouchY - currentY;
      const dt = Math.max(1, now - lastTouchTime) / 1000;
      
      scrollOffsetRef.current += deltaY * 1.5;
      
      const instantVelocity = (deltaY * 1.5) / dt;
      const cappedVelocity = Math.max(-4000, Math.min(4000, instantVelocity));
      scrollVelocityRef.current = scrollVelocityRef.current * 0.4 + cappedVelocity * 0.6;
      
      lastTouchY = currentY;
      lastTouchTime = now;
      onLifecycleChange?.("buildUp");
    };

    const handleTouchEndOrCancel = () => {
      isInteractingRef.current = false;
      isScrollingRef.current = false;
      onLifecycleChange?.("idle");
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mousePosRef.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
    };

    const handlePointerLeave = () => {
      mousePosRef.current = { x: 0, y: 0 };
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEndOrCancel, { passive: true });
    container.addEventListener("touchcancel", handleTouchEndOrCancel, { passive: true });
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEndOrCancel);
      container.removeEventListener("touchcancel", handleTouchEndOrCancel);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, [onLifecycleChange]);

  // Handle ResizeObserver measurements
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width || 800,
          height: entry.contentRect.height || 600,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Animation ticker loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      
      if (!isInteractingRef.current) {
        // Friction decay of momentum (slower decay = heavier glide)
        scrollVelocityRef.current *= Math.exp(-1.3 * dt);
        if (Math.abs(scrollVelocityRef.current) < 5) {
          scrollVelocityRef.current = 0;
        }
        scrollOffsetRef.current += scrollVelocityRef.current * dt;
      }
      
      // Calculate effective rate based on scrollDampingRef (range 0.01 to 0.30)
      const rawDamp = scrollDampingRef.current;
      const effectiveRate = Math.min(0.50, Math.max(0.005, rawDamp));

      // Cap target scrollOffset buffer to absorb rapid wheel spikes
      const maxOffsetBuffer = spacingRef.current * 4.0;
      if (scrollOffsetRef.current > smoothOffsetRef.current + maxOffsetBuffer) {
        scrollOffsetRef.current = smoothOffsetRef.current + maxOffsetBuffer;
      } else if (scrollOffsetRef.current < smoothOffsetRef.current - maxOffsetBuffer) {
        scrollOffsetRef.current = smoothOffsetRef.current - maxOffsetBuffer;
      }

      // Left column interpolation with generous velocity cap for responsive buttery motion
      const diff = scrollOffsetRef.current - smoothOffsetRef.current;
      if (Math.abs(diff) < 0.05) {
        smoothOffsetRef.current = scrollOffsetRef.current;
      } else {
        const rawStep = diff * (1 - Math.pow(1 - effectiveRate, dt * 60));
        const maxPixelsPerFrame = Math.max(12.0, effectiveRate * 120.0);
        const clampedStep = Math.max(-maxPixelsPerFrame, Math.min(maxPixelsPerFrame, rawStep));
        smoothOffsetRef.current += clampedStep;
      }

      // Right column interpolation with generous velocity cap
      const rightRate = Math.max(0.001, effectiveRate * (1.0 - BAKED_COLUMN_LAG * 0.5));
      const diffRight = scrollOffsetRef.current - smoothOffsetRightRef.current;
      if (Math.abs(diffRight) < 0.05) {
        smoothOffsetRightRef.current = scrollOffsetRef.current;
      } else {
        const rawRightStep = diffRight * (1 - Math.pow(1 - rightRate, dt * 60));
        const maxRightPixels = Math.max(12.0, rightRate * 120.0);
        const clampedRightStep = Math.max(-maxRightPixels, Math.min(maxRightPixels, rawRightStep));
        smoothOffsetRightRef.current += clampedRightStep;
      }

      // Smooth LERP mouse movement (subtle magnetic floating offset)
      smoothMouseRef.current.x += (mousePosRef.current.x - smoothMouseRef.current.x) * 0.05;
      smoothMouseRef.current.y += (mousePosRef.current.y - smoothMouseRef.current.y) * 0.05;

      const mouseXPx = smoothMouseRef.current.x * 10;
      const mouseYPx = smoothMouseRef.current.y * 10;

      // Apply physical velocity squeeze and mouse parallax on center image frame
      const velMag = Math.min(1.0, Math.abs(scrollVelocityRef.current) / 2500);
      const velScale = 1.0 - velMag * 0.035 * BAKED_VELOCITY_SQUEEZE;
      if (centerImageFrameRef.current) {
        centerImageFrameRef.current.style.transform = `translate3d(calc(-50% + ${mouseXPx.toFixed(1)}px), calc(-50% + ${mouseYPx.toFixed(1)}px), 0) scale(${velScale.toFixed(4)})`;
      }

      const H = dimensionsRef.current.height;
      const W = dimensionsRef.current.width;
      const computedWaveRange = (170 + (Math.max(170, W / 2 - pinchX - 120) - 170) * BAKED_CORNER_ALIGNMENT) * (waveRangeRef.current / 100);

      const mouseContainerX = (smoothMouseRef.current.x * W / 2) + W / 2;
      const mouseContainerY = (smoothMouseRef.current.y * H / 2) + H / 2;

      let minDistance = Infinity;
      let closestIndex = 0;

      // Update DOM position styles directly
      for (let originalIdx = 0; originalIdx < displayItems.length; originalIdx++) {
        const el = itemRefs.current[originalIdx];
        if (!el) continue;

        const isLeft = originalIdx % 2 === 0;
        const k = Math.floor(originalIdx / 2);
        
        const totalSpan = (isLeft ? leftColumnItems.length : rightColumnItems.length) * spacingRef.current;
        let offset = 0;
        if (isLeft) {
          offset = k * spacingRef.current - smoothOffsetRef.current;
        } else {
          offset = (k + 0.5) * spacingRef.current + smoothOffsetRightRef.current;
        }

        const wrappedOffset = (((offset + totalSpan / 2) % totalSpan + totalSpan) % totalSpan) - totalSpan / 2;
        const y = H / 2 - itemHeight / 2 + wrappedOffset;

        // Viewport Culling (ponytail performance fix): Hide offscreen DOM items to lock 60-120fps
        if (y < -90 || y > H + 90) {
          el.style.display = "none";
          continue;
        }
        el.style.display = "block";

        const centerY = H / 2;
        const itemCenterY = y + itemHeight / 2;
        const distToCenter = Math.abs(itemCenterY - centerY);
        const normalizedDist = Math.min(1.0, distToCenter / (H / 2 || 1));
        const centerWeight = Math.pow(Math.cos(normalizedDist * Math.PI * 0.5), 1.8);

        const normY = (y - H / 2) / (H / 2 || 1);
        
        let baseHorizontalOffset = 0;
        let baseAngle = 0;

        if (wavePatternRef.current === "iris") {
          // 1. Aperture Iris: Spherical lens gate expanding around central cover image
          const irisLens = Math.sin(normalizedDist * Math.PI * 0.5);
          const irisOffset = (1.0 - irisLens * BAKED_IRIS_CURVATURE) * computedWaveRange * 0.9;
          baseHorizontalOffset = pinchX + irisOffset;
          baseAngle = normY * maxRotationRef.current * (isLeft ? -1 : 1);
        } else if (wavePatternRef.current === "horizon") {
          // 2. Split Horizon: Inverted asymmetrical diagonal slope framing center photo
          const leftSlope = (1.0 - normY) * BAKED_HORIZON_CURVATURE * 0.5;
          const rightSlope = (1.0 + normY) * BAKED_HORIZON_CURVATURE * 0.5;
          baseHorizontalOffset = pinchX + (isLeft ? leftSlope : rightSlope) * computedWaveRange * 0.9;
          baseAngle = (isLeft ? -1 : 1) * normY * maxRotationRef.current * 0.8;
        } else if (wavePatternRef.current === "dualSine") {
          // 3. Sine Wave: Valentin Descombes Codrops Dual Wave Sine Path Formula
          const sineWaveVal = Math.sin(normY * BAKED_DUAL_SINE_WAVENUM * Math.PI * 2.0);
          const waveOffset = sineWaveVal * waveRangeRef.current;
          baseHorizontalOffset = pinchX + (isLeft ? -waveOffset : waveOffset);
          baseAngle = Math.cos(normY * BAKED_DUAL_SINE_WAVENUM * Math.PI * 2.0) * maxRotationRef.current * (isLeft ? -1 : 1);
        } else {
          // 4. Hourglass Pinch: Clean ergonomic center focus
          const triangleProfile = normalizedDist;
          const hemisphereProfile = 1.0 - Math.sqrt(Math.max(0, 1.0 - normalizedDist * normalizedDist));
          const blendedProfile = (1.0 - BAKED_HOURGLASS_CURVATURE) * triangleProfile + BAKED_HOURGLASS_CURVATURE * hemisphereProfile;
          baseHorizontalOffset = pinchX + blendedProfile * computedWaveRange;
          baseAngle = (isLeft ? -1 : 1) * (y - H / 2) / (H / 2 || 1) * maxRotationRef.current;
        }

        // Keep track of the item closest to center
        if (distToCenter < minDistance) {
          minDistance = distToCenter;
          closestIndex = originalIdx;
        }

        // Calculate item position relative to cursor for Gravitational Wave Lens
        const itemX = isLeft ? (W / 2 - baseHorizontalOffset) : (W / 2 + baseHorizontalOffset);
        const itemY = y + itemHeight / 2;

        const dx = mouseContainerX - itemX;
        const dy = mouseContainerY - itemY;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        
        // Gaussian bell-curve falloff around cursor location (radius: 140px)
        const gaussianFocus = Math.exp(-(distToMouse * distToMouse) / (2 * 140 * 140));

        // Gravitational Wave Lens offset (text gracefully bulges outward near cursor)
        const mouseLensOffset = gaussianFocus * 18;

        // Subtle directional tilt towards cursor
        const mouseTiltAngle = (dy / (distToMouse || 1)) * gaussianFocus * (isLeft ? -8 : 8);
        const totalAngle = baseAngle + mouseTiltAngle;
        
        // Continuous organic bell-curve weight centered at viewport middle
        const totalHighlight = Math.min(1.0, centerWeight + gaussianFocus * 0.65);
        
        // Smooth edge fade out at extreme top/bottom bounds so items don't pop
        const edgeFade = normalizedDist > 0.85 ? Math.max(0, (1.0 - normalizedDist) / 0.15) : 1.0;
        const opacity = Math.min(1.0, (0.05 + centerWeight * 0.95 + gaussianFocus * 0.35) * edgeFade);
        
        // Smooth progressive blur ramping up with distance from center
        const blurFactor = Math.pow(normalizedDist, 1.5) * (1.0 - gaussianFocus * 0.8);
        const blurAmount = Math.max(0, blurFactor * maxBlurRef.current);

        // Kinetic velocity shear: slants text along scroll vector during rapid movement
        const velShear = (scrollVelocityRef.current / 2000) * (isLeft ? -1 : 1);
        const cappedSkew = Math.max(-6, Math.min(6, velShear * 8));

        const effectiveHorizontalOffset = baseHorizontalOffset + mouseLensOffset;

        // Mutate transform and styles directly on the DOM node for 60fps performance
        el.style.transform = isLeft
          ? `translate3d(calc(-100% - ${effectiveHorizontalOffset.toFixed(1)}px), ${y.toFixed(1)}px, 0) rotate(${totalAngle.toFixed(1)}deg) skewY(${cappedSkew.toFixed(2)}deg)`
          : `translate3d(${effectiveHorizontalOffset.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${totalAngle.toFixed(1)}deg) skewY(${cappedSkew.toFixed(2)}deg)`;

        el.style.opacity = opacity.toFixed(3);
        // GPU Shader Pass Bypass: Skip blur filter when negligible to eliminate GPU overhead
        el.style.filter = blurAmount > 0.15 ? `blur(${blurAmount.toFixed(1)}px)` : "none";

        const textSpan = el.firstElementChild as HTMLElement;
        if (textSpan) {
          // Continuous scale, letter-spacing, and luminance interpolation driven by totalHighlight
          const textLuma = Math.round(115 + totalHighlight * 140);
          const textScale = 1.0 + totalHighlight * 0.09;
          const letterSpacing = totalHighlight * 0.065;

          textSpan.style.color = `rgb(${textLuma}, ${textLuma}, ${textLuma})`;
          textSpan.style.letterSpacing = `${letterSpacing.toFixed(3)}em`;
          textSpan.style.transform = `scale(${textScale.toFixed(3)})`;
          textSpan.style.display = "inline-block";
          textSpan.style.transformOrigin = isLeft ? "right center" : "left center";
        }
      }

      // Update activeIdxRef ONLY on item boundaries to trigger center image crossfade
      if (closestIndex !== activeIdxRef.current) {
        activeIdxRef.current = closestIndex;
      }

      // Update activeImageIdx state ONLY on image index boundaries to trigger Framer Motion transition
      const imgCount = displayItems.length;
      const calculatedImageIdx = (((Math.floor(smoothOffsetRef.current / spacingRef.current) % imgCount) + imgCount) % imgCount);
      if (calculatedImageIdx !== activeImageIdxRef.current) {
        activeImageIdxRef.current = calculatedImageIdx;
        setActiveImageIdx(calculatedImageIdx);
      }
      
      animationFrameId = requestAnimationFrame(tick);
    };
    
    animationFrameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const displayItems = items && items.length > 0 ? items : [...DEFAULT_ITEMS, ...DEFAULT_ITEMS];
  const leftColumnItems = displayItems.filter((_, idx) => idx % 2 === 0);
  const rightColumnItems = displayItems.filter((_, idx) => idx % 2 !== 0);

  const itemHeight = 36;
  // Center image bounds to calculate precise inward pinch position
  const imageWidth = isFullscreen ? 240 : 180;
  const imageHeight = isFullscreen ? 320 : 240;
  const gapFromImage = 32; // Horizontal padding at the pinch point
  const pinchX = imageWidth / 2 + gapFromImage; // Base horizontal distance from container center

  const activeImage = displayItems[activeImageIdx]?.imageSrc || imageSrc || displayItems[0].imageSrc;

  const jumpToItem = (originalIdx: number, isLeft: boolean, k: number) => {
    const colCount = isLeft ? leftColumnItems.length : rightColumnItems.length;
    const totalSpan = colCount * spacingRef.current;
    if (totalSpan <= 0) return;
    
    const rawTarget = isLeft ? (k * spacingRef.current) : (-(k + 0.5) * spacingRef.current);
    
    // Shortest path delta modulo totalSpan
    let diff = (rawTarget - scrollOffsetRef.current) % totalSpan;
    if (diff > totalSpan / 2) diff -= totalSpan;
    if (diff < -totalSpan / 2) diff += totalSpan;

    scrollOffsetRef.current += diff;
    activeIdxRef.current = originalIdx;
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 select-none overflow-hidden ${className}`}
      style={{
        backgroundColor: "#000000",
        ...style,
      }}
    >
      {/* ─── HOURGLASS / TRIANGLE LAYOUT VIEWPORT ─── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        
        {/* LEFT COLUMN (Right-aligned relative to center axis) */}
        {leftColumnItems.map((item, k) => {
          const originalIdx = k * 2;
          
          return (
            <div
              key={`${item.id}-${originalIdx}`}
              ref={(el) => { itemRefs.current[originalIdx] = el; }}
              className="absolute flex items-center justify-end select-none pointer-events-auto cursor-pointer"
              style={{
                top: 0,
                left: "50%",
                height: `${itemHeight}px`,
                transform: "translate3d(-100%, 0, 0)",
                opacity: 0,
                willChange: "transform, opacity, filter",
              }}
              onClick={() => jumpToItem(originalIdx, true, k)}
            >
              <span
                className="uppercase leading-none"
                style={{
                  fontFamily: resolvedFontFamily,
                  fontWeight: 200,
                  fontStyle: resolvedFontStyle,
                  fontSize: isFullscreen ? "clamp(1.2rem, 2.8vw, 2.2rem)" : "clamp(1.0rem, 2.0vw, 1.6rem)",
                }}
              >
                {item.name}
              </span>
            </div>
          );
        })}

        {/* CENTER IMAGE BLOCK (Centered viewport block) */}
        <div 
          ref={centerImageFrameRef}
          className="absolute pointer-events-auto overflow-hidden bg-black rounded-[2px]"
          style={{
            top: "50%",
            left: "50%",
            width: `${imageWidth}px`,
            height: `${imageHeight}px`,
            transform: "translate3d(-50%, -50%, 0)",
            boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.85)",
            willChange: "transform",
            zIndex: 10,
          }}
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeImageIdx}
              initial={{ opacity: 0, scale: 0.94, y: scrollVelocityRef.current >= 0 ? 14 : -14 }}
              animate={{ opacity: 1, scale: 1.0, y: 0 }}
              exit={{ opacity: 0, scale: 1.04, y: scrollVelocityRef.current >= 0 ? -14 : 14 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={encodeURI(activeImage)}
                alt={displayItems[activeImageIdx]?.name}
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN (Left-aligned relative to center axis) */}
        {rightColumnItems.map((item, k) => {
          const originalIdx = k * 2 + 1;
          
          return (
            <div
              key={`${item.id}-${originalIdx}`}
              ref={(el) => { itemRefs.current[originalIdx] = el; }}
              className="absolute flex items-center justify-start select-none pointer-events-auto cursor-pointer"
              style={{
                top: 0,
                left: "50%",
                height: `${itemHeight}px`,
                transform: "translate3d(0, 0, 0)",
                opacity: 0,
                willChange: "transform, opacity, filter",
              }}
              onClick={() => jumpToItem(originalIdx, false, k)}
            >
              <span
                className="uppercase leading-none"
                style={{
                  fontFamily: resolvedFontFamily,
                  fontWeight: 200,
                  fontStyle: resolvedFontStyle,
                  fontSize: isFullscreen ? "clamp(1.2rem, 2.8vw, 2.2rem)" : "clamp(1.0rem, 2.0vw, 1.6rem)",
                }}
              >
                {item.name}
              </span>
            </div>
          );
        })}

        {/* TOP & BOTTOM EXACT PROGRESSIVE BLUR OVERLAYS */}
        {maxBlur > 0.1 && (
          <>
            {/* Top Progressive Blur (Masked to bottom) */}
            <div
              className="absolute inset-x-0 top-0 pointer-events-none z-30 overflow-hidden"
              style={{ height: `${Math.max(60, Math.min(220, maxBlur * 36))}px` }}
            >
              <div
                className="absolute inset-0 pointer-events-none z-[1]"
                style={{
                  backdropFilter: `blur(${0.078125 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${0.078125 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to bottom, transparent 87.5%, #000 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 87.5%, #000 100%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none z-[2]"
                style={{
                  backdropFilter: `blur(${0.15625 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${0.15625 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to bottom, transparent 75%, #000 87.5% 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 75%, #000 87.5% 100%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none z-[3]"
                style={{
                  backdropFilter: `blur(${0.3125 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${0.3125 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to bottom, transparent 62.5%, #000 75% 87.5%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 62.5%, #000 75% 87.5%, transparent 100%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none z-[4]"
                style={{
                  backdropFilter: `blur(${0.625 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${0.625 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to bottom, transparent 50%, #000 62.5% 75%, transparent 87.5%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 50%, #000 62.5% 75%, transparent 87.5%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none z-[5]"
                style={{
                  backdropFilter: `blur(${1.25 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${1.25 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to bottom, transparent 37.5%, #000 50% 62.5%, transparent 75%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 37.5%, #000 50% 62.5%, transparent 75%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none z-[6]"
                style={{
                  backdropFilter: `blur(${2.5 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${2.5 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to bottom, transparent 25%, #000 37.5% 50%, transparent 62.5%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 25%, #000 37.5% 50%, transparent 62.5%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none z-[7]"
                style={{
                  backdropFilter: `blur(${5.0 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${5.0 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to bottom, transparent 12.5%, #000 25% 37.5%, transparent 50%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 12.5%, #000 25% 37.5%, transparent 50%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none z-[8]"
                style={{
                  backdropFilter: `blur(${10.0 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${10.0 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to bottom, transparent 0%, #000 12.5% 25%, transparent 37.5%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 12.5% 25%, transparent 37.5%)",
                }}
              />
            </div>

            {/* Bottom Progressive Blur (Masked to top) */}
            <div
              className="absolute inset-x-0 bottom-0 pointer-events-none z-30 overflow-hidden"
              style={{ height: `${Math.max(60, Math.min(220, maxBlur * 36))}px` }}
            >
              <div
                className="absolute inset-0 pointer-events-none z-[1]"
                style={{
                  backdropFilter: `blur(${0.078125 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${0.078125 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to top, transparent 87.5%, #000 100%)",
                  WebkitMaskImage: "linear-gradient(to top, transparent 87.5%, #000 100%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none z-[2]"
                style={{
                  backdropFilter: `blur(${0.15625 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${0.15625 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to top, transparent 75%, #000 87.5% 100%)",
                  WebkitMaskImage: "linear-gradient(to top, transparent 75%, #000 87.5% 100%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none z-[3]"
                style={{
                  backdropFilter: `blur(${0.3125 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${0.3125 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to top, transparent 62.5%, #000 75% 87.5%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to top, transparent 62.5%, #000 75% 87.5%, transparent 100%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none z-[4]"
                style={{
                  backdropFilter: `blur(${0.625 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${0.625 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to top, transparent 50%, #000 62.5% 75%, transparent 87.5%)",
                  WebkitMaskImage: "linear-gradient(to top, transparent 50%, #000 62.5% 75%, transparent 87.5%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none z-[5]"
                style={{
                  backdropFilter: `blur(${1.25 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${1.25 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to top, transparent 37.5%, #000 50% 62.5%, transparent 75%)",
                  WebkitMaskImage: "linear-gradient(to top, transparent 37.5%, #000 50% 62.5%, transparent 75%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none z-[6]"
                style={{
                  backdropFilter: `blur(${2.5 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${2.5 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to top, transparent 25%, #000 37.5% 50%, transparent 62.5%)",
                  WebkitMaskImage: "linear-gradient(to top, transparent 25%, #000 37.5% 50%, transparent 62.5%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none z-[7]"
                style={{
                  backdropFilter: `blur(${5.0 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${5.0 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to top, transparent 12.5%, #000 25% 37.5%, transparent 50%)",
                  WebkitMaskImage: "linear-gradient(to top, transparent 12.5%, #000 25% 37.5%, transparent 50%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none z-[8]"
                style={{
                  backdropFilter: `blur(${10.0 * (maxBlur / 2.5)}px)`,
                  WebkitBackdropFilter: `blur(${10.0 * (maxBlur / 2.5)}px)`,
                  maskImage: "linear-gradient(to top, transparent 0%, #000 12.5% 25%, transparent 37.5%)",
                  WebkitMaskImage: "linear-gradient(to top, transparent 0%, #000 12.5% 25%, transparent 37.5%)",
                }}
              />
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ApparatusDualWave;
