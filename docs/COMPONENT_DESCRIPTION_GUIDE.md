# Abyss — Component Description Guide

> Single source of truth for writing component descriptions across the Abyss collection.
> Every component's copy must follow this structure before shipping.

---

## Voice & Tone

**One rule:** Write like you're explaining the component to a sharp designer who codes on weekends. Not a tutorial. Not a spec sheet. A clear, honest description that respects the reader's intelligence.

### Do

- Use **plain, direct language**. Say what the component does in one breath.
- Name the **visual effect first**, the technology second.
- Use **concrete nouns** over abstract ones. "cards rotate on a 3D drum" beats "elements undergo spatial transformation".
- Keep sentences **short and declarative**. If a sentence has two commas, split it.
- Use **active voice**. "Scroll drives the wave" not "The wave is driven by scrolling".
- Reference **physical metaphors** when they genuinely clarify: ripple, drift, fold, shatter, erode. But only when the effect actually resembles that thing.

### Don't

- Stack adjectives: ~~"interactive physics-driven cursor-responsive kinetic gallery"~~
- Invent compound-noun chains: ~~"GPU-accelerated frame interpolation with delta-time correction"~~ (unless it's literally a shader property name)
- Use filler words: ~~basically, essentially, leveraging, utilizing, seamlessly~~
- Oversell: ~~"stunning", "breathtaking", "revolutionary"~~
- Use internal jargon as if the reader knows it: ~~"Lenis-grade virtual scroll inertia"~~ — say "smooth scroll inertia (Lenis)" instead
- Write the same use-case line for every component: ~~"Designed for high-impact hero viewports, editorial showcases..."~~

---

## Required Fields Per Component

Each component entry in `component-details.ts` needs these fields. Fields marked ★ are new or currently hardcoded and need per-component authoring.

### Existing Fields (keep as-is)

| Field | Purpose |
|-------|---------|
| `id` | Numeric string identifier |
| `label` | Display name |
| `filename` | Hero image path |
| `slug` | URL slug |
| `category` | `image` · `scroll` · `gallery` · `transition` · `text` · `3d` |
| `subtype` | Subcategory within the category |
| `tags` | Tech and concept tags shown as pills |
| `previewType` | Rendering mode for the showcase |
| `controls` | Interactive property controls |

### New / Rewritten Fields

| Field | Type | Purpose |
|-------|------|---------|
| `desc` | `string` | **One-liner pitch.** What the component *is* in a single sentence. Max ~30 words. No tech stack, no adjective stacking. |
| ★ `overview` | `string` | **Extended description.** 2–3 sentences expanding on the pitch. What it looks like, how it responds, what makes it distinct. |
| ★ `useCases` | `string[]` | **Where to use it.** 3–5 short phrases. Concrete page contexts, not generic marketing speak. |
| ★ `techStack` | `string[]` | **Actual technologies used.** Replaces the hardcoded React/Three.js/GSAP pills. Only list what this specific component actually imports. Each entry renders with its **original tech logo** at a small, uniform size (~14–16px) — the logo accompanies the label, not replaces it. |
| ★ `engineeringNotes` | `string[]` | **Real implementation details.** 2–4 bullet points about performance, rendering approach, or notable behaviors. Only facts, no filler. |
| ★ `codeUsage` | `string` | **Basic usage snippet.** Minimal JSX showing the component with its essential props. Replaces the current filler that shows `imageSrc` for every component. |
| ★ `codeControlled` | `string` | **Controlled props snippet.** JSX showing the component with 3–5 key configurable props. Not every prop — just the ones a developer would reach for first. |

---

## Writing Templates

### `desc` — The One-Liner

**Formula:** [What it is] + [how it behaves] in one sentence.

```
Good:  "Vertical accordion that unfolds panels like a folding screen, revealing text and casting crease shadows."
Bad:   "A tactile vertical image accordion that unfolds like a folding screen divider, collapsing neighbor panels while revealing title text and folding shadows."
```

The bad version isn't wrong — it's just trying to say everything at once. Save the details for `overview`.

**Length check:** Read it aloud. If you run out of breath, it's too long.

---

### `overview` — The Extended Description

**Formula:** Sentence 1 = what you see. Sentence 2 = how it responds to input. Sentence 3 (optional) = what makes it different from the obvious approach.

```
Good:
"A grid of photographs drifting along a curved horizon arc. 
 As you scroll, the centered image rises to full scale while 
 the background landscape dissolves to match it. Each transition 
 uses a weighted crossfade rather than a hard cut."

Bad:
"Designed for high-impact hero viewports, editorial showcases, 
 interactive product galleries, and atmospheric landing page 
 sections."
```

The bad version describes where to use it (that's `useCases`) and says nothing about what the component actually does.

---

### `useCases` — Where This Belongs

**Formula:** [Page section type] + [content type] — short phrases, not sentences.

```
Good:
[
  "Portfolio hero sections",
  "Album or collection browsers", 
  "Product detail image carousels",
  "Editorial photo essays"
]

Bad:
[
  "Designed for high-impact hero viewports",
  "Interactive product galleries",
  "Atmospheric landing page sections"
]
```

Differences: the good version names specific page contexts. The bad version is generic enough to describe any component in the library.

**Uniqueness test:** If the same use-case array could describe 5+ other components, it's too generic. Each component should have at least 2 use cases that are specific to its behavior.

---

### `techStack` — What It Actually Uses

List only the technologies this component imports. Order: framework → rendering → animation → utilities.

```
Good:  ["React", "Three.js", "GSAP ScrollTrigger", "Lenis"]
Bad:   ["React 18+ / Next.js", "Three.js / WebGL", "GSAP ScrollTrigger"]
```

- Don't bundle alternatives with `/`. If it uses Three.js, say "Three.js". WebGL is implied.
- Don't add version constraints unless there's a real minimum version requirement.
- Don't list "Next.js" unless the component has server-component or App Router specific code.

---

### `engineeringNotes` — Implementation Facts

**Formula:** [What it does technically] + [why that matters for the user].

```
Good:
[
  "Renders on Canvas 2D — no WebGL dependency, works on all browsers.",
  "Perlin noise field recalculates per scroll frame at ~0.4ms on M1.",
  "Disposes all GPU textures on unmount to prevent memory leaks.",
  "Scroll-driven: no requestAnimationFrame loop when idle."
]

Bad:
[
  "GPU-accelerated frame interpolation with delta-time correction.",
  "60 FPS target performance profile on mid-range hardware.",
  "Automatic context loss recovery and memory disposal on unmount."
]
```

The bad version is the current hardcoded placeholder — same three lines for every component. The good version tells the reader something real about *this* component.

---

### `codeUsage` — Basic Usage Snippet

**Formula:** Minimal working example. Import + render with only the props required to make it work. No styling, no extras.

````
Good (Erosion Map — scroll component that needs images):
```jsx
import { ErosionMap } from "@abyss-ui/core";

export default function MyView() {
  return (
    <ErosionMap
      images={["/img/a.webp", "/img/b.webp", "/img/c.webp"]}
    />
  );
}
```

Bad (current filler — same for every component):
```jsx
import { ErosionMap } from "@abyss-ui/core";

export default function MyView() {
  return (
    <div className="w-full h-screen">
      <ErosionMap
        imageSrc="/images/hero.webp"
      />
    </div>
  );
}
```
````

The bad version uses `imageSrc` for a component that takes an `images` array. It wraps in a div that the component doesn't need. It shows nothing about what makes this component's API different.

**Rules:**
- Use the component's **actual required props** — read the types file.
- If the component needs an array of images, show 3 items. If it needs a single image, show one.
- No wrapper divs unless the component genuinely needs one to function.
- Keep it under 12 lines of JSX.

---

### `codeControlled` — Controlled Props Snippet

**Formula:** The component with 3–5 props a developer would customize first. Pick the most impactful ones from `controls`.

````
Good (Erosion Map):
```jsx
<ErosionMap
  images={images}
  windPattern="vortex"
  erosionDamper={2.0}
  edgeGlow={2.5}
  noiseScale={0.008}
/>
```

Bad (current filler — same for every component):
```jsx
<ErosionMap
  imageSrc="/images/hero.webp"
  className="w-full h-full"
  style={{ borderRadius: "14px" }}
/>
```
````

The bad version shows `className` and `style` — generic React props, not this component's actual API.

**Rules:**
- Only show props from the component's `controls` or typed props. Never `className`/`style` unless that's genuinely noteworthy.
- Pick the props that change behavior or appearance most dramatically.
- Use realistic values, not defaults — show what customization looks like.

---

## Component Category Guidance

Different categories naturally emphasize different details. Use this as a checklist, not a template.

### Image Shaders (`category: "image"`)
- **Overview** should describe the visual effect: what the image looks like at rest, what changes on interaction.
- **Engineering notes** should mention: shader type (fragment/vertex), whether it uses depth maps or normal maps, cursor input method (raycast, UV remap, etc.).

### Scroll Components (`category: "scroll"`)
- **Overview** should describe the scroll behavior: what moves, what direction, what triggers transitions.
- **Engineering notes** should mention: scroll library used (GSAP ScrollTrigger, Lenis, native), whether it pins sections, performance on mobile.

### Galleries (`category: "gallery"`)
- **Overview** should describe the spatial layout and navigation method.
- **Engineering notes** should mention: interaction method (drag, wheel, keyboard), item count limits, lazy loading behavior.

### Transitions (`category: "transition"`)
- **Overview** should describe what the transition looks like and what triggers it.
- **Engineering notes** should mention: clip-path vs canvas vs WebGL approach, duration/easing defaults, whether it's interruptible.

### Text Components (`category: "text"`)
- **Overview** should describe the typography effect and any scroll/hover response.
- **Engineering notes** should mention: font requirements, character-level vs word-level animation, accessibility (screen reader behavior).

### 3D Components (`category: "3d"`)
- **Overview** should describe the 3D scene and camera behavior.
- **Engineering notes** should mention: renderer (Three.js, CSS 3D, Canvas), polygon/draw-call budget, mobile fallback.

---

## Quality Checklist

Before submitting a component's description, verify:

- [ ] **`desc` is ≤ 30 words** and a single sentence
- [ ] **`overview` is 2–3 sentences** and mentions what it looks like + how it responds
- [ ] **`useCases` has 3–5 items** and at least 2 are specific to this component
- [ ] **`techStack` only lists actual imports** — no imaginary dependencies
- [ ] **`engineeringNotes` has 2–4 items** and none are the old placeholder text
- [ ] **No adjective stacking** (max 2 adjectives before a noun)
- [ ] **No filler phrases** (basically, essentially, seamlessly, leveraging)
- [ ] **Physical metaphors are accurate** — the effect actually resembles the metaphor
- [ ] **Read it aloud** — if it sounds like a press release, rewrite it

---

## Example: Complete Entry

```typescript
"accordion-wall": {
  id: "38",
  label: "Accordion Wall",
  filename: "components/accordion-wall/hero.webp",
  slug: "accordion-wall",
  category: "gallery",
  subtype: "accordion",

  desc: "Vertical accordion that unfolds panels like a folding screen, revealing text and casting crease shadows.",

  overview: "A row of image panels stacked edge-to-edge. Hovering or clicking a panel causes it to expand while its neighbors compress, mimicking a physical folding screen. Each fold casts a soft crease shadow along the hinge edge to sell the depth.",

  useCases: [
    "Team member or founder showcases",
    "Product category selectors",
    "Before/after comparison strips",
    "Portfolio navigation with preview"
  ],

  techStack: ["React", "GSAP"],

  engineeringNotes: [
    "Pure CSS flexbox layout — no absolute positioning or JavaScript layout calculations.",
    "GSAP handles the expand/collapse tween with a shared timeline for synchronized panel widths.",
    "Crease shadows are CSS pseudo-elements with gradient opacity, zero GPU cost.",
    "Keyboard navigable: arrow keys cycle panels, Enter/Space triggers expand."
  ],

  tags: ["GSAP", "Flexbox", "Crease Shadows"],
  previewType: "transition",
  controls: [
    // ... existing controls unchanged
  ]
}
```

---

## Workflow

1. Open this guide alongside the component source code.
2. Read the component's `index.tsx` to understand what it actually does — not what its current `desc` claims.
3. Write `desc` first. Get the one-liner right before expanding.
4. Write `overview` by watching the component in the showcase. Describe what you see and how it responds.
5. Fill `useCases` by asking: "What page would I build with this?" — name the page, not the feeling.
6. Fill `techStack` from the actual import statements.
7. Fill `engineeringNotes` from implementation details that a developer choosing this component would care about.
8. Run the quality checklist.
9. Move to the next component.
