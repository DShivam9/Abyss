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
    "Editorial lookbooks and luxury brand hero showcase chapters.",
    "Architectural portfolios highlighting multi-panel physical spatial relationships.",
    "Cinematic landing section transitions with locked scroll choreography."
  ],
  engineeringNotes: [
    "Dual-phase timeline integrating an outside-to-in vertical reticle shutter and ink-soak placard reveal.",
    "Pinned hydraulic compression scrub smoothly reduces center panel width from 100vw to 50vw while pulling side encroachers into symmetric view.",
    "Simultaneous opposing internal counter-parallaxes on photos negate container movement for zero-drift visual stabilization.",
    "Flex-driven layout coordinates top, middle, and bottom rows with seamless bleed beyond viewport boundaries."
  ],
  controls: []
};
