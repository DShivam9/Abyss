# Orbit Ring Gallery

Scroll to revolve through an immersive 3D ring of images, with the active hero image scaling dynamically at the forefront.

## Tech Stack
- React Three Fiber
- Three.js
- GSAP (ScrollTrigger)
- Framer Motion (micro-interactions)

## Usage

```tsx
import { OrbitRingGallery } from '@absolute-ui/core';

const items = [
  { id: 1, image: '/assets/1.jpg', title: 'Cyberpunk City' },
  // ...
];

export default function App() {
  return (
    <div style={{ height: '300vh' }}>
      <OrbitRingGallery items={items} />
    </div>
  );
}
```

## Lifecycle States
1. **Idle**: Slow, ambient micro-rotation of the ring (0.5deg/s) on the Y axis.
2. **Discovery**: As scroll begins, the ring accelerates into position, bringing the first item forward.
3. **Build-Up**: Scroll scrubs the Y rotation of the entire group. Items approaching front scale up and glow.
4. **Peak**: Active item hits front-center: max scale, glassmorphic glow, and parallax hover active.
5. **Recovery**: Scroll stops; ring easing settles. Glow stabilizes and text fades in.
