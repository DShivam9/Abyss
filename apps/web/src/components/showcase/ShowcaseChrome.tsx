"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { Sliders, ChevronDown, Search, ArrowLeft, ArrowRight, X } from "lucide-react";
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
        const isSelected = selectedCategory === cat;

        return (
          <ScrambleTabButton
            key={cat}
            label={cat}
            isActive={isActive}
            isSelected={isSelected}
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
  isSelected,
  onHover,
  onClick,
}: {
  label: string;
  isActive: boolean;
  isSelected: boolean;
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
    let intervalId: NodeJS.Timeout;

    intervalId = setInterval(() => {
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

function RollUpDrawerComponentItem({
  label,
  subtype,
  isActive,
  onClick,
}: {
  label: string;
  subtype?: string;
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
        {/* Base Stationary Text */}
        <span
          className={`block transition-colors ${
            isActive ? "text-black font-bold" : "text-neutral-500 font-medium"
          }`}
        >
          {label}
        </span>

        {/* Overlapping Staggered Roll-up Text */}
        {!isActive && (
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

      {subtype && (
        <span
          className={`text-[10px] font-mono uppercase ${
            isActive ? "text-neutral-600 font-bold" : "text-neutral-600 group-hover:text-neutral-400"
          }`}
        >
          {subtype}
        </span>
      )}
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
    let intervalId: NodeJS.Timeout;

    intervalId = setInterval(() => {
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

function ScrambleControlsTrigger({
  controlsOpen,
  onClick,
}: {
  controlsOpen: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState("CONTROLS");

  useEffect(() => {
    if (!isHovered) {
      setDisplayText("CONTROLS");
      return;
    }

    let frame = 0;
    const label = "CONTROLS";
    const waveWidth = 2;
    const totalFrames = (label.length + waveWidth) * 2;
    let intervalId: NodeJS.Timeout;

    intervalId = setInterval(() => {
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
        setDisplayText("CONTROLS");
      }
    }, 28);

    return () => clearInterval(intervalId);
  }, [isHovered]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center gap-2 text-xs font-mono tracking-widest uppercase transition-colors cursor-pointer select-none py-1 group ${
        controlsOpen ? "text-white font-bold" : "text-neutral-400 hover:text-white font-semibold"
      }`}
    >
      <Sliders className="w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-45" />
      <span className="min-w-[70px] inline-block text-center">{displayText}</span>
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
    let intervalId: NodeJS.Timeout;

    intervalId = setInterval(() => {
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
    let intervalId: NodeJS.Timeout;

    intervalId = setInterval(() => {
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
    let intervalId: NodeJS.Timeout;

    intervalId = setInterval(() => {
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const drawerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

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
  }, [drawerOpen, controlsOpen]);

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

  // Categories list
  const categoriesList = ["ALL", "SCROLL", "GALLERY", "IMAGE", "GEOMETRY", "HYBRID"];

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

  // Group filtered components by category
  const groupedCategories = Array.from(
    new Set(filteredComponents.map((c) => c.category))
  ).map((cat) => ({
    category: cat,
    items: filteredComponents.filter((c) => c.category === cat),
  }));

  return (
    <div className="relative min-h-screen w-full bg-[#070708] font-sans antialiased text-white">
      {/* Sleek Top Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex h-[52px] items-center justify-between px-6 bg-[#070708]/90 backdrop-blur-md border-b border-neutral-900/80 transition-opacity duration-300 ${
          chromeVisible || drawerOpen || controlsOpen ? "opacity-100" : "opacity-0 pointer-events-none"
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

        {/* Right: Unboxed Controls Trigger */}
        {onToggleControls ? (
          <ScrambleControlsTrigger
            controlsOpen={Boolean(controlsOpen)}
            onClick={onToggleControls}
          />
        ) : (
          <div className="w-20" />
        )}
      </header>

      {/* Direction 1: Top Architectural Drawer Sheet */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            id="showcase-drawer-sheet"
            ref={sheetRef}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onWheel={(e) => e.stopPropagation()}
            className="fixed top-[52px] inset-x-0 z-40 bg-[#08080a]/70 backdrop-blur-3xl backdrop-saturate-150 border-b border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.85)] p-6 lg:p-8 max-h-[80vh] overflow-y-auto custom-scrollbar"
          >
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Drawer Control Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-900">
                {/* Search Input */}
                <div className="relative flex items-center bg-neutral-900/90 rounded-xl border border-neutral-800/80 focus-within:border-neutral-700 w-full sm:w-80 h-9 px-3">
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
              </div>

              {/* Categorized Component Columns Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
                {groupedCategories.map((group) => (
                  <div key={group.category} className="space-y-3">
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
                            subtype={c.subtype}
                            isActive={isActive}
                            onClick={() => {
                              setDrawerOpen(false);
                              router.push(`/showcase/${c.slug}`);
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Showcase Stage */}
      {children}

      {/* Sleek Floating Bottom Area — Pure Text, No Container Box */}
      <footer
        className={`fixed bottom-5 left-0 right-0 z-40 px-8 flex items-center justify-between pointer-events-none text-xs text-neutral-400 font-sans tracking-wide transition-opacity duration-300 ${
          chromeVisible || controlsOpen ? "opacity-100" : "opacity-0"
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

        {/* Center: Interaction Guide Prompt */}
        <div className="text-neutral-400 font-mono text-xs tracking-wider uppercase">
          {getInteractionPrompt(component)}
        </div>

        {/* Right: Key Shortcuts */}
        <div className="text-neutral-500 text-[11px] font-mono tracking-wider uppercase">
          F FULLSCREEN · ESC EXIT
        </div>
      </footer>
    </div>
  );
}
