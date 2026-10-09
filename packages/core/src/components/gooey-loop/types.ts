import { AbyssComponentProps } from "../../engine/types";

export interface PlateItem {
  id: number;
  text: string;
  fontSize: number;
  textLength: number;
  yTop: number;
  yBottom: number;
  yMid: number;
  src: string;
}

export interface GooeyLoopProps extends AbyssComponentProps {
  /**
   * Title text displayed at the top center.
   * @default "GOOEY LOOP"
   */
  title?: string;

  /**
   * Caption text displayed at the bottom center.
   * @default "SCROLL & DRAG"
   */
  caption?: string;

  /**
   * Custom plate items. If not provided, defaults to all 16 editorial plates.
   */
  plates?: PlateItem[];

  /**
   * Scroll speed multiplier for wheel & virtual scroll.
   * @default 1.8
   */
  scrollSpeed?: number;

  /**
   * Inner image parallax displacement intensity.
   * @default 120
   */
  parallaxIntensity?: number;

  /**
   * Autonomous right-to-left glide when user is idle.
   * @default true
   */
  autoDrift?: boolean;

  /**
   * Autonomous glide speed in pixels per second.
   * @default 55
   */
  autoDriftSpeed?: number;
}

export interface CardController {
  card: HTMLDivElement;
  cardIdx: number;
  parallaxLayer: SVGGElement;
  mouseParallaxX: number;
  mouseParallaxY: number;
  topRect: SVGRectElement;
  botRect: SVGRectElement;
  textEl: SVGTextElement;
  tendrils: SVGEllipseElement[];
  blurEl: SVGFEGaussianBlurElement;
  maskGroup: SVGGElement;
  lensHead: SVGCircleElement;
  lensCore: SVGCircleElement;
  lensTail: SVGCircleElement;
  lensRadius: number;
  currentBlur: number;
  headX: number;
  headY: number;
  coreX: number;
  coreY: number;
  tailX: number;
  tailY: number;
  lastX: number;
  lastY: number;
  vx: number;
  vy: number;
  wobblePhase: number;
  wasLensActive: boolean;
  drips: SVGCircleElement[];
  dripProgress: number;
  dripTimer: number;
  dripEdgeY: number;
  yTop: number;
  yBottom: number;
  yMid: number;
}
