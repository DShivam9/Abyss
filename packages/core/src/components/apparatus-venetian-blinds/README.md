# Apparatus Venetian Blinds

A high-fidelity image gallery transition where horizontal slats rotate 180 degrees in a staggered cascade to reveal the next image.

## Tech Stack
- React
- GSAP

## Usage

```tsx
import { ApparatusVenetianBlinds } from '@abyss-ui/core';

const images = [
  '/assets/1.jpg',
  '/assets/2.jpg',
  '/assets/3.jpg',
];

export default function App() {
  return (
    <div className="w-[800px] h-[500px]">
      <ApparatusVenetianBlinds images={images} slatCount={12} />
    </div>
  );
}
```

## Lifecycle States
1. **Idle**: Subtle 3D tilting on mouse movement and breathing opacity fluctuation.
2. **Discovery**: Mouse hover causes the active slats to slightly lean (3D shadow tilt) indicating rotatability.
3. **Build-Up**: Press/click initiates the 180-degree slat flip sequence.
4. **Peak**: Mid-rotation (90 degrees) light streak sweep and vertical split.
5. **Recovery**: Springs settle at 180 degrees (new image fully revealed) with velocity decay.
