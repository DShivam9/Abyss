import { VesselComponentProps } from "../../engine/types";

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  year?: string;
  imageSrc: string;
  audioSrc?: string;
}

export interface ApparatusTracklistGalleryProps extends VesselComponentProps {
  /**
   * List of audio tracks to showcase in gallery.
   */
  tracks?: TrackItem[];
  /**
   * Scroll scrub smoothness in seconds.
   * @default 0.8
   */
  scrubSmoothness?: number;
  /**
   * Active title font size in pixels.
   * @default 48
   */
  titleSize?: number;
  /**
   * Crossfade duration between album artworks in seconds.
   * @default 0.5
   */
  artworkCrossfade?: number;
  /**
   * Total scroll height in pixels per track item.
   * @default 400
   */
  itemScrollDistance?: number;
}
