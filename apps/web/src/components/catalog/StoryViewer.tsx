"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

export function TechStackRollUpItem({ tag }: { tag: string }) {
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      className="relative inline-flex items-center cursor-pointer select-none group"
    >
      {tag.split("").map((char, index) => {
        if (char === " ") {
          return <span key={index} className="inline-block w-1 select-none" />;
        }
        return (
          <div key={index} className="relative inline-block h-4 overflow-hidden">
            <span className="block text-xs font-mono font-medium text-neutral-400 leading-none">
              {char}
            </span>

            <motion.span
              variants={{
                initial: { y: "100%" },
                hover: { y: "0%" },
              }}
              transition={{
                duration: 0.28,
                delay: index * 0.025,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute inset-0 block text-xs font-mono font-bold text-black leading-none bg-white"
            >
              {char}
            </motion.span>
          </div>
        );
      })}
    </motion.div>
  );
}

export function TextScramble({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [displayText, setDisplayText] = useState(text);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  useEffect(() => {
    if (!isInView || hasAnimated) return;
    setHasAnimated(true);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let iteration = 0;
    const totalFrames = 14;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < (iteration / totalFrames) * text.length) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      iteration += 1;
      if (iteration >= totalFrames) {
        setDisplayText(text);
        clearInterval(interval);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [isInView, text, hasAnimated]);

  return (
    <h3 ref={ref} className={className}>
      {displayText}
    </h3>
  );
}

export function StoryViewer({ content }: { content: string }) {
  if (!content) return null;

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-neutral-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200/80 font-mono text-xs text-neutral-800">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = (key: string) => {
    if (currentList.length > 0) {
      blocks.push(
        <ul key={key} className="space-y-2.5 my-4">
          {currentList.map((item, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-2.5 text-sm text-neutral-600 leading-relaxed font-sans"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 mt-2 shrink-0" />
              <span className="flex-1">{renderFormattedText(item)}</span>
            </motion.li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "---") {
      flushList(`list-${idx}`);
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushList(`list-${idx}`);
      if (trimmed.includes("(") && trimmed.includes(")")) return;
      blocks.push(
        <TextScramble
          key={idx}
          text={trimmed.replace(/^##\s+/, "")}
          className="text-base font-bold tracking-tight text-neutral-900 mt-8 mb-3 font-sans"
        />
      );
    } else if (trimmed.startsWith("### ")) {
      flushList(`list-${idx}`);
      blocks.push(
        <TextScramble
          key={idx}
          text={trimmed.replace(/^###\s+/, "")}
          className="text-sm font-bold tracking-tight text-neutral-900 mt-6 mb-2 font-sans"
        />
      );
    } else if (trimmed.startsWith("> ")) {
      flushList(`list-${idx}`);
      blocks.push(
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 12, x: -4 }}
          whileInView={{ opacity: 1, y: 0, x: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg text-neutral-800 font-normal italic leading-relaxed pl-4 border-l-2 border-neutral-900 my-6 font-sans"
        >
          {renderFormattedText(trimmed.replace(/^>\s+/, ""))}
        </motion.p>
      );
    } else if (trimmed.startsWith("- ")) {
      currentList.push(trimmed.replace(/^-+\s+/, ""));
    } else {
      flushList(`list-${idx}`);
      blocks.push(
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm text-neutral-600 leading-relaxed font-sans my-3"
        >
          {renderFormattedText(trimmed)}
        </motion.p>
      );
    }
  });

  flushList("list-final");

  return <div className="space-y-2">{blocks}</div>;
}
