import { ControlConfig } from "../component-registry";

export const CATEGORY_DEFAULTS: Record<string, ControlConfig[]> = {
  scroll: [
    { type: "slider", key: "scrollSpeed", label: "Scroll Speed", default: 1, min: 0.1, max: 3, step: 0.1 },
    { type: "slider", key: "damping", label: "Damping", default: 0.1, min: 0.01, max: 1, step: 0.01 },
    {
      type: "select",
      key: "scrollDirection",
      label: "Scroll Direction",
      default: "vertical",
      options: [
        { label: "Vertical", value: "vertical" },
        { label: "Horizontal", value: "horizontal" }
      ]
    }
  ],
  image: [
    { type: "slider", key: "intensity", label: "Intensity", default: 1, min: 0, max: 2, step: 0.05 },
    { type: "slider", key: "hoverRadius", label: "Hover Radius", default: 150, min: 20, max: 500, step: 10, unit: "px" }
  ],
  geometry: [
    { type: "slider", key: "intensity", label: "Intensity", default: 1, min: 0, max: 2, step: 0.05 },
    { type: "slider", key: "hoverRadius", label: "Hover Radius", default: 150, min: 20, max: 500, step: 10, unit: "px" }
  ],
  gallary: [
    { type: "slider", key: "gapSize", label: "Gap Size", default: 16, min: 0, max: 64, step: 4, unit: "px" },
    { type: "slider", key: "transitionDuration", label: "Transition Duration", default: 500, min: 100, max: 2000, step: 50, unit: "ms" },
    { type: "toggle", key: "autoPlay", label: "Auto Play", default: false }
  ],
  transition: [
    { type: "slider", key: "duration", label: "Duration", default: 800, min: 200, max: 3000, step: 100, unit: "ms" },
    { type: "slider", key: "staggerDelay", label: "Stagger Delay", default: 50, min: 0, max: 500, step: 10, unit: "ms" },
    {
      type: "select",
      key: "easing",
      label: "Easing Preset",
      default: "vessel",
      options: [
        { label: "Vessel Curve", value: "vessel" },
        { label: "Power2 Out", value: "power2.out" },
        { label: "Elastic Out", value: "elastic.out" }
      ]
    }
  ],
  hybrid: [
    { type: "slider", key: "intensity", label: "Intensity", default: 1, min: 0, max: 2, step: 0.05 },
    { type: "slider", key: "hoverRadius", label: "Hover Radius", default: 150, min: 20, max: 500, step: 10, unit: "px" }
  ],
  text: [
    { type: "slider", key: "duration", label: "Duration", default: 800, min: 200, max: 3000, step: 100, unit: "ms" },
    { type: "slider", key: "staggerDelay", label: "Stagger Delay", default: 40, min: 0, max: 300, step: 10, unit: "ms" },
    {
      type: "select",
      key: "splitType",
      label: "Split Mode",
      default: "chars",
      options: [
        { label: "Characters", value: "chars" },
        { label: "Words", value: "words" },
        { label: "Lines", value: "lines" }
      ]
    }
  ]
};

export function getCategoryDefaults(category: string): ControlConfig[] {
  return CATEGORY_DEFAULTS[category] || CATEGORY_DEFAULTS.image;
}
