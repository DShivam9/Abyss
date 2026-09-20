# Cascade Gallery

Editorial 3D diagonal conveyor gallery with staged hero card expansion, tactile lateral tab pull, refractive glass shaders, and live chronometer telemetry.

## Usage

```tsx
import { CascadeGallery } from "@abyss-ui/core";

<CascadeGallery
  stepDist={0.22}
  hoverLiftMultiplier={1.75}
  dominoLean={1.0}
  ambientDriftSpeed={0.016}
  scrollSensitivity={0.0065}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `images` | `string[]` | `DEFAULT_IMAGES` | Array of image URLs rendered across the 3D diagonal conveyor rack |
| `stepDist` | `number` | `0.22` | Spatial density and packing interval between consecutive conveyor cards |
| `hoverLiftMultiplier` | `number` | `1.75` | Tab pull vertical lift distance when hovering over cards |
| `dominoLean` | `number` | `1.0` | Inertial pitch angle cards tilt into during rapid scrolling |
| `ambientDriftSpeed` | `number` | `0.016` | Autonomous cruising speed of the conveyor rail when idle |
| `scrollSensitivity` | `number` | `0.0065` | Multiplier for mouse wheel and touch drag responsiveness |
