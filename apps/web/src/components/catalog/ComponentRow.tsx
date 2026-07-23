"use client";

import React from "react";
import Link from "next/link";
import { ComponentDetail } from "@/lib/component-registry";

interface ComponentRowProps {
  component: ComponentDetail;
  categoryColor: string;
  onHover: (comp: ComponentDetail | null) => void;
}

export function ComponentRow({ component, categoryColor, onHover }: ComponentRowProps) {
  const isPlaceholder = component.category === "yet-to-work-on";

  return (
    <Link
      href={isPlaceholder ? "#" : `/components/${component.slug}`}
      onMouseEnter={() => onHover(component)}
      onMouseLeave={() => onHover(null)}
      className={`group relative flex h-[72px] w-full items-center justify-between border-b border-neutral-900 px-6 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isPlaceholder
          ? "cursor-not-allowed opacity-50"
          : "hover:bg-[#111113]"
      }`}
    >
      {/* Active accent bar on left */}
      <div
        className="absolute left-0 top-0 h-full w-[2px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ backgroundColor: categoryColor }}
      />

      {/* Component Name + Description */}
      <div className="flex flex-1 items-center space-x-8 pr-6">
        <span className="w-56 truncate font-sans text-lg font-semibold text-white group-hover:text-white">
          {component.label}
        </span>
        <span className="hidden flex-1 truncate font-sans text-sm text-neutral-400 md:inline-block">
          {component.desc}
        </span>
      </div>

      {/* Category Pill + Arrow */}
      <div className="flex items-center space-x-4">
        <span
          className="rounded-full px-3 py-1 font-sans text-xs font-medium capitalize"
          style={{
            color: categoryColor,
            backgroundColor: `${categoryColor}15`,
            border: `1px solid ${categoryColor}30`,
          }}
        >
          {component.category}
        </span>

        {!isPlaceholder && (
          <span className="font-sans text-sm text-neutral-600 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white">
            →
          </span>
        )}
      </div>
    </Link>
  );
}
