"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollLock } from "@/lib/useScrollLock";
import { Search, ArrowLeft, ArrowRight, X, EyeOff } from "lucide-react";
import { ComponentDetail, COMPONENT_DETAILS } from "@/lib/component-registry";
import { cleanLabel } from "./showcase-utils";
import { RollUpNumberCounter } from "./RollUpCounter";
import {
  ScrambleHeaderTrigger,
  ScrambleControlsTrigger,
  ScrambleHideHudTrigger,
} from "./ShowcaseTriggers";
import {
  CategoryFilterTabs,
  ScrambleDrawerComponentItem,
  ScrambleHomeLink,
  ScrambleCatalogLink,
  ScramblePrevLink,
  ScrambleNextLink,
} from "./ShowcaseDrawer";

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
  const [isHudHidden, setIsHudHidden] = useState(false);
  const [isTopEdgeHovered, setIsTopEdgeHovered] = useState(false);
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

  // Auto-hide chrome after inactivity or hover top edge to reveal
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    let topLeaveTimer: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      const isTop = e.clientY <= 75;

      if (isTop) {
        clearTimeout(topLeaveTimer);
        setIsTopEdgeHovered(true);
      } else {
        clearTimeout(topLeaveTimer);
        topLeaveTimer = setTimeout(() => {
          setIsTopEdgeHovered(false);
        }, 2000);
      }

      if (!isHudHidden || isTop) {
        setChromeVisible(true);
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          if (!drawerOpen && !controlsOpen && !isTop) {
            setChromeVisible(false);
          }
        }, 3500);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(inactivityTimer);
      clearTimeout(topLeaveTimer);
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

  // Lock body scroll and pause root Lenis when drawer is open
  useScrollLock(drawerOpen);



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

  const categoriesList = ["ALL", "SCROLL", "GALLERY", "TRANSITION", "TEXT", "SVG", "IMAGE"];
  const CATEGORY_ORDER = ["scroll", "gallary", "gallery", "transition", "text", "svg", "image", "hybrid"];

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

  const isHeaderVisible =
    !drawerOpen && ((!isHudHidden && (chromeVisible || controlsOpen)) || isTopEdgeHovered);

  return (
    <div className="relative min-h-screen w-full bg-[#070708] font-sans antialiased text-white">
      {/* Floating Top Controls */}
      <header
        className={`fixed top-5 left-0 right-0 z-[110] flex items-center justify-between px-8 transition-all duration-300 ${
          isHeaderVisible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="pointer-events-auto flex items-center gap-3">
          <ScrambleCatalogLink category={component.category} />
          <span className="text-neutral-600 font-mono">/</span>
          <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
            {component.category}
          </span>
        </div>

        <div ref={drawerRef} className="pointer-events-auto">
          <ScrambleHeaderTrigger
            label={component.label}
            isOpen={drawerOpen}
            onClick={() => setDrawerOpen(!drawerOpen)}
          />
        </div>

        <div className="pointer-events-auto flex items-center gap-4">
          {onToggleControls && (
            <ScrambleControlsTrigger
              controlsOpen={Boolean(controlsOpen)}
              onClick={onToggleControls}
            />
          )}

          <ScrambleHideHudTrigger
            isHudHidden={isHudHidden}
            onClick={() => setIsHudHidden(!isHudHidden)}
          />
        </div>
      </header>

      {/* Top Architectural Drawer Sheet */}
      <AnimatePresence
        onExitComplete={() => {
          const lenis = (window as unknown as { lenis?: { start: () => void } }).lenis;
          lenis?.start();
          document.body.style.overflow = "";
          document.documentElement.style.overflow = "";
        }}
      >
        {drawerOpen && (
          <motion.div
            id="showcase-drawer-sheet"
            ref={sheetRef}
            data-lenis-prevent
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18, pointerEvents: "none" }}
            transition={{
              duration: 0.32,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="fixed top-0 bottom-0 inset-x-0 z-[100] bg-[#060608]/65 backdrop-blur-2xl backdrop-saturate-180 border-b border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.7)] p-6 lg:p-8 overflow-y-auto overscroll-contain touch-pan-y custom-scrollbar"
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
                  hidden: { opacity: 0, y: -14 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-900"
              >
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <ScrambleHomeLink />

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

                <CategoryFilterTabs
                  categories={categoriesList}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />

                <div className="flex items-center gap-3 text-xs font-mono text-neutral-500">
                  <span className="font-bold text-neutral-400">
                    <RollUpNumberCounter value={filteredComponents.length} suffix="COMPONENTS" />
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

              {/* Recently Visited Micro-Bar */}
              {recentlyViewed.length > 0 && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: -10 },
                    visible: {
                      opacity: 1,
                      y: 0,
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

              {/* Categorized Component Columns Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory + searchQuery}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.02,
                      },
                    },
                    exit: {
                      opacity: 0,
                      scaleY: 0.96,
                      transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2"
                >
                  {groupedCategories.map((group) => (
                    <motion.div
                      key={group.category}
                      variants={{
                        hidden: { opacity: 0, y: 16, scaleY: 0.92 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          scaleY: 1,
                          transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                        },
                        exit: {
                          opacity: 0,
                          y: -12,
                          scaleY: 0.92,
                          transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
                        },
                      }}
                      className="space-y-3 origin-top"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
                        <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-neutral-500">
                          {group.category}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-600 font-semibold">
                          <RollUpNumberCounter value={group.items.length} />
                        </span>
                      </div>

                      <div className="space-y-1">
                        {group.items.map((c) => {
                          const isActive = c.slug === component.slug;
                          const label = cleanLabel(c.label);

                          return (
                            <ScrambleDrawerComponentItem
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
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Showcase Stage */}
      <div
        className={`w-full transition-all duration-300 ${
          drawerOpen
            ? "pointer-events-none opacity-40 select-none filter blur-[1px]"
            : "pointer-events-auto opacity-100"
        }`}
        aria-hidden={drawerOpen}
      >
        {children}
      </div>

      {/* Floating Bottom Navigation */}
      <footer
        className={`fixed bottom-5 left-0 right-0 z-30 px-8 flex items-center justify-between pointer-events-none text-xs text-neutral-400 font-sans tracking-wide transition-all duration-300 ${
          !isHudHidden && !drawerOpen && (chromeVisible || controlsOpen)
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        }`}
      >
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
