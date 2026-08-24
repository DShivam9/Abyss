import * as THREE from "three";

export const DEFAULT_IMAGES: string[] = [
  "/images/components/abyss-cursor-fall/card-01.webp",
  "/images/components/abyss-cursor-fall/shapes/shape-01.svg",
  "/images/components/abyss-cursor-fall/card-02.webp",
  "/images/components/abyss-cursor-fall/shapes/shape-02.svg",
  "/images/components/abyss-cursor-fall/card-03.webp",
  "/images/components/abyss-cursor-fall/shapes/shape-03.svg",
  "/images/components/abyss-cursor-fall/card-04.webp",
  "/images/components/abyss-cursor-fall/shapes/shape-04.svg",
  "/images/components/abyss-cursor-fall/card-05.webp",
  "/images/components/abyss-cursor-fall/shapes/shape-05.svg",
  "/images/components/abyss-cursor-fall/card-06.webp",
  "/images/components/abyss-cursor-fall/shapes/shape-06.svg",
  "/images/components/abyss-cursor-fall/card-07.webp",
  "/images/components/abyss-cursor-fall/shapes/shape-07.svg",
  "/images/components/abyss-cursor-fall/card-08.webp",
  "/images/components/abyss-cursor-fall/shapes/shape-08.svg",
  "/images/components/abyss-cursor-fall/card-09.webp",
  "/images/components/abyss-cursor-fall/shapes/shape-09.svg",
  "/images/components/abyss-cursor-fall/card-10.webp",
  "/images/components/abyss-cursor-fall/shapes/shape-10.svg",
];

// Rich, vivid palette for vector SVGs (Blue, Red, Green, Lime, Purple, Violet, Cyan, Magenta)
export const STARK_SVG_PALETTE: number[] = [
  0x0088ff, // Electric Blue
  0xff1133, // Stark Crimson Red
  0x00e640, // Bright Emerald Green
  0x76ff03, // Vivid Electric Lime
  0x9c27b0, // Deep Neon Purple
  0x7c4dff, // Bright Electric Violet
  0x00e5ff, // Stark Cyan
  0xff007f, // Stark Magenta
];

export const DESATURATED_SVG_GREY = new THREE.Color(0.28, 0.28, 0.32);
export const DESATURATED_PHOTO_GREY = new THREE.Color(0.22, 0.22, 0.25);
export const PURE_WHITE = new THREE.Color(1.0, 1.0, 1.0);

export const DEPTH_LAYERS: number[] = [1.2, 0.0, -1.8];
