import { VesselComponentProps } from "../../engine/types";

export type ApparatusRippleVariant =
  | "classic"
  | "editorial"
  | "matrix"
  | "nebula";

export interface ApparatusRippleScrambleProps extends VesselComponentProps {
  variant?: ApparatusRippleVariant;
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
