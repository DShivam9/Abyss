"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";

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
    id: "commit-0f",
    date: "2026-08-10",
    displayDate: "Aug 10, 2026 • 21:37 IST",
    tag: "FIX",
    title: "Production Layout & Asset Reliability Fixes",
    summary: "Resolved production rendering issues for scroll components to ensure consistent layout framing and image loading across live deployments.",
    items: [
      "Fixed full-screen container height alignment for self-contained scroll experiences",
      "Resolved image asset path resolution issues across production CDN environments",
      "Improved initial page load stability and rendering performance on production builds",
    ],
  },
  {
    id: "commit-0e",
    date: "2026-08-10",
    displayDate: "Aug 10, 2026 • 21:24 IST",
    tag: "ADDITION",
    title: "Apparatus 3D Reel Text Component",
    summary: "Introduced the Apparatus 3D Reel Text component with kinetic 3D typography, 12 directional cascade variants, and scroll-driven dividers.",
    items: [
      "Added 3D text roll interaction with dynamic depth shading",
      "Added 12 cascade direction variants including center-outward, edge-inward, wave, and random modes",
      "Added automated hero presentation loop with 3-second variant holds",
      "Placed 12 interactive text variants directly on the dark canvas grid",
      "Added scroll-triggered horizontal divider lines with alternating wipe directions",
      "Added minimal rolling variant counter indicator",
      "Optimized animation frame-rates for fluid 60fps scrolling",
    ],
  },
  {
    id: "commit-0d",
    date: "2026-08-09",
    displayDate: "Aug 09, 2026 • 21:55 IST",
    tag: "ADDITION",
    title: "Abyss Cursor Fall & Image Snake Trail Components",
    summary: "Introduced the Abyss Cursor Fall and Image Snake Trail gallery components featuring dynamic 3D depth, responsive physics, and fluid cursor interactions.",
    items: [
      "Added Abyss Cursor Fall component featuring atmospheric 3D card physics and smooth camera perspective movement",
      "Added multi-layer depth positioning with momentum response to fast cursor gestures",
      "Added vivid electric neon palette options with adaptive depth desaturation as cards move through space",
      "Added Image Snake Trail component featuring smooth cursor tracking, continuous infinite wrap, and tactile recoil motion",
      "Integrated comprehensive live tuning controls in the showcase inspector",
      "Polished interface rendering and resolved animation warnings",
    ],
  },
  {
    id: "commit-0c",
    date: "2026-08-08",
    displayDate: "Aug 08, 2026 • 21:05 IST",
    tag: "FIX",
    title: "Global Showcase Scroll Lock & Arc Drift Physics",
    summary: "Resolved menu scroll interaction conflicts and refined Arc Drift Gallery scroll responsiveness.",
    items: [
      "Improved drawer menu scroll locking to ensure seamless page navigation",
      "Fixed pointer event behavior when closing overlay menus",
      "Refined Arc Drift Gallery scroll layout for continuous smooth drifting",
      "Enhanced scroll wheel response with fluid spring animation dynamics",
    ],
  },
  {
    id: "commit-0a",
    date: "2026-08-08",
    displayDate: "Aug 08, 2026 • 16:38 IST",
    tag: "ADDITION",
    title: "Arc Drift Gallery Component",
    summary: "Introduced the Arc Drift Gallery featuring curved thumbnail motion and seamless background image transitions.",
    items: [
      "Added Arc Drift Gallery with smooth curved thumbnail drift on scroll",
      "Added background image crossfading when cards pass the center axis",
      "Added gallery image collections and interactive controls panel",
    ],
  },
  {
    id: "commit-0b",
    date: "2026-08-08",
    displayDate: "Aug 08, 2026 • 16:38 IST",
    tag: "FIX",
    title: "Gravity Cursor Responsiveness & Motion Polish",
    summary: "Improved interaction responsiveness when spawning multiple elements and optimized rendering performance.",
    items: [
      "Enhanced hold-to-spawn interaction smoothness across high-refresh rate displays",
      "Optimized physics simulation frame-rate stability",
      "Refined shadow styling for lighter GPU footprint and cleaner visual clarity",
    ],
  },
  {
    id: "commit-1",
    date: "2026-08-07",
    displayDate: "Aug 07, 2026 • 19:09 IST",
    tag: "MAJOR",
    title: "Catalog Search & Documentation Updates",
    summary: "Added search capabilities to the catalog navigation and expanded the technical documentation suite.",
    commitHash: "e044f3d",
    items: [
      "Added full-width catalog search bar with kinetic text scramble effects",
      "Built comprehensive documentation layout with code highlight viewer",
      "Added direct repository links and navigation shortcuts",
    ],
  },
  {
    id: "commit-2",
    date: "2026-08-07",
    displayDate: "Aug 07, 2026 • 14:10 IST",
    tag: "FIX",
    title: "Catalog Drawer Scroll Isolation",
    summary: "Isolated scrolling behavior inside side drawer panels to prevent background page movement.",
    commitHash: "60d9537",
    items: [
      "Isolated touch and wheel scrolling inside drawer containers",
      "Prevented page scroll movement during active drawer interaction",
    ],
  },
  {
    id: "commit-3",
    date: "2026-08-07",
    displayDate: "Aug 07, 2026 • 14:03 IST",
    tag: "MINOR",
    title: "Codebase Optimization & Speed Improvements",
    summary: "Streamlined codebase structure and optimized component initialization times across the library.",
    commitHash: "f3992ad",
    items: [
      "Cleaned up legacy files and unused dependency references",
      "Improved initial component load times and render responsiveness",
    ],
  },
  {
    id: "commit-4",
    date: "2026-07-29",
    displayDate: "Jul 29, 2026 • 20:25 IST",
    tag: "ADDITION",
    title: "3D Shatter Sphere & Monolith Components",
    summary: "Added 3D Cuboid and Monolith component variations with updated HUD presentation layouts.",
    commitHash: "e22e425",
    items: [
      "Added 3D Cuboid and Monolith interactive variations",
      "Updated HUD overlay designs and layout scaling",
    ],
  },
  {
    id: "commit-5",
    date: "2026-07-28",
    displayDate: "Jul 28, 2026 • 21:33 IST",
    tag: "ADDITION",
    title: "Apparatus Dual Wave Refinements",
    summary: "Refined default parameter presets, control reset behavior, and wave motion smoothness.",
    commitHash: "f0ee28e",
    items: [
      "Updated default component parameters and control reset actions",
      "Enhanced wave animation fluidity",
    ],
  },
  {
    id: "commit-6",
    date: "2026-07-25",
    displayDate: "Jul 25, 2026 • 00:20 IST",
    tag: "MINOR",
    title: "Kinetic Hover Physics & UI Polish",
    summary: "Polished mouse hover dynamics and cleaned up build diagnostics.",
    commitHash: "dd2ad9a",
    items: [
      "Refined cursor hover motion and fluid interaction response",
      "Cleaned up build diagnostics and unused code paths",
    ],
  },
  {
    id: "commit-7",
    date: "2026-07-23",
    displayDate: "Jul 23, 2026 • 23:30 IST",
    tag: "MAJOR",
    title: "Text Component Collection & Header Redesign",
    summary: "Introduced the text animation component category and redesigned the showcase top bar interface.",
    commitHash: "f6f54f7",
    items: [
      "Added text animation component collection to core library",
      "Redesigned top bar interface across showcase pages",
    ],
  },
  {
    id: "commit-8",
    date: "2026-07-16",
    displayDate: "Jul 16, 2026 • 18:15 IST",
    tag: "ADDITION",
    title: "Clip Morph & Kinetic Scroll Components",
    summary: "Added the clip morph component and kinetic inertia scrolling.",
    commitHash: "a214385",
    items: [
      "Added clip morph animation component",
      "Added smooth inertia scroll and updated typography",
    ],
  },
  {
    id: "commit-9",
    date: "2026-07-14",
    displayDate: "Jul 14, 2026 • 16:40 IST",
    tag: "ADDITION",
    title: "Parallax Column & Venetian Blinds Components",
    summary: "Added Parallax Column component and added backlight flare to Venetian Blinds.",
    commitHash: "c7ce6c3",
    items: [
      "Added Parallax Column component with custom controls",
      "Added backlight glow and infinite scroll to Venetian Blinds",
    ],
  },
  {
    id: "commit-10",
    date: "2026-07-13",
    displayDate: "Jul 13, 2026 • 14:20 IST",
    tag: "MAJOR",
    title: "Project Renamed to Abyss & Orbit Ring Gallery",
    summary: "Renamed the project to Abyss and added the Orbit Ring Gallery component.",
    commitHash: "96443d3",
    items: [
      "Renamed packages and core library to Abyss",
      "Added Orbit Ring Gallery component",
    ],
  },
  {
    id: "commit-11",
    date: "2026-07-07",
    displayDate: "Jul 07, 2026 • 19:10 IST",
    tag: "ADDITION",
    title: "Home Page Navigation & Deepwood Glimmer",
    summary: "Added Enter Stage button on the homepage and built the Deepwood Glimmer component.",
    commitHash: "f4cbd66",
    items: [
      "Added Enter Stage navigation button to the homepage",
      "Added Deepwood Glimmer component",
      "Fixed image loading for static preview cards",
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
                  <a
                    href="https://github.com/DShivam9/Abyss"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-neutral-800/80 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700 text-[10px] font-mono transition-colors group active:scale-[0.96]"
                    title="View GitHub Repository"
                  >
                    <Github className="w-3 h-3 text-neutral-500 group-hover:text-white transition-colors" />
                    <span>Repository</span>
                    <ExternalLink className="w-2.5 h-2.5 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                  </a>
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
