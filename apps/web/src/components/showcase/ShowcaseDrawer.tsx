"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, ArrowRight } from "lucide-react";
import { scrambleWordLastCharFirst } from "./showcase-utils";

export function CategoryFilterTabs({
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

export function ScrambleTabButton({
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
  const [, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState(label);
  const isAnimatingRef = useRef<boolean>(false);

  useEffect(() => {
    setDisplayText(label);
  }, [label]);

  const triggerScramble = React.useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    let frame = 0;
    const waveWidth = 2;
    const totalFrames = (label.length + waveWidth) * 2;
    const intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);
      const result = scrambleWordLastCharFirst(label, waveCenter, waveWidth, frame);

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText(label);
        isAnimatingRef.current = false;
      }
    }, 38);
  }, [label]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover();
        triggerScramble();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="relative px-3 py-1 rounded-lg text-[11px] font-mono tracking-wider transition-colors cursor-pointer select-none"
    >
      {isActive && (
        <motion.div
          layoutId="activeCategoryPill"
          className="absolute inset-0 bg-white rounded-lg z-0 shadow-sm"
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
        />
      )}

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

export function HighlightedText({
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
          isActive ? "text-white font-bold tracking-wider uppercase" : "text-neutral-500 font-medium group-hover:text-white"
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
        isActive ? "text-white font-bold tracking-wider uppercase" : "text-neutral-400 font-medium"
      }`}
    >
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className={`px-0.5 rounded-sm font-bold ${
              isActive ? "bg-white/20 text-white" : "bg-amber-400/30 text-amber-200"
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

export function ScrambleDrawerComponentItem({
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
  const [displayText, setDisplayText] = useState(label);
  const isAnimatingRef = useRef<boolean>(false);

  useEffect(() => {
    setDisplayText(label);
  }, [label]);

  const triggerScramble = React.useCallback(() => {
    if (isAnimatingRef.current || searchQuery) return;
    isAnimatingRef.current = true;

    let frame = 0;
    const waveWidth = 2;
    const totalFrames = (label.length + waveWidth) * 2;
    const intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);
      const result = scrambleWordLastCharFirst(label, waveCenter, waveWidth, frame);

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText(label);
        isAnimatingRef.current = false;
      }
    }, 38);
  }, [label, searchQuery]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovered(true);
        triggerScramble();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full text-left px-2 py-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] cursor-pointer flex items-center justify-between group overflow-hidden select-none bg-transparent hover:translate-x-1"
    >
      <div className="relative z-10 flex items-center gap-2 py-0.5 text-xs font-mono">
        {isActive && (
          <span className="text-[11px] font-mono text-white font-bold select-none shrink-0">
            +
          </span>
        )}
        <HighlightedText text={displayText} query={searchQuery} isActive={isActive} />
      </div>

      {!isActive && (
        <motion.div
          animate={{
            x: isHovered ? 0 : -4,
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="relative z-10 shrink-0 text-neutral-500 group-hover:text-white"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.div>
      )}

      <motion.span
        initial={false}
        animate={{
          scaleX: isActive || isHovered ? 1 : 0,
          opacity: isActive || isHovered ? 1 : 0,
          transformOrigin: isActive || isHovered ? "0% 50%" : "100% 50%",
        }}
        transition={{ duration: isActive || isHovered ? 0.35 : 0.88, ease: [0.16, 1, 0.3, 1] }}
        className={`absolute bottom-0 left-2 right-2 h-[1px] pointer-events-none transform-gpu will-change-transform ${
          isActive ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" : "bg-gradient-to-r from-white via-white/80 to-transparent"
        }`}
      />
    </button>
  );
}

export function ScrambleHomeLink() {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState("HOME");
  const isAnimatingRef = useRef<boolean>(false);

  const triggerScramble = React.useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    let frame = 0;
    const label = "HOME";
    const waveWidth = 2;
    const totalFrames = (label.length + waveWidth) * 2;
    const intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);
      const result = scrambleWordLastCharFirst(label, waveCenter, waveWidth, frame);

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText("HOME");
        isAnimatingRef.current = false;
      }
    }, 38);
  }, []);

  return (
    <Link
      href="/components"
      onMouseEnter={() => {
        setIsHovered(true);
        triggerScramble();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center gap-2 px-3.5 h-9 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-xl text-xs font-sans font-medium tracking-wider text-neutral-300 hover:text-white transition-all cursor-pointer shrink-0 select-none group backdrop-blur-md overflow-hidden"
      title="Return to Main Catalog Page"
    >
      <Home className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-115" />
      <span className="min-w-[36px] inline-block font-mono font-semibold">{displayText}</span>

      <motion.span
        initial={false}
        animate={{
          scaleX: isHovered ? 1 : 0,
          opacity: isHovered ? 1 : 0,
          transformOrigin: isHovered ? "0% 50%" : "100% 50%",
        }}
        transition={{ duration: isHovered ? 0.35 : 0.88, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none"
      />
    </Link>
  );
}

export function ScrambleCatalogLink({ category }: { category: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState("CATALOG");
  const isAnimatingRef = useRef<boolean>(false);

  const triggerScramble = React.useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    let frame = 0;
    const label = "CATALOG";
    const waveWidth = 2;
    const totalFrames = (label.length + waveWidth) * 2;
    const intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);
      const result = scrambleWordLastCharFirst(label, waveCenter, waveWidth, frame);

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText("CATALOG");
        isAnimatingRef.current = false;
      }
    }, 38);
  }, []);

  return (
    <Link
      href={`/components?tab=${category}`}
      onMouseEnter={() => {
        setIsHovered(true);
        triggerScramble();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center gap-2 text-xs font-mono font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer group py-0.5"
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

      <span className="min-w-[60px] inline-block">{displayText}</span>

      <motion.span
        initial={false}
        animate={{
          scaleX: isHovered ? 1 : 0,
          opacity: isHovered ? 1 : 0,
          transformOrigin: isHovered ? "0% 50%" : "100% 50%",
        }}
        transition={{ duration: isHovered ? 0.35 : 0.88, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none"
      />
    </Link>
  );
}

export function ScramblePrevLink({ slug }: { slug: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState("PREV");
  const isAnimatingRef = useRef<boolean>(false);

  const triggerScramble = React.useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    let frame = 0;
    const label = "PREV";
    const waveWidth = 2;
    const totalFrames = (label.length + waveWidth) * 2;
    const intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);
      const result = scrambleWordLastCharFirst(label, waveCenter, waveWidth, frame);

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText("PREV");
        isAnimatingRef.current = false;
      }
    }, 38);
  }, []);

  return (
    <Link
      href={`/showcase/${slug}`}
      onMouseEnter={() => {
        setIsHovered(true);
        triggerScramble();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer group py-0.5"
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

      <motion.span
        initial={false}
        animate={{
          scaleX: isHovered ? 1 : 0,
          opacity: isHovered ? 1 : 0,
          transformOrigin: isHovered ? "0% 50%" : "100% 50%",
        }}
        transition={{ duration: isHovered ? 0.35 : 0.88, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none"
      />
    </Link>
  );
}

export function ScrambleNextLink({ slug }: { slug: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState("NEXT");
  const isAnimatingRef = useRef<boolean>(false);

  const triggerScramble = React.useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    let frame = 0;
    const label = "NEXT";
    const waveWidth = 2;
    const totalFrames = (label.length + waveWidth) * 2;
    const intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);
      const result = scrambleWordLastCharFirst(label, waveCenter, waveWidth, frame);

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText("NEXT");
        isAnimatingRef.current = false;
      }
    }, 38);
  }, []);

  return (
    <Link
      href={`/showcase/${slug}`}
      onMouseEnter={() => {
        setIsHovered(true);
        triggerScramble();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer group py-0.5"
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

      <motion.span
        initial={false}
        animate={{
          scaleX: isHovered ? 1 : 0,
          opacity: isHovered ? 1 : 0,
          transformOrigin: isHovered ? "0% 50%" : "100% 50%",
        }}
        transition={{ duration: isHovered ? 0.35 : 0.88, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none"
      />
    </Link>
  );
}
