"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useCursor } from "@/components/providers/CursorProvider";
import { HOVER_SPRING } from "@/lib/motion/easing";

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
            exit={{ scale: 0.5, opacity: 0, rotate: -45 }}
            transition={HOVER_SPRING}
          >
            <Copy className="w-3.5 h-3.5" strokeWidth={2} />
          </motion.div>
        ) : (
          <motion.div
            key="check"
            initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
            transition={HOVER_SPRING}
          >
            <Check className="w-3.5 h-3.5 text-vessel-accent" strokeWidth={2.2} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
