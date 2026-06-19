# MOTION_GUIDELINES.md

# AbsoluteUI Motion Guidelines

## Purpose

Motion is one of the primary differentiators of AbsoluteUI.

Motion is not decoration.

Motion is not visual noise.

Motion exists to create clarity, immersion, delight, and emotional connection.

Every animation should feel intentional, polished, and premium.

The goal is to create experiences that feel alive without becoming distracting.

Motion is a first-class feature, on equal footing with layout, typography, and color.

---

# Motion Philosophy

Motion should feel:

* Smooth
* Deliberate
* Responsive
* Elegant
* Natural
* Premium

Motion should never feel:

* Chaotic
* Random
* Aggressive
* Distracting
* Excessive

---

# The AbsoluteUI Motion Principle

Every animation must answer:

### Why does this animation exist?

Valid answers:

* Improve clarity
* Guide attention
* Provide feedback
* Improve immersion
* Create delight

Invalid answers:

* Because it looks cool
* Because competitors do it
* Because the page feels empty

---

# Motion Hierarchy

Not all animations deserve equal attention.

---

## Level 1 — Micro Motion

Subtle interactions.

Examples:

* Hover states
* Button presses
* Tooltip reveals
* Cursor interactions

Duration:

150ms – 300ms

Priority:

Highest

These animations appear most frequently.

They must feel flawless.

---

## Level 2 — Interface Motion

UI transitions.

Examples:

* Navigation changes
* Component reveals
* Layout transitions
* Dropdowns

Duration:

250ms – 500ms

Purpose:

Create flow between interface states.

---

## Level 3 — Showcase Motion

Hero sections and premium demonstrations.

Examples:

* Hero reveals
* Large image transitions
* Scroll storytelling
* Signature interactions

Duration:

500ms – 1200ms

Purpose:

Create emotional impact.

Use sparingly.

---

# Motion Timing Standards

## Fast

150ms

Use for:

* Hover effects
* Press states
* Quick feedback

---

## Standard

250ms

Use for:

* Most UI interactions

This should be the default duration.

---

## Premium

400ms

Use for:

* Reveals
* Image transitions
* Card interactions

---

## Showcase

600ms – 1200ms

Use for:

* Hero animations
* Landing page storytelling

---

# Easing Standards

Preferred:

* ease-out
* ease-in-out
* custom premium easing curves

Motion should decelerate naturally.

Avoid robotic movement.

---

# Hover Motion

Hover effects should feel effortless.

Allowed:

* Scale
* Perspective shift
* Subtle rotation
* Spotlight effects
* Cursor response
* Layered movement

Avoid:

* Excessive bouncing
* Large movement distances
* Abrupt transitions

---

# Scroll Motion

Scroll should feel smooth and cinematic.

Allowed:

* Fade reveals
* Parallax
* Layered depth
* Progressive reveals
* Image transitions

Avoid:

* Scroll hijacking
* Forced navigation
* Motion sickness

The user must remain in control.

---

# Scroll-Driven Reveal Standards

Scroll-driven content reveals use GSAP ScrollTrigger with Lenis smooth scrolling.

Rules:

* ScrollTrigger triggers should use `toggleActions: "play none none reverse"`
* Reveal timelines should stagger lines with `power4.out` easing
* Initial states: `opacity: 0, y: 60, skewY: 2`
* Scrub-based animations should use `scrub: true` with `ease: "none"`
* Always call `ScrollTrigger.refresh()` after dynamic layout changes under Lenis

Lenis + ScrollTrigger Interop:

* Lenis wraps `requestAnimationFrame`; ScrollTrigger must not conflict
* Use `Lenis.raf(time)` inside a `requestAnimationFrame` loop
* Duration should be `1.2` with standard decelerated ease

---

# Canvas-Based Ambient Motion

Canvas particle simulations power the Atmosphere section.

Constraints:

* Use vanilla HTML5 `<canvas>`, not React-rendered DOM particles
* Particle count ratio: `Math.floor((width * height) / 25000)` for balanced density
* Particle speeds: `(Math.random() - 0.5) * 0.15` per axis (very slow drift)
* Opacity should oscillate between 0.1 and 0.6
* Particle color: `rgba(245, 242, 235, opacity)` (warm ivory)
* Resize handler must recalculate canvas dimensions
* Always cancel `requestAnimationFrame` on cleanup

Performance Target:

* 60 FPS with up to 200 particles

---

# Cursor Interactions

Cursor interactions are encouraged.

Examples:

* Magnetic buttons
* Cursor followers
* Spotlight effects
* Dynamic reveals

Rules:

* Must remain responsive
* Must not interfere with usability
* Must degrade gracefully on touch devices

---

# Typography Motion

Typography should feel refined.

Allowed:

* Character reveals
* Word reveals
* Mask animations
* Scroll-driven reveals
* Layered typography

Avoid:

* Constant movement
* Distracting loops

Typography should remain readable at all times.

---

# Image Motion

Images should feel immersive.

Allowed:

* Parallax
* Reveal transitions
* Zoom interactions
* Depth effects
* Perspective transformations

Avoid:

* Excessive zoom
* Aggressive movement

Content should remain the focus.

---

# Card Motion

Cards should communicate depth.

Allowed:

* Tilt interactions
* Spotlight effects
* Layer movement
* Hover elevation

Avoid:

* Excessive rotation
* Motion overload

The effect should feel premium, not playful.

---

# Background Motion

Backgrounds should support content.

Allowed:

* Subtle particles
* Ambient gradients
* Noise textures
* Slow parallax
* Atmospheric motion

Avoid:

* Fast moving backgrounds
* Attention stealing effects

The background should never compete with the foreground.

---

# Motion Performance Standards

Target:

* 60 FPS minimum

Preferred:

* GPU accelerated transforms
* Opacity animations
* Transform-based movement

Avoid:

* Frequent layout recalculations
* Expensive DOM updates
* Unoptimized canvas rendering

Beautiful motion must remain performant.

---

# Mobile Motion Standards

Motion should adapt for mobile.

Rules:

* Reduce heavy effects
* Respect battery life
* Maintain responsiveness

Touch interactions should feel native.

---

# Accessibility Standards

Respect:

* prefers-reduced-motion

Required:

* Alternative experiences
* Motion reduction support

Users must never be forced into motion-heavy experiences.

---

# Forbidden Motion

Never use:

* Infinite spinning
* Constant bouncing
* Random shaking
* Flashing effects
* Excessive glow pulsing
* Aggressive zooming
* Attention-seeking loops

These reduce perceived quality.

---

# Motion Approval Checklist

Before publishing:

* Is the motion smooth?
* Is the motion meaningful?
* Does it improve the experience?
* Is it performant?
* Is it accessible?
* Does it feel premium?
* Would it still work without animation?

If any answer is "No", refine the component.

---

# AbsoluteUI Motion Standard

The best animation is the one users feel before they consciously notice it.

Motion should create emotion, not demand attention.
