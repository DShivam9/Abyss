import { PlateItem } from "./types";

export const CARD_WIDTH = 440;
export const CARD_GAP = 32;
export const PITCH = CARD_WIDTH + CARD_GAP; // 472px
export const TRACK_PADDING_LEFT = 32;

export const INTRO_GLIDE_DURATION = 3800; // ms

// Framerate-independent exponential decay rates: factor = 1.0 - Math.exp(-lambda * dt)
export const LAMBDA_PARALLAX = 2.14;
export const LAMBDA_LENS_APPROACH = 9.05;
export const LAMBDA_LENS_LEAVE = 4.35;
export const LAMBDA_VELOCITY = 19.7;
export const LAMBDA_HEAD = 19.7;
export const LAMBDA_CORE = 10.46;
export const LAMBDA_TAIL = 5.66;
export const LAMBDA_BLUR = 11.9;
export const LAMBDA_BLUR_FADE = 14.9;
export const LAMBDA_DRIP_IN = 2.76;
export const LAMBDA_DRIP_OUT = 5.0;

export const DEFAULT_PLATES: PlateItem[] = [
  { id: 0,  text: "VELOCE",  fontSize: 60, textLength: 380, yTop: 503, yBottom: 577, yMid: 540, src: "/images/components/gooey-loop/image-01.webp" },
  { id: 1,  text: "PRISM",   fontSize: 62, textLength: 380, yTop: 0,   yBottom: 74,  yMid: 37,  src: "/images/components/gooey-loop/image-02.webp" },
  { id: 2,  text: "SOLAR",   fontSize: 62, textLength: 380, yTop: 143, yBottom: 217, yMid: 180, src: "/images/components/gooey-loop/image-03.webp" },
  { id: 3,  text: "STORM",   fontSize: 62, textLength: 380, yTop: 303, yBottom: 377, yMid: 340, src: "/images/components/gooey-loop/image-04.webp" },
  { id: 4,  text: "LUNAR",   fontSize: 62, textLength: 380, yTop: 646, yBottom: 720, yMid: 683, src: "/images/components/gooey-loop/image-05.webp" },
  { id: 5,  text: "GENESIS", fontSize: 56, textLength: 390, yTop: 203, yBottom: 277, yMid: 240, src: "/images/components/gooey-loop/image-06.webp" },
  { id: 6,  text: "BLOOM",   fontSize: 62, textLength: 380, yTop: 453, yBottom: 527, yMid: 490, src: "/images/components/gooey-loop/image-07.webp" },
  { id: 7,  text: "AVIAN",   fontSize: 62, textLength: 380, yTop: 0,   yBottom: 74,  yMid: 37,  src: "/images/components/gooey-loop/image-08.webp" },
  { id: 8,  text: "SHOAL",   fontSize: 62, textLength: 380, yTop: 323, yBottom: 397, yMid: 360, src: "/images/components/gooey-loop/image-09.webp" },
  { id: 9,  text: "AURA",    fontSize: 66, textLength: 380, yTop: 113, yBottom: 187, yMid: 150, src: "/images/components/gooey-loop/image-10.webp" },
  { id: 10, text: "CRIMSON", fontSize: 56, textLength: 390, yTop: 646, yBottom: 720, yMid: 683, src: "/images/components/gooey-loop/image-11.webp" },
  { id: 11, text: "REPTILE", fontSize: 56, textLength: 390, yTop: 283, yBottom: 357, yMid: 320, src: "/images/components/gooey-loop/image-12.webp" },
  { id: 12, text: "CIRCUIT", fontSize: 56, textLength: 390, yTop: 0,   yBottom: 74,  yMid: 37,  src: "/images/components/gooey-loop/image-13.webp" },
  { id: 13, text: "OZONE",   fontSize: 62, textLength: 380, yTop: 473, yBottom: 547, yMid: 510, src: "/images/components/gooey-loop/image-14.webp" },
  { id: 14, text: "PHANTOM", fontSize: 54, textLength: 390, yTop: 183, yBottom: 257, yMid: 220, src: "/images/components/gooey-loop/image-15.webp" },
  { id: 15, text: "ZEPHYR",  fontSize: 58, textLength: 380, yTop: 646, yBottom: 720, yMid: 683, src: "/images/components/gooey-loop/image-16.webp" }
];
