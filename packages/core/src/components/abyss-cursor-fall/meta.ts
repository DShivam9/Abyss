import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "70",
  label: "Abyss Cursor Fall",
  filename: "components/abyss-cursor-fall/hero.webp",
  desc: "Kinetic 3D image spawner plunging floating WebP and SVG cards into a deep atmospheric 3D void on cursor movement.",
  slug: "abyss-cursor-fall",
  category: "gallery",
  subtype: "3d-spawner",
  tags: ["Gallery", "Cursor Spawner", "3D", "Three.js", "WebGL", "Physics"],
  previewType: "gallery",
  overview: "Three.js WebGL cursor spawner that casts textured media cards into a deep three-dimensional void. Cursor velocity drives card ejection angle and rotational tumble before gravity pulls them downward through atmospheric fog and perspective camera parallax.",
  techStack: ["React", "Three.js", "WebGL", "GSAP", "TypeScript"],
  useCases: [
    "Creative developer portfolio heroes where cursor motion scatters floating project cards across the screen.",
    "Architectural studio portfolios that showcase project snapshots tumbling through a cinematic 3D perspective.",
    "Music artist and entertainment landing screens that generate an endless stream of album artwork on pointer flick."
  ],
  engineeringNotes: [
    "Reuses a shared Three.js plane geometry and caches loaded textures in memory to maintain a constant 60fps draw call profile.",
    "Computes pointer velocity vectors to impart perpendicular ejection speed and multi-axis tumble on newly spawned cards.",
    "Integrates smooth GSAP camera orbit damping that tracks mouse position to create responsive scene depth."
  ],
  controls: [
    {
      type: "select",
      key: "spawnFilter",
      label: "Spawn Type",
      default: "images-only",
      description: "Filters spawned cards between photographic imagery and vector geometric marks.",
      options: [
        { label: "Images", value: "images-only" },
        { label: "Shapes", value: "shapes-only" }
      ]
    },
    {
      type: "slider",
      key: "spawnDistance",
      label: "Spawn Distance",
      default: 50,
      min: 15,
      max: 180,
      step: 5,
      unit: "px",
      description: "Minimum cursor displacement in pixels required to trigger a card spawn."
    },
    {
      type: "slider",
      key: "spawnInterval",
      label: "Spawn Cooldown",
      default: 110,
      min: 30,
      max: 400,
      step: 10,
      unit: "ms",
      description: "Enforces cooldown timing between spawns to prevent buffer flooding during rapid gestures."
    },
    {
      type: "slider",
      key: "imageSize",
      label: "3D Image Size",
      default: 2.4,
      min: 0.5,
      max: 4.5,
      step: 0.1,
      description: "Scales the world-space dimensions of spawned 3D cards."
    },
    {
      type: "slider",
      key: "lifespan",
      label: "Card Lifespan",
      default: 3.0,
      min: 1.0,
      max: 6.0,
      step: 0.2,
      unit: "s",
      description: "Duration in seconds before cards fade out and dissolve into the void."
    },
    {
      type: "slider",
      key: "fallSpeed",
      label: "Void Fall Speed",
      default: 2.4,
      min: 0.5,
      max: 8.0,
      step: 0.5,
      description: "Sets downward acceleration speed dragging cards through the atmospheric depth plane."
    },
    {
      type: "slider",
      key: "cameraParallax",
      label: "3D Camera Parallax",
      default: 2.8,
      min: 0.5,
      max: 6.0,
      step: 0.2,
      description: "Multiplies subtle camera tilt and position shifts following pointer movement."
    }
  ]
};
