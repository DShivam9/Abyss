# Apparatus Accordion Wall

A tactile vertical image accordion that unfolds like a folding screen divider, collapsing neighbor panels while revealing title text and folding shadows.

## Features
- **GSAP Sizing Tween**: Custom easing for fluid flex-grow expansion and compression.
- **Crease Fold Shadows**: Side shadows on panels dynamically darken when collapsed and fade out when flat-lit (active), simulating depth.
- **Crease Line Flash**: A horizontal line of light briefly flashes across the panels during transitions to enhance the folding aesthetic.
- **Text Reveal**: Slide-and-fade titles for the active panel.
- **Interactive Trigger**: Supports both hover-based and click-based triggers.

## Props
```typescript
import { ApparatusAccordionWallProps } from "@abyss-ui/core";
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `images` | `string[]` | *Fallback list* | List of image URLs for the accordion panels. |
| `titles` | `string[]` | *Fallback list* | List of titles for each panel. |
| `subtitles` | `string[]` | *Fallback list* | List of subtitles for each panel. |
| `interactiveMode` | `"hover" \| "click"` | `"hover"` | How the panels are activated. |
| `activePanelIndex` | `number` | `undefined` | Active panel index (for controlled usage). |
| `onActivePanelChange` | `(index: number) => void` | `undefined` | Callback when the active panel index changes. |
```
