import { VesselComponentProps } from "../../engine/types";

export interface CursorWakeItem {
  id: string;
  name: string;
  imageSrc: string;
  subtitle?: string;
}

export interface ApparatusCursorWakeProps extends VesselComponentProps {
  /**
   * Array of cursor wake items with titles and images.
   */
  items?: CursorWakeItem[];

  /**
   * Proximity threshold radius in pixels where cursor triggers card activation.
   * @default 220
   */
  activationRadius?: number;

  /**
   * Duration in milliseconds for the wake trail to fully decay.
   * @default 3000
   */
  decayDuration?: number;

  /**
   * Base scale of non-visited or decayed items.
   * @default 0.8
   */
  baseScale?: number;

  /**
   * Maximum saturation factor for items inside the active wake.
   * @default 1.2
   */
  maxSaturation?: number;
}
