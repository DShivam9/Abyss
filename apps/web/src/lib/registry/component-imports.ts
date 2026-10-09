import dynamic from "next/dynamic";
import React from "react";
import { AbyssComponentProps } from "@abyss-ui/core";

// Dynamic imports mapping slug to component inside packages/core
export const COMPONENT_IMPORTS: Record<string, React.ComponentType<AbyssComponentProps>> = {
  "accordion-wall": dynamic(() => import("../../../../../packages/core/src/components/accordion-wall"), { ssr: false }),
  "parallax-column": dynamic(() => import("../../../../../packages/core/src/components/parallax-column"), { ssr: false }),
  "erosion-map": dynamic(() => import("../../../../../packages/core/src/components/erosion-map"), { ssr: false }),
  "dual-wave": dynamic(() => import("../../../../../packages/core/src/components/dual-wave"), { ssr: false }),
  "parallax-bleed": dynamic(() => import("../../../../../packages/core/src/components/parallax-bleed"), { ssr: false }),
  "gravity-cursor": dynamic(() => import("../../../../../packages/core/src/components/gravity-cursor"), { ssr: false }),
  "3d-shatter-sphere": dynamic(() => import("../../../../../packages/core/src/components/3d-shatter-sphere"), { ssr: false }),
  "ripple-scramble": dynamic(() => import("../../../../../packages/core/src/components/ripple-scramble"), { ssr: false }),
  "abyss-cursor-fall": dynamic(() => import("../../../../../packages/core/src/components/abyss-cursor-fall"), { ssr: false }),
  "tracklist-gallery": dynamic(() => import("../../../../../packages/core/src/components/tracklist-gallery"), { ssr: false }),
  "hover-media-stream": dynamic(() => import("../../../../../packages/core/src/components/hover-media-stream"), { ssr: false }),
  "gimbal-stream": dynamic(() => import("../../../../../packages/core/src/components/gimbal-stream"), { ssr: false }),
  "cascade-gallery": dynamic(() => import("../../../../../packages/core/src/components/cascade-gallery"), { ssr: false }),
  "theme-toggle-redesign": dynamic(() => import("../../../../../packages/core/src/components/theme-toggle-redesign"), { ssr: false }),
  "mosaic-loader": dynamic(() => import("../../../../../packages/core/src/components/mosaic-loader"), { ssr: false }),
  "cinema-aisle": dynamic(() => import("../../../../../packages/core/src/components/cinema-aisle"), { ssr: false }),
  "cyclorama-matrix": dynamic(() => import("../../../../../packages/core/src/components/cyclorama-matrix"), { ssr: false }),
  "optic-grid": dynamic(() => import("../../../../../packages/core/src/components/optic-grid"), { ssr: false }),
  "polyptych-formation": dynamic(() => import("../../../../../packages/core/src/components/polyptych-formation"), { ssr: false }),
  "paper-curve": dynamic(() => import("../../../../../packages/core/src/components/paper-curve"), { ssr: false }),
  "gooey-loop": dynamic(() => import("../../../../../packages/core/src/components/gooey-loop"), { ssr: false }),
};
