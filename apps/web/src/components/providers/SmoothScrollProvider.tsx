"use client";

import { ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useGSAP(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), // Abyss exponential decay ease
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    });

    (window as unknown as { lenis: Lenis }).lenis = lenis;

    // Update ScrollTrigger on Lenis scroll
    lenis.on("scroll", ScrollTrigger.update);

    // Sync Lenis frame updates to GSAP ticker
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000); // GSAP is in seconds, Lenis is in ms
    };
    gsap.ticker.add(updateTicker);
    // Enable GSAP lag smoothing to prevent animation stuttering on frame drops
    gsap.ticker.lagSmoothing(500, 33);

    // Watch for DOM height changes and resize Lenis
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });
    resizeObserver.observe(document.body);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(updateTicker);
      resizeObserver.disconnect();
    };
  }, []);

  return <>{children}</>;
}
