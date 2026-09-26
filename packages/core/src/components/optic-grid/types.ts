import { AbyssComponentProps } from "../../engine/types";

export type OpticGridMode = "contact" | "cadence" | "editorial" | "panorama" | "drift" | "keystone";

export type OpticGridFx = "none" | "bloom" | "halide" | "xray" | "cyanotype" | "obsidian";

export type OpticGridScale = "50" | "75" | "100" | "125" | "150";

export interface OpticImageItem {
  src: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export interface OpticGridProps extends AbyssComponentProps {
  /**
   * Initial active layout mode.
   * @default "contact"
   */
  defaultMode?: OpticGridMode;

  /**
   * Initial optical transition filter effect.
   * @default "none"
   */
  defaultFx?: OpticGridFx;

  /**
   * Initial scale percentage.
   * @default "75"
   */
  defaultScale?: OpticGridScale;

  /**
   * Whether to display the top control header (Layout, Brand, Optics, Scale).
   * @default true
   */
  showControls?: boolean;
}
