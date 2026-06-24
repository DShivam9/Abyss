// Easing curves used across the project
export const EASE = {
  // The primary cinematic easing (matches --ease-smooth CSS variable)
  smooth: [0.32, 0.72, 0, 1] as const,
  // Sharp editorial wipe
  wipe: [0.76, 0, 0.24, 1] as const,
  // Magnetic attraction
  magnetic: [0.25, 1, 0.5, 1] as const,
  // Reveal timing
  reveal: [0.16, 1, 0.3, 1] as const,
} as const;

// Duration presets (in seconds)
export const DURATION = {
  fast: 0.3,
  medium: 0.8,
  slow: 1.2,
  cinematic: 1.6,
} as const;

// Stagger presets
export const STAGGER = {
  tight: 0.03,
  normal: 0.06,
  relaxed: 0.1,
  character: 0.02,
} as const;
