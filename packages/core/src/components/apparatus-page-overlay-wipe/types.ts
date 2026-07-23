import { ReactNode } from "react";
import { VesselComponentProps } from "../../engine/types";

export type WipeDirection =
  | "bottom-to-top"
  | "top-to-bottom"
  | "left-to-right"
  | "right-to-left";

export type WipeStyle =
  | "solid"
  | "multi-layer-slat"
  | "iris-portal";

export interface BentoCardItem {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  badge: string;
  description: string;
}

export interface SpecMetricItem {
  label: string;
  value: string;
  status?: string;
}

export interface FullEditorialPageItem {
  id: string;
  routeCode: string;
  eyebrow: string;
  headline: string;
  category: string;
  heroImage: string;
  secondaryImage: string;
  summaryText: string;
  bodyParagraphs: string[];
  bentoCards: BentoCardItem[];
  specMetrics: SpecMetricItem[];
}

export interface ApparatusPageOverlayWipeProps extends VesselComponentProps {
  pages?: FullEditorialPageItem[];
  coverDuration?: number; // ms
  revealDuration?: number; // ms
  wipeDirection?: WipeDirection;
  wipeStyle?: WipeStyle;
  overlayColor?: string;
  accentLineColor?: string;
  showAccentHairline?: boolean;
  easing?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number; // ms
  enable3DDepth?: boolean;
  enableParallaxCounter?: boolean;
  children?: ReactNode;
}

