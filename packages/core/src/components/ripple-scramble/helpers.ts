import { ApparatusRippleVariant } from "./types";
import {
  ALPHA_CHARS,
  MATRIX_CHARS,
  EDITORIAL_CHARS,
  NEBULA_CHARS,
  ALPHA_STR_TABLE,
} from "./constants";

/**
 * Pure helper function for distinct variant-specific design specifications.
 */
export function getVariantSpecs(variant: ApparatusRippleVariant, staticOpacity: number) {
  const opIdx = Math.min(100, Math.max(0, Math.floor(staticOpacity * 100)));
  const alphaStr = ALPHA_STR_TABLE[opIdx];

  switch (variant) {
    case "editorial":
      return {
        bg: "#0a0a0c",
        rgbBg: [10, 10, 12],
        staticColor: `rgba(180, 180, 185, ${alphaStr})`,
        decayColor: (alpha: string) => `rgba(235, 235, 240, ${alpha})`,
        flareColor: (intensity: number) => {
          const idx = Math.min(100, Math.max(0, Math.floor((0.75 + intensity * 0.25) * 100)));
          return `rgba(223, 177, 91, ${ALPHA_STR_TABLE[idx]})`;
        },
        chars: EDITORIAL_CHARS,
        fontFamily: "Geist, system-ui, -apple-system, sans-serif",
      };
    case "matrix":
      return {
        bg: "#030704",
        rgbBg: [3, 7, 4],
        staticColor: `rgba(34, 197, 94, ${alphaStr})`,
        decayColor: (alpha: string) => `rgba(134, 239, 172, ${alpha})`,
        flareColor: (intensity: number) => {
          if (intensity > 0.82) return "#f0fdf4"; // Electric White Leader Tip
          const idx = Math.min(100, Math.max(0, Math.floor((0.75 + intensity * 0.25) * 100)));
          return `rgba(74, 222, 128, ${ALPHA_STR_TABLE[idx]})`;
        },
        chars: MATRIX_CHARS,
        fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
      };
    case "nebula":
      return {
        bg: "#06040b",
        rgbBg: [6, 4, 11],
        staticColor: `rgba(167, 139, 250, ${alphaStr})`,
        decayColor: (alpha: string) => `rgba(216, 180, 254, ${alpha})`,
        flareColor: (intensity: number) => {
          const idx = Math.min(100, Math.max(0, Math.floor((0.75 + intensity * 0.25) * 100)));
          return `rgba(192, 132, 252, ${ALPHA_STR_TABLE[idx]})`;
        },
        chars: NEBULA_CHARS,
        fontFamily: "Geist, system-ui, -apple-system, sans-serif",
      };
    case "classic":
    default:
      return {
        bg: "#070708",
        rgbBg: [7, 7, 8],
        staticColor: `rgba(161, 161, 170, ${alphaStr})`,
        decayColor: (alpha: string) => `rgba(225, 225, 230, ${alpha})`,
        flareColor: (intensity: number) => {
          const idx = Math.min(100, Math.max(0, Math.floor((0.6 + intensity * 0.4) * 100)));
          return `rgba(255, 255, 255, ${ALPHA_STR_TABLE[idx]})`;
        },
        chars: ALPHA_CHARS,
        fontFamily: "Geist, system-ui, -apple-system, sans-serif",
      };
  }
}

/**
 * Pure helper function for distinct wave propagation geometries.
 */
export function getWaveDistance(dx: number, dy: number, variant: ApparatusRippleVariant): number {
  switch (variant) {
    case "editorial": {
      const edDx = Math.abs(dx);
      if (edDx > 480) return 999999;
      return Math.abs(dy) + Math.pow(edDx / 480, 1.8) * 80;
    }
    case "matrix": {
      const colDist = Math.abs(dx);
      if (colDist > 260) return 999999;
      const colOffset = Math.pow(colDist / 260, 1.6) * 120;
      return dy < -colOffset ? 999999 : (dy + colOffset) * 1.15;
    }
    case "nebula":
      return Math.abs(dx) + Math.abs(dy);
    case "classic":
    default:
      return Math.hypot(dx, dy);
  }
}
