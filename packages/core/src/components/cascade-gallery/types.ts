import { VesselComponentProps } from "../../engine/types";

export interface CascadeGalleryProps extends VesselComponentProps {
  images?: string[];
  ambientDriftSpeed?: number;
  scrollSensitivity?: number;
  stepDist?: number;
  hoverLiftMultiplier?: number;
  dominoLean?: number;
  className?: string;
  style?: React.CSSProperties;
}

export interface PhotoCaption {
  left: string;
  right: string;
}
