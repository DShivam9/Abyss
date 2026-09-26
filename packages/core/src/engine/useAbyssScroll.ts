import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface AbyssScrollState {
  scrollY: number;
  velocity: number;
  progress: number; // Viewport progress 0 to 1
}

export function useAbyssScroll(containerRef: React.RefObject<HTMLElement | null>) {
  const stateRef = useRef<AbyssScrollState>({
    scrollY: 0,
    velocity: 0,
    progress: 0,
  });

  const lastScrollY = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      const currentScrollY = window.scrollY;
      const now = performance.now();
      const dt = Math.max(now - lastTime.current, 1); // Avoid division by zero

      const dy = currentScrollY - lastScrollY.current;
      const speed = dy / dt; // pixels per ms

      stateRef.current.scrollY = currentScrollY;
      stateRef.current.velocity = speed;

      if (container) {
        const rect = container.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        // Progress of element passing through the viewport
        const totalDist = rect.height + viewportHeight;
        const currentDist = viewportHeight - rect.top;
        stateRef.current.progress = THREE.MathUtils.clamp(currentDist / totalDist, 0, 1);
      }

      lastScrollY.current = currentScrollY;
      lastTime.current = now;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initialize
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [containerRef]);

  // A simple update function to decay/lerp the velocity over time when no scroll events occur
  const updateScroll = () => {
    stateRef.current.velocity = THREE.MathUtils.lerp(stateRef.current.velocity, 0, 0.1);
  };

  return {
    stateRef,
    updateScroll,
  };
}
