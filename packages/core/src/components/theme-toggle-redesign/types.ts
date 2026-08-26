import { VesselComponentProps } from "../../engine/types";

export interface ThemeToggleRedesignProps extends VesselComponentProps {
  variant?: "dial" | "lamp";
  enableAudio?: boolean;
}
