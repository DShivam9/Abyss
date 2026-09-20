import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "43",
  label: "Erosion Map",
  filename: "components/erosion-map/hero.webp",
  desc: "Full-screen photography that dissolves organically on scroll, transitioning between image layers with procedural noise and an illuminated edge contour.",
  slug: "erosion-map",
  category: "scroll",
  subtype: "gallery",
  tags: ["Perlin Noise", "Erosion Transition", "GSAP ScrollTrigger", "Canvas 2D", "Image Dissolve"],
  previewType: "scroll",
  overview: "Images dissolve into one another through an organic noise-driven transition tied to scroll progress. As you scroll, procedural noise dissolves the active slide, highlighting an illuminated accent contour before cleanly revealing the next image beneath.",
  techStack: ["React", "GSAP", "Canvas 2D"],
  useCases: [
    "Dissolving between full-bleed project visuals and case study mockups on pinned scroll.",
    "Revealing product feature walkthroughs and interface layers as visitors scroll down landing pages.",
    "Transitioning between legacy systems and modern redesigns with an organic pixel dissolve."
  ],
  engineeringNotes: [
    "Calculates multi-octave Fractal Brownian Motion (FBM) across an offscreen grid for instant CPU thresholding.",
    "Four wind flow patterns warp the erosion field: directional linear sweep, vortex spiral, wave crests, and turbulent shear.",
    "Uses a Uint32Array bitwise buffer to render the illuminated edge contour along the active dissolve boundary.",
    "Fluid momentum damping prevents jerky transition jumps during rapid or discontinuous wheel scrolling.",
    "Pinning is managed via GSAP ScrollTrigger across a virtual runway with automatic memory cleanup on unmount."
  ],
  controls: [
    {
      type: "select",
      key: "windPattern",
      label: "Wind Pattern",
      default: "linear",
      description: "Switches the wind vector distortion between linear sweep, vortex spiral, sinusoidal wave, and turbulent shear.",
      options: [
        { label: "Linear Sweep", value: "linear" },
        { label: "Spiral Vortex", value: "vortex" },
        { label: "Sinusoidal Wave", value: "wave" },
        { label: "Turbulent Shear", value: "turbulent" }
      ]
    },
    {
      type: "slider",
      key: "windAngle",
      label: "Wind Angle",
      default: 180,
      min: 0,
      max: 360,
      step: 5,
      unit: "°",
      description: "Controls the primary direction that wind sweeps across the canvas."
    },
    {
      type: "slider",
      key: "windStretch",
      label: "Wind Stretch",
      default: 2.5,
      min: 0.5,
      max: 5.0,
      step: 0.1,
      description: "Stretches noise granules along the wind axis to create elongated weathering streaks."
    },
    {
      type: "slider",
      key: "erosionDamper",
      label: "Fluid Damping",
      default: 1.0,
      min: 0.1,
      max: 10.0,
      step: 0.1,
      description: "Controls how heavily fluid momentum smooths out scroll velocity."
    },
    {
      type: "slider",
      key: "noiseScale",
      label: "Erosion Scale",
      default: 0.005,
      min: 0.001,
      max: 0.02,
      step: 0.001,
      description: "Sets the size of the noise cells eating through the image."
    },
    {
      type: "slider",
      key: "edgeGlow",
      label: "Edge Brightness",
      default: 1.5,
      min: 0,
      max: 3,
      step: 0.1,
      description: "Adjusts the brightness and width of the illuminated accent rim along the dissolve boundary."
    },
    {
      type: "slider",
      key: "octaves",
      label: "Noise Octaves",
      default: 3,
      min: 1,
      max: 6,
      step: 1,
      description: "Layers additional noise frequencies for finer textural detail."
    },
    {
      type: "slider",
      key: "curvePower",
      label: "Curve Easing",
      default: 1.0,
      min: 0.5,
      max: 4.0,
      step: 0.1,
      description: "Shapes the erosion rate curve from linear to exponential."
    }
  ]
};
