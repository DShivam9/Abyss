import { VesselComponentProps } from "../../engine/types";

export interface OrbitRingItem {
  id: string | number;
  image: string;
  title?: string;
  subtitle?: string;
}

export interface OrbitRingGalleryProps extends VesselComponentProps {
  /** Array of items to display in the gallery */
  items?: OrbitRingItem[];
  /** Radius of the ring (distance from center to items). Default: 4 */
  radius?: number;
  /** Custom class name for the wrapper */
  className?: string;
  /** Initial rotation of the ring. Default: 0 */
  initialRotation?: number;
}
