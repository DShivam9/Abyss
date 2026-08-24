import { VesselComponentProps } from "../../engine/types";

export interface ApparatusGravityCursorProps extends VesselComponentProps {
  /**
   * Gravitational acceleration magnitude (px/frame^2).
   * @default 0.55
   */
  gravity?: number;
  /**
   * Elasticity coefficient (0.1 - 0.95).
   * @default 0.62
   */
  bounceDamping?: number;
  /**
   * Image box width in px (80 - 240).
   * @default 140
   */
  imageSize?: number;
  /**
   * Zero-gravity mode flag.
   * @default false
   */
  zeroGravity?: boolean;
  /**
   * Gravity physics variant.
   * @default "normal"
   */
  gravityMode?: "normal" | "zero-gravity" | "magnetic-repulsor";
  /**
   * Mouse interaction mode.
   * @default "hold-drag"
   */
  interactionMode?: "hold-drag" | "cursor-trail";
  /**
   * Magnetic repeller field radius in px (150 - 600).
   * @default 350
   */
  repelRadius?: number;
  /**
   * Repulsion shockwave power multiplier (1.0 - 25.0).
   * @default 1.0
   */
  repelForce?: number;
}

export interface PhysicsBody {
  active: boolean;
  id: number;
  src: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vSpin: number;
  bounces: number;
  opacity: number;
  scale: number;
  settled: boolean;
  settledAge: number;
  age: number;
  maxAge: number;
}
