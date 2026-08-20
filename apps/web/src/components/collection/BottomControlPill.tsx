"use client";

import React from "react";
import { 
  Search, 
  X, 
  Grid2x2, 
  Columns3, 
  Sparkles, 
  ArrowDownAZ, 
  ArrowUpAZ 
} from "lucide-react";

interface BottomControlPillProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  layoutMode: "grid" | "masonry";
  onToggleLayout: () => void;
  sortMode: "curated" | "asc" | "desc";
  onToggleSort: () => void;
}

export function BottomControlPill({
  searchQuery,
  onSearchChange,
  layoutMode,
  onToggleLayout,
  sortMode,
  onToggleSort,
}: BottomControlPillProps) {
  return (
    <div className="control-bar-wrap">
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
            <button
              type="button"
              className="pill-clear-btn"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <X size={12} strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="pill-divider" />

        {/* Layout & Sort Toggles */}
        <div className="pill-sort-box">
          {/* Layout Toggle (Grid vs Masonry) */}
          <button
            type="button"
            className="sort-icon-btn active"
            onClick={onToggleLayout}
            title={layoutMode === "grid" ? "Layout: Grid (Click for Waterfall Masonry)" : "Layout: Waterfall Masonry (Click for Grid)"}
            aria-label="Switch Layout"
          >
            {layoutMode === "grid" ? (
              <Grid2x2 size={15} strokeWidth={1.4} />
            ) : (
              <Columns3 size={15} strokeWidth={1.4} />
            )}
          </button>

          {/* Sort Toggle (Curated -> A→Z -> Z→A) */}
          <button
            type="button"
            className={`sort-icon-btn ${sortMode !== "curated" ? "active" : ""}`}
            onClick={onToggleSort}
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
          </button>
        </div>
      </div>
    </div>
  );
}
