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

      const diff = targetScroll - currentScroll;
      if (Math.abs(diff) > 0.2) {
        // Frame-rate independent exponential smoothing (120Hz & 60Hz calibrated)
        const lerpFactor = 1 - Math.exp(-0.018 * deltaMs);
        currentScroll += diff * Math.max(0.12, Math.min(0.4, lerpFactor * 10));
        el.scrollTop = currentScroll;
        rafId = requestAnimationFrame(animate);
      } else {
        currentScroll = targetScroll;
        el.scrollTop = currentScroll;
        rafId = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const maxScroll = el.scrollHeight - el.clientHeight;
      targetScroll = Math.max(0, Math.min(maxScroll, targetScroll + e.deltaY * 0.9));
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
