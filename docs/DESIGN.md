# Absolute UI — Design

> **Color mode:** Warm light mode only. No dark mode. See Color Philosophy below and `docs/SITE_IMPROVEMENT_PLAN.md` for locked tokens.

---

# Part 1 — Design Philosophy

## Core Philosophy

Absolute UI is image-first. Not utility-first. Not component-first. Image-first.

The image is the experience. Every design decision supports the image — framing it, animating it, giving it depth, making it interactive, making it unforgettable.

The website proves this philosophy before a single component ships.

---

## What Image-First Means

- The image is the component, not a feature inside a container
- Images respond to scroll, cursor, viewport, and user interaction
- Images are treated as living, interactive elements — never static assets
- Every interaction enhances the image experience — parallax, depth, reveal, zoom, perspective shift
- The design system exists to serve the image, not the other way around

---

## Visual Design Principles

### Principle 01 — Whitespace Is A Feature

Do not fill space unnecessarily. Let images breathe. Let typography breathe. Density is the enemy of immersion.

---

### Principle 02 — Typography Creates Hierarchy

Not colors. Not effects. Typography carries the visual identity. Large, confident headings. Clean body text. Strong hierarchy through scale, weight, and spacing.

---

### Principle 03 — Motion Creates Emotion

Motion is not decoration. Motion makes images feel alive. Motion guides the eye. Motion creates the cinematic quality that separates Absolute UI from everything else.

---

### Principle 04 — Every Pixel Has Purpose

No decorative noise. No random effects. No visual filler. If an element doesn't serve the image or the narrative, remove it.

---

### Principle 05 — Elegance Over Complexity

The implementation can be complex. The experience must feel effortless. Users should never notice the engineering — they should only feel the result.

---

### Principle 06 — Clean, Minimalistic, Immersive

The overall vibe: clean surfaces, deliberate spacing, immersive interactions, aesthetic restraint. Inspired by Awwwards-level execution. Not noisy. Not maximalist. Not generic.

---

## Image-First Design Principles

### Images Are Not Background

Images are foreground. They are the subject. They are what the user came to experience. Every layout decision should ask: "Does this make the image more impactful?"

---

### Images Deserve Space

Don't cramp images in tight containers with heavy borders. Give them room. Full-bleed when appropriate. Generous padding. Let the image dominate.

---

### Images React

Static images are dead. Absolute UI images respond — to scroll position, to cursor proximity, to viewport entry, to user intent. The level of response defines the quality of the experience.

---

### Image Quality Is Non-Negotiable

Low-resolution images, poorly cropped images, generic stock photos — these destroy the experience instantly. Use high-quality aesthetic photography: magazine-quality, nature, architecture, editorial.

---

## Typography Philosophy

Typography should feel editorial and confident.

Characteristics:

- Large display headings with tight letter-spacing
- Strong visual hierarchy through size contrast
- Clean, readable body text
- Consistent vertical rhythm

Maximum: 2 font families.

Avoid:

- Decorative or novelty fonts
- Hard-to-read display typefaces
- Excessive font combinations
- Default browser typography

---

## Color Philosophy

Colors support the image. Colors do not compete with it.

### Light Mode Only

Absolute UI uses **warm light mode exclusively**. There is no dark mode, no dual theme, and no `prefers-color-scheme` dark variant. Do not implement dark backgrounds anywhere in the website.

### Foundation

The foundation is a warm editorial palette — ivory paper, espresso text, cream depth:

| Token | Value | Purpose |
|---|---|---|
| `--bg-deep` | `#F5F2EB` | Deepest background layer (footer, depth) |
| `--bg-base` | `#FDFBF7` | Default page background (warm ivory/paper) |
| `--bg-surface` | `#FFFFFF` | Cards, elevated surfaces |
| `--bg-elevated` | `#F7F4EC` | Hover states, subtle elevation |
| `--fg-primary` | `#1A1714` | Headlines, primary copy |
| `--fg-secondary` | `#2C2723` | Body text |
| `--fg-muted` | `#7A7067` | Labels, inactive states |
| `--border-subtle` | `transparent` | Zone separation (whitespace, not lines) |
| `--border-clean` | `#EBE6D8` | Interactive element hairlines |

### Dynamic Accents

The images themselves provide the color palette:

- Extract **dominant** and **complementary** tones from active showcase photography.
- Accents, highlights, and interactive states transition between these colors on scroll or hover (e.g. terracotta `#C07860`, warm stone `#8A7B6A`, coral `#B36A5B`).

### Avoid

- Dark mode / charcoal backgrounds
- Neon palettes
- Heavy artificial gradients
- Over-saturated corporate colors
- UI elements that fight with photography for visual prominence
- Visible section dividers when whitespace can separate zones

---

## Spacing & Layout Philosophy

Layouts are built on a consistent spacing system. Generous whitespace. Strict alignment. No visual clutter.

The grid serves the image. If the grid constrains the image, break the grid.

---

# Part 2 — Motion System

## Motion Philosophy

Motion is the soul of Absolute UI. It is what makes images feel alive, what creates the cinematic quality, what separates this from every static component library.

**Framer Motion and GSAP are non-negotiable.** They are the twin animation engines that power everything. Every interaction, every reveal, every scroll-driven experience depends on them.

Motion should feel:

- Smooth — buttery, 60 FPS, no jank
- Deliberate — every animation has a reason to exist
- Responsive — reacting to scroll, cursor, viewport
- Elegant — refined easing, controlled timing, luxurious deceleration
- Cinematic — the website feels directed, not random
- Natural — organic motion that feels physically plausible

Motion should NEVER feel:

- Chaotic or random
- Aggressive or jarring
- Excessive or exhausting
- Static or absent (equally bad)
- Bouncy or playful (wrong brand)

---

## The Motion Test

Every animation must answer: **Why does this animation exist?**

Valid answers:

- It makes the image more immersive
- It guides the user's attention
- It creates narrative progression
- It provides interaction feedback
- It adds cinematic quality

Invalid answers:

- Because it looks cool
- Because competitors do it
- Because the section felt empty
- Because we can

---

## Motion Hierarchy

### Level 1 — Micro Motion (150ms – 300ms)

Hover states, button presses, cursor interactions, tooltip reveals.

These appear most frequently. They must feel flawless. Priority: highest.

---

### Level 2 — Interface Motion (250ms – 500ms)

Navigation transitions, component reveals, layout changes, image state transitions.

Purpose: create flow between interface states.

---

### Level 3 — Showcase Motion (500ms – 1200ms)

Hero reveals, large image transitions, scroll-driven storytelling sequences, signature interactions.

Purpose: create emotional impact. Use with intention — not everywhere.

---

## Motion Timing

| Token | Duration | Use For |
|---|---|---|
| Fast | 150ms | Hover effects, press states, quick feedback |
| Standard | 250ms | Most UI interactions (default) |
| Premium | 400ms | Image reveals, card interactions, transitions |
| Showcase | 600ms – 1200ms | Hero animations, scroll storytelling sequences |

---

Specific easing curve values:
- `ease-smooth` (cinematic decay): `cubic-bezier(0.32, 0.72, 0, 1)`
- `ease-magnetic` (kinetic cursor pull): `cubic-bezier(0.25, 1, 0.5, 1)`
- `ease-reveal` (controlled mask emergence): `cubic-bezier(0.16, 1, 0.3, 1)`

---

## Scroll-Driven Storytelling

This is where Absolute UI lives or dies. The scroll experience must feel directed, not random.

### Rules

- Every scroll position should reveal something meaningful
- No scroll slop — section → section → section with no narrative arc
- Use GSAP ScrollTrigger for precise scroll-linked animations
- Use Lenis for global smooth scrolling
- Pinned sections create deliberate pacing — the user stops and absorbs
- Scrub-based animations tie motion directly to scroll position
- Staggered reveals create rhythm and hierarchy
- Always call `ScrollTrigger.refresh()` after dynamic layout changes under Lenis

### Lenis + ScrollTrigger Interop

- Lenis wraps `requestAnimationFrame`; ScrollTrigger must not conflict
- Use `Lenis.raf(time)` inside a `requestAnimationFrame` loop
- Smooth scroll duration: `1.2` with standard decelerated ease

---

## Hover Motion

Hover effects should feel effortless and responsive.

Allowed:

- Scale shifts
- Perspective / 3D transforms
- Subtle rotation
- Spotlight / cursor-following effects
- Layered parallax depth
- Image zoom / crop shifts

Avoid:

- Excessive bouncing
- Large displacement distances
- Abrupt transitions
- Hover effects that obscure content

---

## Image Motion

This is the core of Absolute UI. Image motion is the product.

Allowed:

- Scroll-driven parallax (different layers move at different speeds)
- Reveal transitions (image emerges through mask, clip, or opacity)
- Cursor-aware depth (image layers respond to mouse position)
- Zoom interactions (smooth, controlled, intentional)
- Perspective transformations (3D depth on hover/scroll)
- Ken Burns-style slow drift
- Split/slice reveals

Avoid:

- Excessive zoom that loses image content
- Aggressive movement that causes disorientation
- Random motion that doesn't serve the image

The image is always the subject. Motion serves the image.

---

## Typography Motion

Typography motion should be refined and readable.

Allowed:

- Character-by-character reveals
- Word-level staggered reveals
- Mask/clip-path animations
- Scroll-driven reveals
- Opacity + transform entrances

Avoid:

- Constant looping motion on text
- Motion that makes text hard to read
- Distracting text animations during content consumption

Typography must remain readable at all times.

---

## Canvas & Ambient Motion

Canvas-based effects for atmospheric depth.

Constraints:

- Use vanilla HTML5 `<canvas>`, not React-rendered DOM particles
- Particle density: `Math.floor((width * height) / 25000)` for balanced performance
- Particle speeds: very slow drift — `(Math.random() - 0.5) * 0.15` per axis
- Always cancel `requestAnimationFrame` on cleanup
- Resize handler must recalculate canvas dimensions

Performance target: 60 FPS with up to 200 particles.

---

## Cursor Interactions

Cursor interactions add life to the experience.

Examples:

- Magnetic pull on interactive elements
- Cursor-following spotlight effects
- Image layers that shift with cursor position
- Dynamic reveals tied to cursor proximity

Rules:

- Must remain responsive and performant
- Must not interfere with usability
- Must degrade gracefully on touch devices (no cursor = fallback behavior)

---

## Mobile Motion

Motion adapts for mobile:

- Reduce heavy effects (no cursor interactions on touch)
- Respect battery life
- Maintain responsiveness
- Touch interactions should feel native
- Scroll-driven effects remain, but simplified

---

## Accessibility

Respect `prefers-reduced-motion`:

- Provide alternative static experiences
- Reduce or eliminate motion for users who request it
- This is mandatory, not optional

---

## Forbidden Motion

Never use:

- Infinite spinning
- Constant bouncing
- Random shaking
- Flashing effects
- Excessive glow pulsing
- Aggressive zooming
- Attention-seeking infinite loops
- Physics-based spring bounces (wrong brand — we're cinematic, not playful)

---

## Performance Standards

Target: 60 FPS minimum on all animations.

Preferred techniques:

- GPU-accelerated transforms (`transform`, `opacity`)
- `will-change` on animated elements
- Avoid frequent layout recalculations
- Avoid expensive DOM updates during animation
- Lazy-load heavy visual effects

Beauty must not compromise performance.

---

# Part 3 — Content & Voice

## Writing Philosophy

Content serves the experience. The best content is invisible — users focus on the visuals and interactions, not the writing.

Content exists to create clarity. Nothing more. Nothing less.

---

## Writing Principles

### Clarity First

Users understand information immediately.

Good: "Image component with scroll-driven parallax and cursor-aware depth."

Bad: "Revolutionary next-generation image experience designed to elevate user engagement."

---

### Show, Don't Sell

Focus on what the experience does. Don't exaggerate.

Good: "Creates depth through layered scroll-driven interactions."

Bad: "Transforms ordinary interfaces into unforgettable masterpieces."

---

### Be Specific

Specific descriptions build trust.

Good: "Parallax image with smooth scroll-driven motion and 3D perspective shift."

Bad: "Beautiful image experience."

---

### Respect The User

Assume the reader is intelligent. Avoid excessive explanations, clickbait language, and marketing fluff. Provide useful information directly.

---

## Website Copy Guidelines

Website copy should:

- Explain quickly — what is this, why should I care
- Inspire confidence — prove quality through execution, not words
- Support the visual experience — never compete with it

Avoid:

- Long paragraphs
- Buzzwords
- Marketing clichés
- Copy that feels like it came from a template

---

## Hero Copy Guidelines

The hero should answer three questions within seconds:

1. What is Absolute UI?
2. Why should I care?
3. What makes it different?

Keep it short. Let the visuals do the heavy lifting.

---

## Documentation Quality Checklist

Before publishing any copy:

- Is it clear?
- Is it concise?
- Is it useful?
- Is it specific?
- Does it sound human?

If any answer is "No", revise.

---

# Part 4 — Future Component Philosophy

> **Note:** This section is deferred to Phase 3. These principles apply when component development begins. They are documented here to preserve the quality standard.

---

## Quality Standard

When components ship, every component must satisfy:

### Visual Quality

- Visually distinctive
- Clean composition
- Strong hierarchy
- Professional polish

### Interaction Quality

- Meaningful, image-first interaction
- Responsive feedback
- Natural, cinematic motion
- Delightful experience

### Technical Quality

- Responsive across devices
- Accessible (keyboard, screen reader, semantic HTML)
- Performant (60 FPS)
- Maintainable code

### Reusability

- Works across multiple project types
- Easy to customize
- Clear API

If any area fails, the component is not ready.

---

## Curation Rules

The value of Absolute UI comes from curation. Not every component deserves inclusion.

### The Bookmark Test

> Would a developer save this component for future use?

If uncertain: improve it. If no: reject it.

### The Screenshot Test

> If someone posted a screenshot of this component, would people ask where it came from?

If not: the component lacks distinction.

### The Hero Test

> Is this component good enough to appear on the homepage?

If not: refine it.

---

## Rejection Criteria

Immediately reject components that:

- Feel generic (found in thousands of libraries)
- Copy competitors directly (learn, don't replicate)
- Depend entirely on motion (design must stand alone)
- Follow temporary trends (glassmorphism excess, random glow)
- Create accessibility issues
- Lack the image-first philosophy

---

## Approval Checklist

Before shipping any component:

- Is it beautiful?
- Is it image-first?
- Is it memorable?
- Is it polished?
- Is it responsive?
- Is it accessible?
- Is it performant?
- Is it reusable?
- Is it production ready?
- Is it better than common alternatives?

If any answer is "No", the component is not ready.

---

## Final Rule

A single unforgettable image-first component is more valuable than one hundred forgettable generic components.

When in doubt, remove it.
