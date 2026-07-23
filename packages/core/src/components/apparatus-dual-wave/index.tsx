import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ApparatusDualWaveProps, DualWaveItem } from "./types";

// Full list of 24 premium specimen names matching cosmos images
const DEFAULT_ITEMS: DualWaveItem[] = [
  { id: "01", name: "AÉTHYR • 1", imageSrc: "/images/components images/scroll/cosmos_1309660817.jpeg" },
  { id: "02", name: "MÉLANCØLIE", imageSrc: "/images/components images/scroll/cosmos_1859262512.jpeg" },
  { id: "03", name: "BASALT DUST", imageSrc: "/images/components images/scroll/cosmos_2063063057.jpeg" },
  { id: "04", name: "COPPER SHARD", imageSrc: "/images/components images/scroll/cosmos_679994644.jpeg" },
  { id: "05", name: "HÉLIØS • †", imageSrc: "/images/components images/scroll/cosmos_1244425812.jpeg" },
  { id: "06", name: "ÉPHÉMÈRE", imageSrc: "/images/components images/scroll/cosmos_1994819013.jpeg" },
  { id: "07", name: "AMPHORA", imageSrc: "/images/components images/scroll/cosmos_2086495860.jpeg" },
  { id: "08", name: "VELOCITY", imageSrc: "/images/components images/scroll/cosmos_51259133.jpeg" },
  { id: "09", name: "BRÛLÉE • §", imageSrc: "/images/components images/scroll/cosmos_586109684.jpeg" },
  { id: "10", name: "SØLSTICE *", imageSrc: "/images/components images/scroll/cosmos_1452408749.jpeg" },
  { id: "11", name: "LATTICE VOID", imageSrc: "/images/components images/scroll/cosmos_1298955025.jpeg" },
  { id: "12", name: "SILVER SILK", imageSrc: "/images/components images/scroll/cosmos_2093433371.jpeg" },
  { id: "13", name: "NÉBULÆ", imageSrc: "/images/components images/scroll/cosmos_520815919.jpeg" },
  { id: "14", name: "APØCRYPHA • ‡", imageSrc: "/images/components images/scroll/cosmos_666194661.jpeg" },
  { id: "15", name: "LITHIC EDGE", imageSrc: "/images/components images/scroll/cosmos_961582572.jpeg" },
  { id: "16", name: "MONOCHROME", imageSrc: "/images/components images/scroll/cosmos_1067833670.jpeg" },
  { id: "17", name: "ŒUVRE", imageSrc: "/images/components images/scroll/cosmos_1207399578.jpeg" },
  { id: "18", name: "SILICÆ *", imageSrc: "/images/components images/scroll/cosmos_1215932660.jpeg" },
  { id: "19", name: "RESONANCE", imageSrc: "/images/components images/scroll/cosmos_169178344.jpeg" },
  { id: "20", name: "SPECTRA", imageSrc: "/images/components images/scroll/cosmos_496247602.jpeg" },
  { id: "21", name: "CÉLESTIA • 5", imageSrc: "/images/components images/scroll/cosmos_1225764898.jpeg" },
  { id: "22", name: "VÉRTIGØ • ‡", imageSrc: "/images/components images/scroll/cosmos_1556080729.jpeg" },
  { id: "23", name: "GOSSAMER", imageSrc: "/images/components images/scroll/cosmos_1633231397.jpeg" },
  { id: "24", name: "STELLAR FLOW", imageSrc: "/images/components images/scroll/cosmos_1872135509.jpeg" },
];

export const ApparatusDualWave: React.FC<ApparatusDualWaveProps & {
  frequency?: number;
  amplitude?: number;
  waveNum?: number;
  spacing?: number;
  maxBlur?: number;
  maxRotation?: number;
  cornerAlignment?: number;
}> = ({
  items,
  imageSrc,
  frequency,
  amplitude,
  waveNum: propWaveNum,
  spacing: propSpacing,
  maxBlur: propMaxBlur,
  maxRotation: propMaxRotation,
  cornerAlignment: propCornerAlignment,
  className = "",
  style,
  onLifecycleChange,
  isFullscreen = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Size bounds
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  
  // Interactive tuning controls derived from props
  const cornerAlignment = propCornerAlignment !== undefined ? propCornerAlignment : 1.0;
  const waveRange = amplitude !== undefined ? (amplitude / 60) * 100 : 100;
  const waveSpeed = frequency !== undefined ? frequency / 2 : 1.0;
  const waveNum = propWaveNum !== undefined ? propWaveNum : 0.45;
  const spacing = propSpacing !== undefined ? propSpacing : 65;
  const curvature = 0.0;
  const maxBlur = propMaxBlur !== undefined ? propMaxBlur : 3.0;
  const maxRotation = propMaxRotation !== undefined ? propMaxRotation : 8.0;
  
  // Animation loop playheads & layout refs
  const smoothOffsetRef = useRef(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const activeImageIdxRef = useRef(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const dimensionsRef = useRef({ width: 800, height: 600 });
  const cornerAlignmentRef = useRef(cornerAlignment);
  const waveRangeRef = useRef(waveRange);
  const waveSpeedRef = useRef(waveSpeed);
  const waveNumRef = useRef(waveNum);
  const spacingRef = useRef(spacing);
  const curvatureRef = useRef(curvature);
  const maxBlurRef = useRef(maxBlur);
  const maxRotationRef = useRef(maxRotation);

  useEffect(() => {
    dimensionsRef.current = dimensions;
  }, [dimensions]);

  useEffect(() => {
    cornerAlignmentRef.current = cornerAlignment;
    waveRangeRef.current = waveRange;
    waveSpeedRef.current = waveSpeed;
    waveNumRef.current = waveNum;
    spacingRef.current = spacing;
    curvatureRef.current = curvature;
    maxBlurRef.current = maxBlur;
    maxRotationRef.current = maxRotation;
  }, [cornerAlignment, waveRange, waveSpeed, waveNum, spacing, curvature, maxBlur, maxRotation]);
  
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

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEndOrCancel, { passive: true });
    container.addEventListener("touchcancel", handleTouchEndOrCancel, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEndOrCancel);
      container.removeEventListener("touchcancel", handleTouchEndOrCancel);
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
      
      // Target scroll chasing interpolation (Lenis Smooth scroll effect with heavy weight)
      const diff = scrollOffsetRef.current - smoothOffsetRef.current;
      if (Math.abs(diff) < 0.05) {
        smoothOffsetRef.current = scrollOffsetRef.current;
      } else {
        smoothOffsetRef.current += diff * (1 - Math.pow(1 - 0.04, dt * 60));
      }

      const H = dimensionsRef.current.height;
      const W = dimensionsRef.current.width;
      const computedWaveRange = (170 + (Math.max(170, W / 2 - pinchX - 120) - 170) * cornerAlignmentRef.current) * (waveRangeRef.current / 100);

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
          offset = (k + 0.5) * spacingRef.current + smoothOffsetRef.current;
        }

        const wrappedOffset = (((offset + totalSpan / 2) % totalSpan + totalSpan) % totalSpan) - totalSpan / 2;
        const y = H / 2 - itemHeight / 2 + wrappedOffset;

        const centerY = H / 2;
        const itemCenterY = y + itemHeight / 2;
        const distToCenter = Math.abs(itemCenterY - centerY);
        const normalizedDist = Math.min(1.0, distToCenter / (H / 2 || 1));

        // Interpolate profile between linear triangle (0.0) and hemisphere circular arc (1.0)
        const triangleProfile = normalizedDist;
        const hemisphereProfile = 1.0 - Math.sqrt(Math.max(0, 1.0 - normalizedDist * normalizedDist));
        const blendedProfile = (1.0 - curvatureRef.current) * triangleProfile + curvatureRef.current * hemisphereProfile;

        const baseHorizontalOffset = pinchX + blendedProfile * computedWaveRange;

        // Keep track of the item closest to center
        if (distToCenter < minDistance) {
          minDistance = distToCenter;
          closestIndex = originalIdx;
        }

        const angle = (isLeft ? -1 : 1) * (y - H / 2) / (H / 2 || 1) * maxRotationRef.current;
        const blurAmount = (originalIdx === activeIdxRef.current) ? 0 : normalizedDist * maxBlurRef.current;
        const opacity = (originalIdx === activeIdxRef.current) ? 1.0 : Math.max(0.08, 0.65 - normalizedDist * 0.85);

        // Mutate styles directly on the DOM node
        el.style.transform = isLeft
          ? `translate3d(calc(-100% - ${baseHorizontalOffset}px), ${y}px, 0) rotate(${angle.toFixed(1)}deg)`
          : `translate3d(${baseHorizontalOffset}px, ${y}px, 0) rotate(${angle.toFixed(1)}deg)`;

        el.style.opacity = String(opacity);
        el.style.filter = `blur(${blurAmount.toFixed(2)}px)`;

        const textSpan = el.firstElementChild as HTMLElement;
        if (textSpan) {
          if (originalIdx === activeIdxRef.current) {
            textSpan.style.color = "white";
          } else {
            textSpan.style.color = "#737373"; // text-neutral-500
          }
        }
      }

      // Update activeIdx state ONLY on item boundaries to trigger center image crossfade
      if (closestIndex !== activeIdxRef.current) {
        activeIdxRef.current = closestIndex;
        setActiveIdx(closestIndex);
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

  const displayItems = items && items.length > 0 ? items : [...DEFAULT_ITEMS, ...DEFAULT_ITEMS, ...DEFAULT_ITEMS];
  const leftColumnItems = displayItems.filter((_, idx) => idx % 2 === 0);
  const rightColumnItems = displayItems.filter((_, idx) => idx % 2 !== 0);

  const itemHeight = 36;
  // Center image bounds to calculate precise inward pinch position
  const imageWidth = isFullscreen ? 240 : 180;
  const imageHeight = isFullscreen ? 320 : 240;
  const gapFromImage = 32; // Horizontal padding at the pinch point
  const pinchX = imageWidth / 2 + gapFromImage; // Base horizontal distance from container center

  const activeImage = displayItems[activeImageIdx]?.imageSrc || imageSrc || displayItems[0].imageSrc;

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
          const isActive = originalIdx === activeIdx;
          
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
                opacity: 0.1,
                willChange: "transform, opacity, filter",
                transition: "color 0.4s ease, opacity 0.25s ease",
              }}
              onClick={() => {
                setActiveIdx(originalIdx);
                scrollOffsetRef.current = k * spacing;
              }}
            >
              <span
                className={`tracking-normal uppercase leading-none transition-all duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-neutral-500"
                }`}
                style={{
                  fontFamily: "var(--font-editorial), serif",
                  fontWeight: 200,
                  fontStyle: "italic",
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
          className="absolute pointer-events-auto overflow-hidden bg-black"
          style={{
            top: "50%",
            left: "50%",
            width: `${imageWidth}px`,
            height: `${imageHeight}px`,
            transform: "translate3d(-50%, -50%, 0)",
            boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.85)",
            zIndex: 10,
          }}
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeImageIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={activeImage}
                alt={displayItems[activeImageIdx]?.name}
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN (Left-aligned relative to center axis) */}
        {rightColumnItems.map((item, k) => {
          const originalIdx = k * 2 + 1;
          const isActive = originalIdx === activeIdx;
          
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
                opacity: 0.1,
                willChange: "transform, opacity, filter",
                transition: "color 0.4s ease, opacity 0.25s ease",
              }}
              onClick={() => {
                setActiveIdx(originalIdx);
                scrollOffsetRef.current = -(k + 0.5) * spacing;
              }}
            >
              <span
                className={`tracking-normal uppercase leading-none transition-all duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-neutral-500"
                }`}
                style={{
                  fontFamily: "var(--font-editorial), serif",
                  fontWeight: 200,
                  fontStyle: "italic",
                  fontSize: isFullscreen ? "clamp(1.2rem, 2.8vw, 2.2rem)" : "clamp(1.0rem, 2.0vw, 1.6rem)",
                }}
              >
                {item.name}
              </span>
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default ApparatusDualWave;
