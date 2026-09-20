import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
    id: "74",
    label: "Hover Media Stream",
    filename: "components/hover-media-stream/hero.webp",
    desc: "Kinetic tactile typography stream with Moiré fine-line interference baseline, alternating aperture unroll video stages, and frame-synchronized ambient backlighting.",
    slug: "hover-media-stream",
    category: "text",
    subtype: "stream",
    tags: ["Typography", "Hover Stream", "Video", "Moiré Baseline", "GSAP", "120fps"],
    previewType: "text",
    overview: "An editorial typography stream that expands video apertures and moiré interference baselines on hover, synchronized with ambient backdrop glow and tactile audio feedback.",
    techStack: ["React", "GSAP", "Tailwind CSS"],
    useCases: [
      "Interactive agency index pages previewing video case studies on typography hover.",
      "Portfolio project directories revealing embedded media reels and atmospheric ambient lighting.",
      "Editorial film and production studio rosters previewing teaser clips on title hover."
    ],
    engineeringNotes: [
      "Coordinates dual-stage aperture expansion with CSS clip-path and sub-pixel GSAP tweens.",
      "Calculates procedural moiré baseline interference lines using alternating high-frequency spans.",
      "Generates synthesized tactile detent audio ticks on pointer enter using Web Audio API oscillators.",
      "Syncs full-screen ambient backdrops with active row media for immersive color bleeding."
    ],
    controls: [
      {
        type: "slider",
        key: "backdropBlur",
        label: "Backdrop Blur",
        default: 80,
        min: 20,
        max: 150,
        step: 5,
        unit: "px",
        description: "Adjusts the pixel blur radius applied to the ambient background media."
      },
      {
        type: "slider",
        key: "ambientBrightness",
        label: "Ambient Brightness",
        default: 0.40,
        min: 0.05,
        max: 0.8,
        step: 0.01,
        description: "Sets the maximum opacity of the frame-synchronized ambient backlight."
      },
      {
        type: "slider",
        key: "lineDuration",
        label: "Line Speed",
        default: 1.25,
        min: 0.4,
        max: 2.5,
        step: 0.05,
        unit: "s",
        description: "Controls the animation duration for the expanding baseline and moiré strands."
      },
      {
        type: "slider",
        key: "fontSize",
        label: "Font Size",
        default: 62,
        min: 28,
        max: 96,
        step: 2,
        unit: "px",
        description: "Sets the base typography font size for the interactive title stream."
      }
    ]
  };
