# Abyss

[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel&style=flat-square)](https://abssy.vercel.app/)
[![React Version](https://img.shields.io/badge/React-19-blue?logo=react&style=flat-square)](https://react.dev)
[![Next.js Version](https://img.shields.io/badge/Next.js-15-black?logo=next.js&style=flat-square)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&style=flat-square)](https://www.typescriptlang.org/)

**Abyss** is a high-end, open-source React component library designed for immersive, physics-driven, and kinetic layout interactions. Inspired by elite creative agency portfolios (such as Locomotive and Codrops) and editorial web aesthetics, Abyss moves past generic, boxy SaaS dashboard card grids into fluid, motion-rich canvases where layout, typography, and depth-of-field communicate state and capture attention.

Live Demo & Showcase: [**abssy.vercel.app**](https://abssy.vercel.app/)

---

## ✦ Key Philosophy

Most modern component libraries optimize for high-density tabular data or minimal form layouts. Abyss is built for **experiential frontends**—landing pages, product showcases, editorial journals, and immersive portfolio sites. 

Every component is developed under strict design principles:
- **Kinetic Momentum:** Natural-feeling scroll and drag physics featuring exponential decay friction and velocity retention.
- **Visual Depth:** GPU-accelerated progressive blurring, perspective scaling, and multi-layered parallax offsets.
- **Dynamic Tangents:** Aligning text and elements dynamically along mathematical curves, slope-matching tangents, and vector-aligned layouts.
- **Aesthetic Typography:** Built-in pairings for high-end editorial display serifs (e.g., `PP Editorial New`) and variable geometric sans-serifs (e.g., `Satoshi`).

---

## ✦ Featured Component: `ApparatusDualWave`

The flagship component of the Abyss specimen showcase is **ApparatusDualWave**—an experiential carousel that splits 24 specimen name items into two columns flanking an active, sequentially transitioning center image.

### Architectural Spec Sheet

| Feature | Description | Technical Implementation |
|---|---|---|
| **Kinetic Inertia** | Simulates a physical roulette wheel or high-momentum spinner. | Delta-time (`dt`) frame-rate independent calculation using exponential friction multiplier (`Math.exp(-2.2 * dt)`). |
| **Progressive Defocus** | Fades elements out of focus as they migrate away from the horizontal center line. | GPU-accelerated CSS `blur()` filter mapped to distance-to-center ratios (`0px` to `12px`). |
| **Path Slope Slant** | Items dynamically tilt to align with the tangent slope of the layout track. | Inline CSS `transform: rotate()` calculation based on height offset gradients (`0°` to `25°`). |
| **Curve Blending** | Transitions between a sharp V-shape track and a curved hemisphere track. | Curvature interpolation merging a linear triangle profile with a circular arc track. |
| **Corner Stretch** | Extends the starting baseline span horizontally to the edges of the viewport. | Viewport width (`W`) bounding metrics mapping 0% (centered) to 100% (corner-pinned) anchors. |
| **Interpolated Presets** | Fluidly morphs all parameters between Reset Default and Cinematic Preset. | Linear-to-cubic easing loops driven by `requestAnimationFrame` over a 500ms time window. |

---

## ✦ Repository Architecture

Abyss is structured as a TypeScript monorepo to guarantee clean separations of concerns between the core package build and the showcase website.

```
abyss/
├── apps/
│   └── web/                   # Next.js 15 showcase application (abssy.vercel.app)
│       ├── public/            # Static assets and custom fonts (PPEditorialNew, Satoshi)
│       └── src/
│           ├── app/           # App Router pages and custom layout wrappers
│           └── components/    # Context providers and client wrappers
├── packages/
│   └── core/                  # Main component package (@abyss-ui/core)
│       ├── src/
│       │   ├── components/    # Reusable component implementations (ApparatusDualWave, etc.)
│       │   └── index.ts       # Package entry-point exports
│       └── package.json
└── package.json
```

---

## ✦ Getting Started

### Prerequisites

Ensure you have Node.js (version 18 or above) installed.

### Installation

Clone the repository and install the dependencies from the root directory:

```bash
git clone https://github.com/DShivam9/Abyss.git
cd Abyss
npm install
```

### Run Local Development Server

Start the monorepo workspace in development mode:

```bash
npm run dev
```

This boots up the Next.js showcase client, making it accessible locally at [**http://localhost:3000**](http://localhost:3000).

### Build Workspaces

To compile and verify all packages and applications for production release:

```bash
npm run build
```

---

## ✦ Quick Usage Example

Below is a simple example of how to import and deploy the `ApparatusDualWave` component inside a React workspace:

```tsx
import React from "react";
import { ApparatusDualWave } from "@abyss-ui/core";

const SpecimenList = [
  { id: "01", name: "AÉTHYR • 1", imageSrc: "/images/cosmos_1.jpg" },
  { id: "02", name: "BASALT DUST", imageSrc: "/images/cosmos_2.jpg" },
  { id: "03", name: "SŒUR-NATURE", imageSrc: "/images/cosmos_3.jpg" },
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

---

## ✦ Licenses & Attribution

- **Core Codebase:** Open-sourced under the MIT License.
- **Custom Fonts:** Loaded locally for development/showcase demonstration purposes. (Make sure to verify corresponding licensing guidelines for `PP Editorial New` and `Satoshi` before deploying commercial applications).
