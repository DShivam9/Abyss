# Parallax Bleed

Sequential full-bleed editorial sections that glide with internal parallax displacement, weighted layer inertia, and progressive depth-of-field edge vignettes.

## Usage

```tsx
import { ParallaxBleed } from "@abyss-ui/core";

<ParallaxBleed
  parallaxIntensity={45}
  blurDepth={280}
  blurVariant="pure"
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `sections` | `BleedSection[]` | `DEFAULT_BLEED_SECTIONS` | Array of full-bleed editorial sections |
| `parallaxIntensity` | `number` | `100` | Internal parallax shift intensity percentage (0 to 150) |
| `blurDepth` | `number` | `280` | Progressive optical blur depth in pixels |
| `blurVariant` | `BleedBlurVariant` | `"pure"` | Edge falloff filter (`pure`, `refractive`, `liquid`, `crt`, `thermal`) |
| `imageBrightness` | `number` | `90` | Image brightness percentage (0 to 120) |
| `indicatorStyle` | `"dashes" \| "dots" \| "hidden"` | `"dots"` | Scroll progress indicator style |
