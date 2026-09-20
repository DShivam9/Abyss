import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
    id: "65",
    label: "Ripple Scramble",
    filename: "components/ripple-scramble/hero.webp",
    desc: "Interactive multi-column typography where clicks trigger a radial shockwave, scrambling text into glyphs before resolving with crisp focus.",
    slug: "ripple-scramble",
    category: "text",
    subtype: "text-wave",
    tags: ["Typography", "Math Glyphs", "Wave Energy", "Focus Pull", "Editorial"],
    previewType: "text",
    overview: "Clicking anywhere on the canvas propels an expanding circular shockwave across the typographic grid. Characters caught in the wake scramble into high-contrast glyphs, lift vertically, and settle back into place.",
    techStack: ["React", "Canvas 2D", "TypeScript"],
    useCases: [
      "Interactive agency about pages and manifestos that reward clicks with fluid typographic ripples.",
      "Hero backgrounds for developer tools, cryptography platforms, and high-tech product launches.",
      "Creative 404 error screens and brand statement pages that turn static text into an interactive playground."
    ],
    engineeringNotes: [
      "Renders thousands of characters on an offscreen Canvas 2D buffer with sub-pixel coordinate tracking.",
      "Radial distance fields calculate wave front impact and decay dynamically on a 60fps animation loop.",
      "Pre-computes glyph lookups and character node arrays to eliminate garbage collection overhead."
    ],
    controls: [
      {
        type: "select",
        key: "variant",
        label: "Acoustic Variant",
        default: "classic",
        description: "Switches the color palette and glyph character set between classic, editorial, matrix, and nebula.",
        options: [
          { label: "Classic", value: "classic" },
          { label: "Editorial", value: "editorial" },
          { label: "Matrix", value: "matrix" },
          { label: "Nebula", value: "nebula" }
        ]
      },
      {
        type: "slider",
        key: "fontSize",
        label: "Font Size",
        default: 20,
        min: 12,
        max: 28,
        step: 1,
        unit: "px",
        description: "Controls the base font size for the typographic canvas grid in pixels."
      },
      {
        type: "slider",
        key: "staticOpacity",
        label: "Resting Opacity",
        default: 0.32,
        min: 0.10,
        max: 0.80,
        step: 0.02,
        description: "Sets the resting text field opacity before wave disturbances pass through."
      },
      {
        type: "slider",
        key: "waveSpeed",
        label: "Wave Speed",
        default: 950,
        min: 400,
        max: 2000,
        step: 50,
        unit: "px/s",
        description: "Controls the radial expansion velocity of the shockwave across the screen in pixels per second."
      },
      {
        type: "slider",
        key: "scrambleDuration",
        label: "Decode Duration",
        default: 340,
        min: 80,
        max: 800,
        step: 20,
        unit: "ms",
        description: "Sets how long characters scramble and lift before settling back into readable text."
      },
      {
        type: "slider",
        key: "lineHeightScale",
        label: "Line Rhythm",
        default: 1.65,
        min: 1.3,
        max: 2.2,
        step: 0.05,
        unit: "x",
        description: "Adjusts the vertical line height multiplier between rows of text."
      }
    ]
  };
