import { VesselComponentProps } from "../../engine/types";

export interface GimbalStreamProps extends VesselComponentProps {
  gridVariant?: "plus" | "ghost" | "hex";
  autoRotateSpeed?: number;
  scrollSpeed?: number;
  cardBendMultiplier?: number;
  glowIntensity?: number;
  waveBrightness?: number;
}

export interface TierConfig {
  startY: number;
  baseY: number;
  speedMultiplier: number;
  tiltX: number;
  tiltZ: number;
  direction: number;
  phaseOffset: number;
}
