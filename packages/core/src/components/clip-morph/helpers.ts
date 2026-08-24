import { STAR_KEYFRAME } from "./constants";

/**
 * Helper to calculate clip path polygon string for the kinetic star.
 */
export const getClipPathString = (progress: number, maxRotation: number): string => {
  const p = Math.max(0, Math.min(1, progress));
  if (p === 0) return "none"; // Full bleed resting state

  // Scale the star from 4.5 (full bleed outside screen) to 0.0 (collapse to center)
  const s = (1 - p) * 4.5;

  // Rotate star as it morphs/collapses
  const angleRad = (p * maxRotation) * (Math.PI / 180);
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  const pts = STAR_KEYFRAME.map((pt) => {
    const dx = pt.x - 50;
    const dy = pt.y - 50;
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    return {
      x: 50 + rx * s,
      y: 50 + ry * s
    };
  });

  return `polygon(${pts.map(pt => `${pt.x.toFixed(2)}% ${pt.y.toFixed(2)}%`).join(", ")})`;
};
