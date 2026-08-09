"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Eye } from "lucide-react";
import { cleanLabel, scrambleWordLastCharFirst } from "./showcase-utils";

export function ScrambleHeaderTrigger({
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
  const isAnimatingRef = useRef<boolean>(false);

  useEffect(() => {
    setDisplayText(clean);
  }, [clean]);

  const triggerScramble = React.useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    let frame = 0;
    const waveWidth = 2;
    const totalFrames = (clean.length + waveWidth) * 2;
    const intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);
      const result = scrambleWordLastCharFirst(clean, waveCenter, waveWidth, frame);

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText(clean);
        isAnimatingRef.current = false;
      }
    }, 38);
  }, [clean]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovered(true);
        triggerScramble();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-neutral-200 hover:text-white transition-colors cursor-pointer select-none py-1 group"
    >
      <span className="min-w-[140px] inline-block text-center">{displayText}</span>
      <ChevronDown
        className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "rotate-180 text-white" : ""
        }`}
      />

      <motion.span
        initial={false}
        animate={{
          scaleX: isHovered ? 1 : 0,
          opacity: isHovered ? 1 : 0,
          transformOrigin: isHovered ? "0% 50%" : "100% 50%",
        }}
        transition={{ duration: isHovered ? 0.35 : 0.88, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none transform-gpu will-change-transform"
      />
    </button>
  );
}

export function TactileSlidersIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 shrink-0"
    >
      <line x1="3" y1="8" x2="21" y2="8" className="opacity-40" />
      <motion.circle
        cx="8"
        cy="8"
        r="2.2"
        animate={{ x: isHovered ? 8 : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        className="fill-[#070708] stroke-current text-white"
      />
      <line x1="3" y1="16" x2="21" y2="16" className="opacity-40" />
      <motion.circle
        cx="16"
        cy="16"
        r="2.2"
        animate={{ x: isHovered ? -8 : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        className="fill-[#070708] stroke-current text-white"
      />
    </svg>
  );
}

export function TactileEyeIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 shrink-0"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" className="opacity-70" />
      <motion.circle
        cx="12"
        cy="12"
        r="2.8"
        animate={{ scale: isHovered ? 0.3 : 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fill-current text-white"
      />
      <motion.path
        d="M2 12c3-4 7-6 10-6s7 2 10 6"
        initial={{ opacity: 0, y: -2 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 2 : -2 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="stroke-white"
      />
    </svg>
  );
}

export function ScrambleControlsTrigger({
  controlsOpen,
  onClick,
}: {
  controlsOpen: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const label = "CONTROLS";
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
      const result = scrambleWordLastCharFirst(label, waveCenter, waveWidth, frame);

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText(label);
      }
    }, 24);

    return () => clearInterval(intervalId);
  }, [isHovered]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative z-50 pointer-events-auto flex items-center gap-2 py-1 px-1.5 bg-transparent text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer select-none group ${
        controlsOpen ? "text-white font-bold" : "text-neutral-400 hover:text-white font-medium"
      }`}
      title="Toggle Controls (Press C)"
    >
      <TactileSlidersIcon isHovered={isHovered} />
      <span className="min-w-[56px] inline-block text-left">{displayText}</span>

      <motion.span
        initial={false}
        animate={{
          scaleX: isHovered || controlsOpen ? 1 : 0,
          opacity: isHovered || controlsOpen ? 1 : 0,
          transformOrigin: isHovered || controlsOpen ? "0% 50%" : "100% 50%",
        }}
        transition={{ duration: isHovered || controlsOpen ? 0.35 : 0.88, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none"
      />
    </button>
  );
}

export function ScrambleHideHudTrigger({
  isHudHidden,
  onClick,
}: {
  isHudHidden: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const label = isHudHidden ? "SHOW HUD" : "HIDE HUD";
  const [displayText, setDisplayText] = useState(label);

  useEffect(() => {
    setDisplayText(label);
  }, [label]);

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
      const result = scrambleWordLastCharFirst(label, waveCenter, waveWidth, frame);

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
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative z-50 pointer-events-auto flex items-center gap-2 py-1 px-1.5 bg-transparent text-xs font-mono font-medium tracking-wider uppercase text-neutral-400 hover:text-white transition-colors cursor-pointer select-none group"
      title={isHudHidden ? "Show HUD (Press H)" : "Hide HUD (Press H)"}
    >
      {isHudHidden ? (
        <Eye className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform duration-300 group-hover:scale-110 shrink-0" />
      ) : (
        <TactileEyeIcon isHovered={isHovered} />
      )}
      <span className="min-w-[56px] inline-block text-left">{displayText}</span>

      <motion.span
        initial={false}
        animate={{
          scaleX: isHovered ? 1 : 0,
          opacity: isHovered ? 1 : 0,
          transformOrigin: isHovered ? "0% 50%" : "100% 50%",
        }}
        transition={{ duration: isHovered ? 0.35 : 0.88, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none transform-gpu will-change-transform"
      />
    </button>
  );
}
