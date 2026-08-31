"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useGSAP(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // ponytail: natural 1:1 wheel multiplier + crisp duration for responsive scrolling
    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      infinite: false,
      autoRaf: false,
    });

    (window as unknown as { lenis: Lenis }).lenis = lenis;

    // Update ScrollTrigger on Lenis scroll
    lenis.on("scroll", ScrollTrigger.update);

    // Sync Lenis frame updates to GSAP ticker
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000); // GSAP is in seconds, Lenis is in ms
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(500, 33);

    // Native ResizeObserver: automatically track DOM mutations, images, fonts, and grid expansion
    let resizeTimer: NodeJS.Timeout;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      }, 50);
    });

    if (document.body) {
      ro.observe(document.body);
    }

    return () => {
      ro.disconnect();
      clearTimeout(resizeTimer);
      lenis.destroy();
      gsap.ticker.remove(updateTicker);
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);

  // Sync scroll position, bounds and ScrollTrigger on route navigation
  useEffect(() => {
    const lenis = (window as unknown as { lenis?: Lenis }).lenis;
    if (!lenis) return;

    lenis.scrollTo(0, { immediate: true });
    lenis.resize();
    ScrollTrigger.refresh();

    const timer = setTimeout(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return <>{children}</>;
}
