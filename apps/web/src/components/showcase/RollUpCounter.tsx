"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export function RollUpNumberCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const digits = String(value).split("");

  return (
    <span className="inline-flex items-center font-mono font-bold">
      {digits.map((digit, idx) => (
        <span key={`${idx}-${digits.length}`} className="relative inline-block h-[1.2em] overflow-hidden w-[0.62em] text-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={digit}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
      {suffix && <span className="ml-1 select-none">{suffix}</span>}
    </span>
  );
}
