# ABYSS — TECHNICAL DESIGN RECORD

**Version:** 2.0.0
**Project Name:** Abyss
**Status:** Active

---

## TABLE OF CONTENTS

1. [Stack Overview](#1-stack-overview)
2. [Framework & Runtime](#2-framework--runtime)
3. [Styling](#3-styling)
4. [Animation Technologies](#4-animation-technologies)
5. [3D & WebGL](#5-3d--webgl)
6. [Motion Philosophy](#6-motion-philosophy)
7. [Performance](#7-performance)
8. [Component Architecture](#8-component-architecture)
9. [Skills Reference](#9-skills-reference)

---

## 1. STACK OVERVIEW

Not every component uses every technology. The stack below is what Abyss has available. Each component picks what it needs — nothing more. Installing all of these as dependencies is good practice; they are all lightweight enough to tree-shake when unused.

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + React |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + vanilla CSS custom properties |
| DOM Animation | GSAP + Lenis |
| React Animation | Framer Motion |
| Page Transitions | Barba.js |
| SVG/sequence Animation | Anime.js |
| 3D | Three.js + React Three Fiber (R3F) + Drei |
| Shaders | GLSL (via Three.js ShaderMaterial / RawShaderMaterial) |

---

## 2. FRAMEWORK & RUNTIME

### Next.js (App Router) + React 18

- All routing via App Router (`app/` directory). File-based.
- Use **Server Components** by default. Add `"use client"` only when the component touches refs, DOM, animation hooks, or browser APIs.
- TypeScript strict mode everywhere. No `any` without a comment explaining why.
- `next/font` for all font loading — never raw `<link>` tags for fonts used in layout.tsx (CDN links for Fontshare/Google Fonts are the exception, loaded in `<head>`).

### Key rules

- Components in `packages/core/src/components/` are React components exported as-is. They do not depend on Next.js internals.
- Never use `useState` for values that live only inside an animation loop — read from refs or `window` directly.
- Dynamic imports (`next/dynamic`) with `{ ssr: false }` for any component that uses `window`, WebGL canvas, or Three.js.

---

## 3. STYLING

### Tailwind CSS

- Version 4. Utility-first.
- Design tokens live in CSS custom properties (`dock-material.css`, `globals.css`) — not in `tailwind.config`. Tailwind utilities reference these vars via `@theme`.
- Do not add arbitrary Tailwind classes for values that already exist as a CSS token. Use the token.

### CSS Custom Properties

- All design tokens (colors, easing, surfaces) defined in `:root` in `dock-material.css` and `globals.css`.
- Use `var(--token)` directly in CSS or inline styles when Tailwind utility doesn't cover it.
- Easing curves are always tokens — never write a raw `cubic-bezier()` inline.

### Scrollbar elimination

Globally applied in `globals.css`. All scrollbars hidden across the app — `scrollbar-width: none`.

---

## 4. ANIMATION TECHNOLOGIES

### 4.1 GSAP

**When to use**: Scroll-driven animations, complex multi-stage timelines, text splitting, stagger orchestration, anything that needs precise timing control.

**Rules**:
- Always inside `useGSAP()` from `@gsap/react`. Never raw `useEffect` + `gsap.to()`.
- Register plugins once at module level: `gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Flip, Draggable, MotionPath)`.
- `overwrite: "auto"` on every re-triggerable `gsap.to()` to prevent accumulation.
- Kill all ScrollTrigger instances on component unmount. Use `gsap.context()` cleanup or the `useGSAP` return value.

**Plugins in use**:

| Plugin | Purpose |
|---|---|
| `ScrollTrigger` | Scroll-position-linked animations. Use `scrub`, `pin`, `snap` — never just `toggleActions` for anything interesting |
| `SplitText` | Split text into chars/words/lines for stagger animations. Required for any text entrance animation |
| `CustomEase` | Register and use named easing curves. Never use default GSAP ease strings (`power1`, `elastic`) on final work |
| `Flip` | Smooth layout transitions — element moving from one DOM position to another |
| `Draggable` | Drag interactions with bounds, inertia, snap |
| `MotionPath` | Animate along SVG paths |

**Lenis + GSAP sync** — required when both are active:
```js
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

### 4.2 Framer Motion

**When to use**: Spring physics interactions, gesture-driven components (drag, hover, tap), `AnimatePresence` for exit animations, scroll-linked values via `useScroll`/`useTransform`, layout animations.

**Rules**:
- Always specify spring config explicitly: `stiffness`, `damping`, `mass`. Never use default spring.
- `AnimatePresence` around any element that conditionally renders — no element disappears without an exit animation.
- `whileInView` with `viewport={{ once: true }}` for scroll-triggered entrances.
- `useMotionValue` + `useVelocity` for cursor-reactive components.

**Common spring configs**:

| Use case | Config |
|---|---|
| Default element reveal | `{ stiffness: 300, damping: 30, mass: 1 }` |
| Text / letter stagger | `{ stiffness: 80, damping: 14, mass: 1 }` |
| Snappy hover / button | `{ stiffness: 400, damping: 25, mass: 0.8 }` |
| Cursor trailing ring | `{ stiffness: 200, damping: 20 }` |

### 4.3 Lenis

**When to use**: Any page that needs smooth scroll inertia. Apply globally in `SmoothScrollProvider`.

**Rules**:
- Sync with GSAP ticker (see §4.1).
- Disable on showcase pages where component has its own scroll logic — prevent double scroll handling.
- Respect `prefers-reduced-motion`: if reduced motion, disable Lenis and restore native scroll.

### 4.4 Barba.js

**When to use**: Page-to-page transitions where a hard navigation would feel jarring. Pairs with GSAP for leave/enter animations.

**Rules**:
- Always cancel Lenis scroll and kill active ScrollTriggers in the `leave` hook before transition starts.
- Reinitialize Lenis and ScrollTrigger in the `after` hook.
- Keep transitions under 600ms total — transition is a moment, not a performance.

### 4.5 Anime.js

**When to use**: SVG path animations, sequence-based animations on non-React DOM elements, lightweight alternatives to GSAP for simple cases where the full GSAP plugin weight is not justified.

**Rules**:
- Do not use alongside GSAP on the same element — pick one engine per element.
- Cancel animations on component unmount: store the anime instance in a ref and call `.pause()` / `.reset()`.
- SVG morphing and path drawing are primary use cases.

---

## 5. 3D & WEBGL

### 5.1 Three.js

**When to use**: Any component that needs a GPU canvas for visual effects that cannot be achieved in DOM.

**Capability areas** — shaders are ONE option, not the default:

| Technique | When to use |
|---|---|
| **Geometry** (`PlaneGeometry`, `InstancedMesh`, `BufferGeometry`) | Particle systems, depth layers, deformation, dissolve effects |
| **PBR Materials** (`MeshPhysicalMaterial`) | Glass, metal, iridescence, clearcoat, transmission — zero GLSL needed |
| **Lighting / Camera** (`SpotLight`, `PointLight`, dolly zoom, `BokehPass`) | Dramatic light choreography, rack focus, shadow theater |
| **Post-processing** (`EffectComposer`, bloom, DOF, FXAA, color grading) | Full-scene visual effects pipeline |
| **Custom shaders** (`ShaderMaterial`, `RawShaderMaterial`) | When no built-in material or post-process achieves the target effect |

### 5.2 React Three Fiber (R3F)

**When to use**: Three.js inside React components. Preferred over imperative Three.js setup for any component that lives in the React tree.

**Rules**:
- Isolate `<Canvas>` as a leaf component — never nest another Canvas inside it.
- `useFrame` for per-frame updates — never `requestAnimationFrame` manually inside R3F.
- Use `@react-three/drei` abstractions (`useTexture`, `OrbitControls`, `Environment`) before rolling your own.
- Dispose of geometries, materials, and textures on unmount via `useEffect` cleanup or the `dispose` prop.
- `delta` from `useFrame((_state, delta) => { ... })` for frame-rate-independent animation — never assume `delta = 0.016`.

### 5.3 GLSL Shaders

**When to use**: Only when built-in Three.js materials, geometry, lighting, and post-processing cannot achieve the effect.

**Shader component archetypes**:

| Archetype | Structure | When |
|---|---|---|
| A — Inline shader | `AbyssCanvas` + GLSL as template string in `.tsx` | Single-pass, small shader |
| B — Imported GLSL | `AbyssCanvas` + `.glsl` files | Single-pass, large shader |
| C — Multi-pass | Own `THREE.WebGLRenderer` + ping-pong FBOs | Fluid simulation, reaction-diffusion |

**Rules**:
- Always use `precision mediump float` unless high precision is demonstrably needed.
- Frame-rate independence: use `u_time` uniform fed from `clock.getDelta()`, not fixed step.
- Dispose: call `material.dispose()`, `geometry.dispose()`, `texture.dispose()` on unmount.
- Never animate `u_time` by incrementing by a fixed `0.016` — use actual delta.

---

## 6. MOTION PHILOSOPHY

This section is about how to think about motion, not which library to use.

### 6.1 Simple > Complex

The best animation is the one that feels inevitable — where you don't notice the technique, only the result. A single well-tuned spring beats a 10-tween timeline. A one-line `gsap.to()` with the right easing beats a choreographed sequence that nobody notices.

Before reaching for a complex solution, ask: can a single CSS transform + one easing curve achieve 80% of this? If yes, do that first.

### 6.2 Physics Over Timing

Duration-based animations (`animate for 0.4s`) feel mechanical. Spring-based animations (`stiffness: 200, damping: 20`) feel alive. Prefer spring physics for anything interactive — hover, drag, scroll-linked, cursor-reactive.

Physics-based systems also handle interruptions naturally: if the user reverses direction mid-animation, a spring responds correctly. A fixed-duration tween doesn't.

### 6.3 The Three Motion Questions

Before writing any animation code, answer these:

1. **What is the physical metaphor?** (spring / fluid / gravity / inertia / decay / snap)
2. **What triggers it?** (scroll position / viewport entry / cursor / interaction / load)
3. **What does the idle state look like?** (fully resolved spring / subtle drift / static)

If you can't answer all three, you don't know what you're building yet.

### 6.4 Motion That Means Something

Every animation in Abyss must communicate state or cause. If an element moves for no functional or narrative reason, remove the animation. Moving things draw the eye — use that attention deliberately.

**Good motion:**
- A card lifts on hover → communicates interactivity and depth.
- Text letters stagger in → communicates sequence and weight.
- A component reacts to cursor → communicates that it's alive and responsive.

**Bad motion:**
- A div fades in on load for no reason.
- Elements rotate slowly in the background with no relation to user input.
- Transitions that run every time a component re-renders.

### 6.5 Avoid Over-Engineering

Common over-engineering patterns to avoid:

- Using a 5-tween GSAP timeline when a single spring does the job.
- Adding `useTransform` chains 6 levels deep when one `useTransform` covers it.
- Writing custom shader effects for things achievable with CSS `filter` or `mix-blend-mode`.
- Creating custom scroll listeners when ScrollTrigger already handles it.
- Reinventing `useMemo` logic that Framer Motion's `useMotionValue` already provides.

The goal is the effect, not the complexity of the implementation.

---

## 7. PERFORMANCE

### 7.1 Frame Rate Targets

Abyss components must run smoothly at both **60fps and 120fps+**. Users on high-refresh monitors (120Hz, 144Hz, 240Hz) should not see animations capped at 60fps.

**The rule**: never assume a fixed frame rate. Always compute animation values from delta time.

```js
// GSAP — delta-time is handled internally, but for manual calculations:
gsap.ticker.add((time, deltaTime) => {
  // deltaTime is in ms. Convert to seconds: deltaTime / 1000
});

// R3F / Three.js:
useFrame((_state, delta) => {
  mesh.rotation.y += speed * delta; // frame-rate independent
});

// Manual lerp — NEVER do this:
value = lerp(value, target, 0.08); // breaks at 120fps

// DO this instead (delta-corrected damp):
value = value + (target - value) * (1 - Math.pow(1 - factor, delta * 60));
```

### 7.2 GPU-Only Animations

Only animate properties the GPU can composite without triggering layout or paint:

| Allowed | Banned |
|---|---|
| `transform: translate/rotate/scale` | `width`, `height` |
| `opacity` | `top`, `left`, `right`, `bottom` |
| `filter` (sparingly) | `margin`, `padding` |
| CSS custom properties (via GSAP) | `font-size`, `border-radius` (in loops) |

### 7.3 Off-Screen Pause

All animations — GSAP, R3F, Anime.js — must pause or suspend when their component is off-screen. Use:

- ScrollTrigger's built-in pause when out of viewport.
- `IntersectionObserver` for non-scroll animations — pause RAF when `!isIntersecting`.
- R3F: the `<Canvas>` frameloop can be set to `"demand"` for components that only need to render on interaction.

### 7.4 WebGL Disposal

Every Three.js component must dispose on unmount:

```js
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    texture.dispose();
    renderer.dispose();
  };
}, []);
```

Forgetting this causes GPU memory leaks that accumulate as users navigate between showcase pages.

### 7.5 React Performance

- No `useState` for values updated inside animation loops — use refs.
- No inline object/array creation inside `useFrame` or `gsap.ticker` — allocate outside the loop.
- Memoize expensive computed values with `useMemo`. Memoize callback props passed to children with `useCallback`.
- R3F: use instanced rendering (`InstancedMesh`) for anything rendering more than ~50 identical meshes.

### 7.6 Asset Optimization

- Images: WebP or AVIF. Use `next/image` with `priority` for above-fold images, `loading="lazy"` for below.
- WebGL textures: load at appropriate resolution. No 4K textures for an 800px viewport slot.
- Preload textures for the next component in the showcase navigator while the user is viewing the current one.
- WOFF2 for all self-hosted fonts.

---

## 8. COMPONENT ARCHITECTURE

### 8.1 File Structure

Each component lives in its own directory under `packages/core/src/components/[component-name]/`:

```
[component-name]/
├── index.tsx        ← default export, the React component
├── types.ts         ← prop types / interfaces (if needed)
├── [name].glsl      ← shader source (archetype B only)
└── README.md        ← brief description (optional)
```

### 8.2 AbyssCanvas

A shared single-pass WebGL renderer in `packages/core/src/engine/AbyssCanvas.tsx`. Handles:
- Texture loading from image URL prop
- Resize observer + viewport management
- Hover coordinate lerp (mouse position → normalized UV)
- Dispose on unmount

Use `AbyssCanvas` for archetype A and B components. Do not re-implement texture loading, resize handling, or hover lerp inside individual components.

### 8.3 Prop Conventions

- Every tunable value must be a prop with a sensible default.
- Props are typed in `types.ts` or inline in `index.tsx`.
- No hardcoded magic numbers for anything a user might want to change (speed, distortion amount, friction, color, etc.).

### 8.4 Controls

Every component on the showcase page surfaces its tunable props in the `ControlsDrawer`. Define the controls array in `component-details.ts` under the `controls` field. Every prop that affects the visual output should have a corresponding control.

---

## 9. SKILLS REFERENCE

Before building with any technology in this stack, read the relevant skill file. This is not optional.

| Technology | Skill(s) to read |
|---|---|
| GSAP (general) | `gsap-scrolltrigger` skill |
| GSAP + React | `gsap-react` skill |
| Framer Motion | `motion-framer` skill |
| React Three Fiber | `r3f-best-practices` skill, `react-three-fiber` skill |
| Three.js | `threejs-fundamentals`, `threejs-materials`, `threejs-shaders`, `threejs-animation` |
| Smooth scroll | `locomotive-scroll` skill (Lenis patterns) |
| Page transitions | `barba-js` skill |
| General animation | `motion-design` skill, `animate` skill |
| UI/UX decisions | `ui-ux-pro-max` skill |
| Frontend design | `design-taste-frontend` skill |

**When none of the above apply** — use `find-animation-opportunities` to audit before adding new motion.

**Performance check** — use `improve-animations` and `review-animations` skills when auditing existing component motion.

---

*Product definition lives in `pdr.md`. Website design system lives in `design.md`. Implementation plans live in `Majorplan.md`.*
