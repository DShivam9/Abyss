"use client";

import React from "react";
import { ComponentDetail } from "@/lib/component-registry";
import { ComponentRow } from "./ComponentRow";

interface CategorySectionProps {
  id: string;
  title: string;
  color: string;
  components: ComponentDetail[];
  onHoverComponent: (comp: ComponentDetail | null) => void;
}

export function CategorySection({
  id,
  title,
  color,
  components,
  onHoverComponent,
}: CategorySectionProps) {
  if (components.length === 0) return null;

  return (
    <section id={`category-${id}`} className="scroll-mt-20 py-8">
      {/* Category Header */}
      <div className="mb-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h2 className="font-sans text-2xl font-bold capitalize text-white">
              {title}
            </h2>
          </div>
          <span className="font-sans text-sm text-neutral-500">
            {components.length} {components.length === 1 ? "component" : "components"}
          </span>
        </div>
        <div
          className="mt-3 h-[1px] w-full bg-gradient-to-r from-white/30 via-white/10 to-transparent transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ backgroundImage: `linear-gradient(to right, ${color}, ${color}80 50%, transparent)` }}
        />
      </div>

      {/* Rows */}
      <div className="divide-y divide-neutral-900 border-t border-neutral-900">
        {components.map((comp) => (
          <ComponentRow
            key={comp.slug}
            component={comp}
            categoryColor={color}
            onHover={onHoverComponent}
          />
        ))}
      </div>
    </section>
  );
}
