"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";

export function AnimatedCopyButton({
  text,
  label = "Copy Code",
  icon: DefaultIcon = Copy,
}: {
  text: string;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={handleCopy}
      className="px-2.5 py-1 text-xs font-sans font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 transition-colors border border-neutral-800 flex items-center justify-center shrink-0 min-w-[85px] overflow-hidden select-none"
    >
      <AnimatePresence mode="wait" initial={false}>
        {!copied ? (
          <motion.span
            key="copy"
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="flex items-center gap-1.5"
          >
            <DefaultIcon className="w-3.5 h-3.5 text-neutral-400" />
            <span>{label}</span>
          </motion.span>
        ) : (
          <motion.span
            key="check"
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="flex items-center gap-1.5 text-emerald-400 font-semibold"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Copied!</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
