/**
 * Abyss — Changelog Data
 *
 * Rules for writing entries (from docs/CHANGELOG_GUIDE.md):
 * 1. Title: Max 6 words, name component or fix ("Added Gimbal Stream", "Fixed drawer scroll").
 * 2. Summary: 1 simple sentence of user-visible impact.
 * 3. Bullets: Max 4 items, <=12 words each, only user-visible changes.
 * 4. Jargon: No internal refactor details, no unneeded adjectives.
 * 5. Links: Include affectedSlugs to link to component showcases.
 */

export type ChangelogTag = "MAJOR" | "ADDITION" | "FIX" | "REMOVAL" | "MINOR";

export interface CommitEntry {
  id: string;
  date: string;
  displayDate: string;
  tag?: ChangelogTag;
  tags?: ChangelogTag[];
  title: string;
  summary: string;
  commitHash?: string;
  items: string[];
  affectedSlugs?: string[];
  breaking?: boolean;
  migrationNote?: string;
}

export const CHANGELOG_DATA: CommitEntry[] = [
  {
    id: "commit-21",
    date: "2026-08-22",
    displayDate: "Aug 22, 2026 • 22:30 IST",
    tags: ["MAJOR", "ADDITION"],
    title: "Docs, Changelog & Collection Overhaul",
    summary: "Comprehensive redesign across Docs, Changelog, and Collection with new navigation systems, smooth animations, and 3D finales.",
    items: [
      "Redesigned Docs portal with package manager installation guides and tech stack overview",
      "Sticky reveal curtain footer on solid ice-blue background with rotating 3D star centerpiece",
      "Redesigned Changelog with multi-tag badges (Major, Addition, Fix, Removal) and active filters",
      "Changelog search bar with real-time gliding caret cursor and instant query matching",
      "Wide horizon laser finale section with unrolling typography and dynamic 3D piece",
      "Floating scroll-to-top button with smooth dual-arrow roll animation",
      "New Collection catalog with curated vibe chapters, grid/masonry toggle, and alphabetical sorting",
      "Floating bottom control pill on Collection page for instant layout and search adjustments",
      "Universal Command Palette (Cmd+K) wired across all website pages with instant component jumping",
    ],
  },
  {
    id: "commit-20",
    date: "2026-08-21",
    displayDate: "Aug 21, 2026 • 23:55 IST",
    tags: ["MAJOR", "ADDITION"],
    title: "Added Gimbal Stream",
    summary: "New 3D gallery with gyroscopic card rings and scroll-driven orbit.",
    affectedSlugs: ["gimbal-stream"],
    items: [
      "3D card ring that orbits on scroll and auto-drifts when idle",
      "Chamber backdrop with dynamic wave lighting",
      "Hover any card to inspect with cursor detail pill",
      "Controls for drift speed, orbit speed, and card curvature",
    ],
  },
  {
    id: "commit-19",
    date: "2026-08-20",
    displayDate: "Aug 20, 2026 • 20:15 IST",
    tags: ["MAJOR", "ADDITION", "REMOVAL"],
    title: "Added Hover Media Stream",
    summary: "New full-width video and image stream with horizon reveal lines and ambient backdrops.",
    affectedSlugs: ["hover-media-stream"],
    items: [
      "Full-width media lines that expand on hover with ambient video backdrops",
      "Removed obsolete Cursor Trail, Cursor Wake, and Orbit Ring components",
      "Controls drawer sliders no longer interfere with 3D canvas backgrounds",
      "Dynamic tab titles when switching browser tabs",
    ],
  },
  {
    id: "commit-18",
    date: "2026-08-19",
    displayDate: "Aug 19, 2026 • 21:40 IST",
    tags: ["MAJOR", "REMOVAL"],
    title: "Reworked Tracklist Gallery",
    summary: "Updated Tracklist Gallery with mechanical audio feedback and rebuilt navigation.",
    affectedSlugs: ["tracklist-gallery"],
    items: [
      "Audio playback with mechanical scroll click feedback",
      "Audio auto-fades when switching browser tabs",
      "Floating dock navigation across all showcase views",
      "Removed legacy drawer and story viewer navigation",
    ],
  },
  {
    id: "commit-17",
    date: "2026-08-18",
    displayDate: "Aug 18, 2026 • 00:48 IST",
    tags: ["MAJOR", "FIX"],
    title: "Showcase Refinements & Audio Feedback",
    summary: "Refined tracklist interaction, typography, and tuning controls across components.",
    affectedSlugs: [
      "tracklist-gallery",
      "dual-wave",
      "gravity-cursor",
      "ripple-scramble",
      "parallax-column",
    ],
    items: [
      "Tactile ratchet audio feedback on track scrolling",
      "Expanded album cover artwork with color-synced ambient glow",
      "New live parameter controls for Dual Wave and Gravity Cursor",
      "Smoother track title transitions on selection",
    ],
  },
  {
    id: "commit-16",
    date: "2026-08-12",
    displayDate: "Aug 12, 2026 • 13:46 IST",
    tags: ["MAJOR", "ADDITION"],
    title: "Added Tracklist Gallery",
    summary: "Audio-driven album showcase with kinetic cover artwork and ambient color palettes.",
    affectedSlugs: ["tracklist-gallery"],
    items: [
      "Interactive tracklist with synchronized audio previews",
      "Ambient background crossfading matching active album artwork",
      "Kinetic cover transitions when scrolling tracks",
    ],
  },
  {
    id: "commit-15",
    date: "2026-08-11",
    displayDate: "Aug 11, 2026 • 22:20 IST",
    tags: ["MAJOR", "ADDITION"],
    title: "Hero Section & 3D Shatter",
    summary: "Interactive hero section with 3D rolling typography and shatter globe.",
    affectedSlugs: ["3d-shatter-sphere"],
    items: [
      "Interactive 3D globe that shatters into floating tiles on click",
      "Rolling 3D headline typography with smooth mouse tilt",
      "Action button with hover arrow reveal",
      "Optimized WebGL loop for steady 60fps rendering",
    ],
  },
  {
    id: "commit-14",
    date: "2026-08-11",
    displayDate: "Aug 11, 2026 • 13:35 IST",
    tags: ["MAJOR", "REMOVAL"],
    title: "Library Rebrand to Abyss",
    summary: "Rebranded the library to Abyss with curated component previews.",
    items: [
      "Rebranded component collection under the Abyss library",
      "High-resolution WebP preview cards across catalog",
      "Retired experimental prototypes for upcoming redesigns",
    ],
  },
  {
    id: "commit-13",
    date: "2026-08-11",
    displayDate: "Aug 11, 2026 • 13:30 IST",
    tags: ["FIX"],
    title: "Fixed Cursor Fall Camera Orbit",
    summary: "Expanded camera perspective and smoothed edge-tracking for Abyss Cursor Fall.",
    affectedSlugs: ["abyss-cursor-fall"],
    items: [
      "Wider 3D camera field of view for spacious void effect",
      "Smoother camera tilt during fast mouse swipes",
      "Scroll wheel zoom response for continuous camera depth",
    ],
  },
  {
    id: "commit-0f",
    date: "2026-08-10",
    displayDate: "Aug 10, 2026 • 21:37 IST",
    tags: ["FIX"],
    title: "Fixed Production Scroll Alignment",
    summary: "Resolved full-screen container height alignment and asset loading on live deployments.",
    items: [
      "Fixed full-screen container height alignment across browsers",
      "Reliable asset and image loading on production CDN",
    ],
  },
  {
    id: "commit-0e",
    date: "2026-08-10",
    displayDate: "Aug 10, 2026 • 21:24 IST",
    tags: ["MAJOR", "ADDITION"],
    title: "Added 3D Reel Text",
    summary: "Kinetic 3D typography roll with 12 directional cascade variants and dividers.",
    affectedSlugs: ["3d-reel-text"],
    items: [
      "3D text roll interaction with dynamic depth shading",
      "12 cascade directions including wave, center-out, and random",
      "Scroll-triggered horizontal divider lines with wipe animations",
      "Rolling variant counter indicator",
    ],
  },
  {
    id: "commit-0d",
    date: "2026-08-09",
    displayDate: "Aug 09, 2026 • 21:55 IST",
    tags: ["MAJOR", "ADDITION"],
    title: "Added Cursor Fall & Snake Trail",
    summary: "Atmospheric 3D floating cards and continuous cursor-following image snake.",
    affectedSlugs: ["abyss-cursor-fall", "image-snake-trail"],
    items: [
      "Abyss Cursor Fall: 3D cards tumbling in zero gravity",
      "Image Snake Trail: smooth cursor tracking with recoil wrap",
      "Depth desaturation as cards move deeper into the void",
      "Custom tuning controls in showcase inspector",
    ],
  },
  {
    id: "commit-0c",
    date: "2026-08-08",
    displayDate: "Aug 08, 2026 • 21:05 IST",
    tags: ["FIX"],
    title: "Fixed Scroll Lock & Arc Drift",
    summary: "Fixed drawer scroll locking and improved Arc Drift Gallery momentum.",
    affectedSlugs: ["arc-drift-gallery"],
    items: [
      "Prevented background page scrolling when opening drawers",
      "Smoother curved thumbnail drift on scroll wheel navigation",
    ],
  },
  {
    id: "commit-0a",
    date: "2026-08-08",
    displayDate: "Aug 08, 2026 • 16:38 IST",
    tags: ["MAJOR", "ADDITION"],
    title: "Added Arc Drift Gallery",
    summary: "Curved thumbnail gallery with center-axis background image crossfades.",
    affectedSlugs: ["arc-drift-gallery"],
    items: [
      "Curved thumbnail drift aligned along an elliptical arc",
      "Background image crossfade when cards pass the center axis",
      "Interactive controls panel for curvature and drift speed",
    ],
  },
  {
    id: "commit-0b",
    date: "2026-08-08",
    displayDate: "Aug 08, 2026 • 16:38 IST",
    tags: ["FIX"],
    title: "Improved Gravity Cursor Physics",
    summary: "Smoother element spawning and reduced GPU shadow overhead.",
    affectedSlugs: ["gravity-cursor"],
    items: [
      "Smoother hold-to-spawn interaction on high refresh rate displays",
      "Optimized physics simulation frame rates",
      "Refined card shadows for cleaner visual clarity",
    ],
  },
  {
    id: "commit-1",
    date: "2026-08-07",
    displayDate: "Aug 07, 2026 • 19:09 IST",
    tags: ["MAJOR", "ADDITION"],
    title: "Added Catalog Search",
    summary: "Search bar with text scramble effect and technical documentation suite.",
    items: [
      "Full-width catalog search bar with animated text scramble",
      "Interactive code highlight viewer for documentation",
      "Direct repository links and navigation shortcuts",
    ],
  },
  {
    id: "commit-2",
    date: "2026-08-07",
    displayDate: "Aug 07, 2026 • 14:10 IST",
    tags: ["FIX"],
    title: "Fixed Drawer Scroll Bleed",
    summary: "Isolated scrolling in side drawers to prevent background page movement.",
    items: [
      "Isolated wheel and touch scrolling inside drawer containers",
      "Prevented background page movement during drawer interactions",
    ],
  },
  {
    id: "commit-3",
    date: "2026-08-07",
    displayDate: "Aug 07, 2026 • 14:03 IST",
    tags: ["FIX"],
    title: "Optimized Component Load Speed",
    summary: "Faster initial load times and smoother component initialization.",
    items: [
      "Improved initial component load and render times",
      "Reduced bundle size and removed unused dependencies",
    ],
  },
  {
    id: "commit-4",
    date: "2026-07-29",
    displayDate: "Jul 29, 2026 • 20:25 IST",
    tags: ["MAJOR", "ADDITION"],
    title: "Added Cuboid & Monolith 3D",
    summary: "New 3D Cuboid and Monolith geometry variations for 3D Shatter.",
    affectedSlugs: ["3d-shatter-sphere"],
    items: [
      "Interactive 3D Cuboid and Monolith shape variations",
      "Updated HUD overlay styling and responsive scaling",
    ],
  },
  {
    id: "commit-5",
    date: "2026-07-28",
    displayDate: "Jul 28, 2026 • 21:33 IST",
    tags: ["ADDITION"],
    title: "Refined Dual Wave Presets",
    summary: "Updated parameter presets and smoothed wave motion fluidity.",
    affectedSlugs: ["dual-wave"],
    items: [
      "Added new default parameter presets for wave intensity",
      "Enhanced wave line animation fluidity",
    ],
  },
  {
    id: "commit-6",
    date: "2026-07-25",
    displayDate: "Jul 25, 2026 • 00:20 IST",
    tags: ["FIX"],
    title: "Polished Hover Physics",
    summary: "Smoother mouse hover response and interaction physics.",
    items: [
      "Smoothed cursor hover response across interactive cards",
      "Cleaned up animation warnings",
    ],
  },
  {
    id: "commit-7",
    date: "2026-07-23",
    displayDate: "Jul 23, 2026 • 23:30 IST",
    tags: ["MAJOR", "ADDITION"],
    title: "Added Text Animation Collection",
    summary: "New kinetic typography components and redesigned top navigation bar.",
    items: [
      "Text animation component category added to library",
      "Redesigned top navigation bar across showcase pages",
    ],
  },
  {
    id: "commit-8",
    date: "2026-07-16",
    displayDate: "Jul 16, 2026 • 18:15 IST",
    tags: ["MAJOR", "ADDITION"],
    title: "Added Clip Morph",
    summary: "Clip-path morphing animations with smooth inertia scrolling.",
    affectedSlugs: ["clip-morph"],
    items: [
      "Interactive clip-path morphing transitions",
      "Smooth inertia scrolling on showcase pages",
    ],
  },
  {
    id: "commit-9",
    date: "2026-07-14",
    displayDate: "Jul 14, 2026 • 16:40 IST",
    tags: ["MAJOR", "ADDITION"],
    title: "Added Parallax Column",
    summary: "Multi-column parallax scrolling with custom controls and backlight glow.",
    affectedSlugs: ["parallax-column"],
    items: [
      "Parallax Column component with customizable scroll speeds",
      "Backlight flare and infinite scroll on Venetian Blinds",
    ],
  },
  {
    id: "commit-10",
    date: "2026-07-13",
    displayDate: "Jul 13, 2026 • 14:20 IST",
    tags: ["MAJOR", "ADDITION"],
    title: "Added Orbit Ring Gallery",
    summary: "Circular orbiting card carousel with responsive tilt.",
    items: [
      "Orbit Ring Gallery component with 3D card rotation",
      "Interactive orbit controls and perspective adjustments",
    ],
  },
  {
    id: "commit-11",
    date: "2026-07-07",
    displayDate: "Jul 07, 2026 • 19:10 IST",
    tags: ["MAJOR", "ADDITION"],
    title: "Added Deepwood Glimmer",
    summary: "Interactive stage lighting effect with ambient shimmer.",
    items: [
      "Deepwood Glimmer ambient lighting component",
      "Enter Stage navigation button on homepage",
    ],
  },
];
