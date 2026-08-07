import React from "react";
import {
  MousePointer,
  Sparkles,
  LayoutGrid,
  Layers,
  Zap,
  Type,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  scroll: MousePointer,
  image: Sparkles,
  gallary: LayoutGrid,
  gallery: LayoutGrid,
  hybrid: Layers,
  transition: Zap,
  text: Type,
};
