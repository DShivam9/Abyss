# Gimbal Stream

Multi-tier 3D gimbal stream orbiting card rings around a liquid chrome core with procedural chamber patterns, cylindrical vertex curvature, and inertia-driven orbital scroll.

## Usage

```tsx
import { GimbalStream } from "@abyss-ui/core";

<GimbalStream
  gridVariant="plus"
  autoRotateSpeed={0.10}
  scrollSpeed={0.0045}
  cardBendMultiplier={6.5}
  glowIntensity={3.2}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `gridVariant` | `"plus" \| "ghost" \| "hex"` | `"plus"` | Procedural background pattern rendered in the obsidian chamber |
| `autoRotateSpeed` | `number` | `0.10` | Autonomous cruising rotation speed of the gimbal rings |
| `scrollSpeed` | `number` | `0.0045` | Rotational velocity multiplier for wheel and drag scroll input |
| `cardBendMultiplier` | `number` | `6.5` | Cylindrical curvature strength bending cards along orbital paths |
| `glowIntensity` | `number` | `3.2` | Luminance and specular bloom of the central liquid chrome core |
| `waveBrightness` | `number` | `1.0` | Ambient background wave illumination brightness |
| `waveSpeed` | `number` | `1.0` | Cycle frequency of procedural background wave ripples |
