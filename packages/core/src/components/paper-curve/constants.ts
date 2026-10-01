import { SpreadGroup } from "./types";

export const DEFAULT_CURVATURE = 0.65;
export const DEFAULT_MOMENTUM_FLEX = 0.12;
export const DEFAULT_DEPTH_PARALLAX = 0.50;
export const DEFAULT_EXIT_CURL = 0.35;

export const BAKED_CURVE_DEPTH = 22.0;
export const BAKED_SPAN_CAMBER = 0.40;

// Backwards-compatible aliases
export const DEFAULT_BASE_CURVE = DEFAULT_CURVATURE;
export const DEFAULT_DISTANCE = BAKED_CURVE_DEPTH;
export const DEFAULT_VELOCITY_BOOST = DEFAULT_MOMENTUM_FLEX;
export const DEFAULT_SPAN_CAMBER = BAKED_SPAN_CAMBER;
export const DEFAULT_EXIT_ARC = DEFAULT_EXIT_CURL;
export const DEFAULT_BLUR_INTENSITY = 0.0;
export const DEFAULT_PARALLAX_SCALE = DEFAULT_DEPTH_PARALLAX;

const BASE_PATH = "/images/components/paper-curve";

export const DEFAULT_SPREADS: SpreadGroup[] = [
  // 01. The Opening Horizon — Wide Architectural Landscape (Anchored)
  {
    id: "spread-01",
    type: "single",
    variant: "wide",
    items: [
      {
        id: "item-01",
        src: `${BASE_PATH}/image-01.webp`,
        type: "image",
        alt: "Architectural Pavilion Horizon",
        aspectRatio: 1.333,
        parallax: 0,
      },
    ],
  },

  // 02. Scale Polarity — Heavy Vertical Monolith & Classical Sculptural Bust
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
        parallax: -0.5,
      },
      {
        id: "item-12",
        src: `${BASE_PATH}/image-12.webp`,
        type: "image",
        alt: "Sculptural Marble Form",
        aspectRatio: 0.750,
        parallax: 0.5,
        offsetClass: "offset-down-md",
      },
    ],
  },

  // 03. Sartorial Presence — High-Fashion Sartorial Figure (Anchored)
  {
    id: "spread-03",
    type: "single",
    variant: "align-right",
    items: [
      {
        id: "item-03",
        src: `${BASE_PATH}/image-03.webp`,
        type: "image",
        alt: "Fine Art Sartorial Figure",
        aspectRatio: 0.802,
        parallax: 0,
      },
    ],
  },

  // 04. Tight Diptych — Structural Silhouette & Monolithic Spire
  {
    id: "spread-04",
    type: "duo",
    variant: "tight-diptych",
    items: [
      {
        id: "item-04",
        src: `${BASE_PATH}/image-04.webp`,
        type: "image",
        alt: "Brutalist Silhouette Vertical",
        aspectRatio: 0.560,
        parallax: -0.5,
      },
      {
        id: "item-17",
        src: `${BASE_PATH}/image-17.webp`,
        type: "image",
        alt: "Monolithic Structural Column",
        aspectRatio: 0.462,
        parallax: 0.5,
      },
    ],
  },

  // 05. The Centerpiece Vista — Cinematic Atmospheric Panorama Video (Anchored)
  {
    id: "spread-05",
    type: "single",
    variant: "wide",
    items: [
      {
        id: "item-05-vid",
        src: `${BASE_PATH}/video-01.mp4`,
        type: "video",
        alt: "Cinematic Atmosphere Stream",
        aspectRatio: 1.778,
        parallax: 0,
      },
    ],
  },

  // 06. Dynamic Sculptural Tension — Opposing Hands Corner-to-Corner Diagonal Nexus
  {
    id: "spread-06",
    type: "duo",
    variant: "corner-touch",
    items: [
      {
        id: "item-11",
        src: `${BASE_PATH}/image-11.webp`,
        type: "image",
        alt: "Ascending Sculpted Hand Form",
        aspectRatio: 0.640,
        parallax: -0.5,
      },
      {
        id: "item-06",
        src: `${BASE_PATH}/image-06.webp`,
        type: "image",
        alt: "Descending Tension Hand Form",
        aspectRatio: 0.544,
        parallax: 0.5,
      },
    ],
  },

  // 07. Asymmetric Rhythm — Delicate Ambient Reel Paired With 35mm Studio Specimen
  {
    id: "spread-07",
    type: "duo",
    variant: "asymmetric-right",
    items: [
      {
        id: "item-07-vid",
        src: `${BASE_PATH}/video-03.mp4`,
        type: "video",
        alt: "Continuous Ambient Reel",
        aspectRatio: 1.500,
        parallax: -0.5,
        offsetClass: "offset-down-sm",
      },
      {
        id: "item-07",
        src: `${BASE_PATH}/image-07.webp`,
        type: "image",
        alt: "Classic 35mm Studio Specimen",
        aspectRatio: 0.667,
        parallax: 0.5,
      },
    ],
  },

  // 08. Poly-Cadence Editorial Triad — Monolith, Cosmos Horizon, and Corner Beacon
  {
    id: "spread-08",
    type: "triptych",
    variant: "triptych-stagger",
    items: [
      {
        id: "item-18",
        src: `${BASE_PATH}/image-18.webp`,
        type: "image",
        alt: "Vertical Kinetic Form",
        aspectRatio: 0.500,
        offsetClass: "offset-down-sm",
        parallax: -0.5,
      },
      {
        id: "item-08-vid",
        src: `${BASE_PATH}/video-06.mp4`,
        type: "video",
        alt: "Cosmos Ambient Stream",
        aspectRatio: 1.786,
        parallax: 0,
      },
      {
        id: "item-05-img",
        src: `${BASE_PATH}/image-05.webp`,
        type: "image",
        alt: "Minimalist Light Pyramid Corner",
        aspectRatio: 0.984,
        offsetClass: "offset-down-md",
        parallax: 0.5,
      },
    ],
  },

  // 09. Architectural Monolith & Minimalist Glass Form
  {
    id: "spread-09",
    type: "duo",
    variant: "asymmetric-left",
    items: [
      {
        id: "item-14",
        src: `${BASE_PATH}/image-14.webp`,
        type: "image",
        alt: "Sartorial Contrast Study",
        aspectRatio: 0.800,
        parallax: -0.5,
      },
      {
        id: "item-16",
        src: `${BASE_PATH}/image-16.webp`,
        type: "image",
        alt: "Minimalist Organic Glass Form",
        aspectRatio: 0.720,
        parallax: 0.5,
        offsetClass: "offset-down-md",
      },
    ],
  },

  // 10. Chasm Dialogue — Opposing Tall Vertical Plates Across Wide Negative Space
  {
    id: "spread-10",
    type: "duo",
    variant: "chasm-dialogue",
    items: [
      {
        id: "item-13",
        src: `${BASE_PATH}/image-13.webp`,
        type: "image",
        alt: "Tactile Surface Study",
        aspectRatio: 0.769,
        parallax: -0.5,
      },
      {
        id: "item-19",
        src: `${BASE_PATH}/image-19.webp`,
        type: "image",
        alt: "Vertical Gradient Form",
        aspectRatio: 0.562,
        parallax: 0.5,
      },
    ],
  },

  // 11. Kinetic Dual Rhythm — Prismatic Wave & Optical Light Loop
  {
    id: "spread-11",
    type: "duo",
    variant: "balanced",
    items: [
      {
        id: "item-15-vid",
        src: `${BASE_PATH}/video-04.mp4`,
        type: "video",
        alt: "Optical Dynamic Light Loop",
        aspectRatio: 1.463,
        parallax: -0.5,
      },
      {
        id: "item-16-vid",
        src: `${BASE_PATH}/video-05.mp4`,
        type: "video",
        alt: "Prismatic Wave Motion",
        aspectRatio: 1.333,
        parallax: 0.5,
        offsetClass: "offset-down-sm",
      },
    ],
  },

  // 12. Concrete Geometry & Warm Desert Horizon Plate
  {
    id: "spread-12",
    type: "duo",
    variant: "asymmetric-right",
    items: [
      {
        id: "item-20-img",
        src: `${BASE_PATH}/image-08.webp`,
        type: "image",
        alt: "Raw Concrete Geometry",
        aspectRatio: 0.836,
        parallax: -0.5,
      },
      {
        id: "item-21-img",
        src: `${BASE_PATH}/image-09.webp`,
        type: "image",
        alt: "Warm Desert Horizon Plate",
        aspectRatio: 1.600,
        parallax: 0.5,
        offsetClass: "offset-down-sm",
      },
    ],
  },

  // 13. Minimalist Intimate Solitude — Architectural Spire (Anchored)
  {
    id: "spread-13",
    type: "single",
    variant: "intimate",
    items: [
      {
        id: "item-22",
        src: `${BASE_PATH}/image-10.webp`,
        type: "image",
        alt: "Grand Editorial Spire Monolith",
        aspectRatio: 0.462,
        parallax: 0,
      },
    ],
  },

  // 14. Luxury Finale Duet — Sculptural Tension & Minimalist Geometry
  {
    id: "spread-14",
    type: "duo",
    variant: "asymmetric-right",
    items: [
      {
        id: "item-23",
        src: `${BASE_PATH}/image-15.webp`,
        type: "image",
        alt: "Sculptural Tension Plate",
        aspectRatio: 0.800,
        parallax: -0.5,
        offsetClass: "offset-down-sm",
      },
      {
        id: "item-24",
        src: `${BASE_PATH}/image-20.webp`,
        type: "image",
        alt: "Minimalist Geometry Finale",
        aspectRatio: 0.721,
        parallax: 0.5,
      },
    ],
  },
];
