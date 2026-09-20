# Mosaic Loader

A bespoke editorial preloader coordinating organic constellation image cards with high-speed quantum shuffling, a central mechanical vertical odometer drum, and an 8-point geometric octagram HUD. Features gravitational card implosion upon sequence completion, followed by an elegant curtain reveal into interactive editorial manifesto typography.

## Installation

```bash
npm install @abyss-ui/core
```

## Usage

```tsx
import { MosaicLoader } from "@abyss-ui/core";

export default function Example() {
  return (
    <div className="relative w-screen h-screen bg-black">
      <MosaicLoader
        duration={6200}
        startDelay={800}
        onComplete={() => console.log("Loading sequence finished")}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `images` | `string[]` | `DEFAULT_IMAGES` | Array of image URLs to cycle through during the constellation card preloader phase. |
| `duration` | `number` | `6200` | Run time in milliseconds before the gravitational card implosion sequence triggers. |
| `startDelay` | `number` | `800` | Milliseconds to wait before initiating the constellation card and odometer sequence. |
| `lines` | `string[]` | `DEFAULT_EDITORIAL_LINES` | Manifesto text lines revealed sequentially upon preloader curtain lift. |
| `editorialImages` | `string[]` | `DEFAULT_EDITORIAL_IMAGES` | Thumbnail imagery displayed inline as each manifesto row is hovered. |
| `title` | `string` | `undefined` | Optional single title string fallback if custom manifesto lines are omitted. |
| `onComplete` | `() => void` | `undefined` | Callback fired once the preloader transitions completely into the manifesto stage. |
| `className` | `string` | `""` | Optional CSS class name applied to the outermost container element. |
| `style` | `React.CSSProperties` | `{}` | Optional inline styles applied to the outermost container element. |

## Features

- **Quantum Constellation Cards**: 18 organic aspect-ratio card slots with independent spawn delays and rapid visual cycling.
- **Mechanical Odometer Drum**: Stepped vertical digit rolling drum accurately reflecting completion percentage up to 100%.
- **Geometric Octagram HUD**: Precision central 8-point star interface accentuating high-luxury aesthetic tone.
- **Gravitational Implosion**: Dynamic inward card pull towards center screen coordinates before lifting the preloader curtain.
- **Interactive Editorial Manifesto**: Post-load text section featuring line-by-line hover-triggered thumbnail reveals.
