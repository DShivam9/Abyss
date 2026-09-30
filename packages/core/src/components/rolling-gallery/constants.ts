import { SpreadGroup } from "./types";

export const DEFAULT_BASE_CURVE = 0.68;
export const DEFAULT_DISTANCE = 20.0;
export const DEFAULT_VELOCITY_BOOST = 0.14;
export const DEFAULT_SPAN_CAMBER = 0.55;
export const DEFAULT_EXIT_ARC = 0.40;

const BASE_PATH = "/images/components/rolling-gallery";

export const DEFAULT_SPREADS: SpreadGroup[] = [
  // Spread 1: Architectural Horizon (Hero Opening)
  {
    id: "spread-01",
    type: "single",
    variant: "hero",
    items: [
      {
        id: "item-01",
        src: `${BASE_PATH}/image-01.webp`,
        type: "image",
        alt: "Architectural Pavilion Horizon",
        aspectRatio: 1.333,
      },
    ],
  },

  // Spread 2: Cantilevered Column & Fluid Loop (Asymmetric Left)
  {
    id: "spread-02",
    type: "duo",
    variant: "asymmetric-left",
    items: [
      {
        id: "item-02",
        src: `${BASE_PATH}/image-02.webp`,
        type: "image",
        alt: "Monochrome Column Form",
        aspectRatio: 0.450,
      },
      {
        id: "item-03",
        src: `${BASE_PATH}/video-02.mp4`,
        type: "video",
        alt: "Tactile Fluid Motion",
        aspectRatio: 1.000,
        offsetClass: "offset-down-md",
      },
    ],
  },

  // Spread 3: Multi-Element Poly-Strata Triptych (Tall Monolith + Cosmos Ribbon + Corner Light)
  {
    id: "spread-03",
    type: "triptych",
    variant: "triptych-stagger",
    items: [
      {
        id: "item-04",
        src: `${BASE_PATH}/image-04.webp`,
        type: "image",
        alt: "Brutalist Silhouette Vertical",
        aspectRatio: 0.560,
        offsetClass: "offset-down-sm",
      },
      {
        id: "item-05",
        src: `${BASE_PATH}/video-06.mp4`,
        type: "video",
        alt: "Cosmos Ambient Stream",
        aspectRatio: 1.786,
      },
      {
        id: "item-06",
        src: `${BASE_PATH}/image-05.webp`,
        type: "image",
        alt: "Minimalist Light Pyramid Corner",
        aspectRatio: 0.984,
        offsetClass: "offset-down-lg",
      },
    ],
  },

  // Spread 4: Off-Axis Right Editorial Pullout (Deep Breathing Frame)
  {
    id: "spread-04",
    type: "single",
    variant: "align-right",
    items: [
      {
        id: "item-07",
        src: `${BASE_PATH}/image-03.webp`,
        type: "image",
        alt: "Fine Art Sartorial Figure",
        aspectRatio: 0.802,
        maxWidth: 680,
      },
    ],
  },

  // Spread 5: Full-Width Panoramic Centerpiece Vista
  {
    id: "spread-05",
    type: "single",
    variant: "wide",
    items: [
      {
        id: "item-08",
        src: `${BASE_PATH}/video-01.mp4`,
        type: "video",
        alt: "Cinematic Atmosphere Stream",
        aspectRatio: 1.778,
      },
    ],
  },

  // Spread 6: The Interlocking Hands (Corner-to-Corner Touch Nexus)
  {
    id: "spread-06",
    type: "duo",
    variant: "corner-touch",
    items: [
      {
        id: "item-09",
        src: `${BASE_PATH}/image-11.webp`,
        type: "image",
        alt: "Ascending Sculpted Hand Form",
        aspectRatio: 0.640,
        maxWidth: 400,
      },
      {
        id: "item-10",
        src: `${BASE_PATH}/image-06.webp`,
        type: "image",
        alt: "Descending Tension Hand Form",
        aspectRatio: 0.544,
        maxWidth: 350,
      },
    ],
  },

  // Spread 7: Ambient Kinematics Duet (Video Stream + 35mm Studio Specimen)
  {
    id: "spread-07",
    type: "duo",
    variant: "asymmetric-right",
    items: [
      {
        id: "item-11",
        src: `${BASE_PATH}/video-03.mp4`,
        type: "video",
        alt: "Continuous Ambient Reel",
        aspectRatio: 1.500,
        offsetClass: "offset-down-sm",
      },
      {
        id: "item-12",
        src: `${BASE_PATH}/image-07.webp`,
        type: "image",
        alt: "Classic 35mm Studio Specimen",
        aspectRatio: 0.667,
      },
    ],
  },

  // Spread 8: Geometric Horizon & Raw Monolith (Counter-Scale Duet)
  {
    id: "spread-08",
    type: "duo",
    variant: "asymmetric-left",
    items: [
      {
        id: "item-13",
        src: `${BASE_PATH}/image-08.webp`,
        type: "image",
        alt: "Raw Concrete Geometry",
        aspectRatio: 0.836,
      },
      {
        id: "item-14",
        src: `${BASE_PATH}/image-09.webp`,
        type: "image",
        alt: "Warm Desert Horizon Plate",
        aspectRatio: 1.600,
        offsetClass: "offset-down-md",
      },
    ],
  },

  // Spread 9: Dual Kinetic Rhythm (Prismatic Wave & Optical Light Loop)
  {
    id: "spread-09",
    type: "duo",
    variant: "balanced",
    items: [
      {
        id: "item-15",
        src: `${BASE_PATH}/video-04.mp4`,
        type: "video",
        alt: "Optical Dynamic Light Loop",
        aspectRatio: 1.463,
      },
      {
        id: "item-16",
        src: `${BASE_PATH}/video-05.mp4`,
        type: "video",
        alt: "Prismatic Wave Motion",
        aspectRatio: 1.333,
        offsetClass: "offset-down-sm",
      },
    ],
  },

  // Spread 10: The Obelisk Finale (Solo Exit Spire)
  {
    id: "spread-10",
    type: "single",
    variant: "intimate",
    items: [
      {
        id: "item-17",
        src: `${BASE_PATH}/image-10.webp`,
        type: "image",
        alt: "Grand Editorial Spire Monolith",
        aspectRatio: 0.462,
      },
    ],
  },
];
