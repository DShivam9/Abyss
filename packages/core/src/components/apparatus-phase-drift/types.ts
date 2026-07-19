import { VesselComponentProps } from "../../engine/types";

export interface ApparatusPhaseDriftProps extends VesselComponentProps {
  /**
   * List of image URLs to display in the scrolling column.
   * If not provided, will default to a set of premium gallery images.
   */
  images?: string[];

  /**
   * Normalized scroll progress (0 to 1).
   * Passed dynamically by the scroll runway/Lenis container.
   */
  scrollProgress?: number;

  /**
   * Horizontal offset amplitude in pixels.
   * Controls the maximum lateral drift distance.
   * @default 60
   */
  amplitude?: number;

  /**
   * Wave number. Controls how many items fit in one wave cycle.
   * @default 2
   */
  waveNumber?: number;

  /**
   * Speed of wave propagation relative to scroll.
   * @default 2
   */
  speed?: number;

  /**
   * Aspect ratio of the images (e.g. "3/4", "16/9").
   * @default "3/4"
   */
  aspectRatio?: string;

  /**
   * Width of the images in pixels.
   * @default 160
   */
  imageWidth?: number;
}
