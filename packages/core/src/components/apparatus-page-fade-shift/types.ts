import { ReactNode } from "react";
import { VesselComponentProps } from "../../engine/types";

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

export interface ApparatusPageFadeShiftProps extends VesselComponentProps {
  pages?: FullEditorialPageItem[];
  leaveDuration?: number; // ms
  enterDuration?: number; // ms
  shiftY?: number; // px vertical movement
  easing?: "power2.inOut" | "power3.out" | "cubic-bezier(0.32,0.72,0,1)";
  autoPlay?: boolean;
  autoPlayInterval?: number; // ms
  children?: ReactNode;
}
