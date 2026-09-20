# Hover Media Stream

An editorial typography stream that expands video apertures and moiré interference baselines on hover, synchronized with ambient backdrop glow and tactile audio feedback.

## Usage

```tsx
import { HoverMediaStream } from "@abyss-ui/core";

<HoverMediaStream
  backdropBlur={80}
  ambientBrightness={0.40}
  lineDuration={1.25}
  fontSize={62}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `StreamMediaItem[]` | `DEFAULT_ITEMS` | Array of stream media items containing video or image sources |
| `backdropBlur` | `number` | `80` | Ambient background blur spread in pixels |
| `ambientBrightness` | `number` | `0.40` | Ambient backlight maximum opacity (0 to 1) |
| `lineDuration` | `number` | `1.25` | Duration of the baseline and moiré expansion animation in seconds |
| `fontSize` | `number` | `62` | Font size of the typographic titles in pixels |
| `enableAudio` | `boolean` | `true` | Enables tactile detent audio click feedback on hover |
