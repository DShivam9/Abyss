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

  /**
   * Motion interaction variant ("classic" window parallax, 3d "cylinder" concave, or 3d "convex" bulge).
   * @default "classic"
   */
  motionVariant?: "classic" | "cylinder" | "convex";

  /**
   * Inner image window parallax movement intensity (0 to 100).
   * @default 60
   */
  parallaxIntensity?: number;

  /**
   * Corner border radius in pixels.
   * @default 8
   */
  borderRadius?: number;

  /**
   * Column Gap Spacing in pixels.
   * @default 4
   */
  columnGap?: number;

  /**
   * Vertical Image Gap in pixels.
   * @default 4
   */
  imageGap?: number;
}
