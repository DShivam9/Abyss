"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { ComponentDetail } from "@/lib/component-registry";

interface CategoryGroup {
  id: string;
  label: string;
  color: string;
  components: ComponentDetail[];
}

interface SidebarProps {
  categories: CategoryGroup[];
  selectedSlug: string;
  onSelectComponent: (slug: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenSearch?: () => void;
}

export function Sidebar({
  categories,
  selectedSlug,
  onSelectComponent,
  isOpenMobile = false,
  onCloseMobile,
  onOpenSearch,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  const totalComponentCount = categories.reduce(
    (acc, cat) => acc + cat.components.length,
    0
  );

  // Track open/collapsed state per category (only 'scroll' open by default, plus active slug category)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    const activeGroup = categories.find((c) =>
      c.components.some((comp) => comp.slug === selectedSlug)
    );
    categories.forEach((c) => {
      init[c.id] = c.id === "scroll" || c.id === activeGroup?.id;
    });
    return init;
  });

  // Auto-expand category when selectedSlug changes via Next/Prev or Command Palette
  useEffect(() => {
    if (!selectedSlug) return;
    const activeGroup = categories.find((c) =>
      c.components.some((comp) => comp.slug === selectedSlug)
    );
    if (activeGroup) {
      setExpandedCategories((prev) => ({
        ...prev,
        [activeGroup.id]: true,
      }));
    }
  }, [selectedSlug, categories]);

  // Smooth scroll selected component item into view in sidebar
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedSlug]);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const cleanLabel = (label: string) => {
    let clean = label.replace(/^APPARATUS\s+/i, "");
    if (clean === clean.toUpperCase()) {
      clean = clean
        .toLowerCase()
        .replace(/(?:^|\s|-)\S/g, (m) => m.toUpperCase());
    }
    return clean;
  };

  // Filter categories and components based on inline search query
  const filteredCategories = categories
    .map((cat) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return cat;
      const matching = cat.components.filter(
        (comp) =>
          comp.label.toLowerCase().includes(q) ||
          comp.desc.toLowerCase().includes(q) ||
          comp.category.toLowerCase().includes(q) ||
          comp.tags?.some((t) => t.toLowerCase().includes(q))
      );
      return { ...cat, components: matching };
    })
    .filter((cat) => cat.components.length > 0 || !searchQuery.trim());

  const sidebarContent = (
    <aside
      data-lenis-prevent
      className="flex h-full w-[300px] flex-col bg-[#0A0A0A] border-r border-neutral-900/90 text-white select-none overflow-y-auto overscroll-contain custom-scrollbar scroll-smooth"
    >
      {/* Header & Controls Toolbar */}
      <div className="p-4 border-b border-neutral-900/90 shrink-0 space-y-3">
        {/* Line 1: Title & Total Component Count */}
        <div className="flex items-center justify-between px-0.5">
          <h2 className="font-mono text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
            Catalog Explorer
          </h2>
          <span className="font-mono text-[10px] text-neutral-500 font-bold px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800/80">
            {totalComponentCount} COMPONENTS
          </span>
        </div>

        {/* Line 2: Search & Filter Controls Toolbar */}
        <div className="flex items-center gap-2">
          {/* Normal Search Input Box */}
          <div className="relative flex-1 flex items-center bg-neutral-900/90 rounded-xl border border-neutral-800/80 focus-within:border-neutral-700 transition-all font-sans h-8 min-w-0">
            <Search className="w-3.5 h-3.5 text-neutral-500 ml-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent px-2 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none font-sans min-w-0"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 mr-1 text-neutral-500 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              onOpenSearch && (
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="mr-1.5 inline-flex h-5 items-center gap-1 rounded bg-neutral-950 hover:bg-neutral-800 px-1.5 font-mono text-[10px] text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer shrink-0"
                  title="Open Command Palette (⌘K)"
                >
                  ⌘K
                </button>
              )
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`h-8 px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-mono transition-colors cursor-pointer shrink-0 ${
              isFilterOpen || activeFilter !== "ALL"
                ? "bg-neutral-800 border-neutral-700 text-white"
                : "bg-neutral-900/90 border-neutral-800/80 text-neutral-400 hover:text-white"
            }`}
            title="Filter by Tech Stack"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
              {activeFilter === "ALL" ? "FILTER" : activeFilter}
            </span>
          </button>
        </div>

        {/* Expandable Tech Filter Chips */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden pt-1"
            >
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-mono">
                {["ALL", "GSAP", "R3F", "Canvas", "Scroll", "Layout"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setActiveFilter(tag);
                      if (tag === "ALL") {
                        setSearchQuery("");
                      } else {
                        setSearchQuery(tag);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold tracking-wider transition-colors cursor-pointer ${
                      activeFilter === tag || (tag === "ALL" && !searchQuery)
                        ? "bg-white text-black font-bold"
                        : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories & Items List */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500 font-mono">
            No components match &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredCategories.map((cat) => {
            if (cat.components.length === 0 && searchQuery) return null;
            const isExpanded = searchQuery ? true : (expandedCategories[cat.id] ?? false);

            return (
              <div key={cat.id} className="space-y-1">
                {/* Category Header Button */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold tracking-wider text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-all duration-150 rounded-lg group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="uppercase tracking-wider">{cat.label}</span>
                    <span className="font-mono text-xs text-neutral-500 font-normal">
                      [{cat.components.length}]
                    </span>
                  </div>
                  <motion.svg
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ type: "spring", stiffness: 450, damping: 25 }}
                    className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </motion.svg>
                </button>

              {/* GPU-Accelerated Component Items List */}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden pl-3 ml-3.5 border-l border-neutral-800/60 my-0.5 space-y-1 transform-gpu">
                  {cat.components.length === 0 ? (
                    <div className="px-3.5 py-1.5 text-xs text-neutral-600 font-mono italic">
                      Empty category
                    </div>
                  ) : (
                    cat.components.map((comp) => {
                      const isSelected = comp.slug === selectedSlug;
                      const displayName = cleanLabel(comp.label);

                      return (
                        <SidebarItem
                          key={comp.slug}
                          displayName={displayName}
                          isSelected={isSelected}
                          activeItemRef={isSelected ? activeItemRef : null}
                          onClick={() => {
                            onSelectComponent(comp.slug);
                            if (onCloseMobile) onCloseMobile();
                          }}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden lg:block h-full shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Slide-Over Sidebar */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 flex h-full w-[300px]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

interface SidebarItemProps {
  displayName: string;
  isSelected: boolean;
  onClick: () => void;
  activeItemRef: React.RefObject<HTMLButtonElement | null> | null;
}

const ALPHABET_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ALPHABET_LOWER = "abcdefghijklmnopqrstuvwxyz";

function SidebarItem({ displayName, isSelected, onClick, activeItemRef }: SidebarItemProps) {
  const [displayText, setDisplayText] = useState(displayName);

  useEffect(() => {
    setDisplayText(displayName);
  }, [displayName]);

  const triggerScramble = () => {
    let frame = 0;
    const totalFrames = 50; // ~830ms smooth wave sweep duration
    let animId: number;

    const animate = () => {
      frame++;
      const progress = frame / totalFrames;

      // Active wave window (sweeps from index 0 to length + waveWidth)
      const waveWidth = 3;
      const waveCenter = progress * (displayName.length + waveWidth);

      setDisplayText((prev) => {
        const isMutationTick = frame % 2 === 0;

        return displayName
          .split("")
          .map((char, i) => {
            if (char === " " || char === "-" || char === "/") return char;

            // Character is inside active wave ripple window?
            const isInsideWave = i >= waveCenter - waveWidth && i <= waveCenter;

            if (!isInsideWave) {
              // Outside wave: stay original character
              return char;
            }

            // Inside wave: scramble on mutation tick
            if (!isMutationTick && prev[i]) {
              return prev[i];
            }

            const pool = char === char.toUpperCase() ? ALPHABET_UPPER : ALPHABET_LOWER;
            return pool[Math.floor(Math.random() * pool.length)];
          })
          .join("");
      });

      if (frame < totalFrames) {
        animId = requestAnimationFrame(animate);
      } else {
        setDisplayText(displayName);
      }
    };

    animId = requestAnimationFrame(animate);
  };

  const handleClick = () => {
    triggerScramble();
    onClick();
  };

  return (
    <button
      ref={isSelected ? activeItemRef : null}
      onClick={handleClick}
      className={`w-full text-left px-3.5 py-2 text-sm rounded-md transition-colors duration-200 relative flex items-center justify-between group/item cursor-pointer ${
        isSelected
          ? "bg-white/[0.09] text-white font-medium shadow-sm"
          : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
      }`}
    >
      <span className="truncate">{displayText}</span>
    </button>
  );
}

