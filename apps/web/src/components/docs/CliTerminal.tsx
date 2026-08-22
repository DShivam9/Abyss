"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type PackageManager = "pnpm" | "npm" | "bun" | "yarn";

export function CliTerminal({
  commands,
  layoutPrefix,
}: {
  commands: Record<PackageManager, string>;
  layoutPrefix: string;
}) {
  const [selectedPm, setSelectedPm] = useState<PackageManager>("pnpm");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(commands[selectedPm]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        borderRadius: "14px",
        background: "linear-gradient(180deg, #141416 0%, #0e0e11 100%)",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        overflow: "hidden",
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 16px 36px rgba(0, 0, 0, 0.7)",
        padding: "12px 14px 16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 4px",
        }}
      >
        {/* Segmented Dock Pill Tabs with Sliding Layout Indicator */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "2px",
            background: "rgba(255, 255, 255, 0.025)",
            padding: "3px",
            borderRadius: "9px",
            border: "1px solid rgba(255, 255, 255, 0.04)",
            position: "relative",
          }}
        >
          {(["pnpm", "npm", "bun", "yarn"] as const).map((pm) => {
            const isSelected = selectedPm === pm;
            return (
              <motion.button
                key={pm}
                onClick={() => setSelectedPm(pm)}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                style={{
                  position: "relative",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "12px",
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? "#ffffff" : "#8e8e93",
                  background: "transparent",
                  border: "none",
                  borderRadius: "7px",
                  padding: "4px 10px",
                  cursor: "pointer",
                  zIndex: 1,
                  transition: "color 200ms ease",
                }}
              >
                {isSelected && (
                  <motion.div
                    layoutId={`${layoutPrefix}-active-pill`}
                    transition={{
                      type: "spring",
                      stiffness: 240,
                      damping: 26,
                    }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, #222228 0%, #1a1a20 100%)",
                      borderRadius: "7px",
                      border: "1px solid rgba(255, 255, 255, 0.09)",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
                      zIndex: -1,
                    }}
                  />
                )}
                <span>{pm}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Tactile Copy Button with Pure Neutral Surface & Blue Tick */}
        <motion.button
          onClick={handleCopy}
          whileTap={{ scale: 0.95 }}
          whileHover={{ y: -1 }}
          transition={{ duration: 0.15 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            padding: "5px 11px",
            color: copied ? "#ffffff" : "#a1a1aa",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "12px",
            cursor: "pointer",
            transition: "all 180ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.07)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.color = copied ? "#ffffff" : "#a1a1aa";
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "inline-flex", color: "#9be5fb" }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9be5fb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "inline-flex" }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
          <span style={{ color: copied ? "#ffffff" : "inherit" }}>
            {copied ? "Copied" : "Copy"}
          </span>
        </motion.button>
      </div>

      {/* Code Text with Subtle Smooth Crossfade (Slowing to 280ms) */}
      <div
        style={{
          padding: "8px 8px 4px 8px",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "14px",
          color: "#f4f4f5",
          lineHeight: 1.6,
          overflowX: "auto",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ color: "#71717a", userSelect: "none" }}>$</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={selectedPm}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ color: "#f4f4f5" }}
          >
            {commands[selectedPm]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
