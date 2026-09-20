# Pillar Gallery

Vertical image pillars that rise on hover and expand into a towering fullscreen gallery with ambient lighting and floating typography.

## Usage

```tsx
import { PillarGallery } from "@abyss-ui/core";

<PillarGallery
  panelCount={8}
  speed={1.35}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `AccordionWallItem[]` | `DEFAULT_ACCORDION_ITEMS` | Array of image items with titles and ambient mood colors |
| `panelCount` | `number` | `8` | Number of active monolith pillars rendered (4 to 8) |
| `speed` | `number` | `1.35` | Transition speed in seconds for hover and fullscreen reveals |
| `watermarkText` | `string` | `"Hover to Unveil • Click to Expand"` | Watermark instruction text in the void space |
| `onExpand` | `(index: number \| null) => void` | `undefined` | Callback fired when a pillar expands into fullscreen view |
