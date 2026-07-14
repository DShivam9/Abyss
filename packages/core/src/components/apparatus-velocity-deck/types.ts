import { VesselComponentProps } from "../../engine/types";

export interface ApparatusVelocityDeckProps extends VesselComponentProps {
  /**
   * List of image URLs to display. (Default 5 built-in cosmos images)
   */
  images?: string[];

  /**
   * Normalized scroll progress (0 to 1).
   * @default 0
   */
  scrollProgress?: number;
}
