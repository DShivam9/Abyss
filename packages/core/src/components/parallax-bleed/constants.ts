import { BleedSection } from "./types";

// Dedicated full-bleed image sections with asymmetrical editorial alignment & prose subtitles
// ponytail: optimized webp assets and lightweight 60fps render loop
export const DEFAULT_BLEED_SECTIONS: BleedSection[] = [
  {
    id: "01",
    title: "HORIZON",
    subtitle: "A vast expanse frozen in atmospheric silence.",
    alignClass: "inset-y-0 left-0 w-full md:w-3/5 flex flex-col justify-center items-start text-left px-8 md:px-20",
    image: "/images/components/parallax-bleed/section-01.webp",
  },
  {
    id: "02",
    title: "VOID",
    subtitle: "Surrendering all sound to the weight of shadow.",
    alignClass: "inset-y-0 right-0 w-full md:w-3/5 flex flex-col justify-center items-end text-right px-8 md:px-20",
    image: "/images/components/parallax-bleed/section-02.webp",
  },
  {
    id: "03",
    title: "MONOLITH",
    subtitle: "Standing static through centuries of shifting storm.",
    alignClass: "inset-y-0 left-0 w-full md:w-3/5 flex flex-col justify-center items-start text-left px-8 md:px-20",
    image: "/images/components/parallax-bleed/section-03.webp",
  },
  {
    id: "04",
    title: "ECHO",
    subtitle: "Ripples of light drifting across empty space.",
    alignClass: "inset-y-0 right-0 w-full md:w-3/5 flex flex-col justify-center items-end text-right px-8 md:px-20",
    image: "/images/components/parallax-bleed/section-04.webp",
  },
];

// Baked defaults for smooth physics & kinetic drift
export const BAKED_SCROLL_SPEED = 1.0;
export const BAKED_INERTIAL_DAMPING = 6.0;
export const BAKED_MOUSE_DRIFT = 4;
