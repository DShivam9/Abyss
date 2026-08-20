import { VesselComponentProps } from "../../engine/types";

export interface Apparatus3dCursorTrailProps extends VesselComponentProps {
  /**
   * Array of image URLs (WebP photos & SVGs) to texture onto 3D cards.
   */
  images?: string[];
  /**
   * Distance threshold in screen pixels to trigger a new 3D image spawn.
   * @default 65
   */
  spawnDistance?: number;
  /**
   * Minimum time interval in milliseconds between card spawns to prevent flooding.
   * @default 140
   */
  spawnInterval?: number;
  /**
   * 3D size scale of each spawned image card.
   * @default 2.4
   */
  imageSize?: number;
  /**
   * Lifespan of each spawned 3D card in seconds before fully disappearing into void.
   * @default 3.2
   */
  lifespan?: number;
  /**
   * Gravity speed pulling spawned cards down into the deep 3D void.
   * @default 2.2
   */
  fallSpeed?: number;
  /**
   * Dynamic 3D Camera Orbit & Parallax intensity.
   * @default 2.8
   */
  cameraParallax?: number;
  /**
   * 3D tumble spin velocity of floating cards.
   * @default 0.8
   */
  spinSpeed?: number;
  /**
   * Filter spawned cards to only photos or only vector shapes.
   * @default "images-only"
   */
  spawnFilter?: "images-only" | "shapes-only";
}
