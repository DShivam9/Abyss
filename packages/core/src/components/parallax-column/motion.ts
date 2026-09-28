import { useEffect, useRef, useState, RefObject, MutableRefObject } from "react";
import gsap from "gsap";
import Lenis from "lenis";
import { useLatestRef } from "../../hooks";
import {
  BAKED_SPEED_FACTOR,
  BAKED_AUTO_SCROLL_SPEED,
  BAKED_CONCAVE_DEPTH,
  BAKED_CONCAVE_TILT,
  BAKED_CONVEX_BULGE,
  BAKED_CONVEX_TILT,
} from "./constants";

export interface ParallaxMotionParams {
  containerRef: RefObject<HTMLDivElement | null>;
  leftColRef: RefObject<HTMLDivElement | null>;
  rightColRef: RefObject<HTMLDivElement | null>;
  leftItemRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  rightItemRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  leftImageRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  rightImageRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  displayLeftCount: number;
  displayRightCount: number;
  itemHeight: number;
  baseCardHeight: number;
  viewportHeight: number;
  scrollProgress: number;
  motionVariant: "classic" | "cylinder" | "convex";
  parallaxIntensity: number;
}

/**
 * Dynamically measures container height via ResizeObserver.
 */
export function useViewportHeight(containerRef: RefObject<HTMLDivElement | null>): number {
  const [viewportHeight, setViewportHeight] = useState(600);

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
  }, [containerRef]);

  return viewportHeight;
}

/**
 * Orchestrates Lenis wheel/touch gestures, auto-drift, and frame-rate independent 3D runway rendering.
 */
export function useParallaxMotion({
  containerRef,
  leftColRef,
  rightColRef,
  leftItemRefs,
  rightItemRefs,
  leftImageRefs,
  rightImageRefs,
  displayLeftCount,
  displayRightCount,
  itemHeight,
  baseCardHeight,
  viewportHeight,
  scrollProgress,
  motionVariant,
  parallaxIntensity,
}: ParallaxMotionParams) {
  const accumulatedProgress = useRef(0);
  const lastScrollProgress = useRef(scrollProgress);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScrollingRef = useRef(false);

  const motionVariantRef = useLatestRef(motionVariant);
  const parallaxIntensityRef = useLatestRef(parallaxIntensity);

  // Sync external scrollProgress changes into local accumulatedProgress
  useEffect(() => {
    const delta = scrollProgress - lastScrollProgress.current;
    lastScrollProgress.current = scrollProgress;

    if (Math.abs(delta) > 0.0001) {
      accumulatedProgress.current += delta;
      isScrollingRef.current = true;

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

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
  }, [containerRef]);

  const smoothProgressRef = useRef(0);
  const smoothVelocityRef = useRef(0);

  // Unified Frame-Rate Independent Engine (60Hz, 120Hz, 144Hz, 240Hz ProMotion Sync)
  useEffect(() => {
    let animationFrameId: number;
    let lastLoopTime = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = Math.min((now - lastLoopTime) / 1000, 0.1);
      lastLoopTime = now;
      const dtRatio = dt * 60;

      // 1. Auto drift when user is not actively scrolling
      if (!isScrollingRef.current) {
        accumulatedProgress.current += BAKED_AUTO_SCROLL_SPEED * 0.00003 * dtRatio;
      }

      // 2. Exponential ease dampening with natural inertia
      const diff = accumulatedProgress.current - smoothProgressRef.current;
      const inertiaDamp = 1 - Math.pow(1 - 0.042, dtRatio);
      smoothProgressRef.current += diff * inertiaDamp;
      const velDamp = 1 - Math.pow(1 - 0.06, dtRatio);
      smoothVelocityRef.current += (diff - smoothVelocityRef.current) * velDamp;

      const N = displayLeftCount;
      const M = displayRightCount;
      const centerY = viewportHeight / 2;
      const variant = motionVariantRef.current;
      const isCylinder = variant === "cylinder";
      const isConvex = variant === "convex";

      if (N > 0 && M > 0 && leftColRef.current && rightColRef.current) {
        const leftOffset = ((smoothProgressRef.current * BAKED_SPEED_FACTOR) % N + N) % N;
        const rightOffset = (((1.0 - smoothProgressRef.current) * BAKED_SPEED_FACTOR) % M + M) % M;

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
              const maxAngleDeg = isCylinder ? BAKED_CONCAVE_TILT : BAKED_CONVEX_TILT;
              const maxAngleRad = (maxAngleDeg * Math.PI) / 180;
              const angle = Math.max(-maxAngleRad, Math.min(maxAngleRad, normDist * maxAngleRad));

              const R = isCylinder ? BAKED_CONCAVE_DEPTH : BAKED_CONVEX_BULGE;

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
                force3D: true,
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
                force3D: true,
              });
            }

            const innerImgEl = leftImageRefs.current[idx];
            if (innerImgEl) {
              const intensity = parallaxIntensityRef.current ?? 60;
              const parallaxRange = (intensity / 100) * 100;
              const innerY = normDist * -parallaxRange;
              gsap.set(innerImgEl, {
                y: innerY,
                force3D: true,
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
              const maxAngleDeg = isCylinder ? BAKED_CONCAVE_TILT : BAKED_CONVEX_TILT;
              const maxAngleRad = (maxAngleDeg * Math.PI) / 180;
              const angle = Math.max(-maxAngleRad, Math.min(maxAngleRad, normDist * maxAngleRad));

              const R = isCylinder ? BAKED_CONCAVE_DEPTH : BAKED_CONVEX_BULGE;

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
                force3D: true,
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
                force3D: true,
              });
            }

            const innerImgEl = rightImageRefs.current[idx];
            if (innerImgEl) {
              const intensity = parallaxIntensityRef.current ?? 60;
              const parallaxRange = (intensity / 100) * 100;
              const innerY = normDist * -parallaxRange;
              gsap.set(innerImgEl, {
                y: innerY,
                force3D: true,
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
  }, [
    displayLeftCount,
    displayRightCount,
    itemHeight,
    baseCardHeight,
    viewportHeight,
    leftColRef,
    rightColRef,
    leftItemRefs,
    rightItemRefs,
    leftImageRefs,
    rightImageRefs,
    motionVariantRef,
    parallaxIntensityRef,
  ]);
}
