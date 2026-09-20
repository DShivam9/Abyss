# Gravity Cursor

Interactive physics-driven cursor gallery where clicking or hold-dragging stream-spawns image bodies that fall with gravity, bounce elastically on the spatial floor, and dissolve cleanly.

## Usage

```tsx
import { GravityCursor } from "@abyss-ui/core";

<GravityCursor
  gravityMode="normal"
  interactionMode="hold-drag"
  imageSize={140}
  gravity={0.55}
  bounceDamping={0.62}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `gravityMode` | `"normal" \| "zero-gravity" \| "magnetic-repulsor"` | `"normal"` | Physics mode governing movement and forces |
| `interactionMode` | `"hold-drag" \| "cursor-trail"` | `"hold-drag"` | Continuous drag or velocity-based spawn triggering |
| `imageSize` | `number` | `140` | Dimension of spawned visual bodies in pixels |
| `gravity` | `number` | `0.55` | Downward gravitational acceleration per frame |
| `bounceDamping` | `number` | `0.62` | Restitution elasticity coefficient upon floor impact |
| `repelRadius` | `number` | `350` | Radial reach of magnetic repulsion forcefield in pixels |
| `repelForce` | `number` | `9.2` | Repulsion impulse multiplier pushing nearby bodies |
| `zeroGravity` | `boolean` | `false` | Quick toggle for weightless inertial drift |
