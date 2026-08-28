"use client";

import React from "react";
import { 
  Search, 
  X, 
  Sparkles, 
  ArrowDownAZ, 
  ArrowUpAZ 
} from "lucide-react";

import { motion } from "framer-motion";

interface BottomControlPillProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  sortMode: "curated" | "asc" | "desc";
  onToggleSort: () => void;
}

export function BottomControlPill({
  searchQuery,
  onSearchChange,
  sortMode,
  onToggleSort,
}: BottomControlPillProps) {
  const [lift, setLift] = React.useState(0);

  React.useEffect(() => {
    let rAF = 0;
    const handleScroll = () => {
      cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => {
        const sheet = document.getElementById("mainSheet");
        if (!sheet) return;
        const rect = sheet.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.bottom < windowHeight) {
          setLift(windowHeight - rect.bottom);
        } else {
          setLift(0);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rAF);
    };
  }, []);

  return (
    <div
      className="control-bar-wrap"
      style={{ transform: `translate(-50%, -${lift}px)` }}
    >
      <div className="control-pill">
        {/* Search input */}
        <div className="pill-search-box">
          <Search size={14} strokeWidth={1.8} className="pill-search-icon" />
          <input
            type="text"
            className="live-search-input"
            placeholder="Explore"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoComplete="off"
          />
          {searchQuery.length > 0 && (
            <motion.button
              type="button"
              className="pill-clear-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                onSearchChange("");
              }}
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              whileTap={{ scale: 0.85 }}
            >
              <X size={12} strokeWidth={2} />
            </motion.button>
          )}
        </div>

        <div className="pill-divider" />

        {/* Sort Toggle */}
        <div className="pill-sort-box">
          {/* Sort Toggle (Curated -> A→Z -> Z→A) */}
          <motion.button
            type="button"
            className={`sort-icon-btn ${sortMode !== "curated" ? "active" : ""}`}
            onClick={onToggleSort}
            whileTap={{ scale: 0.86 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            title={
              sortMode === "curated"
                ? "Sort: Curated (Click for A → Z)"
                : sortMode === "asc"
                ? "Sort: A → Z (Click for Z → A)"
                : "Sort: Z → A (Click for Curated)"
            }
            aria-label="Toggle Alphabetical Sort"
          >
            {sortMode === "curated" ? (
              <Sparkles size={14} strokeWidth={1.5} />
            ) : sortMode === "asc" ? (
              <ArrowDownAZ size={15} strokeWidth={1.6} />
            ) : (
              <ArrowUpAZ size={15} strokeWidth={1.6} />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
