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

  /**
   * Width of the Gaussian swell in pixels.
   * @default 350
   */
  baseSigma?: number;

  /**
   * Maximum blur in pixels for off-focus items (0 to 24px).
   * @default 2
   */
  maxBlur?: number;

  /**
   * Gap spacing between cards in pixels.
   * @default 28
   */
  cardGap?: number;

  /**
   * 3D cylindrical bend factor (0 to 100).
   * @default 0
   */
  pathBend?: number;
}
