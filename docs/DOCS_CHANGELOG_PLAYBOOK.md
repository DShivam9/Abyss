# Abyss — Docs & Changelog Rebuild Playbook

> Step-by-step instructions for rebuilding the Docs and Changelog pages.
> Each step is small, self-contained, and testable before moving to the next.
> **Component descriptions are NOT written in this playbook.** Those happen one-by-one under manual review using `docs/COMPONENT_DESCRIPTION_GUIDE.md`.

---

## Ground Rules

1. **Never one-shot.** Every step is a single focused change. Commit or verify before the next.
2. **No component content yet.** Do not write `overview`, `useCases`, `techStack`, `engineeringNotes`, `codeUsage`, or `codeControlled` for any component during this playbook. Those fields are added to the type system as empty/optional — content is authored separately under manual review.
3. **Match the collection page vibe.** Both pages must use the same design tokens as the collection/showcase page. Not the same layout, but the same visual language.
4. **Test after every step.** Run dev server, open the page, confirm nothing broke and the change looks right.

---

## Design Token Reference (from Collection Page)

Both Docs and Changelog must use these. Currently docs uses `system-ui` and `#050505` — that's wrong.

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0d0d0f` | Page background. Not `#0A0A0A`, not `#050505`. |
| `--card-slab` | `#121215` | Card/panel backgrounds |
| `--preview-bg` | `#070709` | Code block backgrounds |
| `--dock-surface` | `#1a1a1c` | Elevated surfaces (header bars, sidebars) |
| `--surface-elevated` | `#16161a` | Secondary elevated surfaces |
| `--border-subtle` | `#1f1f28` | Card borders, dividers |
| `--border-hairline` | `rgba(255, 255, 255, 0.06)` | Thin separators |
| `--text-primary` | `#ffffff` | Headlines, primary text |
| `--text-muted` | `#8e8e93` | Secondary text, descriptions |
| `--text-title-muted` | `#a1a1aa` | Section labels |
| `--card-text` | `#d4d4d8` | Body text in cards |
| `--accent` | `#9be5fb` | Accent color (links, highlights) |

### Fonts

| Token | Value | Usage |
|-------|-------|-------|
| `--font-display` | `'Ranade'` | Headings, titles |
| `--font-body` | `'Switzer'` | Body text, descriptions |
| `--font-section` | `'Dela Gothic One'` | Section headers (optional, for emphasis) |
| `--font-mono` | `ui-monospace, SFMono-Regular, ...` | Code blocks, technical labels |

### Easing

| Token | Value |
|-------|-------|
| `--ease-emil` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |

> **Rule**: Do NOT use Tailwind color classes like `bg-[#0A0A0A]`, `text-neutral-400`, `border-neutral-800` etc. Use the CSS custom properties above via `var(--token)`. This ensures both pages stay in sync with the collection page if tokens change.

---

## Part 1: Changelog Page Fixes

The changelog is simpler (single page, no routing) so fix it first.

---

### Step 1.1 — Extract changelog data to a separate file

**Why:** 374 lines of data in `page.tsx` makes the file impossible to maintain. Separate data from rendering.

**Files:**
- [NEW] `apps/web/src/lib/changelog-data.ts`
- [MODIFY] `apps/web/src/app/changelog/page.tsx`

**Do:**
1. Create `changelog-data.ts` and move the `CommitEntry` interface and `CHANGELOG_DATA` array there.
2. Export both from the new file.
3. Import them in `page.tsx`.
4. **Do not change any content yet.** Just move code.

**Test:** Page looks identical. No visual change.

---

### Step 1.2 — Update CommitEntry interface with new fields

**Why:** Entries need to link to affected components and flag breaking changes.

**File:** `apps/web/src/lib/changelog-data.ts`

**Add to interface:**
```typescript
interface CommitEntry {
  // ... existing fields ...
  affectedSlugs?: string[];    // component slugs this entry touches
  breaking?: boolean;          // true = breaking change
  migrationNote?: string;      // what users need to change
}
```

**Do not fill these fields yet.** Just add the types. Existing entries stay unchanged.

**Test:** Page compiles. No visual change.

---

### Step 1.3 — Align changelog colors and fonts with collection page

**Why:** Changelog currently uses hardcoded `#0A0A0A`, `neutral-*` Tailwind classes, and system fonts. Must match collection page tokens.

**File:** `apps/web/src/app/changelog/page.tsx`

**Changes:**
- Page background: `bg-[#0A0A0A]` → `bg-[var(--bg)]` (which is `#0d0d0f`)
- Header bar: `bg-[#0A0A0A]/90` → `bg-[var(--bg)]/90`
- Header border: `border-neutral-900` → `border-[var(--border-subtle)]`
- All `text-neutral-400` → `text-[var(--text-muted)]`
- All `text-neutral-300` → `text-[var(--card-text)]`
- All `border-neutral-800` → `border-[var(--border-subtle)]`
- All `bg-neutral-900` → `bg-[var(--dock-surface)]`
- Heading font: add `style={{ fontFamily: 'var(--font-display)' }}` to h1 and h2 elements
- Body text: add `style={{ fontFamily: 'var(--font-body)' }}` to paragraph elements
- Mono text: stays as-is (already monospace)

**Test:** Changelog page colors and fonts now match the collection page vibe. Compare side-by-side.

---

### Step 1.4 — Fix the header bar navigation

**Why:** Current header has only "Back to Catalog". Needs Docs link and better structure.

**File:** `apps/web/src/app/changelog/page.tsx`

**Replace header contents with:**
- Left side: "Abyss UI / CHANGELOG" branding (matching docs sidebar pattern)
- Right side: Two links:
  - "Docs" → `/docs`
  - "Collection" → `/components`
  
Use the same link styling as the DockNavbar uses (small, monospace, muted text, hover to white).

**Test:** Header shows branding + two navigation links. Both links work.

---

### Step 1.5 — Fix filter pills styling

**Why:** Current pills use white background on active — too harsh. Should match collection page's muted style.

**File:** `apps/web/src/app/changelog/page.tsx`

**Changes:**
- Active pill: `bg-white text-black` → `bg-[var(--dock-surface)] text-[var(--text-primary)] border-[var(--accent)]`
- Inactive pill: keep border style but use `border-[var(--border-subtle)]`
- Remove `rounded-full`, use `rounded-lg` to match collection pill shapes
- Font: use `var(--font-mono)` explicitly

**Test:** Filter pills look subtle and match the collection page feel. Active state is visible but not blinding white.

---

### Step 1.6 — Fix entry card layout and tag badges

**Why:** Current colored tag badges clash with the monochrome collection vibe. Bullet items use colored underlines that look unintentional.

**File:** `apps/web/src/app/changelog/page.tsx`

**Changes:**
- Tag badge: remove all color. Use `bg-[var(--card-slab)] text-[var(--text-muted)] border-[var(--border-subtle)]` for all tags. Differentiate by text only, not color.
- Entry title (h2): use `var(--font-display)` font
- Entry summary: use `var(--font-body)` font, `var(--text-muted)` color
- Bullet items: use `var(--font-body)`, `var(--card-text)` color. Remove any text decoration.
- Bullet dot: use `var(--text-muted)` color

**Test:** Entries look clean and monochrome. No random colors.

---

### Step 1.7 — Add component links to changelog entries

**Why:** When an entry mentions a component, the reader should be able to click through to see it.

**File:** `apps/web/src/app/changelog/page.tsx`

**Do:**
- If `entry.affectedSlugs` exists and has items, render small pill links below the entry summary
- Each pill links to `/components/{slug}`
- Style: small, monospace, muted text, `var(--border-subtle)` border, hover shows `var(--accent)` text

**Test:** Entries with `affectedSlugs` show clickable component links. Entries without stay unchanged.

---

### Step 1.8 — Add changelog writing rules as comment block

**Why:** Future agents and contributors need rules inline with the data file.

**File:** `apps/web/src/lib/changelog-data.ts`

**Do:** Add the condensed writing rules from `docs/CHANGELOG_GUIDE.md` as a comment block at the top of the file. The full guide lives in the MD file — this is just a quick reference.

**Do not rewrite any entries now.** Entries get rewritten one at a time during manual review.

**Test:** File compiles. Comment block is visible at top.

---

## Part 2: Docs Page Fixes

---

### Step 2.1 — Align docs page colors and fonts with collection page

**Why:** Docs uses `system-ui` font and `#050505` background — completely different visual language from collection.

**Files:**
- `apps/web/src/app/docs/page.tsx`
- `apps/web/src/components/docs/docs-constants.ts`

**Changes:**
- Delete `SYSTEM_SANS_FONT` constant from `docs-constants.ts`
- Remove `style={{ fontFamily: SYSTEM_SANS_FONT }}` from docs `page.tsx`
- Page background: `bg-[#050505]` → `bg-[var(--bg)]`
- Sidebar background: `bg-[#090909]` → `bg-[var(--card-slab)]`
- Apply `font-family: var(--font-body)` to the docs container
- Apply `font-family: var(--font-display)` to all h1/h2 elements in docs views

**Test:** Docs page fonts and colors match collection page. Side-by-side compare.

---

### Step 2.2 — Align docs sidebar styling

**Why:** Sidebar uses hardcoded colors that don't match.

**File:** `apps/web/src/components/docs/DocsSidebar.tsx`

**Changes:**
- Brand text "Abyss UI": use `var(--font-display)`
- "/ DOCS" label: use `var(--text-muted)`
- Section headers ("GETTING STARTED", "COMPONENTS"): use `var(--text-title-muted)` color, `var(--font-mono)` font
- Nav items: idle = `var(--text-muted)`, active = `var(--text-primary)`, hover = `var(--card-text-hover)`
- Active indicator: use `var(--accent)` left border or background tint, not hardcoded blue/white
- **Keep components in alphabetical order.** No category grouping. This is a collection, not a library.

**Test:** Sidebar matches collection page's DockNavbar color feel.

---

### Step 2.3 — Align docs code blocks

**Why:** Code blocks should use `var(--preview-bg)` background to match collection dark panels.

**File:** `apps/web/src/components/docs/DocsCodeBlock.tsx`

**Changes:**
- Code block background: use `var(--preview-bg)` (`#070709`)
- Code block border: use `var(--border-subtle)`
- Tab bar background: use `var(--card-slab)`
- Code text: use `var(--card-text)`
- Copy button: muted, hover to `var(--text-primary)`

**Test:** Code blocks look like they belong in the same app as the collection page.

---

### Step 2.4 — Align DocsNextStepCard styling

**Why:** Next step cards should match the collection card aesthetic.

**File:** `apps/web/src/components/docs/DocsNextStepCard.tsx`

**Changes:**
- Card background: `var(--card-slab)`
- Card border: `var(--border-subtle)`
- Title: `var(--text-primary)`, `var(--font-display)`
- Description: `var(--text-muted)`, `var(--font-body)`
- Arrow icon: `var(--text-muted)`, hover `var(--accent)`
- Hover: border shifts to `var(--accent)` at low opacity

**Test:** Next step cards look like smaller versions of collection cards.

---

### Step 2.5 — Update ComponentDetail types

**Why:** Need new optional fields for per-component doc pages.

**File:** `apps/web/src/lib/registry/types.ts`

**Add:**
```typescript
export interface ComponentDetail {
  // ... existing fields ...
  overview?: string;
  useCases?: string[];
  techStack?: string[];
  engineeringNotes?: string[];
  codeUsage?: string;
  codeControlled?: string;
}
```

**Do NOT fill these fields on any component.** Just add them as optional types.

**Test:** Compiles. No visual change.

---

### Step 2.6 — Add Resources section to sidebar

**Why:** Need Changelog and GitHub links accessible from docs.

**File:** `apps/web/src/components/docs/DocsSidebar.tsx`

**Add below Components section:**
```
RESOURCES
  Changelog        → /changelog
  GitHub ↗         → https://github.com/DShivam9/Abyss (opens new tab)
```

**Style:** Same as Getting Started section. External link gets `↗` icon.

**Test:** Both links work. GitHub opens in new tab.

---

### Step 2.7 — Build per-component doc view (empty shell)

**Why:** Clicking a component in sidebar should open its own doc page, not the grid.

**Files:**
- [NEW] `apps/web/src/components/docs/views/ComponentDocView.tsx`
- [MODIFY] `apps/web/src/app/docs/page.tsx`

**ComponentDocView receives a single `ComponentDetail` and renders sections:**

| Section | Source | Fallback if field empty |
|---------|--------|----------------------|
| Title | `label` | Always present |
| One-liner | `desc` | Always present |
| "Open in Showcase" button | `/components/{slug}` | Always present |
| Installation | Generated (same as existing) | Always present |
| Basic Usage code | `codeUsage` | Show generic import snippet |
| Props table | `controls` | "No configurable props" |
| Controlled Example | `codeControlled` | Hide section |
| Overview | `overview` | Hide section |
| Use Cases | `useCases` | Hide section |
| Tech Stack | `techStack` | Hide section |
| Engineering Notes | `engineeringNotes` | Hide section |
| Prev/Next nav | Adjacent components | Always present |

**Update `page.tsx`:** When `activeView` matches a component slug, render `ComponentDocView` instead of `ComponentsView`.

**Test:** Click any component in sidebar → see its doc page with title, desc, showcase button, install, and generic code. Empty fields show nothing (no placeholder text).

---

### Step 2.8 — Rewrite Introduction page content

**Why:** Current intro is thin and generic.

**File:** `apps/web/src/components/docs/views/IntroductionView.tsx`

**Rewrite sections:**

| Section | New Content |
|---------|------------|
| **What is Abyss** | Keep existing paragraph, tighten to 2 sentences max. |
| **You own the code** | Keep, tighten. |
| **Browser support** | Replace paragraph with a small table: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+. Note WebGL 2 requirement. |
| **Next steps** | Add third card: "Browse Components" linking to `components` view. |

**Test:** Introduction reads tighter and more informative.

---

### Step 2.9 — Expand Quick Start page

**Why:** Single example is too thin for a "Quick Start."

**File:** `apps/web/src/components/docs/views/QuickStartView.tsx`

**Add two more examples:**
1. **Image shader example** — show a shader component (e.g., MoltenMercury) with `imageSrc` prop
2. **Gallery example** — show a gallery component (e.g., FocusRing) with `images` array

Keep the existing ParallaxColumn example as example #1.

Each example gets:
- A section header naming the category
- A code block with the snippet
- A one-line note about what props to customize

**Test:** Quick Start shows 3 examples across different component categories.

---

### Step 2.10 — Add Guides section (Browser Support, Accessibility, Performance)

**Why:** Users asked for these. Each is a standalone content page.

**Files:**
- [NEW] `apps/web/src/components/docs/views/BrowserSupportView.tsx`
- [NEW] `apps/web/src/components/docs/views/AccessibilityView.tsx`
- [NEW] `apps/web/src/components/docs/views/PerformanceView.tsx`
- [MODIFY] `apps/web/src/components/docs/DocsSidebar.tsx`
- [MODIFY] `apps/web/src/app/docs/page.tsx`

**Add sidebar section between Getting Started and Components:**
```
GUIDES
  Browser Support
  Accessibility
  Performance Tips
```

**Content for each (keep concise — these are reference pages, not tutorials):**

**Browser Support:**
- Compatibility table (Chrome, Firefox, Safari, Edge, mobile browsers)
- WebGL 2 requirement and how to check
- Fallback behavior when GPU is unavailable
- Reduced motion (`prefers-reduced-motion`) handling

**Accessibility:**
- How canvas components interact with screen readers
- Keyboard navigation support per component category
- `aria-label` and `role` props available
- Reduced motion defaults

**Performance:**
- GPU memory and disposal patterns
- Lazy loading recommendations
- How to measure render cost (Chrome DevTools GPU tab)
- Mobile-specific tips (lower resolution, fewer particles)

**Test:** All three pages render from sidebar links. Content is accurate and concise.

---

## Part 3: Cross-Linking

---

### Step 3.1 — Add DockNavbar to changelog page

**Why:** Changelog header is custom and doesn't match the collection page nav. Use the shared DockNavbar.

**File:** `apps/web/src/app/changelog/page.tsx`

**Do:**
- Replace the custom `<header>` with the shared `DockNavbar` component (same one used on collection page)
- Remove the custom "Back to Catalog" link — DockNavbar already has navigation

**Test:** Changelog uses the same top navigation as the collection page.

---

### Step 3.2 — Verify collection ↔ docs ↔ changelog links

**Why:** All three pages should link to each other.

**Check:** The DockNavbar already has links. Verify that "Docs" and "Changelog" links exist and work from all three pages. If not, add them.

**Test:** Collection → Docs, Collection → Changelog, Docs → Changelog, Changelog → Docs all work.

---

## Part 4: Showcase Wiring

---

### Step 4.1 — Wire SpecimenInfoLedger to new component fields

**Why:** Info panel currently shows hardcoded placeholder text. Should use per-component data when available.

**File:** `apps/web/src/components/showcase/SpecimenInfoLedger.tsx`

**Changes:**
- **Overview section**: Use `component.overview` if present, fall back to `component.desc`. Remove the hardcoded fallback string.
- **Tech & Dependencies**: If `component.techStack` exists, render those pills (with logos) instead of the hardcoded React/Three.js/GSAP pills. Fall back to current hardcoded pills if field is empty.
- **Application & Use Cases**: If `component.useCases` exists, render as a bulleted list. Fall back to current placeholder text if field is empty.
- **Engineering Notes**: If `component.engineeringNotes` exists, render those. Fall back to current placeholder text if field is empty.

**Key rule:** Fallbacks use current text until real content is authored. No section shows empty.

**Test:** Page looks identical to current (because no component has new fields filled yet). But the code is ready to consume real data.

---

### Step 4.2 — Wire SpecimenCodeLedger to new component fields

**Why:** Code tab shows generic filler snippets. Should use per-component code when available.

**File:** `apps/web/src/components/showcase/SpecimenCodeLedger.tsx`

**Changes:**
- **Basic Usage**: If `component.codeUsage` exists, use it. Otherwise fall back to current generated snippet.
- **Controlled Properties**: If `component.codeControlled` exists, use it. Otherwise fall back to current generated snippet.

**Test:** Page looks identical. Code is ready for real data.

---

## Execution Sequence Summary

```
CHANGELOG (8 steps)
  1.1  Extract data to separate file
  1.2  Add new interface fields
  1.3  Align colors/fonts to collection tokens
  1.4  Fix header navigation
  1.5  Fix filter pills
  1.6  Fix entry layout and tag badges
  1.7  Add component links to entries
  1.8  Add changelog writing rules (comment block)

DOCS (10 steps)
  2.1  Align colors/fonts to collection tokens
  2.2  Align sidebar styling (alphabetical, no category groups)
  2.3  Align code blocks
  2.4  Align next-step cards
  2.5  Update ComponentDetail types
  2.6  Add Resources section to sidebar
  2.7  Build per-component doc view (empty shell)
  2.8  Rewrite Introduction content
  2.9  Expand Quick Start
  2.10 Add Guides section (Browser Support, Accessibility, Performance)

CROSS-LINKING (2 steps)
  3.1  Add DockNavbar to changelog
  3.2  Verify all cross-links work

SHOWCASE WIRING (2 steps)
  4.1  Wire SpecimenInfoLedger to new fields
  4.2  Wire SpecimenCodeLedger to new fields

THEN (separate, under manual review):
  → Write component descriptions one by one using docs/COMPONENT_DESCRIPTION_GUIDE.md
  → Rewrite changelog entries one by one using docs/CHANGELOG_GUIDE.md
```

---

## What This Playbook Does NOT Do

- ❌ Write any component descriptions, overviews, use cases, or code snippets
- ❌ Redesign layouts (user handles visual design)
- ❌ Rewrite changelog entries (done under manual review)
- ❌ Group sidebar by category (alphabetical only — this is a collection, not a library)
- ❌ Change routing strategy (stays SPA-style for now)
