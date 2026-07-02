import React from "react";

export type VesselFamily =
  | "illuminate"
  | "deform"
  | "transform"
  | "lens"
  | "explode"
  | "flow"
  | "layout";

export type VesselEnergy =
  | "silent"
  | "calm"
  | "responsive"
  | "dynamic"
  | "cinematic";

export type VesselTrigger =
  | "hover"
  | "click"
  | "drag"
  | "scroll"
  | "idle"
  | "key"
  | "proximity"
  | "velocity";

export interface VesselComponentMeta {
  name: string;
  slug: string;
  pitch: string;
  family: VesselFamily;
  energy: VesselEnergy;
  triggers: VesselTrigger[];
  tech: string[];
  lifecycle: {
    idle: string;
    discovery: string;
    buildUp: string;
    peak: string;
    recovery: string;
  };
}

export interface VesselComponentProps {
  imageSrc: string;
  className?: string;
  style?: React.CSSProperties;
  onLifecycleChange?: (state: "idle" | "discovery" | "buildUp" | "peak" | "recovery") => void;
}
