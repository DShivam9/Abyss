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
  overview: "Interactive physics-driven cursor playground where pointer movement or drag gestures spawn lightweight image bodies. Spawned elements accelerate with realistic gravitational pull, bounce elastically against the viewport floor, or scatter outward via magnetic repulsion.",
  techStack: ["React", "HTML5 (DOM / CSS)", "TypeScript"],
  useCases: [
    "Creative portfolio landing pages that reward cursor clicks with responsive product imagery.",
    "E-commerce launch hero banners that let shoppers drag and drop catalog stickers with elastic bounce physics.",
    "Interactive agency contact sections and brand playgrounds that transform idle mouse movement into tactile micro-interactions."
  ],
  engineeringNotes: [
    "Pre-allocates an object pool of DOM nodes with translate3d positioning to eliminate runtime memory allocation.",
    "Calculates floor collision impulse, restitution damping, and angular spin on an unthrottled requestAnimationFrame loop.",
    "Features magnetic forcefield repulsion that accelerates settled bodies outward based on radial pointer proximity."
  ],
  controls: [
    {
      type: "select",
      key: "gravityMode",
      label: "Gravity Mode",
      default: "normal",
      description: "Switches between standard downward gravity, floating zero-g drift, and magnetic repulsion.",
      options: [
        { label: "Normal", value: "normal" },
        { label: "Zero-G", value: "zero-gravity" },
        { label: "Magnetic", value: "magnetic-repulsor" }
      ]
    },
    {
      type: "select",
      key: "interactionMode",
      label: "Spawn Trigger",
      default: "hold-drag",
      description: "Toggles between click-and-drag continuous spawning and velocity-based cursor trails.",
      options: [
        { label: "Hold & Drag", value: "hold-drag" },
        { label: "Cursor Trail", value: "cursor-trail" }
      ],
      dependsOn: { key: "gravityMode", value: ["normal", "zero-gravity"] }
    },
    {
      type: "slider",
      key: "imageSize",
      label: "Shape Size",
      default: 140,
      min: 70,
      max: 300,
      step: 5,
      unit: "px",
      description: "Sets the dimension of spawned visual bodies in pixels."
    },
    {
      type: "slider",
      key: "gravity",
      label: "Gravity Acceleration",
      default: 0.55,
      min: 0.1,
      max: 2.5,
      step: 0.05,
      description: "Tunes gravitational downward acceleration per frame.",
      dependsOn: { key: "gravityMode", value: "normal" }
    },
    {
      type: "slider",
      key: "bounceDamping",
      label: "Bounce Elasticity",
      default: 0.62,
      min: 0.05,
      max: 0.95,
      step: 0.05,
      description: "Adjusts floor bounce restitution and kinetic energy loss.",
      dependsOn: { key: "gravityMode", value: "normal" }
    },
    {
      type: "slider",
      key: "repelRadius",
      label: "Repel Radius",
      default: 350,
      min: 150,
      max: 600,
      step: 10,
      unit: "px",
      description: "Sets the radial reach of the magnetic repulsor forcefield in pixels.",
      dependsOn: { key: "gravityMode", value: "magnetic-repulsor" }
    },
    {
      type: "slider",
      key: "repelForce",
      label: "Repulsion Power",
      default: 9.2,
      min: 1.0,
      max: 25.0,
      step: 0.5,
      description: "Controls shockwave repulsion velocity when pushing nearby bodies away.",
      dependsOn: { key: "gravityMode", value: "magnetic-repulsor" }
    }
  ]
};
