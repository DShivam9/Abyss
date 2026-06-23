# Absolute UI — Website

---

# Part 1 — Technical Spec

## Tech Stack

### Core (Non-Negotiable)

| Technology | Purpose |
|---|---|
| React | UI framework |
| Next.js | Full-stack React framework, SSR, routing |
| TypeScript | Type safety across the codebase |
| Tailwind CSS | Utility-first styling |

### Animation Stack (Non-Negotiable)

| Technology | Purpose |
|---|---|
| Framer Motion | Declarative React animations, layout animations, gestures |
| GSAP | Timeline animations, complex sequencing, scroll-driven motion |
| GSAP ScrollTrigger | Scroll-linked animations, pinning, scrubbing |
| `@gsap/react` | React hook integration (`useGSAP`) |
| Lenis | Global smooth scrolling |

Framer Motion and GSAP are the twin engines of Absolute UI. They are not optional. They are not interchangeable. They work together — Framer for declarative component-level animation, GSAP for timeline-based sequencing and scroll-driven storytelling.

### Future (When Needed)

| Technology | Purpose |
|---|---|
| Rive | Interactive illustrations and micro-animations |
| WebGL / OGL | Advanced visual effects |
| React Three Fiber | 3D interactions |
| HTML5 Canvas | Ambient particle simulations, atmospheric backgrounds |

Use the simplest solution capable of delivering the desired experience. Don't reach for WebGL when GSAP handles it.

---

## Project Structure

This is a single clean Next.js project. Not a monorepo. Not a Turborepo workspace. Not a multi-package architecture.

```text
AbsoluteUI/
├── public/              # Static assets (images, fonts, icons)
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities, helpers, constants
│   └── styles/          # Global styles, Tailwind config
├── docs/                # Project documentation (you are here)
├── GEMINI.md            # AI operating instructions
├── RULES.md             # Project rules
└── references/          # Design references, inspiration
```

Keep it flat. Keep it simple. Complexity comes from the experience, not the folder structure.

---

## Performance Requirements

### General

- Lighthouse Score: 90+
- Mobile Friendly
- Responsive across all screen sizes
- Accessible (WCAG 2.1 AA)

### Animation

- 60 FPS target on all animations
- No layout thrashing
- Hardware-accelerated transforms (`transform`, `opacity`)
- Minimal repaints
- Lazy-loaded heavy visual effects

### Loading

- Fast initial render (optimize critical path)
- Lazy-load images below the fold
- Optimized image formats (WebP, AVIF where supported)
- Code-split heavy components

---

## Accessibility Requirements

Required on every page and component:

- Keyboard navigation
- Visible focus indicators
- Semantic HTML elements
- Screen reader compatibility
- `prefers-reduced-motion` support (reduce or eliminate motion)
- Sufficient color contrast
- Alt text on all images

Accessibility is mandatory. Not optional. Not "nice to have."

---

## Code Standards

Preferred:

- Composition over inheritance
- Reusable custom hooks for animation logic
- Reusable utility functions
- Type-safe APIs throughout
- Clean, readable component structure

Avoid:

- Magic values (hardcoded numbers without explanation)
- Unnecessary dependencies
- Complex abstractions that hide simple logic
- Over-engineering for hypothetical future needs
- Inline styles when Tailwind handles it

---

# Part 2 — Website Architecture

## Website Philosophy

The website is the product. Not documentation. Not a landing page. Not a component catalog.

The website demonstrates that Absolute UI can build experiences at a level nobody else is offering. Every scroll, every hover, every image interaction proves the standard.

Users should not feel like they are reading docs. They should feel like they are experiencing a curated digital gallery.

---

## Narrative Flow Principles

The website tells a story. It has pacing, rhythm, and a deliberate emotional arc.

### No Scroll Slop

The biggest enemy is mindless scrolling through section after section with no narrative purpose. Every zone on the page must earn its position.

### Cinematic Pacing

Treat the website like a short film:

1. **Opening shot** — immediate visual impact, intrigue
2. **Establishing context** — what is this, why does it exist
3. **Rising action** — interactive demonstrations, growing immersion
4. **Climax** — the most impressive experience on the page
5. **Resolution** — conviction, call to action, what happens next

### Deliberate Transitions

Zones don't just appear. They are revealed. Transitions between zones should feel directed — scroll-linked, animated, intentional.

### Pinned Sections

Use GSAP ScrollTrigger pinning to create moments where the user stops and absorbs. Not every section scrolls by at the same speed. Pacing varies.

---

## Zone-Based Structure

The website is organized into experiential zones, not conventional page sections.

### Navigation

```text
[ ABSOLUTE UI ]                              [ Exhibition ] [ Philosophy ] [ GitHub ↗ ]
```

Minimal. The logo and essential links. Scroll is the primary navigation. See `docs/SITE_IMPROVEMENT_PLAN.md` Part 3 for full nav spec.

> **Removed permanently:** Waitlist. Playground. No email capture anywhere.

---

### Zone 1 — Arrival

**Purpose:** First impression. Immediate visual impact. Intrigue.

This is the hero. It should stop the user in their tracks. Large-scale image interaction, cinematic motion, confident typography.

Requirements:

- Massive, immersive visual — the image IS the hero
- Premium typography — large, tight-tracked display heading
- Interactive element — something the user can engage with immediately
- Clear value proposition — what Absolute UI is, in one line
- Smooth entrance animation (Framer Motion + GSAP)

The user should think: "This is different."

---

### Zone 2 — Philosophy

**Purpose:** Establish what Absolute UI believes. Why it exists. What makes it different.

This is not a features list. This is a design conviction statement. Editorial, typographic, confident.

Requirements:

- Strong editorial typography
- Minimal visual noise — the words carry the message
- Scroll-driven reveal (text appearing as user scrolls)
- Atmosphere — subtle background treatment that creates mood

---

### Zone 3 — Gallery

**Purpose:** Demonstrate the image-first philosophy in action. Show, don't tell.

This is where the image-first interactive approach is proven. Multiple image treatments, each showing a different interaction pattern — parallax, depth, reveal, cursor-response.

Requirements:

- Multiple image-first demonstrations
- Each image showcases a distinct interaction style
- High-quality aesthetic photography
- Smooth transitions between gallery items
- Scroll-driven or interaction-driven reveals

---

### Zone 4 — Manifesto

**Purpose:** Design conviction. The emotional climax of the exhibition.

A strong, typographic statement about the image-first philosophy. Not marketing copy — genuine design conviction.

Requirements:

- Bold, editorial typography
- Central portrait image with scroll-linked depth
- Scroll-driven pacing (opposing text drift)
- Emotional weight before footer closure

---

### Footer

**Purpose:** Resolution. Brand presence. Craft.

Not a template link row — a deliberate closing frame. See `docs/SITE_IMPROVEMENT_PLAN.md` Part 7 for full footer spec.

Requirements:

- Warm cream depth background (`--bg-deep`)
- Character-split animated links (GitHub, Twitter, Discord)
- Live London studio clock
- Magnetic back-to-top (Lenis scroll, no elastic easing)
- Subtle entrance animation on scroll into view

---

### Removed Zones (Permanent)

| Zone | Status |
|---|---|
| Playground | **Removed.** Gallery exhibitions are the interactive proof. |
| Community / Waitlist | **Removed.** No email capture, no signup CTAs. |

---

## Responsive Strategy

Every zone must work across:

- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)
- Wide (1440px+)

The experience should remain premium at every breakpoint. Image interactions adapt — cursor-based effects become touch-friendly or scroll-only on mobile.

---

## Performance Strategy

The website is visually rich but must remain fast:

- Lazy-load images and heavy components below the fold
- Optimize images (WebP/AVIF, responsive `srcset`)
- Code-split zone components
- Use `will-change` sparingly on animated elements
- Profile and maintain 60 FPS on scroll animations
- Server-side render static content, client-side render interactive zones

---

# Part 3 — Website Wireframes

> **Note:** These are structural wireframes defining zone layout and content hierarchy. Visual design (colors, fonts, specific imagery) will be defined in a separate design token session.

---

## Zone 1 — Arrival (Hero)

```text
+─────────────────────────────────────────────────────────────────────────────+
│                                                                             │
│                                                                             │
│                        [ FULL-BLEED IMAGE EXPERIENCE ]                      │
│                     Interactive, cursor/scroll-responsive                    │
│                                                                             │
│                                                                             │
│                                                                             │
│           H1:  ABSOLUTE / Interface                                         │
│           Sub: Image-first interactive components.                          │
│                                                                             │
│           [ Explore Exhibition → ]                                          │
│                                                                             │
│                                                                             │
+─────────────────────────────────────────────────────────────────────────────+
```

- Full viewport height (100vh minimum)
- Image is the hero — not behind text, not in a container. The image IS the section.
- Typography overlays the image with appropriate contrast treatment
- Entrance animation: GSAP timeline with staggered reveals
- Interactive: image responds to cursor movement (parallax depth layers)

---

## Zone 2 — Philosophy

```text
+─────────────────────────────────────────────────────────────────────────────+
│                                                                             │
│                                                                             │
│        "We believe images should be alive.                                  │
│         Not assets inside containers.                                       │
│         Not backgrounds behind text.                                        │
│         The image is the experience."                                       │
│                                                                             │
│                                                                             │
│                                      — Absolute UI                          │
│                                                                             │
+─────────────────────────────────────────────────────────────────────────────+
```

- Typographic-driven section
- Scroll-driven text reveal (lines appear as user scrolls)
- Subtle ambient background (canvas particles or gradient shift)
- Generous whitespace
- Pinned during scroll reveal, then releases

---

## Zone 3 — Gallery

```text
+─────────────────────────────────────────────────────────────────────────────+
│                                                                             │
│  +─────────────────────────────+    +─────────────────────────────+         │
│  │                             │    │                             │         │
│  │   [ Image: Parallax ]       │    │   [ Image: Depth Layers ]   │         │
│  │   Scroll-driven motion      │    │   Cursor-aware 3D           │         │
│  │                             │    │                             │         │
│  +─────────────────────────────+    +─────────────────────────────+         │
│                                                                             │
│  +─────────────────────────────+    +─────────────────────────────+         │
│  │                             │    │                             │         │
│  │   [ Image: Reveal ]         │    │   [ Image: Perspective ]    │         │
│  │   Mask/clip transition      │    │   3D transform on scroll    │         │
│  │                             │    │                             │         │
│  +─────────────────────────────+    +─────────────────────────────+         │
│                                                                             │
+─────────────────────────────────────────────────────────────────────────────+
```

- Each image demonstrates a different interaction pattern
- Images are large, high-quality, and the focus of the section
- Scroll-driven reveals — images appear as user reaches them
- Staggered timing for rhythm
- Layout adapts on mobile (single column, maintained quality)

---

## Zone 4 — Manifesto

```text
+─────────────────────────────────────────────────────────────────────────────+
│                                                                             │
│          STRUCTURE          [ portrait ]          MOTION                      │
│                                                                             │
│                         IMMERSION                                           │
│                                                                             │
+─────────────────────────────────────────────────────────────────────────────+
```

- Bold typographic statement with central portrait
- Scroll-driven opposing text drift
- Emotional climax before footer
- See `docs/SITE_IMPROVEMENT_PLAN.md` Part 6

---

## Footer

```text
+─────────────────────────────────────────────────────────────────────────────+
│  ABSOLUTE UI · Image-first. Motion-driven.    GitHub ↗  Twitter ↗  Discord ↗│
│                                                        [ magnetic top ↑ ]   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  © 2026 Absolute UI · MIT              LONDON · 20:21:01 GMT                │
+─────────────────────────────────────────────────────────────────────────────+
```

- Warm cream depth background — deliberate closing frame
- Character-split link animations
- Magnetic back-to-top via Lenis
- See `docs/SITE_IMPROVEMENT_PLAN.md` Part 7

> **Removed wireframes:** Playground (Zone 4) and Community/Waitlist (Zone 6) are permanently removed.

---

# Part 4 — Design Tokens

This section defines the locked-in design token values for Absolute UI, representing the warm editorial visual system and dynamic, image-first behavior.

---

## Color System

The color system is warm light-mode by default. The typography and accents are dynamic, utilizing color extraction to pull tones directly from the active showcase imagery.

| Token | Purpose | Value |
|---|---|---|
| `--bg-deep` | Deepest background layer | `#F5F2EB` (Warm cream depth) |
| `--bg-base` | Default page background | `#FDFBF7` (Warm ivory/paper) |
| `--bg-surface` | Card/element surfaces | `#FFFFFF` (Pure white for contrast) |
| `--bg-elevated` | Hover/elevated surfaces | `#F7F4EC` (Slightly darker warm cream) |
| `--fg-primary` | High-contrast primary text | `#1A1714` (Espresso dark/charcoal) |
| `--fg-secondary` | Body text, secondary content | `#2C2723` (Muted dark espresso) |
| `--fg-muted` | Subtle labels, inactive states | `#7A7067` (Warm grey-brown) |
| `--border-subtle` | Restrained border separation | `transparent` (No visible dividers) |
| `--border-clean` | Interactive element borders | `#EBE6D8` (Very light cream hairline) |
| `--accent` | Primary accent color | **Dynamic** (Sampled dominant color from active image) |
| `--accent-hover` | Accent hover state | **Dynamic** (Sampled complement color from active image) |

*Note: Accents animate smoothly as the user scrolls or hovers over different images.*

---

## Typography System

Typography is editorial, combining high-impact geometric/serif display heads with Satoshi for body copy.

| Token | Purpose | Value |
|---|---|---|
| `font-display` | Primary display headings | `Cormorant Garamond` (Light Italic / Regular Italic, 300/400) |
| `font-display-sub` | Secondary headings/labels | `Syne` (Medium / Semibold, 500/600) |
| `font-body` | Body text | `Satoshi` (Geometric Grotesque, Regular 400) |
| `font-mono` | Code, technical elements | `Satoshi Mono` or System Mono |

### Size Scale

| Token | Size | Line Height |
|---|---|---|
| `text-xs` | 0.75rem (12px) | 1.5 |
| `text-sm` | 0.875rem (14px) | 1.5 |
| `text-base` | 1rem (16px) | 1.6 |
| `text-lg` | 1.125rem (18px) | 1.5 |
| `text-xl` | 1.25rem (20px) | 1.4 |
| `text-2xl` | 1.5rem (24px) | 1.3 |
| `text-3xl` | 1.875rem (30px) | 1.2 |
| `text-4xl` | clamp(2.25rem, 5vw, 3.5rem) | 1.1 |
| `text-5xl` | clamp(3.5rem, 8vw, 7.5rem) | 1.05 |

Display headings use tight letter-spacing: `tracking-[-0.03em]` to `tracking-[-0.05em]`.

---

## Spacing & Grid

An extremely airy spacing system that lets the editorial layouts breathe.

| Token | Size |
|---|---|
| `space-1` | 4px (0.25rem) |
| `space-2` | 8px (0.5rem) |
| `space-3` | 12px (0.75rem) |
| `space-4` | 16px (1rem) |
| `space-6` | 24px (1.5rem) |
| `space-8` | 32px (2rem) |
| `space-12` | 48px (3rem) |
| `space-16` | 64px (4rem) |
| `space-24` | 96px (6rem) (Default section gap) |
| `space-32` | 128px (8rem) (Large spacing gap) |
| `space-48` | 192px (12rem) (Hero/Manifesto whitespace) |

### Border Radii

Very subtle rounding to preserve the clean, structured look.

| Token | Value | Use |
|---|---|---|
| `radius-none` | 0px | Stark structural layout blocks |
| `radius-sm` | 2px | Micro buttons, inline elements |
| `radius-md` | 4px | Standard buttons, image containers |
| `radius-lg` | 6px | Large exhibition cards |

---

## Motion Tokens

All transitions mimic physical inertia and weight. Bouncy springs are avoided in favor of elegant, decelerating curves.

### Easing Curves

| Token | Value | Use |
|---|---|---|
| `ease-smooth` | `cubic-bezier(0.32, 0.72, 0, 1)` | Cinematic decay (default) |
| `ease-magnetic` | `cubic-bezier(0.25, 1, 0.5, 1)` | Kinetic cursor attraction |
| `ease-reveal` | `cubic-bezier(0.16, 1, 0.3, 1)` | Mask reveal / scroll emergence |

### Transition Durations

| Token | Value | Use |
|---|---|---|
| `duration-fast` | 150ms | Button state changes, text color shifts |
| `duration-base` | 300ms | Navigation highlights, standard shifts |
| `duration-slow` | 600ms | Image zoom transitions, mask fades |
| `duration-showcase` | 900ms–1400ms | Hero timeline reveals, scroll-story entries |

### Displacement Limits

| Element | Max Displacement |
|---|---|
| Buttons | 8px |
| Text / Icons | 4px |
| Image Parallax Tilt | 24px max tilt offset |
| Time-Scrub Exposure | 100% Scrub mapped across viewport width |
