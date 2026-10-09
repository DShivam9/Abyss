# Gooey Loop

An infinite horizontal card reel where photos show through bold letter cutouts that liquefy and drip on hover.

## Usage

```tsx
import { GooeyLoop } from "@abyss-ui/core";

<GooeyLoop
  scrollSpeed={1.0}
  parallaxIntensity={120}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `"GOOEY LOOP"` | Title text displayed at the top center |
| `caption` | `string` | `"SCROLL & DRAG"` | Caption text displayed at the bottom center |
| `plates` | `PlateItem[]` | `DEFAULT_PLATES` | Custom plate items with cutout coordinates and image paths |
| `scrollSpeed` | `number` | `1.0` | Multiplier for mouse wheel and touch scroll responsiveness |
| `parallaxIntensity` | `number` | `120` | Inner image displacement depth as cards scroll through the viewport center |
