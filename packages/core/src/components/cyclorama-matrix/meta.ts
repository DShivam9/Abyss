import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "80",
  label: "Cyclorama Matrix",
  filename: "components/cyclorama-matrix/img-01.webp",
  desc: "A curved 3D grid of cards you can drag in any direction with smooth momentum.",
  slug: "cyclorama-matrix",
  category: "interaction",
  subtype: "galleries",
  tags: ["3D Amphitheater", "Curved Gallery", "WebGL", "Pan Matrix", "Momentum"],
  previewType: "shader",
  overview: "A curved 3D grid of cards that wraps around your screen. Drag to pan in any direction. The camera zooms out slightly while you move, then springs right back into place when you let go. Cards along the outer edges softly fade into the dark background.",
  techStack: ["React", "Three.js", "WebGL"],
  useCases: [
    "Creative studio archives showcasing dozens of client projects on an interactive panoramic wall.",
    "Documentary and film festival screening catalogs mapping director reels across an immersive curved wall.",
    "Music and entertainment releases presenting albums, tour photography, and music videos."
  ],
  engineeringNotes: [
    "Uses 32×32 grid segments so cards curve smoothly without creasing.",
    "Bends cards in 3D using a curve formula in the vertex shader.",
    "The camera pulls back with a spring while you drag, then snaps back when you release.",
    "Cards loop infinitely in all directions using modulo math, so the grid never runs out.",
    "Hovering a card glows its colors into the dark card plate.",
    "Cards fade out smoothly along the edges using screen-space pixel smoothing."
  ],
  controls: [
    {
      type: "slider",
      key: "radiusX",
      label: "Curvature X",
      default: 14.0,
      min: 8.0,
      max: 24.0,
      step: 0.5,
      description: "Controls how tightly the cards wrap horizontally around the screen."
    },
    {
      type: "slider",
      key: "radiusY",
      label: "Curvature Y",
      default: 7.0,
      min: 4.0,
      max: 14.0,
      step: 0.5,
      description: "Controls how much the top and bottom rows curve toward you."
    },
    {
      type: "slider",
      key: "friction",
      label: "Pan Friction",
      default: 4.8,
      min: 1.0,
      max: 10.0,
      step: 0.2,
      description: "Controls how quickly the drag momentum glides to a stop."
    }
  ]
};
