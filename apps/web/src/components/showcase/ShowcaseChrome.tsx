"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sliders, ChevronDown, Search, ArrowLeft, ArrowRight } from "lucide-react";
import { ComponentDetail, COMPONENT_DETAILS } from "@/lib/component-registry";

function getInteractionPrompt(comp: ComponentDetail): string {
  if (comp.previewType === "scroll" || comp.category === "scroll") {
    return "Scroll to animate";
  }
  if (comp.previewType === "gallery" || comp.category === "gallary") {
    return "Drag or scroll to navigate";
  }
  if (comp.previewType === "transition" || comp.category === "transition") {
    return "Click or scroll to transition";
  }
  if (comp.category === "text") {
    return "Hover or scroll text";
  }
  return "Move cursor to interact";
}

interface ShowcaseChromeProps {
  component: ComponentDetail;
  children: React.ReactNode;
  onToggleControls?: () => void;
  controlsOpen?: boolean;
}

export function ShowcaseChrome({
  component,
  children,
  onToggleControls,
  controlsOpen,
}: ShowcaseChromeProps) {
  const router = useRouter();
  const [chromeVisible, setChromeVisible] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allComponents = Object.values(COMPONENT_DETAILS);
  const categoryItems = allComponents.filter((c) => c.category === component.category);
  const currentIndex = categoryItems.findIndex((c) => c.slug === component.slug);
  const prevComp = currentIndex > 0 ? categoryItems[currentIndex - 1] : null;
  const nextComp = currentIndex < categoryItems.length - 1 ? categoryItems[currentIndex + 1] : null;

  // Auto-hide chrome after 3.5 seconds of inactivity
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleMouseMove = () => {
      setChromeVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!dropdownOpen && !controlsOpen) {
          setChromeVisible(false);
        }
      }, 3500);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timer);
    };
  }, [dropdownOpen, controlsOpen]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcuts (←/→/Esc/C/F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Escape") {
        if (dropdownOpen) {
          setDropdownOpen(false);
        } else {
          router.push(`/components/${component.slug}`);
        }
      } else if (e.key === "ArrowLeft" && prevComp) {
        router.push(`/showcase/${prevComp.slug}`);
      } else if (e.key === "ArrowRight" && nextComp) {
        router.push(`/showcase/${nextComp.slug}`);
      } else if (e.key.toLowerCase() === "c" && onToggleControls) {
        onToggleControls();
      } else if (e.key.toLowerCase() === "f") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [component.slug, prevComp, nextComp, router, onToggleControls, dropdownOpen]);

  const filteredComponents = allComponents.filter(
    (c) =>
      c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-full bg-[#070708] font-sans antialiased text-white">
      {/* Sleek Top Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex h-[52px] items-center justify-between px-6 bg-[#070708]/80 backdrop-blur-md border-b border-neutral-900/60 transition-opacity duration-300 ${
          chromeVisible || dropdownOpen || controlsOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Left: Back Link & Category Badge */}
        <div className="flex items-center gap-3">
          <Link
            href={`/components?tab=${component.category}`}
            className="flex items-center gap-1.5 text-xs tracking-wide text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Catalog</span>
          </Link>
          <span className="text-[11px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
            {component.category}
          </span>
        </div>

        {/* Center: Global Component Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-neutral-900/80 transition-all cursor-pointer group"
          >
            <span className="text-sm font-medium tracking-wide text-neutral-200 group-hover:text-white">
              {component.label}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {/* Global Traversal Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                data-lenis-prevent
                onWheel={(e) => e.stopPropagation()}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 max-h-[360px] bg-[#0c0c0e]/95 backdrop-blur-xl border border-neutral-800/90 rounded-lg shadow-2xl overflow-hidden flex flex-col z-50 origin-top"
              >
                {/* Search Header */}
                <div className="p-2 border-b border-neutral-800/80 flex items-center gap-2 bg-neutral-950/60">
                  <Search className="w-3.5 h-3.5 text-neutral-400 ml-1.5" />
                  <input
                    type="text"
                    placeholder="Jump to component..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none py-1 font-sans"
                  />
                </div>

                {/* Component List */}
                <div
                  data-lenis-prevent
                  onWheel={(e) => e.stopPropagation()}
                  className="overflow-y-auto p-1.5 space-y-0.5 max-h-[290px] text-xs scroll-smooth overscroll-contain [scrollbar-width:thin] [scrollbar-color:#333_transparent]"
                >
                  {filteredComponents.length === 0 ? (
                    <div className="px-3 py-4 text-center text-neutral-500">No components found</div>
                  ) : (
                    filteredComponents.map((c) => {
                      const isActive = c.slug === component.slug;
                      return (
                        <button
                          key={c.slug}
                          onClick={() => {
                            setDropdownOpen(false);
                            router.push(`/showcase/${c.slug}`);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between transition-colors cursor-pointer ${
                            isActive
                              ? "bg-white/10 text-white font-medium"
                              : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                          }`}
                        >
                          <span className="truncate">{c.label}</span>
                          <span className="text-[10px] font-mono uppercase text-neutral-500 ml-2">
                            {c.category}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Controls Button */}
        {onToggleControls ? (
          <button
            onClick={onToggleControls}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs tracking-wide transition-all duration-200 shadow-md cursor-pointer ${
              controlsOpen
                ? "bg-white text-black border-white font-semibold"
                : "bg-neutral-900/90 hover:bg-neutral-800 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Controls</span>
            <span className="text-[10px] font-mono px-1 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/60">
              C
            </span>
          </button>
        ) : (
          <div className="w-20" />
        )}
      </header>

      {/* Main Showcase Stage */}
      {children}

      {/* Sleek Floating Bottom Area — Pure Text, No Container Box */}
      <footer
        className={`fixed bottom-5 left-0 right-0 z-40 px-8 flex items-center justify-between pointer-events-none text-xs text-neutral-400 font-sans tracking-wide transition-opacity duration-300 ${
          chromeVisible || controlsOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Left: Quick Switcher */}
        <div className="pointer-events-auto flex items-center gap-3">
          {prevComp ? (
            <Link
              href={`/showcase/${prevComp.slug}`}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-neutral-600">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </span>
          )}
          <span className="text-neutral-600">/</span>
          {nextComp ? (
            <Link
              href={`/showcase/${nextComp.slug}`}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-neutral-600">
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Center: Interaction Guide Prompt */}
        <div className="text-neutral-400 font-normal">
          {getInteractionPrompt(component)}
        </div>

        {/* Right: Key Shortcuts */}
        <div className="text-neutral-500 text-[11px] font-mono tracking-wider">
          F Fullscreen · Esc Exit
        </div>
      </footer>
    </div>
  );
}
