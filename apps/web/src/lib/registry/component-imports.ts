import dynamic from "next/dynamic";
import React from "react";
import { VesselComponentProps } from "@abyss-ui/core";

// Dynamic imports mapping slug to component inside packages/core
export const COMPONENT_IMPORTS: Record<string, React.ComponentType<VesselComponentProps>> = {
  "japparii": dynamic(() => import("../../../../../packages/core/src/components/japparii"), { ssr: false }),
  "chromepunk-beast": dynamic(() => import("../../../../../packages/core/src/components/chromepunk-beast"), { ssr: false }),
  "merlin-knights": dynamic(() => import("../../../../../packages/core/src/components/merlin-knights"), { ssr: false }),
  "acg-fleece": dynamic(() => import("../../../../../packages/core/src/components/acg-fleece"), { ssr: false }),
  "molten-mercury": dynamic(() => import("../../../../../packages/core/src/components/molten-mercury"), { ssr: false }),
  "core-shell-b": dynamic(() => import("../../../../../packages/core/src/components/core-shell-b"), { ssr: false }),
  "kinetic-portal": dynamic(() => import("../../../../../packages/core/src/components/kinetic-portal"), { ssr: false }),
  "gilding-transmutation": dynamic(() => import("../../../../../packages/core/src/components/gilding-transmutation"), { ssr: false }),
  "depth-silhouette": dynamic(() => import("../../../../../packages/core/src/components/depth-silhouette"), { ssr: false }),
  "bronze-transmutation": dynamic(() => import("../../../../../packages/core/src/components/bronze-transmutation"), { ssr: false }),
  "bas-relief-shadow": dynamic(() => import("../../../../../packages/core/src/components/bas-relief-shadow"), { ssr: false }),
  "steel-intaglio": dynamic(() => import("../../../../../packages/core/src/components/steel-intaglio"), { ssr: false }),
  "procedural-atlas": dynamic(() => import("../../../../../packages/core/src/components/procedural-atlas"), { ssr: false }),
  "accordion-wall": dynamic(() => import("../../../../../packages/core/src/components/accordion-wall"), { ssr: false }),
  "parallax-column": dynamic(() => import("../../../../../packages/core/src/components/parallax-column"), { ssr: false }),
  "erosion-map": dynamic(() => import("../../../../../packages/core/src/components/erosion-map"), { ssr: false }),
  "dual-wave": dynamic(() => import("../../../../../packages/core/src/components/dual-wave"), { ssr: false }),
  "clip-morph": dynamic(() => import("../../../../../packages/core/src/components/clip-morph"), { ssr: false }),
  "phase-drift": dynamic(() => import("../../../../../packages/core/src/components/phase-drift"), { ssr: false }),
  "depth-swim": dynamic(() => import("../../../../../packages/core/src/components/depth-swim"), { ssr: false }),
  "cylinder-scroll": dynamic(() => import("../../../../../packages/core/src/components/cylinder-scroll"), { ssr: false }),
  "focus-ring": dynamic(() => import("../../../../../packages/core/src/components/focus-ring"), { ssr: false }),
  "parallax-bleed": dynamic(() => import("../../../../../packages/core/src/components/parallax-bleed"), { ssr: false }),
  "gravity-cursor": dynamic(() => import("../../../../../packages/core/src/components/gravity-cursor"), { ssr: false }),
  "3d-shatter-sphere": dynamic(() => import("../../../../../packages/core/src/components/3d-shatter-sphere"), { ssr: false }),
  "ripple-scramble": dynamic(() => import("../../../../../packages/core/src/components/ripple-scramble"), { ssr: false }),
  "arc-drift-gallery": dynamic(() => import("../../../../../packages/core/src/components/arc-drift-gallery"), { ssr: false }),
  "curved-scroll-wipe": dynamic(() => import("../../../../../packages/core/src/components/curved-scroll-wipe"), { ssr: false }),
  "image-snake-trail": dynamic(() => import("../../../../../packages/core/src/components/image-snake-trail"), { ssr: false }),
  "abyss-cursor-fall": dynamic(() => import("../../../../../packages/core/src/components/abyss-cursor-fall"), { ssr: false }),
  "scroll-text-reveal": dynamic(() => import("../../../../../packages/core/src/components/scroll-text-reveal"), { ssr: false }),
  "tracklist-gallery": dynamic(() => import("../../../../../packages/core/src/components/tracklist-gallery"), { ssr: false }),
  "hover-media-stream": dynamic(() => import("../../../../../packages/core/src/components/hover-media-stream"), { ssr: false }),
};



