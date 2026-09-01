import React from "react";
import { VesselComponentProps } from "../../engine/types";

export interface MosaicSlotPosition {
  xPct: number;
  yPct: number;
  w: number;
  h: number;
  rot: number;
  depthFactor: number;
  spawnDelay: number;
  initialIdx: number;
}

export interface MosaicLoaderProps extends VesselComponentProps {
  images?: string[];
  title?: string;
  lines?: string[];
  editorialImages?: string[];
  duration?: number;
  startDelay?: number;
  onComplete?: () => void;
  showReplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
