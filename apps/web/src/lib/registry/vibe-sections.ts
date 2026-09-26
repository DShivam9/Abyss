export interface VibeSection {
  id: string;
  title: string;
  headlineClass: "headline-s1" | "headline-s2" | "headline-s3" | "headline-s4" | "headline-s5" | "headline-s6" | "headline-s7";
  count: number;
  slugs: string[];
}

export const VIBE_SECTIONS: VibeSection[] = [
  {
    id: "scroll-into-view",
    title: "Scroll Into View",
    headlineClass: "headline-s2", // blue
    count: 5,
    slugs: [
      "parallax-column",
      "erosion-map",
      "dual-wave",
      "parallax-bleed",
      "polyptych-formation",
    ],
  },
  {
    id: "on-hover",
    title: "On Hover",
    headlineClass: "headline-s4", // coral/red
    count: 3,
    slugs: [
      "hover-media-stream",
      "accordion-wall",
      "ripple-scramble",
    ],
  },
  {
    id: "cursor-reactive",
    title: "Cursor Reactive",
    headlineClass: "headline-s5", // cyan
    count: 2,
    slugs: [
      "gravity-cursor",
      "abyss-cursor-fall",
    ],
  },
  {
    id: "beyond-the-grid",
    title: "Beyond the Grid",
    headlineClass: "headline-s3", // indigo
    count: 7,
    slugs: [
      "cascade-gallery",
      "gimbal-stream",
      "3d-shatter-sphere",
      "tracklist-gallery",
      "cinema-aisle",
      "cyclorama-matrix",
      "optic-grid",
    ],
  },
  {
    id: "loaders",
    title: "Loaders",
    headlineClass: "headline-s7", // electric emerald
    count: 1,
    slugs: [
      "mosaic-loader",
    ],
  },
  {
    id: "recreation",
    title: "Recreation",
    headlineClass: "headline-s6", // radiant solar gold
    count: 1,
    slugs: [
      "theme-toggle-redesign",
    ],
  },
  {
    id: "brought-to-light",
    title: "Brought to Light",
    headlineClass: "headline-s1", // white
    count: 9,
    slugs: [
      "bas-relief-shadow",
      "bronze-transmutation",
      "japparii",
      "chromepunk-beast",
      "merlin-knights",
      "molten-mercury",
      "kinetic-portal",
      "gilding-transmutation",
      "steel-intaglio",
    ],
  },
];
