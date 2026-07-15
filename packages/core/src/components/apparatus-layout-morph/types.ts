import { VesselComponentProps } from "../../engine/types";

export interface ApparatusLayoutMorphProps extends VesselComponentProps {
  /**
   * List of card image URLs.
   */
  images?: string[];

  /**
   * List of card titles.
   */
  titles?: string[];

  /**
   * Scroll progress value passed from external canvas scroll tracking (0 to 1).
   */
  scrollProgress?: number;

  /**
   * Number of cards to display.
   * @default 6
   */
  cardCount?: 4 | 6 | 9;

  /**
   * Enable/disable directional rotation (travel momentum tilt) during morphing.
   * @default true
   */
  travelRotation?: boolean;

  /**
   * Morph easing curve.
   * @default "power2"
   */
  morphEasing?: "linear" | "power1" | "power2";

  /**
   * Morph keyframes layout sequence.
   * @default "constellation-wedge-orbit-river"
   */
  layoutSequence?: "constellation-wedge-orbit-river" | "river-orbit-wedge-constellation";

  /**
   * Perspective value for 3D depth effects.
   * @default 1000
   */
  perspective?: number;
}
