"use client";

import React from "react";

interface CategoryNavProps {
  categories: { id: string; label: string; color: string; count: number }[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export function StickyNav({ categories, activeCategory, onSelectCategory }: CategoryNavProps) {
  return (
    <div className="sticky top-0 z-40 w-full border-b border-neutral-900 bg-[#070708]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center space-x-2 overflow-x-auto px-6 py-4 scrollbar-none">
        <button
          onClick={() => onSelectCategory("all")}
          className={`rounded-full px-4 py-1.5 font-sans text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] active:scale-[0.96] active:translate-y-0 ${
            activeCategory === "all"
              ? "bg-white text-black shadow-sm"
              : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          }`}
        >
          All
        </button>

        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center space-x-2 rounded-full px-4 py-1.5 font-sans text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] active:scale-[0.96] active:translate-y-0 ${
                isActive
                  ? "bg-white text-black shadow-sm"
                  : "bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-125"
                style={{ backgroundColor: cat.color }}
              />
              <span className="capitalize">{cat.label}</span>
              <span className="text-[11px] opacity-60">({cat.count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
