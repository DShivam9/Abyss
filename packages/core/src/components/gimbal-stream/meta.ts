import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "75",
  label: "Gimbal Stream",
  filename: "components/gimbal-stream/hero.webp",
  desc: "Multi-tier 3D gimbal stream orbiting card rings around a liquid chrome core with procedural chamber patterns, cylindrical vertex curvature, and inertia-driven orbital scroll.",
  slug: "gimbal-stream",
  category: "3d",
  subtype: "gallery",
  tags: ["Three.js", "Gimbal Stream", "Obsidian Chamber", "Liquid Mercury", "Lenis Inertia", "3D WebGL", "Orrery Rings"],
  previewType: "gallery",
  overview: "Multi-tiered 3D gimbal carousel orbiting curved media cards around a liquid mercury centerpiece. Independent ring inclinations and rotational speeds respond to scroll inertia and pointer drag, with cylindrical vertex shaders bending cards along concentric orbital paths.",
  techStack: ["React", "Three.js", "WebGL", "TypeScript"],
  useCases: [
    "Creative agency showcase hubs displaying multidisciplinary case studies across independent concentric orbital rings.",
    "Music festival and event roster pages where visitors explore headliner lineups on rotating 3D planetary tracks.",
    "High-tech product ecosystem portals visualizing connected software tools and hardware devices around a central core."
  ],
  engineeringNotes: [
    "Injects custom vertex shader chunks to dynamically bend flat card geometries along cylindrical orbital radii.",
    "Drives independent multi-ring rotation with counter-rotating inclinations and smooth inertia damping on wheel input.",
    "Computes raycast intersections against curved card meshes to position a responsive satin glass tooltip overlay."
  ],
  controls: [
    {
      type: "select",
      key: "gridVariant",
      label: "Chamber Pattern",
      default: "plus",
      description: "Switches the background chamber pattern between Swiss plus marks, ghost lines, and hexagonal honeycomb.",
      options: [
        { label: "Swiss Plus (+)", value: "plus" },
        { label: "Ghost Grid", value: "ghost" },
        { label: "Hex Honeycomb", value: "hex" }
      ]
    },
    {
      type: "slider",
      key: "autoRotateSpeed",
      label: "Auto Drift Speed",
      default: 0.10,
      min: 0.0,
      max: 0.50,
      step: 0.01,
      description: "Sets the continuous autonomous orbital velocity of the gimbal rings when idle."
    },
    {
      type: "slider",
      key: "scrollSpeed",
      label: "Scroll Orbit Speed",
      default: 0.0045,
      min: 0.001,
      max: 0.02,
      step: 0.0005,
      description: "Adjusts rotational acceleration responsiveness when scrolling through the orbital streams."
    },
    {
      type: "slider",
      key: "cardBendMultiplier",
      label: "Card Curvature Bend",
      default: 6.5,
      min: 0.0,
      max: 15.0,
      step: 0.5,
      description: "Controls the cylindrical curvature strength applied to cards along their orbital ring path."
    },
    {
      type: "slider",
      key: "glowIntensity",
      label: "Core Glow Energy",
      default: 3.2,
      min: 0.5,
      max: 6.0,
      step: 0.1,
      description: "Adjusts the luminance and specular bloom of the central liquid chrome core."
    },
    {
      type: "slider",
      key: "waveBrightness",
      label: "Nebula Wave Brightness",
      default: 1.0,
      min: 0.30,
      max: 2.5,
      step: 0.05,
      description: "Tunes the ambient background wave illumination intensity."
    },
    {
      type: "slider",
      key: "waveSpeed",
      label: "Nebula Wave Speed",
      default: 1.0,
      min: 0.20,
      max: 3.50,
      step: 0.10,
      description: "Regulates the procedural wave cycle frequency inside the chamber."
    }
  ]
};
