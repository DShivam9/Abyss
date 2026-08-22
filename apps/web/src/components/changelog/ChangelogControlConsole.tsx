"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Calendar, Layers, ChevronDown, Check } from "lucide-react";

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
  const [cursorPos, setCursorPos] = useState(0);
  const [caretOffset, setCaretOffset] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const [isComponentDropdownOpen, setIsComponentDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const componentDropdownRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);

  // Measure caret offset whenever searchQuery or cursorPos changes
  useEffect(() => {
    if (mirrorRef.current) {
      setCaretOffset(mirrorRef.current.offsetWidth);
    }
  }, [searchQuery, cursorPos]);

  const updateCursorPosition = () => {
    if (inputRef.current) {
      setCursorPos(inputRef.current.selectionStart ?? searchQuery.length);
    }
  };

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
    <section className="bg-[#101013] border border-[rgba(255,255,255,0.05)] rounded-2xl p-3 md:p-3.5 space-y-3 relative z-30">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Search Input Box with Smooth Gliding Caret */}
        <div className="relative flex-1 flex items-center bg-[#0a0a0c] border border-[rgba(255,255,255,0.05)] focus-within:border-[rgba(255,255,255,0.18)] rounded-xl transition-colors">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55555c] pointer-events-none" />
          <div className="relative flex-1 flex items-center ml-10 mr-2 py-2 overflow-hidden">
            {/* Invisible text mirror for precise cursor measurement */}
            <span
              ref={mirrorRef}
              className="absolute invisible pointer-events-none whitespace-pre text-xs font-['Switzer',sans-serif] tracking-normal"
              aria-hidden="true"
            >
              {searchQuery.slice(0, cursorPos)}
            </span>
            {/* Smooth Gliding Caret */}
            {isFocused && (
              <span
                className="absolute left-0 top-[calc(50%-7px)] w-[1.5px] h-[14px] bg-white rounded-full pointer-events-none transition-transform duration-100 ease-out animate-[smoothCaretBlink_1.1s_ease-in-out_infinite] z-10"
                style={{ transform: `translateX(${caretOffset}px)` }}
                aria-hidden="true"
              />
            )}
            <input
              ref={inputRef}
              type="text"
              placeholder="Search releases, components, or updates..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCursorPos(e.target.selectionStart ?? e.target.value.length);
              }}
              onSelect={updateCursorPosition}
              onKeyUp={updateCursorPosition}
              onFocus={() => {
                setIsFocused(true);
                updateCursorPosition();
              }}
              onBlur={() => setIsFocused(false)}
              className="w-full bg-transparent border-none outline-none text-xs font-['Switzer',sans-serif] text-white placeholder-[#55555c] caret-transparent"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange("");
                setCursorPos(0);
                setCaretOffset(0);
              }}
              className="mr-3 text-[#55555c] hover:text-white transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls: Month Selector + Component Selector */}
        <div className="flex items-center gap-2 justify-end">
          {/* Month Dropdown Menu */}
          <div className="relative" ref={monthDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsMonthDropdownOpen((prev) => !prev);
                setIsComponentDropdownOpen(false);
              }}
              className={`flex items-center gap-2 pl-3.5 pr-3 py-2 rounded-xl bg-[#0a0a0c] border text-xs font-mono transition-colors cursor-pointer ${
                isMonthDropdownOpen || monthFilter !== "ALL"
                  ? "border-[rgba(255,255,255,0.18)] text-white shadow-sm"
                  : "border-[rgba(255,255,255,0.05)] text-[#d4d4d8] hover:border-[rgba(255,255,255,0.12)]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#55555c] shrink-0" />
              <span className="truncate">
                {monthFilter === "ALL" ? "All Months" : monthFilter}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#55555c] transition-transform duration-200 shrink-0 ${
                  isMonthDropdownOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {/* Floating Month Dropdown Panel */}
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

          {/* Component Dropdown Menu */}
          <div className="relative" ref={componentDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsComponentDropdownOpen((prev) => !prev);
                setIsMonthDropdownOpen(false);
              }}
              className={`flex items-center gap-2 pl-3.5 pr-3 py-2 rounded-xl bg-[#0a0a0c] border text-xs font-mono transition-colors cursor-pointer ${
                isComponentDropdownOpen || componentFilter !== "ALL"
                  ? "border-[rgba(255,255,255,0.18)] text-white shadow-sm"
                  : "border-[rgba(255,255,255,0.05)] text-[#d4d4d8] hover:border-[rgba(255,255,255,0.12)]"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#55555c] shrink-0" />
              <span className="truncate max-w-[140px]">
                {componentFilter === "ALL"
                  ? "All Components"
                  : componentFilter}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#55555c] transition-transform duration-200 shrink-0 ${
                  isComponentDropdownOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {/* Floating Component Dropdown Panel (Isolated scroll) */}
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

      {/* Segmented Type Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[rgba(255,255,255,0.04)] font-mono text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "ALL", label: "All Types" },
              { id: "MAJOR", label: "Major" },
              { id: "ADDITION", label: "Additions" },
              { id: "FIX", label: "Fixes" },
              { id: "REMOVAL", label: "Removals" },
            ] as const
          ).map((tab) => {
            const isActive = tagFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTagFilterChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#18181c] text-white border border-[rgba(255,255,255,0.12)] font-medium"
                    : "bg-transparent text-[#8e8e93] hover:text-white border border-transparent hover:border-[rgba(255,255,255,0.06)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Results Count & Clear */}
        <div className="flex items-center gap-3 text-xs text-[#8e8e93]">
          <span>
            Showing{" "}
            <strong className="text-white font-mono">{filteredCount}</strong> of{" "}
            {totalCount}
          </span>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs text-[#9be5fb] hover:underline cursor-pointer font-mono"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
