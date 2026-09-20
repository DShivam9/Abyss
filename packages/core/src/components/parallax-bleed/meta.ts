import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
    id: "60",
    label: "Parallax Bleed",
    filename: "components/parallax-bleed/hero.webp",
    desc: "4 full-bleed image sections stacked sequentially with deep internal parallax bounds, virtual camera momentum, and weighted layer micro-latency.",
    slug: "parallax-bleed",
    category: "scroll",
    subtype: "full-bleed",
    tags: ["GSAP", "ScrollTrigger", "Parallax", "Full Bleed", "Cinematic", "Physics"],
    previewType: "scroll",
    overview: "Sequential full-bleed editorial sections that glide with internal parallax displacement, weighted layer inertia, and progressive depth-of-field edge vignettes.",
    techStack: ["React", "GSAP", "Tailwind CSS"],
    useCases: [
      "Immersive narrative storytelling sections for agency portfolios and design studio showcases.",
      "High-impact editorial features introducing flagship hardware or physical design collections.",
      "Chapter-based product manifestos and campaign journeys structured across full-bleed viewports."
    ],
    engineeringNotes: [
      "Decouples scroll input from visual transforms using an inertial momentum accumulator loop.",
      "Executes sub-pixel parallax translation directly on isolated GPU compositing layers.",
      "Calculates dynamic optical edge falloff using configurable progressive backdrop filters."
    ],
    controls: [
      {
        type: "slider",
        key: "parallaxIntensity",
        label: "Internal Parallax",
        default: 100,
        min: 10,
        max: 150,
        step: 5,
        unit: "%",
        description: "Controls the maximum percentage of internal image shift relative to scroll movement."
      },
      {
        type: "slider",
        key: "blurDepth",
        label: "Progressive Blur",
        default: 280,
        min: 120,
        max: 400,
        step: 20,
        unit: "px",
        description: "Adjusts the pixel spread of the progressive optical edge blur between sections."
      },
      {
        type: "slider",
        key: "imageBrightness",
        label: "Image Brightness",
        default: 90,
        min: 50,
        max: 120,
        step: 5,
        unit: "%",
        description: "Sets the baseline image brightness to balance visual contrast against white typography."
      },
      {
        type: "select",
        key: "blurVariant",
        label: "Edge Falloff",
        default: "pure",
        description: "Switches the edge transition filter between pure blur, refractive glass, liquid caustic, CRT scanlines, and thermal haze.",
        options: [
          { label: "Pure Blur", value: "pure" },
          { label: "Refractive Glass", value: "refractive" },
          { label: "Liquid Caustic", value: "liquid" },
          { label: "Line Glass (CRT)", value: "crt" },
          { label: "Thermal Haze", value: "thermal" }
        ]
      }
    ]
  };
