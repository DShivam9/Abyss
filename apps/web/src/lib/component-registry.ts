import dynamic from "next/dynamic";
import React from "react";
import { VesselComponentProps } from "@abyss-ui/core";

export interface ControlConfig {
  type: "slider" | "toggle" | "select" | "color";
  key: string;
  label: string;
  default: number | boolean | string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { label: string; value: string }[];
}

export interface ComponentDetail {
  id: string;
  label: string;
  filename: string;
  desc: string;
  slug: string;
  category: string;
  subtype: string;
  tags?: string[];
  previewType?: "shader" | "scroll" | "gallery" | "transition" | "text";
  controls?: ControlConfig[];
}

export const COMPONENT_DETAILS: Record<string, ComponentDetail> = {
  "japparii": {
    id: "01",
    label: "JAPPARII",
    filename: "Image(shader)/japparii.jpg",
    desc: "A hand-drawn Leonardo sketch paper shader rendering image luminance as dynamic cross-hatching diagonal strokes.",
    slug: "japparii",
    category: "image",
    subtype: "scrolls"
  },
  "chromepunk-beast": {
    id: "02",
    label: "CHROMEPUNK BEAST",
    filename: "Image(shader)/chromepunk-beast.jpg",
    desc: "A specular normal-mapped canvas calculating height profiles and embossing shadows on the fly via Sobel filters.",
    slug: "chromepunk-beast",
    category: "image",
    subtype: "radar-plates"
  },
  "merlin-knights": {
    id: "07",
    label: "MERLIN KNIGHTS",
    filename: "Image(shader)/merlin-knights.jpg",
    desc: "A Renaissance copperplate engraving sketch. The cursor causes paint to bleed through raw parchment paper fibers, gradually drying back to sepia when resting.",
    slug: "merlin-knights",
    category: "geometry",
    subtype: "engravings"
  },
  "acg-fleece": {
    id: "09",
    label: "ACG FLEECE",
    filename: "Image(shader)/acg-fleece.jpg",
    desc: "A global physical bas-relief shader that embosses the image contours in 3D, casting shadows and specular glints dynamically from a cursor-controlled studio light.",
    slug: "acg-fleece",
    category: "image",
    subtype: "radar-plates"
  },
  "apparatus-dee": {
    id: "10",
    label: "APPARATUS DEE",
    filename: "Image(shader)/dee.jpg",
    desc: "A molten chrome & liquid mercury flow shader. Warps coordinates in viscous waves and shifts anisotropic studio reflections. Best used with high-contrast, metallic, chrome, or reflective images to maximize the liquid-metal sheen.",
    slug: "apparatus-dee",
    category: "image",
    subtype: "liquid-metal"
  },
  "core-shell-b": {
    id: "12",
    label: "CORE SHELL B",
    filename: "Image(shader)/download (2).jpg",
    desc: "Physical expanding water wave ripples generated dynamically by mouse clicks on the canvas.",
    slug: "core-shell-b",
    category: "image",
    subtype: "scanners"
  },
  "kinetic-portal": {
    id: "13",
    label: "KINETIC PORTAL",
    filename: "Image(shader)/download (3).jpg",
    desc: "An infrared thermal heat vision spectrum shader mapped dynamically around the cursor.",
    slug: "kinetic-portal",
    category: "image",
    subtype: "scanners"
  },
  "apparatus-faf": {
    id: "14",
    label: "APPARATUS FAF",
    filename: "Image(shader)/faf.jpg",
    desc: "An alchemical gilding transmutation shader that preserves a high-fidelity medieval egg-tempera portrait in its pristine, full-color idle state, while dynamically crystallizing a wave of embossed gold leaf across the knight's armor and crown on hover.",
    slug: "apparatus-faf",
    category: "image",
    subtype: "banners",
    tags: ["Alchemical Gilding", "3D Embossed Normal Map", "GPU Wave Simulation"],
    controls: [
      { type: "slider", key: "goldIntensity", label: "Gold Intensity", default: 0.7, min: 0, max: 1, step: 0.01 },
      { type: "slider", key: "waveSpeed", label: "Wave Speed", default: 1, min: 0.1, max: 5, step: 0.1 },
      { type: "toggle", key: "showGoldLeaf", label: "Gold Leaf", default: true }
    ]
  },
  "apparatus-gg": {
    id: "15",
    label: "APPARATUS GG",
    filename: "Image(shader)/gg.jpg",
    desc: "A 3D elastic membrane vertex pull mapping height protrusions and shadows to cursor coordinates.",
    slug: "apparatus-gg",
    category: "geometry",
    subtype: "canvases"
  },
  "apparatus-fblf": {
    id: "19",
    label: "APPARATUS FBLF",
    filename: "Image(shader)/fblf.jpg",
    desc: "A 3D medieval knight silhouette displaying interactive depth light reflection.",
    slug: "apparatus-fblf",
    category: "geometry",
    subtype: "drapes"
  },
  "apparatus-fjvfba": {
    id: "20",
    label: "APPARATUS COPPER PATINA",
    filename: "Image(shader)/fjvfba.jpg",
    desc: "An interactive medieval copperplate engraving shader. Renders a gleaming copperplate print with rich specular reflection and dark carbon grooves when idle. Hovering causes a rich blue-green verdigris patina to bloom and crawl along the engraved outlines.",
    slug: "apparatus-fjvfba",
    category: "image",
    subtype: "drapes",
    tags: ["Copperplate Etching", "Verdigris Patina", "Chemical Oxidation"]
  },
  "apparatus-ialfa": {
    id: "21",
    label: "APPARATUS IALFA",
    filename: "Image(shader)/i  alfa.jpg",
    desc: "A holy knight rendered as a bas-relief stone carving that casts long, ray-marched shadows in response to a raking torchlight cursor.",
    slug: "apparatus-ialfa",
    category: "image",
    subtype: "drapes",
    tags: ["Stone Relief", "Dynamic Shadows", "Raking Torchlight"]
  },
  "apparatus-ll": {
    id: "22",
    label: "APPARATUS LL",
    filename: "Image(shader)/ll.jpg",
    desc: "A demonic knight steel armor reflection shader responding to light coordinates.",
    slug: "apparatus-ll",
    category: "image",
    subtype: "drapes"
  },
  "apparatus-hoqnl": {
    id: "27",
    label: "APPARATUS HOQNL",
    filename: "Image(shader)/hoqnl.jpg",
    desc: "A raw steel relief displacement shader.",
    slug: "apparatus-hoqnl",
    category: "image",
    subtype: "drapes"
  },
  "orbit-ring-gallery": {
    id: "36",
    label: "ORBIT RING GALLERY",
    filename: "Gallary/cosmos_145253936.jpeg",
    desc: "Scroll to revolve through an immersive 3D ring of images, with the active hero image scaling dynamically at the forefront.",
    slug: "orbit-ring-gallery",
    category: "gallary",
    subtype: "ring",
    tags: ["Three.js", "R3F", "GSAP ScrollTrigger", "Framer Motion"],
    previewType: "scroll",
    controls: [
      { type: "toggle", key: "cascadeEnabled", label: "Flow Cascade", default: false },
      { type: "toggle", key: "swingEnabled", label: "Swing Focus", default: false },
      { type: "slider", key: "scrollSpeed", label: "Scroll Speed", default: 0.0007, min: 0.0001, max: 0.0020, step: 0.0001 },
      { type: "slider", key: "dragSpeed", label: "Drag Speed", default: 0.5, min: 0.1, max: 1.5, step: 0.05 },
      { type: "slider", key: "damping", label: "Snappiness", default: 2.8, min: 0.5, max: 5.0, step: 0.1 },
      { type: "slider", key: "radius", label: "Orbit Radius", default: 3.4, min: 2.0, max: 8.0, step: 0.2 },
      { type: "slider", key: "tilt", label: "Ring Tilt", default: 0, min: 0, max: 1.0, step: 0.05 }
    ]
  },
  "apparatus-venetian-blinds": {
    id: "37",
    label: "APPARATUS VENETIAN BLINDS",
    filename: "Transitions/ChatGPT Image Jul 15, 2026, 05_54_47 PM.png",
    desc: "A high-fidelity image gallery transition where horizontal slats rotate 180 degrees in a staggered cascade to reveal the next image.",
    slug: "apparatus-venetian-blinds",
    category: "transition",
    subtype: "blinds",
    tags: ["GSAP", "CSS 3D", "Tactile"],
    previewType: "transition",
    controls: [
      { type: "slider", key: "slatCount", label: "Venetian Slats", default: 12, min: 4, max: 32, step: 2 },
      { type: "slider", key: "duration", label: "Transition Speed", default: 0.8, min: 0.3, max: 2.0, step: 0.1, unit: "s" },
      { type: "slider", key: "staggerDelay", label: "Rotation Stagger", default: 0.04, min: 0.01, max: 0.15, step: 0.01, unit: "s" },
      { type: "toggle", key: "parallaxEnabled", label: "3D Parallax", default: true },
      { type: "toggle", key: "edgeHighlightEnabled", label: "Crease Glare", default: true },
      { type: "toggle", key: "backlightEnabled", label: "Backlight Glow", default: true },
      {
        type: "select",
        key: "direction",
        label: "Cascade Pattern",
        default: "center-out",
        options: [
          { label: "Center Out", value: "center-out" },
          { label: "Top to Bottom", value: "top-to-bottom" },
          { label: "Bottom to Top", value: "bottom-to-top" },
          { label: "Edges In", value: "edges-in" }
        ]
      }
    ]
  },
  "apparatus-accordion-wall": {
    id: "38",
    label: "ACCORDION WALL",
    filename: "Transitions/ChatGPT Image Jul 15, 2026, 05_26_02 PM.png",
    desc: "A tactile vertical image accordion that unfolds like a folding screen divider, collapsing neighbor panels while revealing title text and folding shadows.",
    slug: "apparatus-accordion-wall",
    category: "gallary",
    subtype: "accordion",
    tags: ["GSAP", "Flexbox", "Crease Shadows"],
    previewType: "transition",
    controls: [
      { type: "slider", key: "panelCount", label: "Panels", default: 5, min: 3, max: 8, step: 1 },
      { type: "slider", key: "speed", label: "Speed", default: 0.6, min: 0.3, max: 1.5, step: 0.05, unit: "s" },
      { type: "select", key: "triggerMode", label: "Trigger", default: "hover", options: [{ label: "Hover", value: "hover" }, { label: "Click", value: "click" }] }
    ]
  },
  "apparatus-parallax-column": {
    id: "39",
    label: "PARALLAX COLUMN",
    filename: "scroll/cosmos_1859262512.jpeg",
    desc: "A split-screen vertical runway where left and right columns travel in opposite directions, revealing unclipped images as they cross the viewport center.",
    slug: "apparatus-parallax-column",
    category: "scroll",
    subtype: "transition",
    tags: ["GSAP", "Lenis", "Split Scroll", "Clip Path"],
    previewType: "scroll",
    controls: [
      { type: "slider", key: "speedFactor", label: "Parallax Speed", default: 1.0, min: 0.5, max: 2.0, step: 0.1 },
      { type: "slider", key: "splitRatio", label: "Column Split Ratio", default: 50, min: 25, max: 75, step: 1, unit: "%" },
      { type: "slider", key: "cropAmount", label: "Image Framing Crop", default: 15, min: 5, max: 25, step: 1, unit: "%" },
      { type: "slider", key: "bgScale", label: "Image Scale", default: 40, min: 20, max: 90, step: 5, unit: "%" },
      { type: "slider", key: "inertia", label: "Motion Smoothness", default: 4, min: 1, max: 15, step: 1 },
      { type: "slider", key: "autoScrollSpeed", label: "Drift Speed", default: 25, min: 0, max: 60, step: 5 },
      { type: "slider", key: "columnGap", label: "Column Gap Spacing", default: 4, min: 0, max: 48, step: 2, unit: "px" },
      { type: "slider", key: "imageGap", label: "Vertical Image Gap", default: 4, min: 0, max: 48, step: 2, unit: "px" }
    ]
  },
  "apparatus-layout-morph": {
    id: "41",
    label: "APPARATUS LAYOUT MORPH",
    filename: "scroll/cosmos_1225764898.jpeg",
    desc: "A set of content cards that reflow their entire layout as you scroll — starting in a tight grid, then morphing through intermediate arrangements (masonry → single column → horizontal strip), with each card smoothly animating to its new position and dimensions.",
    slug: "apparatus-layout-morph",
    category: "scroll",
    subtype: "transition",
    tags: ["GSAP", "Layout Reflow", "Interpolation", "3D Rotation"],
    previewType: "scroll"
  },
  "apparatus-erosion-map": {
    id: "43",
    label: "APPARATUS EROSION MAP",
    filename: "scroll/cosmos_1207399578.jpeg",
    desc: "Images erode organically based on a Perlin noise field driven by scroll progress, revealing layers below with textured weathering patterns and active edge glowing.",
    slug: "apparatus-erosion-map",
    category: "scroll",
    subtype: "gallery",
    tags: ["GSAP", "Scroll", "Canvas 2D", "Perlin Noise"],
    previewType: "scroll",
    controls: [
      { type: "slider", key: "erosionDamper", label: "Erosion Fluid Damper", default: 3.0, min: 0.5, max: 20.0, step: 0.5 },
      { type: "slider", key: "noiseScale", label: "Erosion Scale", default: 0.005, min: 0.001, max: 0.02, step: 0.001 },
      { type: "slider", key: "edgeGlow", label: "Edge Brightness", default: 1.5, min: 0, max: 3, step: 0.1 },
      { type: "slider", key: "octaves", label: "Perlin Octaves", default: 3, min: 1, max: 6, step: 1 },
      {
        type: "select",
        key: "windPattern",
        label: "Wind Pattern",
        default: "linear",
        options: [
          { label: "Linear Sweep", value: "linear" },
          { label: "Radial Ring", value: "radial" },
          { label: "Spiral Vortex", value: "vortex" },
          { label: "Sinusoidal Wave", value: "wave" },
          { label: "Turbulent Shear", value: "turbulent" },
          { label: "Centripetal Implosion", value: "implosion" }
        ]
      },
      { type: "slider", key: "windAngle", label: "Wind Angle", default: 180, min: 0, max: 360, step: 5, unit: "°" },
      { type: "slider", key: "windStretch", label: "Wind Stretch", default: 2.5, min: 0.5, max: 5.0, step: 0.1 },
      { type: "slider", key: "curvePower", label: "Curve Easing Power", default: 2.0, min: 0.5, max: 4.0, step: 0.1 }
    ]
  },
  "apparatus-dual-wave": {
    id: "44",
    label: "APPARATUS DUAL WAVE",
    filename: "scroll/cosmos_679994644.jpeg",
    desc: "Two columns of text names flanking a center image. Names slide horizontally along a sine wave as you scroll, flanking a center image that swaps source to match the active viewport item.",
    slug: "apparatus-dual-wave",
    category: "scroll",
    subtype: "index",
    tags: ["GSAP", "Scroll", "Sine Wave", "Typography"],
    previewType: "scroll",
    controls: [
      { type: "slider", key: "frequency", label: "Sine Frequency", default: 2, min: 0.5, max: 5, step: 0.1 },
      { type: "slider", key: "amplitude", label: "Sine Amplitude", default: 60, min: 10, max: 150, step: 5, unit: "px" },
      { type: "slider", key: "waveNum", label: "Wave Density", default: 0.45, min: 0.1, max: 1.0, step: 0.05 },
      { type: "slider", key: "spacing", label: "Text Item Spacing", default: 65, min: 30, max: 120, step: 5, unit: "px" },
      { type: "slider", key: "maxBlur", label: "Depth Blur", default: 3.0, min: 0, max: 10, step: 0.5, unit: "px" },
      { type: "slider", key: "maxRotation", label: "Tilt Angle", default: 8.0, min: 0, max: 25, step: 1, unit: "°" },
      { type: "slider", key: "cornerAlignment", label: "Corner Alignment", default: 1.0, min: 0, max: 1.0, step: 0.1 }
    ]
  },
  "apparatus-clip-morph": {
    id: "45",
    label: "APPARATUS CLIP MORPH",
    filename: "Transitions/ChatGPT Image Jul 16, 2026, 06_08_32 PM.png",
    desc: "Outgoing image is clipped by a shape. The shape morphs — shrinking inward while simultaneously transforming geometry (circle → diamond → thin vertical line → nothing) to reveal the next image.",
    slug: "apparatus-clip-morph",
    category: "transition",
    subtype: "transition",
    tags: ["GSAP", "Scroll", "Clip Path", "Morph", "Tactile"],
    previewType: "transition",
    controls: [
      {
        type: "select",
        key: "selectedShapeMode",
        label: "Outgoing Shape",
        default: "cycle",
        options: [
          { label: "Cycle All Shapes", value: "cycle" },
          { label: "Kinetic Star", value: "star" },
          { label: "Gotische Arch", value: "arch" },
          { label: "Heraldic Shield", value: "shield" },
          { label: "Lotus Petal", value: "petal" }
        ]
      },
      { type: "slider", key: "customRotation", label: "Twist Rotation", default: 30, min: 0, max: 90, step: 5, unit: "°" },
      { type: "slider", key: "customBleed", label: "Color Bleed", default: 40, min: 0, max: 100, step: 5, unit: "%" },
      { type: "slider", key: "customGrain", label: "Film Grain", default: 25, min: 0, max: 80, step: 2, unit: "%" }
    ]
  },
  "apparatus-phase-drift": {
    id: "46",
    label: "APPARATUS PHASE DRIFT",
    filename: "scroll/cosmos_1591705408.jpeg",
    desc: "Coordinated scroll-driven horizontal wave undulating images on a traveling sinusoidal path with velocity-driven amplitude swells.",
    slug: "apparatus-phase-drift",
    category: "scroll",
    subtype: "gallery",
    tags: ["GSAP", "Scroll", "Sine Wave", "Velocity"],
    previewType: "scroll",
    controls: [
      {
        type: "select",
        key: "pathType",
        label: "Wave Motion Pattern",
        default: "sine",
        options: [
          { label: "Sine Wave", value: "sine" },
          { label: "ZigZag Path", value: "zigzag" },
          { label: "Wandering Drift", value: "wandering" },
          { label: "Spiral Swing", value: "spiral" }
        ]
      },
      { type: "slider", key: "waveAmplitude", label: "Wave Amplitude", default: 150, min: 20, max: 300, step: 10, unit: "px" },
      { type: "slider", key: "driftSpeed", label: "Drift Speed", default: 0.8, min: 0.1, max: 3.0, step: 0.1 },
      { type: "slider", key: "imageWidth", label: "Tile Width", default: 120, min: 60, max: 240, step: 10, unit: "px" },
      { type: "slider", key: "smoothFactor", label: "Inertia Smoothness", default: 0.08, min: 0.01, max: 0.2, step: 0.01 }
    ]
  },
  "apparatus-depth-swim": {
    id: "47",
    label: "APPARATUS DEPTH SWIM",
    filename: "scroll/cosmos_1994819013.jpeg",
    desc: "Swim forward through a 3D parallax field of suspended images that dynamically scale, blur, and fade in focus.",
    slug: "apparatus-depth-swim",
    category: "scroll",
    subtype: "gallery",
    tags: ["GSAP", "Scroll", "Parallax", "Depth of Field"],
    previewType: "scroll",
    controls: [
      {
        type: "select",
        key: "selectedVariant",
        label: "Camera Presets",
        default: "tunnel",
        options: [
          { label: "Deep Tunnel", value: "tunnel" },
          { label: "Dense Matrix", value: "matrix" },
          { label: "Cinematic Scope", value: "cinematic" },
          { label: "Micro Precision", value: "micro" }
        ]
      },
      { type: "slider", key: "depthRange", label: "Depth Z-Spread", default: 1600, min: 600, max: 3000, step: 100, unit: "px" },
      { type: "slider", key: "maxBlur", label: "Max Focal Blur", default: 18, min: 0, max: 30, step: 1, unit: "px" },
      { type: "slider", key: "cursorParallaxPower", label: "Mouse Parallax", default: 40, min: 0, max: 100, step: 5, unit: "px" },
      { type: "slider", key: "cardScale", label: "Card Base Scale", default: 1.0, min: 0.5, max: 2.0, step: 0.1 },
      { type: "slider", key: "hoverTiltMax", label: "Max Hover Tilt", default: 15, min: 0, max: 30, step: 1, unit: "°" },
      { type: "slider", key: "ambientOpacity", label: "Ambient Opacity", default: 0.45, min: 0.0, max: 0.8, step: 0.05 },
      { type: "slider", key: "ambientBlur", label: "Ambient Blur", default: 75, min: 0, max: 150, step: 5, unit: "px" }
    ]
  },
  "apparatus-cylinder-scroll": {
    id: "48",
    label: "APPARATUS CYLINDER SCROLL",
    filename: "scroll/cosmos_1452408749.jpeg",
    desc: "Infinite bidirectional vertical scroll of cards rotating tangentially along a 3D cylindrical drum surface with a lens focus reveal.",
    slug: "apparatus-cylinder-scroll",
    category: "scroll",
    subtype: "gallery",
    tags: ["GSAP", "Scroll", "3D Cylinder", "Infinite Scroll", "Depth of Field"],
    previewType: "scroll",
    controls: [
      { type: "slider", key: "baseSigma", label: "Focus Width (Sigma)", default: 350, min: 80, max: 350, step: 10, unit: "px" },
      { type: "slider", key: "maxBlur", label: "Max Blur Limit", default: 2, min: 0, max: 20, step: 1, unit: "px" },
      { type: "slider", key: "cardGap", label: "Card Gap Spacing", default: 28, min: 8, max: 48, step: 2, unit: "px" },
      { type: "slider", key: "pathBend", label: "Path Curvature", default: 0, min: 0, max: 100, step: 5, unit: "%" }
    ]
  },
  "apparatus-focus-ring": {
    id: "49",
    label: "FOCUS RING",
    filename: "scroll/cosmos_1309660817.jpeg",
    desc: "Images arranged in a 2D elliptical path. The ring rotates via horizontal dragging, wheel, or arrow keys, bringing the active image to full scale, opacity, and sharp focus.",
    slug: "apparatus-focus-ring",
    category: "gallary",
    subtype: "gallery",
    tags: ["GSAP", "Physics", "Tactile", "Focus Gradient"],
    previewType: "scroll",
    controls: [
      { type: "slider", key: "rxFactor", label: "Ring Radius Width", default: 0.35, min: 0.15, max: 0.55, step: 0.01 },
      { type: "slider", key: "ryFactor", label: "Ring Depth Height", default: 0.12, min: 0.05, max: 0.35, step: 0.01 },
      { type: "slider", key: "baseItemScale", label: "Card Scale", default: 1.0, min: 0.5, max: 2.0, step: 0.1 },
      { type: "slider", key: "activeBlur", label: "Max Depth Blur", default: 4.0, min: 0, max: 12.0, step: 0.5, unit: "px" },
      { type: "slider", key: "ambientSpinSpeed", label: "Ambient Spin Velocity", default: 0.02, min: 0, max: 0.1, step: 0.005 }
    ]
  },
  "apparatus-cursor-wake": {
    id: "50",
    label: "CURSOR WAKE",
    filename: "scroll/cosmos_679994644.jpeg",
    desc: "Images in a structured grid. Moving your cursor leaves a trailing wake of scale, opacity, and saturation that slowly decays over time, tracing exploration history.",
    slug: "apparatus-cursor-wake",
    category: "gallary",
    subtype: "gallery",
    tags: ["React", "Viscosity", "Performance", "SVG Path Tracing"],
    previewType: "scroll",
    controls: [
      { type: "slider", key: "decay", label: "Decay Duration", default: 1800, min: 500, max: 4000, step: 100, unit: "ms" },
      { type: "slider", key: "scaleBase", label: "Base Scale", default: 0.55, min: 0.4, max: 0.75, step: 0.01 },
      { type: "slider", key: "satMax", label: "Max Saturation", default: 1.5, min: 1, max: 2.5, step: 0.05 },
      { type: "slider", key: "maxBlur", label: "Lens Vignette Blur", default: 3.5, min: 0, max: 8, step: 0.5, unit: "px" }
    ]
  },
  "apparatus-page-fade-shift": {
    id: "51",
    label: "PAGE FADE SHIFT",
    filename: "Transitions/ChatGPT Image Jul 15, 2026, 05_26_02 PM.png",
    desc: "Route and view transition executing an asymmetric spatial handoff. Outgoing page ascends (-20px) and fades out; incoming page descends (+20px to 0) and fades in.",
    slug: "apparatus-page-fade-shift",
    category: "transition",
    subtype: "transition",
    tags: ["GSAP", "Transition", "Route Shift", "Asymmetric Handoff"],
    previewType: "transition",
    controls: [
      { type: "slider", key: "leaveDuration", label: "Outgoing Fade Duration", default: 350, min: 100, max: 1000, step: 50, unit: "ms" },
      { type: "slider", key: "enterDuration", label: "Incoming Fade Duration", default: 400, min: 100, max: 1000, step: 50, unit: "ms" },
      { type: "slider", key: "shiftY", label: "Vertical Shift Distance", default: 30, min: 5, max: 100, step: 5, unit: "px" },
      { type: "slider", key: "scaleShift", label: "Depth Scale Shift", default: 0.04, min: 0, max: 0.15, step: 0.01 }
    ]
  },
  "apparatus-page-overlay-wipe": {
    id: "52",
    label: "PAGE OVERLAY WIPE",
    filename: "Transitions/ChatGPT Image Jul 15, 2026, 05_29_20 PM.png",
    desc: "Full-viewport physical overlay panel executing a two-phase directional sweep across route state changes, eliminating visual co-existence.",
    slug: "apparatus-page-overlay-wipe",
    category: "transition",
    subtype: "transition",
    tags: ["GSAP", "Transition", "Overlay Wipe", "Physical Barrier"],
    previewType: "transition",
    controls: [
      {
        type: "select",
        key: "wipeDirection",
        label: "Wipe Direction",
        default: "bottom-to-top",
        options: [
          { label: "Bottom to Top", value: "bottom-to-top" },
          { label: "Top to Bottom", value: "top-to-bottom" },
          { label: "Left to Right", value: "left-to-right" },
          { label: "Right to Left", value: "right-to-left" },
          { label: "Diagonal TL-BR", value: "diagonal-tl-br" },
          { label: "Diagonal TR-BL", value: "diagonal-tr-bl" }
        ]
      },
      {
        type: "select",
        key: "wipeStyle",
        label: "Wipe Material Style",
        default: "solid",
        options: [
          { label: "Solid Monolith", value: "solid" },
          { label: "Multi-Strip Slats", value: "multi-layer-slat" },
          { label: "Iris Portal", value: "iris-portal" }
        ]
      },
      { type: "slider", key: "coverDuration", label: "Cover Duration", default: 400, min: 100, max: 1200, step: 50, unit: "ms" },
      { type: "slider", key: "revealDuration", label: "Reveal Duration", default: 400, min: 100, max: 1200, step: 50, unit: "ms" },
      { type: "toggle", key: "showAccentHairline", label: "Accent Hairline", default: true },
      {
        type: "color",
        key: "overlayColor",
        label: "Panel Overlay Color",
        default: "#0e0e11"
      },
      {
        type: "color",
        key: "accentLineColor",
        label: "Accent Line Color",
        default: "#3b82f6"
      },
      { type: "toggle", key: "enable3DDepth", label: "3D Depth Shift", default: true },
      { type: "toggle", key: "enableParallaxCounter", label: "Parallax Counter", default: true }
    ]
  }
};
// Force reload: 2026-07-20



// Dynamic imports mapping slug to component inside packages/core
export const COMPONENT_IMPORTS: Record<string, React.ComponentType<VesselComponentProps>> = {
  "japparii": dynamic(() => import("../../../../packages/core/src/components/japparii"), { ssr: false }),
  "chromepunk-beast": dynamic(() => import("../../../../packages/core/src/components/chromepunk-beast"), { ssr: false }),
  "merlin-knights": dynamic(() => import("../../../../packages/core/src/components/merlin-knights"), { ssr: false }),
  "acg-fleece": dynamic(() => import("../../../../packages/core/src/components/acg-fleece"), { ssr: false }),
  "apparatus-dee": dynamic(() => import("../../../../packages/core/src/components/apparatus-dee"), { ssr: false }),
  "core-shell-b": dynamic(() => import("../../../../packages/core/src/components/core-shell-b"), { ssr: false }),
  "kinetic-portal": dynamic(() => import("../../../../packages/core/src/components/kinetic-portal"), { ssr: false }),
  "apparatus-faf": dynamic(() => import("../../../../packages/core/src/components/apparatus-faf"), { ssr: false }),
  "apparatus-gg": dynamic(() => import("../../../../packages/core/src/components/apparatus-gg"), { ssr: false }),
  "apparatus-fblf": dynamic(() => import("../../../../packages/core/src/components/apparatus-fblf"), { ssr: false }),
  "apparatus-fjvfba": dynamic(() => import("../../../../packages/core/src/components/apparatus-fjvfba"), { ssr: false }),
  "apparatus-ialfa": dynamic(() => import("../../../../packages/core/src/components/apparatus-ialfa"), { ssr: false }),
  "apparatus-ll": dynamic(() => import("../../../../packages/core/src/components/apparatus-ll"), { ssr: false }),
  "apparatus-hoqnl": dynamic(() => import("../../../../packages/core/src/components/apparatus-hoqnl"), { ssr: false }),
  "orbit-ring-gallery": dynamic(() => import("../../../../packages/core/src/components/orbit-ring-gallery"), { ssr: false }),
  "apparatus-venetian-blinds": dynamic(() => import("../../../../packages/core/src/components/apparatus-venetian-blinds"), { ssr: false }),
  "apparatus-accordion-wall": dynamic(() => import("../../../../packages/core/src/components/apparatus-accordion-wall"), { ssr: false }),
  "apparatus-parallax-column": dynamic(() => import("../../../../packages/core/src/components/apparatus-parallax-column"), { ssr: false }),
  "apparatus-layout-morph": dynamic(() => import("../../../../packages/core/src/components/apparatus-layout-morph"), { ssr: false }),
  "apparatus-erosion-map": dynamic(() => import("../../../../packages/core/src/components/apparatus-erosion-map"), { ssr: false }),
  "apparatus-dual-wave": dynamic(() => import("../../../../packages/core/src/components/apparatus-dual-wave"), { ssr: false }),
  "apparatus-clip-morph": dynamic(() => import("../../../../packages/core/src/components/apparatus-clip-morph"), { ssr: false }),
  "apparatus-phase-drift": dynamic(() => import("../../../../packages/core/src/components/apparatus-phase-drift"), { ssr: false }),
  "apparatus-depth-swim": dynamic(() => import("../../../../packages/core/src/components/apparatus-depth-swim"), { ssr: false }),
  "apparatus-cylinder-scroll": dynamic(() => import("../../../../packages/core/src/components/apparatus-cylinder-scroll"), { ssr: false }),
  "apparatus-focus-ring": dynamic(() => import("../../../../packages/core/src/components/apparatus-focus-ring"), { ssr: false }),
  "apparatus-cursor-wake": dynamic(() => import("../../../../packages/core/src/components/apparatus-cursor-wake"), { ssr: false }),
  "apparatus-page-fade-shift": dynamic(() => import("../../../../packages/core/src/components/apparatus-page-fade-shift"), { ssr: false }),
  "apparatus-page-overlay-wipe": dynamic(() => import("../../../../packages/core/src/components/apparatus-page-overlay-wipe"), { ssr: false })
};


export function getComponent(slug: string) {
  const meta = COMPONENT_DETAILS[slug];
  if (meta && !meta.previewType) {
    if (meta.category === "scroll") {
      meta.previewType = "scroll";
    } else if (meta.category === "gallary") {
      meta.previewType = "gallery";
    } else if (meta.category === "transition") {
      meta.previewType = "transition";
    } else if (meta.category === "text") {
      meta.previewType = "text";
    } else {
      meta.previewType = "shader";
    }
  }
  const Component = COMPONENT_IMPORTS[slug];
  return { Component, meta };
}
