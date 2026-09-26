# Optic Grid

Dynamic multi-mode media gallery with fluid GSAP Flip transitions, optical filter profiles, and granular scale stepping.

## Usage

```tsx
import { OpticGrid } from "@abyss-ui/core";

<OpticGrid
  defaultMode="contact"
  defaultFx="none"
  defaultScale="75"
  showControls={true}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `defaultMode` | `"contact" \| "cadence" \| "editorial" \| "panorama" \| "drift" \| "keystone"` | `"contact"` | Initial layout geometry mode |
| `defaultFx` | `"none" \| "bloom" \| "halide" \| "xray" \| "cyanotype" \| "obsidian"` | `"none"` | Active in-flight optical filter effect |
| `defaultScale` | `"50" \| "75" \| "100" \| "125" \| "150"` | `"75"` | Initial scale percentage for grid cells |
| `showControls` | `boolean` | `true` | Toggle visibility of top control bar (modes, brand, optics, scale) |
