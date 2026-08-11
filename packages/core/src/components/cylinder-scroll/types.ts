import { VesselComponentProps } from "../../engine/types";

export interface ApparatusCylinderScrollProps extends VesselComponentProps {
  /**
   * List of image URLs to display in the cylinder scroll.
   * Defaults to a premium collection if empty.
   */
  images?: string[];

  /**
   * Optional scroll progress (0 to 1) from parent container.
   */
  scrollProgress?: number;
}
