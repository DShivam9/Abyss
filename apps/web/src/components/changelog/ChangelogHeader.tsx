"use client";

import React from "react";

interface ChangelogHeaderProps {
  totalCount: number;
}

export function ChangelogHeader({ totalCount }: ChangelogHeaderProps) {
  return (
    <div className="space-y-1.5 pb-2">
      <h1
        style={{
          fontFamily: "Ranade, -apple-system, sans-serif",
          fontSize: "32px",
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "-0.03em",
          margin: 0,
          lineHeight: 1.15,
        }}
      >
        Changelog
      </h1>
      <div className="flex items-center justify-between gap-4">
        <p
          style={{
            fontFamily: "Switzer, -apple-system, sans-serif",
            fontSize: "13px",
            color: "#8e8e93",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          All releases and updates
        </p>
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "12px",
            color: "#71717a",
          }}
        >
          {totalCount} entries
        </span>
      </div>
    </div>
  );
}
