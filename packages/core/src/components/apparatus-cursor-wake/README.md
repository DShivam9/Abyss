# Apparatus Cursor Wake

A premium, interactive gallery grid where your cursor leaves a trailing wake of visual vibrancy (scale, opacity, and saturation) that slowly decays over time.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `CursorWakeItem[]` | `DEFAULT_ITEMS` | List of items showing images and titles. |
| `activationRadius` | `number` | `220` | Radius threshold (pixels) from pointer to trigger wake. |
| `decayDuration` | `number` | `3000` | Duration (ms) for the wake trail to fade out. |
| `baseScale` | `number` | `0.8` | Resting scale of items when outside of the wake trail. |
| `maxSaturation` | `number` | `1.2` | Maximum saturation boost factor for elements inside the wake. |
