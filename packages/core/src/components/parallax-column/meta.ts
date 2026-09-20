import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "39",
  label: "Parallax Column",
  filename: "components/parallax-column/hero.webp",
  desc: "Split-screen runway where opposing columns glide in reverse, revealing images through clipped window parallax.",
  slug: "parallax-column",
  category: "scroll",
  subtype: "transition",
  tags: ["Split Scroll", "Dual Runway", "Window Parallax", "Infinite Loop"],
  previewType: "scroll",
  overview: "Two split columns scroll in opposite directions at matching speeds. Inside each card, the photo floats in counter-parallax so images feel like looking through moving window apertures.",
  techStack: ["React", "GSAP", "Lenis"],
  useCases: [
    "Portfolios comparing project imagery across two offset columns.",
    "Dual image streams scrolling in opposite directions for photo galleries.",
    "Case studies pairing design explorations and final results side by side."
  ],
  engineeringNotes: [
    "Inner photos are sized to 170% height with a -35% top offset, so photos have plenty of travel room without showing empty gaps.",
    "When you stop scrolling, a subtle auto-drift smoothly takes over so the screen never sits completely frozen.",
    "Duplicates the image list once and uses modulo arithmetic so the runways loop infinitely in both directions with zero DOM churn.",
    "Cards automatically fade out as they reach the viewport edges to keep paint performance lightweight."
  ],
  controls: [
    {
      type: "select",
      key: "motionVariant",
      label: "Motion Variant",
      default: "classic",
      description: "Switches between flat 2D parallax, concave cylindrical curve, and convex outward bulge.",
      options: [
        { label: "Classic (Flat)", value: "classic" },
        { label: "Concave Cylinder", value: "cylinder" },
        { label: "Convex Bulge", value: "convex" }
      ]
    },
    {
      type: "slider",
      key: "parallaxIntensity",
      label: "Parallax Intensity",
      default: 60,
      min: 0,
      max: 100,
      step: 5,
      unit: "%",
      description: "Controls the travel distance and speed of inner photos counter-scrolling within card apertures."
    },
    {
      type: "slider",
      key: "borderRadius",
      label: "Corner Radius",
      default: 8,
      min: 0,
      max: 32,
      step: 1,
      unit: "px",
      description: "Corner curvature applied to outer card frames and masked image boundaries."
    },
    {
      type: "slider",
      key: "columnGap",
      label: "Column Gap Spacing",
      default: 4,
      min: 0,
      max: 48,
      step: 2,
      unit: "px",
      description: "Horizontal gutter spacing between the counter-scrolling left and right columns."
    },
    {
      type: "slider",
      key: "imageGap",
      label: "Vertical Image Gap",
      default: 4,
      min: 0,
      max: 48,
      step: 2,
      unit: "px",
      description: "Vertical spacing between consecutive cards inside each scrolling runway."
    }
  ]
};
