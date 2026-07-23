# Apparatus Page Overlay Wipe

Full-viewport physical overlay panel component executing a two-phase directional sweep transition across routes/views.

## Overview
Unlike crossfades or slide reveals, `ApparatusPageOverlayWipe` introduces a physical solid barrier. The overlay panel covers the current view completely, swaps the underlying content state at peak density, and then sweeps out along the vector axis to uncover the destination view.

## Features
- **Zero Visual Bleed**: Solid overlay eliminates overlapping image artifacts during transition.
- **GSAP Context Safe**: Animations run inside `useGSAP()` with clean performance disposal.
- **Configurable Vector Angles**: Supports `bottom-to-top`, `top-to-bottom`, `left-to-right`, and `right-to-left`.
- **Leading Edge Hairline**: High-precision accent line tracks the sweeping edge of the barrier.
- **HUD Configurator**: Embedded parameters panel for real-time duration and direction tuning.

## Usage
```tsx
import { ApparatusPageOverlayWipe } from "@vessel/core";

export default function Page() {
  return (
    <ApparatusPageOverlayWipe
      coverDuration={400}
      revealDuration={400}
      wipeDirection="bottom-to-top"
      showAccentHairline={true}
    />
  );
}
```
