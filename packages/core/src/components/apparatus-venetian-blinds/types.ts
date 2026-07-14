import { VesselComponentProps } from "../../engine/types";

export interface ApparatusVenetianBlindsProps extends VesselComponentProps {
  /**
   * Array of image URLs to display and transition between.
   * If not provided, falls back to [imageSrc].
   */
  images?: string[];
  
  /**
   * Number of slices (slats) the image is divided into.
   * @default 10
   */
  slatCount?: number;
  
  /**
   * Base animation duration for each individual slat in seconds.
   * @default 0.8
   */
  duration?: number;
  
  /**
   * Stagger delay between subsequent slats in seconds.
   * @default 0.04
   */
  staggerDelay?: number;
  
  /**
   * Cascade animation direction.
   * @default "center-out"
   */
  direction?: "top-to-bottom" | "bottom-to-top" | "center-out" | "edges-in";
  
  /**
   * Scroll progress from 0 to 1 to scrub the transition.
   * @default 0
   */
  scrollProgress?: number;

  /**
   * Callback triggered when the internal scroll progress shifts (e.g. during a click transition).
   */
  onScrollProgressChange?: (progress: number) => void;
}

