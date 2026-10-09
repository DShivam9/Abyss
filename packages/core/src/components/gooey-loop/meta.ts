import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "84",
  label: "Gooey Loop",
  filename: "components/gooey-loop/image-01.webp",
  desc: "An infinite horizontal card reel where photos show through bold letter cutouts that liquefy and drip on hover.",
  slug: "gooey-loop",
  category: "interaction",
  subtype: "galleries",
  bgColor: "#faf9f7",
  tags: [
    "Gooey Loop",
    "SVG Filters",
    "Lenis",
    "Carousel",
    "Typography",
    "Masks",
    "Parallax"
  ],
  previewType: "gallery",
  overview: "A horizontal card reel where photos show through bold letter cutouts. Dragging or scrolling slides through the cards with a subtle parallax drift inside each frame. Moving your cursor over the text liquefies the cutout seam into a gooey lens that stretches and drips across the photo.",
  techStack: ["React", "TypeScript", "SVG Filters", "Lenis", "CSS Modules"],
  useCases: [
    "Fashion lookbooks displaying collection photography through bold editorial headers.",
    "Design studio portfolios presenting client work in an endless horizontal reel.",
    "Release announcement pages where product teasers peek through large typographic masks."
  ],
  engineeringNotes: [
    "Each card contains its own SVG filter with feGaussianBlur and feColorMatrix, keeping gooey edge blending scoped to the local card mask.",
    "Cards repeat across three identical sets with modulo coordinate wrapping, so scrolling and dragging never hit a boundary.",
    "Hover and parallax math uses track layout offsets instead of getBoundingClientRect, preventing layout reflows during rapid scroll."
  ],
  controls: [
    {
      type: "slider",
      key: "scrollSpeed",
      label: "Scroll Speed",
      default: 1.0,
      min: 0.5,
      max: 3.0,
      step: 0.1,
      unit: "x",
      description: "Scroll speed multiplier for wheel and trackpad gestures."
    },
    {
      type: "slider",
      key: "parallaxIntensity",
      label: "Parallax Intensity",
      default: 120,
      min: 0,
      max: 180,
      step: 5,
      unit: "px",
      description: "Horizontal photo drift distance when cards pass the center of the screen."
    },
    {
      type: "toggle",
      key: "autoDrift",
      label: "Auto Drift",
      default: true,
      description: "Autonomous right-to-left glide when user is idle."
    },
    {
      type: "slider",
      key: "autoDriftSpeed",
      label: "Drift Speed",
      default: 55,
      min: 10,
      max: 150,
      step: 5,
      unit: "px/s",
      description: "Auto-drift glide velocity from right to left."
    }
  ]
};
