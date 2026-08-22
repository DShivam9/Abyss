# ABYSS — DESIGN RECORD

**Version:** 2.0.0
**Project Name:** Abyss
**Status:** Active — Global Design System

---

## TABLE OF CONTENTS

1. [Global Design Philosophy](#1-global-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography System](#3-typography-system)
4. [Motion & Easing](#4-motion--easing)
5. [Surfaces & Materials](#5-surfaces--materials)
6. [Interaction Patterns](#6-interaction-patterns)
7. [Navigation](#7-navigation)
8. [Page-Level Notes](#8-page-level-notes)
9. [Component Exception Rule](#9-component-exception-rule)
10. [Self-Audit Checklist](#10-self-audit-checklist)

---

## 1. GLOBAL DESIGN PHILOSOPHY

Abyss is a dark-native product. Every page — homepage, collection, showcase, docs, changelog, legal — lives on `#0d0d0f`. There is no light mode, no toggle, no alternative. The darkness is part of the identity.

Colors are quiet by default. The accent (`#9be5fb`) shows up only on interaction states, active indicators, and brand-level moments. It is not used as decoration on static elements.

Typography is layered between two families: Ranade for display and headings, Switzer for everything else. This is the only global rule. Within individual components, fonts are unconstrained — each component may use whatever typeface fits its aesthetic.

Motion is structural, not decoration. If an element moves for no reason, it shouldn't move at all.

---

## 2. COLOR SYSTEM

### 2.1 Core Palette (locked)

These tokens are defined in `dock-material.css` and apply globally across all pages.

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0d0d0f` | Page background — all pages |
| `--card-slab` | `#121215` | Cards, elevated surfaces |
| `--preview-bg` | `#070709` | Card preview area inner background |
| `--dock-surface` | `#1a1a1c` | Icon button backgrounds inside dock elements |
| `--surface-elevated` | `#16161a` | Panels, drawers, modals on showcase |
| `--border-subtle` | `#1f1f28` | Showcase-level borders |
| `--border-hairline` | `rgba(255, 255, 255, 0.06)` | Card borders, dividers, structural 1px lines |
| `--text-primary` | `#ffffff` | Headings, active labels |
| `--text-muted` | `#8e8e93` | Secondary text, inactive icons, metadata |
| `--text-title-muted` | `#a1a1aa` | Card text, scrubber labels |
| `--card-text` | `#d4d4d8` | Card title default |
| `--card-text-hover` | `#ffffff` | Card title on hover |
| `--accent` | `#9be5fb` | Cobalt Ice — the one accent color |

### 2.2 Accent Rules

- `--accent` (`#9be5fb`) is the single accent color across all pages. No page gets a different accent.
- Use on: hover states, active/focus indicators, active nav links, the brand icon, selected states.
- Do not use on: static decorative elements, backgrounds, borders at rest, section titles.
- When accent appears on a dark fill (e.g. shutter hover), text and icons must flip to `#0d0d0f` (dark) for contrast.

### 2.3 What NOT to use

- Pure `#000000` — minimum dark is `#0d0d0f`.
- Any gradient background — no gradient bleeds, no mesh gradients.
- Multiple accent colors — `#9be5fb` only. One accent. Always.
- Glassmorphism, frosted glass, or blur-panel aesthetics.

---

## 3. TYPOGRAPHY SYSTEM

### 3.1 Font Stack

All fonts are loaded in `apps/web/src/app/layout.tsx`.

| Font | Source | Variable / Class | Role |
|---|---|---|---|
| **Ranade** | Fontshare CDN | `var(--font-display)` | Display, headings (H1–H3), wordmark |
| **Switzer** | Fontshare CDN | `var(--font-body)` | Body, UI, nav links, buttons, labels, descriptions |
| **Dela Gothic One** | Google Fonts CDN | `var(--font-section)` | Collection page section headers ONLY |
| **JetBrains Mono** | Google Fonts (`next/font/google`) | `var(--font-mono)` | Code, keyboard hints, category labels, counts, metadata |
| **PP Editorial New** | Self-hosted `.otf` | `var(--font-editorial)` | Accent editorial moments — sparingly |
| **Satoshi** | Self-hosted `.woff2` | `var(--font-satoshi)` | Legacy — being phased out; use Switzer instead |

**Rule**: `Ranade = display`. `Switzer = everything functional`. When in doubt, Switzer.

### 3.2 Typographic Scale

| Element | Size | Weight | Font | Tracking |
|---|---|---|---|---|
| Hero wordmark | `clamp(4rem, 10vw, 10rem)` | 700 | Ranade | `-0.04em` |
| Page title (H1) | `clamp(2rem, 4vw, 3.5rem)` | 600–700 | Ranade | `-0.03em` |
| Section heading (H2) | `clamp(1.5rem, 2.5vw, 2rem)` | 600 | Ranade | `-0.02em` |
| Sub-heading (H3) | `1.25rem–1.5rem` | 500–600 | Ranade | `-0.01em` |
| Body text | `1rem (16px)` | 400 | Switzer | `0` |
| Body secondary | `0.9375rem (15px)` | 400 | Switzer | `0` |
| UI labels / nav | `0.8125–0.875rem (13–14px)` | 500 | Switzer | `0` |
| Metadata / caption | `0.6875–0.75rem (11–12px)` | 400–500 | Switzer or JetBrains Mono | `0.06em` uppercase |
| Code / mono | `0.8125–0.875rem (13–14px)` | 400 | JetBrains Mono | `0` |
| Collection section headers | `38px` | 700 | Dela Gothic One | `0.04em` uppercase |
| Card title | `14.5px` | 500 | Switzer | `0` |

### 3.3 Weights Loaded

- **Ranade**: 400, 500, 600, 700, 900 (via Fontshare CDN)
- **Switzer**: 400, 500, 600, 700 (via Fontshare CDN)
- **JetBrains Mono**: variable weight via Google Fonts

### 3.4 Banned Fonts (globally)

- Geist, Inter, Roboto — do not introduce.
- Satoshi is loaded but being retired; new code should use Switzer.
- Do not load additional fonts for website shell pages. Components are exempt from this rule.

---

## 4. MOTION & EASING

### 4.1 Easing Curves (locked tokens)

Defined in `dock-material.css` and `globals.css`. Import and use — never invent ad-hoc cubic-bezier values.

| Token | Value | When to use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Nav, drawer, modal, general reveals |
| `--ease-emil` | `cubic-bezier(0.23, 1, 0.32, 1)` | Card hover, scale transitions |
| `--ease-abyss` | `cubic-bezier(0.16, 1, 0.3, 1)` | Alias for ease-out; global default |
| `--ease-heavy` | `cubic-bezier(0.33, 1, 0.68, 1)` | Large elements, hero reveals |
| `--ease-snap` | `cubic-bezier(0.22, 1, 0.36, 1)` | Snappy micro-interactions |

Banned: `linear`, `ease-in-out`, browser default `ease` on any intentional animation.

### 4.2 Motion Principles

- **Reduced motion**: All animations must respect `prefers-reduced-motion: reduce`. Collapse to instant or cross-fade. Already handled globally in `globals.css`.
- **No motion for motion's sake**: Every animation must communicate state change or serve the interaction. Remove anything that could be deleted without losing information.
- **GPU-only properties**: Animate `transform` and `opacity` only. Never animate `width`, `height`, `top`, `left`, `padding`, `margin`.
- **GSAP lifecycle**: All GSAP inside `useGSAP()` — never raw `useEffect` + gsap calls.
- **Lenis + GSAP**: ScrollTrigger ticker must sync with Lenis RAF to prevent micro-jitter.

### 4.3 Transition Durations

| Interaction type | Duration |
|---|---|
| Micro-interactions (hover fill, color) | 200–240ms |
| Panel slide-in (drawers, ledgers) | 620–680ms |
| Card hover lift | 280ms |
| Section reveals | 400–600ms |
| Loader / full-page transition | 800ms–1s |

---

## 5. SURFACES & MATERIALS

### 5.1 Dock Material

The signature surface used on all floating dock elements: navbar, specimen rail, control pill, ledger panels, command palette.

```css
.dock-material {
  background: linear-gradient(180deg, #141416 0%, #0d0d0f 100%);
  border-radius: 14px;
  border: none;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.5),
    0 16px 36px rgba(0, 0, 0, 0.7);
}
```

The class `.dock-material` is defined in `dock-material.css` and can be applied directly. Do not recreate this inline.

### 5.2 Card Surface

Used for component cards in the collection page.

- Background: `var(--card-slab)` (`#121215`)
- Border: `1px solid rgba(255,255,255,0.055)`
- Box shadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px -2px rgba(0,0,0,0.75), 0 2px 6px rgba(0,0,0,0.6)`
- Border radius: `14px`

### 5.3 Panel / Elevated Surface

Used for info/code ledgers, controls drawer.

- Background: `var(--surface-elevated)` (`#16161a`)
- Border radius: `16px`
- Larger shadow variant: `0 24px 60px rgba(0,0,0,0.75)`

### 5.4 Code Block Surface

For inline code or code cards:

- Background: `rgba(0,0,0,0.35)`
- Border: `1px solid rgba(255,255,255,0.05)`
- Border radius: `10px`
- Padding: `20px 22px`

### 5.5 Grain Overlay

A fixed SVG noise texture sits above backgrounds and below all UI on showcase pages. Opacity: `0.14`, `mix-blend-mode: overlay`, `pointer-events: none`. Defined in `GrainOverlay.tsx`.

---

## 6. INTERACTION PATTERNS

### 6.1 Shutter Hover (Signature Interaction)

The diagonal skew fill used on nav links and icon buttons. Defined in `.dock-material.css` as `.shutter-hover`.

```css
/* Applied automatically via .shutter-hover class */
/* On hover: accent bg slides in diagonally, text turns #000000 */
```

Rules:
- Nav links: always use shutter hover.
- Icon buttons inside docks: always use shutter hover.
- Do not apply to card bodies or section headers.

### 6.2 Card Hover

- Lift: `transform: translateY(-3px)`, `280ms var(--ease-emil)`
- Shadow deepens
- Inner image: `transform: scale(1.05)`, `380ms var(--ease-emil)`
- Card title color: `--card-text` to `--card-text-hover`
- Arrow icon: `opacity: 0` to `opacity: 1`, shifts position

### 6.3 Button States

All buttons use spring-physics via Framer Motion `whileHover` or GSAP — not plain CSS `:hover`. Minimum spec:
- Scale + background color shift on hover.
- Tap state: scale slightly down (0.97–0.98).

### 6.4 Focus States

- Focus rings visible and styled with `var(--accent)` outline, not default browser blue.
- `outline: 1.5px solid var(--accent)`, `outline-offset: 2px`.

### 6.5 Copy Behavior

On code copy buttons: button accent-flashes for 1200ms. No toast notifications — the button is its own feedback.

---

## 7. NAVIGATION

### 7.1 DockNavbar (global — collection, docs, changelog, legal)

Defined in `DockNavbar.tsx`. A floating pill centered at the top.

- Position: fixed, `top: 20px`, centered, `z-index: 1000`
- Max width: `680px`, `width: calc(100% - 32px)`
- Height: `54px`, padding `0 20px`
- Material: `.dock-material`
- Left: Brand icon (starburst SVG, `--accent` colored) + "ABYSS" text (Ranade 600, 13.5px, letter-spacing 0.08em)
- Center: Nav links — "Collection", "Docs". Each uses `.shutter-hover`. Switzer 500, 13.5px. Default color: `--text-muted`.
- Right: Search icon button (opens Cmd+K) + GitHub icon button. Both 34×34px, `--dock-surface` bg, shutter hover.

### 7.2 Homepage Nav

The homepage has its own navigation — separate from DockNavbar. Design TBD when homepage is built. Do not apply DockNavbar to the homepage.

### 7.3 Showcase Nav

The showcase page has no navbar. Navigation is handled by the ruler drawer (left panel) and the specimen rail (bottom).

### 7.4 Active Link State

Active nav link: `color: var(--accent)`. No underline. Switzer 500 or 600.

---

## 8. PAGE-LEVEL NOTES

### 8.1 Collection Page (`/components`)

- Uses DockNavbar.
- Background: `--bg` (`#0d0d0f`), `padding: 170px 40px 100px 40px`.
- Content max-width: `1280px`, centered.
- Section headers: Dela Gothic One — the only page that uses this font.
- Bottom control pill for search, layout toggle, sort.
- Design fully built — reference `Majorplan.md` §4 for spec.

### 8.2 Showcase Page (`/showcase/[slug]`)

- No navbar. Full-viewport component.
- Grain overlay.
- Specimen rail (bottom), ruler drawer (left), info/code ledger (right).
- Background: `--bg`.
- Design fully built — reference `Majorplan.md` §5 for spec.

### 8.3 Homepage (`/`)

- Own navigation (not DockNavbar).
- Hero: to be designed. Current 3D shatter sphere is a placeholder.
- Full redesign planned. When built, it should feel like the most impressive page on the site.
- Font: Ranade for wordmark/hero. Switzer for everything else.
- No Dela Gothic One here.

### 8.4 Docs Page (`/docs`)

- Uses DockNavbar.
- Layout: left sidebar + main content area.
- Background: `--bg` globally. Sidebar slightly elevated: `--card-slab` (`#121215`).
- Typography: Ranade for section headings, Switzer for body, JetBrains Mono for code.
- Existing layout in place — improve aesthetics, not structure.

### 8.5 Changelog Page (`/changelog`)

- Uses DockNavbar.
- Content: version-by-version release notes + new components added + fixes. Mix of formal release notes and casual updates.
- Layout: simple chronological list, minimal chrome.
- Typography: Ranade for version numbers/dates as headings, Switzer for content.

### 8.6 Legal Pages (`/legal/privacy`, `/legal/terms`)

- Uses DockNavbar.
- Plain readable text columns, no visual flair.
- Max-width content column, centered. Generous line-height for readability.
- Ranade for page title only. Switzer for all body text.

---

## 9. COMPONENT EXCEPTION RULE

Individual Abyss components (inside `packages/core/src/components/`) are exempt from all rules in this document. Components may use:

- Any typeface that fits the component's aesthetic.
- Any color palette their design requires.
- Their own motion system independent of the easing tokens.
- Their own surface materials and treatments.

The design system defined here applies to the **website shell only**: navbar, collection page, showcase chrome, docs, changelog, legal. Not to the components themselves.

---

## 10. SELF-AUDIT CHECKLIST

Run before calling any page done.

- [ ] Background is `#0d0d0f` — no lighter page bg, no pure black.
- [ ] Font is Ranade (headings) or Switzer (body/UI). No Geist, Inter, Roboto, Satoshi in new code.
- [ ] Mono text uses JetBrains Mono (`var(--font-mono)`).
- [ ] Dela Gothic One appears only on the collection page section headers.
- [ ] Accent `#9be5fb` is used only on interaction states, not static decoration.
- [ ] No gradient backgrounds.
- [ ] No glassmorphism.
- [ ] All hover states use `.shutter-hover`, Framer Motion, or GSAP — not plain CSS transitions on interactive elements.
- [ ] Animations use easing tokens (`--ease-out`, `--ease-emil`, etc.) — not ad-hoc cubic-bezier values.
- [ ] GPU-only animation properties: transform + opacity only.
- [ ] `prefers-reduced-motion` respected.
- [ ] Focus rings use `--accent`, not default browser blue.
- [ ] No pure `#000000` anywhere in the shell.
- [ ] Component files in `packages/core/` are untouched.

---

*Global design decisions live here. Implementation plans and phase tracking live in `Majorplan.md`. Product definition lives in `pdr.md`. Technical architecture lives in `tdr.md`.*
