"use client";

import { useRef, useEffect } from "react";

export function useSmoothScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let targetScroll = el.scrollTop;
    let currentScroll = el.scrollTop;
    let rafId: number | null = null;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const deltaMs = Math.min(32, Math.max(1, now - lastTime));
      lastTime = now;

      // Smooth critically-damped spring interpolation
      const diff = targetScroll - currentScroll;
      if (Math.abs(diff) > 0.1) {
        const factor = 1 - Math.exp(-0.014 * deltaMs);
        currentScroll += diff * factor;
        el.scrollTop = currentScroll;
        rafId = requestAnimationFrame(animate);
      } else {
        currentScroll = targetScroll;
        el.scrollTop = targetScroll;
        rafId = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      e.preventDefault();

      // Normalize wheel delta for high-precision trackpads and notched wheels
      const delta = Math.abs(e.deltaY) < 40 ? e.deltaY * 1.8 : e.deltaY * 0.85;
      const maxScroll = el.scrollHeight - el.clientHeight;
      
      // Update target relative to where current visual scroll is
      targetScroll = Math.max(0, Math.min(maxScroll, (rafId ? targetScroll : currentScroll) + delta));
      lastTime = performance.now();

      if (rafId === null) {
        rafId = requestAnimationFrame(animate);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return ref;
}
