"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { ChevronDown, Search, ArrowLeft, ArrowRight, X, Eye, EyeOff, Home } from "lucide-react";
import { ComponentDetail, COMPONENT_DETAILS } from "@/lib/component-registry";





function cleanLabel(label: string) {
  let clean = label.replace(/^APPARATUS\s+/i, "");
  if (clean === clean.toUpperCase()) {
    clean = clean
      .toLowerCase()
      .replace(/(?:^|\s|-)\S/g, (m) => m.toUpperCase());
  }
  return clean;
}

function CategoryFilterTabs({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const activeCategory = hoveredCategory || selectedCategory;

  return (
    <div
      onMouseLeave={() => setHoveredCategory(null)}
      className="relative flex flex-wrap items-center gap-1 p-1 bg-neutral-900/90 rounded-xl border border-neutral-800/80"
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat;

        return (
          <ScrambleTabButton
            key={cat}
            label={cat}
            isActive={isActive}
            onHover={() => setHoveredCategory(cat)}
            onClick={() => onSelectCategory(cat)}
          />
        );
      })}
    </div>
  );
}

function ScrambleTabButton({
  label,
  isActive,
  onHover,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onHover: () => void;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState(label);

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(label);
      return;
    }

    let frame = 0;
    const waveWidth = 2;
    const totalFrames = (label.length + waveWidth) * 2;
    const intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);

      const result = label
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          const isInsideWave = i >= waveCenter - waveWidth && i <= waveCenter;
          if (isInsideWave) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return char;
        })
        .join("");

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText(label);
      }
    }, 24);

    return () => clearInterval(intervalId);
  }, [isHovered, label]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="relative px-3 py-1 rounded-lg text-[11px] font-mono tracking-wider transition-colors cursor-pointer select-none"
    >
      {/* Sliding Active/Hover White Pill Transfer */}
      {isActive && (
        <motion.div
          layoutId="activeCategoryPill"
          className="absolute inset-0 bg-white rounded-lg z-0 shadow-sm"
          transition={{ type: "spring", stiffness: 450, damping: 32 }}
        />
      )}

      {/* Text Label */}
      <span
        className={`relative z-10 inline-block min-w-[32px] text-center font-mono transition-colors ${
          isActive ? "text-black font-extrabold" : "text-neutral-400 font-medium"
        }`}
      >
        {displayText}
      </span>
    </button>
  );
}

function HighlightedText({
  text,
  query,
  isActive,
}: {
  text: string;
  query: string;
  isActive: boolean;
}) {
  if (!query.trim()) {
    return (
      <span
        className={`block transition-colors ${
          isActive ? "text-black font-bold" : "text-neutral-500 font-medium"
        }`}
      >
        {text}
      </span>
    );
  }

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <span
      className={`block transition-colors ${
        isActive ? "text-black font-bold" : "text-neutral-300 font-medium"
      }`}
    >
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className={`px-0.5 rounded-sm font-bold ${
              isActive ? "bg-black text-white" : "bg-amber-400/30 text-amber-200"
            }`}
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

function RollUpDrawerComponentItem({
  label,
  searchQuery = "",
  isActive,
  onClick,
}: {
  label: string;
  searchQuery?: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between group overflow-hidden ${
        isActive ? "bg-white text-black font-bold" : "hover:bg-neutral-900/90 text-neutral-400"
      }`}
    >
      {/* Overlapping Letter Roll-up Label */}
      <div className="relative overflow-hidden py-0.5 text-xs font-mono">
        {/* Base Stationary Text with Search Highlighting */}
        <HighlightedText text={label} query={searchQuery} isActive={isActive} />

        {/* Overlapping Staggered Roll-up Text */}
        {!isActive && !searchQuery && (
          <div className="absolute inset-0 flex items-center pointer-events-none">
            {label.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ y: "100%" }}
                animate={{ y: isHovered ? "0%" : "100%" }}
                transition={{
                  duration: 0.22,
                  delay: i * 0.02,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block font-mono font-bold text-white whitespace-pre"
              >
                {char}
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* Right side status indicator (Active Dot / Hover Arrow) */}
      <div className="flex items-center text-[10px] font-mono">
        {isActive ? (
          <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
        ) : (
          <ArrowRight className="w-3 h-3 text-neutral-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0" />
        )}
      </div>
    </button>
  );
}

function ScrambleHeaderTrigger({
  label,
  isOpen,
  onClick,
}: {
  label: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const clean = cleanLabel(label).toUpperCase();
  const [displayText, setDisplayText] = useState(clean);

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(clean);
      return;
    }

    let frame = 0;
    const waveWidth = 2;
    const totalFrames = (clean.length + waveWidth) * 2;
    const intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);

      const result = clean
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          const isInsideWave = i >= waveCenter - waveWidth && i <= waveCenter;
          if (isInsideWave) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return char;
        })
        .join("");

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText(clean);
      }
    }, 28);

    return () => clearInterval(intervalId);
  }, [isHovered, clean]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-neutral-200 hover:text-white transition-colors cursor-pointer select-none py-1"
    >
      <span className="min-w-[140px] inline-block text-center">{displayText}</span>
      <ChevronDown
        className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "rotate-180 text-white" : ""
        }`}
      />
    </button>
  );
}

function TactileSlidersIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Top Track Line */}
      <line x1="4" y1="6" x2="20" y2="6" className="opacity-40" />
      {/* Top Knob */}
      <line
        x1="8"
        y1="3.5"
        x2="8"
        y2="8.5"
        className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2.5 text-white"
      />

      {/* Middle Track Line */}
      <line x1="4" y1="12" x2="20" y2="12" className="opacity-40" />
      {/* Middle Knob */}
      <line
        x1="16"
        y1="9.5"
        x2="16"
        y2="14.5"
        className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-3.5 text-white"
      />

      {/* Bottom Track Line */}
      <line x1="4" y1="18" x2="20" y2="18" className="opacity-40" />
      {/* Bottom Knob */}
      <line
        x1="10"
        y1="15.5"
        x2="10"
        y2="20.5"
        className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 text-white"
      />
    </svg>
  );
}

function ScrambleControlsTrigger({
  controlsOpen,
  onClick,
}: {
  controlsOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 text-xs font-mono tracking-widest uppercase transition-colors cursor-pointer select-none py-1 group ${
        controlsOpen ? "text-white font-bold" : "text-neutral-400 hover:text-white font-semibold"
      }`}
    >
      <TactileSlidersIcon className="w-3.5 h-3.5" />
      <span className="inline-block tracking-wider">CONTROLS</span>
      <span className="text-[10px] font-mono px-1 rounded bg-neutral-900 text-neutral-500 border border-neutral-800">
        C
      </span>
    </button>
  );
}

function ScrambleCatalogLink({ category }: { category: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState("CATALOG");

  useEffect(() => {
    if (!isHovered) {
      setDisplayText("CATALOG");
      return;
    }

    let frame = 0;
    const label = "CATALOG";
    const waveWidth = 2;
    const totalFrames = (label.length + waveWidth) * 2;
    const intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);

      const result = label
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          const isInsideWave = i >= waveCenter - waveWidth && i <= waveCenter;
          if (isInsideWave) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return char;
        })
        .join("");

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText("CATALOG");
      }
    }, 28);

    return () => clearInterval(intervalId);
  }, [isHovered]);

  return (
    <Link
      href={`/components?tab=${category}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-2 text-xs font-mono font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer group"
    >
      {/* Directional Horizontal Arrow Cascade Container */}
      <div className="relative w-3.5 h-3.5 overflow-hidden flex items-center justify-center">
        {/* Primary Arrow exits left */}
        <motion.div
          animate={{ x: isHovered ? "-100%" : "0%" }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </motion.div>

        {/* Secondary Arrow enters from right */}
        <motion.div
          animate={{ x: isHovered ? "0%" : "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </motion.div>
      </div>

      <span className="min-w-[60px] inline-block">{displayText}</span>
    </Link>
  );
}

function ScramblePrevLink({ slug }: { slug: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState("PREV");

  useEffect(() => {
    if (!isHovered) {
      setDisplayText("PREV");
      return;
    }

    let frame = 0;
    const label = "PREV";
    const waveWidth = 2;
    const totalFrames = (label.length + waveWidth) * 2;
    const intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);

      const result = label
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          const isInsideWave = i >= waveCenter - waveWidth && i <= waveCenter;
          if (isInsideWave) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return char;
        })
        .join("");

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText("PREV");
      }
    }, 28);

    return () => clearInterval(intervalId);
  }, [isHovered]);

  return (
    <Link
      href={`/showcase/${slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer group"
    >
      <div className="relative w-3.5 h-3.5 overflow-hidden flex items-center justify-center">
        <motion.div
          animate={{ x: isHovered ? "-100%" : "0%" }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </motion.div>
        <motion.div
          animate={{ x: isHovered ? "0%" : "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </motion.div>
      </div>

      <span className="min-w-[36px] inline-block">{displayText}</span>
    </Link>
  );
}

function ScrambleNextLink({ slug }: { slug: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState("NEXT");

  useEffect(() => {
    if (!isHovered) {
      setDisplayText("NEXT");
      return;
    }

    let frame = 0;
    const label = "NEXT";
    const waveWidth = 2;
    const totalFrames = (label.length + waveWidth) * 2;
    const intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);

      const result = label
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          const isInsideWave = i >= waveCenter - waveWidth && i <= waveCenter;
          if (isInsideWave) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return char;
        })
        .join("");

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText("NEXT");
      }
    }, 28);

    return () => clearInterval(intervalId);
  }, [isHovered]);

  return (
    <Link
      href={`/showcase/${slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer group"
    >
      <span className="min-w-[36px] inline-block text-right">{displayText}</span>

      <div className="relative w-3.5 h-3.5 overflow-hidden flex items-center justify-center">
        <motion.div
          animate={{ x: isHovered ? "100%" : "0%" }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.div>
        <motion.div
          animate={{ x: isHovered ? "0%" : "-100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.div>
      </div>
    </Link>
  );
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
  const [isHudHidden, setIsHudHidden] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [recentlyViewed, setRecentlyViewed] = useState<ComponentDetail[]>([]);
  const drawerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("abyss_recently_viewed");
      if (raw) setRecentlyViewed(JSON.parse(raw));
    } catch {
      // Ignore sessionStorage access errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !component) return;
    try {
      const raw = sessionStorage.getItem("abyss_recently_viewed");
      const parsed: ComponentDetail[] = raw ? JSON.parse(raw) : [];
      const filtered = parsed.filter((item) => item.slug !== component.slug);
      const updated = [component, ...filtered].slice(0, 4);
      sessionStorage.setItem("abyss_recently_viewed", JSON.stringify(updated));
      setRecentlyViewed(updated);
    } catch {
      // Ignore sessionStorage access errors
    }
  }, [component]);

  const allComponents = Object.values(COMPONENT_DETAILS);
  const categoryItems = allComponents.filter((c) => c.category === component.category);
  const currentIndex = categoryItems.findIndex((c) => c.slug === component.slug);
  const prevComp = currentIndex > 0 ? categoryItems[currentIndex - 1] : null;
  const nextComp = currentIndex < categoryItems.length - 1 ? categoryItems[currentIndex + 1] : null;

  // Auto-hide chrome after 3.5 seconds of inactivity
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleMouseMove = () => {
      if (isHudHidden) return;
      setChromeVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!drawerOpen && !controlsOpen) {
          setChromeVisible(false);
        }
      }, 3500);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timer);
    };
  }, [drawerOpen, controlsOpen, isHudHidden]);

  // Click outside listener for drawer & sheet
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const isOutsideTrigger = drawerRef.current && !drawerRef.current.contains(e.target as Node);
      const isOutsideSheet = !sheetRef.current || !sheetRef.current.contains(e.target as Node);

      if (isOutsideTrigger && isOutsideSheet) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scoped Lenis smooth scroll for drawer sheet
  useEffect(() => {
    if (!drawerOpen || !sheetRef.current) return;

    const drawerLenis = new Lenis({
      wrapper: sheetRef.current,
      content: sheetRef.current.firstElementChild as HTMLElement,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    function update(time: number) {
      drawerLenis.raf(time);
      rafId = requestAnimationFrame(update);
    }
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      drawerLenis.destroy();
    };
  }, [drawerOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Escape") {
        if (drawerOpen) {
          setDrawerOpen(false);
        } else {
          router.push(`/components/${component.slug}`);
        }
      } else if (e.key === "ArrowLeft" && prevComp) {
        router.push(`/showcase/${prevComp.slug}`);
      } else if (e.key === "ArrowRight" && nextComp) {
        router.push(`/showcase/${nextComp.slug}`);
      } else if (e.key.toLowerCase() === "c" && onToggleControls) {
        onToggleControls();
      } else if (e.key.toLowerCase() === "h") {
        setIsHudHidden((prev) => !prev);
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
  }, [component.slug, prevComp, nextComp, router, onToggleControls, drawerOpen]);

  // Categories list in exact requested order: scroll, gallery, transition, text, geometry, image
  const categoriesList = ["ALL", "SCROLL", "GALLERY", "TRANSITION", "TEXT", "SVG", "GEOMETRY", "IMAGE"];

  const CATEGORY_ORDER = ["scroll", "gallary", "gallery", "transition", "text", "svg", "geometry", "image", "hybrid"];

  // Filtered components
  const filteredComponents = allComponents.filter((c) => {
    const matchesSearch =
      c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "ALL" ||
      c.category.toUpperCase() === selectedCategory ||
      (selectedCategory === "GALLERY" && c.category === "gallary");

    return matchesSearch && matchesCategory;
  });

  // Group filtered components by category in strict requested order
  const groupedCategories = Array.from(
    new Set(filteredComponents.map((c) => c.category))
  )
    .sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a.toLowerCase());
      const idxB = CATEGORY_ORDER.indexOf(b.toLowerCase());
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    })
    .map((cat) => ({
      category: cat,
      items: filteredComponents.filter((c) => c.category === cat),
    }));

  return (
    <div className="relative min-h-screen w-full bg-[#070708] font-sans antialiased text-white">
      {/* Floating Restore HUD Pill (when HUD is hidden) */}
      <AnimatePresence>
        {isHudHidden && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            onClick={() => setIsHudHidden(false)}
            className="fixed top-4 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono tracking-wider text-white border border-white/25 hover:border-white/45 rounded-full shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.4),_0_12px_32px_-4px_rgba(0,0,0,0.7)] backdrop-blur-2xl backdrop-saturate-200 hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.6),_0_0_25px_rgba(255,255,255,0.15)] transition-all duration-300 cursor-pointer group"
            title="Show HUD UI (Press H)"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-300 group-hover:text-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-125" />
            <span>SHOW HUD</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sleek Top Bar (Glassmorphic) */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex h-[52px] items-center justify-between px-6 bg-zinc-950/40 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-300 ${
          !isHudHidden && (chromeVisible || drawerOpen || controlsOpen)
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        {/* Left: Back Link & Unboxed Category */}
        <div className="flex items-center gap-3">
          <ScrambleCatalogLink category={component.category} />
          <span className="text-neutral-600 font-mono">/</span>
          <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
            {component.category}
          </span>
        </div>

        {/* Center: Global Component Scramble Trigger */}
        <div ref={drawerRef}>
          <ScrambleHeaderTrigger
            label={component.label}
            isOpen={drawerOpen}
            onClick={() => setDrawerOpen(!drawerOpen)}
          />
        </div>

        {/* Right: Unboxed Controls & Hide HUD Triggers */}
        <div className="flex items-center gap-3">
          {onToggleControls && (
            <ScrambleControlsTrigger
              controlsOpen={Boolean(controlsOpen)}
              onClick={onToggleControls}
            />
          )}

          <button
            onClick={() => setIsHudHidden(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-mono tracking-wider text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/25 hover:border-white/45 rounded-full shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.4),_0_10px_28px_-4px_rgba(0,0,0,0.6)] backdrop-blur-2xl backdrop-saturate-200 hover:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.6),_0_0_20px_rgba(255,255,255,0.12)] transition-all duration-300 cursor-pointer group"
            title="Hide HUD UI (Press H)"
          >
            <EyeOff className="w-3.5 h-3.5 text-neutral-300 group-hover:text-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-125" />
            <span>HIDE HUD</span>
          </button>
        </div>
      </header>

      {/* Direction 1: Top Architectural Drawer Sheet */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            id="showcase-drawer-sheet"
            ref={sheetRef}
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{
              duration: 0.32,
              ease: [0.16, 1, 0.3, 1],
            }}
            onWheel={(e) => e.stopPropagation()}
            className="fixed top-[52px] bottom-0 inset-x-0 z-50 bg-[#08080a]/70 backdrop-blur-3xl backdrop-saturate-150 border-b border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.85)] p-6 lg:p-8 overflow-y-auto custom-scrollbar"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.06, delayChildren: 0.04 }}
              className="max-w-7xl mx-auto space-y-6 pb-16"
            >
              {/* Drawer Control Toolbar */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -14, filter: "blur(8px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-900"
              >
                {/* Search Input & Home Button */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Link
                    href="/components"
                    className="flex items-center gap-1.5 px-3 h-9 bg-neutral-900/90 hover:bg-neutral-800 text-xs font-mono font-bold text-neutral-300 hover:text-white rounded-xl border border-neutral-800/80 transition-colors cursor-pointer shrink-0 select-none group"
                    title="Return to Main Catalog Page"
                  >
                    <Home className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform duration-300 group-hover:scale-110" />
                    <span>HOME</span>
                  </Link>

                  <div className="relative flex items-center bg-neutral-900/90 rounded-xl border border-neutral-800/80 focus-within:border-neutral-700 w-full sm:w-72 h-9 px-3">
                    <Search className="w-3.5 h-3.5 text-neutral-500 mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search components..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="p-1 text-neutral-500 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filter Tabs with Sliding White Pill Transfer */}
                <CategoryFilterTabs
                  categories={categoriesList}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />

                {/* Counter & Close */}
                <div className="flex items-center gap-3 text-xs font-mono text-neutral-500">
                  <span className="font-bold text-neutral-400">
                    {filteredComponents.length} COMPONENTS
                  </span>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer group"
                    title="Close (ESC)"
                  >
                    <X className="w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90" />
                  </button>
                </div>
              </motion.div>

              {/* Recently Visited Architectural Micro-Bar */}
              {recentlyViewed.length > 0 && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: -10, filter: "blur(6px)" },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                  className="flex items-center gap-3 pt-1 border-b border-neutral-900/80 pb-3"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase shrink-0 select-none">
                    <span className="w-1 h-3 bg-neutral-700 rounded-full inline-block" />
                    <span>RECENT SHOWCASE</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
                    {recentlyViewed.map((item) => {
                      const isActive = item.slug === component.slug;
                      return (
                        <button
                          key={item.slug}
                          onClick={() => {
                            setDrawerOpen(false);
                            router.push(`/showcase/${item.slug}`);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono transition-all duration-200 cursor-pointer shrink-0 select-none group ${
                            isActive
                              ? "bg-neutral-800/90 border-neutral-700 text-white font-bold shadow-md shadow-black/40"
                              : "bg-neutral-950/60 hover:bg-neutral-900 border-neutral-900 hover:border-neutral-800 text-neutral-400 hover:text-neutral-200"
                          }`}
                        >
                          <span className="text-[9px] font-mono font-semibold tracking-wider text-neutral-500 uppercase px-1 py-0.5 bg-neutral-900 group-hover:bg-neutral-800 rounded transition-colors">
                            {item.category}
                          </span>
                          <span className="tracking-tight">{cleanLabel(item.label)}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Categorized Component Columns Grid with Motion Layout Morph */}
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
                <AnimatePresence mode="popLayout">
                  {groupedCategories.map((group) => (
                    <motion.div
                      layout
                      key={group.category}
                      initial={{ opacity: 0, filter: "blur(12px)", scale: 0.88, x: -16 }}
                      animate={{ opacity: 1, filter: "blur(0px)", scale: 1, x: 0 }}
                      exit={{ opacity: 0, filter: "blur(14px)", scale: 0.82, x: 24 }}
                      transition={{
                        layout: { type: "spring", stiffness: 420, damping: 32 },
                        opacity: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                        filter: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                        scale: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                        x: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                      }}
                      className="space-y-3"
                    >
                      {/* Category Column Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
                        <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-neutral-500">
                          {group.category}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-600 font-semibold">
                          {group.items.length}
                        </span>
                      </div>

                      {/* Component Items List with Overlapping Letter Roll-Up */}
                      <div className="space-y-1">
                        {group.items.map((c) => {
                          const isActive = c.slug === component.slug;
                          const label = cleanLabel(c.label);

                          return (
                            <RollUpDrawerComponentItem
                              key={c.slug}
                              label={label}
                              searchQuery={searchQuery}
                              isActive={isActive}
                              onClick={() => {
                                setDrawerOpen(false);
                                router.push(`/showcase/${c.slug}`);
                              }}
                            />
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Showcase Stage */}
      {children}

      {/* Sleek Floating Bottom Area — Pure Text, No Container Box */}
      <footer
        className={`fixed bottom-5 left-0 right-0 z-30 px-8 flex items-center justify-between pointer-events-none text-xs text-neutral-400 font-sans tracking-wide transition-all duration-300 ${
          !isHudHidden && !drawerOpen && (chromeVisible || controlsOpen)
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        }`}
      >
        {/* Left: Quick Switcher with Directional Arrow Cascade */}
        <div className="pointer-events-auto flex items-center gap-3 font-mono">
          {prevComp ? (
            <ScramblePrevLink slug={prevComp.slug} />
          ) : (
            <span className="flex items-center gap-1 text-neutral-600">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>PREV</span>
            </span>
          )}
          <span className="text-neutral-600">/</span>
          {nextComp ? (
            <ScrambleNextLink slug={nextComp.slug} />
          ) : (
            <span className="flex items-center gap-1 text-neutral-600">
              <span>NEXT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Right: Key Shortcuts & Hide HUD Trigger */}
        <div className="flex items-center gap-3 text-neutral-500 text-[11px] font-mono tracking-wider uppercase">
          <button
            onClick={() => setIsHudHidden(true)}
            className="pointer-events-auto hover:text-white transition-colors flex items-center gap-1 group"
            title="Hide HUD (Press H)"
          >
            <EyeOff className="w-3 h-3 text-neutral-400 group-hover:text-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-125" />
            <span>H HIDE HUD</span>
          </button>
          <span>·</span>
          <span>F FULLSCREEN · ESC EXIT</span>
        </div>
      </footer>
    </div>
  );
}
