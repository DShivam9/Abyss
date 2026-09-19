import React from "react";

export type VesselFamily =
  | "medieval"
  | "dark-styled"
  | "premium"
  | "aesthetic"
  | "brutalist"
  | "psychedelic"
  | "analog-tech"
  | "naturalist";

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
  imageSrc?: string;
  className?: string;
  style?: React.CSSProperties;
  onLifecycleChange?: (state: "idle" | "discovery" | "buildUp" | "peak" | "recovery") => void;
  onControlChange?: (key: string, value: number | boolean | string) => void;
}

export type GpuTier = 0 | 1 | 2 | 3; // 0=fallback, 1=low, 2=mid, 3=high
export type QualityTier = "high" | "medium" | "low";

export interface PerformanceProfile {
  // Hardware detection (set once on mount)
  gpuTier: GpuTier;

  // Computed quality level (may change during runtime)
  tier: QualityTier;

  // Rendering parameters (components read these directly)
  dpr: number;                   // device pixel ratio: high=native(max 2), medium=1.5, low=1
  reducedMotion: boolean;        // OS prefers-reduced-motion

  // Budget hints (components use these to scale complexity)
  shaderComplexity: "full" | "simplified";
  maxParticleCount: number;      // high=1000+, medium=500, low=200
  enablePostProcessing: boolean; // bloom, DOF, etc.
  enableShadows: boolean;
  enableReflections: boolean;

  // Frame rate info (for components that want fine-grained control)
  currentFps: number;            // rolling average
  isUnderPerforming: boolean;    // true if FPS consistently below target
}

