import { VesselComponentProps } from "../../engine/types";

export interface FocusRingItem {
  id: string;
  name: string;
  imageSrc: string;
}

export interface ApparatusFocusRingProps extends VesselComponentProps {
  /**
   * Array of focus ring items with names and images.
   */
  items?: FocusRingItem[];

  /**
   * Sensitivity of the drag rotation.
   * @default 0.005
   */
  sensitivity?: number;

  /**
   * Friction of momentum decay (0.9 to 0.99).
   * @default 0.95
   */
  friction?: number;

  /**
   * Focus position on the ellipse path.
   * "bottom" places focused item closest/front, "top" places it at the back.
   * @default "bottom"
   */
  focusPosition?: "top" | "bottom";

  /**
   * Normalized scroll progress (if driven by outer container wheel)
   */
  scrollProgress?: number;
}
