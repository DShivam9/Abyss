/**
 * Phase 1: Static accent colors per showcase slot and section.
 * Phase 2: Replaced by runtime extraction via node-vibrant.
 */
export const SHOWCASE_ACCENTS = [
  { name: "Deep Cobalt",     hex: "#1E4FD6" },
  { name: "Warm Terracotta",  hex: "#C45A3C" },
  { name: "Aged Gold",        hex: "#B8892E" },
  { name: "Forest",           hex: "#1A6B42" },
  { name: "Dusty Violet",     hex: "#6B3A93" },
  { name: "Slate Steel",      hex: "#4A5568" },
] as const;

export const STACK_ACCENT = "#B8892E"; // Aged Gold for the stack manifest section
export const FOOTER_ACCENT = "#1E4FD6"; // Deep Cobalt for the footer
