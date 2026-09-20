# Cinema Aisle

An endless 3D cinematic corridor featuring streaming video panels along curved parabolic gallery walls with real-time video reflections across an obsidian glass runway.

## Installation

```bash
npm install @abyss-ui/core three
```

## Usage

```tsx
import { CinemaAisle } from "@abyss-ui/core";

export default function Example() {
  return (
    <div className="relative w-screen h-screen bg-black">
      <CinemaAisle
        title="Cinema Aisle"
        curveFlare={6.2}
        scrollSpeed={1.0}
        reflectionSheen={0.88}
        corridorWidth={3.5}
        driftSpeed={2.0}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `videos` | `string[]` | `DEFAULT_VIDEOS` | Array of video URLs to stream across the corridor panels. Defaults to 16 video clips. |
| `curveFlare` | `number` | `6.2` | Parabolic flare curvature of the aisle walls (0.0 straight to 10.0 deep curve). |
| `scrollSpeed` | `number` | `1.0` | Navigation scroll velocity multiplier (0.5x to 2.0x). |
| `reflectionSheen` | `number` | `0.88` | Obsidian floor reflection sheen opacity (0.0 void to 1.0 high-gloss satin). |
| `corridorWidth` | `number` | `3.5` | Lateral corridor width between left and right video walls (2.4 to 5.2). |
| `driftSpeed` | `number` | `2.0` | Ambient auto-drift cruise velocity (0.0 paused to 4.0 fast cruise). |
| `title` | `string` | `"Cinema Aisle"` | Optional title displayed in the cinematic font at top-center. Set to empty string to hide. |
| `className` | `string` | `""` | Optional CSS class name passed to the container element. |
| `style` | `React.CSSProperties` | `{}` | Optional inline styles passed to the container element. |

## Features

- **Parabolic Wall Curvature**: Video panels dynamically conform to a parabolic mathematical flare, creating natural optical compression into the vanishing point.
- **Obsidian Floor Reflections**: Real-time planar video reflection geometry with distance-attenuated exponential fog falloff.
- **Dual-Mode Navigation**: Combines autonomous ambient cruising with responsive tactile mouse wheel and drag scrub.
- **High-Framerate Video Streaming**: Utilizes hardware-accelerated video texture uploads with adaptive pixel ratio scaling.
