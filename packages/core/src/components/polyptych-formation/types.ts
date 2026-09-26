import type { CSSProperties } from "react";
import { AbyssComponentProps } from "../../engine/types";

export type PolyptychRole =
  | "hero"
  | "midLeft"
  | "midRight"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight";

export interface PolyptychItem {
  id: string;
  src: string;
  alt?: string;
  role: PolyptychRole;
}

export interface PolyptychFormationProps extends AbyssComponentProps {
  /** Array of media panel items */
  items?: PolyptychItem[];
  /** Intro text placard lines */
  introLines?: string[];
  /** Outro dialogue placard lines */
  outroLines?: string[];
  /** Additional CSS class names */
  className?: string;
  /** Inline CSS properties */
  style?: CSSProperties;
}
