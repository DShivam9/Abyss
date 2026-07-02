import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

// Register CustomEase if in browser environment
if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
  CustomEase.create("vessel", "0.16, 1, 0.3, 1");
}

export const VESSEL_CURVE = "cubic-bezier(0.16, 1, 0.3, 1)";

export const VESSEL_SPRING = { type: "spring" as const, stiffness: 300, damping: 30, mass: 1 };
export const TEXT_ENTRANCE_SPRING = { type: "spring" as const, stiffness: 80, damping: 14, mass: 1 };
export const HOVER_SPRING = { type: "spring" as const, stiffness: 400, damping: 25, mass: 0.8 };
export const CURSOR_SPRING = { type: "spring" as const, stiffness: 200, damping: 20, mass: 0.5 };
export const SETTLE_SPRING = { type: "spring" as const, stiffness: 120, damping: 12, mass: 1.2 };
