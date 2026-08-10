import { VesselComponentProps } from "../../engine/types";

export interface ApparatusScrollTextRevealProps extends VesselComponentProps {
  /**
   * Title text displayed in Section 1.
   * @default "APPARATUS SCROLL TEXT REVEAL"
   */
  title?: string;
  /**
   * Subtitle text displayed in Section 1.
   * @default "Scroll Down"
   */
  subtitle?: string;
  /**
   * Scroll reveal speed multiplier.
   * @default 1.0
   */
  speed?: number;
  /**
   * Stagger delay between text elements in seconds.
   * @default 0.05
   */
  stagger?: number;
}
