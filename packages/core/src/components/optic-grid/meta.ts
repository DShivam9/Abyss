import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "81",
  label: "Optic Grid",
  filename: "components/optic-grid/image-07.webp",
  desc: "Photographic lattice with in-flight optical processing, dynamic glass scale gauges, and seamless GSAP Flip morphing.",
  slug: "optic-grid",
  category: "interaction",
  subtype: "galleries",
  tags: ["FLIP Layout", "Optical Filters", "Scale Stepper", "Photo Matrix", "Liquid Silk"],
  previewType: "gallery",
  overview: "A 30-piece photographic matrix that morphs smoothly between six distinct grid topologies (Contact, Cadence, Editorial, Panorama, Drift, Keystone). In-flight optical filters apply real-time chromatic, halide, or bloom distortions mid-flight, while a tactile glass gauge controls overall scale.",
  techStack: ["React", "GSAP", "Flip"],
  useCases: [
    "High-fashion and editorial studio lookbooks presenting collections across dynamic layout formats.",
    "Architectural and photography archives offering interactive matrix density controls.",
    "Creative direction decks demonstrating multiple photographic crops and compositions."
  ],
  engineeringNotes: [
    "Uses GSAP Flip with a custom liquidSilk cubic-bezier curve ('0.68, 0, 0.25, 1') for hydraulic deceleration.",
    "Optical filters interpolate in-flight from neutral CSS filter definitions to eliminate missing-property glitches.",
    "Alternating images travel along parabolic Z-depth trajectories (+6px foreground, -6px background) during re-layout.",
    "Static will-change hints removed; compositor layers promoted dynamically only during active transitions."
  ],
  controls: []
};

