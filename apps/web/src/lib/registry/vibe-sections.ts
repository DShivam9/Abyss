export interface VibeSection {
  id: string;
  title: string;
  headlineClass: "headline-s1" | "headline-s2" | "headline-s3" | "headline-s4" | "headline-s5" | "headline-s6";
  count: number;
  slugs: string[];
}

export const VIBE_SECTIONS: VibeSection[] = [
  {
    id: "scroll-into-view",
    title: "Scroll Into View",
    headlineClass: "headline-s2", // blue
    count: 7,
    slugs: [
      "parallax-column",
      "erosion-map",
      "dual-wave",
      "depth-swim",
      "cylinder-scroll",
      "parallax-bleed",
      "curved-scroll-wipe",
    ],
  },
  {
    id: "on-hover",
    title: "On Hover",
    headlineClass: "headline-s4", // coral/red
    count: 4,
    slugs: [
      "hover-media-stream",
      "accordion-wall",
      "clip-morph",
      "ripple-scramble",
    ],
  },
  {
    id: "cursor-reactive",
    title: "Cursor Reactive",
    headlineClass: "headline-s5", // cyan
    count: 3,
    slugs: [
      "gravity-cursor",
      "abyss-cursor-fall",
      "image-snake-trail",
    ],
  },
  {
    id: "beyond-the-grid",
    title: "Beyond the Grid",
    headlineClass: "headline-s3", // indigo
    count: 4,
    slugs: [
      "cascade-gallery",
      "gimbal-stream",
      "3d-shatter-sphere",
      "tracklist-gallery",
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
    count: 13,
    slugs: [
      "bas-relief-shadow",
      "bronze-transmutation",
      "japparii",
      "chromepunk-beast",
      "merlin-knights",
      "acg-fleece",
      "molten-mercury",
      "core-shell-b",
      "kinetic-portal",
      "gilding-transmutation",
      "steel-intaglio",
      "depth-silhouette",
      "procedural-atlas",
    ],
  },
];
