"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, GitCommit, ExternalLink } from "lucide-react";

interface CommitEntry {
  id: string;
  date: string;
  displayDate: string;
  tag: "MAJOR" | "ADDITION" | "MINOR" | "FIX";
  title: string;
  summary: string;
  commitHash?: string;
  items: string[];
}

const CHANGELOG_DATA: CommitEntry[] = [
  {
    id: "commit-1",
    date: "2026-08-07",
    displayDate: "Aug 07, 2026",
    tag: "MAJOR",
    title: "Catalog Explorer & Documentation System Polish",
    summary: "Refactored catalog sidebar search, added typewriter shimmer placeholder, left-to-right character scramble, and full documentation page integration.",
    commitHash: "e044f3d",
    items: [
      "Full-width search bar with animated typewriter shimmer placeholder suggestions",
      "Left-to-right character scramble wave animation with clean alphanumeric glyphs",
      "Documentation page with 3-column fixed layout, smooth scroll-spy, and code highlighting",
      "Direct GitHub repository integration with external links opening in new tabs",
    ],
  },
  {
    id: "commit-2",
    date: "2026-08-07",
    displayDate: "Aug 07, 2026",
    tag: "FIX",
    title: "Drawer Scroll Isolation & Collision Resolution",
    summary: "Resolved drawer scroll collisions by isolating native scrolling within catalog drawer views.",
    commitHash: "60d9537",
    items: [
      "Isolated native scrolling within catalog drawer views",
      "Configured overscroll-contain and data-lenis-prevent boundary flags",
    ],
  },
  {
    id: "commit-3",
    date: "2026-08-07",
    displayDate: "Aug 07, 2026",
    tag: "MINOR",
    title: "7-Pass Codebase Cleanup & Performance Optimization",
    summary: "Comprehensive 7-pass codebase optimization and dead code removal across all packages.",
    commitHash: "f3992ad",
    items: [
      "Optimized component render cycles and state updates",
      "Purged unused abstractions and dead imports",
    ],
  },
  {
    id: "commit-4",
    date: "2026-07-29",
    displayDate: "Jul 29, 2026",
    tag: "ADDITION",
    title: "3D Shatter Sphere & Monolith Variants",
    summary: "Added 3D Cuboid & Monolith variants, crystal glassmorphism HUD, layout scaling, and clean build fixes.",
    commitHash: "e22e425",
    items: [
      "3D Cuboid & Monolith variant component additions",
      "Crystal glassmorphism HUD and layout scaling fixes",
    ],
  },
  {
    id: "commit-5",
    date: "2026-07-28",
    displayDate: "Jul 28, 2026",
    tag: "ADDITION",
    title: "Apparatus Dual Wave Component",
    summary: "Updated dual wave component variants, default parameters, reset logic, and performance optimizations.",
    commitHash: "f0ee28e",
    items: [
      "Updated apparatus-dual-wave default parameters & reset logic",
      "Performance optimizations for dual wave animations",
    ],
  },
  {
    id: "commit-6",
    date: "2026-07-25",
    displayDate: "Jul 25, 2026",
    tag: "MINOR",
    title: "Kinetic Interaction Polish & Glassmorphism Styling",
    summary: "Refactored kinetic interaction handling, polished glassmorphism HUD styling, and resolved ESLint build warnings.",
    commitHash: "dd2ad9a",
    items: [
      "Refactored kinetic interaction mechanics and mouse hover physics",
      "Resolved ESLint build warnings and unused variables for production build",
    ],
  },
  {
    id: "commit-7",
    date: "2026-07-23",
    displayDate: "Jul 23, 2026",
    tag: "MAJOR",
    title: "Text Category & Showcase Chrome HUD Redesign",
    summary: "Added text category components, redesigned showcase chrome HUD, and purged legacy components.",
    commitHash: "f6f54f7",
    items: [
      "Added text category component suite",
      "Redesigned showcase chrome HUD interface",
    ],
  },
  {
    id: "commit-8",
    date: "2026-07-16",
    displayDate: "Jul 16, 2026",
    tag: "ADDITION",
    title: "Apparatus Clip Morph & Kinetic Inertia Scroll",
    summary: "Implemented apparatus-clip-morph component, kinetic inertia scroll physics, and PP Editorial New typography.",
    commitHash: "a214385",
    items: [
      "Implemented apparatus-clip-morph component & clean detail page viewer",
      "Configured kinetic inertia scroll physics & PP Editorial New typography",
    ],
  },
  {
    id: "commit-9",
    date: "2026-07-14",
    displayDate: "Jul 14, 2026",
    tag: "ADDITION",
    title: "Apparatus Parallax Column & Venetian Blinds",
    summary: "Implemented Apparatus Parallax Column component and polished Apparatus Venetian Blinds with backlight flare.",
    commitHash: "c7ce6c3",
    items: [
      "Implemented Apparatus Parallax Column component & controls panel",
      "Polished Apparatus Venetian Blinds with backlight flare & infinite scroll",
    ],
  },
  {
    id: "commit-10",
    date: "2026-07-13",
    displayDate: "Jul 13, 2026",
    tag: "MAJOR",
    title: "Project Renaming to Abyss & Orbit Ring Gallery",
    summary: "Renamed website and core packages to Abyss/abyss-ui and implemented orbit-ring-gallery component.",
    commitHash: "96443d3",
    items: [
      "Renamed website and core packages to Abyss/abyss-ui",
      "Implemented orbit-ring-gallery component & registry metadata",
    ],
  },
  {
    id: "commit-11",
    date: "2026-07-07",
    displayDate: "Jul 07, 2026",
    tag: "ADDITION",
    title: "HomePage Stage Navigation & Deepwood Glimmer Component",
    summary: "Added Enter Stage navigation button to HomePage and implemented deepwood-glimmer tapestry component.",
    commitHash: "f4cbd66",
    items: [
      "Added Enter Stage navigation button to HomePage",
      "Implemented clean static deepwood-glimmer tapestry component",
      "Fixed registry imports to static-image to prevent watercolor bleeding",
      "Broadened peerDependencies for three & @react-three/drei for Vercel deployment",
    ],
  },
];

const FILTERS = ["All", "Major", "Addition", "Minor", "Fix"];

export default function ChangelogPage() {
  const [filter, setFilter] = useState<string>("All");

  const filtered = CHANGELOG_DATA.filter((entry) => {
    if (filter === "All") return true;
    return entry.tag.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-white selection:text-black">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/90 backdrop-blur-md border-b border-neutral-900 h-14 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3 font-mono text-xs">
          <Link
            href="/components"
            className="flex items-center gap-2 font-bold tracking-widest text-white hover:text-neutral-300 transition-colors uppercase group"
          >
            <span className="text-white group-hover:rotate-45 transition-transform duration-300">✦</span>
            <span>ABYSS</span>
          </Link>
          <span className="text-neutral-800">/</span>
          <span className="text-neutral-400 font-medium tracking-wider uppercase">
            CHANGELOG
          </span>
        </div>

        <Link
          href="/components"
          className="flex items-center gap-2 font-mono text-xs text-neutral-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800 active:scale-[0.98]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-6 lg:px-12 py-12 md:py-16 space-y-12">
        {/* Title Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-900">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Changelog
            </h1>
            <p className="text-neutral-400 text-base md:text-lg leading-relaxed">
              A record of all notable changes to Abyss.
            </p>
          </div>

          {/* Pure Monochrome Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs shrink-0">
            {FILTERS.map((f) => {
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-black font-bold shadow-sm"
                      : "bg-transparent text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Changelog Timeline Items */}
        <div className="divide-y divide-neutral-900">
          {filtered.map((entry) => (
            <motion.article
              key={entry.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="py-10 md:py-14 flex flex-col md:flex-row items-start gap-8 md:gap-12"
            >
              {/* Left Meta Column (Date, Tag, Commit Link) */}
              <div className="w-full md:w-48 shrink-0 font-mono space-y-2.5 pt-1">
                <div className="text-xs text-neutral-400 font-medium tracking-wide">
                  {entry.displayDate}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block px-3 py-1 rounded border border-neutral-800 bg-neutral-900/90 text-neutral-300 text-[10px] uppercase font-bold tracking-widest">
                    {entry.tag}
                  </span>
                  {entry.commitHash && (
                    <a
                      href={`https://github.com/DShivam9/Abyss/commit/${entry.commitHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded border border-neutral-800/80 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700 text-[10px] font-mono transition-colors group active:scale-[0.96]"
                      title={`View commit ${entry.commitHash} on GitHub`}
                    >
                      <GitCommit className="w-3 h-3 text-neutral-500 group-hover:text-white transition-colors" />
                      <span>{entry.commitHash}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right Content Column */}
              <div className="flex-1 space-y-6">
                <div className="space-y-3">
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
                    {entry.title}
                  </h2>
                  <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                    {entry.summary}
                  </p>
                </div>

                {/* Change Bullets Grid */}
                {entry.items && entry.items.length > 0 && (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2 text-xs md:text-sm text-neutral-300 font-sans leading-relaxed">
                    {entry.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-neutral-500 font-bold select-none">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.article>
          ))}
        </div>

        {/* Footer Summary */}
        <div className="text-center font-mono text-xs text-neutral-400 pt-12 border-t border-neutral-900">
          <span>{filtered.length} commits</span>
        </div>
      </main>
    </div>
  );
}
