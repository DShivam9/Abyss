# Abyss

Live Showcase: [abssy.vercel.app](https://abssy.vercel.app/)

Abyss is an open-source React component library engineered for physics-driven image interactions and kinetic layouts. Instead of static card grids and traditional UI containers, Abyss treats images as reactive physical subjects that respond dynamically to scroll, hover, velocity, and spatial inputs.

> [!WARNING]
> Abyss is under active development. Component APIs and package boundaries may change as the library evolves toward its initial stable release.

---

## Architectural Archetypes

Components in Abyss are built across four distinct execution models depending on performance needs and interaction complexity:

1. **WebGL Engine & Inline Shaders (Archetype A/B)**  
   Single-pass GLSL shaders executing on top of a shared WebGL substrate for continuous surface deformations, displacement mapping, and lighting effects.
2. **Multi-Pass Simulation (Archetype C)**  
   Dedicated WebGL renderers utilizing ping-pong Framebuffer Objects (FBOs) for fluid dynamics, interactive physics simulations, and persistent state buffers.
3. **DOM & Kinetic GSAP Layouts (Archetype D)**  
   Hardware-accelerated DOM transformations driven by GSAP, ScrollTrigger, and continuous physics for velocity-based card decks, Venetian blinds, layout morphs, and text reveals.
4. **Spatial 3D & React Three Fiber (Archetype SG)**  
   Interactive 3D viewports built with Three.js and React Three Fiber for ring galleries, spherical mesh shattering, and typographic grids.

---

## Component Registry

Abyss includes over 40 production components across shader-based, DOM-based, and spatial categories:

| Category | Key Components | Tech Substrate |
| --- | --- | --- |
| **Shader Deformations** | `steel-intaglio`, `procedural-atlas`, `kinetic-portal`, `chromepunk-beast`, `merlin-knights` | WebGL, GLSL, WebGL Engine |
| **Multi-Pass Physics** | `tanvi` | WebGL Ping-Pong FBOs |
| **Kinetic Layouts** | `velocity-deck`, `venetian-blinds`, `accordion-wall`, `layout-morph` | GSAP ScrollTrigger, CSS 3D |
| **Motion & Reveals** | `scroll-text-reveal`, `image-snake-trail`, `clip-morph`, `curved-scroll-wipe` | GSAP, DOM Transforms |
| **Spatial 3D** | `orbit-ring-gallery`, `3d-shatter-sphere`, `3d-typography-grid` | React Three Fiber, Drei |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Runtime**: React 18
- **Language**: TypeScript (Strict Mode)
- **Motion Engine**: GSAP 3 (ScrollTrigger, SplitText, Flip, Draggable) & Framer Motion
- **Graphics Substrate**: WebGL, Three.js, React Three Fiber, Drei
- **Smooth Scroll**: Lenis
- **Styling**: Tailwind CSS
- **Typography**: Satoshi & JetBrains Mono

---

## Repository Structure

This repository is organized as an npm workspace monorepo:

```
Abyss/
├── apps/
│   └── web/                  # Next.js showcase website, interactive controls, and documentation
├── packages/
│   └── core/                 # @abyss-ui/core package containing all components and WebGL engine
├── docs/                     # Architecture specifications, product design records, and guidelines
└── scripts/                  # Build scripts and registry generation utilities
```

---

## Local Development

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/abyss.git
   cd abyss
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

   The showcase site will be available at `http://localhost:3000`.

---

## License

MIT License. Free for personal and commercial use.

