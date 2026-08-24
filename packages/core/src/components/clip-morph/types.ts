import { VesselComponentProps } from "../../engine/types";

export interface ApparatusClipMorphProps extends VesselComponentProps {
  /**
   * Normalized scroll progress (0 to 1).
   * Passed dynamically by the scroll runway/Lenis container.
   */
  scrollProgress?: number;

  /**
   * Callback fired when scroll progress is scrubbed internally in the HUD.
   */
  onScrollProgressChange?: (progress: number) => void;

  /**
   * Additional images to transition between.
   * If not provided, will default to a set of premium transition images.
   */
  images?: string[];

  /**
   * Transition duration in seconds.
   * @default 1.6
   */
  duration?: number;

  /**
   * Easing function or string.
   * @default "vessel"
   */
  ease?: string;

  /**
   * Maximum rotation angle of the star in degrees.
   * @default 180
   */
  customRotation?: number;

  /**
   * Star scale bleed factor.
   * @default 40
   */
  customBleed?: number;

  /**
   * Noise grain intensity overlay (0 to 100).
   * @default 25
   */
  customGrain?: number;
}
