import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "61",
  label: "Gravity Cursor",
  filename: "components/gravity-cursor/hero.webp",
  desc: "Interactive physics-driven cursor gallery where clicking or hold-dragging stream-spawns image bodies that fall with gravity, bounce elastically on the spatial floor, and dissolve cleanly.",
  slug: "gravity-cursor",
  category: "gallery",
  subtype: "interactive-physics",
  tags: ["Cursor", "Gravity", "Physics", "Gallery", "Interactive", "Bounce"],
  previewType: "gallery",
  overview: "Interactive physics-driven cursor playground where pointer movement or drag gestures spawn lightweight image bodies. Spawned elements accelerate with realistic gravitational pull and bounce elastically against the viewport floor.",
  techStack: ["React", "HTML5 (DOM / CSS)", "TypeScript"],
  useCases: [
    "Creative portfolio landing pages that reward cursor clicks with responsive product imagery.",
    "E-commerce launch hero banners that let shoppers drag and drop catalog stickers with elastic bounce physics.",
    "Interactive agency contact sections and brand playgrounds that transform idle mouse movement into tactile micro-interactions."
  ],
  engineeringNotes: [
    "Pre-allocates an object pool of DOM nodes with translate3d positioning to eliminate runtime memory allocation.",
    "Calculates floor collision impulse, restitution damping, and angular spin on an unthrottled requestAnimationFrame loop.",
    "Features fluid cursor momentum projection and physical air wake displacement."
  ],
  controls: [
    {
      type: "select",
      key: "gravityMode",
      label: "Gravity Mode",
      default: "normal",
      description: "Switches between standard downward gravity and floating zero-g drift.",
      options: [
        { label: "Normal", value: "normal" },
        { label: "Zero-G", value: "zero-gravity" }
      ]
    },
    {
      type: "slider",
      key: "imageSize",
      label: "Image Size",
      default: 220,
      min: 120,
      max: 520,
      step: 10,
      unit: "px",
      description: "Sets the display width of raw images in pixels."
    },
    {
      type: "slider",
      key: "gravity",
      label: "Gravity Acceleration",
      default: 0.28,
      min: 0.1,
      max: 1.5,
      step: 0.02,
      description: "Tunes gravitational downward acceleration per frame.",
      dependsOn: { key: "gravityMode", value: "normal" }
    }
  ]
};
