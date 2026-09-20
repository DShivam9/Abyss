import { DualWaveItem } from "./types";

const TITLES = [
  "TESFAYE", "BRUCE LEE", "CARRERA", "ICHIGO", "TRAVIS", "COSMOS",
  "SHADOW", "DRIFT", "ARCHIVE", "NOIR", "CYBERPUNK", "CHRONO",
  "ECLIPSE", "RONIN", "MONOLITH", "SPECTRUM", "VANGUARD", "RESONANCE",
  "KINETIC", "APERTURE", "SOPHIE", "PARALLAX", "MIRAGE", "INFINITY"
];

export const DEFAULT_ITEMS: DualWaveItem[] = TITLES.map((name, idx) => ({
  id: String(idx + 1).padStart(2, "0"),
  name,
  imageSrc: `/images/components/dual-wave/image-${String((idx % 21) + 1).padStart(2, "0")}.webp`,
}));

// Baked defaults for refined wave path optics
export const BAKED_HORIZON_CURVATURE = 0.60;
export const BAKED_CORNER_ALIGNMENT = 1.0;
export const BAKED_COLUMN_LAG = 0.40;
export const BAKED_VELOCITY_SQUEEZE = 0.85;
