import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "79",
  label: "Cinema Aisle",
  filename: "components/cinema-aisle/hero.png",
  desc: "An endless 3D cinematic corridor featuring streaming video panels along curved parabolic gallery walls with real-time video reflections across an obsidian glass runway.",
  slug: "cinema-aisle",
  category: "interaction",
  subtype: "galleries",
  tags: ["Three.js", "WebGL", "Gallery", "3D Corridor", "Video Wall", "Reflections"],
  previewType: "gallery",
  overview: "An infinite 3D gallery corridor rendering streaming video panels along mathematically curved parabolic walls. Features dynamic planar video reflections over a dark obsidian glass floor, dual-mode manual scroll scrubbing alongside autonomous ambient drift, and sub-pixel depth-fog culling for fluid high-framerate rendering.",
  techStack: ["React", "Three.js", "WebGL", "TypeScript"],
  useCases: [
    "Luxury brand and fashion house flagships streaming runway collections and campaign reels across an infinite interactive corridor.",
    "Film festival and production studio portfolios showcasing cinematic trailers and behind the scenes footage with ambient glass reflections.",
    "Digital art exhibitions and virtual galleries curating video installations with responsive scroll momentum and continuous gallery drift."
  ],
  engineeringNotes: [
    "Constructs parabolic wall curves procedurally using Three.js instanced geometry and custom video texture samplers.",
    "Renders real-time inverted planar reflections across an obsidian floor plane with distance-attenuated fog falloff.",
    "Integrates dual-mode camera tracking supporting continuous passive velocity cruise with tactile pointer wheel scrubbing."
  ],
  controls: [
    {
      type: "slider",
      key: "curveFlare",
      label: "Wall Flare",
      default: 6.2,
      min: 0.0,
      max: 10.0,
      step: 0.2,
      description: "Controls the parabolic lateral curvature of the side corridor walls."
    },
    {
      type: "slider",
      key: "scrollSpeed",
      label: "Scroll Velocity",
      default: 1.0,
      min: 0.5,
      max: 2.0,
      step: 0.1,
      unit: "x",
      description: "Multiplies wheel and pointer drag velocity across the corridor axis."
    },
    {
      type: "slider",
      key: "reflectionSheen",
      label: "Floor Reflection",
      default: 0.88,
      min: 0.0,
      max: 1.0,
      step: 0.05,
      description: "Adjusts the opacity and gloss intensity of the dark obsidian floor reflections."
    },
    {
      type: "slider",
      key: "corridorWidth",
      label: "Corridor Width",
      default: 3.5,
      min: 2.4,
      max: 5.2,
      step: 0.1,
      unit: "m",
      description: "Sets the lateral clearance distance between the left and right video walls."
    },
    {
      type: "slider",
      key: "driftSpeed",
      label: "Auto Drift",
      default: 2.0,
      min: 0.0,
      max: 4.0,
      step: 0.1,
      description: "Determines the continuous autonomous cruising speed through the video aisle."
    }
  ]
};
