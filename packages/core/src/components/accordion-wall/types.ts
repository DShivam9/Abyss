import { VesselComponentProps } from "../../engine/types";

export interface ApparatusAccordionWallProps extends VesselComponentProps {
  /**
   * List of image URLs to display in the accordion panels.
   */
  images?: string[];

  /**
   * List of titles corresponding to each image/panel.
   */
  titles?: string[];

  /**
   * List of subtitles corresponding to each image/panel.
   */
  subtitles?: string[];

  /**
   * How panels are activated: on hover or on click.
   * @default "hover"
   */
  interactiveMode?: "hover" | "click";

  /**
   * The index of the active panel (controlled externally).
   */
  activePanelIndex?: number;

  /**
   * Callback when the active panel index changes.
   */
  onActivePanelChange?: (index: number) => void;
}
