import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "77",
  label: "Theme Toggle Redesign",
  filename: "components/theme-toggle-redesign/hero.webp",
  desc: "An architectural redesign of light and dark mode toggling featuring a 3D tactile dial plunge button with circular expanding wave immersion and a physical lamp pull cord with 28-bead Verlet physics.",
  slug: "theme-toggle-redesign",
  category: "interaction",
  subtype: "toggles",
  tags: ["Light Dark Mode", "Redesign", "3D Push Dial", "Lamp Pull Cord", "Verlet Physics", "Acoustic Audio", "Haptic Touch"],
  previewType: "transition",
  overview: "Architectural reconsideration of light and dark mode switching through physical tactile metaphors. Offers two interchangeable variants: a precision-machined 3D plunge dial driving a 1400ms circular expanding screen wave immersion, and an interactive hanging lamp pull cord governed by 28-bead Verlet constraint physics, realistic chain sag, acoustic micro-clicks, and volumetric overhead ambient illumination.",
  techStack: ["React", "TypeScript", "Canvas 2D", "HTML5 (DOM / CSS)"],
  useCases: [
    "High-craft agency websites and creative studio portfolios seeking memorable tactile interactions for global color mode switching.",
    "Design systems and component showcases requiring an elevated, non-standard alternative to traditional flat toggle switches.",
    "Interactive product landing pages integrating realistic physics simulations and acoustic haptic feedback into micro-moments."
  ],
  engineeringNotes: [
    "Simulates a 28-bead dangling pull cord using iterative Verlet integration with relaxation constraints and velocity damping.",
    "Drives circular screen wave transitions using sub-pixel element geometry calculation and CSS clip-path animation.",
    "Synthesizes dual-channel acoustic click transients upon engage and release thresholds with native vibration API fallbacks."
  ],
  controls: [
    {
      type: "select",
      key: "variant",
      label: "Variant",
      default: "dial",
      options: [
        { label: "3D Dial", value: "dial" },
        { label: "Lamp Cord", value: "lamp" }
      ],
      description: "Switches between the machined 3D circular plunge dial and the hanging Verlet lamp cord."
    },
    {
      type: "toggle",
      key: "enableAudio",
      label: "Acoustic SFX",
      default: true,
      description: "Enables tactile mechanical click audio transients on toggle engage and release."
    }
  ]
};
