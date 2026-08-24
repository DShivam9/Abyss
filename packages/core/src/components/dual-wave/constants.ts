import { DualWaveItem } from "./types";

// 24 unique single-word aesthetic visual, motion, color, and optics titles (zero duplicates)
export const DEFAULT_ITEMS: DualWaveItem[] = [
  { id: "01", name: "LUSTER", imageSrc: "/images/components images/scroll/cosmos_1309660817.webp" },
  { id: "02", name: "RADIANCE", imageSrc: "/images/components images/scroll/cosmos_1859262512.webp" },
  { id: "03", name: "SPECTRUM", imageSrc: "/images/components images/scroll/cosmos_2063063057.webp" },
  { id: "04", name: "ROTATION", imageSrc: "/images/components images/scroll/cosmos_679994644.webp" },
  { id: "05", name: "AURORA", imageSrc: "/images/components images/scroll/cosmos_1244425812.webp" },
  { id: "06", name: "EXPOSURE", imageSrc: "/images/components images/scroll/cosmos_1994819013.webp" },
  { id: "07", name: "SOLSTICE", imageSrc: "/images/components images/scroll/cosmos_2086495860.webp" },
  { id: "08", name: "CHROMATIC", imageSrc: "/images/components images/scroll/cosmos_51259133.webp" },
  { id: "09", name: "KINETIC", imageSrc: "/images/components images/scroll/cosmos_586109684.webp" },
  { id: "10", name: "HARMONY", imageSrc: "/images/components images/scroll/cosmos_1452408749.webp" },
  { id: "11", name: "IRIDESCENCE", imageSrc: "/images/components images/scroll/cosmos_1298955025.webp" },
  { id: "12", name: "TRANSITION", imageSrc: "/images/components images/scroll/cosmos_2093433371.webp" },
  { id: "13", name: "PERSPECTIVE", imageSrc: "/images/components images/scroll/cosmos_520815919.webp" },
  { id: "14", name: "APERTURE", imageSrc: "/images/components images/scroll/cosmos_666194661.webp" },
  { id: "15", name: "GRADIENT", imageSrc: "/images/components images/scroll/cosmos_961582572.webp" },
  { id: "16", name: "SILHOUETTE", imageSrc: "/images/components images/scroll/cosmos_1067833670.webp" },
  { id: "17", name: "VELOCITY", imageSrc: "/images/components images/scroll/cosmos_1207399578.webp" },
  { id: "18", name: "REFLECTION", imageSrc: "/images/components images/scroll/cosmos_1215932660.webp" },
  { id: "19", name: "ECLIPSE", imageSrc: "/images/components images/scroll/cosmos_169178344.webp" },
  { id: "20", name: "RESONANCE", imageSrc: "/images/components images/scroll/cosmos_496247602.webp" },
  { id: "21", name: "OPAL", imageSrc: "/images/components images/scroll/cosmos_1225764898.webp" },
  { id: "22", name: "PRISMATIC", imageSrc: "/images/components images/scroll/cosmos_1556080729.webp" },
  { id: "23", name: "HALO", imageSrc: "/images/components images/scroll/cosmos_1633231397.webp" },
  { id: "24", name: "CELESTIAL", imageSrc: "/images/components images/scroll/cosmos_1872135509.webp" },
];

// Baked defaults for refined wave path optics
export const BAKED_HORIZON_CURVATURE = 0.60;
export const BAKED_CORNER_ALIGNMENT = 1.0;
export const BAKED_DUAL_SINE_WAVENUM = 0.45;
export const BAKED_COLUMN_LAG = 0.40;
export const BAKED_VELOCITY_SQUEEZE = 0.85;
