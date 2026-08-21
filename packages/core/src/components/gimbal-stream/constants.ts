import { TierConfig } from "./types";

export const IMAGE_LIST: string[] = [
  "/images/components/gimbal-stream/1.webp",
  "/images/components/gimbal-stream/2.webp",
  "/images/components/gimbal-stream/3.webp",
  "/images/components/gimbal-stream/4.webp",
  "/images/components/gimbal-stream/5.webp",
  "/images/components/gimbal-stream/6.webp",
  "/images/components/gimbal-stream/7.webp",
  "/images/components/gimbal-stream/8.webp",
  "/images/components/gimbal-stream/9.webp",
  "/images/components/gimbal-stream/10.webp",
  "/images/components/gimbal-stream/11.webp",
  "/images/components/gimbal-stream/12.webp",
  "/images/components/gimbal-stream/13.webp",
  "/images/components/gimbal-stream/14.webp",
  "/images/components/gimbal-stream/15.webp",
  "/images/components/gimbal-stream/16.webp",
  "/images/components/gimbal-stream/17.webp",
  "/images/components/gimbal-stream/18.webp",
  "/images/components/gimbal-stream/19.webp",
  "/images/components/gimbal-stream/20.webp",
  "/images/components/gimbal-stream/21.webp",
  "/images/components/gimbal-stream/22.webp",
  "/images/components/gimbal-stream/23.webp",
  "/images/components/gimbal-stream/24.webp"
];

export const CARD_TITLES: string[] = [
  "CHRONICLE",
  "ICHIGO",
  "VINTAGE BMW",
  "ZANGETSU",
  "NIGHT COSMOS",
  "HOLLOW",
  "FLAME FIST",
  "WHITE BLOOM",
  "FUTURE POSTER",
  "GREGO BUST",
  "GRIMMJOW",
  "HORSE RIDER",
  "WILD HORSES",
  "SUMMER BLONDE",
  "MONOCHROME DUSK",
  "DARK KNIGHT",
  "MERRIGONG THEATRE",
  "NIGHT SHADOW",
  "OIL PAINTING",
  "EDITORIAL POSTER",
  "CINEMATIC PORTRAIT",
  "ROMAN BUST",
  "VINTAGE STAMP",
  "RENJI ABARAI"
];

export const TIER_IMAGE_INDICES: number[][] = [
  [0, 7, 14, 21, 4, 11, 18, 1, 8, 15, 22, 5],
  [12, 19, 2, 9, 16, 23, 6, 13, 20, 3, 10, 17],
  [10, 1, 23, 15, 7, 2, 18, 11, 4, 20, 12, 17],
  [22, 13, 5, 16, 8, 0, 17, 9, 3, 19, 14, 6],
  [3, 18, 9, 23, 12, 1, 15, 6, 21, 10, 2, 13]
];

export const TIER_CONFIGS: TierConfig[] = [
  { startY: -66.88, baseY: -308.0, speedMultiplier: 1.0, tiltX: 0.44, tiltZ: 0.19, direction: 1, phaseOffset: 0.0 },
  { startY: -33.44, baseY: -154.0, speedMultiplier: -1.0, tiltX: -0.39, tiltZ: -0.24, direction: -1, phaseOffset: 1.256 },
  { startY: 0.0,    baseY: 0.0,    speedMultiplier: 1.0, tiltX: 0.24, tiltZ: 0.34, direction: 1, phaseOffset: 2.513 },
  { startY: 33.44,  baseY: 154.0,  speedMultiplier: -1.0, tiltX: -0.44, tiltZ: 0.19, direction: -1, phaseOffset: 3.769 },
  { startY: 66.88,  baseY: 308.0,  speedMultiplier: 1.0, tiltX: 0.39, tiltZ: -0.29, direction: 1, phaseOffset: 5.026 }
];

export const GIMBAL_LAYOUT = {
  tierSpacingY: 154.0,
  uniformCards: 12,
  cardWidth: 24.64,
  cardHeight: 33.44,
  closedRadius: 47.60,
  openRadius: 118.80,
  cylinderRadius: 1050,
  cylinderHeight: 3000,
  explodeThreshold: 280.0
};
