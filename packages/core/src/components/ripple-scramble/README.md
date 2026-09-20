# Ripple Scramble

Interactive multi-column typography where clicks trigger a radial shockwave, scrambling text into glyphs before resolving with crisp focus.

## Usage

```tsx
import { RippleScramble } from "@abyss-ui/core";

<RippleScramble
  variant="classic"
  waveSpeed={950}
  scrambleDuration={340}
  fontSize={20}
  lineHeightScale={1.65}
  staticOpacity={0.32}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `RippleScrambleVariant` | `"classic"` | Color palette and glyph character set (`classic`, `editorial`, `matrix`, `nebula`) |
| `waveSpeed` | `number` | `950` | Radial expansion speed in px/s |
| `scrambleDuration` | `number` | `340` | Scramble hold duration in ms |
| `fontSize` | `number` | `20` | Base typographic font size in px |
| `lineHeightScale` | `number` | `1.65` | Line height scale multiplier |
| `staticOpacity` | `number` | `0.32` | Resting text field opacity |
