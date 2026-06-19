# COMPONENT_STANDARDS.md

# AbsoluteUI Component Standards

## Purpose

This document defines the standards every component must satisfy before being accepted into AbsoluteUI.

These standards ensure consistency, quality, usability, visual excellence, and maintainability across the entire library.

AbsoluteUI is a curated component collection.

Not every component deserves inclusion.

Every component must earn its place.

---

# Core Philosophy

A component should feel:

* Crafted
* Intentional
* Premium
* Immersive
* Memorable

The objective is not to create more components.

The objective is to create better components that work together within coordinated page compositions.

---

# AbsoluteUI Quality Standard

Before a component is approved, it must satisfy all of the following:

### Visual Quality

* Visually distinctive
* Clean composition
* Strong hierarchy
* Consistent spacing
* Professional polish

### Interaction Quality

* Meaningful interaction
* Responsive feedback
* Natural motion
* Delightful experience

### Technical Quality

* Responsive
* Accessible
* Performant
* Maintainable

### Reusability

* Works across multiple projects
* Easy to customize
* Clear API

If any area fails, the component is not ready.

---

# Component Design Principles

## Principle 01 — Beauty First

Visual quality is the primary differentiator.

A component should immediately attract attention through execution, not gimmicks.

---

## Principle 02 — Motion Supports Design

Motion exists to enhance experience.

Motion should never compensate for weak design.

A beautiful component should remain beautiful even when animations are disabled.

---

## Principle 03 — Clarity Over Complexity

A complex implementation is acceptable.

A confusing experience is not.

Users should immediately understand how a component behaves.

---

## Principle 04 — Memorable Interactions

Every component should contain at least one memorable moment.

Examples:

* Magnetic hover
* Elegant reveal
* Smooth perspective shift
* Cursor-aware interaction
* Layered motion

The interaction should feel intentional.

---

## Principle 05 — Timeless Design

Avoid trends that will feel outdated quickly.

Reject:

* Excessive glow
* Excessive blur
* Excessive gradients
* Random glassmorphism
* Trend-chasing effects

Prefer timeless visual systems.

---

# Component Requirements

Every component must include:

## States

Where applicable:

* Default
* Hover
* Active
* Focus
* Disabled

---

## Theme Support

Required:

* Dark Mode
* Light Mode

The component must feel native in both.

---

## Responsiveness

Required:

* Mobile
* Tablet
* Desktop

No desktop-only components.

---

## Accessibility

Required:

* Keyboard navigation
* Focus indicators
* Semantic HTML
* Screen reader compatibility

Accessibility is not optional.

---

# Category Standards

## Buttons

Buttons should feel tactile.

Required:

* Hover interaction
* Press interaction
* Focus state
* Smooth transitions

Examples:

* Magnetic Button
* Aurora Button
* Spotlight Button
* Morph Button

Avoid generic buttons.

---

## Cards

Cards should feel alive.

Required:

* Hover response
* Depth
* Hierarchy
* Interactive feedback

Examples:

* Perspective Card
* Spotlight Card
* Layered Card
* Motion Card

---

## Images

Images should feel immersive.

Required:

* Elegant loading
* Smooth reveal
* High visual quality

Examples:

* Parallax Image
* Hover Zoom
* Perspective Gallery
* Split Reveal

---

## Typography

Typography should create emotion.

Required:

* Readability
* Hierarchy
* Smooth animation

Examples:

* Character Reveal
* Scroll Typography
* Kinetic Heading
* Layered Text

---

## Tooltips

Tooltips should feel effortless.

Required:

* Fast response
* Elegant entrance
* Clear content

Avoid:

* Harsh transitions
* Visual clutter

---

## Hover Effects

Hover effects should create delight.

Required:

* Smooth motion
* Purposeful interaction

Avoid:

* Excessive movement
* Motion overload

---

## Backgrounds

Backgrounds should support content.

Required:

* Performance
* Subtle depth
* Atmosphere

Avoid:

* Distracting visuals
* Heavy rendering costs

---

## Navigation

Navigation should feel premium.

Required:

* Clear hierarchy
* Responsive behavior
* Elegant motion

Examples:

* Floating Navbar
* Morphing Navigation
* Spotlight Navigation

---

## Page Compositions

Components must also be validated within complete page compositions.

Required:

* Components coordinate motion timing with surrounding sections
* Components do not conflict with Lenis smooth scrolling
* Layout transitions respect scroll-driven reveal sequences
* Multiple components together form a cohesive visual narrative

Examples:

* Landing Page Composition
* Creative Portfolio Composition
* Editorial Showcase Composition

---

# Performance Standards

Target:

* 60 FPS
* Minimal repaints
* Hardware acceleration where possible

Avoid:

* Expensive DOM updates
* Layout thrashing
* Unnecessary rerenders

Beauty must not compromise performance.

---

# Documentation & Demo Standards

Every component page must contain:

* **High-Quality Live Preview:** Interactive preview environments where users can adjust states, test responsiveness, and experience animations cleanly.
* **Component Presentation:** Visual layouts showing the component in context, styled to match AbsoluteUI aesthetic parameters.
* **Source Code:** Beautifully formatted, clean TypeScript and CSS blocks.
* **Installation:** Direct copy-paste instructions and CLI commands.
* **Dependencies:** Lists of exact external libraries (e.g. Framer Motion, GSAP).
* **Usage Example:** Simple, standard use-cases that illustrate implementation steps.

Optional:

* Customization Guide
* Motion Breakdown (explaining animation logic, values, and curves)

Demos must be of premium visual polish, functioning as independent mini-products. Avoid simplified "skeleton" or unstyled previews.

Composition Demos:

* Include at least one full-page composition demonstrating multiple components working together
* Composition demos should use Lenis smooth scroll and ScrollTrigger reveals
* Compositions should demonstrate narrative progression and atmospheric depth

---

# Rejection Criteria

Reject a component if:

* It feels generic
* It copies competitors directly
* Motion feels gimmicky
* Accessibility is missing
* Performance suffers
* Visual quality is average
* It lacks a unique value proposition

---

# Approval Checklist

Before publishing, answer:

* Is it beautiful?
* Is it memorable?
* Is it polished?
* Is it responsive?
* Is it accessible?
* Is it performant?
* Is it reusable?
* Is it production ready?
* Is it better than common alternatives?

If any answer is "No", the component is not ready.

---

# AbsoluteUI Standard

Every component should feel like something worth bookmarking.

If users forget it immediately after seeing it, it does not belong in AbsoluteUI.
