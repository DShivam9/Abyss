export interface ShowcaseComponent {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: "image" | "geometry" | "scroll" | "gallary" | "hybrid" | "transition";
  complexity: "Simple" | "Intermediate" | "Advanced";
  techBadges: string[];
  accentHex: string;
  entryPattern:
    | "cinematic-scale"
    | "horizontal-rotate"
    | "vertical-mask"
    | "scatter-assemble"
    | "radial-iris"
    | "parallax-stack";
}

export const SHOWCASE_COMPONENTS: ShowcaseComponent[] = [
  {
    id: "1",
    name: "Liquid Image Mask",
    slug: "liquid-image-mask",
    description: "SVG clip-path morphing with cursor-driven fluid displacement dynamics.",
    category: "image",
    complexity: "Advanced",
    techBadges: ["WebGL", "Cursor Reactive", "GSAP"],
    accentHex: "#1E4FD6", // Deep Cobalt
    entryPattern: "cinematic-scale",
  },
  {
    id: "2",
    name: "Perspective Scroll Window",
    slug: "perspective-scroll-window",
    description: "Multi-layered container tilting under scroll-velocity and cursor proximity.",
    category: "scroll",
    complexity: "Intermediate",
    techBadges: ["Framer Motion", "Spring Physics", "Lenis"],
    accentHex: "#C45A3C", // Warm Terracotta
    entryPattern: "horizontal-rotate",
  },
  {
    id: "3",
    name: "Refraction Sprite Mesh",
    slug: "refraction-sprite-mesh",
    description: "Image fragment shading with custom chromatic aberration variables.",
    category: "image",
    complexity: "Advanced",
    techBadges: ["React Three Fiber", "Custom Shader", "GLSL"],
    accentHex: "#B8892E", // Aged Gold
    entryPattern: "vertical-mask",
  },
  {
    id: "4",
    name: "Magnetic Image Stack",
    slug: "magnetic-image-stack",
    description: "Scattered list elements assembling under cursor gravity and spring velocity.",
    category: "scroll",
    complexity: "Simple",
    techBadges: ["Framer Motion", "Magnetic Interaction"],
    accentHex: "#1A6B42", // Forest Green
    entryPattern: "scatter-assemble",
  },
  {
    id: "5",
    name: "Dynamic SVG Path Morph",
    slug: "dynamic-svg-path-morph",
    description: "Fluid container boundary morphing reacting to scroll triggers.",
    category: "scroll",
    complexity: "Intermediate",
    techBadges: ["GSAP CustomEase", "ScrollTrigger", "SVG"],
    accentHex: "#6B3A93", // Dusty Violet
    entryPattern: "radial-iris",
  },
  {
    id: "6",
    name: "Depth Parallax Curtain",
    slug: "depth-parallax-curtain",
    description: "Z-axis image layer splitting following viewport progress.",
    category: "scroll",
    complexity: "Advanced",
    techBadges: ["ScrollTrigger", "Perspective Tilt", "GPU Offloaded"],
    accentHex: "#4A5568", // Slate Steel
    entryPattern: "parallax-stack",
  },
];
