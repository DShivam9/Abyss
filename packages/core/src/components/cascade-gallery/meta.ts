import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "76",
  label: "Cascade Gallery",
  filename: "components/cascade-gallery/hero.webp",
  desc: "Editorial 3D diagonal conveyor gallery with staged hero card expansion, tactile lateral tab pull, refractive glass shaders, and live chronometer telemetry.",
  slug: "cascade-gallery",
  category: "3d",
  subtype: "gallery",
  tags: ["Three.js", "Cascade Gallery", "Thermal Emulsion", "Optical Glass", "Editorial Conveyor", "Mechanical Clock", "3D WebGL", "GSAP 3D Choreography"],
  previewType: "gallery",
  overview: "Diagonal 3D conveyor gallery streaming editorial image cards along a continuous spatial rack. Cards tilt with domino inertia during scroll, lift vertically like tactile index tabs on hover, and transition into staged hero inspection with refractive glass shaders.",
  techStack: ["React", "Three.js", "WebGL", "GSAP", "TypeScript"],
  useCases: [
    "Industrial design archives and physical product launches showcasing concept renders along a tactile conveyor.",
    "Design studio project showcases featuring progressive hero card expansion and detailed project metadata.",
    "Digital art exhibitions and photography archives displaying high-resolution works on a continuous spatial runway."
  ],
  engineeringNotes: [
    "Employs custom Three.js GLSL shaders with chromatic dispersion and depth-based fresnel falloff on card surfaces.",
    "Choreographs multi-stage hero expansion and resting card domino lean using synced GSAP timelines.",
    "Implements continuous circular conveyor math with modulo positioning to render infinite card streams efficiently."
  ],
  controls: [
    {
      type: "slider",
      key: "stepDist",
      label: "Rack Card Density",
      default: 0.22,
      min: 0.20,
      max: 0.28,
      step: 0.01,
      description: "Controls the spatial packing density and spacing between consecutive cards on the conveyor rack."
    },
    {
      type: "slider",
      key: "hoverLiftMultiplier",
      label: "Hover Tab Pull",
      default: 1.75,
      min: 0.8,
      max: 3.0,
      step: 0.1,
      description: "Adjusts the vertical tab pull distance when hovering individual cards."
    },
    {
      type: "slider",
      key: "dominoLean",
      label: "Domino Inertia Lean",
      default: 1.0,
      min: 0.5,
      max: 2.5,
      step: 0.1,
      description: "Sets the inertial pitch angle cards tilt into during fast drag or wheel acceleration."
    },
    {
      type: "slider",
      key: "ambientDriftSpeed",
      label: "Conveyor Drift Speed",
      default: 0.016,
      min: 0.0,
      max: 0.05,
      step: 0.002,
      description: "Sets the autonomous cruising velocity of the conveyor when idle."
    },
    {
      type: "slider",
      key: "scrollSensitivity",
      label: "Scroll Sensitivity",
      default: 0.0065,
      min: 0.002,
      max: 0.015,
      step: 0.0005,
      unit: "x",
      description: "Multiplies wheel and drag input responsiveness across the diagonal rail."
    }
  ]
};
