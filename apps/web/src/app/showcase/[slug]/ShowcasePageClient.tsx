"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { getComponent } from "@/lib/component-registry";
import { useScroll, useMotionValueEvent } from "framer-motion";

export default function ShowcasePageClient({ slug }: { slug: string }) {
  const { Component, meta } = getComponent(slug);

  const runwayRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress for scroll runway components that take scrollProgress as a prop
  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollProgress(latest);
    // Dispatch scroll event for components (like apparatus-velocity-deck) that listen to window.scrollY/velocity
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("scroll"));
    }
  });

  if (!meta || !Component) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center font-mono text-xs text-neutral-500 uppercase tracking-widest">
        Showcase component not found.
      </div>
    );
  }

  const DynamicComponent = Component as React.ComponentType<{
    scrollProgress?: number;
    isFullscreen?: boolean;
    className?: string;
  }>;

  const isParallaxColumn = slug === "apparatus-parallax-column";

  return (
    <main className="w-full min-h-screen bg-[#070708] text-white">
      {/* Pinned Back Navigation Header */}
      <nav className="fixed top-6 left-6 z-[1000] pointer-events-auto">
        <Link
          href={`/components/${slug}`}
          className="font-mono text-[9px] font-bold text-neutral-400 hover:text-white transition-all bg-[#0a0a0b]/80 hover:bg-[#0a0a0b] px-4 py-2 border border-white/5 rounded-full backdrop-blur-md tracking-widest uppercase flex items-center gap-1.5 shadow-lg"
        >
          ← BACK TO SPEC
        </Link>
      </nav>

      {isParallaxColumn ? (
        <div className="w-full h-screen overflow-hidden">
          <DynamicComponent
            isFullscreen={true}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        /* Standard sticky scroll runway wrapper */
        <div ref={runwayRef} className="relative w-full h-[450vh]">
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            <DynamicComponent
              scrollProgress={scrollProgress}
              isFullscreen={true}
              className="w-full h-full object-cover"
            />

            {/* Not-so-thin progress bar on the bottom of the page */}
            <div className="fixed bottom-0 left-0 w-full h-[5px] bg-neutral-950/60 z-[1000] overflow-hidden">
              <div
                className="h-full bg-[#dfb15b] transition-all duration-75"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
