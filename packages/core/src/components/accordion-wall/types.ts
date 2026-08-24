import { VesselComponentProps } from "../../engine/types";

export interface AccordionWallItem {
  id?: string;
  title: string;
  image: string;
  moodColor?: string;
}

export interface ApparatusAccordionWallProps extends VesselComponentProps {
  /**
   * List of accordion items to display.
   */
  items?: AccordionWallItem[];

  /**
   * Backward-compatible list of image URLs.
   */
  images?: string[];

  /**
   * Backward-compatible list of titles.
   */
  titles?: string[];

  /**
   * Watermark text displayed in the upper void.
   * @default "Hover to Unveil • Click to Expand"
   */
  watermarkText?: string;

  /**
   * Number of visible monoliths.
   * @default 8
   */
  panelCount?: number;

  /**
   * Transition speed in seconds.
   * @default 1.35
   */
  speed?: number;

  /**
   * Callback when a monolith is clicked to expand into fullscreen view.
   */
  onExpand?: (index: number | null) => void;

  /**
   * Custom CSS class name.
   */
  className?: string;

  /**
   * Custom inline styles.
   */
  style?: React.CSSProperties;
}

export type PillarGalleryProps = ApparatusAccordionWallProps;
