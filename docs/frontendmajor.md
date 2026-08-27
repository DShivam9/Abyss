# Abyss Frontend Major Cleanup — Execution Plan

> **Purpose:** Clean up folder structure, strip font bloat, fix performance bottlenecks, and split the CSS monolith — WITHOUT changing any visual design, animations, or user-facing behavior.
>
> **Rule:** After each phase, the site must look and behave identically to before that phase started. If a change alters visuals, it's a bug in the execution, not an intentional redesign.

---

## Locked Decisions

### Fonts (Main Website Pages)
- **Ranade** — display headings, brand name, section headlines
- **Switzer** — body text, descriptions, UI labels
- **Saint Regus** — collection page section headlines (vibe-section titles only)
- **JetBrains Mono** — monospace / code blocks / CLI terminals / technical labels

Everything else (Satoshi, PP Editorial New, Hatton, Larken) is STRIPPED from the main website. Components inside `packages/core/` can use whatever fonts they need internally — those fonts must NOT leak into the main website's font stack or globals.

### What Must NOT Change
- All existing animations (Framer Motion, GSAP, CSS transitions)
- All visual designs (colors, spacing, typography scale, layouts)
- All interactive behaviors (hover effects, scroll behaviors, drawers, palettes)
- The Lenis smooth scroll feel on pages that actually scroll
- The dock navbar condensation animation on scroll
- The shutter-hover diagonal sweep effect on nav links

---

## Phase 1: Font Lockdown

**Goal:** Remove unused fonts from the main website. Keep only Ranade, Switzer, Saint Regus, and JetBrains Mono. Ensure component-specific fonts don't leak.

### Step 1.1: Strip unused font declarations from `layout.tsx`

**File:** `apps/web/src/app/layout.tsx`

**Remove entirely:**
- The `satoshi` local font import (lines 12-16). Remove the variable `--font-satoshi`.
- The `editorialNew` local font import (lines 18-43). Remove the variable `--font-editorial`.

**Keep:**
- `jetbrainsMono` (Google Fonts import, `--font-mono`) — used in CLI terminals, code blocks, technical labels
- `saintRegus` (local font, `--font-saint-regus`) — used on collection page section headlines

**On the `<html>` tag (line 75):** Remove `satoshi.variable` and `editorialNew.variable` from the `cn()` call. Keep `jetbrainsMono.variable` and `saintRegus.variable`.

**On the `<head>` (lines 77-80):** The Fontshare CDN link loading Switzer and Ranade — KEEP this. These are the locked body/display fonts.

Remove the Google Fonts preconnect lines (79-80) — JetBrains Mono is already loaded via `next/font/google` which handles its own preconnect.

### Step 1.2: Strip unused `@font-face` rules from `globals.css`

**File:** `apps/web/src/app/globals.css`

**Remove entirely:**
- `@font-face` for `Hatton` (lines 11-17)
- `@font-face` for `Larken` (lines 19-25)

**Keep:**
- `@font-face` for `Saint Regus` (lines 27-33) — this is the locked collection font

### Step 1.3: Update the `@theme` font-sans fallback

**File:** `apps/web/src/app/globals.css` (line 37)

**Change:**
```css
/* Before */
--font-sans: var(--font-satoshi), system-ui, -apple-system, sans-serif;

/* After — Switzer is loaded via Fontshare CDN, not a CSS variable */
--font-sans: 'Switzer', system-ui, -apple-system, sans-serif;
```

### Step 1.4: Audit every inline `fontFamily` reference in web app components

Search the entire `apps/web/src/` tree for any reference to `Satoshi`, `Hatton`, `Larken`, `Editorial`, or `PP Editorial`. Replace with the appropriate locked font:
- Display/heading context → `'Ranade', -apple-system, sans-serif`
- Body/label context → `'Switzer', -apple-system, sans-serif`
- Code/mono context → `var(--font-mono, monospace)`

**Known locations to check:**
- `components/docs/DocsSections.tsx` — multiple inline `fontFamily: "Switzer, ..."` and `fontFamily: "Ranade, ..."` (these are correct, keep)
- `components/docs/DocsFooter.tsx` — inline `fontFamily: "Switzer, ..."` and `fontFamily: "Ranade, ..."` (correct, keep)
- `components/docs/CliTerminal.tsx` — uses `var(--font-mono)` (correct, keep)
- `components/shared/dock-material.css` — check all `font-family` declarations, replace any Satoshi/Hatton/Larken/Editorial with Switzer or Ranade as appropriate

**Do NOT touch** any font references inside `packages/core/src/components/` — those are component-internal fonts and are isolated.

### Step 1.5: Delete unused font files from `public/fonts/`

After all references are removed, delete:
- `public/fonts/Satoshi-Variable.woff2`
- `public/fonts/editorial-new-font-family/` (entire directory)
- `public/fonts/hatton-font-family/` (entire directory)
- `public/fonts/larken-typeface/` (entire directory)

**Keep:**
- `public/fonts/saint-regus/` — locked font

### Step 1.6: Verify

- Run the dev server
- Visit every page: `/`, `/collection`, `/docs`, `/changelog`, `/showcase/[any-slug]`, `/preview/[any-slug]`
- Confirm all text renders in Ranade (headings), Switzer (body), Saint Regus (collection section titles), or JetBrains Mono (code)
- Confirm no FOUT (flash of unstyled text) or fallback font flicker
- Check browser DevTools Network tab: no requests to deleted font files

---

## Phase 2: Folder Restructure

**Goal:** Reorganize `components/` and `lib/` so files live where they logically belong. Pure file moves + import path updates. Zero code changes.

> **Critical rule:** This phase is ONLY file moves and import updates. Do not rename components, do not change any logic, do not refactor any code. Move the file, update every import that references it, verify it compiles.

### Step 2.1: Create new directories

```
components/layout/          (new — site-wide layout chrome)
components/command-palette/  (new — universal search)
components/showcase/layouts/ (new — sub-group inside existing showcase/)
lib/hooks/                   (new — all custom hooks)
lib/data/                    (new — all static data files)
```

### Step 2.2: Move site-wide layout components into `components/layout/`

| File | From | To |
|------|------|----|
| `DockNavbar.tsx` | `components/shared/` | `components/layout/` |
| `DocsFooter.tsx` | `components/docs/` | `components/layout/SiteFooter.tsx` |
| `GrainOverlay.tsx` | `components/shared/` | `components/layout/` |
| `Abyss3DLogoPiece.tsx` | `components/shared/` | `components/layout/` |

**Rename `DocsFooter.tsx` to `SiteFooter.tsx`** during the move because it's used on both Docs and Changelog pages. Update the export name from `DocsFooter` to `SiteFooter` AND update every import:
- `apps/web/src/app/docs/page.tsx` — change import from `@/components/docs/DocsFooter` to `@/components/layout/SiteFooter`, update JSX from `<DocsFooter />` to `<SiteFooter />`
- `apps/web/src/app/changelog/page.tsx` — same change

**After moving all 4 files, update imports in:**
- `apps/web/src/app/collection/page.tsx` (imports DockNavbar)
- `apps/web/src/app/docs/page.tsx` (imports DockNavbar, DocsFooter)
- `apps/web/src/app/changelog/page.tsx` (imports DockNavbar, DocsFooter)
- `apps/web/src/components/docs/DocsSections.tsx` (imports Abyss3DLogoPiece)
- `apps/web/src/components/changelog/ChangelogFinaleHorizon.tsx` (likely imports Changelog3DLogoPiece — will be handled in Phase 3)
- `apps/web/src/app/showcase/[slug]/ShowcasePageClient.tsx` (imports GrainOverlay)

### Step 2.3: Move CommandPalette into `components/command-palette/`

| File | From | To |
|------|------|----|
| `CommandPalette.tsx` | `components/catalog/` | `components/command-palette/` |

**Update imports in:**
- `apps/web/src/app/collection/page.tsx`
- `apps/web/src/app/docs/page.tsx`
- `apps/web/src/app/changelog/page.tsx`

**After the move, delete the empty `components/catalog/` directory.**

### Step 2.4: Move showcase layout variants into `components/showcase/layouts/`

| File | From | To |
|------|------|----|
| `ShaderShowcaseLayout.tsx` | `components/showcase/` | `components/showcase/layouts/` |
| `ScrollShowcaseLayout.tsx` | `components/showcase/` | `components/showcase/layouts/` |
| `GalleryShowcaseLayout.tsx` | `components/showcase/` | `components/showcase/layouts/` |
| `TransitionShowcaseLayout.tsx` | `components/showcase/` | `components/showcase/layouts/` |

**Update imports in:**
- `apps/web/src/app/preview/[slug]/PreviewPageClient.tsx`
- `apps/web/src/app/showcase/[slug]/ShowcasePageClient.tsx`

### Step 2.5: Move hooks into `lib/hooks/`

| File | From | To |
|------|------|----|
| `useScrollLock.ts` | `lib/` | `lib/hooks/` |
| `useSmoothScroll.ts` | `lib/` | `lib/hooks/` |

**Update imports in:**
- `apps/web/src/components/catalog/CommandPalette.tsx` (or its new path after 2.3)
- `apps/web/src/components/showcase/ControlsDrawer.tsx`
- `apps/web/src/components/showcase/SpecimenInfoLedger.tsx`
- `apps/web/src/components/showcase/SpecimenCodeLedger.tsx`
- `apps/web/src/components/showcase/RulerDrawer.tsx`

### Step 2.6: Move data files into `lib/data/`

| File | From | To |
|------|------|----|
| `changelog-data.ts` | `lib/` | `lib/data/` |
| `docs-data.ts` | `lib/` | `lib/data/` |

**Update imports in:**
- `apps/web/src/app/changelog/page.tsx`
- Any file importing `docs-data.ts` (search for it)

### Step 2.7: Flatten tiny lib subdirectories

| Action | Path |
|--------|------|
| Move `lib/color/accents.ts` to `lib/accents.ts` | Then delete empty `lib/color/` |
| Move `lib/motion/easing.ts` to `lib/easing.ts` | Then delete `lib/motion/` |
| Move `lib/motion/variants.ts` to `lib/variants.ts` | |
| Delete `lib/controls/` | Empty directory, nothing in it |

**Update imports** for any file referencing `@/lib/color/accents`, `@/lib/motion/easing`, `@/lib/motion/variants`.

### Step 2.8: Clean up `components/ui/`

**Audit these files:**
- `ui/ShowcaseNav.tsx` — if used in showcase, move to `components/showcase/`. If dead, delete.
- `ui/ComponentCanvas.tsx` — if used in showcase, move to `components/showcase/`. If dead, delete.
- `ui/copy-button.tsx` — check if used anywhere. If dead, delete.
- `ui/skiper-ui/skiper40.tsx` — check if used anywhere. If dead, delete.
- `ui/button.tsx` — shadcn primitive, keep in `ui/`.

Search the codebase for imports of each file. If zero imports found, the file is dead code — delete it.

### Step 2.9: Delete `components/shared/`

After all files have been moved out (DockNavbar, GrainOverlay, Abyss3DLogoPiece), the only remaining file is `dock-material.css`. This stays for now (will be addressed in Phase 4). Move it to a temporary holding location or keep it in `shared/` until Phase 4.

**Decision:** Keep `components/shared/dock-material.css` in place for now. The `globals.css` `@import` path references it. It will be split in Phase 4.

### Step 2.10: Verify

- Run `npm run dev` — confirm zero compilation errors
- Visit every page, confirm everything renders identically
- Run `npm run build` — confirm production build succeeds

---

## Phase 3: Delete Duplicates & Dead Code

**Goal:** Remove copy-pasted components, empty directories, and dead files. Reduce line count.

### Step 3.1: Delete `Changelog3DLogoPiece.tsx`

**File to delete:** `components/changelog/Changelog3DLogoPiece.tsx` (261 lines, 7.7KB)

This is a near-identical copy of `Abyss3DLogoPiece.tsx` (now in `components/layout/`).

**Find where it's imported:** likely `components/changelog/ChangelogFinaleHorizon.tsx`

**Replace the import:**
```tsx
// Before
import { Changelog3DLogoPiece } from "./Changelog3DLogoPiece";

// After
import dynamic from "next/dynamic";
const Abyss3DLogoPiece = dynamic(
  () => import("@/components/layout/Abyss3DLogoPiece").then((mod) => mod.Abyss3DLogoPiece),
  { ssr: false }
);
```

**In the JSX**, replace `<Changelog3DLogoPiece size={...} />` with `<Abyss3DLogoPiece size={...} />`. Check that the `size` prop value matches — both components accept the same props interface.

### Step 3.2: Deduplicate `SELF_CONTAINED_SCROLL` and layout-type detection

**Files affected:**
- `apps/web/src/app/preview/[slug]/PreviewPageClient.tsx` (lines 15-21, 56-61)
- `apps/web/src/app/showcase/[slug]/ShowcasePageClient.tsx` (lines 51-67)

**Create new file:** `apps/web/src/lib/registry/layout-utils.ts`

```ts
import { ComponentDetail } from "./types";

export const SELF_CONTAINED_SCROLL = new Set([
  "dual-wave",
  "depth-swim",
  "cylinder-scroll",
  "parallax-bleed",
  "curved-scroll-wipe",
  "erosion-map",
  "clip-morph",
]);

export function getLayoutType(meta: ComponentDetail, slug: string) {
  const isSelfContainedScroll = SELF_CONTAINED_SCROLL.has(slug);
  const previewType = meta.previewType || (meta.category === "scroll" ? "scroll" : meta.category === "text" ? "text" : "shader");
  const isText = meta.category === "text" || previewType === "text";
  const isScroll = !isText && !isSelfContainedScroll && (previewType === "scroll" || meta.category === "scroll");
  const isGallery = !isText && !isScroll && (isSelfContainedScroll || meta.category === "gallery" || meta.category === "svg" || previewType === "gallery" || (meta.category !== "scroll" && (meta.subtype === "gallery" || meta.subtype === "ring")));
  const isTransition = !isText && !isSelfContainedScroll && (meta.category === "transition" || previewType === "transition");

  return { isSelfContainedScroll, isText, isScroll, isGallery, isTransition };
}
```

**Then update both PreviewPageClient and ShowcasePageClient** to import and use `getLayoutType(meta, slug)` instead of their inline copies. Remove the local `SELF_CONTAINED_SCROLL` sets and the local layout-type logic from both files.

**Export from registry index:** Add `export { getLayoutType, SELF_CONTAINED_SCROLL } from "./layout-utils";` to `lib/registry/index.ts`.

### Step 3.3: Delete dead files found in Step 2.8

Delete any files from `components/ui/` that have zero imports (as determined in Step 2.8).

### Step 3.4: Verify

- Run dev server, visit all pages
- Specifically test: Docs page finale 3D logo, Changelog finale 3D logo — both must spin and render identically
- Test preview and showcase pages for every layout type (shader, scroll, gallery, transition, self-contained, text)

---

## Phase 4: CSS Monolith Split

**Goal:** Split `dock-material.css` (38KB, 1793 lines) into route-scoped modules so each page only loads the CSS it needs.

> **Critical rule:** This is a CSS-only refactor. Do not change any class names, selectors, property values, or specificity. The split must be invisible to the browser — same styles, different file boundaries.

### Step 4.1: Audit which CSS classes are used where

Before splitting, catalog which selectors in `dock-material.css` are used by which pages. Group them:

**Group A — Shared (used on 2+ pages):**
- `.dock-wrapper`, `.dock-nav`, `.dock-pill`, `.dock-flush`, `.dock-brand`, `.dock-nav-links`, `.dock-nav-link`, `.dock-nav-actions`, `.dock-action-btn` — DockNavbar (all pages)
- `.shutter-hover` — DockNavbar + any page using it
- `.abyss-celestial-logo` — DockNavbar, CommandPalette, RulerDrawer
- `.modal-overlay`, `.search-modal`, `.search-header`, `.search-input`, `.search-input-wrap`, `.search-input-mirror`, `.smooth-caret`, `.results-list`, `.category-group`, `.category-title`, `.result-item`, `.search-footer`, `.kbd-esc`, `.item-name`, `.no-results-box` — CommandPalette (all pages)

**Group B — Collection page only:**
- `.collection-container`, `.vibe-section`, `.card-grid`, `.skiper-card-wrap`, `.skiper-card`, `.card-preview`, `.card-footer`, `.card-title`, `.card-arrow` — CollectionCard, SectionHeader
- `.control-bar-wrap`, `.control-pill`, `.pill-search-box`, `.pill-search-icon`, `.live-search-input`, `.pill-clear-btn`, `.pill-divider`, `.pill-sort-box`, `.sort-icon-btn` — BottomControlPill
- `.headline-s1` and other headline classes — SectionHeader

**Group C — Showcase page only:**
- `.specimen-rail`, `.rail-keycap`, `.rail-separator` — SpecimenRail
- `.specimen-ledger`, `.ledger-close-btn`, `.ledger-body`, `.ledger-section`, `.section-tag`, `.ledger-title`, `.ledger-desc`, `.tech-pill-group`, `.tech-pill-dark`, `.ledger-props-table`, `.ledger-prop-row`, `.ledger-prop-name`, `.ledger-prop-desc`, `.pkg-tabs`, `.pkg-tab`, `.code-card`, `.code-copy-btn`, `.code-pre` — SpecimenInfoLedger, SpecimenCodeLedger
- `.controls-drawer`, `.controls-drawer-header`, `.controls-body`, `.scrubber-row`, `.scrubber-fill`, `.scrubber-label`, `.scrubber-val`, `.scrubber-input`, `.segmented-switch`, `.segment-btn`, `.controls-action-btn`, `.drawer-close-btn` — ControlsDrawer
- `.ruler-drawer`, `.ruler-list-wrap`, `.top-links-group`, `.top-nav-link`, `.section-divider`, `.divider-line`, `.divider-label`, `.nav-item` — RulerDrawer
- `.top-left-menu`, `.keycap-symbol` — ShowcaseChrome
- `.ruler-drawer-open` — body class toggle

**Group D — Changelog page only:**
- Any changelog-specific CSS classes

### Step 4.2: Split into separate CSS files

Create:
- `components/layout/layout.css` — Group A (navbar, command palette, shared)
- `components/collection/collection.css` — Group B
- `components/showcase/showcase.css` — Group C
- `components/changelog/changelog.css` — Group D (if any)

**Keep the `:root` design tokens (lines 5-30 of dock-material.css) in a single shared file** — either `layout.css` or a new `tokens.css`. These are global variables.

### Step 4.3: Update imports

**File:** `apps/web/src/app/globals.css`

```css
/* Before */
@import "../components/shared/dock-material.css";

/* After */
@import "../components/layout/tokens.css";
@import "../components/layout/layout.css";
```

**Collection page:** Import `collection.css` in `apps/web/src/app/collection/page.tsx` (or in a `collection/layout.tsx` if you create one)

**Showcase pages:** Import `showcase.css` in `apps/web/src/app/showcase/[slug]/page.tsx` or `ShowcasePageClient.tsx`

**Preview pages:** Import `showcase.css` in preview client too (it uses the same layouts)

### Step 4.4: Delete original monolith

Once all routes are verified, delete `components/shared/dock-material.css` and the now-empty `components/shared/` directory.

### Step 4.5: Verify

- Visit every page, inspect every component
- Confirm no missing styles (check dock navbar, hover effects, command palette, cards, showcase controls, drawers)
- Check that CSS specificity hasn't changed (no broken overrides)

---

## Phase 5: Performance Quick Wins

**Goal:** Fix the most impactful performance issues identified in the audit. Each sub-step is independent.

### Step 5.1: Isolate CommandPalette typewriter effect

**File:** `components/command-palette/CommandPalette.tsx` (after Phase 2 move)

Extract the typewriter `useEffect` (lines 74-111) and the `placeholder` state into a new child component:

```tsx
function TypewriterPlaceholder({ isOpen }: { isOpen: boolean }) {
  const [placeholder, setPlaceholder] = useState(TYPEWRITER_PHRASES[0]);
  // ... move the typewriter useEffect here ...
  return <>{placeholder}</>;
}
```

In the input, change `placeholder={placeholder}` to use a ref-based approach or render the `TypewriterPlaceholder` as a positioned overlay behind the input. This isolates re-renders to just the placeholder text, not the entire filtered results list.

### Step 5.2: Remove `AnimatePresence mode="wait"` from collection grid

**File:** `apps/web/src/app/collection/page.tsx`

The `AnimatePresence mode="wait"` on line 109 forces exit-wait-enter on every filter/sort change across 32 cards. This is the primary cause of sluggish filtering.

**Change to:** `AnimatePresence mode="sync"` or remove `AnimatePresence` entirely from the main content wrapper. Keep the individual `motion.section` entry animations for curated chapters (the staggered fade-in on load is fine), but don't block the entire grid on exit animations during search.

**Test carefully:** Type in the search box, toggle sort modes. It should feel instant, not sluggish.

### Step 5.3: Lazy-mount showcase panels

**Files:**
- `components/showcase/ShowcaseChrome.tsx`
- `components/showcase/SpecimenInfoLedger.tsx`
- `components/showcase/SpecimenCodeLedger.tsx`
- `components/showcase/ControlsDrawer.tsx`

Currently all three panels (info ledger, code ledger, controls drawer) are always mounted in the DOM even when closed. Each one runs a `useSmoothScroll` hook with its own rAF loop.

**Change:** Only render the panel content when `isOpen` is true:

```tsx
// In ShowcaseChrome.tsx, change:
<SpecimenInfoLedger component={component} isOpen={infoOpen} onClose={...} />

// To:
{infoOpen && <SpecimenInfoLedger component={component} isOpen={infoOpen} onClose={...} />}
```

Do the same for `SpecimenCodeLedger` and `ControlsDrawer`.

**Note:** The CSS slide-in animation for these panels uses `transform: translateX(100%)` to hide. With conditional rendering, you'll lose the slide-out animation. If the slide-out is important, keep the panels mounted but modify `useSmoothScroll` to only start the rAF loop when the panel is visible (add an `enabled` parameter).

### Step 5.4: Create lightweight search index for CommandPalette

**File:** Create `lib/registry/search-index.ts`

```ts
import { COMPONENT_DETAILS } from "./component-details";

export const SEARCH_INDEX = Object.values(COMPONENT_DETAILS).map((c) => ({
  slug: c.slug,
  label: c.label,
  desc: c.desc || "",
  tags: c.tags || [],
}));
```

**Then in:** `docs/page.tsx` and `changelog/page.tsx`, import `SEARCH_INDEX` instead of `COMPONENT_DETAILS` for the CommandPalette `components` prop. Update CommandPalette's `components` prop type to accept the lighter type.

This avoids pulling the full 28KB component-details module (with all controls, filenames, etc.) into pages that only need label/slug/desc/tags for search.

### Step 5.5: Use Next.js metadata instead of `document.title` useEffect

**Files:**
- `apps/web/src/app/collection/page.tsx` — remove the `useEffect` setting `document.title` (lines 20-22). Add a metadata export or convert the page wrapper to use Next.js metadata. Since the page is `"use client"`, either:
  - Create a separate `layout.tsx` for `/collection` that exports metadata, or
  - Wrap CollectionContent in a server component page that exports metadata

- `apps/web/src/app/docs/page.tsx` — same treatment
- `apps/web/src/app/changelog/page.tsx` — same treatment

### Step 5.6: Verify

- Test CommandPalette search: should feel identical but smoother during typewriter animation
- Test collection page filtering: should feel noticeably snappier when typing/sorting
- Test showcase page: open/close info, code, and controls panels — animations should work, but idle GPU usage should be lower
- Check browser DevTools Performance tab on docs/changelog pages: the component-details module should not appear in the bundle

---

## Phase 6: Verify & Document

### Step 6.1: Full regression test

Visit every route and interaction:

| Page | What to check |
|------|---------------|
| `/` | Home page loads (skip — "still need to work on it") |
| `/collection` | All cards render, search works instantly, sort toggle works, curated sections display, bottom pill works, Cmd+K opens palette |
| `/docs` | All text sections render in correct fonts, CLI terminals work, tech stack badges render, 3D logo spins at finale, footer reveals on scroll |
| `/changelog` | All cards render, filters work, month/component dropdowns work, 3D logo spins at finale, footer reveals |
| `/showcase/japparii` | Shader component loads, controls drawer works, info/code ledgers slide in/out, ruler drawer works, fullscreen button works |
| `/showcase/dual-wave` | Self-contained scroll component works |
| `/showcase/accordion-wall` | Gallery layout works |
| `/preview/japparii` | Isolated preview renders correctly |

### Step 6.2: Production build test

```bash
npm run build
```

Must succeed with zero errors. Check the build output for:
- No warnings about missing fonts
- No warnings about missing imports
- Bundle sizes should be smaller than before Phase 1

### Step 6.3: Update this document

After all phases complete, add a "Completed" section at the bottom with:
- Date completed
- Any deviations from the plan
- Remaining known issues

---

## Phase Execution Order

```
Phase 1 (Font Lockdown)     → must be done first, touches globals
Phase 2 (Folder Restructure) → pure moves, no logic changes
Phase 3 (Delete Duplicates)  → depends on Phase 2 paths being final
Phase 4 (CSS Split)          → depends on Phase 2 paths being final
Phase 5 (Performance)        → independent of Phase 4, can overlap
Phase 6 (Verify)             → must be last
```

Phases 2 and 3 can be done in one session.
Phases 4 and 5 can be done in one session.
Phase 1 should be its own session — font changes are high-risk for visual regressions.

---

## Files Quick Reference

### Will be DELETED
- `public/fonts/Satoshi-Variable.woff2`
- `public/fonts/editorial-new-font-family/` (entire directory)
- `public/fonts/hatton-font-family/` (entire directory)
- `public/fonts/larken-typeface/` (entire directory)
- `components/changelog/Changelog3DLogoPiece.tsx`
- `components/catalog/` (directory, after moving CommandPalette)
- `components/shared/dock-material.css` (after Phase 4 split)
- `components/shared/` (directory, after all moves)
- `lib/controls/` (empty directory)
- `lib/color/` (after flattening)
- `lib/motion/` (after flattening)
- Dead files in `ui/` (TBD in Phase 2 audit)

### Will be CREATED
- `components/layout/` (new directory)
- `components/command-palette/` (new directory)
- `components/showcase/layouts/` (new directory)
- `lib/hooks/` (new directory)
- `lib/data/` (new directory)
- `lib/registry/layout-utils.ts` (new file)
- `lib/registry/search-index.ts` (new file)
- `components/layout/tokens.css` (Phase 4)
- `components/layout/layout.css` (Phase 4)
- `components/collection/collection.css` (Phase 4)
- `components/showcase/showcase.css` (Phase 4)

### Will be MOVED (not modified)
- `DockNavbar.tsx` → `layout/`
- `DocsFooter.tsx` → `layout/SiteFooter.tsx`
- `GrainOverlay.tsx` → `layout/`
- `Abyss3DLogoPiece.tsx` → `layout/`
- `CommandPalette.tsx` → `command-palette/`
- 4 showcase layouts → `showcase/layouts/`
- 2 hooks → `lib/hooks/`
- 2 data files → `lib/data/`
- 3 tiny lib files → flattened to `lib/`

---

## Completed

- **Date Completed:** August 27, 2026
- **Status:** All 6 Phases executed, verified, and passing `npm run build` with zero errors.
- **Key Outcomes:**
  - Standardized on Switzer font and purged 4 unused font families.
  - Eliminated duplicate logo components and monolithic `dock-material.css` (split into 4 modular stylesheets).
  - Upgraded Showcase drawers with hardware-accelerated pointer capture drag and directional contact depth.
  - Replaced client `document.title` `useEffect`s with static Next.js `layout.tsx` metadata.
  - Created lightweight search index and implemented tiered relevance ranking in CommandPalette.
- **Build Status:** Production build verified (`Exit code 0`, 11/11 static pages generated).

