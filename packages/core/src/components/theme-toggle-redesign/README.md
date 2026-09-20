# Theme Toggle Redesign

An architectural redesign of light and dark mode toggling featuring a 3D tactile dial plunge button with circular expanding wave immersion and a physical lamp pull cord with 28-bead Verlet physics.

## Installation

```bash
npm install @abyss-ui/core
```

## Usage

```tsx
import { ThemeToggleRedesign } from "@abyss-ui/core";

export default function Example() {
  return (
    <div className="relative w-full h-[540px] flex items-center justify-center bg-black">
      <ThemeToggleRedesign
        variant="dial"
        enableAudio={true}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `"dial"` \| `"lamp"` | `"dial"` | Visual toggle variant: machined 3D plunge dial or physical hanging lamp cord. |
| `enableAudio` | `boolean` | `true` | Whether acoustic sound effects play on toggle engage and release. |
| `className` | `string` | `""` | Optional CSS class name passed to the container element. |
| `style` | `React.CSSProperties` | `{}` | Optional inline styles passed to the container element. |

## Features

- **Machined 3D Dial**: Tactile plunge button with unhurried 1400ms circular expanding screen wave immersion strictly clipped within the container boundaries.
- **Verlet Hanging Lamp Cord**: Real-time 28-bead physics simulation rendering metallic chain sag, spring tension, and interactive cursor tugging.
- **Volumetric Illumination**: Top-down ambient room floodlight glowing dynamically in light mode.
- **Tactile SFX & Haptics**: Mechanical click audio transients combined with mobile vibration feedback on state change.
