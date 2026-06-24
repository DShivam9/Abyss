# Absolute UI - Agent Context

This document provides the necessary context for agents tasked with planning and building new components for the Absolute UI project.

## Core Vision
Absolute UI is a premium, cinematic UI framework designed to elevate modern web stacks by bridging the gap between standard utility and high-end art. We are building "zones" (Hero/Arrival, Philosophy, Manifesto, Museum Views) rather than isolated generic components.

## Tech Stack
- **Framework:** Next.js (App Router), React
- **Styling:** Tailwind CSS (utility-first, but highly curated)
- **Animation:** GSAP (ScrollTrigger for complex scroll-linked animations, timelines for reveals)
- **Language:** TypeScript

## Aesthetic & Design Rules
- **High-Fashion Editorial:** Wide, bold typography, tight and intentional grids, full-bleed images, and curated color stories.
- **Premium Feel:** Reject generic "slop" (no basic box-shadows, no default palettes, no cliché layouts).
- **Motion:** 60fps fluidity. Focus on deep crossfades, subtle 3D arcing, staggered typography reveals, clip-path transitions, and dimensional parallax.
- **Imagery:** "The image is the experience." We use strict image mapping. **Never repeat the same image across different sections of the website.**

## Current Roadmap / Focus Areas
- **Arrival Zones:** 3-card arc over full-bleed crossfading backgrounds.
- **Philosophy Zones:** Interactive editorial scrolls pacing storytelling.
- **Manifesto & Content Zones:** Unpinned, fluid vertical scrolls with scroll-scrub animations.
- **Museum Views:** Component galleries isolated into full-viewport "rooms".

## Next Steps for Planning
When planning new components:
1. Ensure they fit within the high-end editorial aesthetic.
2. Define the exact GSAP animation orchestration required.
3. Architect the DOM structure to support complex visual effects (e.g., sticky wrappers, clip-path masks) while maintaining accessibility and performance.
