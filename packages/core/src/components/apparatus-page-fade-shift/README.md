# Apparatus Page Fade Shift

The **Apparatus Page Fade Shift** component handles route and view-level handoffs by combining vertical spatial displacement with smooth opacity fades. Outgoing content ascends out of frame while fading out, while incoming content descends into position from above and fades in.

## Installation

```bash
npm install @abyss-ui/core
```

## Basic Usage

```tsx
import { ApparatusPageFadeShift } from "@abyss-ui/core";

export default function MyPage() {
  return (
    <ApparatusPageFadeShift
      leaveDuration={350}
      enterDuration={400}
      shiftY={20}
    />
  );
}
```

## Props Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `leaveDuration` | `number` | `350` | Outgoing view exit animation duration (ms) |
| `enterDuration` | `number` | `400` | Incoming view entrance animation duration (ms) |
| `shiftY` | `number` | `20` | Vertical offset displacement (px) |
| `easing` | `string` | `"power2.inOut"` | Easing curve for transition motion |
| `autoPlay` | `boolean` | `false` | Automatically loop through views on timer |
| `autoPlayInterval` | `number` | `4000` | Interval duration (ms) for auto-play loop |
