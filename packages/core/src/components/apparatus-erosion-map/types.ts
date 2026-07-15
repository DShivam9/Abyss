import { VesselComponentProps } from "../../engine/types";

export interface ApparatusErosionMapProps extends VesselComponentProps {
  /**
   * List of images for the erosion layers.
   * If not provided, fallback to default collection.
   */
  images?: string[];
  /**
   * Optional external scroll progress (0 to 1).
   */
  scrollProgress?: number;
}
