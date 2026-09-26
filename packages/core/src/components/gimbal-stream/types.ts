import { AbyssComponentProps } from "../../engine/types";

export interface GimbalStreamProps extends AbyssComponentProps {
  gridVariant?: "plus" | "ghost" | "hex";
  autoRotateSpeed?: number;
  scrollSpeed?: number;
  cardBendMultiplier?: number;
  glowIntensity?: number;
  waveBrightness?: number;
  waveSpeed?: number;
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
