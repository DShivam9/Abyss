"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { ComponentDetail } from "@/lib/component-registry";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  components: ComponentDetail[];
  onSelectComponent: (slug: string) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  components,
  onSelectComponent,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const cleanLabel = (label: string) => {
    let clean = label.replace(/^APPARATUS\s+/i, "");
    if (clean === clean.toUpperCase()) {
      clean = clean
        .toLowerCase()
        .replace(/(?:^|\s|-)\S/g, (m) => m.toUpperCase());
    }
    return clean;
  };

  const filteredComponents = components.filter((comp) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const labelMatch = comp.label.toLowerCase().includes(q);
    const descMatch = comp.desc.toLowerCase().includes(q);
    const catMatch = comp.category.toLowerCase().includes(q);
    const tagMatch = comp.tags?.some((t) => t.toLowerCase().includes(q));
    return labelMatch || descMatch || catMatch || tagMatch;
  });

  // Handle keyboard navigation inside search modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredComponents.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredComponents.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredComponents[selectedIndex]) {
          onSelectComponent(filteredComponents[selectedIndex].slug);
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredComponents, selectedIndex, onSelectComponent, onClose]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (!el) return;

    const lenis = new Lenis({
      wrapper: el,
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 sm:px-6 font-sans">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -16 }}
            transition={{ type: "spring", stiffness: 420, damping: 28, mass: 0.8 }}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl bg-[#0A0A0A] border border-neutral-800 shadow-2xl text-white font-sans antialiased transform-gpu"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 border-b border-neutral-800/80 bg-neutral-900/40">
              <svg
                className="w-4 h-4 text-neutral-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search components, categories, or tags... (Esc to close)"
                className="w-full bg-transparent py-4 text-sm text-white placeholder-neutral-500 focus:outline-none font-sans"
              />
            </div>

            {/* Results List */}
            <div
              ref={scrollRef}
              data-lenis-prevent
              className="max-h-[360px] overflow-y-auto p-2 space-y-1 custom-scrollbar"
            >
              {filteredComponents.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                  No matching components found.
                </div>
              ) : (
                filteredComponents.map((comp, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={comp.slug}
                      onClick={() => {
                        onSelectComponent(comp.slug);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-white/[0.08] text-white"
                          : "text-neutral-300 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {cleanLabel(comp.label)}
                        </span>
                        <span className="text-xs text-neutral-500 line-clamp-1">
                          {comp.desc}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 shrink-0 ml-3">
                        {comp.category}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer shortcuts helper */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-800/80 bg-[#070708] text-[10px] text-neutral-500 font-mono">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
              </div>
              <span>ESC Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

