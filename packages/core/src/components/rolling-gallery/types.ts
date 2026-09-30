import type React from "react";
import { AbyssComponentProps } from "../../engine/types";

export type MediaKind = "image" | "video";

export interface SpreadItem {
  id: string;
  src: string;
  type: MediaKind;
  alt: string;
  aspectRatio: number; // width / height
  maxWidth?: number;
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
    | "triptych-stagger";
  items: SpreadItem[];
}

export interface RollingGalleryControls {
  baseCurve?: number;
  distance?: number;
  velocityBoost?: number;
  spanCamber?: number;
  exitArc?: number;
}

export interface RollingGalleryProps extends AbyssComponentProps, RollingGalleryControls {
  spreads?: SpreadGroup[];
  className?: string;
  style?: React.CSSProperties;
}
