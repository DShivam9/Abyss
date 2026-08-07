/**
 * Abyss Core Motion & Easing Engine
 * Component-level motion constants — used inside Vessel components.
 * Standardized spring physics, bezier easing curves, and frame-rate independent damping formulas.
 */

// ─── Easing Curves (Arrays for Framer Motion / GSAP, Strings for CSS) ───
export const EASE_ABYSS = [0.16, 1, 0.3, 1] as const;
export const EASE_HEAVY = [0.33, 1, 0.68, 1] as const;
export const EASE_SNAP = [0.22, 1, 0.36, 1] as const;
export const EASE_BREATHE = [0.4, 0, 0.2, 1] as const;
export const EASE_LIFT = [0.0, 0, 0.2, 1] as const;
export const EASE_DROP = [0.4, 0, 1, 1] as const;

export const EASE_STRINGS = {
  abyss: "cubic-bezier(0.16, 1, 0.3, 1)",
  heavy: "cubic-bezier(0.33, 1, 0.68, 1)",
  snap: "cubic-bezier(0.22, 1, 0.36, 1)",
  breathe: "cubic-bezier(0.4, 0, 0.2, 1)",
  lift: "cubic-bezier(0.0, 0, 0.2, 1)",
  drop: "cubic-bezier(0.4, 0, 1, 1)",
} as const;

// ─── Spring Physics Configurations ───
export const SPRING_BUTTON = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
} as const;

export const SPRING_CARD = {
  type: "spring",
  stiffness: 300,
  damping: 28,
  mass: 1.0,
} as const;

export const SPRING_PANEL = {
  type: "spring",
  stiffness: 200,
  damping: 25,
  mass: 1.2,
} as const;

export const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 150,
  damping: 22,
  mass: 1.5,
} as const;

export const SPRING_SCROLL = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 1.0,
} as const;

/**
 * Frame-rate independent exponential damp formula (§3.2 of Abyss contract).
 * Eliminates 1:1 raw lerp tracking and mechanical frame rate dependence.
 */
export function dampedLerp(
  current: number,
  target: number,
  dampFactor: number = 0.08,
  deltaTimeSeconds: number = 0.016
): number {
  const smoothFactor = 1 - Math.pow(1 - dampFactor, deltaTimeSeconds * 60);
  return current + (target - current) * smoothFactor;
}
