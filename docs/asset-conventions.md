# ABYSS — ASSET CONVENTIONS

> **Any agent adding, referencing, or moving assets MUST read this document first.**
> Violating these rules creates duplicate assets, broken image paths, and a maintenance nightmare.

---

## The Core Rule

**Every component owns its own assets. No sharing. No pools.**

Each component gets exactly one folder per asset type. Assets inside that folder belong to that component and only that component. No other component may reference those files. No file lives in a generic pool.

---

## Folder Structure

```
apps/web/public/
├── images/
│   ├── components/
│   │   ├── [component-slug]/       ← One folder per component
│   │   │   ├── hero.webp           ← Descriptive names only
│   │   │   ├── portrait-01.webp
│   │   │   └── texture-dark.webp
│   │   └── ... (one dir per component slug)
│   └── website/                    ← Site-level images only (logos, OG images, etc.)
│       └── og-image.webp
├── audio/
│   └── components/
│       └── [component-slug]/
│           ├── track-01.mp3
│           └── track-02.mp3
└── videos/
    └── components/
        └── [component-slug]/
            └── preview.webm
```

---

## Naming Rules

### Folder names
- Must exactly match the component slug from `component-details.ts`.
- Lowercase, hyphen-separated. `tracklist-gallery`, not `Tracklist Gallery` or `tracklist_gallery`.
- Never use the "apparatus" prefix. Never.

### File names
- **Descriptive only.** The filename must communicate what the image is.
- Good: `portrait-01.webp`, `hero-dark.webp`, `texture-grain.webp`, `album-cover-solas.webp`
- Banned: `dajd.webp`, `gg.webp`, `download (1).webp`, `fjvfba.webp`, `_.webp`, `faf.webp`, `hh.webp`, `stshsh.webp`, `kl.webp`
- If you can't describe the image in the filename, rename it before adding it.
- No spaces in filenames. Use hyphens.

### File format
- Images: `.webp` (preferred) or `.avif`. No `.jpg`, `.png`, or `.jpeg` unless unavoidable.
- Audio: `.mp3` or `.ogg`
- Video: `.webm` (preferred) or `.mp4`

---

## Reference Rules

### In component-details.ts

The `filename` field must use the full path relative to `public/images/components/`:

```ts
// CORRECT
"tracklist-gallery": {
  filename: "components/tracklist-gallery/hero.webp",
  ...
}

// WRONG — old flat category path
"tracklist-gallery": {
  filename: "Image(shader)/fjvfba.webp",  // ← banned
  ...
}
```

### In component source code

Reference assets by full public path:

```ts
// CORRECT
const src = "/images/components/tracklist-gallery/album-cover-solas.webp";

// WRONG — shared pool reference
const src = "/images/components images/scroll/cosmos_1207399578.webp";
```

---

## What NOT to Do

### No shared image pools
The old structure had flat category folders (`Image(shader)/`, `scroll/`, `Gallary/`) with 30-50 generic images used across multiple components. This is banned.

Why: when a component's image needs to change, you can't tell which other components depend on the same file. Isolation makes this a non-issue.

### No duplicate usage
One asset file → one component. If two components need a similar image, each gets its own copy in its own folder. Storage is cheap. Confusion is not.

### No random filenames
`cosmos_1207399578.webp`, `download (2).webp`, `dajd.webp` — these are impossible to maintain. Any agent reading the codebase cannot understand what these images are. Always use descriptive names.

### No assets outside the components/ subfolder (for component assets)
Component assets go in `images/components/[slug]/`. Not in `images/` root. Not in a custom subfolder you invented. Not in the component's source directory in `packages/`.


---

## MANDATORY: Agent Asset Intake (Before Building Any New Component)

**This step is not optional. No component build starts until these questions are answered by the user.**

When an agent is tasked with building a new component, it MUST stop before writing any code and ask the following questions. Do not guess. Do not use placeholder assets. Do not pull from the existing image pool.

### Questions the agent MUST ask:

1. **How many assets does this component need?**
   - Exact count: e.g. "3 images", "1 video + 1 image", "5 audio tracks"
   - Not "some" or "a few" — a specific number

2. **What type of assets?**
   - Images, audio, video, or a mix
   - If images: are they portraits, landscapes, textures, abstract art, photography?

3. **What resolution and dimensions?**
   - Agent must propose a specific resolution based on the component layout (e.g. `1200×800px` for a full-panel image, `800×800px` for a square card, `400×600px` for a portrait card)
   - User must confirm or correct before any asset is referenced

4. **Will the user provide the assets, or should placeholder high-quality images be used during development?**
   - If user provides: wait for them. Do not use random files from the old flat pool.
   - If placeholder: use generated images or specify exact Unsplash/Pexels URLs — never use existing component assets from another component's folder.

**Only after the user answers all four questions does the agent create the asset folder and write the component.**

---

## Asset Quality Standards

These are hard minimums. Assets that don't meet these are rejected and must be replaced before the component ships.

### Images

| Property | Minimum | Target | Notes |
|---|---|---|---|
| Format | `.webp` | `.webp` | `.avif` also acceptable. No `.jpg` or `.png` unless no alternative |
| Resolution — full panel | `1200 × 800px` | `1920 × 1080px` or higher | For components that fill a large viewport area |
| Resolution — card/square | `800 × 800px` | `1200 × 1200px` | For gallery cards, tracklist covers, etc. |
| Resolution — portrait | `800 × 1100px` | `1200 × 1600px` | For portrait-oriented images |
| Resolution — texture/overlay | `1024 × 1024px` | `2048 × 2048px` | Tileable textures must tile cleanly |
| File size | Under `500KB` per image | Under `250KB` | WebP compression should handle this without quality loss |
| Quality check | No visible blur at 100% zoom | Sharp at 200% zoom on 2x display | If it looks soft at native size, reject it |
| Color | Full color range, no washed out or desaturated unless intentional | — | Assets must look good before the shader touches them |

### Audio

| Property | Minimum | Notes |
|---|---|---|
| Format | `.mp3` (192kbps) or `.ogg` | `.mp3` for broadest compatibility |
| Sample rate | 44.1kHz | Standard |
| Channels | Stereo (2ch) | Mono only if the component specifically calls for it |
| File size | Under `3MB` per track | Longer tracks: use streaming, not preload |
| Quality check | No clipping, no background noise | Listen before adding |

### Video

| Property | Minimum | Target | Notes |
|---|---|---|---|
| Format | `.webm` | `.webm` with `.mp4` fallback | WebM for modern browsers, MP4 as `<source>` fallback |
| Resolution | `1080p (1920×1080)` | `1440p` | Never add a video under 720p |
| Frame rate | 24fps | 30fps | Match the component's intended feel |
| File size | Under `5MB` for short loops | Under `2MB` for UI loops under 5s | Use compression tools (ffmpeg, Handbrake) |
| Quality check | No pixelation, no compression artifacts | — | If it looks bad paused, reject it |
| Looping | Seamless loop required for idle loops | — | First and last frame must match |

---

## The Visual Quality Check

Before adding any asset to a component folder, run this mental check:

1. **Open the image at 100% zoom.** Is it sharp? No blur, no compression artifacts?
2. **Would you use this on a premium portfolio or award-winning site?** If not, it's not good enough for Abyss.
3. **Does it suit the component's aesthetic?** A medieval stone shader should not have a corporate stock photo. The asset should match the mood of the interaction.
4. **Is it the right dimensions?** Too small and it'll look blurry when scaled up by the component. Measure it.
5. **Is the file size reasonable?** Images over 500KB need re-exporting with better compression.

If the answer to any of these is "no" — replace the asset before building the component.

---

## When Adding a New Component

1. Create the folder: `apps/web/public/images/components/[your-slug]/`
2. Add only the images that component uses. Give them descriptive names.
3. Update `component-details.ts` `filename` field to `"components/[your-slug]/[filename].webp"`.
4. If the component needs audio: `apps/web/public/audio/components/[your-slug]/`
5. If the component needs video: `apps/web/public/videos/components/[your-slug]/`
6. Do not reuse any image from another component's folder.

---

## Current State (Migration Needed)

The old flat structure still exists and has not been fully migrated:

| Old path | Problem |
|---|---|
| `public/images/components images/Image(shader)/` | Flat pool, random names, shared |
| `public/images/components images/scroll/` | Flat pool, 50+ images, random names |
| `public/images/components images/Gallary/` | Same issue |
| `public/images/apparatus-tracklist-gallery/` | Wrong folder name (wrong slug prefix) |
| `public/audio/apparatus-tracklist-gallery/` | Wrong folder name |

**Migration plan for any agent tasked with cleanup:**
1. For each component in `component-details.ts`, identify which image it actually uses.
2. Create `public/images/components/[slug]/` for that component.
3. Copy the image with a descriptive name.
4. Update the `filename` field in `component-details.ts`.
5. After all components are migrated, delete the old flat folders.
6. Verify build: `npm run build` — no broken image refs.

Do NOT do this migration as a side effect of another task. It is its own task.

---

## Website Images

Non-component assets (OG images, social cards, brand assets, site illustrations):

```
public/images/website/
├── og-image.webp
├── favicon.svg        (already at public/favicon.svg — leave it)
└── ...
```

These are NOT component assets and do not follow the per-component folder rule.

---

*This document is the source of truth for asset organization. If anything in the codebase contradicts it, this document wins and the code needs updating.*
