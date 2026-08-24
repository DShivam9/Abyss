# ABYSS — COMPONENT DESIGN & MOTION STANDARDS

**Version:** 1.0.0
**Status:** Active — Read before designing or building any component

---

> This document teaches how to think about designing Abyss components.
> It is not about code structure. It is not about which library to use.
> It is about what makes something feel alive, authored, and worth sharing.

---

## TABLE OF CONTENTS

1. [The Abyss Test](#1-the-abyss-test)
2. [Design Before Code](#2-design-before-code)
3. [Physical Metaphor](#3-physical-metaphor)
4. [The Five Layers of a Living Component](#4-the-five-layers-of-a-living-component)
5. [Composition, Not Decoration](#5-composition-not-decoration)
6. [Typography Inside Components](#6-typography-inside-components)
7. [Color Inside Components](#7-color-inside-components)
8. [Motion Language](#8-motion-language)
9. [Interaction Design](#9-interaction-design)
10. [The Idle State](#10-the-idle-state)
11. [Entrance & Exit Choreography](#11-entrance--exit-choreography)
12. [Sound as Texture](#12-sound-as-texture)
13. [Asset Treatment](#13-asset-treatment)
14. [Common Failures](#14-common-failures)
15. [The Final Gut Check](#15-the-final-gut-check)

---

## 1. THE ABYSS TEST

Before designing anything, ask yourself one question:

**Would someone screenshot this and share it?**

Not because it has pretty colors. Not because the code is clean. Because the interaction made them feel something — surprise, curiosity, satisfaction, delight.

An Abyss component isn't a styled wrapper. It's an experience in a box.

If someone could swap your component for a CSS-only alternative and nobody would notice, the component has failed. The interaction must be structural — remove the motion, and the component ceases to function as intended.

---

## 2. DESIGN BEFORE CODE

Every Abyss component should be designed before it is coded. "Designed" does not mean opening Figma. It means answering five questions on paper, in your head, or out loud before touching an editor:

1. **What is this?** — One sentence. "A tracklist that scrolls like a vinyl record, where hovering a track tilts the album art." Not "a list with animations."

2. **What does it feel like to use?** — Name the sensation. "Flipping through records at a store." "Peeling a sticker." "Dragging a magnet across a surface." If you can't name a sensation, the component has no identity yet.

3. **What is the single moment?** — Every great component has one moment that makes people lean in. The instant an image warps. The frame when text fractures. The exact point where a scroll threshold trips and everything transforms. Identify that moment before building anything else.

4. **What is the physical material?** — Paper, glass, liquid, metal, fabric, smoke, rubber, magnetic tape, light, ink. Every visual surface in the component should feel like it's made of something. If it feels like "divs on a screen," the design isn't done.

5. **What does it do when nobody is touching it?** — The idle state is design. A component that sits dead until hovered feels like software. A component that breathes, drifts, pulses, or settles feels like a living object.

Only start coding after all five answers feel clear and inevitable.

---

## 3. PHYSICAL METAPHOR

This is the single most important principle in Abyss design.

Every component must be governed by one coherent physical metaphor. The metaphor determines how everything moves, responds, and rests.

### How to choose a metaphor

Ask: "If this interface existed as a real physical object, how would it behave?"

| Metaphor | Everything... | Example behaviors |
|---|---|---|
| Paper | folds, creases, tears, peels | Accordion folds, page turns, origami collapse |
| Liquid | flows, ripples, pools, drips | Cursor distortion, fluid scroll, wave propagation |
| Glass | refracts, reflects, shatters, frosts | Prismatic light splits, frosted reveal, shatter burst |
| Metal | stamps, engraves, conducts, resonates | Intaglio press, emboss, hydraulic motion |
| Magnetic | attracts, repels, snaps, aligns | Cursor gravity, particle clustering, snap-to-grid |
| Mechanical | clicks, rotates, gears, ratchets | Detent scrolling, clock-hand motion, typewriter |
| Photographic | focuses, exposes, develops, bleaches | Rack focus, exposure burn, darkroom reveal |
| Wind | drifts, flutters, gusts, settles | Particle systems, flag cloth, drift galleries |
| Gravity | falls, bounces, pendulums, settles | Drop animations, inertial scroll, rubber-band |
| Ink | bleeds, absorbs, dries, spreads | Watercolor fills, blot expansion, stain reveal |

### The rule of one

Never mix unrelated metaphors inside the same interaction.

A component can be "liquid metal" (two related concepts reinforcing each other). A component cannot be "liquid that also folds like paper" (two unrelated systems fighting each other).

If you're struggling with mixed metaphors, the component concept isn't clear enough yet. Step back.

---

## 4. THE FIVE LAYERS OF A LIVING COMPONENT

A fully realized Abyss component has up to five layers. Not every component needs all five — but knowing the layers prevents building flat, dead interactions.

### Layer 1 — Foundation (always present)
The static composition. Layout, spacing, proportion, color, typography. If you muted all animation and froze the component in one frame, this is what the viewer sees. It must be beautiful on its own.

**Test**: Take a screenshot with all motion disabled. Does it look designed, or does it look like a div?

### Layer 2 — Idle Motion (when appropriate)
Subtle ambient animation that plays when nobody is interacting. A slow drift, a quiet pulse, a lazy rotation. This is what makes something feel alive vs. static.

- Should be so subtle that the viewer can't tell if it's animated or if their eyes are playing tricks
- Never draws attention to itself
- First thing to disable for `prefers-reduced-motion`

### Layer 3 — Response Motion (almost always present)
How the component reacts to user input: hover, click, scroll, drag, cursor position. This is the core of the interaction.

- Must feel immediate — latency here kills the entire illusion
- Must have a physical quality (inertia, friction, spring, overshoot)
- Must feel proportional to input force (fast drag = fast response, gentle hover = gentle response)

### Layer 4 — State Transitions (when applicable)
Major visual changes: track switching, image swapping, mode changes, expanded/collapsed states.

- Never instant — always interpolated
- Should follow the physical metaphor (a paper component folds between states, a liquid component flows between states)
- The previous state must visually contribute to the next (no cut-to-black and replace)

### Layer 5 — Micro-Details (what separates good from great)
Shadow reactions, grain overlays, edge highlights, parallax depth, secondary element choreography, audio feedback.

- These are the things people notice on the second or third look
- They signal that every pixel was considered
- They turn a "cool effect" into something that feels authored

---

## 5. COMPOSITION, NOT DECORATION

Do not animate individual elements. Animate the composition.

When a user hovers a track in `tracklist-gallery`, they don't see "the text moved" and "the image scaled" and "the background changed." They see a single unified response — the entire composition reshapes around the active track.

### How to think compositionally

Instead of: "The title slides up 20px on hover"
Think: "The active row claims space. Inactive rows yield. The background color shifts to match the active track's palette. The album art advances. The audio playhead moves."

Every element in the composition has a relationship to every other element. When one changes, the others adjust — not independently, but as parts of one connected system.

### The orchestra test

If your component's animations were an orchestra:
- **Bad**: Every instrument plays its own tune at its own time
- **Good**: There's a conductor. Elements enter in sequence, with intentional stagger, toward a resolved state. Some lead, some support, some wait.

---

## 6. TYPOGRAPHY INSIDE COMPONENTS

Components are exempt from the website design system fonts. Each component picks whatever typeface serves its identity.

### Principles

**Type is material, not label.** In an Abyss component, text is not just "the words" — it's a visual element that has weight, texture, and motion behavior. Text can warp, shear, scramble, reveal, blur, stagger, and respond to physics.

**Size creates hierarchy in one glance.** The primary text element should be dramatically larger than everything secondary. Not 20% larger — 3x to 5x larger. Abyss components are not dashboards. They are posters. Think editorial scale.

**Tracking (letter-spacing) is a design tool.**
- Tight tracking (-0.04em to -0.02em) on large display text = editorial, cinematic, premium
- Wide tracking (0.06em to 0.12em) on small uppercase labels = technical, structured, mechanical

**Weight contrast matters.** Pair a 700 or 800 weight headline with a 300 or 400 weight sub-element. The contrast creates visual tension that makes the composition feel alive.

### Banned approaches

- Using one font size for everything (flat hierarchy)
- Browser-default font-size on any visible text (always specify)
- Text that exists purely to label — if the text doesn't contribute to the visual composition, it might not need to be there

---

## 7. COLOR INSIDE COMPONENTS

Components are exempt from the website color palette. Each component owns its own color world.

### Principles

**Start from the content.** If the component shows images, derive the palette from the image content. `tracklist-gallery` shifts its entire background color to match the active album art. This creates coherence between content and container.

**Dark by default, accent by intention.** Most Abyss components live on dark backgrounds (not because of a rule, but because dark surfaces let light, color, and motion read more clearly). Accent colors should arrive with the interaction, not be present at rest.

**Limit your palette to 3-4 values per state.** A surface color, a text color, one accent, and one neutral. More than that creates visual noise that competes with the motion.

**Color transitions are animation.** Never snap a color from A to B. Crossfade, blend, or morph. Color change should feel like light shifting, not a CSS swap.

### What to avoid

- Rainbow gradients or excessive hue variety in one component
- Using color as the primary design language (motion is primary, color supports it)
- Bright, saturated backgrounds that fight with the user's own content when they swap assets

---

## 8. MOTION LANGUAGE

### Motion has memory

Nothing should suddenly appear. Nothing should suddenly disappear. Nothing should teleport.

Every state evolves naturally from the previous one. The previous frame should always contribute to the next frame.

Prefer these transitions:
- Reconstruction, transformation, folding, revealing, stretching, morphing, flowing

Avoid these:
- Fade, pop, replace, swap, instant opacity changes

The eye should always know where something came from and where it went.

### Motion creates hierarchy

If every element moves equally, nothing is important.

The primary subject always receives the strongest motion. Secondary elements support it with lighter, delayed responses. Background elements react quietly or not at all.

The viewer's eye should naturally arrive at the intended focal point without conscious effort.

### Motion breathes

Silence is part of motion. Stillness creates contrast.

Do not animate everything simultaneously. Allow compositions to rest. Moments without movement make future movement significantly more powerful.

A page that never stops moving feels nervous.
A page that knows when to be still feels confident.

### Physics over timing

Duration-based animation (0.4 seconds) feels mechanical.
Spring-based animation (stiffness, damping, mass) feels alive.

Physics-based systems also handle interruptions naturally. If the user reverses direction mid-animation, a spring responds correctly. A fixed-duration tween fights back.

Use springs and physics for anything interactive. Use timed sequences only for choreographed entrances where the user isn't controlling the timing.

### The inevitability test

> The highest compliment is not "Nice animation."
> The highest compliment is "That couldn't have moved any other way."

Every easing, every delay, every overshoot, every deformation should feel like the only possible choice for that moment. If five different animations would all "work fine," the motion hasn't been designed yet — it's been decorated.

---

## 9. INTERACTION DESIGN

### Input should feel proportional

- Fast scroll → fast response
- Slow hover → gentle, gradual reveal
- Hard click → sharp, immediate impact (with decay)
- Light drag → fluid, weighted follow

The speed and force of the user's input should directly map to the intensity of the visual response. This creates the illusion of physical contact.

### Hover is arrival, not toggle

A hover state is not a binary switch (off → on). It's an arrival. The element should gradually awaken as the cursor approaches, intensify as the cursor settles, and gently release as the cursor departs.

Think of hovering as proximity, not presence.

### Cursor is a character

In cursor-reactive components, the cursor is not a tool — it is an actor in the scene. The cursor position should influence:
- Light direction (as if the cursor is a flashlight)
- Distortion epicenter (as if the cursor is pressing against a membrane)
- Parallax depth (as if the cursor is a camera moving through space)
- Gravity well (as if the cursor is pulling objects toward it)

### Click is impact

A click should feel like it has physical consequence. Not just "something was activated" — but "force was applied."

Good click responses:
- Hydraulic stamp compression (squash → bounce back)
- Ripple propagation from click point
- Shatter or fracture from impact center
- Material deformation that slowly relaxes

### Scroll is travel

Scroll is not "make things move as I scroll." Scroll is movement through space.

The user should feel like they are traveling through the component — revealing layers, advancing scenes, passing landmarks. Scroll position is a spatial coordinate, not a progress bar.

---

## 10. THE IDLE STATE

The idle state is not "off." The idle state is "breathing."

A component that sits perfectly still until interacted with feels like software waiting for input. A component that has a quiet, ambient life of its own feels like a living object that you happen to be looking at.

### Good idle behaviors

- **Slow drift**: Elements move at 0.1-0.5px per frame in a direction. Barely perceptible. Creates the sense that time is passing.
- **Gentle pulse**: Opacity or scale oscillates by 1-3% on a slow sin wave (4-8 second period). Mimics breathing.
- **Parallax settle**: After the user stops moving, elements gently settle back to rest with overshoot — like a pendulum finding center.
- **Grain or noise shift**: A subtle grain texture shifts by 1-2px per frame. Adds organic texture to digital surfaces.

### Bad idle behaviors

- Constant rotation or spinning (screensaver energy)
- Pulsing glow effects (gaming aesthetic)
- Elements bouncing in loops (cartoon energy)
- Anything that draws conscious attention to itself

The test: if a user watches the idle state and consciously thinks "oh, it's animating," the idle motion is too strong. Turn it down until it becomes subliminal.

---

## 11. ENTRANCE & EXIT CHOREOGRAPHY

### Entrance is a reveal, not a load

When a component first appears, it should feel like something being uncovered — not something being downloaded. The elements are already there, hidden, waiting. The entrance reveals them.

### Stagger creates narrative

When multiple elements enter, stagger them. But stagger with purpose:

- **Hierarchical stagger**: Most important element first, supporting elements follow
- **Spatial stagger**: Elements enter based on their position (top-to-bottom, center-out, edge-in)
- **Narrative stagger**: Elements enter in the order the viewer should read them

Random stagger (every element at an arbitrary delay) creates chaos, not choreography.

### Stagger timing

- Between consecutive items: 40-80ms for fast reveals, 100-200ms for dramatic reveals
- Total stagger spread should never exceed 600ms — after that, the user is waiting, not watching
- The first element should begin moving within 100ms of trigger

### Exit is the reverse, but faster

Exits should broadly mirror entrances but at 60-70% of the duration. Slow exits feel sluggish. The user has already decided to leave — respect that.

---

## 12. SOUND AS TEXTURE

Sound is optional, but when used, it transforms a visual interaction into a tactile one.

### Principles

- Sound is a texture, not a notification. It should feel like the physical consequence of the interaction — the click of a mechanism, the whisper of paper, the tap of a detent.
- Duration: under 10ms for micro-sounds. These are percussive artifacts, not melodies.
- Volume: barely audible. If the user has to lower their volume, the sound is too loud.
- Synthesis over samples: generate sounds programmatically (Web Audio API oscillators + filters) rather than loading audio files. This keeps them lightweight and tunable.
- Always gated behind user interaction (pointer/keyboard event) to satisfy browser autoplay policy.
- Always respect a user preference to disable (`enableAudio` prop).

### When NOT to use sound

- On scroll (too frequent, becomes annoying)
- On every hover (same)
- On page load or entrance animations (unsolicited)
- When the component already has meaningful audio content (tracklist-gallery has music — adding hover sounds would compete)

---

## 13. ASSET TREATMENT

Assets (images, video, text) are what the user brings to the component. The component's job is to make those assets feel more interesting than they would on their own.

### The transformation principle

A user drops in a portrait photo. In a regular `<img>` tag, it's just a photo. Inside an Abyss component, that same photo:
- Warps when hovered
- Has parallax depth
- Reacts to cursor position
- Transitions with a material-appropriate animation (dissolve, fracture, morph, peel)
- Sits inside a composition that gives it context and drama

The component adds **meaning** to the asset. The asset alone is content. The component turns it into an experience.

### Default demo assets

Every component ships with curated demo assets that showcase the component at its best. These are not placeholder images — they are chosen to demonstrate the full range of the interaction.

Good demo assets:
- High-contrast imagery (reads well with effects)
- Varied content (portraits, landscapes, abstract, type)
- Intentional palette (cohesive color story across the set)

Bad demo assets:
- Stock photos with watermarks
- Low-resolution images
- All images from the same source with identical palette
- Lorem ipsum text (use real words, even if fictional)

---

## 14. COMMON FAILURES

These are patterns that repeatedly produce components that feel generic, unfinished, or templated. Avoid all of them.

| Failure | What it looks like | The fix |
|---|---|---|
| **Motion without metaphor** | Things move, but there's no coherent physical logic | Choose one physical metaphor. Commit to it completely |
| **Flat hierarchy** | Everything is the same size, weight, and opacity | Create dramatic contrast: one huge element, rest supporting |
| **Dead idle** | Component sits frozen until hover | Add layer 2 (idle motion) — a quiet drift, pulse, or settle |
| **Binary hover** | Instant toggle between two states | Treat hover as arrival. Gradual transition in, proportional to cursor speed |
| **Decoration motion** | Elements animate but removing the animation changes nothing | Motion must be structural. If you can delete it, you should |
| **Cut transitions** | States swap instantly (opacity 0 → 1) | Interpolate. Morph. Crossfade. The previous frame must feed the next |
| **Tutorial aesthetic** | Looks like it was built by following a tutorial step by step | Find the one detail that makes this YOUR version. Change the metaphor, the rhythm, the response curve |
| **Overcooked motion** | Everything animates aggressively, all the time | Reduce. The most confident design is the one that knows when to be still |
| **Ignoring typography** | Text is just labels, not visual design | Text is material. Give it weight, scale, tracking, and its own motion behavior |
| **Ignoring color** | Using arbitrary or default colors | Derive palette from content. Limit to 3-4 values. Let color shift with state |

---

## 15. THE FINAL GUT CHECK

Before calling any component done, answer every one of these:

- [ ] **Screenshot test** — If I screenshot this right now, would someone share it?
- [ ] **Metaphor test** — Can I name the physical metaphor in one word?
- [ ] **Single moment test** — Is there one frame where someone would lean in?
- [ ] **Material test** — Does every surface feel like it's made of something?
- [ ] **Idle test** — Does it breathe when nobody is touching it?
- [ ] **Response test** — Does it react proportionally to input force?
- [ ] **Memory test** — Does every state transition evolve from the previous state?
- [ ] **Hierarchy test** — Is there one element that's clearly the most important?
- [ ] **Inevitability test** — Could the motion have been different, or does it feel like the only possible choice?
- [ ] **Subtraction test** — If I remove one animation, does the component lose something essential?

If any answer is "no," the component isn't done. It might work. It might be pretty. But it's not Abyss yet.

---

*Product definition → `pdr.md` · Website design system → `design.md` · Technical stack → `tdr.md` · Asset rules → `asset-conventions.md` · Component descriptions → `COMPONENT_DESCRIPTION_GUIDE.md`*
