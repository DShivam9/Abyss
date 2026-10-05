import { useEffect, useState, useRef, RefObject } from "react";

export interface UseInViewOptions {
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
  initialInView?: boolean;
}

/**
 * Tracks element visibility in the viewport using IntersectionObserver.
 * Provides both state `inView` for React renders and `inViewRef` for synchronous RAF loops.
 */
export function useInView(
  ref: RefObject<Element | null>,
  options: UseInViewOptions = {}
): boolean {
  const { root = null, rootMargin = "0px", threshold = 0, initialInView = true } = options;
  const [inView, setInView] = useState<boolean>(initialInView);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const target = ref.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setInView(entry.isIntersecting);
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [ref, root, rootMargin, threshold]);

  return inView;
}

/**
 * Ref-based IntersectionObserver tracking for continuous animation loops
 * that need to pause/resume without triggering React component re-renders.
 */
export function useInViewRef(
  ref: RefObject<Element | null>,
  options: UseInViewOptions = {}
): RefObject<boolean> {
  const { root = null, rootMargin = "0px", threshold = 0, initialInView = true } = options;
  const inViewRef = useRef<boolean>(initialInView);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const target = ref.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          inViewRef.current = entry.isIntersecting;
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [ref, root, rootMargin, threshold]);

  return inViewRef;
}
