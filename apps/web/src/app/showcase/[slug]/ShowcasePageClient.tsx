"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { getComponent } from "@/lib/component-registry";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ShowcasePageClient({ slug }: { slug: string }) {
  const router = useRouter();
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

  if (!meta || !Component || meta.previewType !== "scroll") {
    if (typeof window !== "undefined") {
      router.replace(`/components/${slug}`);
    }
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center font-mono text-xs text-neutral-500 uppercase tracking-widest">
        Redirecting...
      </div>
    );
  }

  const DynamicComponent = Component as React.ComponentType<{
    scrollProgress?: number;
    isFullscreen?: boolean;
    className?: string;
  }>;

  const isParallaxColumn = slug === "apparatus-parallax-column";
  const isVirtualScroll =
    slug === "apparatus-phase-drift" ||
    slug === "apparatus-cylinder-scroll" ||
    slug === "apparatus-depth-swim";

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

      {isParallaxColumn || slug === "apparatus-dual-wave" || isVirtualScroll ? (
        <div className="w-full h-screen overflow-hidden">
          <DynamicComponent
            isFullscreen={true}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        /* Standard sticky scroll runway wrapper */
        <div ref={runwayRef} className={`relative w-full ${slug === "apparatus-dual-wave" ? "h-[1000vh]" : "h-[450vh]"}`}>
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            <DynamicComponent
              scrollProgress={scrollProgress}
              isFullscreen={true}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </main>
  );
}
