import { VesselComponentProps } from "../../engine/types";

export type ArcDriftVariant = "classic-arc" | "panoramic-ribbon";

export interface ApparatusArcDriftGalleryProps extends VesselComponentProps {
  images?: string[];
  thumbnailWidth?: number;
  scrollSpeed?: number;
  arcHeight?: number;
  bgOpacity?: number;
  crossfadeDuration?: number;
  motionVariant?: ArcDriftVariant;
}
