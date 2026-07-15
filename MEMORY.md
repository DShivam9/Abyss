# ABYSS (Vessel) — AGENT MEMORY

> **Read this FIRST.** This file gives any agent instant context about the project without re-reading the entire codebase. Last updated: 2026-07-15.

---

## What This Project Is

**Vessel** is an open-source React component library for **immersive image interactions**. Not a UI kit. Not a dashboard. Each component treats an image as a living, physics-driven subject that breathes, responds, distorts, and reacts.

The repo name is `Abyss`. The product name is **Vessel**. Never use "Absolute UI" or "AbsoluteUI" — those are dead legacy names.

---

## Repository Structure

```
Abyss/
├── .agents/GEMINI.md          ← AGENT CONTRACT. Read before ANY work.
├── apps/web/                  ← Next.js 14 website (App Router)
│   └── src/app/
│       ├── page.tsx           ← Homepage
│       ├── morph-showcase/    ← Scroll-driven formation morph page
│       ├── components/        ← Shared UI components
│       └── docs/              ← Documentation pages
├── packages/
│   ├── core/src/
│   │   ├── engine/            ← VesselCanvas shared renderer
│   │   │   ├── VesselCanvas.tsx   ← Single-pass WebGL substrate
│   │   │   └── types.ts          ← VesselComponentProps, VesselComponentMeta
│   │   └── components/        ← All individual components (31 dirs)
│   └── cli/                   ← Future `npx vessel-ui add` CLI (Phase 2)
├── docs/                      ← Design docs (see Doc Map below)
│   ├── guides/                ← Step-by-step creation guides
│   ├── component-blueprint.md ← How components are built (4 archetypes)
│   ├── component-ideas.md     ← Ideas bank (all ideas in one place)
│   ├── creative-methodology.md← Quality bar, 8 pillars, evaluation
│   ├── design.md              ← Website design system (colors, type, layout)
│   ├── pdr.md                 ← Product Design Record (vision, phases)
│   ├── reference.md           ← Inspiration links + anti-patterns
│   └── tdr.md                 ← Technical Design Record (stack, arch)
├── registry/                  ← Component registry data
└── scripts/                   ← Build/utility scripts
```

---

## Tech Stack (Memorize This)

| Layer | Tool | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14+ |
| UI | React | 18+ |
| Language | TypeScript (strict) | 5+ |
| Styling | Tailwind CSS | 3.x |
| Animation | GSAP (ScrollTrigger, SplitText, Flip, Draggable, MotionPath) | 3.x |
| Smooth scroll | Lenis | Latest |
| React animation | Framer Motion | 10+ |
| 3D | Three.js + React Three Fiber + drei | Latest |
| Fonts | Satoshi (Fontshare) + JetBrains Mono | — |
| Easing | Vessel Curve: `cubic-bezier(0.16, 1, 0.3, 1)` | — |

**Banned**: Geist, Inter, Roboto fonts. `#000000` pure black (use `#0A0A0A`). Glassmorphism. Neon glow. Bento grids.

---

## The 4 Component Archetypes

Every component picks ONE of these. Don't mix them.

| Archetype | What It Uses | When | Example |
|---|---|---|---|
| **A. Engine + inline shaders** | `VesselCanvas` + GLSL as template strings | Single-pass shader + custom physics | `apparatus-ll` |
| **B. Engine + imported GLSL** | `VesselCanvas` + `.glsl` files | Single-pass shader, large shader code | `apparatus-hoqnl` |
| **C. Hand-rolled multi-pass** | Own `THREE.WebGLRenderer` | Needs ping-pong FBOs, simulation | `tanvi` |
| **D. DOM / GSAP** | No Three.js. Pure GSAP + DOM | Scroll, layout, transition, cards | `apparatus-velocity-deck` |

---

## Built Components (31 total)

| Component | Archetype | Core Mechanic |
|---|---|---|
| `apparatus-ll` | A | Industrial steel intaglio, squeegee smudge |
| `apparatus-hoqnl` | B | Character atlas procedural texture |
| `tanvi` | C | Fluid simulation with ping-pong FBOs |
| `apparatus-velocity-deck` | D | Scroll-velocity card stack, CSS 3D |
| `apparatus-venetian-blinds` | D | Horizontal slat flip, dual-image backface |
| `apparatus-accordion-wall` | D | Vertical panel expand/compress |
| `apparatus-layout-morph` | D | Formation morphing, scroll interpolation |
| `orbit-ring-gallery` | SG | R3F ring carousel, wheel/drag rotation |
| `apparatus-parallax-column` | D | Parallax column layout |
| `apparatus-ialfa` | A/B | Stone bas-relief, ray-marched shadows |
| `apparatus-faf` | A/B | Kintsugi gold veins, reactive light |
| `apparatus-dee` | A/B | Liquid mercury flow |
| `kinetic-portal` | A/B | Thermal spectrum mapping |
| `chromepunk-beast` | A/B | Normal-mapped embossing, Sobel height |
| `merlin-knights` | A/B | Copperplate engraving, paint bleed |
| `japparii` | A/B | Leonardo cross-hatch sketch |
| `apparatus-fjvfba` | A/B | Copperplate-to-bronze transmutation |
| ... | ... | (remaining are shader-based image effects) |

**Diversity rule**: If shader components exceed ~40% of the library, the next build MUST be archetype D (DOM/GSAP).

---

## Existing Pages / Routes

| Route | Status | Content |
|---|---|---|
| `/` | Active | Homepage (placeholder) |
| `/morph-showcase` | Active | Scroll-driven formation morph component |
| `/components/*` | Planned | Per-component demo pages |
| `/docs/*` | Planned | Documentation pages |

---

## Active Development Context

### Current Focus: Scroll Gallery Components (Archetype D)
We're building new DOM/GSAP scroll-driven components to balance the shader-heavy library. All ideas are in `docs/component-ideas.md`.

### MorphShowcasePage (`apps/web/src/app/morph-showcase/page.tsx`)
- 806 lines, scroll-driven formation morph
- Uses `containerRef` pinned with `ScrollTrigger` + `gsap.set` in `onUpdate`
- Manual interpolation using `lerp` and `applyEasing` inside the ticker (NOT `gsap.timeline()`)
- Rated 6.5/10 — jank from direct interpolation state changes
- Pattern: inline `window` reads in ticker loop, NOT `useState` for dimensions

### Controls Pattern (Every Component Must Have)
- Pill button top-right corner
- Monospace uppercase text
- `backdrop-filter: blur`
- Toggles and sliders for tunable parameters
- Already established in `apparatus-velocity-deck` and `morph-showcase`

---

## Doc Map — What To Read When

| You Need To... | Read This |
|---|---|
| Understand agent rules | `.agents/GEMINI.md` |
| Build a new component | `docs/component-blueprint.md` + `docs/guides/component-creation-guide.md` |
| Check quality bar | `docs/creative-methodology.md` (8 pillars, laziness test) |
| Find component ideas | `docs/component-ideas.md` (all ideas in one consolidated file) |
| Understand website design | `docs/design.md` (colors, type, sections, motion) |
| Product vision / phases | `docs/pdr.md` |
| Tech stack / architecture | `docs/tdr.md` |
| Find reference sites | `docs/reference.md` (URLs organized by technique) |

---

## Hard Rules (Violations = Reject)

1. **All GSAP inside `useGSAP()`** — never raw `useEffect` + gsap
2. **GPU-only properties**: `transform`, `opacity`, `filter`. Never animate `width`/`height`/`top`/`left`
3. **No binary hover**: `hover ? 1 : 0` is banned. Continuous physics always.
4. **Name the physical system** before writing an interaction (spring / fluid / inertia / decay)
5. **`overwrite: "auto"`** on every re-triggerable `gsap.to`
6. **Frame-rate independence**: `const dt = clock.getDelta()` — never assume `0.016`
7. **Delta-corrected damp**: `a + (b - a) * (1 - Math.pow(1 - f, dt * 60))` instead of raw `lerp(a, b, 0.08)`
8. **Scroll input via prop**: `scrollProgress` (0→1) passed down, not internal scroll listeners
9. **Recovery ≠ entry reversed**: `RECOVERY` must be its own animation
10. **Dispose everything on unmount**: WebGL, RAF, GSAP, listeners

---

## Patterns That Already Exist (Don't Reinvent)

| Pattern | Where It Lives |
|---|---|
| Single-pass shader rendering | `VesselCanvas` (engine) — handles texture, resize, hover, dispose |
| Scroll-driven formation morph | `morph-showcase/page.tsx` — lerp + easing in ticker |
| Card stack with velocity | `apparatus-velocity-deck` — GSAP ScrollTrigger + CSS 3D |
| Venetian blinds flip | `apparatus-venetian-blinds` — staggered rotation, backface |
| Accordion expand | `apparatus-accordion-wall` — GSAP-driven flex |
| Ring carousel (3D) | `orbit-ring-gallery` — R3F, wheel/drag |
| Lifecycle protocol | `VesselCanvas` — idle/discovery/buildUp/peak/recovery |
| Controls panel | `apparatus-velocity-deck` — pill button, backdrop-blur |

---

## What NOT To Do (Common Agent Mistakes)

1. ❌ Don't call the project "Absolute UI" — it's **Abyss**
2. ❌ Don't default to shaders — check if DOM/GSAP can do it first
3. ❌ Don't create empty `types.ts` or `.glsl` files "just in case"
4. ❌ Don't use `useState` for dimensions in animation loops — read `window` inline
5. ❌ Don't use `gsap.timeline()` for scroll-scrubbed components — manual interpolation in ticker
6. ❌ Don't reimplement what `VesselCanvas` already provides (texture load, resize, hover lerp)
7. ❌ Don't write 500+ line files in one shot — break into chunks
8. ❌ Don't invent features not in the docs or instruction
9. ❌ Don't use default easing — use Vessel Curve or named springs
10. ❌ Don't skip the controls panel — every component needs one

---

## Phase Status

| Phase | Status | What It Includes |
|---|---|---|
| **Phase 1** | IN PROGRESS | Website shell, homepage, showcase, navigation, motion system |
| **Phase 2** | NOT STARTED | Component library NPM package + CLI (`npx vessel-ui add`) |

Phase 2 code (CLI, registry resolver, package publishing) is NOT to be built during Phase 1.

---

*This file is the single source of truth for agent onboarding. If you're a new agent on this project, read this file, then read `.agents/GEMINI.md`, then start your task. You should NOT need to read every other doc file unless your task specifically touches that domain.*
