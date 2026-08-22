# ABYSS — PRODUCT DESIGN RECORD

**Version:** 1.0.0
**Project Name:** Abyss
**Status:** Active

---

## TABLE OF CONTENTS

1. [What Abyss Is](#1-what-abyss-is)
2. [The Philosophy](#2-the-philosophy)
3. [What We Build](#3-what-we-build)
4. [Who It's For](#4-who-its-for)
5. [How It Works](#5-how-it-works)
6. [The Website](#6-the-website)
7. [Quality Bar](#7-quality-bar)
8. [Licensing](#8-licensing)
9. [What Abyss Is Not](#9-what-abyss-is-not)

---

## 1. WHAT ABYSS IS

Abyss is a free, open-source React component library for developers and creatives who want something with a bit more personality.

Every component is built to feel distinct — motion-driven, aesthetically considered, and a little different from what you usually reach for. Each one is meant to make someone pause and take a second look.

We take heavy inspiration from the web — from Codrops, Awwwards, Godly, skiper-ui, inspo.page — but we don't copy. We study how things work, then put our own spin on them. Every component has our touch to it.

---

## 2. THE PHILOSOPHY

### Make things that feel alive.

Abyss components are not wrappers around layout primitives. They are not carousels, accordions, or dropdowns with a coat of paint. They are interactions — things that respond, distort, react, reveal, and breathe.

### One-off showpieces.

Every component is its own universe. There is no rigid system enforcing that every component looks like every other one. The only consistency is the commitment to craft. Each component is built to be visually and technically distinct.

### Inspiration is not copying.

We look at what the best studios, creative developers, and motion designers are building on the web. We understand the mechanics — the shader techniques, the GSAP choreography, the physics models — and we use those as a starting point. Then we change them. Add our own logic, our own aesthetic choices, our own constraints. The output is ours.

### Assets are props, not decisions.

Each component ships with demo content — images, text, video — that shows what it's capable of. When a user drops a component into their project, they replace those assets with their own. The component itself is the interaction engine; the content is theirs to define.

---

## 3. WHAT WE BUILD

Abyss components can use any asset type — images, text, video, or combinations of all three. The asset type is determined by what serves the interaction concept, not by a library-wide rule.

**Techniques we use (not an exhaustive list):**

- **WebGL / Shaders** — Single-pass fragment shaders, custom GLSL effects, multi-pass FBO simulations. Used when the visual effect cannot be achieved in DOM.
- **Three.js / React Three Fiber** — 3D geometry, particle systems, ring carousels, depth effects. Used when the component needs a 3D spatial quality.
- **GSAP** — ScrollTrigger-driven animations, SplitText typography effects, complex multi-stage timelines. Used for scroll choreography and DOM animation.
- **Framer Motion** — Spring physics, gesture-driven interactions, layout animations. Used for cursor-reactive and physics-driven DOM components.
- **CSS 3D / DOM** — Perspective transforms, clip-path morphing, mask animations. Used when the effect can be achieved purely in the browser without a GPU canvas.

**Component archetypes (internal classification):**

| Archetype | Engine | When |
|---|---|---|
| A — Inline shader | AbyssCanvas + GLSL in template strings | Single-pass shader, compact GLSL |
| B — Imported GLSL | AbyssCanvas + .glsl files | Single-pass shader, larger GLSL |
| C — Multi-pass WebGL | Own THREE.WebGLRenderer | Ping-pong FBOs, fluid simulation |
| D — DOM / GSAP | No Three.js. Pure GSAP + CSS | Scroll, layout, transitions, type |

**Current categories:**

| Category | Focus |
|---|---|
| Light and Texture | Material effects — stone, metal, engraving, liquid, thermal |
| Scroll Perspectives | Scroll-driven spatial depth and parallax interactions |
| Spatial Galleries | 3D navigation, cursor trails, ring carousels, orbit layouts |
| Type and Motion | Typography effects, kinetic text, scroll-driven text reveals |

---

## 4. WHO IT'S FOR

**The creative frontend developer.**
Someone who knows how to build things but doesn't want to spend weeks figuring out the physics model for a liquid distortion or the scroll scrub logic for a parallax depth stack. Abyss gives them a working, production-quality starting point they can understand, modify, and own.

**The portfolio builder.**
Someone building their own site who wants it to look genuinely different — not another Tailwind + shadcn clone. They come to Abyss to find something that makes their work feel distinct.

**The creative developer.**
Someone who thinks of interfaces as art. They use Abyss the way a musician samples — as a source of techniques and ideas to remix into their own work.

**The common thread:** all three are people who have seen enough generic UI. They want something that makes someone pause.

---

## 5. HOW IT WORKS

### Getting a component

Users browse the Abyss website, find a component they want, view the live interactive demo, and copy the source code directly from the page. They paste it into their project, swap in their own assets (images, text, video), and customize to their needs.

A CLI tool (npx abyss-ui add <component>) is planned as a convenience layer on top of the website. It will let developers install a component and its dependencies directly into their project without manual copying. This is a future addition — the website is the primary access point today.

### Customizing

Every component is shipped as readable, typed React/TypeScript source. Props are documented. The underlying physics, shader uniforms, and easing values are named and explained so users can tune them. Nothing is a black box.

### Framework

Abyss components are built for React. They are written in TypeScript and use standard React patterns (useRef, useEffect, useLayoutEffect). WebGL components use React Three Fiber with isolated Canvas boundaries. GSAP is always called inside useGSAP() for correct lifecycle management.

---

## 6. THE WEBSITE

The Abyss website is itself a proof of concept. The site should feel like a gallery that someone would screenshot and share — not a documentation page with motion bolted on.

### Collection page (/components)

A full-page card grid of all components, organized into vibe-based sections (not technical categories). Each card shows a preview image and links directly to the component's showcase page.

Users can filter by text search, toggle between grid and masonry layout, and sort alphabetically. The page does not have a traditional sidebar — it's a visual gallery first.

### Showcase page (/showcase/[slug])

Each component gets its own fullscreen interactive showcase. The component is the entire viewport. A minimal floating UI layer — a bottom keycap rail, a left ruler drawer for navigation, and side panels for component info and code — sits around the component without competing with it.

The info panel contains: component description, tech dependencies, use cases, properties, and engineering notes.

The code panel contains: installation instructions (npm/pnpm/yarn/bun tabs) and copy-paste code examples.

### Navigation

A floating dock navbar (centered, pill-shaped) appears on the collection and docs pages. The homepage has its own independent navigation.

---

## 7. QUALITY BAR

An Abyss component must pass an informal gut check: would you screenshot this and share it?

More specifically:

- **It does something you haven't seen before** — or it does something familiar in a way that feels entirely fresh. If it looks like a known tutorial with renamed variables, it's not done.
- **It has a physical quality** — it doesn't just move, it has weight, inertia, a sense of material. A card that slides isn't interesting. A card that feels like it's being peeled off a surface is.
- **The interaction IS the content** — if you stripped the animation, the component would cease to function as intended. Motion is structural, not decoration.
- **It runs at 60fps** — GPU-only properties, correct React lifecycle cleanup, animation paused when off-screen.
- **Every exposed parameter is controllable** — every tunable value (friction, distortion amount, speed, etc.) is exposed as a prop and surfaced in the Controls panel on the showcase page. Nothing is hardcoded that a user might want to change.

---

## 8. LICENSING

Abyss is free and open-source.

- Use any component in personal or commercial projects. No restrictions.
- Modify components however you like.
- Attribution is appreciated but not required.
- Do not resell the Abyss library itself — you may not package and sell our component collection as a premium template bundle or competing library.

---

## 9. WHAT ABYSS IS NOT

**Not a UI kit.** No buttons, inputs, modals, navigation menus, or layout primitives. Abyss does not compete with shadcn/ui, Radix, or Headless UI. Those solve different problems.

**Not a design system.** Abyss components do not enforce a shared color scheme, spacing scale, or token system on your project. Each component is self-contained and opinionated about its own visual language — nothing more.

**Not a copy.** We look at the same sources of inspiration every creative developer does. We do not reproduce existing demos or tutorials and call them components. The inspiration is in the mechanism; the output is original.

**Not finished.** Abyss grows as new component ideas are proven out. Each addition goes through the same quality bar. Quantity is never the goal.

---

*Technical decisions (stack, architecture, file structure) live in tdr.md. Website design decisions (colors, typography, motion language) live in design.md. Implementation plans and phase tracking live in Majorplan.md.*
