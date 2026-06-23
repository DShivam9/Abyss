"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Register GSAP ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // If user prefers reduced motion, don't initialize Lenis, let native scrolling take over.
    // We still want ScrollTrigger for standard intersection logic if needed, but no smooth scroll hijacking.
    let lenisInstance: Lenis | null = null;
    let updateTicker: ((time: number) => void) | null = null;

    if (!prefersReducedMotion) {
      // Initialize Lenis smooth scroll
      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth decelerating physics
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
      });

      queueMicrotask(() => setLenis(lenisInstance));

      // Connect Lenis events to GSAP ScrollTrigger
      lenisInstance.on("scroll", () => {
        ScrollTrigger.update();
      });

      // Synchronize Lenis frames with GSAP ticker loop
      updateTicker = (time: number) => {
        lenisInstance?.raf(time * 1000); // convert GSAP time (seconds) to milliseconds
      };
      
      gsap.ticker.add(updateTicker);

      // Disable lag smoothing for frame-perfect scroll linking
      gsap.ticker.lagSmoothing(0);

      // Set scroll proxy for ScrollTrigger (in case we need mock pinning containers)
      ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
          if (arguments.length) {
            lenisInstance?.scrollTo(value as number, { immediate: true });
          }
          return lenisInstance?.scroll || window.scrollY;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        pinType: "transform",
      });
    }

    // Refresh ScrollTrigger on initialization
    ScrollTrigger.refresh();

    // Trigger refresh when all images load
    const handleLoad = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("load", handleLoad);

    // Trigger refresh when fonts load
    if (document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    // Cleanup
    return () => {
      window.removeEventListener("load", handleLoad);
      if (lenisInstance) {
        lenisInstance.destroy();
      }
      if (updateTicker) {
        gsap.ticker.remove(updateTicker);
      }
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
