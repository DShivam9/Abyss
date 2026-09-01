import { MosaicSlotPosition } from "./types";

export const DEFAULT_IMAGES: string[] = Array.from({ length: 24 }, (_, i) =>
  `/images/components/mosaic-loader/photo-${String(i + 1).padStart(2, "0")}.webp`
);

export const DEFAULT_EDITORIAL_LINES: string[] = [
  "WHITE PHANTOM",
  "MIDNIGHT COUNTACH",
  "RONIN IN EMBERS",
  "ALPINE DRIFT",
  "AFTER HOURS",
  "UTOPIA FREQUENCY"
];

export const DEFAULT_EDITORIAL_IMAGES: string[] = [
  "/images/components/mosaic-loader/editorial-01.webp",
  "/images/components/mosaic-loader/editorial-02.webp",
  "/images/components/mosaic-loader/editorial-03.webp",
  "/images/components/mosaic-loader/editorial-04.webp",
  "/images/components/mosaic-loader/editorial-05.webp",
  "/images/components/mosaic-loader/editorial-06.webp"
];

export const POSITIONS: MosaicSlotPosition[] = [
  // Row 0 (Top: 4 cards)
  { xPct: 8.0,  yPct: 11, w: 104, h: 152, rot: 0, depthFactor: 0.6,  spawnDelay: 0,    initialIdx: 0  },
  { xPct: 34.0, yPct: 11, w: 148, h: 106, rot: 0, depthFactor: 1.3,  spawnDelay: 100,  initialIdx: 12 },
  { xPct: 66.0, yPct: 11, w: 118, h: 118, rot: 0, depthFactor: 1.0,  spawnDelay: 200,  initialIdx: 2  },
  { xPct: 92.0, yPct: 11, w: 96,  h: 164, rot: 0, depthFactor: 1.4,  spawnDelay: 300,  initialIdx: 14 },

  // Row 1 (Upper-mid: 4 cards)
  { xPct: 18.0, yPct: 31, w: 114, h: 144, rot: 0, depthFactor: 1.5,  spawnDelay: 420,  initialIdx: 3  },
  { xPct: 42.0, yPct: 28, w: 152, h: 104, rot: 0, depthFactor: 0.8,  spawnDelay: 520,  initialIdx: 21 },
  { xPct: 58.0, yPct: 28, w: 118, h: 118, rot: 0, depthFactor: 0.8,  spawnDelay: 620,  initialIdx: 17 },
  { xPct: 82.0, yPct: 31, w: 104, h: 152, rot: 0, depthFactor: 1.4,  spawnDelay: 720,  initialIdx: 7  },

  // Row 2 (Flanks: 2 cards)
  { xPct: 6.5,  yPct: 50, w: 146, h: 108, rot: 0, depthFactor: 0.7,  spawnDelay: 820,  initialIdx: 20 },
  { xPct: 93.5, yPct: 50, w: 96,  h: 164, rot: 0, depthFactor: 0.7,  spawnDelay: 920,  initialIdx: 16 },

  // Row 3 (Lower-mid: 4 cards)
  { xPct: 18.0, yPct: 69, w: 104, h: 152, rot: 0, depthFactor: 1.2,  spawnDelay: 1020, initialIdx: 9  },
  { xPct: 42.0, yPct: 72, w: 118, h: 118, rot: 0, depthFactor: 0.9,  spawnDelay: 1120, initialIdx: 1  },
  { xPct: 58.0, yPct: 72, w: 114, h: 144, rot: 0, depthFactor: 0.9,  spawnDelay: 1220, initialIdx: 4  },
  { xPct: 82.0, yPct: 69, w: 104, h: 152, rot: 0, depthFactor: 1.3,  spawnDelay: 1320, initialIdx: 19 },

  // Row 4 (Bottom: 4 cards)
  { xPct: 8.0,  yPct: 89, w: 114, h: 144, rot: 0, depthFactor: 1.3,  spawnDelay: 1420, initialIdx: 8  },
  { xPct: 34.0, yPct: 89, w: 118, h: 118, rot: 0, depthFactor: 0.6,  spawnDelay: 1520, initialIdx: 6  },
  { xPct: 66.0, yPct: 89, w: 104, h: 152, rot: 0, depthFactor: 1.4,  spawnDelay: 1620, initialIdx: 22 },
  { xPct: 92.0, yPct: 89, w: 114, h: 144, rot: 0, depthFactor: 1.0,  spawnDelay: 1720, initialIdx: 11 }
];

