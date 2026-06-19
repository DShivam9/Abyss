# WEBSITE_WIREFRAMES.md

# AbsoluteUI Website Wireframes

This document details the wireframe structures and layout definitions for the AbsoluteUI portal, using a **Warm Editorial Showcase** layout system (explicit borders, soft spatial separation, sophisticated display typography, and design-oriented branding).

---

## 1. Global Navigation (Fixed Header)

Minimalist split-nav separated from content by a 1px solid border (`border-subtle`).

```text
+---------------------------------------------------------------------------------------------------------+
| [ Logo: ABSOLUTEUI ]                 [ Nav: Components | Showcase | docs ]                  [ Github ]  |
+---------------------------------------------------------------------------------------------------------+
```

* **Layout:** Flex row, justify-between, items-center.
* **Height:** `64px` | Padding: `0 space-6` (24px).
* **Styles:** Sans-serif medium tracking-[-0.03em]. GitHub link is a clean, premium uppercase string.

---

## 2. Homepage Layout

Designed with strict chapter-based vertical spacing (`py-24` to `py-32`) and clean, horizontal grid dividers.

```text
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|                                         HERO SECTION (Attention)                                        |
|                                                                                                         |
|       H1: BEAUTY FIRST.                                                                                 |
|           MOTION DRIVEN.                                                                                |
|                                                                                                         |
|       [ Explore Components ]                   [ Copy Install Command: npx absoluteui init ]            |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
|                                         BENTO GRID (Interest)                                           |
|                                                                                                         |
| +------------------------------------+-----------------------------------+----------------------------+ |
| |                                    |                                   |                            | |
| |  [Card 1 - 2x2]                    |  [Card 2 - 1x2]                   |  [Card 3 - 1x2]            | |
| |  Interactive Gravity Force Demo    |  Frame Dynamics Monitor           |  Accent Customizer         | |
| |  (Visual Interaction Focus)        |  (Live Frame Metrics)             |  (Visual Tone Switcher)    | |
| |                                    |                                   |                            | |
| +------------------------------------+-----------------------------------+----------------------------+ |
| |                                    |                                   |                            | |
| |  [Card 4 - 1x1]                    |  [Card 5 - 2x1]                   |                            | |
| |  Design Specification (JSON View)  |  Kinetic Typography Scroll Engine |  (Interlocking layout,     | |
| |                                    |  (Live scroll scrubbing demo)     |   zero dead space)         | |
| +------------------------------------+-----------------------------------+----------------------------+ |
+---------------------------------------------------------------------------------------------------------+
|                                      SHOWCASE AREA (Desire & Action)                                     |
|                                                                                                         |
|   Split-screen pinned panel:                                                                            |
|   - Left: Pinned structural explanation / technical philosophy                                           |
|   - Right: Scrollable list of Tier 1 components in context                                              |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
|                                           FOOTER (Action)                                               |
|                                                                                                         |
|   [ Column 1: Library ]     [ Column 2: Specs ]      [ Column 3: Source ]        [ Bottom: Copyright ]  |
+---------------------------------------------------------------------------------------------------------+
```

### Hero Implementation Specs:
* **H1 container:** `max-w-5xl` to ensure 2 lines.
* **CTAs:** Two high-contrast buttons side-by-side. Primary button is a solid carbon block; secondary button is a code block containing copyable install CLI command.
* **Understated Motion:** Subtle mouse-aware parallax grid lines in the background.

### Bento Grid Implementation Specs:
* Uses Tailwind `grid grid-cols-1 md:grid-cols-4 gap-0 border-t border-l border-subtle grid-flow-dense`.
* Every card has 1px solid borders on the right and bottom (`border-r border-b border-subtle`).
* Card transitions are strictly hover-based scale filters (e.g., image zoom, data row fades).

---

## 3. Component Detail Layout

A split Workspace layout focusing on interactive testing first, followed by documentation.

```text
+---------------------+-----------------------------------------------------------------------------------+
|                     |                                                                                   |
|  [ SEARCH ENGINE ]  |                                 INTERACTIVE SANDBOX                               |
|  TIER 1             |   +---------------------------------------------------------------------------+   |
|  - Gravity Button   |   |                                                                           |   |
|  - Eclipse Card     |   |                             Live Preview Canvas                           |   |
|  - Drift Type       |   |                                                                           |   |
|  - Echo Gallery     |   +---------------------------------------------------------------------------+   |
|  - Gravity Button   |   | Controls: [Theme: Dark/Light]  [Speed: 0.5x/1x/2x]  [Accent: Gold/Ivory] |   |
|  - Eclipse Card     |   +---------------------------------------------------------------------------+   |
|  - Drift Type       |                                                                                   |
|  - Echo Gallery     |  -------------------------------------------------------------------------------  |
|  - Atmosphere BG    |                                                                                   |
|  - Horizon Nav      |                               INSTALLATION & USAGE                                |
|  - Prism Tooltip    |                                                                                   |
|  - Parallax Story   |  [Copy Shell Command]   |   [Copy Component Code]   |   [Copy Tailwind Config]    |
|                     |                                                                                   |
|  TIER 2             |  -------------------------------------------------------------------------------  |
|  - Morph Button     |                                                                                   |
|  - Orbit Button     |                                TECHNICAL DETAILS                                  |
|  - Perspective Card |                                                                                   |
|  - Spotlight Card   |  * Frame Dynamics & Response times                                                |
|                     |  * Accessibility Auditing Matrix (Keyboard maps, ARIA tags)                       |
|  TIER 3             |                                                                                   |
|  - Temporal Type    | +---------------------+-----------------------------------------------------------+
|  - Orbital Nav      | 
|  - Depth Canvas     | 
|                     | 
+---------------------+
```

### Sidebar Implementation Specs:
* **Width:** `260px` | `border-r border-subtle` | Scroll-y container.
* **List:** Small display titles (`font-sans text-xs`) categorized by tier, using hover indicator dots.

### Sandbox Implementation Specs:
* **Preview Canvas:** Centered checkerboard background (`bg-surface` with clean subtle dot grid overlay).
* **Controls Bar:** Flex row toolbar with borders separating each control option. Select menus use custom dropdown lists aligned with Swiss styling.
