# Absolute UI — Website Implementation Plan

> **Superseded by `docs/SITE_IMPROVEMENT_PLAN.md` for active work.**  
> This file retains historical phase structure. Locked decisions (light mode only, no waitlist, no playground) are in the improvement plan.

This document outlines the phased technical implementation plan for building the initial website experience. 

---

## 1. Architectural Vision

We are constructing a **Poetic Motion & Editorial Exhibition** that showcases our image-first philosophy. The website is currently the primary product; it must feel like an Awwwards-tier digital gallery, not a template.

### Core Architecture
* **Single Next.js App**: A flat, clean Next.js App Router codebase in the project root.
* **Twin Animation Engines**: Framer Motion for declarative components and gestures; GSAP (with ScrollTrigger and `useGSAP`) for scroll-linked timeline pacing.
* **Lenis Smooth Scroll**: Coordination of smooth scroll offsets with GSAP's rendering loops to prevent scroll jank.

---

## 2. Design Token Specifications

These values represent the warm light-mode editorial system established during the design alignment session.

### Colors (Warm Light Mode)
* Background: `#FFFFFF` (Ivory paper tone / clean white)
* Depth Layer: `#F8F8F8` (Warm cream / silver gray)
* Primary Copy: `#111111` (Espresso charcoal / deep gray)
* Secondary Copy: `#333333` (Muted dark espresso)
* Borders: `transparent` (Whitespace separation) / `#EEEEEE` (Hairlines for interactive buttons)
* Accents: **Dynamic** (Extracted dominant and complement colors sampled from active Unsplash photography)

### Typography
* Primary Display Font: `Cormorant Garamond` (Light Italic / Regular Italic, 300/400)
* Body/UI Font: `Satoshi` (Regular / Bold, 300/400/500/700/900)
* Size Scale: Mapped to responsive `clamp()` rules for fluid header sizing on mobile devices.

### Motion Easing
* Cinematic Decay: `cubic-bezier(0.32, 0.72, 0, 1)`
* Kinetic Attraction: `cubic-bezier(0.25, 1, 0.5, 1)`
* Mask Emergence: `cubic-bezier(0.16, 1, 0.3, 1)`

---

## 3. The 8-Phase Build Blueprint

We will execute the construction in 8 sequential phases. Each phase must be verified and approved before proceeding to the next.

```
                  ┌───────────────────────────────┐
                  │ Phase 1: Project Scaffolding  │
                  └───────────────┬───────────────┘
                                  ▼
                  ┌───────────────────────────────┐
                  │ Phase 2: Animation & Scroll   │
                  └───────────────┬───────────────┘
                                  ▼
                  ┌───────────────────────────────┐
                  │ Phase 3: Canvas Integration   │
                  └───────────────┬───────────────┘
                                  ▼
                  ┌───────────────────────────────┐
                  │   Phase 4: Left Vertical Nav  │
                  └───────────────┬───────────────┘
                                  ▼
                  ┌───────────────────────────────┐
                  │  Phase 5: Layout Scaffolding  │
                  └───────────────┬───────────────┘
                                  ▼
                  ┌───────────────────────────────┐
                  │  Phase 6: Gallery & Hovers    │
                  └───────────────┬───────────────┘
                                  ▼
                  ┌───────────────────────────────┐
                  │  Phase 7: Time-Scrub Sandbox  │
                  └───────────────┬───────────────┘
                                  ▼
                  ┌───────────────────────────────┐
                  │ Phase 8: Manifesto & Waitlist │
                  └───────────────────────────────┘
```

---

### Phase 1 — Project Scaffolding
* **Goal**: Establish the codebase workspace, file structure, configuration, and styling tokens.
* **Execution Steps**:
  1. Initialize Next.js in the current directory:
     ```bash
     npx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --use-npm --import-alias "@/*" --skip-install
     ```
  2. Install dependencies: `npm install` (basic dependencies).
  3. Set up the CSS design tokens inside `src/app/globals.css` as custom properties.
  4. Integrate the Satoshi font families and Fontshare displays.
* **Verification Criteria**:
  - `npm run build` compiles cleanly.
  - A blank landing page renders in warm `#FFFFFF` background.

---

### Phase 2 — Smooth Scroll & Animation Core
* **Goal**: Configure the physics-based animation loops and Lenis smooth scrolling.
* **Execution Steps**:
  1. Install animation libraries: `npm install gsap @gsap/react framer-motion lenis`
  2. Create a global smooth scroll provider using Lenis.
  3. Bind Lenis animation frame updates directly to GSAP's tick listener to synchronize scroll triggers.
  4. Set up custom React hooks for scroll tracking and cursor coordinates.
* **Verification Criteria**:
  - Long viewport scrolling is smooth with no layout shifts or render conflicts.

---

### Phase 3 — Canvas Integration (Optional Background Atmosphere)
* **Goal**: Integrate the botanical particle canvas as the background.
* **Execution Steps**:
  1. Mount the canvas behind the main page layout.
  2. Bind canvas state updates to scroll position triggers (controlling the text-to-lily morph) and mouse repulsion coordinates.
* **Verification Criteria**:
  - The canvas renders behind page content.

---

### Phase 4 — Staggered Vertical Navigation
* **Goal**: Build the signature left navigation bar.
* **Execution Steps**:
  1. Create the `src/components/LeftNav.tsx` component.
  2. Arrange vertical, 90°-rotated links on the left side of the screen.
  3. Use GSAP ScrollTrigger to coordinate which link is active based on the scroll position.
* **Verification Criteria**:
  - Left navigation links trigger smooth transitions to their target zones on click.
  - Highlights update dynamically as sections scroll by.

---

### Phase 5 — Layout Zones Scaffolding
* **Goal**: Scaffold the container zones and design entrance animation timelines.
* **Proposed Changes**:
  1. Scaffolding the 6 zone components under `src/components/zones/`.
  2. Coordinate the vertical viewport grid using GSAP ScrollTrigger pinning.
* **Verification Criteria**:
  - Smooth section pins control the narrative flow as the user scrolls.

---

### Phase 6 — Horizontal Exhibition Gallery
* **Goal**: Rebuild the Gallery zone into a horizontal scrub exhibition.
* **Execution Steps**:
  1. Query curated, fashion-focused images from Unsplash.
  2. Construct the Gallery component using GSAP ScrollTrigger pinning.
  3. Left block pins the typography title and description.
  4. Right block slides a horizontal deck of panels containing asymmetric cards with individual image-first interaction styles (Organic mask reveals, staggered parallax depth, zoom, color override on hover).
* **Verification Criteria**:
  - The section pins on scroll and scrubs horizontally.
  - Image hovers execute fluidly at 60 FPS.

---

### Phase 7 — Interactive Sandbox & Dynamic Typography
* **Goal**: Rebuild the Playground to be a sliderless, interactive component preview sandbox, and implement the root dynamic color-reactive typography system.
* **Execution Steps**:
  1. Modify `src/components/zones/PlaygroundZone.tsx` to completely remove the split-image before/after exposure slider, hairline divider, and indicator badge.
  2. Implement an elegant, centered image component sandbox container with dynamic interactive modes (Parallax, 3D Tilt, Zoom, Reveal) controlled by a minimal select bar and intensity toggles.
  3. Bind cursor movements (or touch gestures) on the sandbox container to GSAP animations based on the active selection (Parallax offset, card Tilt, Zoom translation, Spotlight circle reveal mask).
  4. Setup a ScrollTrigger manager in `src/app/page.tsx` that smoothly updates the `--accent` and `--accent-hover` CSS variables on `document.documentElement` based on the active zone scrolled into view.
  5. Refactor headings in `src/components/zones/ArrivalZone.tsx` to split display text into character spans and animate color shifts between `--accent` and `--accent-hover` based on cursor coordinates.
  6. Pass custom color coordinates to `GalleryCard` and bind card hovers to smoothly transition document-wide variables.
* **Verification Criteria**:
  - Compilation compiles cleanly with `npm run build`.
  - Interactions run at 60 FPS without layout shifts.
  - Page headings and interactive components smoothly transition colors on scroll and hover.
  - No slider element or dividing line exists in the DOM.

---

### Phase 8 — Manifesto, Waitlist & Footer
* **Goal**: Assemble the manifesto typographic reveal, waitlist card, and the clean, minimal footer with interactive color-reactivity.
* **Execution Steps**:
  1. Implement word-by-word active highlights in `PhilosophyZone.tsx` where the active scrubbed word transitions to `text-accent` and then fades back.
  2. Implement character-by-character reveals in `ManifestoZone.tsx` and loop their colors through a slow, breathing pulse of the dynamic color palette (Terracotta, Teal, Sage).
  3. Enable interaction in `WaitlistZone.tsx` by adding a functional email submission input with validation states (rotating hairline loader, secure success confirmation cards) using Framer Motion.
  4. Create the minimal footer component (`src/components/Footer.tsx`) displaying external links (GitHub, Twitter, Discord) and licensing/copyright.
* **Verification Criteria**:
  - Complete build compiles without warnings.
  - Footer displays correctly at the bottom of the page, linking to external profiles.
  - Mobile layout adapts to touch interaction gracefully.
