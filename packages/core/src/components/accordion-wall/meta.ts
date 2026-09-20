import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
    id: "38",
    label: "Pillar Gallery",
    filename: "components/accordion-wall/art-01.webp",
    desc: "Vertical image pillars that rise on hover and expand into a towering fullscreen gallery with ambient lighting and floating typography.",
    slug: "accordion-wall",
    category: "gallery",
    subtype: "accordion",
    tags: ["GSAP", "Flexbox", "Crease Shadows"],
    previewType: "transition",
    overview: "A row of monolithic image pillars that ascend and brighten on hover, expanding into an immersive fullscreen showcase with ambient color echoes and synchronized typographic reveals.",
    techStack: ["React", "GSAP", "Tailwind CSS"],
    useCases: [
      "Visual design portfolios presenting featured client projects as towering interactive pillars.",
      "Architecture and interior design studios displaying building portfolios with seamless fullscreen expansion.",
      "Curated photography collections and gallery retrospectives exploring artwork with ambient mood lighting."
    ],
    engineeringNotes: [
      "Executes FLIP expansion from exact pillar coordinates directly into a 91vh hero viewport.",
      "Dynamic harmonic sibling displacement scales neighboring pillars outward with exponential damping.",
      "Ambient color echoes extract mood hues to tint background void lighting in real time."
    ],
    controls: [
      {
        type: "slider",
        key: "panelCount",
        label: "Panels",
        default: 8,
        min: 4,
        max: 8,
        step: 1,
        description: "Controls the number of active image pillars rendered across the gallery matrix."
      },
      {
        type: "slider",
        key: "speed",
        label: "Speed",
        default: 1.35,
        min: 0.5,
        max: 2.0,
        step: 0.05,
        unit: "s",
        description: "Sets the transition duration in seconds for hover ascents and fullscreen expansions."
      }
    ]
  };
