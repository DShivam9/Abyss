import React, { useEffect, useRef, useState } from "react";
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

export const ApparatusParallaxColumn: React.FC<ApparatusParallaxColumnProps & {
  speedFactor?: number;
  splitRatio?: number;
  cropAmount?: number;
  bgScale?: number;
  inertia?: number;
  autoScrollSpeed?: number;
  columnGap?: number;
  imageGap?: number;
}> = ({
  leftImages,
  rightImages,
  imageSrc,
  className = "",
  style,
  onLifecycleChange,
  scrollProgress = 0,
  speedFactor: propSpeedFactor,
  splitRatio: propSplitRatio,
  cropAmount: propCropAmount,
  bgScale: propBgScale,
  inertia: propInertia,
  autoScrollSpeed: propAutoScrollSpeed,
  columnGap: propColumnGap,
  imageGap: propImageGap,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const leftItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Custom height state determined dynamically
  const [viewportHeight, setViewportHeight] = useState(600);

  // Interactive controls values from props or defaults
  const splitRatio = propSplitRatio ?? 50;
  const speedFactor = propSpeedFactor ?? 1.0;
  const cropAmount = propCropAmount ?? 15;
  const dividerEnabled = false;
  const bgScale = propBgScale ?? 40;
  const inertia = propInertia ?? 4;
  const autoScrollSpeed = propAutoScrollSpeed ?? 25;
  const columnGap = propColumnGap ?? 4;
  const imageGap = propImageGap ?? 4;

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

  // Compute card and item dimensions dynamically based on height and scale
  const cardHeight = viewportHeight * (bgScale / 100) * 0.7;
  const cardWidth = cardHeight * 0.75; // 3:4 portrait card aspect ratio
  const itemHeight = cardHeight + imageGap;

  const smoothProgressRef = useRef(0);

  // Interpolate accumulated progress to simulate premium inertia / Lenis scroll damping
  useEffect(() => {
    let animationFrameId: number;

    const updateProgress = () => {
      const diff = accumulatedProgress.current - smoothProgressRef.current;
      smoothProgressRef.current += diff * (configRef.current.inertia * 0.015);

      const N = displayLeft.length;
      const M = displayRight.length;
      if (N > 0 && M > 0 && leftColRef.current && rightColRef.current) {
        const leftOffset = ((smoothProgressRef.current * configRef.current.speedFactor) % N + N) % N;
        const rightOffset = (((1.0 - smoothProgressRef.current) * configRef.current.speedFactor) % M + M) % M;

        const leftY = -leftOffset * itemHeight;
        const rightY = -rightOffset * itemHeight;

        gsap.set(leftColRef.current, { y: leftY });
        gsap.set(rightColRef.current, { y: rightY });
      }

      animationFrameId = requestAnimationFrame(updateProgress);
    };

    animationFrameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrameId);
  }, [displayLeft.length, displayRight.length, itemHeight]);

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
      className={`w-full h-full relative overflow-hidden bg-[#070709] flex items-center justify-center select-none ${className}`}
      style={{
        ...style,
      }}
    >
      <div
        className="h-full flex items-center justify-center"
        style={{
          gap: `${columnGap}px`
        }}
      >
        {/* LEFT COLUMN (Downwards runway) */}
        <div
          ref={leftColRef}
          className="h-full flex flex-col items-center will-change-transform"
          style={{
            width: `${cardWidth}px`,
          }}
        >
          {infiniteLeft.map((img, idx) => (
            <div
              key={idx}
              className="w-full shrink-0 flex items-center justify-center relative"
              style={{
                height: `${itemHeight}px`
              }}
            >
              {/* Centered card with identical sizing, cover fill, and sleek rounded corners */}
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
                  borderRadius: "4px",
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
          className="h-full flex flex-col items-center will-change-transform"
          style={{
            width: `${cardWidth}px`,
          }}
        >
          {infiniteRight.map((img, idx) => (
            <div
              key={idx}
              className="w-full shrink-0 flex items-center justify-center relative"
              style={{
                height: `${itemHeight}px`
              }}
            >
              {/* Centered card with identical sizing, cover fill, and sleek rounded corners */}
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
                  borderRadius: "4px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.4)",
                  willChange: "transform, clip-path, opacity"
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApparatusParallaxColumn;
