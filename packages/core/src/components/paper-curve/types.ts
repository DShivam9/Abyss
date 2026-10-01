import type React from "react";
import { AbyssComponentProps } from "../../engine/types";

export type MediaKind = "image" | "video";

export interface SpreadItem {
  id: string;
  src?: string;
  type: MediaKind;
  alt?: string;
  aspectRatio: number; // width / height
  maxWidth?: number;
  parallax?: number; // Differential scroll speed (e.g. -0.3 to +0.3)
  offsetClass?:
    | "offset-down-sm"
    | "offset-down-md"
    | "offset-down-lg"
    | "offset-up-sm"
    | "offset-up-md";
}

export interface SpreadGroup {
  id: string;
  type: "single" | "duo" | "triptych";
  variant?:
    | "hero"
    | "wide"
    | "intimate"
    | "align-right"
    | "align-left"
    | "asymmetric-left"
    | "asymmetric-right"
    | "balanced"
    | "chasm-dialogue"
    | "corner-touch"
    | "tight-diptych"
    | "triptych-stagger";
  items: SpreadItem[];
}

export interface PaperCurveControls {
  // Human-friendly editorial controls
  curvature?: number;
  momentumFlex?: number;
  depthParallax?: number;
  exitCurl?: number;

  // Legacy aliases (optional)
  baseCurve?: number;
  distance?: number;
  velocityBoost?: number;
  spanCamber?: number;
  exitArc?: number;
  blurIntensity?: number;
  parallaxScale?: number;
}

export interface PaperCurveProps extends AbyssComponentProps, PaperCurveControls {
  title?: string;
  subtitle?: string;
  tag?: string;
  scrollCue?: string;
  spreads?: SpreadGroup[];
  className?: string;
  style?: React.CSSProperties;
}
