"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DockNavbar } from "@/components/layout/DockNavbar";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { SEARCH_INDEX } from "@/lib/registry";

export default function HomePage() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E8ED] flex flex-col font-['Switzer',sans-serif] selection:bg-white selection:text-black">
      {/* Main Dock Navbar */}
      <DockNavbar onOpenSearch={() => setCommandPaletteOpen(true)} />

      {/* Hero Section — Minimalist Centered ABYSS */}
      <main id="main-content" className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="relative z-10 flex flex-col items-center justify-center gap-8">
          <h1 className="text-6xl sm:text-7xl md:text-9xl lg:text-[140px] font-semibold tracking-tight text-white font-['Ranade',sans-serif] select-none leading-none">
            ABYSS
          </h1>

          {/* Pill Hover-Reveal Arrow Hero Action Button */}
          <div className="flex items-center justify-center pointer-events-auto">
            <Link
              href="/collection"
              className="group relative flex items-center h-12 text-black font-['Switzer',sans-serif] active:scale-[0.97] transition-transform duration-160 cursor-pointer"
            >
              {/* Inner Label */}
              <div className="bg-white rounded-full h-12 px-8 flex items-center justify-center whitespace-nowrap text-sm font-semibold relative z-10 w-full group-hover:w-[calc(100%-52px)] transition-all duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)]">
                Browse Collection
              </div>

              {/* Frost Blue Circle Arrow Reveal */}
              <div className="bg-[#9be5fb] rounded-full h-12 w-12 flex items-center justify-center absolute right-0 scale-0 origin-left group-hover:scale-100 transition-transform duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)]">
                <span className="grid place-items-center w-full h-full text-black -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] delay-100">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Under-the-hood Upgrade Notice */}
      <footer className="w-full pb-8 pt-4 px-6 text-center pointer-events-auto">
        <p className="text-xs text-neutral-500 max-w-lg mx-auto tracking-normal leading-relaxed select-none">
          Yes, it&apos;s literally just a word and a button right now. We tore down the old landing page because it was starting to feel too comfortable. A proper, unhinged UI overhaul is brewing in the background. Go raid the collection while we finish cooking.
        </p>
      </footer>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        components={SEARCH_INDEX}
      />
    </div>
  );
}
