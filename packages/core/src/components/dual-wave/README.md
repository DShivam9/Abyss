# Apparatus Dual Wave

Two columns of text names flanking a center image. Names slide horizontally along a sine wave as you scroll, flanking a center image that swaps source to match the active viewport item.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `DualWaveItem[]` | `DEFAULT_ITEMS` | List of items to display containing `id`, `name`, and `imageSrc` |
| `scrollProgress` | `number` | `0` | Normalized scroll progress (0 to 1) |
| `isFullscreen` | `boolean` | `false` | Is full screen mode |
| `className` | `string` | `""` | Additional Tailwind CSS classes |
| `style` | `React.CSSProperties` | `undefined` | Custom component inline style overrides |
