import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "44",
  label: "Twin Wave",
  filename: "components/dual-wave/hero.webp",
  desc: "Two columns of text names gliding vertically along a wave curve, flanking a center photo that updates as items cross the screen equator.",
  slug: "dual-wave",
  category: "scroll",
  subtype: "index",
  tags: ["Scroll Wave", "Twin Columns", "Editorial Index", "Typography", "Framer Motion"],
  previewType: "scroll",
  overview: "Two columns of text names wrap around a center photo. Scrolling glides the names vertically along a smooth wave curve, tilting and softening as they travel. Whichever name crosses the center line instantly updates the photo.",
  techStack: ["React", "Framer Motion", "Lenis"],
  useCases: [
    "Team rosters and company directories with instant photo previews.",
    "Film and production call sheets pairing crew member rosters with on-set still photography.",
    "Music tracklists and festival lineups linking artist names to photos."
  ],
  engineeringNotes: [
    "The two text columns run in opposite directions with subtle counter-lag to create natural visual balance.",
    "Each name calculates its horizontal curve, tilt angle, and blur based on how close it is to the center.",
    "Items wrap continuously using modulo math, allowing the list to loop infinitely without duplicate DOM elements.",
    "The center photo applies a subtle velocity squeeze and cursor drift during quick scroll movements.",
    "Supports two wave shapes: cylindrical barrel curve and horizon perspective."
  ],
  controls: [
    {
      type: "select",
      key: "wavePattern",
      label: "Wave Pattern",
      default: "barrel",
      description: "Switches between cylindrical barrel curve and horizon perspective.",
      options: [
        { label: "Barrel", value: "barrel" },
        { label: "Horizon", value: "horizon" }
      ]
    },
    {
      type: "slider",
      key: "scrollDamping",
      label: "Scroll Damping",
      default: 0.08,
      min: 0.01,
      max: 0.30,
      step: 0.005,
      description: "Controls how smoothly the scroll glides to a stop."
    },
    {
      type: "slider",
      key: "spacing",
      label: "Text Spacing",
      default: 72,
      min: 35,
      max: 150,
      step: 1,
      unit: "px",
      description: "Vertical spacing between text items in each column."
    },
    {
      type: "slider",
      key: "maxBlur",
      label: "Progressive Blur",
      default: 2.5,
      min: 0,
      max: 10,
      step: 0.1,
      unit: "px",
      description: "Maximum blur applied to names as they move toward the top and bottom edges."
    },
    {
      type: "slider",
      key: "amplitude",
      label: "Wave Amplitude",
      default: 55,
      min: 10,
      max: 200,
      step: 1,
      unit: "px",
      description: "How far the wave pushes text names horizontally across the screen."
    },
    {
      type: "slider",
      key: "maxRotation",
      label: "Tilt Angle",
      default: 7.0,
      min: 0,
      max: 30,
      step: 0.1,
      unit: "°",
      description: "Maximum tilt angle applied to names as they curve along the wave."
    }
  ]
};
