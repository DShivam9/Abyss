import { VesselComponentProps } from "../../engine/types";

export interface StreamMediaItem {
  id: string;
  title: string;
  mediaType: "video" | "image";
  src: string;
  poster?: string;
  palette?: string[];
  coloredSegments?: { text: string; color: string }[];
}

export interface HoverMediaStreamProps extends VesselComponentProps {
  items?: StreamMediaItem[];
  backdropBlur?: number;
  ambientBrightness?: number;
  lineDuration?: number;
  fontSize?: number;
  enableAudio?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
