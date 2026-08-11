import { VesselComponentProps } from "../../engine/types";

export interface DepthSwimImage {
  src: string;
  x: number; // horizontal offset percentage (-50 to 50)
  y: number; // vertical offset percentage (-50 to 50)
  z: number; // depth value (0 to 1)
}

export interface ApparatusDepthSwimProps extends VesselComponentProps {
  images?: string[] | DepthSwimImage[];
  scrollProgress?: number; // optional scroll progress (0 to 1) from parent
}
