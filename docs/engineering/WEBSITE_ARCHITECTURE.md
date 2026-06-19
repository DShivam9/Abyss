# WEBSITE_ARCHITECTURE.md

# AbsoluteUI Website Architecture

## Purpose

This document defines the structure, layout, navigation, and user journey of the AbsoluteUI website.

The website is not merely documentation.

The website is the first product users experience.

It must demonstrate the quality, motion, craftsmanship, and attention to detail that define AbsoluteUI.

Every page should reinforce trust in the library.

---

# Core Website Philosophy

The website should feel:

* Premium
* Curated
* Immersive
* Fast
* Modern
* Memorable

Users should not feel like they are browsing documentation.

Users should feel like they are exploring a carefully crafted design collection.

---

# Website Goals

The website must help users:

* Discover components
* Preview components
* Install components
* Learn quickly
* Explore categories
* Trust the quality of the library

---

# Primary Navigation

```text
Home
Components
Showcase
Docs
Search
GitHub
```

Navigation should remain minimal.

Avoid unnecessary pages.

Every page should have a clear purpose.

---

# Site Structure

```text
/
├── Home
│
├── Components
│   ├── Buttons
│   ├── Cards
│   ├── Images
│   ├── Typography
│   ├── Tooltips
│   ├── Hover Effects
│   ├── Backgrounds
│   └── Navigation
│
├── Component
│   └── [slug]
│
├── Showcase
│
├── Docs
│   ├── Installation
│   ├── Getting Started
│   ├── CLI
│   ├── Copy & Paste
│   └── Contribution Guide
│
├── Search
│
└── 404
```

---

# Homepage Structure

The homepage is the most important page.

It should communicate quality within seconds.

---

# Section 01 — Hero

Purpose:

Create immediate emotional impact.

Requirements:

* Large typography
* Signature animation
* Interactive showcase
* Strong visual hierarchy

Hero Message:

Explain what AbsoluteUI is in one sentence.

Avoid buzzwords.

Be clear.

---

# Section 02 — Featured Components

Purpose:

Showcase only the best work.

Do not show every component.

Curate aggressively.

Requirements:

* Interactive previews
* Motion demonstrations
* Quick access

Think quality over quantity.

---

# Section 03 — Categories

Purpose:

Help users explore.

Display:

* Buttons
* Cards
* Images
* Typography
* Tooltips
* Hover Effects
* Backgrounds
* Navigation

Each category should include visual previews.

Avoid boring icon grids.

---

# Section 04 — Why AbsoluteUI

Purpose:

Differentiate the library.

Communicate:

* Beauty First
* Motion Driven
* Open Source
* Production Ready

Keep concise.

---

# Section 05 — Showcase

Purpose:

Demonstrate real-world usage.

Display:

* Landing pages
* Hero sections
* Component combinations

Show possibilities.

Not just isolated components.

---

# Section 06 — Footer

Include:

* GitHub
* Documentation
* License
* Social Links

Keep minimal.

---

# Components Page

Purpose:

Allow browsing by category.

Requirements:

* Fast filtering
* Dynamic search
* Category navigation
* Interactive preview cards (users can trigger animations directly on the browsing grid, inspired by 21st.dev's discovery dashboard)
* Grid layouts optimized for discoverability and scanning

Every component should be visible without overwhelming users.

---

# Component Detail Page

Every component page should follow the same structure.

---

## Hero Preview

Large interactive preview.

The preview should be the focal point. This environment should function like an interactive sandbox (inspired by 21st.dev's preview system), allowing users to configure component states (themes, speeds, content) instantly.

---

## Component Information

Display:

* Name
* Description
* Dependencies
* Category

---

## Installation

Support:

* Copy & Paste
* CLI
* Package Install

---

## Source Code

Requirements:

* Syntax Highlighting
* Copy Button
* Clean Formatting

---

## Usage Example

Demonstrate:

* Basic usage
* Customization

---

## Motion Breakdown

Optional but recommended.

Explain:

* Animation behavior
* Motion logic
* Customization

---

# Showcase Page

Purpose:

Demonstrate components working together.

Not individual components.

Examples:

* Hero Sections
* Product Pages
* Marketing Sites
* Portfolio Pages

This page inspires users.

---

# Search Experience

Search must be accessible globally.

Users should find components by:

* Name
* Category
* Tags
* Keywords

Search should feel instant.

---

# Documentation Experience

Documentation should prioritize:

1. Preview
2. Installation
3. Usage
4. Customization

Do not force users to read large amounts of text before seeing results.

---

# Visual Hierarchy

Priority:

1. Component Preview
2. Component Name
3. Installation
4. Documentation

Users come to see components first.

Documentation comes second.

---

# Responsive Strategy

Every page must support:

* Mobile
* Tablet
* Desktop

The experience should remain premium across all screen sizes.

---

# Performance Requirements

Target:

* Lighthouse 90+
* Fast navigation
* Optimized assets
* Lazy-loaded previews

The website should feel lightweight despite its visual richness.

---

# Accessibility Requirements

Required:

* Keyboard navigation
* Focus states
* Semantic HTML
* Screen reader support

Accessibility is mandatory.

---

# Design Consistency Rules

All pages must:

* Use the same spacing system
* Use the same typography system
* Follow the same motion standards
* Follow the same color system

Consistency builds trust.

---

# Future Expansion

Potential future additions:

```text
Templates
Playground
Community Showcase
Component Builder
AI Search
Premium Experiments
```

Only expand when quality can be maintained.

---

# Website Success Criteria

A successful website should:

* Feel premium immediately
* Showcase components effectively
* Help users find components quickly
* Demonstrate craftsmanship
* Encourage bookmarking and sharing

---

# AbsoluteUI Website Standard

The website itself should feel like the best component in the entire library.

If the website does not inspire confidence, the components will not either.
