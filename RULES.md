# Absolute UI — Rules

---

# Core Philosophy

Absolute UI is image-first. The image is the experience.

Every decision should make images feel more alive, more immersive, more interactive.

The website is the product right now. It proves the standard before any component ships.

---

# Rule 01 — Never Code Blindly

Never immediately start coding.

Always:

- Understand the desired image experience
- Understand the narrative flow
- Understand constraints
- Clarify ambiguity

Ask questions first when requirements are incomplete. Discussion comes before implementation.

---

# Rule 02 — Architecture Before Code

Follow:

Research → Discussion → Planning → Implementation

Do not jump directly into development.

---

# Rule 03 — Image-First Everything

Every section, every component, every interaction centers on the image.

- The image is not background — it is foreground
- Images react to scroll, cursor, viewport, and interaction
- Layouts serve images, not the other way around
- Image quality is non-negotiable

If an element doesn't enhance the image experience, question its existence.

---

# Rule 04 — No Scroll Slop

The biggest enemy is mindless scrolling through section after section with no narrative purpose.

- Every scroll position must reveal something meaningful
- Use GSAP ScrollTrigger for deliberate pacing (pinning, scrubbing, staggered reveals)
- The website has a cinematic emotional arc
- If a section doesn't earn its place in the narrative, remove it

---

# Rule 05 — Framer Motion & GSAP Are Non-Negotiable

These are the twin animation engines. They are the soul of Absolute UI.

- **No static sections.** Every section must feel alive through intentional motion.
- **Cinematic, not playful.** Smooth, controlled transitions. Luxurious deceleration. Clean micro-interactions. No bouncy springs. No physics simulations.
- **Scroll-driven storytelling.** GSAP ScrollTrigger + Lenis for narrative pacing.
- **Cursor-aware interactions.** Image layers respond to mouse position. Spotlight effects. Parallax depth.

---

# Rule 06 — Quality Over Speed

Never sacrifice quality for speed.

Prioritize:

- Better image experiences
- Better motion quality
- Better narrative flow
- Better performance
- Better accessibility

---

# Rule 07 — Continuous Improvement

Every feature should be reviewed after completion.

Ask:

- Does the image feel more immersive?
- Does the motion feel more cinematic?
- Is the narrative flow stronger?
- Can performance improve?
- Can accessibility improve?

The first version is rarely the final version.

---

# Rule 08 — Challenge Weak Decisions

Do not blindly agree.

If a proposed solution creates:

- Scroll slop
- Generic, template-like output
- Motion without purpose
- Visual noise competing with images
- Performance problems
- Accessibility issues

Provide alternatives.

---

# Rule 09 — Clean, Minimalistic, Immersive

The overall vibe:

- Clean surfaces
- Generous whitespace
- Deliberate spacing
- Immersive interactions
- Aesthetic restraint
- Awwwards-level execution

Not noisy. Not maximalist. Not generic. Not template-like.

---

# Rule 10 — No Trend Chasing

Avoid:

- Excessive glassmorphism
- Neon glow effects
- Random gradients
- Design fads
- Rainbow / gaming aesthetics
- Over-the-top interactive bloat

Build timeless, clean, immersive experiences.

---

# Rule 11 — Accessibility Required

Every page and interaction must support:

- Keyboard navigation
- Visible focus states
- Semantic HTML
- Screen readers
- `prefers-reduced-motion`

Accessibility is mandatory.

---

# Rule 12 — Production-Ready Standard

The website must:

- Be responsive across all screen sizes
- Perform smoothly (60 FPS)
- Load quickly (Lighthouse 90+)
- Use warm light mode only (see `docs/DESIGN.md` — no dark mode)
- Work on mobile with graceful interaction degradation

No demo-only sections. Everything ships production-quality.

---

# Rule 13 — The Website IS The Product

The website is not documentation. Not a landing page. Not a catalog.

The website demonstrates that we can build experiences at a level nobody else is offering. Every scroll, every hover, every image interaction must prove the standard.

---

# Rule 14 — Never Backtrack On Rejected Concepts

Once a concept, design pattern, or visual element has been rejected, it is permanently retired.

- No backtracking. No re-skinning rejected ideas.
- Always innovate with fresh, unique approaches.
- If something was rejected, there was a reason. Move forward.

---

# Rule 15 — Process Visual Feedback (Agentation)

When the user provides structured visual feedback generated via the Agentation toolbar:
- Use the CSS selectors, DOM locations, file paths, and coordinates provided in the feedback to locate the exact component and styles in the codebase.
- Read the user's specific comments attached to each annotation to guide your design adjustments.
- Prioritize fixing visual inconsistencies, alignment issues, or interactive polish highlighted in their feedback.

---

# Rule 16 — Single Clean Project Structure

This is a single Next.js project. Not a monorepo. Not a Turborepo workspace.

Keep the folder structure flat and simple. Complexity comes from the experience, not the architecture.

---

# Rule 17 — Current Reality

This is a solo founder project. No team. No budget. No deadline.

This is a strength:

- No compromise on quality for stakeholder timelines
- No design-by-committee
- Every decision serves the vision directly

Build one deliberate step at a time.

---

# Final Rule

The website should feel like an Awwwards submission. If it feels like a template, a generic SaaS landing page, or scroll slop — it has failed.

Every contribution should make Absolute UI feel more immersive, more cinematic, and more unforgettable.
