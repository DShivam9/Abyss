import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Lenis from "lenis";
import { ApparatusParallaxColumnProps } from "./types";

// Default premium images from Abyss assets — ultra-optimized, no repeats across columns
const DEFAULT_LEFT_IMAGES = [
  "/images/components%20images/scroll/cosmos_1309660817.webp",
  "/images/components%20images/scroll/cosmos_2063063057.webp",
  "/images/components%20images/scroll/cosmos_1244425812.webp",
  "/images/components%20images/scroll/cosmos_2086495860.webp",
  "/images/components%20images/scroll/cosmos_51259133.webp"
];

const DEFAULT_RIGHT_IMAGES = [
  "/images/components%20images/scroll/cosmos_1452408749.webp",
  "/images/components%20images/scroll/cosmos_1298955025.webp",
  "/images/components%20images/scroll/cosmos_2093433371.webp",
  "/images/components%20images/scroll/cosmos_520815919.webp",
  "/images/components%20images/scroll/Glowing%20White%20Horse.webp"
];

// Baked constants for refined motion and geometry
const BAKED_SPLIT_RATIO = 50;
const BAKED_SPEED_FACTOR = 1.0;
const BAKED_BG_SCALE = 40;
const BAKED_INERTIA = 4;
const BAKED_AUTO_SCROLL_SPEED = 25;
const BAKED_CONCAVE_DEPTH = 520;
const BAKED_CONCAVE_TILT = 42;
const BAKED_CONVEX_BULGE = 480;
const BAKED_CONVEX_TILT = 38;

export const ApparatusParallaxColumn: React.FC<ApparatusParallaxColumnProps> = ({
  leftImages,
  rightImages,
  imageSrc,
  className = "",
  style,
  onLifecycleChange,
  scrollProgress = 0,
  columnGap = 4,
  imageGap = 4,
  motionVariant = "classic",
  borderRadius = 8,
  parallaxIntensity = 60,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const leftItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leftImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightImageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Custom height state determined dynamically
  const [viewportHeight, setViewportHeight] = useState(600);

  const configRef = useRef({
    splitRatio: BAKED_SPLIT_RATIO,
    speedFactor: BAKED_SPEED_FACTOR,
    bgScale: BAKED_BG_SCALE,
    inertia: BAKED_INERTIA,
    autoScrollSpeed: BAKED_AUTO_SCROLL_SPEED,
    columnGap,
    imageGap,
    motionVariant,
    borderRadius,
    concaveDepth: BAKED_CONCAVE_DEPTH,
    concaveTilt: BAKED_CONCAVE_TILT,
    convexBulge: BAKED_CONVEX_BULGE,
    convexTilt: BAKED_CONVEX_TILT,
    parallaxIntensity,
  });

  useEffect(() => {
    configRef.current = {
      splitRatio: BAKED_SPLIT_RATIO,
      speedFactor: BAKED_SPEED_FACTOR,
      bgScale: BAKED_BG_SCALE,
      inertia: BAKED_INERTIA,
      autoScrollSpeed: BAKED_AUTO_SCROLL_SPEED,
      columnGap,
      imageGap,
      motionVariant,
      borderRadius,
      concaveDepth: BAKED_CONCAVE_DEPTH,
      concaveTilt: BAKED_CONCAVE_TILT,
      convexBulge: BAKED_CONVEX_BULGE,
      convexTilt: BAKED_CONVEX_TILT,
      parallaxIntensity,
    };
  }, [
    columnGap,
    imageGap,
    motionVariant,
    borderRadius,
    parallaxIntensity,
  ]);

  // Image fallbacks
  const displayLeft = leftImages && leftImages.length > 0
    ? leftImages
    : [imageSrc || DEFAULT_LEFT_IMAGES[0], ...DEFAULT_LEFT_IMAGES.slice(1)];
  const displayRight = rightImages && rightImages.length > 0
    ? rightImages
    : DEFAULT_RIGHT_IMAGES;

  // Duplicate arrays twice to create a lightweight, seamless infinite loop rendering layout
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

  // Local playhead tracking scroll & drift progress
  const accumulatedProgress = useRef(0);
  const lastScrollProgress = useRef(scrollProgress);
  const scrollTimeoutRef = useRef<any>(null);
  const isScrollingRef = useRef(false);

  // Sync external scrollProgress changes into local accumulatedProgress
  useEffect(() => {
    const delta = scrollProgress - lastScrollProgress.current;
    lastScrollProgress.current = scrollProgress;

    if (Math.abs(delta) > 0.0001) {
      accumulatedProgress.current += delta;
      isScrollingRef.current = true;

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      // Very small delay to detect scroll stop and resume drift smoothly
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 400);
    }
  }, [scrollProgress]);

  // Direct wheel & touch gesture interceptors with Lenis smooth scroll integration
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      // Prevent default browser/page scrolling
      e.preventDefault();

      const wheelDelta = e.deltaY * 0.0009;
      accumulatedProgress.current += wheelDelta;
      isScrollingRef.current = true;

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
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
        const touchDelta = deltaY * 0.0028;
        accumulatedProgress.current += touchDelta;
        isScrollingRef.current = true;

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      lenis.destroy();
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // Compute card and item dimensions dynamically based on height, scale, and splitRatio
  const baseCardHeight = viewportHeight * (BAKED_BG_SCALE / 100) * 0.7;
  const baseCardWidth = baseCardHeight * 0.75; // 3:4 portrait card aspect ratio
  const itemHeight = baseCardHeight + imageGap;

  const leftCardWidth = baseCardWidth * (BAKED_SPLIT_RATIO / 50);
  const rightCardWidth = baseCardWidth * ((100 - BAKED_SPLIT_RATIO) / 50);

  const smoothProgressRef = useRef(0);
  const smoothVelocityRef = useRef(0);

  // Unified Frame-Rate Independent Engine (60Hz, 120Hz, 144Hz, 240Hz ProMotion Sync)
  useEffect(() => {
    let animationFrameId: number;

    const loop = () => {

      // 1. Auto drift when user is not actively scrolling
      if (!isScrollingRef.current) {
        accumulatedProgress.current += configRef.current.autoScrollSpeed * 0.00003;
      }

      // 2. Silky exponential ease dampening with natural inertia
      const diff = accumulatedProgress.current - smoothProgressRef.current;
      const inertiaFactor = 0.042;
      smoothProgressRef.current += diff * inertiaFactor;
      smoothVelocityRef.current += (diff - smoothVelocityRef.current) * 0.06;

      const N = displayLeft.length;
      const M = displayRight.length;
      const centerY = viewportHeight / 2;
      const variant = configRef.current.motionVariant;
      const isCylinder = variant === "cylinder";
      const isConvex = variant === "convex";

      if (N > 0 && M > 0 && leftColRef.current && rightColRef.current) {
        const leftOffset = ((smoothProgressRef.current * configRef.current.speedFactor) % N + N) % N;
        const rightOffset = (((1.0 - smoothProgressRef.current) * configRef.current.speedFactor) % M + M) % M;

        const leftY = -leftOffset * itemHeight;
        const rightY = -rightOffset * itemHeight;

        // Position column runners cleanly with 3D preservation
        gsap.set(leftColRef.current, { y: leftY, transformStyle: "preserve-3d" });
        gsap.set(rightColRef.current, { y: rightY, transformStyle: "preserve-3d" });

        // Process Left Column items
        leftItemRefs.current.forEach((cardEl, idx) => {
          if (cardEl) {
            const cardCenterY = leftY + idx * itemHeight + itemHeight / 2;
            const normDist = (cardCenterY - centerY) / centerY;

            if (isCylinder || isConvex) {
              const maxAngleDeg = isCylinder ? configRef.current.concaveTilt : configRef.current.convexTilt;
              const maxAngleRad = (maxAngleDeg * Math.PI) / 180;
              const angle = Math.max(-maxAngleRad, Math.min(maxAngleRad, normDist * maxAngleRad));

              const R = isCylinder ? configRef.current.concaveDepth : configRef.current.convexBulge;

              const z = isCylinder
                ? (Math.cos(angle) - 1) * R
                : (1 - Math.cos(angle)) * R;

              const rotateX = isCylinder
                ? -angle * (180 / Math.PI)
                : angle * (180 / Math.PI);

              const foreshorteningDelta = baseCardHeight * (1 - Math.cos(angle)) * 0.4;
              const yOffset = normDist > 0 ? -foreshorteningDelta : foreshorteningDelta;

              const normAbs = Math.abs(normDist);
              const opacity = normAbs >= 1.25 ? 0 : (normAbs > 1.0 ? Math.max(0, 1 - (normAbs - 1.0) / 0.25) : 1.0);

              gsap.set(cardEl, {
                y: yOffset,
                z,
                rotateX,
                scale: 1.0,
                opacity,
                transformOrigin: isCylinder ? "center center -200px" : "center center 200px",
                force3D: true
              });
            } else {
              const normAbs = Math.abs(normDist);
              const opacity = normAbs >= 1.25 ? 0 : (normAbs > 1.0 ? Math.max(0, 1 - (normAbs - 1.0) / 0.25) : 1.0);

              gsap.set(cardEl, {
                y: 0,
                z: 0,
                rotateX: 0,
                scale: 1.0,
                opacity,
                transformOrigin: "center center",
                force3D: true
              });
            }

            const innerImgEl = leftImageRefs.current[idx];
            if (innerImgEl) {
              const intensity = configRef.current.parallaxIntensity ?? 60;
              const parallaxRange = (intensity / 100) * 100;
              const innerY = normDist * -parallaxRange;
              gsap.set(innerImgEl, {
                y: innerY,
                force3D: true
              });
            }
          }
        });

        // Process Right Column items
        rightItemRefs.current.forEach((cardEl, idx) => {
          if (cardEl) {
            const cardCenterY = rightY + idx * itemHeight + itemHeight / 2;
            const normDist = (cardCenterY - centerY) / centerY;

            if (isCylinder || isConvex) {
              const maxAngleDeg = isCylinder ? configRef.current.concaveTilt : configRef.current.convexTilt;
              const maxAngleRad = (maxAngleDeg * Math.PI) / 180;
              const angle = Math.max(-maxAngleRad, Math.min(maxAngleRad, normDist * maxAngleRad));

              const R = isCylinder ? configRef.current.concaveDepth : configRef.current.convexBulge;
              const z = isCylinder
                ? (Math.cos(angle) - 1) * R
                : (1 - Math.cos(angle)) * R;

              const rotateX = isCylinder
                ? -angle * (180 / Math.PI)
                : angle * (180 / Math.PI);

              const foreshorteningDelta = baseCardHeight * (1 - Math.cos(angle)) * 0.4;
              const yOffset = normDist > 0 ? -foreshorteningDelta : foreshorteningDelta;

              const normAbs = Math.abs(normDist);
              const opacity = normAbs >= 1.25 ? 0 : (normAbs > 1.0 ? Math.max(0, 1 - (normAbs - 1.0) / 0.25) : 1.0);

              gsap.set(cardEl, {
                y: yOffset,
                z,
                rotateX,
                scale: 1.0,
                opacity,
                transformOrigin: isCylinder ? "center center -200px" : "center center 200px",
                force3D: true
              });
            } else {
              const normAbs = Math.abs(normDist);
              const opacity = normAbs >= 1.25 ? 0 : (normAbs > 1.0 ? Math.max(0, 1 - (normAbs - 1.0) / 0.25) : 1.0);

              gsap.set(cardEl, {
                y: 0,
                z: 0,
                rotateX: 0,
                scale: 1.0,
                opacity,
                transformOrigin: "center center",
                force3D: true
              });
            }

            const innerImgEl = rightImageRefs.current[idx];
            if (innerImgEl) {
              const intensity = configRef.current.parallaxIntensity ?? 60;
              const parallaxRange = (intensity / 100) * 100;
              const innerY = normDist * -parallaxRange;
              gsap.set(innerImgEl, {
                y: innerY,
                force3D: true
              });
            }
          }
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [displayLeft.length, displayRight.length, itemHeight, viewportHeight]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden bg-[#070709] flex items-center justify-center select-none ${className}`}
      style={{
        ...style,
        perspective: "1000px",
        transformStyle: "preserve-3d"
      }}
    >
      <div
        className="h-full flex items-center justify-center"
        style={{
          gap: `${columnGap}px`,
          transformStyle: "preserve-3d"
        }}
      >
        {/* LEFT COLUMN (Downwards runway) */}
        <div
          ref={leftColRef}
          className="h-full flex flex-col items-center will-change-transform"
          style={{
            width: `${leftCardWidth}px`,
            transformStyle: "preserve-3d"
          }}
        >
          {infiniteLeft.map((img, idx) => (
            <div
              key={idx}
              className="w-full shrink-0 flex items-center justify-center relative"
              style={{
                height: `${itemHeight}px`,
                transformStyle: "preserve-3d"
              }}
            >
              {/* Card Window Container */}
              <div
                ref={(el) => {
                  leftItemRefs.current[idx] = el;
                }}
                className="overflow-hidden relative"
                style={{
                  width: `${leftCardWidth}px`,
                  height: `${baseCardHeight}px`,
                  borderRadius: `${borderRadius}px`,
                  boxShadow: "0 14px 32px rgba(0,0,0,0.45)",
                  willChange: "transform, opacity",
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Inner Window Parallax Image */}
                <div
                  ref={(el) => {
                    leftImageRefs.current[idx] = el;
                  }}
                  style={{
                    position: "absolute",
                    top: "-35%",
                    left: "0",
                    width: "100%",
                    height: "170%",
                    backgroundImage: `url("${img}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    willChange: "transform"
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN (Upwards counter-runway) */}
        <div
          ref={rightColRef}
          className="h-full flex flex-col items-center will-change-transform"
          style={{
            width: `${rightCardWidth}px`,
            transformStyle: "preserve-3d"
          }}
        >
          {infiniteRight.map((img, idx) => (
            <div
              key={idx}
              className="w-full shrink-0 flex items-center justify-center relative"
              style={{
                height: `${itemHeight}px`,
                transformStyle: "preserve-3d"
              }}
            >
              {/* Card Window Container */}
              <div
                ref={(el) => {
                  rightItemRefs.current[idx] = el;
                }}
                className="overflow-hidden relative"
                style={{
                  width: `${rightCardWidth}px`,
                  height: `${baseCardHeight}px`,
                  borderRadius: `${borderRadius}px`,
                  boxShadow: "0 14px 32px rgba(0,0,0,0.45)",
                  willChange: "transform, opacity",
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Inner Window Parallax Image */}
                <div
                  ref={(el) => {
                    rightImageRefs.current[idx] = el;
                  }}
                  style={{
                    position: "absolute",
                    top: "-35%",
                    left: "0",
                    width: "100%",
                    height: "170%",
                    backgroundImage: `url("${img}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    willChange: "transform"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApparatusParallaxColumn;
