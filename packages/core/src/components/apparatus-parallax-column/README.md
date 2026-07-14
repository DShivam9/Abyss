# Apparatus Parallax Column

A split-screen vertical scroll component where the left and right columns scroll in opposite directions. As images traverse the viewport center band, they expand from a cropped scale state into a full unclipped state.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `leftImages` | `string[]` | (Cosmos defaults) | Array of images to display on the left column |
| `rightImages` | `string[]` | (Cosmos defaults) | Array of images to display on the right column |
| `scrollProgress` | `number` | `0` | Normalized scroll progress (0 to 1) |

## Features

- **Counter Scroll Paths**: The left column translates downward while the right column translates upward.
- **Center band reveal**: clip-path opens to `inset(0%)` and scale increases to `1.0` at viewport vertical center.
- **Monospace Controls Panel**: toggle divider and adjust crop percentage and relative scrolling velocities.
