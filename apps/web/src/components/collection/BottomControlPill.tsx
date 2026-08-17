"use client";

import React from "react";
import { Search } from "lucide-react";

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
          <Search size={14} className="pill-search-icon" />
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
              ✕
            </button>
          )}
        </div>

        <div className="pill-divider" />

        {/* Layout & Sort Toggles */}
        <div className="pill-sort-box">
          {/* Layout Toggle (Grid vs Masonry) */}
          <button
            type="button"
            className={`sort-icon-btn ${layoutMode === "grid" ? "active" : ""}`}
            onClick={onToggleLayout}
            title={layoutMode === "grid" ? "Layout: Grid (Click for Waterfall Masonry)" : "Layout: Waterfall Masonry (Click for Grid)"}
            aria-label="Switch Layout"
          >
            {layoutMode === "grid" ? (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="7" height="11" x="3" y="3" rx="1" />
                <rect width="7" height="6" x="14" y="3" rx="1" />
                <rect width="7" height="6" x="3" y="15" rx="1" />
                <rect width="7" height="11" x="14" y="10" rx="1" />
              </svg>
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
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 16 4 4 4-4" />
              <path d="M7 20V4" />
              <path d="M20 8h-5" />
              <path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10" />
              <path d="M15 14h5l-5 6h5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
