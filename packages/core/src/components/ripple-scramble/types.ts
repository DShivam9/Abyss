import { VesselComponentProps } from "../../engine/types";

export type RippleScrambleVariant =
  | "classic"
  | "editorial"
  | "matrix"
  | "nebula";

/** @deprecated Use `RippleScrambleVariant` */
export type ApparatusRippleVariant = RippleScrambleVariant;

export interface RippleScrambleProps extends VesselComponentProps {
  variant?: RippleScrambleVariant;
  /**
   * Radial expansion speed in px/s.
   * @default 950
   */
  waveSpeed?: number;
  /**
   * Scramble hold duration in ms.
   * @default 340
   */
  scrambleDuration?: number;
  /**
   * Base typographic font size in px.
   * @default 20
   */
  fontSize?: number;
  /**
   * Line height scale multiplier.
   * @default 1.65
   */
  lineHeightScale?: number;
  /**
   * Resting text field opacity.
   * @default 0.32
   */
  staticOpacity?: number;
}

/** @deprecated Use `RippleScrambleProps` */
export type ApparatusRippleScrambleProps = RippleScrambleProps;

export interface WaveInstance {
  cx: number;
  cy: number;
  radius: number;
  startTime: number;
}

export interface CharNode {
  char: string;
  x: number;
  y: number;
  scrambleUntil: number;
}
