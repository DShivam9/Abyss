# Abyss

Live Showcase: [**abssy.vercel.app**](https://abssy.vercel.app/)

**Abyss** is a high-end, open-source React component library designed for immersive, physics-driven, and kinetic layout interactions. Inspired by elite creative agency portfolios and editorial web aesthetics, Abyss moves past generic, boxy SaaS dashboard card grids into fluid, motion-rich canvases where layout, typography, and depth-of-field communicate state and capture attention.

---

## Specimen Showcase: `ApparatusDualWave`

The flagship component of the Abyss showcase is `ApparatusDualWave`—an experiential carousel that splits a list of specimen items into two columns flanking an active, sequentially transitioning center image.

### Architectural Features

- **Kinetic Momentum:** Simulates a physical roulette wheel or high-momentum spinner. Driven by frame-rate independent physics with exponential velocity retention.
- **Progressive Defocus:** Mapped GPU-accelerated CSS blur filtering that progressively defaces elements as they migrate away from the focal horizontal center axis.
- **Path Slope Slant:** Items dynamically tilt to align with the tangent slope of the visual layout curves.
- **Curve Blending:** Seamlessly transitions between a sharp V-shape triangle track and a rounded hemisphere circular track.
- **Corner Stretch:** Horizontal offset mechanics stretch starting bounds to the absolute corners of the viewport based on dynamic screen width.
- **Interpolated Presets:** Custom ease-out animation loops that fluidly glide all sliders between default states and cinematic presets.
- **PPEditorialNew Serif Font:** Specimen items render using local `PPEditorialNew-UltralightItalic` styling, highlighting the thin, high-fashion editorial serif aesthetic.

---

## Quick Usage

```tsx
import React from "react";
import { ApparatusDualWave } from "@abyss-ui/core";

const SpecimenList = [
  { id: "01", name: "AÉTHYR • 1", imageSrc: "/images/cosmos_1.jpg" },
  { id: "02", name: "MÉLANCØLIE", imageSrc: "/images/cosmos_2.jpg" },
  { id: "03", name: "BASALT DUST", imageSrc: "/images/cosmos_3.jpg" },
  { id: "04", name: "COPPER SHARD", imageSrc: "/images/cosmos_4.jpg" },
];

export default function Showcase() {
  return (
    <main className="w-screen h-screen bg-black overflow-hidden relative">
      <ApparatusDualWave 
        items={SpecimenList}
        isFullscreen={true} 
      />
    </main>
  );
}
```
