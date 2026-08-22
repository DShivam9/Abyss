# Abyss — Changelog Writing Guide

> Rules for writing changelog entries in `changelog-data.ts`.
> Every entry must follow these rules before shipping.

---

## The Problem

Current changelog entries read like git commit messages. They expose internal refactors, stack adjectives, and use project jargon that users don't understand. This guide fixes that.

---

## Title

**Max 6 words.** Name the component or the fix. Not a compound sentence.

```
Good: "Added Gimbal Stream"
Bad:  "Gimbal Stream Component & 3D Spatial Gallery"

Good: "Fixed scroll lock on drawers"
Bad:  "Global Showcase Scroll Lock & Arc Drift Physics"
```

---

## Summary

**One sentence.** What changed for the user. Not what you refactored internally.

```
Good: "New 3D gallery with gyroscopic card rings and scroll-driven orbit."
Bad:  "Introduced Gimbal Stream, a spatial 3D gallery featuring gyroscopic card rings, 
       atmospheric chamber dynamics, liquid mercury centerpiece, and interactive hover inspector."
```

---

## Bullet Items

**Max 4 items per entry.** Only user-visible changes.

```
Good: "Added auto-drift and orbit speed controls"
Bad:  "Integrated live parameter controls for auto drift, orbit speed, card curvature, and chamber effects"
```

---

## Jargon Ban List

| Don't write | Write instead |
|-------------|---------------|
| Specimen Ledger | info panel |
| Vibe Section | showcase section |
| apparatus- anything | just the component name |
| Registry | component list |
| Pipeline | don't mention it |
| Purged legacy | removed old |
| Migrated to clean core architecture | moved to new package |
| Hardware-accelerated | (omit unless comparing to a non-accelerated version) |
| Kinetic | (omit — everything moves, this word adds nothing) |
| Overhauled | updated, reworked |
| Synthesized | (omit) |
| Tactile | (omit unless literally haptic feedback) |

---

## Skip Invisible Changes

If the user can't see or feel the difference, don't list it:
- Internal file renames
- Legacy prefix removal
- Asset path reorganization
- Package structure changes
- Build diagnostic cleanup
- Registry key updates
- Metadata standardization

**Test:** Read the bullet item aloud. If a user would say "so what?", delete it.

---

## Adjective Limit

Max 2 adjectives before any noun.

```
Bad:  "atmospheric chamber backdrop with dynamic caustic wave lighting"
Good: "chamber backdrop with wave lighting"

Bad:  "smooth kinetic ambient background color crossfading"
Good: "background color crossfade"
```

---

## Tag Rules

| Tag | When to use |
|-----|-------------|
| `MAJOR` | New component added, or breaking change |
| `ADDITION` | New feature on existing component |
| `MINOR` | Visual polish, parameter tweaks |
| `FIX` | Bug fix |

---

## Component Links

When an entry adds or modifies a component, include the component slug in `affectedSlugs`. This renders clickable links to the component's showcase page.

```typescript
{
  title: "Added Gimbal Stream",
  affectedSlugs: ["gimbal-stream"],  // ← links to /components/gimbal-stream
  // ...
}
```

---

## Example: Before & After Rewrite

### Before (current style)

```typescript
{
  tag: "MAJOR",
  title: "Gimbal Stream Component & 3D Spatial Gallery",
  summary: "Introduced Gimbal Stream, a spatial 3D gallery featuring gyroscopic card rings, atmospheric chamber dynamics, liquid mercury centerpiece, and interactive hover inspector.",
  items: [
    "Added Gimbal Stream component with multi-axis gyroscopic card rings and responsive scroll drifting",
    "Added atmospheric chamber backdrop with dynamic caustic wave lighting and pattern controls",
    "Added 3D floating centerpiece with multi-harmonic zero-gravity tumbling motion",
    "Added interactive card hover inspection with cursor-tracking detail pill and smooth scale lifts",
    "Integrated live parameter controls for auto drift, orbit speed, card curvature, and chamber effects",
  ],
}
```

### After (following this guide)

```typescript
{
  tag: "MAJOR",
  title: "Added Gimbal Stream",
  summary: "New 3D gallery with gyroscopic card rings and scroll-driven orbit.",
  affectedSlugs: ["gimbal-stream"],
  items: [
    "3D card ring that orbits on scroll and auto-drifts when idle",
    "Chamber backdrop with wave lighting",
    "Hover any card to inspect it with a detail overlay",
    "Controls for drift speed, orbit speed, and card curvature",
  ],
}
```

**What changed:**
- Title: 7 words → 3 words
- Summary: 1 compound sentence → 1 simple sentence
- Items: 5 → 4, each ≤ 12 words, no jargon
- `affectedSlugs` added for component linking

---

## Workflow for Rewriting Existing Entries

1. Read the current entry.
2. Ask: "What did the user get?" — that's your new title and summary.
3. Delete any bullet items about internal refactors, file moves, or invisible changes.
4. Trim remaining items to ≤ 12 words each.
5. Add `affectedSlugs` if components were added or changed.
6. Read the whole entry aloud. If it sounds like a commit message, rewrite it.
