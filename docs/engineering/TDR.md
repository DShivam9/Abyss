# TDR.md

# Technical Design Requirements (TDR)

# Project

AbsoluteUI

---

# Technology Stack

## Core

* Next.js
* React
* TypeScript
* Tailwind CSS

---

## Animation & Motion

* GSAP (core animation engine)
* GSAP ScrollTrigger (scroll-driven reveals and parallax)
* @gsap/react (React hook integration: `useGSAP`)
* Framer Motion (declarative React animations)
* Lenis (global smooth scrolling)

---

## Advanced Visual Systems

* Rive
* Motion One
* HTML5 Canvas (ambient particle simulations, atmospheric backgrounds)

Future:

* WebGL
* OGL
* React Three Fiber

---

# Architecture

```text
apps/
└── docs

packages/
├── ui
├── animations
├── hooks
├── utils
└── registry
```

---

# Component Structure

Every component must include:

```text
component/
├── preview
├── source
├── docs
├── dependencies
└── installation
```

---

# Documentation Requirements

Each component page must contain:

* Live Preview
* Source Code
* Copy Button
* Installation Guide
* Dependency Information
* Usage Example

---

# Performance Requirements

## General

* Lighthouse Score 90+
* Mobile Friendly
* Responsive
* Accessible

---

## Animation

* 60 FPS Target
* No Layout Thrashing
* Hardware Accelerated Animations
* Minimal Repaints

---

## Loading

* Fast Initial Render
* Lazy Loaded Heavy Effects
* Optimized Assets

---

# Component Requirements

Every component must:

* Support Dark Mode
* Support Light Mode
* Be Responsive
* Be Accessible
* Be Reusable
* Be Production Ready

---

# Code Standards

Preferred:

* Composition over inheritance
* Reusable hooks
* Reusable utilities
* Type-safe APIs

Avoid:

* Magic values
* Unnecessary dependencies
* Complex abstractions
* Over-engineering

## Open-Source Borrowing Rules

When borrowing selected open-source patterns or code from platforms like 21st.dev:

* **License Compliance:** Ensure the original license (MIT, Apache, etc.) permits redistribution and modification.
* **Attribution:** Document the original source and author at the top of the component file where required.
* **Refactoring:** Refactor the codebase to eliminate layout thrashing, type errors, or unoptimized variables, matching AbsoluteUI technical standards.

---

# Installation Philosophy

Support:

* Copy & Paste
* CLI Installation
* Package Installation

Users should choose the workflow they prefer.

---

# Accessibility

Required:

* Keyboard Navigation
* Focus States
* Screen Reader Support
* Proper Semantic HTML

Accessibility is not optional.

---

# Technical Philosophy

Visual quality comes first.

However, beauty must never compromise usability, performance, maintainability, or accessibility.
