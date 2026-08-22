# ABYSS WEBSITE REDESIGN — MASTER PLAN

> **Scope**: Collection page + Showcase page + design system + navigation + codebase cleanup.
> **Status**: PLANNING — awaiting user approval before any code changes.
> **Date**: 2026-08-12 | **Updated**: 2026-08-17 (post-prototype)
> **Prototype source files**: `apps/web/public/prototype.html`, `collection.html`, `component-page.html`

---

## ⚠️ CRITICAL SAFETY RULE

**NEVER touch anything inside `packages/core/src/components/`.**

These are the actual interactive components users install. The redesign applies ONLY to the website shell — the navigation, catalog, showcase chrome, and design tokens. Every component inside `packages/core/` keeps its own styles, fonts, and behavior. If a build step or import change could cascade into core components, stop and verify isolation first.

---

## 1. CODEBASE AUDIT (ponytail-audit)

### Over-engineering & Complexity Findings

| # | Tag | What to cut | Replacement | Path |
|---|-----|------------|-------------|------|
| 1 | `yagni:` | `cleanLabel()` duplicated 4 times (Sidebar, ComponentPreview, CommandPalette, ShowcaseChrome via showcase-utils) | Extract one shared `cleanLabel` in a util, import everywhere | `Sidebar.tsx:140`, `ComponentPreview.tsx:82`, `CommandPalette.tsx:39`, `ShowcaseChrome.tsx` via `showcase-utils.ts` |
| 2 | `yagni:` | `scrambleWordLeftToRight` + per-item scramble state duplicated in `SidebarItem` AND `ResourceLinkItem` — two copies of identical 50-line scramble logic inside same file | Extract one `useScramble(text)` hook, use in both | `Sidebar.tsx:358-521` |
| 3 | `yagni:` | `TypewriterShimmerPlaceholder` — 38-line animated typewriter for sidebar search placeholder. Sidebar itself is being deleted. | Delete entirely | `Sidebar.tsx:33-71` |
| 4 | `shrink:` | `ComponentPreview.tsx` — 488 lines, does image path resolution, code snippet generation, Lenis scroll, related carousel, prev/next navigation, story viewer. Monolith. | Entire file becomes unnecessary when catalog becomes card-only | `ComponentPreview.tsx` |
| 5 | `yagni:` | `HoverPreview.tsx` (2.1 KB) — never imported anywhere | Delete | `catalog/HoverPreview.tsx` |
| 6 | `yagni:` | `ComponentRow.tsx` (2.4 KB) — never imported anywhere | Delete | `catalog/ComponentRow.tsx` |
| 7 | `yagni:` | `StickyNav.tsx` (2.1 KB) — never imported anywhere | Delete | `catalog/StickyNav.tsx` |
| 8 | `yagni:` | `CategorySection.tsx` (1.8 KB) — never imported anywhere | Delete | `catalog/CategorySection.tsx` |
| 9 | `rewrite:` | `ShowcaseChrome.tsx` — 507 lines. Full drawer + search + category filter + recently viewed + chrome hide/show + keyboard shortcuts + bottom nav in one component | **NOW IN SCOPE** — complete rework to specimen rail + keycap system | `showcase/ShowcaseChrome.tsx` |
| 10 | `rewrite:` | `ShowcaseDrawer.tsx` — 16.6 KB (520 lines). 7 components, 6 of them copy-paste the same 20-line scramble logic with different labels | **NOW IN SCOPE** — complete rework to ruler drawer navigator | `showcase/ShowcaseDrawer.tsx` |
| 11 | `yagni:` | `component-registry.ts` barrel — 1 line re-export. Direct import of `./registry` is same cost | Delete barrel, update imports to `@/lib/registry` | `lib/component-registry.ts` |
| 12 | `native:` | `@barba/core` in `package.json` — never imported anywhere in web app | Remove dependency | `apps/web/package.json` |
| 13 | `native:` | `shadcn` in `package.json` — only `skiper-ui` folder exists, unclear if actually used. `@base-ui/react` also present. | Audit usage; likely remove one | `apps/web/package.json` |
| 14 | `yagni:` | `tw-animate-css` dependency — Tailwind 4 has native animation utilities | Verify usage; likely remove | `apps/web/package.json` |
| 15 | `delete:` | `static-image` component dir in core — name suggests placeholder or dead component | Verify usage, likely delete | `packages/core/src/components/static-image` |
| 16 | `yagni:` | Typo: `"gallary"` used as category ID across component-details, get-component, catalog-constants, ShowcaseChrome. Not a category misspelling — it's baked into routing and filtering logic now | Fix spelling to `"gallery"` during redesign — single migration point | Multiple files |
| 17 | `shrink:` | Image path resolution logic duplicated 3 times: `ComponentPreview.tsx:92-96`, `ComponentPreview.tsx:130-140`, `ShowcasePageClient.tsx:67-71` | Extract one `getImagePath(filename)` util | Multiple files |
| 18 | `shrink:` | `ShowcaseTriggers.tsx` — 282 lines, 5 components. `ScrambleControlsTrigger`, `ScrambleHideHudTrigger`, `ScrambleHeaderTrigger` all duplicate the same scramble interval pattern. `TactileSlidersIcon` and `TactileEyeIcon` are custom SVG icons for buttons being deleted. | Delete triggers being removed (HIDE HUD, CONTROLS text triggers). Keep/refactor only what remains after showcase strip-down. | `showcase/ShowcaseTriggers.tsx` |

**Net estimate**: ~-1800 lines, -2 deps after cleanup + showcase rewrite.

---

## 2. CURRENT STATE DIAGNOSIS

### What Exists

| Route | Purpose | Layout |
|-------|---------|--------|
| `/` | Homepage with 3D shatter sphere hero | Standalone, own nav |
| `/components` | Catalog page — sidebar + inline preview | Full-screen sidebar+preview layout, no global nav |
| `/components/[slug]` | Redirect to `/components?select=slug` | Redirect only |
| `/showcase/[slug]` | Fullscreen interactive component demo | ShowcaseChrome floating HUD |
| `/docs` | Documentation page | Own sidebar layout |
| `/changelog` | Changelog page | Standalone |

### What's Wrong (Per Your Brief)

1. **Catalog feels like a library, not a collection**: Sidebar+preview layout is a documentation pattern (shadcn/ui, Radix). Your components are experiential, visual artifacts — they need to be *seen*, not listed in a tree.

2. **Category-based grouping is wrong for the vibe**: "Scroll", "Gallery", "Transition", "Text", "Image" are technical categories. Users don't think "I need a scroll component" — they think "I want something that looks wild". Vibe-based groupings with catchy section headers fit better.

3. **No global navigation consistency**: Homepage has its own header. Catalog page has no header — just sidebar. Showcase has floating chrome. Docs has its own sidebar. Zero consistency.

4. **Sidebar is a dead-end**: 562 lines, category trees, typewriter search, scramble effects — all leading to an inline preview panel. Clicking a component doesn't open it; it renders a static image + code snippet in a side panel. The actual interactive showcase is buried behind an "OPEN SHOWCASE" link.

5. **Two search implementations**: Sidebar inline search + Command Palette (Cmd+K) doing the same thing with different UX.

6. **Showcase page is cluttered**: PREV/NEXT nav, HIDE HUD, CONTROLS, FULLSCREEN, ESC EXIT, CATALOG breadcrumb — six floating UI elements competing with the component for attention. The component should be the star.

7. **Showcase drawer is bloated**: Full-screen category-grid overlay with search, tabs, recently viewed, scramble effects on every item — 520 lines to do what should be a slim picker.

8. **No component info on showcase page**: Component name, description, dependencies, interaction hints — all absent. The only info is the category breadcrumb and the VesselControls panel.

9. **No design system**: Colors are ad-hoc (`#070708`, `#0A0A0A`, `neutral-400`, random `amber-400/30`). Typography is `font-mono`, `font-sans`, sometimes `font-['Ranade']`. No consistent interaction color.

---

## 3. DESIGN SYSTEM (from prototypes)

### 3.1 Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0d0d0f` | Page backgrounds |
| `--card-slab` | `#121215` | Cards, elevated surfaces |
| `--preview-bg` | `#070709` | Card preview area inner bg |
| `--dock-surface` | `#1a1a1c` | Icon button backgrounds inside dock |
| `--surface-elevated` | `#16161a` | Showcase elevated surfaces |
| `--border-subtle` | `#1f1f28` | Showcase borders |
| `--border-hairline` | `rgba(255, 255, 255, 0.06)` | Card borders, dividers |
| `--text-primary` | `#ffffff` (`#f4f4f5` on showcase) | Headings, active labels |
| `--text-muted` | `#71717a` | Secondary text, inactive icons |
| `--text-title-muted` | `#a1a1aa` | Card text, scrubber labels |
| `--card-text` | `#d4d4d8` | Card title default color |
| `--card-text-hover` | `#ffffff` | Card title on hover |
| `--accent` | `#9be5fb` | **Cobalt Ice** — hover states, active indicators, brand icon |
| `--font-display` | `'Ranade', sans-serif` | Wordmark, showcase title |
| `--font-body` | `'Switzer', sans-serif` | All body text, nav, buttons |
| `--font-mono` | `ui-monospace, SFMono-Regular, monospace` | Category labels, code, keyboard hints |
| `--ease-emil` | `cubic-bezier(0.23, 1, 0.32, 1)` | Card hover, scale transitions |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Nav, drawer, modal transitions |

**Hard rules**:
- Accent is `#9be5fb` cobalt ice everywhere — NOT lime green
- No `#000000` pure black — minimum `#0d0d0f`
- Accent for interaction states only (hover, active, focus) — never static decoration
- Colors quiet by default, accent pops on interaction

### 3.2 Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display / Headings | Ranade (Fontshare) | 500–700 | Wordmark, showcase component title, info ledger title |
| Section Headings | **Dela Gothic One** (Google Fonts) | 700/900 | Collection page section titles ONLY |
| Body / UI | Switzer (Fontshare) | 400–600 | Nav links, buttons, labels, descriptions, card titles |
| Code / Tags | System mono (`font-mono`) | 400–500 | Category labels, keyboard shortcuts, code snippets, counts |

**Font loading**: Both Fontshare and Google Fonts links go in `layout.tsx`:
```html
<link href="https://api.fontshare.com/v2/css?f[]=ranade@500,600,700&f[]=switzer@400,500,600&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&display=swap" rel="stylesheet">
```

### 3.3 Shared Dock Material

Both navbar and bottom pills share this exact material (extracted from prototype):

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

Every floating dock element (navbar, control pill, specimen rail, controls drawer) uses this identical material. Extract as a shared CSS class or Tailwind utility.

### 3.4 Diagonal Skew Shutter Hover Effect

All nav links and icon buttons use this hover animation (from prototype):

```css
.shutter-hover {
  position: relative;
  overflow: hidden;
  z-index: 1;
}
.shutter-hover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  border-radius: inherit;
  transform: translate3d(-105%, 105%, 0) skewX(-18deg);
  transition: transform 240ms var(--ease-out);
  z-index: -1;
  pointer-events: none;
}
.shutter-hover:hover::before {
  transform: translate3d(0, 0, 0) skewX(0deg);
}
.shutter-hover:hover {
  color: #000000;
  font-weight: 600;
}
```

Text and icons go dark on hover (black against cobalt ice bg). This is the signature interaction pattern.

---

## 4. COLLECTION PAGE (`/components`) — DETAILED BUILD SPEC

**Prototype source**: `collection.html`

### 4.1 Floating Dock Navbar (shared component)

**Position**: Fixed `top: 20px`, centered, `max-width: 680px`, `width: calc(100% - 32px)`, `z-index: 1000`.

**Structure** (React component — `DockNavbar.tsx`):
```
┌─────────────────────────────────────────────────────────┐
│ [★ ABYSS]          [Collection] [Docs]       [🔍] [⌘]  │
└─────────────────────────────────────────────────────────┘
```

**Left**: Brand icon (Y2K starburst SVG, colored `--accent`) + "ABYSS" text (Ranade 600, 13.5px, letter-spacing 0.08em). Links to `/`.

**Center**: Nav links — "Collection" links to `/components`, "Docs" links to `/docs`. Each link: Switzer 500, 13.5px, `--text-muted` default. Uses diagonal skew shutter hover (Section 3.4). Padding `6px 12px`, `border-radius: 8px`.

**Right**: Two icon buttons (34x34px, `border-radius: 10px`, bg `--dock-surface`):
- Search button: Lucide Search icon 15px. Opens Cmd+K modal. Has `inset 0 1px 0 rgba(255,255,255,0.06)` top highlight.
- GitHub link: Lucide GitHub icon 15px. Opens GitHub repo in new tab.
- Both use diagonal skew shutter hover, icon inverts to black on hover.

**Implementation notes**:
- This is a **shared layout component** used on `/components` and `/docs`. Homepage keeps its own nav.
- Use a `DockNavbar.tsx` in `src/components/shared/`.
- The dock material (Section 3.3) is the background.
- `height: 54px`, `padding: 0 20px`, `display: flex`, `align-items: center`, `justify-content: space-between`.

### 4.2 Page Layout

```css
body {
  background-color: var(--bg);
  padding: 170px 40px 100px 40px; /* 170px top for dock breathing room */
  -webkit-font-smoothing: antialiased;
}
/* Hide all scrollbars */
html, body { scrollbar-width: none; }
html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
```

Content container: `max-width: 1280px`, `margin: 0 auto`, `position: relative`, `z-index: 1`.

### 4.3 Section Headers

Each section is a `.vibe-section` with `margin-bottom: 64px`.

**Headline**: Centered, uses **Dela Gothic One** (not Ranade), `font-size: 38px`, `letter-spacing: 0.04em`, `text-transform: uppercase`.

Each section has a unique color for its heading:
- Section 1 "Light and Texture": `#ffffff` (white)
- Section 2 "Scroll Perspectives": `#3b82f6` (blue)
- Section 3 "Spatial Galleries": `#818cf8` (indigo)
- Section 4 "Type and Motion": `#f46b5b` (coral-red)

Count badge: `font-family: var(--font-mono)`, `font-size: 14px`, `font-weight: 500`, `letter-spacing: 0.06em`, `color: var(--text-muted)`, `vertical-align: super`, `margin-left: 8px`, `opacity: 0.55`. Format: `[13]`.

**Implementation**: Create a `SectionHeader.tsx` component that takes `title`, `count`, and `colorClass` props. CSS classes: `.headline-s1` (white), `.headline-s2` (blue), `.headline-s3` (indigo), `.headline-s4` (red).

### 4.4 Card Grid

**Grid mode** (default):
```css
.layout-grid .card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}
```

**Masonry mode** (toggled via control pill):
```css
.layout-masonry .card-grid {
  column-count: 3;
  column-gap: 16px;
  display: block;
}
.layout-masonry .skiper-card {
  break-inside: avoid;
  margin-bottom: 16px;
}
/* Varied aspect ratios for visual rhythm */
.layout-masonry .skiper-card:nth-child(5n+1) .card-preview { aspect-ratio: 1.1/1; }
.layout-masonry .skiper-card:nth-child(5n+2) .card-preview { aspect-ratio: 1.85/1; }
.layout-masonry .skiper-card:nth-child(5n+3) .card-preview { aspect-ratio: 1.35/1; }
.layout-masonry .skiper-card:nth-child(5n+4) .card-preview { aspect-ratio: 1.95/1; }
.layout-masonry .skiper-card:nth-child(5n)   .card-preview { aspect-ratio: 1.2/1; }
```

### 4.5 Component Cards

**Structure**:
```html
<a href="/showcase/{slug}" class="skiper-card">
  <div class="card-preview">
    <img src="/images/..." alt="Component Name">
  </div>
  <div class="card-footer">
    <span class="card-title">Component Name</span>
    <span class="card-arrow"><!-- Lucide ArrowUpRight 13px --></span>
  </div>
</a>
```

**Card container**:
- `padding: 10px`, `background: var(--card-slab)` (`#121215`)
- `border: 1px solid rgba(255,255,255,0.055)`, `border-radius: 14px`
- `box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px -2px rgba(0,0,0,0.75), 0 2px 6px rgba(0,0,0,0.6)`
- Transition: `transform 280ms var(--ease-emil), box-shadow 280ms var(--ease-emil), border-color 280ms var(--ease-emil)`

**Card hover**:
- `transform: translateY(-3px)`
- Shadow deepens: `0 14px 32px -4px rgba(0,0,0,0.85), 0 4px 10px rgba(0,0,0,0.7)`
- Image inside: `transform: scale(1.05)` with `380ms var(--ease-emil)`

**Card active (click)**:
- `transform: translateY(-1px) scale(0.99)`
- Shadow reduces

**Preview area**:
- `width: 100%`, `aspect-ratio: 1.6/1`, `border-radius: 10px`, `overflow: hidden`
- `background-color: var(--preview-bg)` (`#070709`)
- Image: `width: 100%`, `height: 100%`, `object-fit: cover`, `border-radius: 10px`

**Footer**:
- `display: flex`, `justify-content: space-between`, `padding: 10px 6px 4px 6px`
- Title: Switzer 500, 14.5px, color `--card-text` (`#d4d4d8`), turns `--card-text-hover` (`#fff`) on card hover
- Arrow: `opacity: 0` default, `transform: translate(-3px, 3px)`. On card hover: `opacity: 1`, `transform: translate(0, 0)`. Transition `220ms var(--ease-emil)`.

**No category tag pill on card** — old plan had one, prototype removed it. Keep it clean.

**Implementation**: Create `CollectionCard.tsx` taking `slug`, `title`, `imageSrc` props. Card links to `/showcase/{slug}` directly.

### 4.6 Bottom Control Pill (collection page only)

**Position**: Fixed `bottom: 24px`, centered (`left: 50%; transform: translateX(-50%)`), `z-index: 1000`.

**Structure**:
```
┌──────────────────────────────────────────────────┐
│ 🔍 [Explore___________] ✕ │ [⊞] [AZ] │
└──────────────────────────────────────────────────┘
```

Uses dock material (Section 3.3). `height: 54px`, `padding: 0 20px`, `gap: 14px`.

**Search input**: Switzer 500, 13.5px, `width: 150px` default expanding to `190px` on focus (transition `240ms var(--ease-emil)`). Placeholder: "Explore". Clear button (✕) hidden until input has text.

**Divider**: `width: 1px`, `height: 20px`, `background: rgba(255,255,255,0.08)`.

**Layout toggle button**: 32x32px, `border-radius: 8px`, cycles between Grid icon and Masonry icon. Active state: `color: var(--accent)`, `background: rgba(155,229,251,0.12)`.

**Sort toggle button**: 32x32px, 3-state cycle:
1. **Curated** (default): shows sections as designed, button inactive
2. **A→Z**: hides curated sections, shows single "All Components [34]" flat grid sorted alphabetically, button active with accent
3. **Z→A**: same flat grid reversed, button active with reversed arrow icon

**Implementation**: 
- `BottomControlPill.tsx` — contains search input, layout cycler, sort cycler
- Search filters cards by title match (case-insensitive `includes`)
- Layout toggle: adds/removes `layout-grid` / `layout-masonry` class on container
- Sort toggle: when not curated, clone all cards into a single flat grid container and sort by `.card-title` text
- Show "No specimens found" message when zero matches

### 4.7 Command Palette Modal (Cmd+K)

**Trigger**: Search icon in dock navbar OR `Cmd+K` / `Ctrl+K` keyboard shortcut.

**Overlay**: Fixed inset, `background: rgba(0,0,0,0.6)`, `backdrop-filter: blur(6px)`, `z-index: 2000`. Fade in `220ms`. Click outside to close.

**Modal**: `width: 680px`, dock material variant: `background: linear-gradient(180deg, #111113 0%, #08080a 100%)`. `border-radius: 14px`. `box-shadow: inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.6), 0 28px 72px rgba(0,0,0,0.9)`.

**Header**: Brand starburst icon (accent color) + search input (Switzer 500, 16.5px) + ESC keycap button. `padding: 20px 24px`. Subtle bg: `rgba(255,255,255,0.015)`.

**Results list**: `max-height: 380px`, `overflow-y: auto`, hidden scrollbar. Groups:
- **PAGES**: Overview & Manifesto (`/`), Collection Grid (`/collection`), Documentation Specs (`/docs`). Each with Lucide icon (FileText, LayoutGrid, BookOpen) + ArrowUpRight.
- **SHADERS & KINETIC PRIMITIVES**: Component items linking to `/showcase/{slug}`. Each with Lucide Component icon + ArrowRight.

**Keyboard nav**:
- ArrowUp/Down: move selection (highlighted with `background: rgba(255,255,255,0.06)`, name turns accent)
- Enter: navigate to selected item
- Escape: close modal
- Input: live-filter results by text match, hide empty category groups

**Footer**: "Go to page" text + Lucide CornerDownLeft icon. `padding: 14px 24px`.

**Implementation**: Refactor existing `CommandPalette.tsx` — keep the React logic, restyle to match prototype exactly. Wire to navbar search button.

---

## 5. SHOWCASE PAGE (`/showcase/[slug]`) — DETAILED BUILD SPEC

**Prototype source**: `component-page.html`

### 5.1 Page Layout

```css
body {
  background-color: #0d0d0f;
  overflow: hidden; /* Component fills viewport, no page scroll */
  position: relative;
}
```

The component itself renders inside a `#specimenBoard` container that fills the viewport. This is where `ShowcasePageClient.tsx` mounts the actual component — **do not change how components mount, only the chrome around them**.

### 5.2 Grain Overlay

Full-viewport SVG noise texture layered above background, below all UI:

```html
<svg class="bg-grain" xmlns="http://www.w3.org/2000/svg">
  <filter id="noiseFilter">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
</svg>
```

```css
.bg-grain {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  opacity: 0.14;
  mix-blend-mode: overlay;
}
```

**Implementation**: `GrainOverlay.tsx` — simple component, rendered once in showcase layout. `pointer-events: none` so it never blocks component interaction.

### 5.3 Top-Left Keycap Menu Button

**Position**: Fixed `top: 32px`, `left: 32px`, `z-index: 500`.

**Button**: 44x44px keycap with LayoutGrid icon (4 squares, 18px). Uses dock material with additional `border: 1px solid rgba(255,255,255,0.05)`, `border-radius: 12px`.

**Hover**: Entire button fills with accent `#9be5fb`, icon color inverts to `#0d0d0f` (dark). `box-shadow: 0 8px 24px rgba(0,0,0,0.6)`.

**Active state** (when ruler drawer is open): Same dock material, subtle border change to `rgba(255,255,255,0.08)`.

**Click**: Toggles `ruler-drawer-open` class on `<body>`.

**Implementation**: Part of `ShowcaseChrome.tsx` rewrite. Single button, toggles drawer state.

### 5.4 Left Ruler Drawer (Component Navigator)

**Position**: Fixed `top: 0`, `left: 24px`, `width: 290px`, `height: 100vh`, `z-index: 290`.

**Behavior**: Hidden by default (`transform: translateX(-340px)`, `visibility: hidden`). Slides in on `body.ruler-drawer-open` with `transform: translateX(0)`. Transition: `680ms cubic-bezier(0.16, 1, 0.3, 1)`.

**Background**: `transparent` — chameleon effect, blends with page bg. No solid panel bg, no border, no box-shadow. This is intentional from the prototype.

**Content**: Scrollable list with padding `180px` top, `120px` bottom. Fade mask:
```css
mask-image: linear-gradient(to bottom, transparent 0%, transparent 50px, black 130px, black calc(100% - 100px), transparent 100%);
```

**Row structure**: Each component is a `.row.interactive`:
```html
<div class="row interactive" data-comp="Component Name">
  <div class="line-wrapper">
    <div class="line"></div>
  </div>
  <span class="ruler-text">01 Component Name</span>
</div>
<!-- Spacer row between each item -->
<div class="row placeholder">
  <div class="line-wrapper"><div class="line"></div></div>
</div>
```

**Line**: `width: 28px`, `height: 1.5px`, `background: #27272a`. On hover/active: `transform: scaleX(1.5)`, `background: var(--accent)`.

**Text**: Switzer 15.5px, `color: #71717a`. On hover/active: `transform: translateX(16px)`, `color: var(--accent)`, `font-weight: 600`.

**Click behavior**: Sets `.active` on clicked row (removes from others). Updates component name in info ledger. Closes drawer (`body.ruler-drawer-open` removed).

**Scrollbar**: Hidden (`scrollbar-width: none`).

**Implementation**: `RulerDrawer.tsx` — receives component list from registry, renders numbered rows. Active component highlighted. Uses `data-comp` attribute matching. Renders placeholder rows between items for spacing.

### 5.5 Bottom Specimen Rail

**Position**: Fixed `bottom: 48px` (via `top: calc(100vh - 48px)`), centered (`left: 50vw; transform: translate(-50%, -50%)`), `z-index: 200`.

**Container**: Dock material. `height: 52px`, `border-radius: 14px`, `min-width: 190px`, `padding: 0 14px`. `gap: 6px` between buttons.

**Structure**:
```
┌──────────────────────────────────────┐
│  [ⓘ]  [</>]  [⛶]  │  [⚙]          │
└──────────────────────────────────────┘
```

4 keycap buttons with a separator between the first 3 and last:

| Button | Icon | Size | Purpose |
|--------|------|------|---------|
| Info `ⓘ` | Custom: vertical line 10-18 + filled circle at 5.5, stroke-width 2.5 | 19px | Toggles info ledger panel |
| Code `</>` | Lucide Code (chevrons) | 19px | Toggles code ledger panel |
| Fullscreen `⛶` | Lucide Maximize (corner arrows) | 19px | Opens fullscreen mode |
| Controls `⚙` | Lucide Sliders (3 vertical lines with handles) | 19px | Toggles controls drawer |

**Separator**: `width: 1px`, `height: 20px`, `background: var(--border-hairline)`, `margin: 0 4px`. Between Fullscreen and Controls.

**Keycap buttons inside rail**:
- `width: 36px`, `height: 36px`, `border-radius: 8px`
- `background: transparent`, `border: none`, `box-shadow: none`
- `color: #8e8e93`
- Hover: `background: rgba(255,255,255,0.06)`, `color: #9be5fb`
- Active: `background: rgba(155,229,251,0.14)`, `color: #9be5fb`

**Implementation**: `SpecimenRail.tsx` — receives toggle callbacks. Each button toggles its respective panel. Info and Code are mutually exclusive (opening one closes the other). Controls is independent.

### 5.6 Right Info Ledger Panel

**Position**: Fixed `top: 20px`, `bottom: 20px`, `right: 20px`, `width: 560px`, `max-width: calc(100vw - 40px)`, `height: calc(100vh - 40px)`, `z-index: 400`.

**Material**: Same dock material with larger shadow: `0 24px 60px rgba(0,0,0,0.75)`. `border-radius: 16px`.

**Hidden state**: `transform: translateX(calc(100% + 40px))`, `visibility: hidden`. Transition: `620ms cubic-bezier(0.16, 1, 0.3, 1)`.

**Open state**: `.open` class — `transform: translateX(0)`, `visibility: visible`.

**Close button**: Absolute `top: 20px`, `right: 20px`. 36x36px, `border-radius: 10px`, `background: rgba(255,255,255,0.04)`. Lucide X icon 15px. Hover: `background: rgba(255,255,255,0.1)`, `transform: scale(1.04)`.

**Scrollable body**: `padding: 48px 42px 140px 42px`, `gap: 60px` between sections. Hidden scrollbar.

**Sections** (each separated by 60px gap):

1. **OVERVIEW**: Section tag (mono 11px, `#52525b`, tracking 0.14em, uppercase) + Title (Ranade 600, 30px, letter-spacing -0.025em) + Description (Switzer 15.5px, line-height 1.8, `#9f9fa6`)

2. **TECH & DEPENDENCIES**: Inline pills, each: icon (15px, `#71717a`) + text (Switzer 500, 14px, `#a1a1aa`). No bg, no border — just icon+text pairs. `gap: 22px` between pills.

3. **APPLICATION & USE CASES**: Description paragraph same style as overview.

4. **PROPERTIES**: Vertical table rows, each: prop name (Switzer 600, 14.5px, `#f4f4f5`) + description (Switzer 400, 14px, `#8e8e93`). Rows separated by `border-bottom: 1px solid rgba(255,255,255,0.06)`. First row also gets top border.

5. **ENGINEERING NOTES**: Bullet points, mono-style, `#8e8e93`.

6. **HERITAGE & DISCLAIMER**: Small text (12px, `#71717a`).

7. **LICENSE & USAGE**: Small text (12px, `#71717a`).

**Implementation**: `SpecimenInfoLedger.tsx` — receives component metadata (from registry). All sections optional based on available data. Opens/closes via `.open` class toggle.

### 5.7 Right Code Ledger Panel

**Same container as Info Ledger** — separate `<aside>` element, same positioning, same material. Only one can be open at a time (Info and Code are mutually exclusive).

**Sections**:

1. **INSTALLATION**: Package manager tabs (npm/pnpm/yarn/bun). Each tab: `padding: 6px 14px`, `border-radius: 6px`, `font-size: 12.5px`. Active tab: `color: #f4f4f5`, `background: rgba(255,255,255,0.09)`. Code card below shows the install command, changes when tab clicked.

2. **BASIC USAGE**: Code card with copy button. Syntax-colored spans:
   - `.code-kw` (keywords): `#a1a1aa`, weight 500
   - `.code-comp` (component names): `#f4f4f5`, weight 600
   - `.code-tag` (JSX tags): `#e4e4e7`
   - `.code-prop` (props): `#a1a1aa`
   - `.code-val` (values): `#d4d4d8`
   - `.code-str` (strings): `#8e8e93`

3. **CONTROLLED STATE**: Another code example.

4. **CUSTOM DISTORTION & PHYSICS**: Another code example.

5. **EVENT HANDLERS & CALLBACKS**: Another code example.

**Code card**: `background: rgba(0,0,0,0.35)`, `border: 1px solid rgba(255,255,255,0.05)`, `border-radius: 10px`, `padding: 20px 22px`. Copy button absolute top-right (28x28px, Lucide Copy icon 14px).

**Code font**: `font-family: var(--font-mono)`, `font-size: 13.5px`, `line-height: 1.75`, `color: #d4d4d8`.

**Copy behavior**: On click, copy code to clipboard. Button color flashes to accent for 1200ms.

**Implementation**: `SpecimenCodeLedger.tsx` — receives code snippets and install command from component metadata. Package tab switching is local state. Code content can be stored in `component-details.ts` or separate markdown files.

### 5.8 Controls Drawer

**Position**: Fixed `bottom: 24px`, `left: calc(50% + 125px)` (offset right of center rail), `z-index: 290`.

**Container**: `width: 320px`, dock material with larger shadow variant. `border-radius: 16px`, `padding: 20px`. `gap: 16px` between children.

**Hidden state**: `opacity: 0`, `visibility: hidden`, `pointer-events: none`, `transform: translateY(8px)`. Transition: `220ms var(--ease-out)`.

**Open state**: `body.controls-drawer-open` — `opacity: 1`, `visibility: visible`, `pointer-events: auto`, `transform: translateY(0)`.

**Header**: "Parameters" (Switzer 600, 13px) + sliders icon + close button (×). `cursor: grab` (draggable header). Active: `cursor: grabbing`.

**Segmented switch**: `display: flex`, `padding: 3px`, `gap: 3px`, `border-radius: 10px`, `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.06)`. Tabs: Physics / Easing / Time. Active: `background: rgba(255,255,255,0.12)`, `color: #fff`.

**Scrubber rows**: Each row:
```html
<div class="scrubber-row">
  <div class="scrubber-fill" style="width: 42%"></div>
  <span class="scrubber-label">Curvature</span>
  <span class="scrubber-val">0.42</span>
  <input type="range" class="scrubber-input" min="0" max="1" step="0.01" value="0.42">
</div>
```
- Container: `height: 38px`, `border-radius: 10px`, `background: rgba(255,255,255,0.05)`, `border: 1px solid rgba(255,255,255,0.06)`
- Fill bar: absolute positioned, `background: rgba(255,255,255,0.08)`, width follows slider value
- Range input: `opacity: 0`, covers entire row, `cursor: ew-resize`
- Label: Switzer 500, 12px, `#a1a1aa`
- Value: mono 500, 12px, `#f4f4f5`

**Reset button**: `width: 100%`, `height: 36px`, `border-radius: 10px`, Switzer 500, 12px, `#a1a1aa`. Hover: `background: rgba(255,255,255,0.1)`, `color: #fff`.

**Implementation**: This replaces the existing `VesselControls.tsx`. New component `ControlsDrawer.tsx` — receives parameter definitions from component metadata, renders scrubber rows dynamically. Draggable via header (implement with pointer events on the header element). Each scrubber updates the component's props via existing control callback system.

---

## 6. COMPONENT DETAIL REGISTRY — NEW FIELDS

### Required additions to `ComponentDetail` type:

```ts
// Added to ComponentDetail in src/lib/registry/types.ts
interface ComponentDetail {
  // ... existing fields ...
  interactionHints?: string[];    // e.g. ["Scroll to explore", "Hover for parallax"]
  dependencies?: string[];        // e.g. ["React 18+", "Three.js / WebGL", "Custom GLSL"]
  description?: string;           // One-paragraph description for info ledger
  useCases?: string;              // Application & use cases text
  engineeringNotes?: string[];    // Bullet points for engineering notes
  properties?: Array<{
    name: string;                 // e.g. "curvature: number (0.1 - 1.0)"
    description: string;          // e.g. "GLSL radial arc distortion coefficient"
  }>;
  codeExamples?: Array<{
    title: string;                // e.g. "BASIC USAGE"
    code: string;                 // Raw code string
  }>;
  installCommand?: string;        // e.g. "@abyss-ui/core" — package name for install tabs
  videoFilename?: string;         // Optional video preview for future
}
```

### Vibe Sections (collection page grouping)

```ts
// src/lib/registry/vibe-sections.ts
export const VIBE_SECTIONS = [
  {
    id: "light-and-texture",
    title: "Light and Texture",
    headlineClass: "headline-s1",  // white
    count: 13,
    slugs: [
      "stone-bas-relief", "bronze-patina", "leonardo-sketch",
      "chromepunk-normal-map", "knight-wind-banner", "bas-relief-emboss",
      "molten-mercury", "water-ripple", "infrared-thermal",
      "gold-gilding", "depth-silhouette", "steel-intaglio",
      "procedural-atlas"
    ]
  },
  {
    id: "scroll-perspectives",
    title: "Scroll Perspectives",
    headlineClass: "headline-s2",  // blue
    count: 8,
    slugs: [
      "parallax-column", "erosion-map", "dual-wave", "phase-drift",
      "depth-swim", "cylinder-scroll", "parallax-bleed", "arc-drift-gallery"
    ]
  },
  {
    id: "spatial-galleries",
    title: "Spatial Galleries",
    headlineClass: "headline-s3",  // indigo
    count: 8,
    slugs: [
      "orbit-ring-gallery", "3d-shatter-sphere", "gravity-cursor",
      "focus-ring", "cursor-wake", "image-snake-trail",
      "abyss-cursor-fall", "tracklist-gallery"
    ]
  },
  {
    id: "type-and-motion",
    title: "Type and Motion",
    headlineClass: "headline-s4",  // red
    count: 5,
    slugs: [
      "accordion-wall", "curved-scroll-wipe", "clip-morph",
      "ripple-scramble", "3d-reel-text"
    ]
  }
];
```

---

## 7. FILE CHANGES SUMMARY

### DELETE (catalog cleanup)
```
src/components/catalog/Sidebar.tsx              — 562 lines, entire sidebar
src/components/catalog/ComponentPreview.tsx      — 488 lines, inline preview
src/components/catalog/HoverPreview.tsx          — unused
src/components/catalog/ComponentRow.tsx          — unused
src/components/catalog/StickyNav.tsx             — unused
src/components/catalog/CategorySection.tsx       — unused
src/components/catalog/StaticPreview.tsx         — only used by ComponentPreview
src/components/catalog/StoryViewer.tsx           — only used by ComponentPreview
src/components/catalog/AnimatedCopyButton.tsx    — only used by ComponentPreview
src/components/catalog/ComponentNavigation.tsx   — only used by ComponentPreview
src/components/catalog/catalog-constants.ts      — CATEGORY_ICONS, no longer needed
src/app/components/[slug]/page.tsx               — redirect, no longer needed
src/lib/component-registry.ts                   — 1-line barrel, import registry directly
```

### DELETE (showcase cleanup)
```
src/components/showcase/ShowcaseDrawer.tsx       — 520 lines, entire drawer (replaced by ruler drawer)
src/components/showcase/ShowcaseTriggers.tsx     — 282 lines, all custom scramble triggers (replaced by keycap buttons)
src/components/showcase/RollUpCounter.tsx        — only used in old drawer
```

### KEEP & REFACTOR
```
src/components/catalog/CommandPalette.tsx        — KEEP, restyle to match prototype modal design
src/components/showcase/ShowcaseChrome.tsx       — REWRITE: strip to keycap menu + ruler drawer + specimen rail
src/components/showcase/showcase-utils.ts        — KEEP: cleanLabel still used
```

### NEW FILES
```
src/components/shared/DockNavbar.tsx             — Floating dock pill navbar (Section 4.1)
src/components/shared/GrainOverlay.tsx           — SVG noise texture overlay (Section 5.2)
src/components/shared/design-tokens.css          — CSS custom properties (Section 3.1)
src/components/shared/dock-material.css          — Shared dock material + shutter hover (Section 3.3, 3.4)
src/components/collection/CollectionCard.tsx     — Single component card (Section 4.5)
src/components/collection/SectionHeader.tsx      — Vibe section header (Section 4.3)
src/components/collection/BottomControlPill.tsx  — Search + layout + sort dock (Section 4.6)
src/components/showcase/RulerDrawer.tsx          — Left-side component navigator list (Section 5.4)
src/components/showcase/SpecimenRail.tsx         — Bottom keycap button bar (Section 5.5)
src/components/showcase/SpecimenInfoLedger.tsx   — Right-side info panel (Section 5.6)
src/components/showcase/SpecimenCodeLedger.tsx   — Right-side code panel (Section 5.7)
src/components/showcase/ControlsDrawer.tsx       — Floating draggable parameter panel (Section 5.8)
src/app/components/page.tsx                      — REWRITE: Full-page card collection
src/lib/registry/vibe-sections.ts               — Vibe section mapping data (Section 6)
```

### MODIFY
```
src/app/layout.tsx                               — Add Fontshare + Google Fonts links, conditional DockNavbar, CSS variables
src/app/globals.css or index.css                 — Add design system CSS custom properties
src/lib/registry/component-details.ts            — Add new metadata fields per component
src/lib/registry/types.ts                        — Add new TypeScript fields
src/app/showcase/[slug]/ShowcasePageClient.tsx   — Wire new ShowcaseChrome, grain overlay, ledger panels, controls drawer
```

### UNTOUCHED (never modify these)
```
src/app/page.tsx                                 — Homepage stays as-is
src/components/showcase/ScrollShowcaseLayout.tsx  — Showcase layouts stay
src/components/showcase/ShaderShowcaseLayout.tsx  — Showcase layouts stay
src/components/showcase/GalleryShowcaseLayout.tsx — Showcase layouts stay
src/components/showcase/TransitionShowcaseLayout.tsx — Showcase layouts stay
src/components/showcase/ComponentErrorBoundary.tsx — Error boundary stays
src/components/docs/*                            — Docs untouched
packages/core/src/components/*                   — ALL COMPONENTS UNTOUCHED — CRITICAL
```

---

## 8. VIDEO PREVIEW STRATEGY

Cards designed to support video previews when ready:
1. Show static image by default
2. On hover, play short looping video (`.webm` or `.mp4`) if one exists
3. Fall back to image + CSS scale effect if no video
4. Videos stored in `public/videos/components/[slug].webm`
5. `ComponentDetail` gets optional `videoFilename?: string` field

For now: image-only cards with hover scale. Video support is a data-layer toggle, not a redesign.

---

## 9. "GALLARY" TYPO MIGRATION

The typo `"gallary"` is baked into:
- `component-details.ts` (6 components use it)
- `get-component.ts` type map
- `ShowcaseChrome.tsx` CATEGORY_ORDER
- `ShowcasePageClient.tsx` layout routing

**Plan**: Fix to `"gallery"` across all files in the redesign pass. Single find-and-replace. Do this BEFORE building new components so references are clean.

---

## 10. DEPENDENCY CLEANUP

| Dependency | Action | Reason |
|-----------|--------|--------|
| `@barba/core` | Remove | Never imported |
| `tw-animate-css` | Audit, likely remove | Tailwind 4 native animations |
| `shadcn` | Audit `skiper-ui` dir | Clarify if actually used |

**New dependency**: Google Fonts `Dela Gothic One` (loaded via CDN link, not npm package).

---

## 11. EXECUTION ORDER

1. **Phase A — Design System**: Define CSS custom properties in globals.css with new `#9be5fb` accent + all tokens. Move Fontshare link to layout.tsx. Add Google Fonts Dela Gothic One link. Create `dock-material.css` with shared styles.

2. **Phase B — Cleanup dead catalog files**: Delete unused catalog components, barrel export, redirect route. ~13 files. Run build after to verify nothing breaks.

3. **Phase C — Fix typo**: `gallary` → `gallery` across codebase. Run build after.

4. **Phase D — Shared DockNavbar**: Create `DockNavbar.tsx` with dock material, skew shutter hovers, brand icon. Integrate into layout.tsx for `/components` and `/docs` routes.

5. **Phase E — GrainOverlay**: Create `GrainOverlay.tsx` SVG component. Add to showcase layout.

6. **Phase F — Vibe sections data**: Create `vibe-sections.ts` with the 4 section definitions and slug arrays.

7. **Phase G — Collection page**: Build `CollectionCard.tsx`, `SectionHeader.tsx`, `BottomControlPill.tsx`. Rewrite `/components/page.tsx` with section grid, masonry toggle, sort, search.

8. **Phase H — Command Palette refactor**: Restyle `CommandPalette.tsx` to match prototype modal. Wire to navbar search button.

9. **Phase I — Showcase Chrome rewrite**: Strip `ShowcaseChrome.tsx` to keycap menu button + ruler drawer trigger. Delete `ShowcaseDrawer.tsx`, `ShowcaseTriggers.tsx`, `RollUpCounter.tsx`.

10. **Phase J — RulerDrawer**: Build `RulerDrawer.tsx` left-side component navigator with numbered list and line animations.

11. **Phase K — SpecimenRail**: Build `SpecimenRail.tsx` bottom keycap bar with 4 buttons.

12. **Phase L — SpecimenInfoLedger**: Build right-side info panel with all 7 sections.

13. **Phase M — SpecimenCodeLedger**: Build right-side code panel with install tabs and code examples.

14. **Phase N — ControlsDrawer**: Build floating parameter panel replacing VesselControls. Make it draggable.

15. **Phase O — Dependency cleanup**: Remove `@barba/core`, audit others.

16. **Phase P — Registry data**: Add new metadata fields to `component-details.ts` for all components (descriptions, dependencies, properties, code examples).

**After each phase**: Run `npm run build` to verify zero breakage. If any build error touches `packages/core/`, STOP and investigate.

---

## 12. OPEN QUESTIONS FOR YOU

1. **Back navigation on showcase** — Prototype has no visible back button. Grid keycap opens drawer. How does user get back to collection? ESC key only? Or should grid button navigate to collection when drawer is closed?

2. **Component name visibility** — Prototype shows no title anywhere on showcase until info ledger opens. Old plan showed it in top bar. Intentional?

3. **Ruler drawer search** — 75 components in flat list, no search. Add search input at top of drawer?

4. **Fullscreen** — Fullscreen button exists in rail. Open new tab to `/showcase/[slug]/fullscreen`? Or use browser `requestFullscreen()` API?

5. **Code ledger data source** — Where do code snippets per component live? In `component-details.ts`? Separate `.mdx` files?

6. **Keyboard shortcuts** — Keep `ESC` back, `C` controls, `I` info, `F` fullscreen? Prototype didn't specify.

7. **Changelog nav link** — Prototype only shows "Collection" and "Docs" in nav. Drop Changelog?

---

## 13. WHAT I WILL NOT DO

- I will not touch the homepage (`/`) — it already uses its own nav and design.
- I will not touch the docs or changelog pages (separate scope).
- I will not modify any component in `packages/core/src/components/` — design system applies to website shell only.
- I will not build video recording/capture tooling.
- I will not add new npm dependencies unless absolutely necessary (Google Fonts via CDN only).



3d reel text
clip morph
erosion

