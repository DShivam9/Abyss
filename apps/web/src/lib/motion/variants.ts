import { Variants } from "framer-motion";
import { TEXT_ENTRANCE_SPRING, VESSEL_SPRING } from "./easing";

/** Stagger container — wrap children that use item variants. */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/** Fade + slide up from 30px. */
export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TEXT_ENTRANCE_SPRING,
  },
};

/** Masked reveal — for text inside overflow:hidden containers. */
export const maskReveal: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { ...VESSEL_SPRING, duration: 0.8 },
  },
};

/** Spring mount — snappy appear. */
export const springMount: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: VESSEL_SPRING,
  },
};

/** Character stagger — for nav hover effects. */
export const charStagger: Variants = {
  idle: {},
  hover: {
    transition: { staggerChildren: 0.02 },
  },
};

export const charVariant: Variants = {
  idle: { color: "inherit" },
  hover: {
    color: "var(--vessel-accent-current)",
    transition: { type: "spring", stiffness: 400, damping: 25, mass: 0.8 },
  },
};
