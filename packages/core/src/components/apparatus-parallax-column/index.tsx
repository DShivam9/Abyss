import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ApparatusParallaxColumnProps } from "./types";

gsap.registerPlugin(CustomEase);

// Default premium images from Abyss assets
const DEFAULT_LEFT_IMAGES = [
  "/images/components%20images/scroll/cosmos_1309660817.jpeg",
  "/images/components%20images/scroll/cosmos_1859262512.jpeg",
  "/images/components%20images/scroll/cosmos_2063063057.jpeg",
  "/images/components%20images/scroll/cosmos_679994644.jpeg"
];

const DEFAULT_RIGHT_IMAGES = [
  "/images/components%20images/scroll/cosmos_1452408749.jpeg",
  "/images/components%20images/scroll/cosmos_861775148.jpeg",
  "/images/components%20images/scroll/cosmos_2063063057.jpeg",
  "/images/components%20images/scroll/cosmos_1309660817.jpeg"
];

export const ApparatusParallaxColumn: React.FC<ApparatusParallaxColumnProps> = ({
  leftImages,
  rightImages,
  imageSrc,
  className = "",
  style,
  onLifecycleChange,
  scrollProgress = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const leftItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Custom height state determined dynamically
  const [viewportHeight, setViewportHeight] = useState(600);

  // Interactive controls states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [ratioMode, setRatioMode] = useState<"50/50" | "60/40" | "golden">("50/50");
  const [speedFactor, setSpeedFactor] = useState(1.0); // 0.5x to 2.0x
  const [cropAmount, setCropAmount] = useState(15); // 5% to 25%
  const [dividerEnabled, setDividerEnabled] = useState(true);
  const [bgScale, setBgScale] = useState(60); // 40% to 90% (aesthetic size default at 60%)
  const [inertia, setInertia] = useState(4); // 1 to 15 (LERP speed)
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(25); // Default to 25 for a fast & responsive drift
  const [columnGap, setColumnGap] = useState(0); // Default to 0px so they barely touch by default

  const configRef = useRef({
    ratioMode,
    speedFactor,
    cropAmount,
    dividerEnabled,
    bgScale,
    inertia,
    autoScrollSpeed,
    columnGap
  });

  useEffect(() => {
    configRef.current = {
      ratioMode,
      speedFactor,
      cropAmount,
      dividerEnabled,
      bgScale,
      inertia,
      autoScrollSpeed,
      columnGap
    };
  }, [ratioMode, speedFactor, cropAmount, dividerEnabled, bgScale, inertia, autoScrollSpeed, columnGap]);

  // Image fallbacks
  const displayLeft = leftImages && leftImages.length > 0 
    ? leftImages 
    : [imageSrc || DEFAULT_LEFT_IMAGES[0], ...DEFAULT_LEFT_IMAGES.slice(1)];
  const displayRight = rightImages && rightImages.length > 0 
    ? rightImages 
    : DEFAULT_RIGHT_IMAGES;

  // Duplicate arrays to create a seamless infinite loop rendering layout
  const infiniteLeft = [...displayLeft, ...displayLeft];
  const infiniteRight = [...displayRight, ...displayRight];

  // Lifecycle signaling
  useEffect(() => {
    onLifecycleChange?.("discovery");
    const timer = setTimeout(() => {
      onLifecycleChange?.("idle");
    }, 1000);
    return () => clearTimeout(timer);
  }, [onLifecycleChange]);

  // Click outside to close controls dropdown
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Measure viewport height dynamically
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportHeight(entry.contentRect.height || 600);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Initialize Vessel Curve easing
  useEffect(() => {
    try {
      CustomEase.create("vessel", "0.16, 1, 0.3, 1");
    } catch {
      // Safe catch
    }
  }, []);

  // Local playhead tracking scroll & drift progress
  const accumulatedProgress = useRef(0);
  const lastScrollProgress = useRef(scrollProgress);
  const scrollTimeoutRef = useRef<any>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Sync external scrollProgress changes into local accumulatedProgress
  useEffect(() => {
    const delta = scrollProgress - lastScrollProgress.current;
    lastScrollProgress.current = scrollProgress;

    if (Math.abs(delta) > 0.0001) {
      accumulatedProgress.current += delta;
      setIsScrolling(true);

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      // Very small delay (120ms) to detect scroll stop and resume drift
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 120);
    }
  }, [scrollProgress]);

  // Continuous auto drift ticker
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const tick = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (!isScrolling) {
        // Elevated autoScrollSpeed factor: speed * 0.002
        const driftSpeed = configRef.current.autoScrollSpeed * 0.002;
        accumulatedProgress.current += driftSpeed * dt;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isScrolling]);

  const [smoothProgress, setSmoothProgress] = useState(0);

  // Interpolate accumulated progress to simulate premium inertia / Lenis scroll damping
  useEffect(() => {
    let animationFrameId: number;
    
    const updateProgress = () => {
      setSmoothProgress((prev) => {
        const diff = accumulatedProgress.current - prev;
        if (Math.abs(diff) < 0.0001) return accumulatedProgress.current;
        return prev + diff * (configRef.current.inertia * 0.015);
      });
      animationFrameId = requestAnimationFrame(updateProgress);
    };
    
    animationFrameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Main scroll transformations
  useGSAP(() => {
    const N = displayLeft.length;
    const M = displayRight.length;
    if (N <= 0 || M <= 0) return;

    // Calculate modular wrapping offsets (infinite progress)
    const leftOffset = ((smoothProgress * speedFactor) % N + N) % N;
    const rightOffset = (((1.0 - smoothProgress) * speedFactor) % M + M) % M;

    const leftY = -leftOffset * viewportHeight;
    const rightY = -rightOffset * viewportHeight;

    // Apply main column translations
    gsap.set(leftColRef.current, { y: leftY });
    gsap.set(rightColRef.current, { y: rightY });

    // Lifecycle triggers
    const speed = Math.abs(smoothProgress - 0.5);
    if (speed > 0.05 && speed < 0.45) {
      onLifecycleChange?.("buildUp");
    } else if (speed >= 0.45) {
      onLifecycleChange?.("peak");
    } else {
      onLifecycleChange?.("idle");
    }

    const easeFn = gsap.parseEase("vessel");
    const cropPct = configRef.current.cropAmount;

    // Compute transformations for Left Column items
    leftItemRefs.current.forEach((item, i) => {
      if (!item) return;
      
      // Wrapping circular index distance
      let diff = (i % N) - leftOffset;
      if (diff > N / 2) diff -= N;
      if (diff < -N / 2) diff += N;
      
      const distance = Math.min(1.0, Math.abs(diff));
      const t = 1.0 - distance; // 1 at center, 0 at >=1.0 distance
      const easedT = easeFn(t);

      const targetScale = 0.88 + 0.12 * easedT;
      const targetCrop = cropPct * (1.0 - easedT);

      gsap.set(item, {
        scale: targetScale,
        clipPath: `inset(${targetCrop}%)`,
        opacity: 0.35 + 0.65 * easedT
      });
    });

    // Compute transformations for Right Column items
    rightItemRefs.current.forEach((item, j) => {
      if (!item) return;
      
      // Wrapping circular index distance
      let diff = (j % M) - rightOffset;
      if (diff > M / 2) diff -= M;
      if (diff < -M / 2) diff += M;
      
      const distance = Math.min(1.0, Math.abs(diff));
      const t = 1.0 - distance;
      const easedT = easeFn(t);

      const targetScale = 0.88 + 0.12 * easedT;
      const targetCrop = cropPct * (1.0 - easedT);

      gsap.set(item, {
        scale: targetScale,
        clipPath: `inset(${targetCrop}%)`,
        opacity: 0.35 + 0.65 * easedT
      });
    });

  }, [smoothProgress, viewportHeight, displayLeft, displayRight]);

  // Determine dynamic column split widths
  const getColWidths = () => {
    if (ratioMode === "60/40") return { left: "60%", right: "40%" };
    if (ratioMode === "golden") return { left: "61.8%", right: "38.2%" };
    return { left: "50%", right: "50%" };
  };

  const widths = getColWidths();

  // Compute card dimensions dynamically based on height and scale
  const cardHeight = viewportHeight * (bgScale / 100) * 0.7;
  const cardWidth = cardHeight * 0.75; // 3:4 portrait card aspect ratio

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden bg-[#070709] flex select-none ${className}`}
      style={{
        ...style,
        display: "flex",
        gap: `${columnGap}px`,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {/* Controls Dropdown Panel */}
      <div
        className="absolute z-20 pointer-events-auto"
        style={{
          top: "16px",
          right: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(13, 13, 15, 0.8)",
            color: "#ffffff",
            padding: "6px 14px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "9999px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            fontSize: "10px",
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            cursor: "pointer",
            transition: "border-color 0.3s, background-color 0.3s",
            outline: "none"
          }}
        >
          <span>Controls</span>
          <svg 
            width="8" 
            height="8" 
            viewBox="0 0 8 8" 
            fill="none" 
            style={{ 
              transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", 
              transition: "transform 0.3s",
              stroke: "rgba(255, 255, 255, 0.6)",
              strokeWidth: "1.5"
            }}
          >
            <path d="M1 2.5L4 5.5L7 2.5" />
          </svg>
        </button>

        {dropdownOpen && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              backgroundColor: "rgba(13, 13, 15, 0.9)",
              padding: "16px 14px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              backdropFilter: "blur(16px)",
              boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.6)",
              minWidth: "220px",
              animation: "fadeIn 0.2s ease-out"
            }}
          >
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-4px); }
                to { opacity: 1; transform: translateY(0); }
              }
              input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #34d399;
                cursor: pointer;
                transition: transform 0.1s;
              }
              input[type="range"]::-webkit-slider-thumb:hover {
                transform: scale(1.3);
              }
              input[type="range"]::-moz-range-thumb {
                width: 10px;
                height: 10px;
                border: none;
                border-radius: 50%;
                background: #34d399;
                cursor: pointer;
                transition: transform 0.1s;
              }
              input[type="range"]::-moz-range-thumb:hover {
                transform: scale(1.3);
              }
            `}</style>

            {/* Cycle: Column Ratio */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                Column Ratio
              </span>
              <div style={{ display: "flex", gap: "4px" }}>
                {(["50/50", "60/40", "golden"] as const).map((rOpt) => (
                  <button
                    key={rOpt}
                    onClick={() => setRatioMode(rOpt)}
                    style={{
                      flex: 1,
                      backgroundColor: ratioMode === rOpt ? "rgba(52, 211, 153, 0.15)" : "transparent",
                      color: ratioMode === rOpt ? "#34d399" : "rgba(255, 255, 255, 0.4)",
                      border: `1px solid ${ratioMode === rOpt ? "rgba(52, 211, 153, 0.3)" : "rgba(255, 255, 255, 0.05)"}`,
                      borderRadius: "4px",
                      padding: "4px 0",
                      fontSize: "8px",
                      fontFamily: "monospace",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {rOpt}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider: Velocity Speed Factor */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Speed Factor
                </span>
                <span className="text-[9px] font-mono text-white/50">{speedFactor.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speedFactor}
                onChange={(e) => setSpeedFactor(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: "2px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  outline: "none",
                  WebkitAppearance: "none"
                }}
              />
            </div>

            {/* Slider: Column Gap */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Column Gap
                </span>
                <span className="text-[9px] font-mono text-white/50">{columnGap}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={columnGap}
                onChange={(e) => setColumnGap(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: "2px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  outline: "none",
                  WebkitAppearance: "none"
                }}
              />
            </div>

            {/* Slider: Crop Amount */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Resting Crop
                </span>
                <span className="text-[9px] font-mono text-white/50">{cropAmount}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={cropAmount}
                onChange={(e) => setCropAmount(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: "2px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  outline: "none",
                  WebkitAppearance: "none"
                }}
              />
            </div>

            {/* Slider: Image Scale */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Image Scale
                </span>
                <span className="text-[9px] font-mono text-white/50">{bgScale}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                value={bgScale}
                onChange={(e) => setBgScale(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: "2px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  outline: "none",
                  WebkitAppearance: "none"
                }}
              />
            </div>

            {/* Slider: Scroll Inertia / Damping */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Scroll Damping
                </span>
                <span className="text-[9px] font-mono text-white/50">{16 - inertia}</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={inertia}
                onChange={(e) => setInertia(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: "2px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  outline: "none",
                  WebkitAppearance: "none"
                }}
              />
            </div>

            {/* Slider: Auto-Drift Speed */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Auto Drift
                </span>
                <span className="text-[9px] font-mono text-white/50">{autoScrollSpeed}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={autoScrollSpeed}
                onChange={(e) => setAutoScrollSpeed(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: "2px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  outline: "none",
                  WebkitAppearance: "none"
                }}
              />
            </div>

            {/* Toggle: Center Divider */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                Show Divider
              </span>
              <button 
                onClick={() => setDividerEnabled(!dividerEnabled)}
                style={{ 
                  position: "relative",
                  width: "28px",
                  height: "16px",
                  borderRadius: "9999px",
                  backgroundColor: dividerEnabled ? "rgba(52, 211, 153, 0.2)" : "rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  padding: "2px",
                  cursor: "pointer",
                  border: "none",
                  transition: "background-color 0.3s",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              >
                <div 
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    transition: "transform 0.3s, background-color 0.3s",
                    transform: dividerEnabled ? "translateX(12px)" : "translateX(0px)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    ...(dividerEnabled && { backgroundColor: "#34d399" })
                  }}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LEFT COLUMN (Downwards runway) */}
      <div
        ref={leftColRef}
        className="h-full flex flex-col will-change-transform"
        style={{
          width: `calc(${widths.left} - ${columnGap / 2}px)`,
          transition: "width 0.45s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {infiniteLeft.map((img, idx) => (
          <div
            key={idx}
            ref={(el) => {
              leftItemRefs.current[idx] = el;
            }}
            className="w-full shrink-0 flex items-center justify-end relative overflow-hidden"
            style={{
              height: `${viewportHeight}px`,
              willChange: "transform, clip-path, opacity"
            }}
          >
            {/* Centered card with identical sizing, cover fill, and sharp corners */}
            <div
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                backgroundImage: `url("${img}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "0px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.4)"
              }}
            />
          </div>
        ))}
      </div>

      {/* Center divider line */}
      {dividerEnabled && (
        <div 
          className="h-full z-10 bg-white/10" 
          style={{ 
            width: "1px", 
            alignSelf: "stretch"
          }}
        />
      )}

      {/* RIGHT COLUMN (Upwards counter-runway) */}
      <div
        ref={rightColRef}
        className="h-full flex flex-col will-change-transform"
        style={{
          width: `calc(${widths.right} - ${columnGap / 2}px)`,
          transition: "width 0.45s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {infiniteRight.map((img, idx) => (
          <div
            key={idx}
            ref={(el) => {
              rightItemRefs.current[idx] = el;
            }}
            className="w-full shrink-0 flex items-center justify-start relative overflow-hidden"
            style={{
              height: `${viewportHeight}px`,
              willChange: "transform, clip-path, opacity"
            }}
          >
            {/* Centered card with identical sizing, cover fill, and sharp corners */}
            <div
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                backgroundImage: `url("${img}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "0px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.4)"
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApparatusParallaxColumn;
