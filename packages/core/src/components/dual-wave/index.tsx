import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ApparatusDualWaveProps } from "./types";
import {
  DEFAULT_ITEMS,
  BAKED_HORIZON_CURVATURE,
  BAKED_CORNER_ALIGNMENT,
  BAKED_DUAL_SINE_WAVENUM,
  BAKED_COLUMN_LAG,
  BAKED_VELOCITY_SQUEEZE,
} from "./constants";

export const ApparatusDualWave: React.FC<ApparatusDualWaveProps> = ({
  items,
  imageSrc,
  fontFamily: propFontFamily,
  amplitude,
  spacing: propSpacing,
  maxBlur: propMaxBlur,
  maxRotation: propMaxRotation,
  scrollDamping: propScrollDamping,
  wavePattern: propWavePattern = "barrel",
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
  
  const displayItems = useMemo(
    () => (items && items.length > 0 ? items : [...DEFAULT_ITEMS, ...DEFAULT_ITEMS]),
    [items]
  );
  const leftColumnItems = useMemo(() => displayItems.filter((_, idx) => idx % 2 === 0), [displayItems]);
  const rightColumnItems = useMemo(() => displayItems.filter((_, idx) => idx % 2 !== 0), [displayItems]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const activeImageIdxRef = useRef(0);

  // Animation loop playheads & layout refs
  const smoothOffsetRef = useRef(0);
  const smoothOffsetRightRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const smoothMouseRef = useRef({ x: 0, y: 0 });
  const centerImageFrameRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const entranceStartTimeRef = useRef(0);
  
  const dimensionsRef = useRef({ width: 800, height: 600 });
  const isFullscreenRef = useRef(isFullscreen);
  const waveRangeRef = useRef(waveRange);
  const spacingRef = useRef(spacing);
  const scrollDampingRef = useRef(scrollDamping);
  const wavePatternRef = useRef(propWavePattern);
  const maxBlurRef = useRef(maxBlur);
  const maxRotationRef = useRef(maxRotation);

  useEffect(() => {
    isFullscreenRef.current = isFullscreen;
  }, [isFullscreen]);

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

  // Preload all unique images into browser memory to eliminate scroll decode lag
  useEffect(() => {
    displayItems.forEach((item) => {
      if (item.imageSrc) {
        const img = new Image();
        img.src = item.imageSrc;
      }
    });
  }, [displayItems]);

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
      
      const deltaY = e.deltaY * 0.22;
      scrollOffsetRef.current += deltaY;
      
      const instantVelocity = deltaY / dt;
      // Cap maximum velocity for a heavy, deliberate mechanical reel
      const cappedVelocity = Math.max(-1400, Math.min(1400, instantVelocity));
      scrollVelocityRef.current = scrollVelocityRef.current * 0.7 + cappedVelocity * 0.3;
      
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
      const dt = Math.max(1, now - lastTouchTime) / 1000;
      
      const deltaY = (lastTouchY - currentY) * 0.85;
      scrollOffsetRef.current += deltaY;
      
      const instantVelocity = deltaY / dt;
      const cappedVelocity = Math.max(-1600, Math.min(1600, instantVelocity));
      scrollVelocityRef.current = scrollVelocityRef.current * 0.6 + cappedVelocity * 0.4;
      
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
    entranceStartTimeRef.current = performance.now();
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      
      if (!isInteractingRef.current) {
        // Friction decay of momentum (weighted mechanical drag: velvety glide deceleration)
        scrollVelocityRef.current *= Math.exp(-2.2 * dt);
        if (Math.abs(scrollVelocityRef.current) < 3) {
          scrollVelocityRef.current = 0;
        }
        scrollOffsetRef.current += scrollVelocityRef.current * dt;
      }
      
      // Calculate effective rate based on scrollDampingRef (calibrated for heavy, smooth mechanical feel)
      const rawDamp = scrollDampingRef.current;
      const effectiveRate = Math.min(0.22, Math.max(0.02, rawDamp * 0.75));

      // Left column interpolation with smooth continuous decay
      const diff = scrollOffsetRef.current - smoothOffsetRef.current;
      if (Math.abs(diff) < 0.05) {
        smoothOffsetRef.current = scrollOffsetRef.current;
      } else {
        const step = diff * (1 - Math.pow(1 - effectiveRate, dt * 60));
        smoothOffsetRef.current += step;
      }

      // Right column interpolation with subtle counter-lag
      const rightRate = Math.max(0.015, effectiveRate * (1.0 - BAKED_COLUMN_LAG * 0.3));
      const diffRight = scrollOffsetRef.current - smoothOffsetRightRef.current;
      if (Math.abs(diffRight) < 0.05) {
        smoothOffsetRightRef.current = scrollOffsetRef.current;
      } else {
        const stepRight = diffRight * (1 - Math.pow(1 - rightRate, dt * 60));
        smoothOffsetRightRef.current += stepRight;
      }

      // Smooth LERP mouse movement (subtle magnetic floating offset)
      smoothMouseRef.current.x += (mousePosRef.current.x - smoothMouseRef.current.x) * 0.05;
      smoothMouseRef.current.y += (mousePosRef.current.y - smoothMouseRef.current.y) * 0.05;

      const mouseXPx = smoothMouseRef.current.x * 10;
      const mouseYPx = smoothMouseRef.current.y * 10;

      // Cinematic entrance choreography: 1600ms deliberate sweep with blank canvas start
      const entranceElapsed = now - entranceStartTimeRef.current;
      const entranceDuration = 1600;
      const entranceProg = Math.min(1.0, entranceElapsed / entranceDuration);
      // Precision cubic deceleration curve
      const entranceEase = 1 - Math.pow(1 - entranceProg, 3.2);
      const rollIn = 1.0 - entranceEase;

      // Vertical shutter curtain reveal on center card as counter-reels cross the equator
      const shutterInsetY = (rollIn * 50).toFixed(1);
      const cardOpacity = Math.min(1.0, entranceProg * 1.6).toFixed(3);

      // Apply physical velocity squeeze and mouse parallax on center image frame
      const velMag = Math.min(1.0, Math.abs(scrollVelocityRef.current) / 2500);
      const velScale = 1.0 - velMag * 0.035 * BAKED_VELOCITY_SQUEEZE;
      if (centerImageFrameRef.current) {
        centerImageFrameRef.current.style.opacity = cardOpacity;
        centerImageFrameRef.current.style.clipPath = entranceProg < 1.0 ? `inset(${shutterInsetY}% 0% ${shutterInsetY}% 0%)` : "none";
        centerImageFrameRef.current.style.transform = `translate3d(calc(-50% + ${mouseXPx.toFixed(1)}px), calc(-50% + ${mouseYPx.toFixed(1)}px), 0) scale(${velScale.toFixed(4)})`;
      }

      const H = dimensionsRef.current.height;
      const W = dimensionsRef.current.width;
      const isFs = isFullscreenRef.current;
      const curImageWidth = isFs
        ? Math.min(420, Math.max(280, Math.round(W * 0.28)))
        : Math.min(330, Math.max(240, Math.round(W * 0.24)));
      const gapFromImage = isFs ? 56 : 52;
      const pinchX = curImageWidth / 2 + gapFromImage;
      const computedWaveRange = (170 + (Math.max(170, W / 2 - pinchX - 120) - 170) * BAKED_CORNER_ALIGNMENT) * (waveRangeRef.current / 100);

      let closestIdx = activeIdxRef.current;
      let minCenterDist = Infinity;

      // Update DOM position styles directly
      for (let originalIdx = 0; originalIdx < displayItems.length; originalIdx++) {
        const el = itemRefs.current[originalIdx];
        if (!el) continue;

        const isLeft = originalIdx % 2 === 0;
        const k = Math.floor(originalIdx / 2);
        
        const totalSpan = (isLeft ? leftColumnItems.length : rightColumnItems.length) * spacingRef.current;

        // Base cyclical offset during continuous interaction
        const baseOffset = isLeft
          ? (k * spacingRef.current - smoothOffsetRef.current)
          : (k * spacingRef.current + smoothOffsetRightRef.current);

        const restingWrapped = (((baseOffset + totalSpan / 2) % totalSpan + totalSpan) % totalSpan) - totalSpan / 2;

        // Linear un-wrapped entrance sweep: screen starts 100% blank and reels sweep through
        const sweepDistance = Math.max(H * 1.15, 800);
        const entranceTravel = isLeft ? (-rollIn * sweepDistance) : (rollIn * sweepDistance);
        const wrappedOffset = restingWrapped + entranceTravel;

        let y = H / 2 - itemHeight / 2 + wrappedOffset;

        // Viewport Culling (ponytail performance fix): Allow text to stream from off-screen
        if (y < -140 || y > H + 140) {
          el.style.display = "none";
          continue;
        }
        el.style.display = "block";

        const centerY = H / 2;
        const itemCenterY = y + itemHeight / 2;
        const distToCenter = Math.abs(itemCenterY - centerY);
        const normalizedDist = Math.min(1.0, distToCenter / (H / 2 || 1));

        if (distToCenter < minCenterDist) {
          minCenterDist = distToCenter;
          closestIdx = originalIdx;
        }

        const normY = (y - H / 2) / (H / 2 || 1);
        
        let baseHorizontalOffset = 0;
        let baseAngle = 0;
        let zPos = 0;
        let pitchX = 0;

        if (wavePatternRef.current === "horizon") {
          // 1. Split Horizon: Inverted asymmetrical diagonal slope framing center photo
          const leftSlope = (1.0 - normY) * BAKED_HORIZON_CURVATURE * 0.5;
          const rightSlope = (1.0 + normY) * BAKED_HORIZON_CURVATURE * 0.5;
          baseHorizontalOffset = pinchX + (isLeft ? leftSlope : rightSlope) * computedWaveRange * 0.9;
          baseAngle = (isLeft ? -1 : 1) * normY * maxRotationRef.current * 0.8;
        } else if (wavePatternRef.current === "dualSine") {
          // 2. Sine Wave: Valentin Descombes Codrops Dual Wave Sine Path Formula
          const sineWaveVal = Math.sin(normY * BAKED_DUAL_SINE_WAVENUM * Math.PI * 2.0);
          const waveOffset = sineWaveVal * waveRangeRef.current;
          baseHorizontalOffset = pinchX + (isLeft ? -waveOffset : waveOffset);
          baseAngle = Math.cos(normY * BAKED_DUAL_SINE_WAVENUM * Math.PI * 2.0) * maxRotationRef.current * (isLeft ? -1 : 1);
        } else {
          // 3. Cylindrical 3D Barrel Drum (Default): Expanded radius streams text continuously off-screen
          const cylinderRadius = Math.max(480, H * 0.72);
          const theta = wrappedOffset / cylinderRadius;
          
          y = H / 2 - itemHeight / 2 + Math.sin(theta) * cylinderRadius;
          zPos = (Math.cos(theta) - 1.0) * cylinderRadius * 0.75;
          pitchX = (-theta * 180 / Math.PI) * (maxRotationRef.current / 8.5);
          
          const barrelFlare = (1.0 - Math.cos(theta)) * (waveRangeRef.current * 0.55);
          baseHorizontalOffset = pinchX + barrelFlare;
          baseAngle = Math.sin(theta) * maxRotationRef.current * (isLeft ? -0.3 : 0.3);
        }

      const nowMs = performance.now();
      const ambientDrift = Math.sin(nowMs * 0.0018) * 1.8;
      const mouseContainerX = (smoothMouseRef.current.x * W / 2) + W / 2;
      const mouseContainerY = (smoothMouseRef.current.y * H / 2) + H / 2;

      // Sharp center crosshair focus (tight Gaussian curve focused at exact vertical middle)
      const centerFocus = Math.exp(-Math.pow(distToCenter / 45, 2));
      
      // Base opacity: readable text right up to viewport boundary, fading only at very perimeter
      const edgeFade = normalizedDist > 0.95 ? Math.max(0, (1.0 - normalizedDist) / 0.05) : 1.0;
      const opacity = Math.min(1.0, (0.35 + centerFocus * 0.65) * edgeFade);
      
      // Progressive blur only at extreme edges (normalizedDist > 0.38)
      const blurFactor = Math.pow(Math.max(0, (normalizedDist - 0.38) / 0.62), 2.0);
      const blurAmount = Math.max(0, blurFactor * maxBlurRef.current * 1.5);

      // Kinetic velocity shear: subtle text slant along scroll vector during rapid movement
      const velShear = (scrollVelocityRef.current / 2000) * (isLeft ? -1 : 1);
      const cappedSkew = Math.max(-5, Math.min(5, velShear * 6));

      // Calculate cursor proximity for restrained embossed depth lift
      const itemX = isLeft ? (W / 2 - baseHorizontalOffset) : (W / 2 + baseHorizontalOffset);
      const itemY = y + itemHeight / 2;
      const dx = mouseContainerX - itemX;
      const dy = mouseContainerY - itemY;
      const distToMouse = Math.sqrt(dx * dx + dy * dy);
      const hoverProximity = Math.exp(-(distToMouse * distToMouse) / (2 * 120 * 120));
      const hoverZ = hoverProximity * 16;
      const effectiveZ = zPos + hoverZ;

      // Stable authored cylindrical barrel position with ambient breathing and subtle forward lift
      const renderedY = y + ambientDrift;
      el.style.transform = isLeft
        ? `translate3d(calc(-100% - ${baseHorizontalOffset.toFixed(1)}px), ${renderedY.toFixed(1)}px, ${effectiveZ.toFixed(1)}px) rotateX(${pitchX.toFixed(2)}deg) rotate(${baseAngle.toFixed(1)}deg) skewY(${cappedSkew.toFixed(2)}deg)`
        : `translate3d(${baseHorizontalOffset.toFixed(1)}px, ${renderedY.toFixed(1)}px, ${effectiveZ.toFixed(1)}px) rotateX(${pitchX.toFixed(2)}deg) rotate(${baseAngle.toFixed(1)}deg) skewY(${cappedSkew.toFixed(2)}deg)`;

      el.style.opacity = Math.min(1.0, opacity + hoverProximity * 0.25).toFixed(3);
      // GPU Shader Pass Bypass: Skip blur filter when negligible to eliminate GPU overhead
      el.style.filter = blurAmount > 0.15 ? `blur(${blurAmount.toFixed(1)}px)` : "none";

      const textSpan = el.firstElementChild as HTMLElement;
      if (textSpan) {
        // Off-center text is muted silver, center active & hover catch light up to pure #ffffff
        const textLuma = Math.min(255, Math.round(135 + centerFocus * 120 + hoverProximity * 40));
        textSpan.style.color = `rgb(${textLuma}, ${textLuma}, ${textLuma})`;
      }
    }

      // Update active image smoothly on center crossing without double-buffer collision
      if (closestIdx >= 0 && closestIdx < displayItems.length) {
        if (closestIdx !== activeImageIdxRef.current && (minCenterDist < 55 || Math.abs(scrollVelocityRef.current) > 80)) {
          activeImageIdxRef.current = closestIdx;
          setActiveImageIdx(closestIdx);
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };
    
    animationFrameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [displayItems, imageSrc]);

  const itemHeight = 36;
  // Center image bounds to calculate precise inward pinch position
  const imageWidth = isFullscreen
    ? Math.min(420, Math.max(280, Math.round(dimensions.width * 0.28)))
    : Math.min(330, Math.max(240, Math.round(dimensions.width * 0.24)));
  const imageHeight = Math.round(imageWidth * 1.34);

  const jumpToItem = (originalIdx: number, isLeft: boolean, k: number) => {
    const colCount = isLeft ? leftColumnItems.length : rightColumnItems.length;
    const totalSpan = colCount * spacingRef.current;
    if (totalSpan <= 0) return;
    
    const rawTarget = isLeft ? (k * spacingRef.current) : (-k * spacingRef.current);
    
    // Shortest path delta modulo totalSpan
    let diff = (rawTarget - scrollOffsetRef.current) % totalSpan;
    if (diff > totalSpan / 2) diff -= totalSpan;
    if (diff < -totalSpan / 2) diff += totalSpan;

    if (Math.abs(diff) < 0.5) return;

    if (presetAnimRef.current !== null) {
      cancelAnimationFrame(presetAnimRef.current);
      presetAnimRef.current = null;
    }

    const startOffset = scrollOffsetRef.current;
    const targetOffset = startOffset + diff;
    const startTime = performance.now();
    const travelDist = Math.abs(diff);
    // Dynamic weighted duration: 550ms base + scaled up to 880ms for large arcs
    const duration = Math.min(880, Math.max(550, 480 + (travelDist / totalSpan) * 650));

    const animateArrival = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      // Precision mechanical curve: swift initial impulse, weighted deceleration into center notch
      const ease = 1 - Math.pow(1 - progress, 3.8);
      scrollOffsetRef.current = startOffset + diff * ease;

      // Realistic kinetic velocity to drive optical depth in sync with wheel transit
      const remainingProgress = 1.0 - progress;
      scrollVelocityRef.current = (diff / duration) * remainingProgress * 750;

      if (progress < 1.0) {
        presetAnimRef.current = requestAnimationFrame(animateArrival);
      } else {
        scrollOffsetRef.current = targetOffset;
        scrollVelocityRef.current = 0;
        presetAnimRef.current = null;
      }
    };

    presetAnimRef.current = requestAnimationFrame(animateArrival);
    activeIdxRef.current = originalIdx;
    activeImageIdxRef.current = originalIdx;
    setActiveImageIdx(originalIdx);
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
      {/* ─── 3D BARREL & HOURGLASS VIEWPORT ─── */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
        }}
      >
        
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

        {/* CENTER IMAGE BLOCK: CLEAN HARDWARE-ACCELERATED TRANSITION */}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1.0 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={encodeURI(displayItems[activeImageIdx]?.imageSrc || imageSrc || "")}
                alt={displayItems[activeImageIdx]?.name || "Active item"}
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
