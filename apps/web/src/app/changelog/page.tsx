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
    id: "commit-0d",
    date: "2026-08-09",
    displayDate: "Aug 09, 2026 • 21:55 IST",
    tag: "ADDITION",
    title: "Abyss Cursor Fall & Image Snake Trail Components",
    summary: "Built two new high-craft gallery components: Abyss Cursor Fall featuring kinetic cards plunging into a deep atmospheric 3D void and 2D Toroidal Image Snake Trail with Peristalsis recoil.",
    items: [
      "Added Abyss Cursor Fall component (apparatus-3d-cursor-trail) featuring WebGL perspective camera orbit, 120 FPS high-refresh rate physics engine, FPV drone banking roll, and volumetric Z-depth fog (FogExp2)",
      "Engineered 3 Z-Depth spawn layers (+1.2, 0, -1.8) for multi-plane 3D volume and dynamic throw velocity momentum on fast cursor flicks",
      "Built SVG XML white-mask pre-processor and 8-color vivid electric neon palette (Blue, Red, Green, Lime, Purple, Violet, Cyan, Magenta) with zero plain white",
      "Implemented dynamic monochrome desaturation lerp as cards plunge deep into the dark volumetric 3D void",
      "Added Image Snake Trail component (apparatus-image-snake-trail) with 2D toroidal infinite world wrap, physical GSAP push-back recoil shockwave on eat, and 65ms Gaussian peristalsis wave propagation",
      "Registered 'gallary' category in core engine types and mapped both components (ID 69 & 70) into central showcase registry",
      "Integrated 7 live tuning sliders in showcase inspector (Spawn Distance, Spawn Cooldown, Image Size, Lifespan, Fall Speed, Parallax, Spin Velocity) with zero-GC hot-ref updates",
      "Fixed Framer Motion SVG <circle> transform warnings and explicit opacity initial props in ShowcaseTriggers",
    ],
  },
  {
    id: "commit-0c",
    date: "2026-08-08",
    displayDate: "Aug 08, 2026 • 21:05 IST",
    tag: "FIX",
    title: "Global Showcase Scroll Lock & Arc Drift Physics",
    summary: "Fixed global showcase drawer scroll lock race conditions and tuned Arc Drift Gallery scroll physics.",
    items: [
      "Created centralized ref-counted useScrollLock hook to fix drawer menu scroll locking",
      "Fixed invisible drawer DOM overlay swallowing pointer and scroll events on exit",
      "Routed Arc Drift Gallery to self-contained scroll layout for true infinite drift",
      "Implemented direct wheel velocity impulse with frame-rate independent spring interpolation",
      "Unified Arc Drift entry animation into single 120 FPS RAF loop eliminating frame stutter",
    ],
  },
  {
    id: "commit-0a",
    date: "2026-08-08",
    displayDate: "Aug 08, 2026 • 16:38 IST",
    tag: "ADDITION",
    title: "Arc Drift Gallery Component",
    summary: "Built the new Arc Drift Gallery with curved thumbnail motion and background image crossfading.",
    items: [
      "Added Arc Drift Gallery with smooth curved thumbnail drift on scroll",
      "Added background image crossfading when photos hit center",
      "Added new gallery image assets and custom controls panel",
    ],
  },
  {
    id: "commit-0b",
    date: "2026-08-08",
    displayDate: "Aug 08, 2026 • 16:38 IST",
    tag: "FIX",
    title: "Gravity Cursor 120FPS & Smooth Hold-Click",
    summary: "Fixed lag when holding down click to spawn images and capped physics to a smooth 120FPS.",
    items: [
      "Fixed stutter when holding down click to spawn lots of images",
      "Capped physics simulation to a smooth 120FPS",
      "Lightened image shadows so performance stays crisp on high-Hz displays",
    ],
  },
  {
    id: "commit-1",
    date: "2026-08-07",
    displayDate: "Aug 07, 2026 • 19:09 IST",
    tag: "MAJOR",
    title: "Catalog Search & Documentation Updates",
    summary: "Added a full search bar to the catalog sidebar and built out the new documentation page.",
    commitHash: "e044f3d",
    items: [
      "Added a full-width search bar with animated placeholder text",
      "Added text scramble animation when typing in search",
      "Built the documentation page with a 3-column layout and code highlights",
      "Added direct links to the GitHub repository",
    ],
  },
  {
    id: "commit-2",
    date: "2026-08-07",
    displayDate: "Aug 07, 2026 • 14:10 IST",
    tag: "FIX",
    title: "Catalog Drawer Scroll Fix",
    summary: "Fixed an issue where scrolling inside side drawers would trigger page scroll instead.",
    commitHash: "60d9537",
    items: [
      "Isolated scrolling inside catalog drawer panels",
      "Prevented background page from moving when scrolling inside a drawer",
    ],
  },
  {
    id: "commit-3",
    date: "2026-08-07",
    displayDate: "Aug 07, 2026 • 14:03 IST",
    tag: "MINOR",
    title: "Code Cleanup & Speed Improvements",
    summary: "Cleaned up old unused files and improved component load times across the app.",
    commitHash: "f3992ad",
    items: [
      "Removed unused code, unused files, and old imports",
      "Made component renders faster and smoother",
    ],
  },
  {
    id: "commit-4",
    date: "2026-07-29",
    displayDate: "Jul 29, 2026 • 20:25 IST",
    tag: "ADDITION",
    title: "3D Shatter Sphere & Monolith Components",
    summary: "Added new 3D Cuboid and Monolith component variations with updated HUD designs.",
    commitHash: "e22e425",
    items: [
      "Added 3D Cuboid and Monolith component options",
      "Updated HUD overlay design and layout scaling",
    ],
  },
  {
    id: "commit-5",
    date: "2026-07-28",
    displayDate: "Jul 28, 2026 • 21:33 IST",
    tag: "ADDITION",
    title: "Apparatus Dual Wave Updates",
    summary: "Updated default settings, reset controls, and smoothed out wave animations.",
    commitHash: "f0ee28e",
    items: [
      "Updated default settings and reset button behavior",
      "Smoothed out wave motion performance",
    ],
  },
  {
    id: "commit-6",
    date: "2026-07-25",
    displayDate: "Jul 25, 2026 • 00:20 IST",
    tag: "MINOR",
    title: "Kinetic Hover Physics & UI Polish",
    summary: "Polished mouse hover physics and fixed build warnings.",
    commitHash: "dd2ad9a",
    items: [
      "Improved mouse hover motion and fluid interaction response",
      "Fixed build warnings and cleaned up unused code",
    ],
  },
  {
    id: "commit-7",
    date: "2026-07-23",
    displayDate: "Jul 23, 2026 • 23:30 IST",
    tag: "MAJOR",
    title: "Text Components & Header Redesign",
    summary: "Added new text component category and redesigned the showcase top bar.",
    commitHash: "f6f54f7",
    items: [
      "Added text animation component collection",
      "Redesigned top bar interface in showcase pages",
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
