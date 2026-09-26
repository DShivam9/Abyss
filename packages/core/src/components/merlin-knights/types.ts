import { AbyssComponentProps } from "../../engine/types";

export interface MerlinKnightsProps extends AbyssComponentProps {
  /**
   * Wind speed multiplier for flag/fabric displacement.
   * @default 0.8
   */
  windSpeed?: number;
}
