"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCursor } from "@/components/providers/CursorProvider";
import { HOVER_SPRING } from "@/lib/motion/easing";

const ClipboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3.5 h-3.5"
  >
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3.5 h-3.5 text-vessel-accent"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { setCursorState } = useCursor();

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      onMouseEnter={() => setCursorState("hover-link")}
      onMouseLeave={() => setCursorState("default")}
      className="p-1.5 text-vessel-text-muted hover:text-vessel-text-primary bg-vessel-base border border-vessel-border-hairline rounded-none cursor-pointer outline-none relative w-7 h-7 flex items-center justify-center transition-colors duration-200"
    >
      <AnimatePresence mode="wait">
        {!copied ? (
          <motion.div
            key="copy"
            initial={{ scale: 0.5, opacity: 0, rotate: 45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
            transition={HOVER_SPRING}
          >
            <ClipboardIcon />
          </motion.div>
        ) : (
          <motion.div
            key="check"
            initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: -45 }}
            transition={HOVER_SPRING}
          >
            <CheckIcon />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
