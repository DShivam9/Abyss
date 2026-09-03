import { VesselComponentProps } from "../../engine/types";

export interface BleedSection {
  id: string;
  title: string;
  subtitle: string;
  alignClass: string;
  image: string;
}

export type BleedBlurVariant = "pure" | "refractive" | "liquid" | "crt" | "thermal";

export interface ApparatusParallaxBleedProps extends VesselComponentProps {
  /**
   * Array of bleed sections.
   */
  sections?: BleedSection[];
  /**
   * Parallax movement intensity (0% - 100%).
   * @default 45
   */
  parallaxIntensity?: number;
  /**
   * Blur depth spread in pixels.
   * @default 280
   */
  blurDepth?: number;
  /**
   * Optical edge vignette variant.
   * @default "pure"
   */
  blurVariant?: BleedBlurVariant;
  /**
   * Scroll indicator visual style.
   * @default "dots"
   */
  indicatorStyle?: "dashes" | "dots" | "hidden";
  /**
   * Image brightness percentage (0 - 100).
   * @default 90
   */
  imageBrightness?: number;
  /**
   * External scroll progress (0 to 1).
   * @default 0
   */
  scrollProgress?: number;
}
