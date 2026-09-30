import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "82",
  label: "Polyptych Formation",
  filename: "components/polyptych-formation/rubenimages-p-1Lj8CknZA-unsplash.webp",
  desc: "Architectural hydraulic compression scroll sequence collapsing a multi-panel photographic formation into symmetric alignment.",
  slug: "polyptych-formation",
  category: "interaction",
  subtype: "galleries",
  tags: ["Hydraulic Scrub", "Editorial Placard", "Reticle Shutter", "Flex Compression", "Counter-Parallax"],
  previewType: "gallery",
  overview: "A dual-stage scroll composition beginning with an architectural reticle shutter convergence and stepped typographic placard reveal, transitioning into a pinned hydraulic compression that pulls outer photographic panels inward with opposing internal counter-parallax.",
  techStack: ["React", "GSAP", "ScrollTrigger"],
  useCases: [
    "Feature comparison & multi-angle product breakdowns: Pinning a central focus while flanking spec sheets and detail panels compress symmetrically into view.",
    "Section transitions in long-form narratives: Locking scroll momentum to reveal surrounding architectural context before continuing down the page.",
    "Process & case study showcases: Revealing supporting iterations on both flanks while keeping the primary finished work anchored."
  ],
  engineeringNotes: [
    "Dual-phase timeline integrating an outside-to-in vertical reticle shutter and ink-soak placard reveal.",
    "Pinned hydraulic compression scrub smoothly reduces center panel width from 100vw to 50vw while pulling side encroachers into symmetric view.",
    "Simultaneous opposing internal counter-parallaxes on photos negate container movement for zero-drift visual stabilization.",
    "Flex-driven layout coordinates top, middle, and bottom rows with seamless bleed beyond viewport boundaries."
  ],
  controls: []
};
