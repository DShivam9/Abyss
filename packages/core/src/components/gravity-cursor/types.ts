import { AbyssComponentProps } from "../../engine/types";

export interface GravityCursorProps extends AbyssComponentProps {
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
   * Image box width in px (120 - 520).
   * @default 220
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
  gravityMode?: "normal" | "zero-gravity";
  /**
   * Mouse interaction mode.
   * @default "hold-drag"
   */
  interactionMode?: "hold-drag" | "cursor-trail";
  /**
   * Optional custom image URLs to drop instead of default shapes.
   */
  images?: string[];
}

export interface PhysicsBody {
  active: boolean;
  id: number;
  src: string;
  color?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vSpin: number;
  targetRotation: number;
  bounces?: number;
  opacity: number;
  scale: number;
  squash?: number;
  zIndex: number;
  settled?: boolean;
  settledAge?: number;
  age: number;
  maxAge?: number;
  enterProgress: number;
  dropDelay: number;
  state: "sliding" | "resting" | "dropping";
}
