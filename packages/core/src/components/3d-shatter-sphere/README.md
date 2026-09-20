# 3D Shatter Sphere

Interactive 3D geometry gallery mapped across Fibonacci sphere and cuboid shells with inertia drag rotation, cursor proximity repulsion, and explosive radial shatter animations.

## Usage

```tsx
import { ShatterSphere } from "@abyss-ui/core";

<ShatterSphere
  shapeMode="sphere"
  sphereRadius={420}
  shatterForce={1.8}
  cardScale={1.05}
  itemCount={42}
  autoRotateSpeed={0.18}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `shapeMode` | `"sphere" \| "cuboid" \| "cuboid-grid"` | `"sphere"` | Geometry shell structure mapping card placement |
| `sphereRadius` | `number` | `420` | Base radial dimension in pixels |
| `shatterForce` | `number` | `1.8` | Radial impulse velocity multiplier during click explosion |
| `cardScale` | `number` | `1.05` | Individual scale footprint of each image panel |
| `itemCount` | `number` | `42` | Total card count distributed across the spherical Fibonacci lattice |
| `autoRotateSpeed` | `number` | `0.18` | Continuous idle tumble rotation speed |
| `showCenterText` | `boolean` | `true` | Visibility toggle for centered floating typography |
| `disableRebuildOnClick` | `boolean` | `false` | Prevents panels from snapping back together once shattered |
