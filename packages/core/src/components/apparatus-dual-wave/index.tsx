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

export const ApparatusDualWave: React.FC<ApparatusDualWaveProps> = ({
  items,
  imageSrc,
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
  
  // Interactive tuning controls (Hourglass / Triangle wave shape parameters)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cornerAlignment, setCornerAlignment] = useState(1.0); // 0 = centered, 1 = corner aligned
  const [waveRange, setWaveRange] = useState(100); // percentage multiplier (50% to 150%)
  const [waveSpeed, setWaveSpeed] = useState(1.0); // wave cycles multiplier
  const [waveNum, setWaveNum] = useState(0.45); // phase shift between adjacent items
  const [spacing, setSpacing] = useState(65); // vertical spacing between items
  const [curvature, setCurvature] = useState(0.0); // 0 = sharp triangle, 1 = rounded hemisphere
  const [maxBlur, setMaxBlur] = useState(3.0); // max blur radius for progressive blur
  const [maxRotation, setMaxRotation] = useState(8.0); // max slant rotation angle
  
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

  // Transition parameters smoothly over time
  const applyPreset = (target: {
    cornerAlignment: number;
    waveRange: number;
    curvature: number;
    maxBlur: number;
    maxRotation: number;
    waveNum: number;
    spacing: number;
    waveSpeed: number;
  }) => {
    if (presetAnimRef.current !== null) {
      cancelAnimationFrame(presetAnimRef.current);
    }

    const duration = 500; // 500ms subtle ease-out transition
    const startTime = performance.now();
    
    // Capture current values
    const startValues = {
      cornerAlignment,
      waveRange,
      curvature,
      maxBlur,
      maxRotation,
      waveNum,
      spacing,
      waveSpeed,
    };
    
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      // Smooth ease-out cubic
      const t = 1 - Math.pow(1 - progress, 3);
      
      setCornerAlignment(startValues.cornerAlignment + (target.cornerAlignment - startValues.cornerAlignment) * t);
      setWaveRange(startValues.waveRange + (target.waveRange - startValues.waveRange) * t);
      setCurvature(startValues.curvature + (target.curvature - startValues.curvature) * t);
      setMaxBlur(startValues.maxBlur + (target.maxBlur - startValues.maxBlur) * t);
      setMaxRotation(startValues.maxRotation + (target.maxRotation - startValues.maxRotation) * t);
      setWaveNum(startValues.waveNum + (target.waveNum - startValues.waveNum) * t);
      setSpacing(startValues.spacing + (target.spacing - startValues.spacing) * t);
      setWaveSpeed(startValues.waveSpeed + (target.waveSpeed - startValues.waveSpeed) * t);
      
      if (progress < 1.0) {
        presetAnimRef.current = requestAnimationFrame(step);
      } else {
        presetAnimRef.current = null;
      }
    };
    
    presetAnimRef.current = requestAnimationFrame(step);
  };

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
      {/* ─── CONTROLS PANEL ─── */}
      <div 
        className="pointer-events-auto"
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "12px",
        }}
      >
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="abyss-controls-trigger select-none"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          {dropdownOpen ? "Close Controls" : "Controls"}
        </button>

        {dropdownOpen && (
          <div className="abyss-controls-panel">
            {/* Presets Action Buttons */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", width: "100%" }}>
              <button
                onClick={() => {
                  applyPreset({
                    cornerAlignment: 1.0,
                    waveRange: 100,
                    curvature: 0.0,
                    maxBlur: 3.0,
                    maxRotation: 8.0,
                    waveNum: 0.45,
                    spacing: 65,
                    waveSpeed: 1.0,
                  });
                }}
                className="flex-1 py-1.5 px-3 rounded-md text-[9px] font-mono border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all select-none cursor-pointer"
                style={{ flex: 1 }}
              >
                Reset Default
              </button>
              <button
                onClick={() => {
                  applyPreset({
                    cornerAlignment: 1.0,
                    waveRange: 90,
                    curvature: 0.35,
                    maxBlur: 6.0,
                    maxRotation: 12.0,
                    waveNum: 0.55,
                    spacing: 75,
                    waveSpeed: 1.2,
                  });
                }}
                className="flex-1 py-1.5 px-3 rounded-md text-[9px] font-mono border border-white/30 bg-white/15 text-white hover:bg-white/20 transition-all select-none font-bold cursor-pointer"
                style={{ flex: 1 }}
              >
                Best Preset
              </button>
            </div>

            {/* Slider: Corner Alignment */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Corner Alignment
                </span>
                <span className="text-[9px] font-mono text-white/50">
                  {(cornerAlignment * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ position: "relative", width: "100%", height: "12px", display: "flex", alignItems: "center" }}>
                <div 
                  className="abyss-slider-tick"
                  style={{
                    position: "absolute",
                    left: "100%",
                    pointerEvents: "none",
                    transform: "translateX(-50%)",
                    zIndex: 1
                  }}
                  title="Default: 100%"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={cornerAlignment}
                  onChange={(e) => setCornerAlignment(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Slider: Wave Range */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Wave Range
                </span>
                <span className="text-[9px] font-mono text-white/50">
                  {waveRange}%
                </span>
              </div>
              <div style={{ position: "relative", width: "100%", height: "12px", display: "flex", alignItems: "center" }}>
                <div 
                  className="abyss-slider-tick"
                  style={{
                    position: "absolute",
                    left: "50%",
                    pointerEvents: "none",
                    transform: "translateX(-50%)",
                    zIndex: 1
                  }}
                  title="Default: 100%"
                />
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={waveRange}
                  onChange={(e) => setWaveRange(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Slider: Curvature */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Curvature
                </span>
                <span className="text-[9px] font-mono text-white/50">{(curvature * 100).toFixed(0)}%</span>
              </div>
              <div style={{ position: "relative", width: "100%", height: "12px", display: "flex", alignItems: "center" }}>
                <div 
                  className="abyss-slider-tick"
                  style={{
                    position: "absolute",
                    left: "0%",
                    pointerEvents: "none",
                    transform: "translateX(-50%)",
                    zIndex: 1
                  }}
                  title="Default: 0%"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={curvature}
                  onChange={(e) => setCurvature(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Slider: Progressive Blur */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Progressive Blur
                </span>
                <span className="text-[9px] font-mono text-white/50">{maxBlur.toFixed(1)}px</span>
              </div>
              <div style={{ position: "relative", width: "100%", height: "12px", display: "flex", alignItems: "center" }}>
                <div 
                  className="abyss-slider-tick"
                  style={{
                    position: "absolute",
                    left: "25%",
                    pointerEvents: "none",
                    transform: "translateX(-50%)",
                    zIndex: 1
                  }}
                  title="Default: 3.0px"
                />
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={maxBlur}
                  onChange={(e) => setMaxBlur(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Slider: Max Rotation */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Max Rotation
                </span>
                <span className="text-[9px] font-mono text-white/50">{maxRotation.toFixed(0)}°</span>
              </div>
              <div style={{ position: "relative", width: "100%", height: "12px", display: "flex", alignItems: "center" }}>
                <div 
                  className="abyss-slider-tick"
                  style={{
                    position: "absolute",
                    left: "32%",
                    pointerEvents: "none",
                    transform: "translateX(-50%)",
                    zIndex: 1
                  }}
                  title="Default: 8°"
                />
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={maxRotation}
                  onChange={(e) => setMaxRotation(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Slider: Wave Spacing */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Wave Spacing
                </span>
                <span className="text-[9px] font-mono text-white/50">{waveNum.toFixed(2)}</span>
              </div>
              <div style={{ position: "relative", width: "100%", height: "12px", display: "flex", alignItems: "center" }}>
                <div 
                  className="abyss-slider-tick"
                  style={{
                    position: "absolute",
                    left: "25%",
                    pointerEvents: "none",
                    transform: "translateX(-50%)",
                    zIndex: 1
                  }}
                  title="Default: 0.45"
                />
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={waveNum}
                  onChange={(e) => setWaveNum(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Slider: Item Spacing */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Item Spacing
                </span>
                <span className="text-[9px] font-mono text-white/50">{spacing}px</span>
              </div>
              <div style={{ position: "relative", width: "100%", height: "12px", display: "flex", alignItems: "center" }}>
                <div 
                  className="abyss-slider-tick"
                  style={{
                    position: "absolute",
                    left: "31.25%",
                    pointerEvents: "none",
                    transform: "translateX(-50%)",
                    zIndex: 1
                  }}
                  title="Default: 65px"
                />
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={spacing}
                  onChange={(e) => setSpacing(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Slider: Wave Speed */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Wave Speed
                </span>
                <span className="text-[9px] font-mono text-white/50">{waveSpeed.toFixed(1)}x</span>
              </div>
              <div style={{ position: "relative", width: "100%", height: "12px", display: "flex", alignItems: "center" }}>
                <div 
                  className="abyss-slider-tick"
                  style={{
                    position: "absolute",
                    left: "28.57%",
                    pointerEvents: "none",
                    transform: "translateX(-50%)",
                    zIndex: 1
                  }}
                  title="Default: 1.0x"
                />
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={waveSpeed}
                  onChange={(e) => setWaveSpeed(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

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
