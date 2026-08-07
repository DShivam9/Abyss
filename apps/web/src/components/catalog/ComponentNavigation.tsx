"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { scrambleWordLastCharFirst } from "../showcase/showcase-utils";

export function OpenShowcaseButton({ slug }: { slug: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const originalText = "OPEN SHOWCASE";
  const [displayText, setDisplayText] = useState(originalText);
  const isAnimatingRef = useRef<boolean>(false);
  const href = `/showcase/${slug}`;

  const triggerScramble = React.useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    let frame = 0;
    const waveWidth = 2;
    const totalFrames = (originalText.length + waveWidth) * 2;
    const intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);
      const result = scrambleWordLastCharFirst(originalText, waveCenter, waveWidth, frame);

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText(originalText);
        isAnimatingRef.current = false;
      }
    }, 38);
  }, []);

  return (
    <Link
      href={href}
      onMouseEnter={() => {
        setIsHovered(true);
        triggerScramble();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="relative inline-flex items-center gap-2.5 py-1.5 px-1 cursor-pointer select-none group text-neutral-900 font-mono font-bold text-sm tracking-widest uppercase"
    >
      <span className="font-mono min-w-[150px] inline-block">{displayText}</span>

      <div className="relative w-4 h-4 overflow-hidden shrink-0 flex items-center justify-center">
        <motion.div
          animate={{ x: isHovered ? "100%" : "0%", y: isHovered ? "-100%" : "0%" }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <ArrowUpRight className="w-4 h-4 text-neutral-900" />
        </motion.div>
        <motion.div
          animate={{ x: isHovered ? "0%" : "-100%", y: isHovered ? "0%" : "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <ArrowUpRight className="w-4 h-4 text-neutral-900" />
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
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none transform-gpu will-change-transform"
      />
    </Link>
  );
}

export function GithubSourceButton({ slug }: { slug: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const originalText = "VIEW CODE";
  const [displayText, setDisplayText] = useState(originalText);
  const isAnimatingRef = useRef<boolean>(false);

  const githubUrl = `https://github.com/DShivam9/Abyss/tree/main/packages/core/src/components/${slug}`;

  const triggerScramble = React.useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    let frame = 0;
    const waveWidth = 2;
    const totalFrames = (originalText.length + waveWidth) * 2;
    const intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);
      const result = scrambleWordLastCharFirst(originalText, waveCenter, waveWidth, frame);

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText(originalText);
        isAnimatingRef.current = false;
      }
    }, 38);
  }, []);

  return (
    <a
      href={githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => {
        setIsHovered(true);
        triggerScramble();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="relative inline-flex items-center gap-2 py-1.5 px-1 cursor-pointer select-none group text-neutral-700 hover:text-black transition-colors font-mono font-bold text-sm tracking-widest uppercase"
    >
      <span className="text-neutral-500 group-hover:text-black transition-colors text-xs font-semibold">
        &lt;/&gt;
      </span>
      <span className="font-mono min-w-[100px] inline-block">{displayText}</span>

      <div className="relative w-4 h-4 overflow-hidden shrink-0 flex items-center justify-center">
        <motion.div
          animate={{ x: isHovered ? "100%" : "0%", y: isHovered ? "-100%" : "0%" }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-black" />
        </motion.div>
        <motion.div
          animate={{ x: isHovered ? "0%" : "-100%", y: isHovered ? "0%" : "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <ArrowUpRight className="w-4 h-4 text-black" />
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
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none transform-gpu will-change-transform"
      />
    </a>
  );
}
