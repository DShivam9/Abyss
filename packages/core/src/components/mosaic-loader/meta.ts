import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "78",
  label: "Mosaic Loader",
  filename: "components/mosaic-loader/hero.webp",
  desc: "A bespoke editorial preloader with organic aspect-ratio constellation cards, mechanical odometer drum counting, an octagram star HUD, and gravitational implosion transition.",
  slug: "mosaic-loader",
  category: "interaction",
  subtype: "loaders",
  tags: ["Mosaic Loader", "Preloader", "Odometer Drum", "Octagram Star", "Typography", "Constellation Grid"],
  previewType: "transition",
  overview: "Editorial loading sequence coordinating eighteen organic constellation image cards with high-speed quantum shuffling, a central mechanical vertical odometer drum, and an 8-point geometric octagram HUD. Features gravitational card implosion upon sequence completion, followed by an elegant curtain reveal into interactive editorial manifesto typography.",
  techStack: ["React", "TypeScript", "HTML5 (DOM / CSS)"],
  useCases: [
    "High fashion brand launches and luxury campaign landing sites creating anticipation through editorial imagery before revealing seasonal collections.",
    "Creative studio and architecture agency portfolios transitioning seamlessly from an immersive brand prelude into typographic manifestos.",
    "Digital design exhibitions and cultural showcases curating multi-asset visual loading sequences with tactile mechanical counter feedback."
  ],
  engineeringNotes: [
    "Coordinates 18 independent aspect-ratio card slots with staggered spawn delays and requestAnimationFrame image index shuffling.",
    "Drives vertical mechanical odometer digit drums via sub-pixel CSS translation steps synchronized with completion percentages.",
    "Executes gravitational implosion physics pulling dispersed constellation tiles into the center point before triggering the manifesto curtain rise."
  ],
  controls: [
    {
      type: "slider",
      key: "duration",
      label: "Sequence Duration",
      default: 6200,
      min: 3000,
      max: 10000,
      step: 200,
      unit: "ms",
      description: "Total run time of the loading sequence before triggering gravitational implosion."
    },
    {
      type: "slider",
      key: "startDelay",
      label: "Initial Delay",
      default: 800,
      min: 200,
      max: 2000,
      step: 100,
      unit: "ms",
      description: "Delay before the constellation cards and odometer counter initiate animation."
    }
  ]
};
