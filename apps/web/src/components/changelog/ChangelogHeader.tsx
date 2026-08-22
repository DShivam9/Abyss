"use client";

import React from "react";

interface ChangelogHeaderProps {
  totalCount: number;
}

export function ChangelogHeader({ totalCount }: ChangelogHeaderProps) {
  return (
    <div className="space-y-2 pb-6 border-b border-[rgba(255,255,255,0.06)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-['Ranade',sans-serif]">
            Changelog
          </h1>
          <p className="text-xs md:text-sm text-[#8e8e93] font-['Switzer',sans-serif]">
            Latest changes and all release records of Abyss
          </p>
        </div>
        <div className="font-mono text-xs text-[#8e8e93] shrink-0 flex items-center gap-2 pb-1">
          <span>{totalCount} Releases</span>
          <span className="text-[#333338]">•</span>
          <span>Updated Aug 2026</span>
        </div>
      </div>
    </div>
  );
}
