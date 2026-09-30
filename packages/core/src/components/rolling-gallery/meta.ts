import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "83",
  label: "Rolling Gallery",
  filename: "components/rolling-gallery/hero.webp",
  desc: "Images and looping videos roll onto the screen like paper feeding off a curved cylinder.",
  slug: "rolling-gallery",
  category: "interaction",
  subtype: "galleries",
  tags: ["Three.js", "WebGL", "Gallery", "Cylinder Roll", "Curved Scroll", "Lenis", "Video Stream"],
  previewType: "gallery",
  overview: "As you scroll, media rolls up from the bottom edge and curves toward you before flattening out across the center. The faster you scroll, the more the page bends under momentum, then eases gently back into place when you stop.",
  techStack: ["React", "Three.js", "WebGL", "Lenis", "TypeScript"],
  useCases: [
    "Product reveals: Gives long-scrolling pages a physical feel, rolling device renders and video clips across a curved horizon.",
    "Portfolios & design archives: Mixes vertical portraits, square loops, and panoramic videos together naturally without a rigid card grid.",
    "Interactive stories: Turns a long scroll into a film reel where scroll speed controls how hard the screen bends."
  ],
  engineeringNotes: [
    "Renders all images and looping videos into an offscreen buffer before bending the entire screen with a single post-processing shader.",
    "Measures DOM elements directly to lock every photo and video to its natural aspect ratio with zero distortion.",
    "Uses Lenis scroll velocity to dynamically flex the curve based on how fast the user scrolls."
  ],
  controls: [
    {
      type: "slider",
      key: "baseCurve",
      label: "Baseline Curve",
      default: 0.68,
      min: 0.0,
      max: 1.5,
      step: 0.02,
      description: "How much the page curves toward you at rest."
    },
    {
      type: "slider",
      key: "distance",
      label: "Curve Depth",
      default: 20.0,
      min: 4.0,
      max: 36.0,
      step: 1.0,
      description: "How deep the cylinder roll curves into the screen."
    },
    {
      type: "slider",
      key: "velocityBoost",
      label: "Speed Flex",
      default: 0.14,
      min: 0.0,
      max: 0.35,
      step: 0.01,
      description: "How much harder the page bends when you scroll fast."
    },
    {
      type: "slider",
      key: "spanCamber",
      label: "Side Flare",
      default: 0.55,
      min: 0.0,
      max: 1.0,
      step: 0.05,
      description: "Curves the left and right edges slightly upward for depth."
    },
    {
      type: "slider",
      key: "exitArc",
      label: "Top Exit Roll",
      default: 0.40,
      min: 0.0,
      max: 1.0,
      step: 0.05,
      description: "How much media curls away as it leaves the top of the screen."
    }
  ]
};
