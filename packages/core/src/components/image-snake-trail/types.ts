import { VesselComponentProps } from "../../engine/types";

export interface ApparatusImageSnakeTrailProps extends VesselComponentProps {
  /**
   * List of image URLs for snake trail nodes and world food.
   */
  images?: string[];
  /**
   * Virtual world square size in pixels.
   * @default 12000
   */
  worldSize?: number;
  /**
   * Initial length of snake body (number of segments).
   * @default 5
   */
  initialLength?: number;
  /**
   * Number of collectible images floating in the world.
   * @default 60
   */
  collectibleCount?: number;
  /**
   * Segment image size in pixels.
   * @default 160
   */
  segmentSize?: number;
  /**
   * Snake movement speed in pixels/sec.
   * @default 220
   */
  speed?: number;
  /**
   * Damping factor for smooth camera and snake movement.
   * @default 0.15
   */
  damping?: number;
  /**
   * Distance threshold between trailing segments.
   * @default 40
   */
  stepDistance?: number;
  /**
   * Camera zoom level (0.45x - 1.35x).
   * @default 1.0
   */
  zoom?: number;
}

export interface CollectibleData {
  id: string;
  x: number;
  y: number;
  src: string;
  floatOffset: number;
  colorFilter?: string;
}

export interface BodySegment {
  id: string;
  src: string;
  colorFilter?: string;
}

export interface RippleImpulse {
  startTime: number;
  dirX: number;
  dirY: number;
}
