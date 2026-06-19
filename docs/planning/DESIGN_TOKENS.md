# DESIGN_TOKENS.md

# AbsoluteUI Design Tokens

This document details the core design token values and implementation rules for the AbsoluteUI ecosystem. The visual language is **Warm Editorial Showcase**: a carefully curated gallery style, soft depth layers, sophisticated display typography, a warm neutral dark base, a gold accent, and restrained motion.

---

## 1. Color System (Warm Neutrals & Gold)

Tokens are structured for utility-class mapping and CSS variables.

### Dark Mode (Default)
* `--background-deep`: `#050505` (Deep ink canvas)
* `--background-base`: `#0A0A0A` (Default page background)
* `--background-surface`: `#121212` (Card/element surface)
* `--background-elevated`: `#1A1A1A` (Hover/elevated surfaces)
* `--foreground-primary`: `#F5F2EB` (High-contrast primary text)
* `--foreground-secondary`: `#B8B1A6` (Muted editorial body text)
* `--foreground-muted`: `#8F887C` (Sub-labels and inactive state)
* `--border-subtle`: `#1F1F1F` (Restrained border separation)
* `--border-clean`: `#262626` (Interactive elements border)

### Light Mode (Secondary — Warm Cream)
* `--background-deep`: `#F0EDE4` (Deep cream canvas)
* `--background-base`: `#F5F2EB` (Default warm cream background)
* `--background-surface`: `#EDEAE0` (Light surface)
* `--background-elevated`: `#E5E1D6` (Hover surface)
* `--foreground-primary`: `#1A1A1A` (High-contrast dark text)
* `--foreground-secondary`: `#4A453C` (Body text)
* `--foreground-muted`: `#7A7366` (Sub-labels)
* `--border-subtle`: `#DFDACB` (Light cream separation lines)
* `--border-clean`: `#D3CCBA` (Light element borders)

### Gold Accent (Shared)
* `--accent`: `#D4C5A0` (Precision visual indicators)
* `--accent-hover`: `#E6D9B5` (Accent hover)
* `--accent-subtle`: `rgba(212, 197, 160, 0.1)` (Gold ambient glow/tint)

---

## 2. Typography System

The system uses geometric grotesque headers and clean monospace elements.

* `font-sans` (Display & Body): `Geist Sans`, `Satoshi`, `-apple-system`, `sans-serif`
* `font-mono` (Code & Meta): `JetBrains Mono`, `Geist Mono`, `monospace`

### Size Scale & Responsive Rem Mapping
* `text-xs`: `0.75rem` (12px) | Line height: `1.5`
* `text-sm`: `0.875rem` (14px) | Line height: `1.5`
* `text-base`: `1rem` (16px) | Line height: `1.6`
* `text-lg`: `1.125rem` (18px) | Line height: `1.5`
* `text-xl`: `1.25rem` (20px) | Line height: `1.4`
* `text-2xl`: `1.5rem` (24px) | Line height: `1.3`
* `text-3xl`: `1.875rem` (30px) | Line height: `1.2`
* `text-4xl`: `clamp(2rem, 4vw, 3rem)` (32px - 48px) | Line height: `1.1`
* `text-5xl`: `clamp(3rem, 5.5vw, 5.5rem)` (48px - 88px) | Line height: `1.05`

*Note: Headings in editorial display layout use tracking `-0.02em` to `-0.04em` for ultra-tight composition.*

---

## 3. Spacing & Grid Layout

Layouts are strictly aligned to a 4px/8px grid system. Borders replace shadows for separating structure.

### Rounding & Shadows
* `radius-none`: `0px` (Strict geometric corners — primary style)
* `radius-sm`: `2px` (Slight corner soften for micro-elements)
* `radius-md`: `4px` (Max corner radius for cards/buttons. NEVER exceed `6px`)
* `shadow-none`: `none` (Preferred)
* `shadow-flat`: `4px 4px 0px 0px var(--border-clean)` (Architectural offset shadow)

### Spacing Scale
* `space-1` (4px): `0.25rem`
* `space-2` (8px): `0.5rem`
* `space-3` (12px): `0.75rem`
* `space-4` (16px): `1rem`
* `space-6` (24px): `1.5rem`
* `space-8` (32px): `2rem`
* `space-12` (48px): `3rem`
* `space-16` (64px): `4rem`

---

## 4. Restrained Fluid Motion System

Animations are organic, physical, and highly responsive, yet quiet and understated.

### Easing Curves
* `ease-fluid`: `cubic-bezier(0.25, 1, 0.5, 1)` (Smooth, high-end deceleration)
* `ease-magnetic`: `cubic-bezier(0.16, 1, 0.3, 1)` (Snappy spring-like cursor pull)
* `ease-reveal`: `cubic-bezier(0.76, 0, 0.24, 1)` (Controlled slide/reveal ease)

### Transition Durations
* `duration-fast`: `150ms` (Active/hover micro-interactions)
* `duration-base`: `250ms` (Standard UI flips, expands, reveals)
* `duration-slow`: `450ms` (Large screen movements, full-image scales)

### Magnetic Force Scale
To remain restrained, cursor attraction displacement must never exceed:
* **Buttons:** `max-displacement: 12px`
* **Text / Icons:** `max-displacement: 6px`
