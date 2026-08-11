import { VesselComponentProps } from "../../engine/types";

export interface DualWaveItem {
  id: string;
  name: string;
  imageSrc: string;
}

export interface ApparatusDualWaveProps extends VesselComponentProps {
  /**
   * List of items with names and images.
   */
  items?: DualWaveItem[];

  /**
   * Normalized scroll progress (0 to 1).
   * @default 0
   */
  scrollProgress?: number;

  /**
   * Is full screen mode
   * @default false
   */
  isFullscreen?: boolean;
}
