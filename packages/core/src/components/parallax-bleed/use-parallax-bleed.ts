import { useRef, useEffect, useMemo, RefObject, MutableRefObject } from "react";
import gsap from "gsap";
import { BleedSection } from "./types";
import { BAKED_SCROLL_SPEED, BAKED_INERTIAL_DAMPING } from "./constants";
import { AbyssComponentProps } from "../../engine/types";

export interface UseParallaxBleedParams {
  containerRef: RefObject<HTMLDivElement | null>;
  sectionRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  imageRefs: MutableRefObject<(HTMLImageElement | null)[]>;
  textRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  dashRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  sections: BleedSection[];
  parallaxIntensity: number;
  indicatorStyle: "dashes" | "dots" | "hidden";
  externalProgress?: number;
  onLifecycleChange?: AbyssComponentProps["onLifecycleChange"];
}

export function useParallaxBleed({
  containerRef,
  sectionRefs,
  imageRefs,
  textRefs,
  dashRefs,
  sections,
  parallaxIntensity,
  indicatorStyle,
  externalProgress = 0,
  onLifecycleChange,
}: UseParallaxBleedParams) {
  const targetProgressRef = useRef<number>(0);
  const smoothProgressRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const propsRef = useRef({
    parallaxIntensity,
    indicatorStyle,
  });

  useEffect(() => {
    propsRef.current = {
      parallaxIntensity,
      indicatorStyle,
    };
  }, [parallaxIntensity, indicatorStyle]);

  const parallaxOffsetRatio = useMemo(() => {
    return (parallaxIntensity / 100) * 0.20;
  }, [parallaxIntensity]);

  // Sync external scroll progress when provided
  useEffect(() => {
    if (externalProgress > 0) {
      targetProgressRef.current = externalProgress;
    }
  }, [externalProgress]);

  // Self-contained container wheel + touch listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.00045 * BAKED_SCROLL_SPEED;
      targetProgressRef.current += delta;
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      targetProgressRef.current += deltaY * 0.001 * BAKED_SCROLL_SPEED;
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [containerRef]);

  // 60FPS Continuous Upward Parallax Engine
  useEffect(() => {
    let lastTime = performance.now();
    let lastProgress = 0;
    let isVisible = true;
    let isDisposed = false;

    const renderLoop = (time: number) => {
      if (isDisposed || !isVisible) return;
      animationFrameRef.current = requestAnimationFrame(renderLoop);

      try {
        const dt = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;

        const { indicatorStyle: indStyle } = propsRef.current;
        const lerpSpeed = BAKED_INERTIAL_DAMPING;
        smoothProgressRef.current += (targetProgressRef.current - smoothProgressRef.current) * (1 - Math.exp(-lerpSpeed * dt));

        const p = smoothProgressRef.current;

        const rawVelocity = (p - lastProgress) / Math.max(dt, 0.001);
        lastProgress = p;

        velocityRef.current += (rawVelocity - velocityRef.current) * (1 - Math.exp(-8.0 * dt));

        const totalCount = sections.length;

        // Update indicators
        if (indStyle !== "hidden") {
          const activeIndex = (((Math.round(p) % totalCount) + totalCount) % totalCount);
          dashRefs.current.forEach((dash, idx) => {
            if (!dash || !document.body.contains(dash)) return;
            const isActive = idx === activeIndex;
            if (indStyle === "dots") {
              gsap.set(dash, {
                height: 6,
                width: isActive ? 12 : 6,
                borderRadius: 9999,
                opacity: isActive ? 1.0 : 0.25,
              });
            } else {
              gsap.set(dash, {
                height: isActive ? 28 : 10,
                width: 2,
                borderRadius: 9999,
                opacity: isActive ? 1.0 : 0.25,
              });
            }
          });
        }

        // Lifecycle updates
        if (onLifecycleChange) {
          const cycleProgress = ((p % 1) + 1) % 1;
          if (cycleProgress < 0.25) onLifecycleChange("idle");
          else if (cycleProgress < 0.5) onLifecycleChange("discovery");
          else if (cycleProgress < 0.75) onLifecycleChange("buildUp");
          else onLifecycleChange("peak");
        }

        // Compute Continuous Upward Parallax Position
        sections.forEach((_, idx) => {
          const secEl = sectionRefs.current[idx];
          const imgEl = imageRefs.current[idx];
          const textEl = textRefs.current[idx];
          if (!secEl || !imgEl || !document.body.contains(secEl)) return;

          const rawPos = idx - p;
          const wrappedPos = (((rawPos + totalCount / 2) % totalCount) + totalCount) % totalCount - totalCount / 2;

          const sectionY = wrappedPos * 100;
          const zIndex = Math.round(10 - Math.abs(wrappedPos) * 2);

          gsap.set(secEl, {
            y: `${sectionY}%`,
            zIndex: zIndex,
          });

          const internalImgY = -wrappedPos * parallaxOffsetRatio * 100;

          gsap.set(imgEl, {
            y: `${internalImgY}%`,
          });

          if (textEl) {
            const textBlockY = wrappedPos * 38;
            gsap.set(textEl, {
              y: `${textBlockY}%`,
            });
          }
        });
      } catch (err) {
        console.warn("[ParallaxBleed] Render loop warning:", err);
      }
    };

    let observer: IntersectionObserver | null = null;
    const container = containerRef.current;
    if (container && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const visible = entry ? entry.isIntersecting : true;
          if (visible !== isVisible) {
            isVisible = visible;
            if (isVisible && !isDisposed) {
              lastTime = performance.now();
              if (!animationFrameRef.current) {
                animationFrameRef.current = requestAnimationFrame(renderLoop);
              }
            } else if (!isVisible && animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
            }
          }
        },
        { threshold: 0 }
      );
      observer.observe(container);
    }

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isDisposed = true;
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [sections, parallaxOffsetRatio, onLifecycleChange, sectionRefs, imageRefs, textRefs, dashRefs, containerRef]);
}
