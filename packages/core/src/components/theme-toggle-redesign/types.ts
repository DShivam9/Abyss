import React from "react";
import { AbyssComponentProps } from "../../engine/types";

export interface ThemeToggleRedesignProps extends AbyssComponentProps {
  /**
   * Visual toggle variant: machined 3D plunge dial or physical hanging lamp cord.
   * @default "dial"
   */
  variant?: "dial" | "lamp";

  /**
   * Whether acoustic sound effects play on toggle engage and release.
   * @default true
   */
  enableAudio?: boolean;

  /**
   * Optional CSS class name applied to the container element.
   */
  className?: string;

  /**
   * Optional inline styles applied to the container element.
   */
  style?: React.CSSProperties;
}
