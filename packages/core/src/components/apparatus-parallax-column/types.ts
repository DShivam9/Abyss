import { VesselComponentProps } from "../../engine/types";

export interface ApparatusParallaxColumnProps extends VesselComponentProps {
  /**
   * List of images for Left Column.
   */
  leftImages?: string[];

  /**
   * List of images for Right Column.
   */
  rightImages?: string[];

  /**
   * Normalized scroll progress (0 to 1).
   * @default 0
   */
  scrollProgress?: number;
}
