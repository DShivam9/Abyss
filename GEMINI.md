# Absolute UI — AI Operating Instructions

## Purpose

This file defines how AI agents should think, plan, design, and build within the Absolute UI codebase.

Absolute UI is an image-first interactive component library. The images ARE the components — not assets inside containers.

Right now, the product is the website. The website proves the quality standard, the motion philosophy, and the visual taste before any component ships. Every decision should reinforce this.

---

# Project Context

## Project Name

Absolute UI

---

## Project Type

Image-first interactive component library. Currently in Phase 1: website experience.

---

## Core Positioning

Image-first. Motion-driven. Immersive. Cinematic.

The website demonstrates capability. It is a statement, not a catalog.

---

## Current Phase

Phase 1 — Website Experience.

We are building the website. Not components. Not documentation pages. Not a component catalog.

Components come in Phase 3.

---

## Mission

Build image-first interactive experiences at a level nobody else is offering. Prove the standard through the website first.

---

# Fundamental Principle

The image is the experience. Every design decision, every animation, every layout choice serves the image.

---

# Agent Behavior Rules

## Rule 01 — Never Code Blindly

Never immediately begin implementation.

Before writing code:

- Understand the desired experience
- Understand the image-first philosophy
- Understand constraints
- Ask questions if information is missing

Discussion comes before implementation.

---

## Rule 02 — Research Before Building

Before creating a solution:

- Analyze existing approaches
- Identify trade-offs
- Evaluate alternatives
- Recommend the strongest approach

Do not default to the first solution.

---

## Rule 03 — Architecture Before Code

Follow:

Research → Discussion → Planning → Implementation → Refinement

Never skip planning.

---

## Rule 04 — Challenge Weak Decisions

Do not blindly agree.

If a request introduces:

- Scroll slop (section after section with no narrative purpose)
- Generic, template-like output
- Motion that serves no purpose
- Visual noise that competes with images
- Performance problems
- Accessibility issues

Explain the issue and propose a better alternative.

---

## Rule 05 — Continuously Improve

After completing a task ask:

- Does the image feel more immersive?
- Does the motion feel more cinematic?
- Is the narrative flow better?
- Can this be faster?
- Can this be more accessible?

Never settle for the first acceptable version.

---

## Rule 06 — Process Visual Feedback (Agentation)

When the user provides structured visual feedback generated via the Agentation toolbar:
- Use the CSS selectors, DOM locations, file paths, and coordinates provided in the feedback to locate the exact component and styles in the codebase.
- Read the user's specific comments attached to each annotation to guide your design adjustments.
- Prioritize fixing visual inconsistencies, alignment issues, or interactive polish highlighted in their feedback.

---

# Design Philosophy

The website should feel:

- Clean
- Minimalistic
- Immersive
- Aesthetic
- Cinematic

The website should NOT feel:

- Generic or template-like
- Loud or aggressive
- Trendy or trend-chasing
- Over-designed with visual noise
- Like scroll slop

Major inspiration: Awwwards-level execution.

---

# Image-First Philosophy

Every component, every section, every interaction centers on the image.

- The image is not background — it is foreground
- Images react to scroll, cursor, viewport, and interaction
- Image quality is non-negotiable (high-res, aesthetic, editorial/nature photography)
- Layouts serve images — not the other way around
- If an element doesn't enhance the image experience, question its existence

---

# Motion Philosophy

Motion makes images feel alive. It is the differentiator.

**Framer Motion and GSAP are non-negotiable.** They are the twin animation engines. Every interaction depends on them.

Motion should feel:

- Smooth (60 FPS, no jank)
- Deliberate (every animation has purpose)
- Cinematic (directed, not random)
- Elegant (luxurious deceleration, controlled timing)

Motion should NEVER feel:

- Chaotic or random
- Bouncy or playful (wrong brand)
- Excessive or exhausting
- Absent (static sections are forbidden)

---

# Narrative Flow

The website tells a story. Not section → section → section.

Rules:

- Every scroll position should reveal something meaningful
- Use GSAP ScrollTrigger for pinned sections and scroll-driven pacing
- Use Lenis for global smooth scrolling
- Transitions between zones feel directed, not arbitrary
- The website has a cinematic emotional arc: intrigue → belief → demonstration → conviction → closure
- No scroll slop. Ever.
- **No waitlist. No playground.** See `docs/SITE_IMPROVEMENT_PLAN.md`.

---

# Technology Stack

Core:

- React
- Next.js
- TypeScript
- Tailwind CSS

Animation (Non-Negotiable):

- Framer Motion
- GSAP (with ScrollTrigger)
- @gsap/react (useGSAP hook)
- Lenis

Project structure: Single clean Next.js directory. No monorepo. No Turborepo.

Use the simplest solution capable of delivering the desired experience.

---

# Performance Standards

Target:

- 60 FPS on all animations
- Lighthouse 90+
- Fast initial render
- Responsive interactions

Avoid:

- Layout thrashing
- Unnecessary rerenders
- Heavy dependencies that don't earn their bundle size
- Unoptimized image assets

Beauty must not compromise performance.

---

# Accessibility Standards

Required:

- Keyboard navigation
- Visible focus states
- Semantic HTML
- Screen reader support
- `prefers-reduced-motion` support

Accessibility is mandatory. Not optional.

---

# Inspiration Sources

Study these for quality reference. We are not competing with them. We exist in a different category.

- **Awwwards** — Motion quality, storytelling, presentation. Primary inspiration.
- **Godly** — Visual quality, typography, curation.
- **Linear** — Precision, spacing, professionalism.
- **Apple** — Simplicity, restraint, product quality.
- **21st.dev** — Component presentation, developer experience, visual polish.

Learn from them. Do not imitate them. Absolute UI has its own identity.

---

# Forbidden Behaviors

Never:

- Build generic, template-like output
- Create scroll slop (sections with no narrative purpose)
- Ship static sections without motion or interaction
- Add animations without purpose
- Copy competitors directly
- Use bouncy spring physics (wrong brand)
- Ignore accessibility
- Ignore performance
- Use glassmorphism, neon glow, or trend-chasing effects
- Build components before Phase 3

---

# Decision Framework

When faced with multiple solutions ask:

1. Which solution makes the image experience more immersive?
2. Which solution creates better narrative flow?
3. Which solution is more cinematic?
4. Which solution performs better?
5. Which solution aligns with the image-first philosophy?

Choose the strongest overall option.

---

# Documentation Reference

The project documentation lives in `docs/`:

- **`docs/SITE_IMPROVEMENT_PLAN.md`** — **Primary source of truth.** Locked decisions, bug fixes, zone specs, implementation order. Read this first.
- `docs/DESIGN.md` — Design philosophy, motion system, content voice (light mode only)
- `docs/WEBSITE.md` — Tech spec, architecture, wireframes, design tokens
- `docs/PRODUCT.md` — Vision, brand, roadmap

When documents conflict, **`SITE_IMPROVEMENT_PLAN.md` wins.**

---

# Anti-Generic Output (Mandatory)

Gemini and all agents frequently produce template-like output. **This is a failure state.**

## Locked Decisions — Never Violate

- **Light mode only.** No dark backgrounds. No `#0A0A0A`. Use tokens from `docs/DESIGN.md`.
- **Waitlist removed permanently.** Never add email capture, signup CTAs, or waitlist copy.
- **Playground zone removed.** Interactivity lives in Gallery exhibitions only.
- **Two fonts only:** Cormorant Garamond + Satoshi. No other families.
- **Motion:** Cinematic GSAP/Framer curves. No bouncy springs. No elastic easing.

## Before Submitting Any Code or Design

Run this checklist:

1. Would this pass as an **Awwwards exhibition site**, or does it look like a generic SaaS landing page?
2. Is every section **image-first** with purposeful motion?
3. Are colors **warm ivory/light**, not dark charcoal?
4. Is scroll routed through **Lenis**, not native `scrollIntoView`?
5. Did I read **`docs/SITE_IMPROVEMENT_PLAN.md`** for the relevant zone spec?

## Generic Patterns to Reject

Do not produce:

- Dark heroes with gradient overlays
- Card grids with generic hover lift
- "Join waitlist" or email forms
- Playground / sandbox / "try it" zones separate from gallery
- Hamburger menu icons (use editorial "Index" if mobile nav needed)
- Glassmorphism, neon glow, purple gradients
- 8+ font families
- Static sections with no interaction
- Copy that sounds like marketing template filler ("revolutionary", "next-generation", "elevate your")

## When the User Says Output Is Bad

Stop. Re-read `docs/SITE_IMPROVEMENT_PLAN.md` and the relevant zone spec. Do not repeat the same approach. Do not revert to rejected concepts. Ask one clarifying question only if the spec is genuinely ambiguous.

---

# Final Principle

Every contribution should make Absolute UI feel more immersive, more cinematic, and more unforgettable than it was before.

If it does not, reconsider the decision.
