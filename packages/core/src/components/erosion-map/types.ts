import { VesselComponentProps } from "../../engine/types";

export interface ApparatusErosionMapProps extends VesselComponentProps {
  /**
   * List of images for the erosion layers.
   * If not provided, fallback to default collection.
   */
  images?: string[];
  /**
   * Optional external scroll progress (0 to 1).
   */
  scrollProgress?: number;
  /**
   * Fluid erosion dampening factor (0.5 = heavy/slow, 20 = fast/instant).
   * @default 3.0
   */
  erosionDamper?: number;
  /**
   * Noise scale multiplier.
   */
  noiseScale?: number;
  /**
   * Edge glow intensity.
   */
  edgeGlow?: number;
  /**
   * Number of noise octaves.
   * @default 3
   */
  octaves?: number;
  /**
   * Wind distortion pattern.
   * @default "linear"
   */
  windPattern?: "linear" | "vortex" | "wave" | "turbulent";
  /**
   * Wind direction angle in degrees.
   * @default 180
   */
  windAngle?: number;
  /**
   * Wind stretch ratio.
   * @default 2.5
   */
  windStretch?: number;
  /**
   * Curve power coefficient.
   * @default 1.0
   */
  curvePower?: number;
}
