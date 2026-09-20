# Abyss Cursor Fall

Kinetic 3D image spawner plunging floating WebP and SVG cards into a deep atmospheric 3D void on cursor movement.

## Usage

```tsx
import { AbyssCursorFall } from "@abyss-ui/core";

<AbyssCursorFall
  spawnFilter="images-only"
  spawnDistance={50}
  spawnInterval={110}
  imageSize={2.4}
  lifespan={3.0}
  fallSpeed={2.4}
  cameraParallax={2.8}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `images` | `string[]` | `DEFAULT_IMAGES` | Array of image URLs (photos and SVGs) to texture onto 3D cards |
| `spawnFilter` | `"images-only" \| "shapes-only"` | `"images-only"` | Filter spawned cards to only photos or only vector shapes |
| `spawnDistance` | `number` | `50` | Distance threshold in screen pixels to trigger a new 3D card spawn |
| `spawnInterval` | `number` | `110` | Minimum cooldown in milliseconds between card spawns |
| `imageSize` | `number` | `2.4` | 3D size scale of each spawned image card |
| `lifespan` | `number` | `3.0` | Lifespan in seconds before cards fade out and dissolve into the void |
| `fallSpeed` | `number` | `2.4` | Gravity acceleration speed pulling spawned cards down into the void |
| `cameraParallax` | `number` | `2.8` | 3D camera orbit and parallax tracking intensity |
| `spinSpeed` | `number` | `1.0` | 3D tumble spin velocity of floating cards |
