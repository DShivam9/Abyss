"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown, Check } from "lucide-react";

export type TagFilter = "ALL" | "MAJOR" | "ADDITION" | "FIX" | "REMOVAL";

interface ChangelogControlConsoleProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  tagFilter: TagFilter;
  onTagFilterChange: (tag: TagFilter) => void;
  monthFilter: string;
  onMonthFilterChange: (month: string) => void;
  componentFilter: string;
  onComponentFilterChange: (comp: string) => void;
  availableMonths: string[];
  availableComponents: string[];
  componentCounts: Record<string, number>;
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export function ChangelogControlConsole({
  searchQuery,
  onSearchChange,
  tagFilter,
  onTagFilterChange,
  monthFilter,
  onMonthFilterChange,
  componentFilter,
  onComponentFilterChange,
  availableMonths,
  availableComponents,
  componentCounts,
  filteredCount,
  totalCount,
  hasActiveFilters,
  onResetFilters,
}: ChangelogControlConsoleProps) {
  const [isComponentDropdownOpen, setIsComponentDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

  const componentDropdownRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        componentDropdownRef.current &&
        !componentDropdownRef.current.contains(e.target as Node)
      ) {
        setIsComponentDropdownOpen(false);
      }
      if (
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(e.target as Node)
      ) {
        setIsMonthDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        paddingTop: "8px",
        paddingBottom: "16px",
        position: "relative",
        zIndex: 30,
      }}
    >
      {/* Top Strip: Frameless Search + Text Selectors */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* Frameless Monospace Search Line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: "1 1 320px",
            minWidth: "260px",
            background: "transparent",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: "8px",
            transition: "border-color 150ms ease",
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = "rgba(155, 229, 251, 0.4)";
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
          }}
        >
          <Search className="w-3.5 h-3.5 text-[#71717a] shrink-0" />
          <input
            type="text"
            placeholder="Search releases, updates, or components..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "13px",
              color: "#ffffff",
              caretColor: "#9be5fb",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              style={{
                background: "transparent",
                border: "none",
                color: "#71717a",
                cursor: "pointer",
                padding: "2px",
              }}
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Selectors: Month & Component Text Triggers */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Month Text Trigger */}
          <div className="relative" ref={monthDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsMonthDropdownOpen((prev) => !prev);
                setIsComponentDropdownOpen(false);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "transparent",
                border: "none",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "12.5px",
                color: monthFilter !== "ALL" ? "#9be5fb" : "#8e8e93",
                cursor: "pointer",
                padding: "4px 0",
                transition: "color 150ms ease",
              }}
              onMouseEnter={(e) => {
                if (monthFilter === "ALL") e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                if (monthFilter === "ALL") e.currentTarget.style.color = "#8e8e93";
              }}
            >
              <span>Month: {monthFilter === "ALL" ? "All" : monthFilter}</span>
              <ChevronDown
                className={`w-3 h-3 text-[#71717a] transition-transform duration-200 ${
                  isMonthDropdownOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {/* Floating Month Menu */}
            {isMonthDropdownOpen && (
              <div
                data-lenis-prevent
                onWheel={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-48 bg-[#101013] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto overscroll-contain origin-top-right animate-in fade-in zoom-in-95 duration-150 ease-out"
              >
                <div className="p-1.5 space-y-0.5 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onMonthFilterChange("ALL");
                      setIsMonthDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      monthFilter === "ALL"
                        ? "bg-[#18181c] text-white font-medium"
                        : "text-[#8e8e93] hover:text-white hover:bg-[#141418]"
                    }`}
                  >
                    <span>All Months</span>
                    {monthFilter === "ALL" && (
                      <Check className="w-3.5 h-3.5 text-[#9be5fb]" />
                    )}
                  </button>

                  {availableMonths.map((m) => {
                    const isSelected = monthFilter === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          onMonthFilterChange(m);
                          setIsMonthDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#18181c] text-white font-medium"
                            : "text-[#8e8e93] hover:text-white hover:bg-[#141418]"
                        }`}
                      >
                        <span>{m}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#9be5fb]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Component Text Trigger */}
          <div className="relative" ref={componentDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsComponentDropdownOpen((prev) => !prev);
                setIsMonthDropdownOpen(false);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "transparent",
                border: "none",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "12.5px",
                color: componentFilter !== "ALL" ? "#9be5fb" : "#8e8e93",
                cursor: "pointer",
                padding: "4px 0",
                transition: "color 150ms ease",
              }}
              onMouseEnter={(e) => {
                if (componentFilter === "ALL") e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                if (componentFilter === "ALL") e.currentTarget.style.color = "#8e8e93";
              }}
            >
              <span>Scope: {componentFilter === "ALL" ? "All" : componentFilter}</span>
              <ChevronDown
                className={`w-3 h-3 text-[#71717a] transition-transform duration-200 ${
                  isComponentDropdownOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {/* Floating Component Menu */}
            {isComponentDropdownOpen && (
              <div
                data-lenis-prevent
                onWheel={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-64 bg-[#101013] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto overscroll-contain origin-top-right animate-in fade-in zoom-in-95 duration-150 ease-out"
              >
                <div className="p-1.5 space-y-0.5 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onComponentFilterChange("ALL");
                      setIsComponentDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      componentFilter === "ALL"
                        ? "bg-[#18181c] text-white font-medium"
                        : "text-[#8e8e93] hover:text-white hover:bg-[#141418]"
                    }`}
                  >
                    <span>All Components</span>
                    {componentFilter === "ALL" && (
                      <Check className="w-3.5 h-3.5 text-[#9be5fb]" />
                    )}
                  </button>

                  {availableComponents.map((slug) => {
                    const isSelected = componentFilter === slug;
                    const count = componentCounts[slug] || 0;
                    return (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => {
                          onComponentFilterChange(slug);
                          setIsComponentDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#18181c] text-white font-medium"
                            : "text-[#8e8e93] hover:text-white hover:bg-[#141418]"
                        }`}
                      >
                        <span className="truncate">{slug}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#55555c] bg-[#08080a] px-2 py-0.5 rounded-md border border-[rgba(255,255,255,0.05)]">
                            {count}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#9be5fb]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Strip: Mono Tag Tokens with Slow Underline + Result Counter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "12.5px",
        }}
      >
        {/* Monospace Tag Filter Tokens */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {(
            [
              { id: "ALL", label: "[ALL]" },
              { id: "MAJOR", label: "[MAJOR]" },
              { id: "ADDITION", label: "[ADD]" },
              { id: "FIX", label: "[FIX]" },
              { id: "REMOVAL", label: "[REM]" },
            ] as const
          ).map((tab) => {
            const isActive = tagFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTagFilterChange(tab.id)}
                style={{
                  position: "relative",
                  background: "transparent",
                  border: "none",
                  padding: "4px 0",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "12px",
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: "0.08em",
                  color: isActive ? "#ffffff" : "#71717a",
                  cursor: "pointer",
                  transition: "color 150ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#d4d4d8";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#71717a";
                }}
              >
                <span>{tab.label}</span>
                {/* Slow Ink-Draw Underline */}
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "1.5px",
                    background: "#9be5fb",
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
                    pointerEvents: "none",
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Results Counter & Reset */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#71717a",
            fontSize: "12px",
          }}
        >
          <span>
            <strong style={{ color: "#ffffff", fontWeight: 600 }}>{filteredCount}</strong> of{" "}
            {totalCount} releases
          </span>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              style={{
                background: "transparent",
                border: "none",
                color: "#9be5fb",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                cursor: "pointer",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "12px",
                padding: 0,
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
