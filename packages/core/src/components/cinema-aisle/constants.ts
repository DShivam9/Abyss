export const DEFAULT_VIDEOS: string[] = Array.from({ length: 16 }, (_, i) =>
  `/videos/components/runway-corridor/clip-${String(i + 1).padStart(2, '0')}.mp4`
);

export const BASE_PROPORTIONS = [
  { w: 2.2, h: 2.9 },
  { w: 2.8, h: 2.1 },
  { w: 2.0, h: 2.7 },
  { w: 2.6, h: 3.3 },
  { w: 2.5, h: 2.5 }
];

export const CORRIDOR_CONFIG = {
  BASE_WALL_X: 3.5,
  TOTAL_COLUMNS: 22,
  Z_STEP: 2.4,
  FRONT_WRAP: 8,
  FLOOR_Y: -2.60,
  FOG_DENSITY: 0.034,
  INTRO_DURATION: 3800,
  SURGE_START_Z: -58.0
};
