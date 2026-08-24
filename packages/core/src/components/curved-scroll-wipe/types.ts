import { VesselComponentProps } from "../../engine/types";

export interface ApparatusCurvedScrollWipeProps extends VesselComponentProps {
  /**
   * Curve sag intensity (0.05 - 0.45).
   * @default 0.28
   */
  curveDepth?: number;
  /**
   * Scroll sensitivity multiplier (0.5 - 2.0).
   * @default 1.0
   */
  scrollSpeed?: number;
}
