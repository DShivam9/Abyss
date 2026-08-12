"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, X, BookOpen, Clock, Heart, ArrowUpRight } from "lucide-react";
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

const SEARCH_TERMS = [
  "'kinetic'...",
  "'parallax'...",
  "'shader'...",
  "'accordion'...",
  "'glsl'...",
  "'scroll'...",
];

function TypewriterShimmerPlaceholder() {
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = SEARCH_TERMS[phraseIndex];

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          setDisplayText(currentPhrase.substring(0, displayText.length + 1));
          if (displayText.length === currentPhrase.length) {
            setTimeout(() => setIsDeleting(true), 2400);
          }
        } else {
          setDisplayText(currentPhrase.substring(0, displayText.length - 1));
          if (displayText.length === 0) {
            setIsDeleting(false);
            setPhraseIndex((prev) => (prev + 1) % SEARCH_TERMS.length);
          }
        }
      },
      isDeleting ? 35 : 65
    );

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex]);

  return (
    <div className="inline-flex items-center font-sans text-xs tracking-normal select-none whitespace-nowrap truncate leading-none">
      <span className="text-neutral-500 mr-1 font-medium">Search</span>
      <span className="bg-gradient-to-r from-neutral-400 via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
        {displayText}
      </span>
      <span className="w-[1px] h-3.5 bg-neutral-300 ml-[1px] animate-pulse inline-block opacity-80 shrink-0" />
    </div>
  );
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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);



  // Track open/collapsed state per category (starts closed, dropdowns on mount)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    categories.forEach((c) => {
      init[c.id] = false;
    });
    return init;
  });

  // Dropdown animation trigger on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setExpandedCategories((prev) => ({
        ...prev,
        scroll: true,
      }));
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-expand category when selectedSlug changes via user action (Next/Prev or Command Palette)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
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
        {/* Line 1: Title Header */}
        <div className="flex items-center justify-between px-0.5">
          <h2 className="font-mono text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
            Catalog Explorer
          </h2>
        </div>

        {/* Line 2: Full Width Animated Search Bar */}
        <div className="relative w-full flex items-center bg-neutral-900/90 rounded-lg border border-neutral-800 focus-within:border-neutral-700 transition-all font-sans h-9 min-w-0">
          <Search className="w-3.5 h-3.5 text-neutral-500 ml-3 shrink-0 z-10 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            className="w-full bg-transparent px-2.5 py-1.5 text-xs text-white focus:outline-none font-sans min-w-0 z-10"
          />

          {/* Shimmer Typewriter Placeholder */}
          {!searchQuery && !isInputFocused && (
            <div className="absolute left-8 right-12 pointer-events-none overflow-hidden whitespace-nowrap flex items-center h-full">
              <TypewriterShimmerPlaceholder />
            </div>
          )}

          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 mr-1.5 text-neutral-500 hover:text-white transition-colors cursor-pointer shrink-0 z-10"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                className="mr-2 inline-flex h-5 items-center gap-1 rounded bg-neutral-950 hover:bg-neutral-800 px-1.5 font-mono text-[10px] text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer shrink-0 z-10"
                title="Open Command Palette (⌘K)"
              >
                ⌘K
              </button>
            )
          )}
        </div>
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
                    transition={{ type: "spring", stiffness: 280, damping: 22, mass: 1.1 }}
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
                className={`grid transition-[grid-template-rows,opacity] duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden pl-3 ml-3.5 border-l border-neutral-800/60 my-0.5 space-y-1 transform-gpu">
                  {cat.components.length === 0 ? (
                    <div className="px-3.5 py-1.5 text-xs text-neutral-600 font-mono italic">
                      Empty category
                    </div>
                  ) : (
                    cat.components.map((comp, idx) => {
                      const isSelected = comp.slug === selectedSlug;
                      const displayName = cleanLabel(comp.label);

                      return (
                        <SidebarItem
                          key={comp.slug}
                          displayName={displayName}
                          isSelected={isSelected}
                          itemIndex={idx}
                          isCategoryExpanded={isExpanded}
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

      {/* Resources Links Inline Section */}
      <div className="pt-6 mt-4 border-t border-neutral-900/90 space-y-2">
        <div className="px-1 text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
          Resources
        </div>
        <div className="space-y-0.5">
          <ResourceLinkItem
            href="/docs"
            label="Docs"
            icon={<BookOpen className="w-3.5 h-3.5" />}
          />
          <ResourceLinkItem
            href="/changelog"
            label="Changelog"
            icon={<Clock className="w-3.5 h-3.5" />}
          />
          <ResourceLinkItem
            href="https://github.com/DShivam9/Abyss"
            label="Contribute"
            icon={<Heart className="w-3.5 h-3.5" />}
            isExternal
          />
        </div>
      </div>
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
  itemIndex?: number;
  isCategoryExpanded?: boolean;
  onClick: () => void;
  activeItemRef: React.RefObject<HTMLButtonElement | null> | null;
}

const SCRAMBLE_CHAR_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function scrambleWordLeftToRight(
  text: string,
  waveCenter: number,
  waveWidth: number = 2,
  frame: number = 0
): string {
  const len = text.length;
  let out = "";
  for (let i = 0; i < len; i++) {
    const char = text[i];
    if (char === " " || char === "-" || char === "/") {
      out += char;
    } else if (i >= waveCenter - waveWidth && i <= waveCenter + waveWidth) {
      out += SCRAMBLE_CHAR_SET[(frame + i * 3) % SCRAMBLE_CHAR_SET.length];
    } else {
      out += char;
    }
  }
  return out;
}

function SidebarItem({
  displayName,
  isSelected,
  itemIndex = 0,
  isCategoryExpanded = true,
  onClick,
  activeItemRef,
}: SidebarItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState(displayName);
  const isAnimatingRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayText(displayName);
  }, [displayName]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const triggerScramble = React.useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    let frame = 0;
    const waveWidth = 2;
    const totalFrames = (displayName.length + waveWidth) * 2;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);
      const result = scrambleWordLeftToRight(displayName, waveCenter, waveWidth, frame);

      setDisplayText(result);

      if (frame >= totalFrames) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setDisplayText(displayName);
        isAnimatingRef.current = false;
      }
    }, 38);
  }, [displayName]);

  return (
    <motion.button
      ref={isSelected ? activeItemRef : null}
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovered(true);
        triggerScramble();
      }}
      onMouseLeave={() => setIsHovered(false)}
      initial={false}
      animate={{
        opacity: isCategoryExpanded ? 1 : 0,
        y: isCategoryExpanded ? 0 : -6,
      }}
      transition={{
        duration: 0.38,
        delay: isCategoryExpanded ? Math.min(itemIndex * 0.03, 0.28) : 0,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`w-full text-left px-3.5 py-2 text-sm rounded-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] relative flex items-center justify-between group/item cursor-pointer overflow-hidden ${
        isSelected
          ? "bg-white/[0.09] text-white font-medium shadow-sm"
          : "text-neutral-400 hover:text-white hover:bg-white/[0.04] hover:translate-x-0.5"
      }`}
    >
      <span className="truncate font-mono text-xs z-10">{displayText}</span>

      {/* 1px Hairline Scanline Underline Accent on Hover */}
      {!isSelected && (
        <motion.span
          initial={false}
          animate={{
            scaleX: isHovered ? 1 : 0,
            opacity: isHovered ? 1 : 0,
            transformOrigin: isHovered ? "0% 50%" : "100% 50%",
          }}
          transition={{ duration: isHovered ? 0.35 : 0.88, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-0 left-3.5 right-3.5 h-[1px] bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none transform-gpu will-change-transform"
        />
      )}
    </motion.button>
  );
}

interface ResourceLinkItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isExternal?: boolean;
}

function ResourceLinkItem({ href, label, icon, isExternal = false }: ResourceLinkItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState(label);
  const isAnimatingRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayText(label);
  }, [label]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const triggerScramble = React.useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    let frame = 0;
    const waveWidth = 2;
    const totalFrames = (label.length + waveWidth) * 2;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);
      const result = scrambleWordLeftToRight(label, waveCenter, waveWidth, frame);

      setDisplayText(result);

      if (frame >= totalFrames) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setDisplayText(label);
        isAnimatingRef.current = false;
      }
    }, 38);
  }, [label]);

  const content = (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
        triggerScramble();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] relative flex items-center justify-between group/item cursor-pointer overflow-hidden text-neutral-400 hover:text-white hover:bg-white/[0.04] hover:translate-x-0.5"
    >
      <div className="flex items-center gap-2.5 z-10">
        <span className="text-neutral-500 group-hover/item:text-white transition-colors">
          {icon}
        </span>
        <span className="font-mono text-xs truncate">{displayText}</span>
      </div>

      <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover/item:text-white transition-colors z-10" />

      {/* 1px Hairline Scanline Underline Accent on Hover */}
      <motion.span
        initial={false}
        animate={{
          scaleX: isHovered ? 1 : 0,
          opacity: isHovered ? 1 : 0,
          transformOrigin: isHovered ? "0% 50%" : "100% 50%",
        }}
        transition={{ duration: isHovered ? 0.35 : 0.88, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-3 right-3 h-[1px] bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none transform-gpu will-change-transform"
      />
    </div>
  );

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="block w-full"
    >
      {content}
    </a>
  );
}

