"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setVisible(window.scrollY > 280);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollToTop = () => {
    const lenis = (
      window as unknown as {
        lenis?: {
          scrollTo: (
            target: HTMLElement | number,
            opts?: Record<string, unknown>
          ) => void;
        };
      }
    ).lenis;

    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleScrollToTop}
      className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#121215]/90 backdrop-blur-md border border-[rgba(255,255,255,0.12)] text-[#8e8e93] hover:text-white hover:border-[#9be5fb] shadow-2xl transition-[color,background-color,border-color,transform] duration-200 ease-out cursor-pointer group active:scale-95 animate-in fade-in zoom-in-95"
      title="Scroll to Top"
    >
      {/* Smooth Rolling Arrow Container */}
      <div className="relative w-3.5 h-3.5 overflow-hidden flex items-center justify-center">
        <ArrowUp className="w-3.5 h-3.5 text-[#9be5fb] absolute inset-0 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full" />
        <ArrowUp className="w-3.5 h-3.5 text-[#9be5fb] absolute inset-0 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-full group-hover:translate-y-0" />
      </div>

      <span className="font-mono text-xs uppercase tracking-wider font-semibold">
        Top
      </span>
    </button>
  );
}
