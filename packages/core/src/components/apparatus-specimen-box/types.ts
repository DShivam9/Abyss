import { VesselComponentProps } from "../../engine/types";

export interface ApparatusSpecimenBoxProps extends VesselComponentProps {
  /**
   * List of specimen image URLs to display.
   * If not provided, fallback to default collection.
   */
  images?: string[];
}
