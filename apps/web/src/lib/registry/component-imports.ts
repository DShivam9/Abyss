import dynamic from "next/dynamic";
import React from "react";
import { VesselComponentProps } from "@abyss-ui/core";

// Dynamic imports mapping slug to component inside packages/core
export const COMPONENT_IMPORTS: Record<string, React.ComponentType<VesselComponentProps>> = {
  "japparii": dynamic(() => import("../../../../../packages/core/src/components/japparii"), { ssr: false }),
  "chromepunk-beast": dynamic(() => import("../../../../../packages/core/src/components/chromepunk-beast"), { ssr: false }),
  "merlin-knights": dynamic(() => import("../../../../../packages/core/src/components/merlin-knights"), { ssr: false }),
  "acg-fleece": dynamic(() => import("../../../../../packages/core/src/components/acg-fleece"), { ssr: false }),
  "apparatus-dee": dynamic(() => import("../../../../../packages/core/src/components/apparatus-dee"), { ssr: false }),
  "core-shell-b": dynamic(() => import("../../../../../packages/core/src/components/core-shell-b"), { ssr: false }),
  "kinetic-portal": dynamic(() => import("../../../../../packages/core/src/components/kinetic-portal"), { ssr: false }),
  "apparatus-faf": dynamic(() => import("../../../../../packages/core/src/components/apparatus-faf"), { ssr: false }),
  "apparatus-gg": dynamic(() => import("../../../../../packages/core/src/components/apparatus-gg"), { ssr: false }),
  "apparatus-fblf": dynamic(() => import("../../../../../packages/core/src/components/apparatus-fblf"), { ssr: false }),
  "apparatus-fjvfba": dynamic(() => import("../../../../../packages/core/src/components/apparatus-fjvfba"), { ssr: false }),
  "apparatus-ialfa": dynamic(() => import("../../../../../packages/core/src/components/apparatus-ialfa"), { ssr: false }),
  "apparatus-ll": dynamic(() => import("../../../../../packages/core/src/components/apparatus-ll"), { ssr: false }),
  "apparatus-hoqnl": dynamic(() => import("../../../../../packages/core/src/components/apparatus-hoqnl"), { ssr: false }),
  "orbit-ring-gallery": dynamic(() => import("../../../../../packages/core/src/components/orbit-ring-gallery"), { ssr: false }),
  "apparatus-venetian-blinds": dynamic(() => import("../../../../../packages/core/src/components/apparatus-venetian-blinds"), { ssr: false }),
  "apparatus-accordion-wall": dynamic(() => import("../../../../../packages/core/src/components/apparatus-accordion-wall"), { ssr: false }),
  "apparatus-parallax-column": dynamic(() => import("../../../../../packages/core/src/components/apparatus-parallax-column"), { ssr: false }),
  "apparatus-layout-morph": dynamic(() => import("../../../../../packages/core/src/components/apparatus-layout-morph"), { ssr: false }),
  "apparatus-erosion-map": dynamic(() => import("../../../../../packages/core/src/components/apparatus-erosion-map"), { ssr: false }),
  "apparatus-dual-wave": dynamic(() => import("../../../../../packages/core/src/components/apparatus-dual-wave"), { ssr: false }),
  "apparatus-clip-morph": dynamic(() => import("../../../../../packages/core/src/components/apparatus-clip-morph"), { ssr: false }),
  "apparatus-phase-drift": dynamic(() => import("../../../../../packages/core/src/components/apparatus-phase-drift"), { ssr: false }),
  "apparatus-depth-swim": dynamic(() => import("../../../../../packages/core/src/components/apparatus-depth-swim"), { ssr: false }),
  "apparatus-cylinder-scroll": dynamic(() => import("../../../../../packages/core/src/components/apparatus-cylinder-scroll"), { ssr: false }),
  "apparatus-focus-ring": dynamic(() => import("../../../../../packages/core/src/components/apparatus-focus-ring"), { ssr: false }),
  "apparatus-cursor-wake": dynamic(() => import("../../../../../packages/core/src/components/apparatus-cursor-wake"), { ssr: false }),
  "apparatus-page-fade-shift": dynamic(() => import("../../../../../packages/core/src/components/apparatus-page-fade-shift"), { ssr: false }),
  "apparatus-page-overlay-wipe": dynamic(() => import("../../../../../packages/core/src/components/apparatus-page-overlay-wipe"), { ssr: false }),
  "apparatus-3d-typography-grid": dynamic(() => import("../../../../../packages/core/src/components/apparatus-3d-typography-grid"), { ssr: false }),
  "apparatus-cinematic-unstack": dynamic(() => import("../../../../../packages/core/src/components/apparatus-cinematic-unstack"), { ssr: false }),
  "apparatus-parallax-bleed": dynamic(() => import("../../../../../packages/core/src/components/apparatus-parallax-bleed"), { ssr: false }),
  "apparatus-gravity-cursor": dynamic(() => import("../../../../../packages/core/src/components/apparatus-gravity-cursor"), { ssr: false }),
  "apparatus-3d-shatter-sphere": dynamic(() => import("../../../../../packages/core/src/components/apparatus-3d-shatter-sphere"), { ssr: false }),
  "apparatus-origin-expand": dynamic(() => import("../../../../../packages/core/src/components/apparatus-origin-expand"), { ssr: false }),
  "apparatus-turbulence-lens": dynamic(() => import("../../../../../packages/core/src/components/apparatus-turbulence-lens"), { ssr: false }),
  "apparatus-ripple-scramble": dynamic(() => import("../../../../../packages/core/src/components/apparatus-ripple-scramble"), { ssr: false }),
  "apparatus-arc-drift-gallery": dynamic(() => import("../../../../../packages/core/src/components/apparatus-arc-drift-gallery"), { ssr: false }),
  "apparatus-curved-scroll-wipe": dynamic(() => import("../../../../../packages/core/src/components/apparatus-curved-scroll-wipe"), { ssr: false })
};

