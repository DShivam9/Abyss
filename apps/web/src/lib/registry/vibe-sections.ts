export interface VibeSection {
  id: string;
  title: string;
  headlineClass: "headline-s1" | "headline-s2" | "headline-s3" | "headline-s4";
  count: number;
  slugs: string[];
}

export const VIBE_SECTIONS: VibeSection[] = [
  {
    id: "scroll-perspectives",
    title: "Scroll Perspectives",
    headlineClass: "headline-s2", // blue
    count: 8,
    slugs: [
      "parallax-column",
      "erosion-map",
      "dual-wave",
      "phase-drift",
      "depth-swim",
      "cylinder-scroll",
      "parallax-bleed",
      "arc-drift-gallery",
    ],
  },
  {
    id: "spatial-galleries",
    title: "Spatial Galleries",
    headlineClass: "headline-s3", // indigo
    count: 8,
    slugs: [
      "orbit-ring-gallery",
      "3d-shatter-sphere",
      "gravity-cursor",
      "focus-ring",
      "cursor-wake",
      "image-snake-trail",
      "3d-cursor-trail",
      "apparatus-tracklist-gallery",
    ],
  },
  {
    id: "type-and-motion",
    title: "Type and Motion",
    headlineClass: "headline-s4", // red
    count: 5,
    slugs: [
      "accordion-wall",
      "curved-scroll-wipe",
      "clip-morph",
      "ripple-scramble",
      "3d-reel-text",
    ],
  },
  {
    id: "light-and-texture",
    title: "Light and Texture",
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
      "apparatus-steel-intaglio",
      "depth-silhouette",
      "procedural-atlas",
    ],
  },
];
