# Absolute UI — Site Improvement Plan

**Status:** Active source of truth for website rebuild  
**Last updated:** June 2026  
**Audience:** All AI agents (Gemini, Claude, Cursor) and human implementers

---

## Locked Decisions

These are non-negotiable. Do not reintroduce, debate, or "temporarily restore" them.

| Decision | Ruling |
|---|---|
| **Color mode** | **Warm light mode only.** No dark mode. No dual theme. No `prefers-color-scheme` dark variant. |
| **Waitlist** | **Removed permanently.** No email capture, no signup CTA, no "join waitlist" copy anywhere. |
| **Playground zone** | **Removed from the website.** Interactive demos belong in the Gallery exhibitions, not a separate sandbox section. |
| **Font families** | **Maximum 2:** Cormorant Garamond (display) + Satoshi (UI/body). Remove all other loaded families. |
| **Navigation** | Minimal top bar. No left vertical nav. Scroll is the primary navigation. |

---

## Narrative Arc (Revised)

The website is a **curated digital exhibition**, not a component catalog or SaaS landing page.

```
Arrival (intrigue)
    → Philosophy (conviction)
    → Gallery (proof — interactive image exhibitions)
    → Manifesto (emotional climax)
    → Footer (resolution + presence)
```

**Emotional pacing:** intrigue → belief → demonstration → conviction → closure

There is no conversion zone. The footer carries brand presence, links, and craft — not lead capture.

---

# Part 1 — Critical Bug Fixes

Fix these before any aesthetic polish. Broken motion reads as low quality regardless of typography.

## 1.1 Louver Reveal (Gallery — Exhibition 01)

**Problem:** Mid-scroll, vertical slices collapse to `scaleX: 0`, exposing a gray empty block with only a thin image sliver. Reads as a broken asset, not a deliberate reveal.

**Root cause:** `scaleX` animation on slices with `origin-left` collapses width to zero while the container remains visible.

**Fix:**
- Replace `scaleX` reveal with **clip-path** or **mask-image** stagger (each slice reveals left-to-right without collapsing layout).
- Keep a **full base image** visible underneath at reduced opacity so the card never appears empty.
- Pin duration: reduce from `+=100%` to `+=70%` — current pacing feels sluggish.

**Acceptance criteria:**
- At every scroll position, the card shows recognizable image content.
- Reveal feels like louvers opening, not placeholders loading.
- No gray void at any scrub point.

---

## 1.2 Seam Split (Gallery — Exhibition 02)

**Problem:** After scroll, a persistent **white horizontal gap** remains between top and bottom halves. Hidden text sits in the gap at unreadable contrast. Image halves misalign.

**Root cause:** Halves translate ±30px but never reset; no overlap at the seam; text panel opacity tied to same scrub timeline as split.

**Fix:**
- Overlap halves by **2px** at the seam to prevent subpixel gaps.
- Reset transforms to `y: 0` at timeline end (`onLeave` / final keyframe).
- Reveal text panel only after split reaches **60%** of max displacement.
- Text panel: use `--fg-primary` on `--bg-surface` pill/card — never float text in the seam void.

**Acceptance criteria:**
- No visible gap line at any scroll position after pin releases.
- Text is readable when revealed.
- Split feels intentional, not like a rendering glitch.

---

## 1.3 Philosophy Word Reveal

**Problem:** Headline words start at **15% opacity** in muted gray. On first view, copy looks broken or unfinished.

**Fix:**
- Initial word opacity: **minimum 45%** (`--fg-secondary`), not 15%.
- Active word: full `--accent` at peak, then settle to `--fg-primary` at 90% opacity.
- Add `onEnter` fallback: if user doesn't scroll through pin, entire quote fades to full readability after 1.2s.

**Acceptance criteria:**
- Quote is readable without scrolling.
- Scroll scrub still creates a highlight wave — it enhances, not enables, readability.

---

## 1.4 Manifesto Text Clipping

**Problem:** "IMMERSION" clips to "IMMERSIO…" on wide viewports. `whitespace-nowrap` + `xPercent` drift pushes text off-screen.

**Fix:**
- Replace fixed `xPercent` travel with `clamp()`-scaled values based on viewport width.
- Reduce travel range: `-12%` to `+12%` max (currently ±20%).
- Add `overflow-hidden` on container with **generous horizontal padding** (`px-[5vw]`).
- Below 768px: reduce display size and allow controlled wrap on row 3 only.

**Acceptance criteria:**
- All three words fully visible at 1440px, 1280px, and 768px.
- Parallax drift still perceptible but never clips.

---

## 1.5 Lenis / Native Scroll Conflict

**Problem:** TopNav uses `scrollIntoView()`, Footer uses `window.scrollTo()`. Lenis runs via `scrollerProxy`. Result: janky jumps, desynced nav active state, broken pin math.

**Fix:**
- Create `LenisContext` exposing the Lenis instance.
- All programmatic scroll (nav links, logo, back-to-top) calls `lenis.scrollTo(target, { duration: 1.4 })`.
- Nav `scrolled` state and active section detection listen to **Lenis scroll events**, not `window.scrollY`.
- Remove native `behavior: "smooth"` entirely.

**Acceptance criteria:**
- Nav clicks feel identical to manual scroll — no double-scroll or snap-back.
- Active section indicator tracks correctly through pinned zones.

---

## 1.6 Light Mode Token Migration (Codebase)

**Problem:** `globals.css` and all zone components still use dark tokens (`#0A0A0A`, `#F0EDE8`). Docs say light mode. Site renders dark.

**Fix:** Apply locked light tokens everywhere:

| Token | Value |
|---|---|
| `--bg-deep` | `#F5F2EB` |
| `--bg-base` | `#FDFBF7` |
| `--bg-surface` | `#FFFFFF` |
| `--bg-elevated` | `#F7F4EC` |
| `--fg-primary` | `#1A1714` |
| `--fg-secondary` | `#2C2723` |
| `--fg-muted` | `#7A7067` |
| `--border-clean` | `#EBE6D8` |
| `--border-subtle` | `transparent` |

**Image treatment adjustments for light mode:**
- Remove heavy dark vignettes (`from-[#0A0A0A]/90`).
- Replace with subtle warm gradients: `from-[#FDFBF7]/80 via-transparent to-[#FDFBF7]/40`.
- Reduce `brightness-[0.7]` filters — light mode images should feel luminous, not crushed.
- Film grain opacity: reduce from `0.02` to `0.008` — grain reads harsher on light backgrounds.

**Acceptance criteria:**
- Entire page reads warm ivory/paper, never charcoal.
- Text contrast passes WCAG AA on all zones.
- No dark-mode color literals remain in component files.

---

## 1.7 Accessibility Gaps

**Fix:**
- Add `prefers-reduced-motion` media query: disable pin scrub, replace with instant state or simple fade.
- Remove blanket `select-none` from content sections — keep only on decorative motion layers.
- Nav character-split hover: add `aria-label` on links (visible text is split into spans for animation).
- Footer back-to-top: replace `elastic.out` easing with `power3.out` — elastic violates brand motion rules.

---

# Part 2 — Hero (Arrival Zone) — Full Redesign Spec

The hero is the **opening shot**. It must answer in 3 seconds: *What is this? Why care? What's different?*

Current hero fails on: no interactivity, no subline, no CTA path, static image, dark-mode treatment, unused video asset.

## 2.1 Visual Composition

**Layout:** Full viewport (`100dvh`). Three depth layers minimum.

```
Layer 0 — Warm atmospheric base (#FDFBF7 with subtle radial warmth)
Layer 1 — Full-bleed image (foreground subject, NOT background wallpaper)
Layer 2 — Typography + micro UI (foreground, interactive)
Layer 3 — Optional: subtle grid or grain (2% opacity max)
```

**Image:** Use `/images/particle-ascension.jpg` OR `/videos/hero-background.mp4` (muted, loop, poster frame). Video preferred for "alive" first impression — but only if optimized (<3MB, WebM + MP4).

**Image behavior:**
- Cursor parallax: image shifts ±15px based on normalized mouse position (opposite direction to text for depth).
- Scroll: image scales 1.0 → 1.06 and drifts down 8% as user exits hero.
- No `pointer-events-none` on the image container — hero must feel responsive.

## 2.2 Typography

**Line 1:** `ABSOLUTE` — Syne, `clamp(3.5rem, 10vw, 8rem)`, weight 800, `--fg-primary`, tracking `-0.04em`, uppercase.

**Line 2:** `Interface` — Cormorant Garamond, italic, weight 300, `clamp(2rem, 6vw, 5rem)`, `--fg-primary`.

**Line 3 (NEW — subline):**  
`Image-first interactive components.` — Satoshi, `text-sm md:text-base`, `--fg-secondary`, max-width `28ch`, centered below title.

**Entrance sequence (GSAP timeline, 2.4s total):**
1. Image: scale 1.08 → 1.0, opacity 0 → 1 (1.8s, `power3.out`)
2. Line 1: masked `yPercent` 110 → 0 (1.2s, overlap -1.4s)
3. Line 2: masked `yPercent` 110 → 0 (1.2s, stagger 0.15s)
4. Line 3: opacity 0 → 1, y 12 → 0 (0.8s)
5. Scroll indicator: fade in at 2.0s (thin line + "Scroll" label, `--fg-muted`)

**Do NOT:** bounce, spring, glitch, or typewriter effects.

## 2.3 Interactive Elements

**Scroll indicator:** Bottom center. Animated line that pulses once. Disappears after first scroll (`ScrollTrigger` onExit).

**Optional — cursor accent:** As cursor moves across hero, `--accent` on `:root` shifts subtly between two pre-defined warm tones sampled from hero image (terracotta `#C07860` ↔ warm stone `#8A7B6A`). Amplitude: minimal. Duration: 0.8s.

**No waitlist button.** Optional single CTA: `Explore Exhibition →` smooth-scrolls to Gallery via Lenis.

## 2.4 What to Remove from Current Hero

- Dark vignette overlays
- Unused Framer Motion import
- `select-none` on entire section
- Empty space where CTAs/subline should be

## 2.5 Hero Acceptance Criteria

- [ ] Readable subline visible within 2s of load
- [ ] Image responds to cursor on desktop
- [ ] Image parallax on scroll exit
- [ ] Light mode tokens only
- [ ] 60 FPS on entrance timeline
- [ ] Reduced-motion: static hero with instant text visible

---

# Part 3 — Navigation Bar — Full Redesign Spec

Current nav: character-split hover (good craft), but wrong scroll integration, wrong link labels, no mobile treatment, duplicates accessible text.

## 3.1 Structure

```
[ ABSOLUTE UI ]          [ Exhibition ] [ Philosophy ] [ GitHub ↗ ]
  Exhibition System
```

**Remove:** "Components" (Playground gone), "Docs" (misleading — pointed to Manifesto).

**Add:** "Philosophy" — scrolls to `#philosophy`.

**Keep:** GitHub as external link with `↗` indicator.

## 3.2 Visual Design (Light Mode)

**Default state (top of page):**
- Background: transparent
- Logo: `--fg-primary`
- Links: `--fg-muted`, 9px Syne, tracking `0.2em`, uppercase

**Scrolled state (after 80px Lenis scroll):**
- Background: `--bg-base/80` + `backdrop-blur-md`
- Border-bottom: `1px solid --border-clean`
- Padding reduces: `py-6` → `py-4`
- Transition: 400ms `ease-smooth`

**Active section:**
- Link color: `--accent`
- 4px dot below link (scale 0 → 1, `--accent`)

**Hover:**
- Keep character-split roll animation — it fits the editorial craft
- Add `aria-label={label}` on each link to fix screen reader duplication from split spans

## 3.3 Behavior

- All scroll via Lenis (`lenis.scrollTo('#section-id')`)
- Active section: IntersectionObserver with `rootMargin: '-40% 0px -40% 0px'`, fed by Lenis scroll position
- Mobile (<768px): collapse links into single "Menu" text button that reveals minimal overlay (not hamburger icon — use "Index" label, editorial style)

## 3.4 What NOT to Do

- No sticky sidebar nav
- No progress bar (feels SaaS)
- No glassmorphism blur beyond subtle scrolled state
- No dark nav variant

## 3.5 Nav Acceptance Criteria

- [ ] All links scroll smoothly via Lenis
- [ ] Active indicator accurate through pinned sections
- [ ] Mobile menu accessible (keyboard, focus trap, escape close)
- [ ] Light mode only
- [ ] No duplicate screen reader text

---

# Part 4 — Gallery Zone Improvements

Playground interactions merge here — each exhibition IS the interactive proof.

## 4.1 Structural Change

Convert from **4 stacked full-screen pins** to **horizontal scroll exhibition**:

- Pin section container on scroll
- Scrub horizontal translation of exhibition track
- Left column (40%): sticky exhibition title + description
- Right column (60%): horizontal deck of exhibition panels

This matches original Phase 6 plan and eliminates scroll fatigue from consecutive pins.

## 4.2 Exhibition Catalog (Keep 4, Fix All)

| # | Name | Interaction | Fix Priority |
|---|---|---|---|
| 01 | Louver | Clip-path stagger reveal + hover tilt | Critical (1.1) |
| 02 | Seam | Split reveal + overlap + text card | Critical (1.2) |
| 03 | Chromatic | Velocity aberration on scroll | Medium — simplify RGB blend to CSS `filter` approach |
| 04 | Lens | Cursor magnifier | Low — already strongest; tune for light mode |

## 4.3 Wire GalleryCard

`GalleryCard.tsx` exists but is unused. Either:
- Integrate into a future masonry grid appendix section, OR
- Delete the file to reduce dead code

**Recommendation:** Delete until a grid section is designed. Dead components confuse agents.

## 4.4 Gallery Copy

Update intro header — remove reference to "cursor coordinates" if mobile can't support it. Say:

> "Each image is the component. Scroll to reveal. Hover to respond."

---

# Part 5 — Philosophy Zone Improvements

- Light mode image frame: white surface, no dark `bg-bg-deep` container
- Image hover: subtle 3D tilt (reuse GalleryCard pattern, intensity 8°)
- Remove visible `border-b` — use whitespace separation only
- Body copy size: minimum 13px (`text-sm`), not 10px

---

# Part 6 — Manifesto Zone Improvements

- Fix clipping (see 1.4)
- Portrait: add scroll-linked scale `1.0 → 1.04` and subtle `--accent` shadow bloom
- Text rows: slow color breathe through accent palette (terracotta → sage → stone, 8s cycle, opacity shift only — no position change on reduced-motion)
- Remove excessive empty space below portrait: reduce container from `h-[150vh]` to `h-[120vh]`
- Footnote tagline: increase to 11px, `--fg-secondary`

---

# Part 7 — Footer — Stunning Aesthetic Spec

The footer is the **closing frame** of the exhibition. Not an afterthought. Not a template link row.

## 7.1 Layout

Full-width. Generous vertical padding (`py-20 md:py-28`). Three-column on desktop, stacked on mobile.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ABSOLUTE UI              Links              Back to top       │
│   Image-first.             GitHub ↗           ○ magnetic       │
│   Motion-driven.           Twitter ↗                          │
│                            Discord ↗                           │
│                                                                 │
│   ─────────────────────────────────────────────────────────── │
│                                                                 │
│   © 2026 Absolute UI · MIT          LONDON · 20:21:01 GMT      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 7.2 Visual Treatment

- Background: `--bg-deep` (`#F5F2EB`) — slightly deeper than page base for subtle section closure
- Top edge: no hard border — use 1px gradient hairline `from-transparent via--border-clean to-transparent`
- Logo block: Syne 10px tracking + Satoshi tagline "Image-first. Motion-driven." in `--fg-muted`
- Links: character-split roll animation (match nav craft), `--fg-muted` → `--accent` on hover
- Back-to-top: magnetic circle, 44px, border `--border-clean`, arrow rotates toward cursor — **no elastic easing**

## 7.3 Live Details

- London clock: keep — it adds editorial personality
- Copyright + MIT: keep minimal
- Social links: real Absolute UI URLs when available; remove placeholder `#` hrefs

## 7.4 Optional Signature Moment

On footer enter (IntersectionObserver or ScrollTrigger):
- Thin `--accent` line draws left-to-right across top edge (600ms, `ease-reveal`)
- Links fade up staggered (80ms apart, 20px travel)

Subtle. Once. Not looping.

## 7.5 Footer Acceptance Criteria

- [ ] Feels like a deliberate closing frame, not a bootstrap footer
- [ ] Light mode warm cream background
- [ ] All links keyboard accessible
- [ ] Back-to-top uses Lenis scroll
- [ ] No elastic/bounce easing

---

# Part 8 — Remove Playground Zone

## Why It's Removed

The Playground duplicates what the Gallery exhibitions already demonstrate. It breaks narrative pacing — users interact with a sandbox *after* seeing curated work, which undermines the exhibition metaphor. It reads as "component library preview," which is Phase 3, not the website.

## Removal Checklist

- [ ] Delete `src/components/zones/PlaygroundZone.tsx`
- [ ] Remove import from `src/app/page.tsx`
- [ ] Remove `#playground` from nav (already covered in §3)
- [ ] Remove `sectionColors.playground` from page.tsx accent map
- [ ] Update any docs referencing Zone 4 Playground
- [ ] Re-number Manifesto to Zone 4 in copy labels (`04 // NARRATIVE MANIFESTO`)

## Where Interactivity Lives Instead

Each Gallery exhibition carries its own interaction (louver, seam, chromatic, lens). The Gallery IS the playground — just curated, not configurable.

---

# Part 9 — Performance & Code Hygiene

| Item | Action |
|---|---|
| Font loading | Keep Satoshi + Cormorant only. Remove Clash Display, Cabinet Grotesk, Sentient, Playfair, Italiana, Syne duplicate loads |
| Images | Migrate to `next/image` with WebP, lazy load below fold |
| Framer Motion | Use for nav mobile menu, footer entrance, mode-less micro transitions — or remove dependency if unused |
| Dead hooks | Delete `useMousePosition.ts` / `useScrollProgress.ts` if still unused after hero rebuild |
| ScrollTrigger | Call `ScrollTrigger.refresh()` after font load and image load |
| Agentation | Keep dev-only |

---

# Part 10 — Implementation Order

Execute in this sequence. Do not skip Phase A.

```
Phase A — Foundation (do first)
  A1. Light mode tokens in globals.css + all components
  A2. Lenis context + unified scroll
  A3. Remove Playground zone + waitlist references

Phase B — Critical fixes
  B1. Louver reveal
  B2. Seam split
  B3. Philosophy readability
  B4. Manifesto clipping

Phase C — Hero + Nav rebuild
  C1. Hero per Part 2 spec
  C2. Nav per Part 3 spec

Phase D — Gallery restructure
  D1. Horizontal exhibition scroll
  D2. Exhibition fixes 03 + 04 light mode tune

Phase E — Manifesto + Footer polish
  E1. Manifesto motion + spacing
  E2. Footer per Part 7 spec

Phase F — Accessibility + performance pass
```

---

# Part 11 — AI Agent Quality Rules

> **For Gemini and all agents:** If your output looks like a template, it has failed.

## 11.1 Before Writing Any Code

1. Read this file (`docs/SITE_IMPROVEMENT_PLAN.md`)
2. Read `docs/DESIGN.md` (light mode tokens)
3. Read `GEMINI.md` § Anti-Generic Output
4. Confirm locked decisions (§ Locked Decisions above) — do not violate

## 11.2 Anti-Generic Checklist

Before submitting work, verify:

- [ ] Does it use **light mode** tokens? (Not dark `#0A0A0A`)
- [ ] Does it use **only Cormorant + Satoshi**?
- [ ] Is motion **cinematic** (power/ease curves), not bouncy?
- [ ] Does every animation answer "why does this exist?"
- [ ] Is there **no waitlist** anywhere?
- [ ] Is **Playground removed**?
- [ ] Does scroll go through **Lenis**, not native?
- [ ] Would this pass as an **Awwwards submission**, not a SaaS template?

## 11.3 Generic Output Patterns to Reject

| Generic Pattern | What to Do Instead |
|---|---|
| Dark hero with purple gradient | Warm ivory, editorial photography, restrained accent |
| "Join our waitlist" CTA | Removed permanently — use "Explore Exhibition" scroll |
| Card grid with hover lift | Full-bleed image exhibitions with scroll-driven reveals |
| Hamburger menu icon | Editorial "Index" text overlay |
| `glassmorphism` blur cards | Clean white surfaces, hairline borders, whitespace |
| Bouncy spring animations | GSAP power curves, Framer with custom cubic-bezier |
| 8 font families | Cormorant + Satoshi only |
| Separate "features" section | Philosophy + Gallery tell the story |
| Playground / sandbox zone | Interactivity inside Gallery exhibitions |

## 11.4 When User Gives Feedback

- Do not revert to previously rejected concepts (see `RULES.md` Rule 14)
- Do not argue for waitlist "just in footer" — it's permanently removed
- Do not suggest dark mode "as an option" — light mode only
- Implement exactly what this plan specifies unless user explicitly overrides

---

# Part 12 — Document Sync Checklist

When implementation completes, these files must agree:

| File | Required Updates |
|---|---|
| `docs/DESIGN.md` | Light mode only ✓ |
| `docs/WEBSITE.md` | Remove Playground + Waitlist zones, update wireframes |
| `docs/IMPLEMENTATION_PLAN.md` | Remove Phases 7–8 waitlist/playground, renumber |
| `docs/PRODUCT.md` | Remove waitlist strategy section |
| `GEMINI.md` | Anti-generic rules + link to this file |
| `RULES.md` | Remove dark mode support line |
| `src/app/globals.css` | Light tokens |
| `src/app/page.tsx` | 4 zones only, no playground |

---

*This document supersedes conflicting guidance in older planning files. When in doubt, follow this file.*
