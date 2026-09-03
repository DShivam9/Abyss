import { VesselComponentProps } from "../../engine/types";

export interface CinemaAisleProps extends VesselComponentProps {
  /**
   * Array of video source URLs to stream in the aisle corridor.
   * Defaults to 16 curated high-definition MP4 streams.
   */
  videos?: string[];

  /**
   * Parabolic flare curvature of the aisle walls (0.0 straight to 10.0 deep curve).
   * @default 6.2
   */
  curveFlare?: number;

  /**
   * Navigation scroll speed multiplier (0.5x to 2.0x).
   * @default 1.0
   */
  scrollSpeed?: number;

  /**
   * Obsidian floor reflection sheen opacity (0.0 pitch void to 1.0 high-gloss satin).
   * @default 0.88
   */
  reflectionSheen?: number;

  /**
   * Lateral corridor width between the left and right video walls (2.4 intimate tunnel to 5.2 wide hall).
   * @default 3.5
   */
  corridorWidth?: number;

  /**
   * Ambient auto-drift tracking speed (0.0 paused to 4.0 fast cruise).
   * @default 2.0
   */
  driftSpeed?: number;

  /**
   * Optional title displayed in the cinematic font at top-center.
   * @default "Cinema Aisle"
   */
  title?: string;
}
