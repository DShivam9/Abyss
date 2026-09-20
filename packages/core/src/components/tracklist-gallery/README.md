# Tracklist Gallery

Minimalist editorial audio tracklist pairing responsive scroll scrub with album artwork crossfades, synthesized acoustic notch clicks, and dynamic track palette illumination.

## Usage

```tsx
import { TracklistGallery } from "@abyss-ui/core";

<TracklistGallery
  scrubSmoothness={0.8}
  titleSize={72}
  artworkCrossfade={0.5}
  itemScrollDistance={400}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `tracks` | `TrackItem[]` | `DEFAULT_TRACKS` | Array of audio track specimens with artwork, audio, and metadata |
| `scrubSmoothness` | `number` | `0.8` | Virtual scroll inertia damping weight in seconds |
| `titleSize` | `number` | `72` | Typographic headline font size in pixels for active tracks |
| `artworkCrossfade` | `number` | `0.5` | Crossfade duration in seconds between adjacent album artwork |
| `itemScrollDistance` | `number` | `400` | Virtual scroll height in pixels required to advance between tracks |
