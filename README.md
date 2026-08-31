<h1 align="center">ABYSS</h1>

<p align="center">Interactive component library for the web</p>

<p align="center">
  <a href="https://abssy.vercel.app/">Live Site</a>
</p>

---

## About

Abyss is an open-source collection of interactive, animated React components built for creative web projects. It focuses on visual effects that are difficult to build from scratch: GPU shaders, scroll-driven animations, 3D viewports, cursor interactions, and image galleries with depth.

The library currently contains **33 components**. Each component is self-contained, individually importable, and ships with a live preview, adjustable controls, and viewable source code on the website.

Abyss is structured as a monorepo. The `apps/web` workspace is the website you see at [abssy.vercel.app](https://abssy.vercel.app/). The `packages/core` workspace holds every component.

---

## What's Inside

A few highlights:

| Component | What It Does |
|---|---|
| `gimbal-stream` | Infinite-scroll 3D gallery inside a ray-marched obsidian chamber with five gimbal-mounted card rings and liquid mercury centerpiece |
| `cascade-gallery` | Editorial 3D diagonal conveyor gallery with thermal emulsion reveal, lateral tab pull, and a live mechanical chronometer |
| `theme-toggle-redesign` | Two reimagined light/dark toggles: a 3D plunge dial with expanding screen wave, and a lamp pull cord with Verlet bead physics |
| `hover-media-stream` | Typography stream with aperture-unroll video reveals and frame-synced ambient backlighting on hover |
| `erosion-map` | Scroll-driven Perlin noise erosion that weathers images away layer by layer with glowing active edges |

Browse all 33 at [abssy.vercel.app/collection](https://abssy.vercel.app/collection).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15, React 19, TypeScript |
| 3D Rendering | Three.js, React Three Fiber, Custom GLSL Shaders |
| Animation | GSAP with ScrollTrigger |
| Scrolling | Lenis |
| Styling | Tailwind CSS, CSS Modules |
| Package Manager | npm workspaces (monorepo) |

---

## Setup

```
npm install
npm run dev
```

Requires Node.js 18+. The dev server runs at `localhost:3000`.

To build for production:

```
npm run build
```

---

## Repository Layout

```
abyss/
├── apps/web/           Next.js website
├── packages/core/      Component source code
```

Each component in `packages/core/src/components/` has its own directory containing the React component, any GLSL shaders it uses, and its type definitions.

The website reads from a component registry (`apps/web/src/lib/registry/`) that maps slugs to metadata and dynamic imports. Adding a new component means adding it to this registry and placing its code in the core package.

---

## How Components Work

Every component in Abyss follows the same interface. They receive a standard props object (`VesselComponentProps`) and render inside a container that handles resizing, error boundaries, and control panels.

Components are loaded via `next/dynamic` with `ssr: false` since most rely on browser APIs (WebGL, Canvas, IntersectionObserver). This means they are code-split by default and don't affect initial page load for routes that don't use them.

The website provides a control panel for each component. Controls are defined as metadata in the registry (sliders, toggles, selects, color pickers) and passed to the component as props. This lets users experiment with parameters without touching code.

---

## Contributing

Contributions are accepted via pull requests.

If the change is non-trivial (new component, architectural change, dependency addition), open an issue first to discuss the approach. Small fixes and improvements can go straight to a PR.

All PRs should include a clear description of what changed and why.

---

## License and Usage

Apache License 2.0. Free for personal and commercial use.

You can use Abyss components in your own projects, modify them, and distribute them. If you modify the source, you must state what you changed. Attribution is appreciated but not legally required beyond what the license asks.

You get a patent grant from every contributor, meaning you can use the code without worrying about patent claims from the people who wrote it.

You may not re-publish the library itself as your own product.

Full license text in [LICENSE](./LICENSE).

---

<p align="center">
  <a href="https://abssy.vercel.app/">abssy.vercel.app</a>
</p>
