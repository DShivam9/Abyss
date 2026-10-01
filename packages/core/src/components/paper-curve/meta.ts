import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "83",
  label: "Paper Curve",
  filename: "components/paper-curve/hero.webp",
  desc: "Photos and videos roll into view and flatten out like sheets of paper flowing across a printing press.",
  slug: "paper-curve",
  category: "interaction",
  subtype: "galleries",
  bgColor: "#eae7e1",
  tags: ["Three.js", "WebGL", "Gallery", "Paper Curve", "Curved Scroll", "Lenis", "Video Stream"],
  previewType: "gallery",
  overview: "As you scroll, images and videos roll up from the bottom, softly fade into view, and flatten out across the screen. Adjacent photos glide past each other with smooth layer depth, bending more when you scroll fast and settling gently when you stop, before curling away at the top.",
  techStack: ["React", "Three.js", "WebGL", "Lenis", "TypeScript"],
  useCases: [
    "Creative studios & portfolios: Mixes vertical portraits, square clips, and wide panoramas together naturally without a rigid box grid.",
    "Editorial stories: Turns a long scroll into a tactile experience where photos gently shift in depth as you read.",
    "Product showcases: Gives device photos and videos a physical, cinematic presence that feels alive to the touch."
  ],
  engineeringNotes: [
    "Locks every photo and video to its natural proportions so nothing stretches or distorts.",
    "Smoothly adjusts to your screen’s native refresh rate for fluid scrolling on any display.",
    "Automatically pauses videos when they scroll off-screen to keep the experience fast and responsive."
  ],
  controls: [
    {
      type: "slider",
      key: "curvature",
      label: "Curvature",
      default: 0.65,
      min: 0.0,
      max: 1.2,
      step: 0.02,
      description: "How much the gallery rolls like curved paper."
    },
    {
      type: "slider",
      key: "momentumFlex",
      label: "Momentum Flex",
      default: 0.12,
      min: 0.0,
      max: 0.30,
      step: 0.01,
      description: "How dynamically the page bends when you scroll fast."
    },
    {
      type: "slider",
      key: "depthParallax",
      label: "Depth Parallax",
      default: 0.50,
      min: 0.0,
      max: 1.0,
      step: 0.05,
      description: "Smooth gliding depth between adjacent photos."
    },
    {
      type: "slider",
      key: "exitCurl",
      label: "Top Exit Curl",
      default: 0.35,
      min: 0.0,
      max: 0.80,
      step: 0.05,
      description: "How softly media curls away as it leaves the top of the screen."
    }
  ]
};
