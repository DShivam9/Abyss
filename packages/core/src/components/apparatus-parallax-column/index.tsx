import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ApparatusParallaxColumnProps } from "./types";

gsap.registerPlugin(CustomEase);

// Default premium images from Abyss assets — no repeats across columns
const DEFAULT_LEFT_IMAGES = [
  "/images/components%20images/scroll/cosmos_1309660817.jpeg",
  "/images/components%20images/scroll/cosmos_1859262512.jpeg",
  "/images/components%20images/scroll/cosmos_2063063057.jpeg",
  "/images/components%20images/scroll/cosmos_679994644.jpeg",
  "/images/components%20images/scroll/cosmos_1244425812.jpeg",
  "/images/components%20images/scroll/cosmos_1994819013.jpeg",
  "/images/components%20images/scroll/cosmos_2086495860.jpeg",
  "/images/components%20images/scroll/cosmos_51259133.jpeg",
  "/images/components%20images/scroll/cosmos_586109684.jpeg"
];

const DEFAULT_RIGHT_IMAGES = [
  "/images/components%20images/scroll/cosmos_1452408749.jpeg",
  "/images/components%20images/scroll/cosmos_861775148.jpeg",
  "/images/components%20images/scroll/cosmos_1298955025.jpeg",
  "/images/components%20images/scroll/cosmos_2093433371.jpeg",
  "/images/components%20images/scroll/cosmos_520815919.jpeg",
  "/images/components%20images/scroll/cosmos_666194661.jpeg",
  "/images/components%20images/scroll/cosmos_961582572.jpeg",
  "/images/components%20images/scroll/download.jpg",
  "/images/components%20images/scroll/Glowing%20White%20Horse.jpg"
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
  const [splitRatio, setSplitRatio] = useState(50); // percentage of left column (25% to 75%)
  const [speedFactor, setSpeedFactor] = useState(1.0); // 0.5x to 2.0x
  const [cropAmount, setCropAmount] = useState(15); // 5% to 25%
  const dividerEnabled = false;
  const [bgScale, setBgScale] = useState(60); // 40% to 90% (aesthetic size default at 60%)
  const [inertia, setInertia] = useState(4); // 1 to 15 (LERP speed)
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(25); // Default to 25 for a fast & responsive drift
  const [columnGap, setColumnGap] = useState(4); // Default to 4px
  const [imageGap, setImageGap] = useState(4); // Default to 4px

  // Snap handlers for default values
  const handleSpeedFactorChange = (val: number) => {
    if (Math.abs(val - 1.0) <= 0.08) setSpeedFactor(1.0);
    else setSpeedFactor(val);
  };

  const handleSplitRatioChange = (val: number) => {
    if (Math.abs(val - 50) <= 3) setSplitRatio(50);
    else setSplitRatio(val);
  };

  const handleColumnGapChange = (val: number) => {
    if (Math.abs(val - 4) <= 2) setColumnGap(4);
    else setColumnGap(val);
  };

  const handleCropAmountChange = (val: number) => {
    if (Math.abs(val - 15) <= 1) setCropAmount(15);
    else setCropAmount(val);
  };

  const handleBgScaleChange = (val: number) => {
    if (Math.abs(val - 60) <= 2) setBgScale(60);
    else setBgScale(val);
  };

  const handleInertiaChange = (val: number) => {
    if (Math.abs(val - 4) <= 1) setInertia(4);
    else setInertia(val);
  };

  const handleAutoScrollSpeedChange = (val: number) => {
    if (Math.abs(val - 25) <= 2) setAutoScrollSpeed(25);
    else setAutoScrollSpeed(val);
  };

  const handleImageGapChange = (val: number) => {
    if (Math.abs(val - 4) <= 3) setImageGap(4);
    else setImageGap(val);
  };

  const configRef = useRef({
    splitRatio,
    speedFactor,
    cropAmount,
    dividerEnabled,
    bgScale,
    inertia,
    autoScrollSpeed,
    columnGap,
    imageGap
  });

  useEffect(() => {
    configRef.current = {
      splitRatio,
      speedFactor,
      cropAmount,
      dividerEnabled,
      bgScale,
      inertia,
      autoScrollSpeed,
      columnGap,
      imageGap
    };
  }, [splitRatio, speedFactor, cropAmount, dividerEnabled, bgScale, inertia, autoScrollSpeed, columnGap, imageGap]);

  // Image fallbacks
  const displayLeft = leftImages && leftImages.length > 0
    ? leftImages
    : [imageSrc || DEFAULT_LEFT_IMAGES[0], ...DEFAULT_LEFT_IMAGES.slice(1)];
  const displayRight = rightImages && rightImages.length > 0
    ? rightImages
    : DEFAULT_RIGHT_IMAGES;

  // Duplicate arrays multiple times to create a robust seamless infinite loop rendering layout
  const infiniteLeft = [...displayLeft, ...displayLeft, ...displayLeft];
  const infiniteRight = [...displayRight, ...displayRight, ...displayRight];

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

  // Direct wheel & touch gesture interceptors for infinite scroll support
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      // Prevent default browser/page scrolling
      e.preventDefault();

      const wheelDelta = e.deltaY * 0.0015;
      accumulatedProgress.current += wheelDelta;
      setIsScrolling(true);

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        touchStartY = touchY;

        // Smooth touch velocity scaling
        const touchDelta = deltaY * 0.005;
        accumulatedProgress.current += touchDelta;
        setIsScrolling(true);

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

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

  // Compute card and item dimensions dynamically based on height and scale
  const cardHeight = viewportHeight * (bgScale / 100) * 0.7;
  const cardWidth = cardHeight * 0.75; // 3:4 portrait card aspect ratio

  // Set item container height to card height + user-controlled imageGap
  const itemHeight = cardHeight + imageGap;

  // Main scroll transformations
  useGSAP(() => {
    const N = displayLeft.length;
    const M = displayRight.length;
    if (N <= 0 || M <= 0) return;

    // Calculate modular wrapping offsets (infinite progress)
    const leftOffset = ((smoothProgress * speedFactor) % N + N) % N;
    const rightOffset = (((1.0 - smoothProgress) * speedFactor) % M + M) % M;

    const leftY = -leftOffset * itemHeight;
    const rightY = -rightOffset * itemHeight;

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

    // Images are fully static — no scale, crop, or opacity transforms.
    // They simply scroll in place without any visual mutation.

  }, [smoothProgress, itemHeight, displayLeft, displayRight, speedFactor]);

  // Determine dynamic column split widths
  const getColWidths = () => {
    return {
      left: `${splitRatio}%`,
      right: `${100 - splitRatio}%`
    };
  };

  const widths = getColWidths();

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
          className="abyss-controls-trigger"
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
            className="abyss-controls-panel"
            style={{
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            {/* Slider: Column Split */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Column Split
                </span>
                <span className="text-[9px] font-mono text-white/50">{splitRatio.toFixed(0)}/{100 - Number(splitRatio.toFixed(0))}</span>
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
                  title="Default: 50/50"
                />
                <input
                  type="range"
                  min="25"
                  max="75"
                  value={splitRatio}
                  onChange={(e) => handleSplitRatioChange(Number(e.target.value))}
                  style={{
                    width: "100%",
                    zIndex: 2
                  }}
                />
              </div>
            </div>

            {/* Slider: Speed Factor */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Speed Factor
                </span>
                <span className="text-[9px] font-mono text-white/50">{speedFactor.toFixed(1)}x</span>
              </div>
              <div style={{ position: "relative", width: "100%", height: "12px", display: "flex", alignItems: "center" }}>
                <div
                  className="abyss-slider-tick"
                  style={{
                    position: "absolute",
                    left: `${(1.0 - 0.5) / 1.5 * 100}%`,
                    pointerEvents: "none",
                    transform: "translateX(-50%)",
                    zIndex: 1
                  }}
                  title="Default: 1.0x"
                />
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speedFactor}
                  onChange={(e) => handleSpeedFactorChange(Number(e.target.value))}
                  style={{
                    width: "100%",
                    zIndex: 2
                  }}
                />
              </div>
            </div>

            {/* Slider: Column Gap */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Column Gap
                </span>
                <span className="text-[9px] font-mono text-white/50">{columnGap}px</span>
              </div>
              <div style={{ position: "relative", width: "100%", height: "12px", display: "flex", alignItems: "center" }}>
                <div
                  className="abyss-slider-tick"
                  style={{
                    position: "absolute",
                    left: `${(4 / 80) * 100}%`,
                    pointerEvents: "none",
                    transform: "translateX(-50%)",
                    zIndex: 1
                  }}
                  title="Default: 4px"
                />
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={columnGap}
                  onChange={(e) => handleColumnGapChange(Number(e.target.value))}
                  style={{
                    width: "100%",
                    zIndex: 2
                  }}
                />
              </div>
            </div>

            {/* Slider: Crop Amount */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Resting Crop
                </span>
                <span className="text-[9px] font-mono text-white/50">{cropAmount}%</span>
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
                  title="Default: 15%"
                />
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={cropAmount}
                  onChange={(e) => handleCropAmountChange(Number(e.target.value))}
                  style={{
                    width: "100%",
                    zIndex: 2
                  }}
                />
              </div>
            </div>

            {/* Slider: Image Scale */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Image Scale
                </span>
                <span className="text-[9px] font-mono text-white/50">{bgScale}%</span>
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
                  title="Default: 60%"
                />
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={bgScale}
                  onChange={(e) => handleBgScaleChange(Number(e.target.value))}
                  style={{
                    width: "100%",
                    zIndex: 2
                  }}
                />
              </div>
            </div>

            {/* Slider: Scroll Inertia / Damping */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Scroll Damping
                </span>
                <span className="text-[9px] font-mono text-white/50">{16 - inertia}</span>
              </div>
              <div style={{ position: "relative", width: "100%", height: "12px", display: "flex", alignItems: "center" }}>
                <div
                  className="abyss-slider-tick"
                  style={{
                    position: "absolute",
                    left: `${(4 - 1) / 14 * 100}%`,
                    pointerEvents: "none",
                    transform: "translateX(-50%)",
                    zIndex: 1
                  }}
                  title="Default: 12 (inertia: 4)"
                />
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={inertia}
                  onChange={(e) => handleInertiaChange(Number(e.target.value))}
                  style={{
                    width: "100%",
                    zIndex: 2
                  }}
                />
              </div>
            </div>

            {/* Slider: Auto-Drift Speed */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Auto Drift
                </span>
                <span className="text-[9px] font-mono text-white/50">{autoScrollSpeed}</span>
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
                  title="Default: 25"
                />
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={autoScrollSpeed}
                  onChange={(e) => handleAutoScrollSpeedChange(Number(e.target.value))}
                  style={{
                    width: "100%",
                    zIndex: 2
                  }}
                />
              </div>
            </div>

            {/* Slider: Image Gap */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Image Gap
                </span>
                <span className="text-[9px] font-mono text-white/50">{imageGap}px</span>
              </div>
              <div style={{ position: "relative", width: "100%", height: "12px", display: "flex", alignItems: "center" }}>
                <div
                  className="abyss-slider-tick"
                  style={{
                    position: "absolute",
                    left: `${(4 / 120) * 100}%`,
                    pointerEvents: "none",
                    transform: "translateX(-50%)",
                    zIndex: 1
                  }}
                  title="Default: 4px"
                />
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={imageGap}
                  onChange={(e) => handleImageGapChange(Number(e.target.value))}
                  style={{
                    width: "100%",
                    zIndex: 2
                  }}
                />
              </div>
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
          transition: isScrolling ? "none" : "width 0.45s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {infiniteLeft.map((img, idx) => (
          <div
            key={idx}
            className="w-full shrink-0 flex items-center justify-end relative"
            style={{
              height: `${itemHeight}px`
            }}
          >
            {/* Centered card with identical sizing, cover fill, and sharp corners */}
            <div
              ref={(el) => {
                leftItemRefs.current[idx] = el;
              }}
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                backgroundImage: `url("${img}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "0px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.4)",
                willChange: "transform, clip-path, opacity"
              }}
            />
          </div>
        ))}
      </div>

      {/* RIGHT COLUMN (Upwards counter-runway) */}
      <div
        ref={rightColRef}
        className="h-full flex flex-col will-change-transform"
        style={{
          width: `calc(${widths.right} - ${columnGap / 2}px)`,
          transition: isScrolling ? "none" : "width 0.45s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {infiniteRight.map((img, idx) => (
          <div
            key={idx}
            className="w-full shrink-0 flex items-center justify-start relative"
            style={{
              height: `${itemHeight}px`
            }}
          >
            {/* Centered card with identical sizing, cover fill, and sharp corners */}
            <div
              ref={(el) => {
                rightItemRefs.current[idx] = el;
              }}
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                backgroundImage: `url("${img}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "0px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.4)",
                willChange: "transform, clip-path, opacity"
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApparatusParallaxColumn;
