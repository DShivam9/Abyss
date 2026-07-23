# Apparatus Focus Ring

Images arranged in a 2D elliptical path. The ring rotates via horizontal dragging, wheel, or arrow keys, bringing the active image to full scale, full opacity, and sharp focus at center stage.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `FocusRingItem[]` | `DEFAULT_ITEMS` | List of items to display containing `id`, `name`, and `imageSrc` |
| `sensitivity` | `number` | `0.005` | Drag rotation input sensitivity multiplier |
| `friction` | `number` | `0.95` | Momentum kinetic friction decay coefficient (0.9 to 0.99) |
| `focusPosition` | `"top" \| "bottom"` | `"bottom"` | Spot on the ellipse where the active item comes into focus |
| `scrollProgress` | `number` | `undefined` | Optional external scroll progress override |
| `className` | `string` | `""` | Additional CSS/Tailwind classes |
| `style` | `React.CSSProperties` | `undefined` | Inline style overrides |
