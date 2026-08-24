import { VesselComponentProps } from "../../engine/types";

export interface MerlinKnightsProps extends VesselComponentProps {
  /**
   * Wind speed multiplier for flag/fabric displacement.
   * @default 0.8
   */
  windSpeed?: number;
}
