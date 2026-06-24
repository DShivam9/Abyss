# Absolute UI — Section Improvements Plan

> Based on the grill session and skill analysis (modern-web-design, gpt-taste, motion-framer, gsap-skills, design-spells).
> All changes follow RULES.md: warm light mode only, Cormorant Garamond + Satoshi, cinematic motion (no bouncy springs), image-first.

---

## Overview

Four workstreams, ordered by priority:

| # | Workstream | Current State | Target State |
|---|---|---|---|
| 1 | **Hero (ArrivalZone)** | 5-card 3D arc + text overlay, crowded | Full-bleed crossfade BG + 3-card arc FG, vignette, breathing editorial type |
| 2 | **Philosophy Zone** | 3-act pinned, flat execution | Same structure, dramatically elevated execution |
| 3 | **Manifesto Zone** | 3 giant words + center portrait, abstract | Unpinned vertical editorial scroll with real manifesto copy |
| 4 | **Components Page** | Does not exist | Museum View at `/components` — immersive room-per-component showcase |

---

## Workstream 1 — Hero Section Rebuild

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Full-bleed crossfading background images (Layer 0)     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Radial vignette overlay (Layer 1)                │  │
│  │  ┌────────────────────────────────────────────┐   │  │
│  │  │  3 editorial cards, subtle 3D arc (Layer 2)│   │  │
│  │  └────────────────────────────────────────────┘   │  │
│  │                                                   │  │
│  │           ABSOLUTE                                │  │
│  │           Interface                               │  │
│  │     The image is the experience.                  │  │
│  │         [Explore Exhibition →]                    │  │
│  │                                                   │  │
│  │         (Text Layer 3, mix-blend-difference)      │  │
│  │                                                   │  │
│  │              ↓ Scroll                             │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Layers (Bottom to Top)

**Layer 0 — Background Crossfade**
- 3-4 hero images cycle with slow crossfade (3.5 second display, 1.5 second transition)
- Use Next.js `<Image>` with `fill`, `priority` for the first image, `loading="lazy"` for rest
- Images: `avant-garde-fashion.jpg`, `chrome-visor-portrait.jpg`, `wet-skin-portrait.jpg`, `editorial-reach.jpg`
- Transition: Pure opacity crossfade via GSAP timeline (no React state re-renders — animate opacity directly on DOM refs)
- On scroll exit: entire background parallaxes up with `yPercent: -20` and fades via overlay

**Layer 1 — Vignette Overlay**
- Radial gradient: transparent center → warm dark at edges
- CSS: `background: radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, rgba(26, 23, 20, 0.5) 100%)`
- This keeps center text legible without a flat color wash
- `pointer-events: none`, fixed position within the hero

**Layer 2 — 3 Editorial Cards (3D Arc)**
- Reduce from 5 cards to 3 cards — cleaner, less visual noise
- Cards: wider aspect ratio (`3/4`), size: `min(22vw, 280px)` — bigger than current
- Arc is tighter: center card at z: 0, side cards at rotateY: ±15° and z: -80
- Side cards at 60% opacity, center at 85% opacity — subtle, not competing with BG
- Mouse parallax: container rotateX/Y responds to cursor (existing logic, refined)
- Entrance: staggered fade-in from below with scale 0.85 → 1.0, using `ease: [0.16, 1, 0.3, 1]`
- On hover: individual card lifts (z +30, opacity → 1, shadow deepens)
- Cards are `pointer-events: auto` so they're interactive
- On scroll exit: cards parallax down faster than background, creating depth separation

**Layer 3 — Typography**
- Line 1: `ABSOLUTE` — Satoshi Black, `clamp(3.5rem, 12vw, 9rem)`, uppercase, tight tracking
- Line 2: `Interface` — Cormorant Garamond, italic, light, `clamp(2rem, 7vw, 6rem)`
- Line 3: `The image is the experience.` — Satoshi, `text-sm md:text-base`, tracking-widest, `text-white/70`
- All lines centered, `mix-blend-difference`, white
- Entrance: Lines 1 & 2 slide up from `yPercent: 110` (clip-masked), staggered. Line 3 fades in after.
- CTA button below: keep the existing roll-up character animation (it's one of the best details in the codebase)

**Layer 4 — Scroll Indicator**
- Keep existing: "Scroll" label + animated vertical line
- Fade out on scroll (as currently implemented)

### Files to Modify

#### [MODIFY] [ArrivalZone.tsx](file:///d:/MAIN PROJECTS/AbsoluteUI/src/components/zones/ArrivalZone.tsx)
Complete rewrite of the component. Key changes:
- Replace `heroImages` 5-item array with 3-card `HERO_CARDS` array and 4-item `BG_IMAGES` array
- Add background crossfade layer using GSAP timeline (not setInterval/setState)
- Add vignette overlay div with radial gradient
- Reduce card count from 5 to 3, widen cards, tighten arc
- Add third text line with poetic subline
- Separate scroll-exit parallax for BG (slow) and cards (fast) for depth

### Crossfade Implementation Detail

```tsx
// Background crossfade via GSAP (no React state)
const bgRefs = useRef<(HTMLDivElement | null)[]>([]);

useGSAP(() => {
  const images = bgRefs.current.filter(Boolean);
  if (images.length === 0) return;

  // Set all images to opacity 0 except first
  gsap.set(images, { opacity: 0 });
  gsap.set(images[0], { opacity: 1 });

  const tl = gsap.timeline({ repeat: -1, defaults: { duration: 1.5, ease: "power2.inOut" } });

  images.forEach((img, i) => {
    const next = images[(i + 1) % images.length];
    tl.to(img, { opacity: 0 }, `+=${3.5}`) // Display for 3.5s, then fade out
      .to(next, { opacity: 1 }, "<");         // Simultaneously fade in next
  });
}, { scope: containerRef });
```

This avoids React re-renders entirely. Pure GSAP DOM manipulation.

---

## Workstream 2 — Philosophy Zone Elevation

### What Stays
- 3-act pinned structure (Boxes → The Turn → The Proof)
- Desktop pinned with `scrub: 1`, mobile vertical stack
- `prefers-reduced-motion` handling
- CursorTrail integration

### What Changes

#### ACT 1 — "The Problem" (Elevated)

**Current**: Small "Boxes." text, two editorial frames, body text.

**New**:
- `"Boxes."` becomes truly massive: `text-[28vw]` (currently `22vw`) — it should dominate the viewport as a faint watermark
- The editorial images get more dramatic framing: add a subtle CSS `box-shadow` animation on scroll — the "frame" visually tightens (clip-path insets animate from `0%` to `8%`) to make the "boxing in" concept literal
- The body text ("Every interface wraps images in containers...") gets a word-by-word opacity reveal on scroll entrance, not just a static paragraph
- Add a third image (smaller, rotated slightly) to create an asymmetric editorial composition — 3 images at different scales create visual tension

#### ACT 2 — "The Turn" (Dramatic Word Reveal)

**Current**: Words at 45% opacity that highlight to accent color and settle back.

**New**:
- Words start at `opacity: 0.15` (much more hidden) and `blur(2px)`
- Each word sharpens and brightens to full opacity with `blur(0)` as you scroll through it
- The active word gets a subtle warm glow: `text-shadow: 0 0 30px rgba(192, 120, 96, 0.4)` (accent color at 40% opacity)
- After the word activates, it stays at full opacity (no dimming back) — the sentence builds progressively
- Key words "image" and "interface?" get the Cormorant italic treatment AND a brief `scale: 1.05` pulse on activation
- Background: a very subtle warm radial gradient (`bg-bg-elevated`) pulses in sync with word activations

#### ACT 3 — "The Proof" (Breathtaking Reveal)

**Current**: Circle clip-path expanding from 0% to 100% with "Absolute UI" text overlay.

**New**:
- The circle expand is the right mechanic but needs to be the single most stunning moment on the entire site
- Start the circle at `circle(0% at 50% 50%)` and expand to `circle(100% at 50% 50%)` over a longer scroll distance (currently too fast)
- During the expansion, the image has a subtle scale animation: starts at `1.15` and settles to `1.0` as the circle fully opens — a "breathing in" effect
- The "Absolute UI" overlay text enters AFTER the circle is ~70% open (not simultaneously) — it should feel like the image calls the text, not the other way around
- Add a thin animated border ring that traces the circle's edge as it expands — a single `border-radius: 50%` element with `border: 1px solid var(--accent)` that scales in sync
- The warm light overlay should be richer: `bg-gradient-to-b from-bg-base/5 via-transparent to-bg-base/15`

### Files to Modify

#### [MODIFY] [PhilosophyZone.tsx](file:///d:/MAIN PROJECTS/AbsoluteUI/src/components/zones/PhilosophyZone.tsx)
- Act 1: Increase "Boxes." text size, add word-by-word body text reveal, add third image, animate clip-path tightening on scroll
- Act 2: Change word starting state to `opacity: 0.15, filter: blur(2px)`, add glow on activation, keep words visible after activation, add scale pulse on "image" and "interface?"
- Act 3: Slow down circle expansion, add image scale settle (1.15 → 1.0), delay overlay text to 70% circle, add border ring tracing, enrich overlay gradient

---

## Workstream 3 — Manifesto Zone Redesign

### Architecture Change

**FROM**: Pinned single-screen with 3 giant words (STRUCTURE / MOTION / IMMERSION) + center portrait.

**TO**: Unpinned vertical editorial scroll (~250vh) with real manifesto copy, parallax images, and pull-quotes. Like a magazine closing essay.

### Content Structure

```
┌─────────────────────────────────────────────┐
│                                             │
│  [Large pull-quote, centered]               │
│  "The image is not decoration.              │
│   It is the interface."                     │
│                                             │
│  ─────────────────────────────              │
│                                             │
│  [Image + text pair]                        │
│  Left: Editorial image (parallax)           │
│  Right: Body paragraph explaining           │
│  the principle                              │
│                                             │
│  ─────────────────────────────              │
│                                             │
│  [Pull-quote #2, right-aligned]             │
│  "Motion is not animation.                  │
│   It is narrative."                         │
│                                             │
│  ─────────────────────────────              │
│                                             │
│  [Image + text pair, reversed]              │
│  Left: Body paragraph                       │
│  Right: Editorial image (parallax)          │
│                                             │
│  ─────────────────────────────              │
│                                             │
│  [Pull-quote #3, centered]                  │
│  "Immersion is not a feature.               │
│   It is the standard."                      │
│                                             │
│  ─────────────────────────────              │
│                                             │
│  [Full-bleed image]                         │
│  Portrait image with overlaid               │
│  closing statement                          │
│                                             │
└─────────────────────────────────────────────┘
```

### Animation Details

- **Pull-quotes**: Enter with per-character stagger (`opacity: 0, y: 8` → `opacity: 1, y: 0`), triggered `whileInView` with Framer Motion or GSAP ScrollTrigger
- **Image + text pairs**: Image enters with clip-path reveal (`inset(100% 0 0 0)` → `inset(0)`, vertical wipe), body text fades in with `y: 20` offset
- **Parallax**: Images have `data-speed` parallax at ~-2 (slower than scroll), text at 0 (normal speed). Use GSAP ScrollTrigger `scrub: true` with `yPercent` offset
- **Full-bleed closing image**: Scale from `1.1` to `1.0` on scroll, overlaid closing statement fades in with `mix-blend-color-burn`

### Manifesto Copy

Three core principles, each with a bold pull-quote and a supporting paragraph:

**Principle 1**: "The image is not decoration. It is the interface."
> Every component library treats images as content to be framed. We treat them as the medium itself. When the image drives scale, depth, focus, and motion — the frame becomes irrelevant.

**Principle 2**: "Motion is not animation. It is narrative."
> Movement without meaning is noise. Every transition, every scroll response, every hover state tells part of a story. Cinematic pacing. Intentional timing. The interface breathes.

**Principle 3**: "Immersion is not a feature. It is the standard."
> The gap between looking at an interface and being inside it is measured in attention to detail. Film grain. Cursor awareness. Scroll-linked depth. These aren't extras — they're the baseline.

### Files to Modify/Create

#### [MODIFY] [ManifestoZone.tsx](file:///d:/MAIN PROJECTS/AbsoluteUI/src/components/zones/ManifestoZone.tsx)
Complete rewrite:
- Remove pinned single-screen layout
- Build vertical editorial scroll with alternating pull-quote + image-text pairs
- 3 manifesto statements with supporting body paragraphs
- Parallax images, per-character staggered pull-quote reveals
- Closing full-bleed image with overlaid statement
- Mobile: simplified vertical stack, no parallax, text-first

---

## Workstream 4 — Components Page (Museum View)

### Route

`/components` — new page at `src/app/components/page.tsx`

### Architecture

Each component gets a full-viewport "room". You scroll vertically through rooms. Each room is a self-contained immersive demo.

```
Room Layout:
┌─────────────────────────────────────────────┐
│                                             │
│  01                          Scale          │
│  ─────                                      │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │                                     │    │
│  │     LIVE INTERACTIVE COMPONENT      │    │
│  │     (full-size, real images)        │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Description text, subtle and editorial     │
│                                             │
└─────────────────────────────────────────────┘
```

### Room Structure

Each room contains:
1. **Component number** (top-left): `01`, `02`, etc. — Satoshi, small, uppercase tracking
2. **Component name** (top-right): `Scale`, `Depth`, etc. — Cormorant italic, large
3. **Live demo area** (center): The actual component rendered with real images, interactive
4. **Description** (bottom): One-sentence description — Satoshi, small, muted

### Components to Showcase (Initial)

| # | Name | Component | Description |
|---|---|---|---|
| 01 | Scale | ScaleScene | Image scales proportionally with scroll position |
| 02 | Depth | DepthScene | Layered image creates parallax depth |
| 03 | Focus | FocusScene | Spotlight follows cursor, revealing image details |
| 04 | Absolute | AbsoluteScene | Full-bleed image with overlaid typographic treatment |

### Page Layout

- Sticky minimal nav at top: "Absolute UI" logo (left) + "Back to Home" link (right)
- Vertical scroll through rooms, each `100dvh`
- Progress indicator on the side (thin vertical track with dot showing current room)
- Smooth Lenis scrolling (reuse existing `SmoothScrollProvider`)
- Room transitions: each room fades/slides in as you scroll into it

### Files to Create

#### [NEW] `src/app/components/page.tsx`
- Page component with room-based layout
- Imports each component (ScaleScene, DepthScene, FocusScene, AbsoluteScene)
- Scroll-linked room transitions via GSAP ScrollTrigger
- Sticky progress indicator
- Minimal page-level nav

#### [NEW] `src/components/ComponentRoom.tsx`
- Reusable room wrapper: accepts `number`, `name`, `description`, and `children` (the live component)
- Handles entrance animation, number/name positioning, description placement
- Full viewport height, overflow hidden

#### [NEW] `src/app/components/layout.tsx`
- Components page layout with minimal nav (no TopNav overlay on this page)
- Wraps in SmoothScrollProvider

### Data Model

```tsx
// src/lib/components-registry.ts
export interface ComponentEntry {
  id: string;
  number: string;
  name: string;
  description: string;
  component: React.ComponentType;
  image: string; // Preview image for the homepage Exhibition teaser
}

export const COMPONENTS: ComponentEntry[] = [
  {
    id: "scale",
    number: "01",
    name: "Scale",
    description: "Image scales proportionally with scroll position.",
    component: ScaleScene,
    image: "/images/avant-garde-fashion.jpg",
  },
  // ... etc
];
```

### v2: Canvas View (Documented, Not Built)

The canvas view is a future toggle feature:
- All components exist as interactive tiles on an infinite 2D canvas
- User drags to pan, scrolls to zoom
- Components are spatially scattered (intentional, not grid)
- Editorial labels float near each component
- Implementation: Canvas API or CSS transforms with custom pan/zoom logic
- Toggle switch in the page header: "Museum" / "Canvas"

---

## Shared Infrastructure

### [NEW] `src/lib/animation.ts`
Shared animation constants used across all workstreams:

```tsx
export const EASE = {
  smooth: [0.32, 0.72, 0, 1] as const,
  wipe: [0.76, 0, 0.24, 1] as const,
  magnetic: [0.25, 1, 0.5, 1] as const,
  reveal: [0.16, 1, 0.3, 1] as const,
} as const;

export const DURATION = {
  fast: 0.3,
  medium: 0.8,
  slow: 1.2,
  cinematic: 1.6,
} as const;

export const STAGGER = {
  tight: 0.03,
  normal: 0.06,
  relaxed: 0.1,
  character: 0.02,
} as const;
```

### [NEW] `src/lib/images.ts`
Centralized image paths (addresses the audit fix for scattered string literals).

### [NEW] `src/hooks/useNormalizedMouse.ts`
Shared hook for mouse-position tracking (addresses the audit fix for duplicated logic).

---

## Execution Order

| Phase | Workstream | Est. Effort | Dependencies |
|---|---|---|---|
| **Phase 0** | Shared infra (`animation.ts`, `images.ts`, `useNormalizedMouse.ts`) | 30 min | None |
| **Phase 1** | Hero Section Rebuild | 2-3 hours | Phase 0 |
| **Phase 2** | Philosophy Zone Elevation | 1.5-2 hours | Phase 0 |
| **Phase 3** | Manifesto Zone Redesign | 1.5-2 hours | Phase 0 |
| **Phase 4** | Components Page (Museum View) | 2-3 hours | Phases 1-3 (needs existing components) |

> [!IMPORTANT]
> Before starting Phase 1, Fix 02 from FIX_GUIDE.md (missing images) must be resolved — the hero needs real images for the crossfade background.

> [!NOTE]
> The Components Page (Phase 4) reuses existing ScaleScene, DepthScene, FocusScene, and AbsoluteScene components without modification. It wraps them in the new `ComponentRoom` container and presents them in the museum format.

---

## Asset Mapping & Strict "No Repeats" Rule

> [!CAUTION]
> **STRICT RULE**: No image may be used more than once across the entire site. We have 16 unique images available. Each slot must map to a unique image.

**Proposed Mapping:**

1. **Hero Crossfade (4 images)**
   - `jackson-yee-wide.jpg`
   - `chrome-visor-portrait.jpg`
   - `wet-skin-portrait.jpg`
   - `sunset-silhouette-collage.jpg`

2. **Philosophy Zone (3 images)**
   - `avant-garde-fashion.jpg` (Box 1)
   - `black-jacket-shades.jpg` (Box 2)
   - `mahmood-warm-portrait.jpg` (The Proof Reveal)

3. **Manifesto Zone (5 images)**
   - `editorial-reach.jpg` (Parallax 1)
   - `baggy-jeans-strut.jpg` (Parallax 2)
   - `silver-visor-portrait.jpg` (Parallax 3)
   - `fisheye-puffer-vest.jpg` (Parallax 4)
   - `wide-angle-headphones.jpg` (Closing Full Bleed)

4. **Museum Components View (4 images)**
   - `grey-fleece-pose.jpg` (ScaleScene)
   - `baggy-denim-fashion.jpg` (DepthScene)
   - `chunky-boots-fashion.jpg` (FocusScene)
   - `skateboard-dollar-graphic.jpg` (AbsoluteScene)
