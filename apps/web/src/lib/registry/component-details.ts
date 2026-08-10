import { ComponentDetail } from "./types";

export const COMPONENT_DETAILS: Record<string, ComponentDetail> = {
  "japparii": {
    id: "01",
    label: "JAPPARII",
    filename: "Image(shader)/japparii.webp",
    desc: "A hand-drawn Leonardo sketch paper shader rendering image luminance as dynamic cross-hatching diagonal strokes.",
    slug: "japparii",
    category: "image",
    subtype: "scrolls"
  },
  "chromepunk-beast": {
    id: "02",
    label: "CHROMEPUNK BEAST",
    filename: "Image(shader)/chromepunk-beast.webp",
    desc: "A specular normal-mapped canvas calculating height profiles and embossing shadows on the fly via Sobel filters.",
    slug: "chromepunk-beast",
    category: "image",
    subtype: "radar-plates"
  },
  "merlin-knights": {
    id: "07",
    label: "MERLIN KNIGHTS",
    filename: "Image(shader)/merlin-knights.webp",
    desc: "A Renaissance copperplate engraving sketch. The cursor causes paint to bleed through raw parchment paper fibers, gradually drying back to sepia when resting.",
    slug: "merlin-knights",
    category: "image",
    subtype: "engravings",
    tags: ["Engraving", "Wind Physics", "Alchemical Bleed"],
    controls: [
      { type: "slider", key: "windSpeed", label: "Wind Simulation", default: 0.8, min: 0.1, max: 3.0, step: 0.1, unit: "m/s" }
    ]
  },
  "acg-fleece": {
    id: "09",
    label: "ACG FLEECE",
    filename: "Image(shader)/acg-fleece.webp",
    desc: "A global physical bas-relief shader that embosses the image contours in 3D, casting shadows and specular glints dynamically from a cursor-controlled studio light.",
    slug: "acg-fleece",
    category: "image",
    subtype: "radar-plates"
  },
  "apparatus-dee": {
    id: "10",
    label: "APPARATUS DEE",
    filename: "Image(shader)/dee.webp",
    desc: "A molten chrome & liquid mercury flow shader. Warps coordinates in viscous waves and shifts anisotropic studio reflections. Best used with high-contrast, metallic, chrome, or reflective images to maximize the liquid-metal sheen.",
    slug: "apparatus-dee",
    category: "image",
    subtype: "liquid-metal"
  },
  "core-shell-b": {
    id: "12",
    label: "CORE SHELL B",
    filename: "Image(shader)/download (2).webp",
    desc: "Physical expanding water wave ripples generated dynamically by mouse clicks on the canvas.",
    slug: "core-shell-b",
    category: "image",
    subtype: "scanners"
  },
  "kinetic-portal": {
    id: "13",
    label: "KINETIC PORTAL",
    filename: "Image(shader)/download (3).webp",
    desc: "An infrared thermal heat vision spectrum shader mapped dynamically around the cursor.",
    slug: "kinetic-portal",
    category: "image",
    subtype: "scanners"
  },
  "apparatus-faf": {
    id: "14",
    label: "APPARATUS FAF",
    filename: "Image(shader)/faf.webp",
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
    filename: "Image(shader)/gg.webp",
    desc: "A 3D elastic membrane vertex pull mapping height protrusions and shadows to cursor coordinates.",
    slug: "apparatus-gg",
    category: "image",
    subtype: "canvases"
  },
  "apparatus-fblf": {
    id: "19",
    label: "APPARATUS FBLF",
    filename: "Image(shader)/fblf.webp",
    desc: "A 3D medieval knight silhouette displaying interactive depth light reflection.",
    slug: "apparatus-fblf",
    category: "image",
    subtype: "drapes"
  },
  "apparatus-fjvfba": {
    id: "20",
    label: "APPARATUS COPPER PATINA",
    filename: "Image(shader)/fjvfba.webp",
    desc: "An interactive medieval copperplate engraving shader. Renders a gleaming copperplate print with rich specular reflection and dark carbon grooves when idle. Hovering causes a rich blue-green verdigris patina to bloom and crawl along the engraved outlines.",
    slug: "apparatus-fjvfba",
    category: "image",
    subtype: "drapes",
    tags: ["Copperplate Etching", "Verdigris Patina", "Chemical Oxidation"]
  },
  "apparatus-ialfa": {
    id: "21",
    label: "APPARATUS IALFA",
    filename: "Image(shader)/i  alfa.webp",
    desc: "A holy knight rendered as a bas-relief stone carving that casts long, ray-marched shadows in response to a raking torchlight cursor.",
    slug: "apparatus-ialfa",
    category: "image",
    subtype: "drapes",
    tags: ["Stone Relief", "Dynamic Shadows", "Raking Torchlight"]
  },
  "apparatus-ll": {
    id: "22",
    label: "APPARATUS LL",
    filename: "Image(shader)/ll.webp",
    desc: "A demonic knight steel armor reflection shader responding to light coordinates.",
    slug: "apparatus-ll",
    category: "image",
    subtype: "drapes"
  },
  "apparatus-hoqnl": {
    id: "27",
    label: "APPARATUS HOQNL",
    filename: "Image(shader)/hoqnl.webp",
    desc: "A raw steel relief displacement shader.",
    slug: "apparatus-hoqnl",
    category: "image",
    subtype: "drapes"
  },
  "orbit-ring-gallery": {
    id: "36",
    label: "ORBIT RING GALLERY",
    filename: "Gallary/cosmos_145253936.webp",
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
    filename: "Transitions/ChatGPT Image Jul 15, 2026, 05_54_47 PM.webp",
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
    filename: "Transitions/ChatGPT Image Jul 15, 2026, 05_26_02 PM.webp",
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
    filename: "scroll/cosmos_1859262512.webp",
    desc: "A split-screen vertical runway where left and right columns travel in opposite directions, revealing unclipped images as they cross the viewport center.",
    slug: "apparatus-parallax-column",
    category: "scroll",
    subtype: "transition",
    tags: ["GSAP", "Lenis", "Split Scroll", "Clip Path"],
    previewType: "scroll",
    controls: [
      {
        type: "select",
        key: "motionVariant",
        label: "Motion Variant",
        default: "classic",
        options: [
          { label: "Classic Window Parallax", value: "classic" },
          { label: "3D Concave Cylinder (Inward)", value: "cylinder" },
          { label: "3D Convex Cylinder (Outward)", value: "convex" }
        ]
      },
      {
        type: "slider",
        key: "cropAmount",
        label: "Image Framing Crop",
        default: 15,
        min: 5,
        max: 25,
        step: 1,
        unit: "%",
        dependsOn: { key: "motionVariant", value: "classic" }
      },
      {
        type: "slider",
        key: "concaveDepth",
        label: "Inward Z-Depth",
        default: 520,
        min: 200,
        max: 800,
        step: 10,
        unit: "px",
        dependsOn: { key: "motionVariant", value: "cylinder" }
      },
      {
        type: "slider",
        key: "concaveTilt",
        label: "Inward Pitch Angle",
        default: 42,
        min: 10,
        max: 60,
        step: 1,
        unit: "°",
        dependsOn: { key: "motionVariant", value: "cylinder" }
      },
      {
        type: "slider",
        key: "convexBulge",
        label: "Outward Z-Bulge",
        default: 480,
        min: 200,
        max: 800,
        step: 10,
        unit: "px",
        dependsOn: { key: "motionVariant", value: "convex" }
      },
      {
        type: "slider",
        key: "convexTilt",
        label: "Outward Pitch Angle",
        default: 38,
        min: 10,
        max: 60,
        step: 1,
        unit: "°",
        dependsOn: { key: "motionVariant", value: "convex" }
      },
      { type: "slider", key: "parallaxIntensity", label: "Parallax Intensity", default: 70, min: 0, max: 100, step: 5, unit: "%" },
      { type: "slider", key: "borderRadius", label: "Corner Radius", default: 8, min: 0, max: 32, step: 1, unit: "px" },
      { type: "slider", key: "speedFactor", label: "Parallax Speed", default: 1.0, min: 0.5, max: 2.0, step: 0.1 },
      { type: "slider", key: "splitRatio", label: "Column Split Ratio", default: 50, min: 25, max: 75, step: 1, unit: "%" },
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
    filename: "scroll/cosmos_1225764898.webp",
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
    filename: "scroll/cosmos_1207399578.webp",
    desc: "Images erode organically based on a Perlin noise field driven by scroll progress, revealing layers below with textured weathering patterns and active edge glowing.",
    slug: "apparatus-erosion-map",
    category: "scroll",
    subtype: "gallery",
    tags: ["GSAP", "Scroll", "Canvas 2D", "Perlin Noise"],
    previewType: "scroll",
    controls: [
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
      { type: "slider", key: "erosionDamper", label: "Erosion Fluid Damper", default: 1.0, min: 0.1, max: 10.0, step: 0.1 },
      { type: "slider", key: "noiseScale", label: "Erosion Scale", default: 0.005, min: 0.001, max: 0.02, step: 0.001 },
      { type: "slider", key: "edgeGlow", label: "Edge Brightness", default: 1.5, min: 0, max: 3, step: 0.1 },
      { type: "slider", key: "octaves", label: "Perlin Octaves", default: 3, min: 1, max: 6, step: 1 },
      { type: "slider", key: "curvePower", label: "Curve Easing Power", default: 1.0, min: 0.5, max: 4.0, step: 0.1 }
    ]
  },
  "apparatus-dual-wave": {
    id: "44",
    label: "APPARATUS DUAL WAVE",
    filename: "scroll/cosmos_679994644.webp",
    desc: "Two columns of text names flanking a center image. Names slide horizontally along a sine wave as you scroll, flanking a center image that swaps source to match the active viewport item.",
    slug: "apparatus-dual-wave",
    category: "scroll",
    subtype: "index",
    tags: ["GSAP", "Scroll", "Sine Wave", "Typography"],
    previewType: "scroll",
    controls: [
      {
        type: "select",
        key: "wavePattern",
        label: "Wave Path Pattern",
        default: "iris",
        options: [
          { label: "Lens Focus", value: "iris" },
          { label: "Split Horizon", value: "horizon" },
          { label: "Center Pinch", value: "hourglass" },
          { label: "Sine Wave", value: "dualSine" },
          { label: "Spiral Funnel", value: "vortex" },
          { label: "Diagonal Slant", value: "shear" }
        ]
      },
      { type: "slider", key: "scrollDamping", label: "Scroll Damping", default: 0.08, min: 0.01, max: 0.30, step: 0.005 },
      { type: "slider", key: "spacing", label: "Text Item Spacing", default: 72, min: 35, max: 150, step: 1, unit: "px" },
      { type: "slider", key: "maxBlur", label: "Depth Blur", default: 2.5, min: 0, max: 10, step: 0.1, unit: "px" },
      { type: "slider", key: "amplitude", label: "Lens Flare Range", default: 90, min: 20, max: 200, step: 1, unit: "px", dependsOn: { key: "wavePattern", value: "iris" } },
      { type: "slider", key: "curvature", label: "Lens Curve Softness", default: 0.50, min: 0.1, max: 1.0, step: 0.01, dependsOn: { key: "wavePattern", value: "iris" } },
      { type: "slider", key: "maxRotation", label: "Lens Tilt Angle", default: 7.5, min: 0, max: 30, step: 0.1, unit: "°", dependsOn: { key: "wavePattern", value: "iris" } },
      { type: "slider", key: "amplitude", label: "Horizon Spread", default: 85, min: 10, max: 180, step: 1, unit: "px", dependsOn: { key: "wavePattern", value: "horizon" } },
      { type: "slider", key: "curvature", label: "Slope Angle", default: 0.60, min: 0.1, max: 1.5, step: 0.01, dependsOn: { key: "wavePattern", value: "horizon" } },
      { type: "slider", key: "maxRotation", label: "Horizon Tilt", default: 7.0, min: 0, max: 25, step: 0.1, unit: "°", dependsOn: { key: "wavePattern", value: "horizon" } },
      { type: "slider", key: "amplitude", label: "Pinch Width Range", default: 75, min: 10, max: 150, step: 1, unit: "px", dependsOn: { key: "wavePattern", value: "hourglass" } },
      { type: "slider", key: "curvature", label: "Curvature Profile", default: 0.35, min: 0.0, max: 1.0, step: 0.01, dependsOn: { key: "wavePattern", value: "hourglass" } },
      { type: "slider", key: "maxRotation", label: "Tilt Angle", default: 6.5, min: 0, max: 30, step: 0.1, unit: "°", dependsOn: { key: "wavePattern", value: "hourglass" } },
      { type: "slider", key: "cornerAlignment", label: "Corner Alignment", default: 1.0, min: 0, max: 1.0, step: 0.01, dependsOn: { key: "wavePattern", value: "hourglass" } },
      { type: "slider", key: "frequency", label: "Sine Frequency", default: 1.8, min: 0.5, max: 5.0, step: 0.1, dependsOn: { key: "wavePattern", value: "dualSine" } },
      { type: "slider", key: "amplitude", label: "Sine Amplitude", default: 70, min: 10, max: 150, step: 1, unit: "px", dependsOn: { key: "wavePattern", value: "dualSine" } },
      { type: "slider", key: "waveNum", label: "Wave Density", default: 0.45, min: 0.1, max: 1.0, step: 0.01, dependsOn: { key: "wavePattern", value: "dualSine" } },
      { type: "slider", key: "maxRotation", label: "Tangential Tilt", default: 6.5, min: 0, max: 30, step: 0.1, unit: "°", dependsOn: { key: "wavePattern", value: "dualSine" } },
      { type: "slider", key: "curvature", label: "Funnel Curve Power", default: 0.85, min: 0.2, max: 2.5, step: 0.05, dependsOn: { key: "wavePattern", value: "vortex" } },
      { type: "slider", key: "amplitude", label: "Funnel Depth Range", default: 90, min: 20, max: 200, step: 1, unit: "px", dependsOn: { key: "wavePattern", value: "vortex" } },
      { type: "slider", key: "maxRotation", label: "Funnel Twist Angle", default: 12.0, min: 0, max: 45, step: 0.5, unit: "°", dependsOn: { key: "wavePattern", value: "vortex" } },
      { type: "slider", key: "maxRotation", label: "Slant Angle", default: 10.0, min: 0, max: 35, step: 0.5, unit: "°", dependsOn: { key: "wavePattern", value: "shear" } },
      { type: "slider", key: "amplitude", label: "Corridor Width", default: 70, min: 10, max: 150, step: 1, unit: "px", dependsOn: { key: "wavePattern", value: "shear" } }
    ]
  },
  "apparatus-clip-morph": {
    id: "45",
    label: "APPARATUS CLIP MORPH",
    filename: "Transitions/ChatGPT Image Jul 16, 2026, 06_08_32 PM.webp",
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
    filename: "scroll/cosmos_1591705408.webp",
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
    filename: "scroll/cosmos_1994819013.webp",
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
    filename: "scroll/cosmos_1452408749.webp",
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
    filename: "scroll/cosmos_1309660817.webp",
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
    filename: "scroll/cosmos_679994644.webp",
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
    filename: "Transitions/ChatGPT Image Jul 15, 2026, 05_26_02 PM.webp",
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
    filename: "Transitions/ChatGPT Image Jul 15, 2026, 05_29_20 PM.webp",
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
  },
  "apparatus-3d-typography-grid": {
    id: "56",
    label: "APPARATUS 3D TYPOGRAPHY GRID",
    filename: "",
    desc: "A monumental 3D extruded wireframe letterform or custom word that rotates in 3D spatial depth on scroll.",
    slug: "apparatus-3d-typography-grid",
    category: "text",
    subtype: "text",
    tags: ["GSAP", "Typography", "3D", "Wireframe", "Monumental"],
    controls: [
      { type: "select", key: "motionMode", label: "3D Motion Mode", default: "wave", options: [
        { label: "WAVE (3D Sine Floating)", value: "wave" },
        { label: "ORBIT (Pure 360° Spin)", value: "orbit" },
        { label: "DRIFT (3D Depth Pulse)", value: "drift" },
        { label: "VORTEX (Helical Twist)", value: "vortex" }
      ] },
      { type: "select", key: "presetWord", label: "Word Preset", default: "", options: [
        { label: "NONE (Single Letter)", value: "" },
        { label: "ABYSS", value: "ABYSS" },
        { label: "KINETIC", value: "KINETIC" },
        { label: "VORTEX", value: "VORTEX" },
        { label: "HYPER", value: "HYPER" },
        { label: "MATRIX", value: "MATRIX" },
        { label: "CYBER", value: "CYBER" },
        { label: "COSMOS", value: "COSMOS" },
        { label: "VECTOR", value: "VECTOR" },
        { label: "POINT", value: "POINT" }
      ] },
      { type: "select", key: "presetLetter", label: "Single Letter", default: "A", options: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"].map(l => ({ label: l, value: l })) },
      { type: "slider", key: "rotationSpeed", label: "3D Rotation Speed", default: 1.0, min: 0.2, max: 3.0, step: 0.1 },
      { type: "slider", key: "wireframeDepth", label: "3D Extrusion Depth", default: 7, min: 2, max: 30, step: 1 }
    ]
  },
  "apparatus-cinematic-unstack": {
    id: "57",
    label: "APPARATUS CINEMATIC UNSTACK",
    filename: "scroll/cosmos_1067833670.webp",
    desc: "A pinned stack of image cards where scrolling lifts each top card upward with 3D tilt, scale shrink, and opacity fade, revealing the next card with an intentional 15% dwell phase.",
    slug: "apparatus-cinematic-unstack",
    category: "scroll",
    subtype: "stack",
    tags: ["GSAP", "ScrollTrigger", "3D Perspective", "Cinematic Stack", "Dwell Phase"],
    previewType: "scroll",
    controls: [
      { type: "select", key: "variant", label: "Kinetic Motion Variant", default: "cinematic-unstack", options: [
        { label: "CINEMATIC UNSTACK (Parallax Lift)", value: "cinematic-unstack" },
        { label: "HELICAL FAN (3D Spiral Spin)", value: "helical-fan" },
        { label: "HYPER ORIGAMI (3D Unfold & Surge)", value: "hyper-origami" },
        { label: "VESSEL CURTAIN (Theatrical Pitch Roll)", value: "vessel-curtain" },
        { label: "PRISM SHUTTER (3D Shear Slide)", value: "prism-shutter" },
        { label: "QUANTUM WARP (Gravitational Wormhole)", value: "quantum-warp" },
        { label: "VORTEX PEEL (Helical Spin Dive)", value: "vortex-peel" }
      ] },
      { type: "slider", key: "cardCount", label: "Stack Depth", default: 6, min: 3, max: 12, step: 1 },
      { type: "slider", key: "parallaxIntensity", label: "Internal Image Parallax", default: 35, min: 0, max: 80, step: 5, unit: "%" },
      { type: "slider", key: "cardBendAmount", label: "Velocity Card Bend Arc", default: 35, min: 0, max: 100, step: 2, unit: "px" },
      { type: "slider", key: "tiltAngle", label: "Backward Pitch Angle", default: 10, min: 0, max: 45, step: 1, unit: "°" },
      { type: "slider", key: "scrollSensitivity", label: "Scroll Travel Pace", default: 20, min: 5, max: 100, step: 5 },
      { type: "slider", key: "exitScale", label: "Exit Scale Reduction", default: 0.80, min: 0.30, max: 1.0, step: 0.05 },
      { type: "slider", key: "exitOpacity", label: "Exit Opacity Fade", default: 1.0, min: 0.0, max: 1.0, step: 0.05 },
      { type: "slider", key: "borderRadius", label: "Corner Radius", default: 20, min: 0, max: 50, step: 2, unit: "px" },
      { type: "slider", key: "perspective", label: "3D Perspective Depth", default: 1200, min: 300, max: 2500, step: 50, unit: "px" }
    ]
  },
  "apparatus-parallax-bleed": {
    id: "60",
    label: "APPARATUS PARALLAX BLEED",
    filename: "scroll/p1.webp",
    desc: "4 full-bleed image sections stacked sequentially with deep internal parallax bounds, virtual camera momentum, and weighted layer micro-latency.",
    slug: "apparatus-parallax-bleed",
    category: "scroll",
    subtype: "full-bleed",
    tags: ["GSAP", "ScrollTrigger", "Parallax", "Full Bleed", "Cinematic", "Physics"],
    previewType: "scroll",
    controls: [
      { type: "slider", key: "parallaxIntensity", label: "INTERNAL PARALLAX INTENSITY", default: 45, min: 10, max: 100, step: 5, unit: "%" },
      { type: "slider", key: "scrollSpeed", label: "SCROLL MOMENTUM SENSITIVITY", default: 1.0, min: 0.2, max: 3.0, step: 0.1, unit: "x" },
      { type: "slider", key: "inertialDamping", label: "SCROLL DAMPING SMOOTHNESS", default: 6.0, min: 1.5, max: 12.0, step: 0.5 },
      { type: "slider", key: "mouseDrift", label: "CURSOR LAG DRIFT DISTANCE", default: 6, min: 0, max: 30, step: 2, unit: "px" },
      { type: "slider", key: "blurDepth", label: "BOTTOM PROGRESSIVE BLUR DEPTH", default: 280, min: 120, max: 400, step: 20, unit: "px" },
      { type: "select", key: "indicatorStyle", label: "SIDE PROGRESS INDICATOR", default: "dashes", options: [{ label: "Precision Segmented Dashes", value: "dashes" }, { label: "Micro Radar Dots", value: "dots" }, { label: "Hidden / Pure Minimalist", value: "hidden" }] },
      { type: "slider", key: "imageBrightness", label: "IMAGE BRIGHTNESS BALANCE", default: 90, min: 50, max: 120, step: 5, unit: "%" }
    ]
  },
  "apparatus-gravity-cursor": {
    id: "61",
    label: "APPARATUS GRAVITY CURSOR",
    filename: "Gallary/cosmos_1110264921.webp",
    desc: "Interactive physics-driven cursor gallery where clicking or hold-dragging stream-spawns image bodies that fall with gravity, bounce elastically on the spatial floor, and dissolve cleanly.",
    slug: "apparatus-gravity-cursor",
    category: "gallary",
    subtype: "interactive-physics",
    tags: ["Cursor", "Gravity", "Physics", "Gallery", "Interactive", "Bounce"],
    previewType: "gallery",
    controls: [
      { type: "select", key: "gravityMode", label: "GRAVITY PHYSICS MODE", default: "normal", options: [{ label: "Normal Gravity", value: "normal" }, { label: "Zero-Gravity Float", value: "zero-gravity" }, { label: "Magnetic Forcefield Shield", value: "magnetic-repulsor" }] },
      { type: "select", key: "interactionMode", label: "SPAWN TRIGGER", default: "hold-drag", options: [{ label: "Click / Hold & Drag", value: "hold-drag" }, { label: "Continuous Cursor Trail", value: "cursor-trail" }], dependsOn: { key: "gravityMode", value: ["normal", "zero-gravity"] } },
      { type: "slider", key: "gravity", label: "Gravitational Acceleration", default: 0.55, min: 0.1, max: 2.5, step: 0.05, dependsOn: { key: "gravityMode", value: "normal" } },
      { type: "slider", key: "bounceDamping", label: "Floor Elasticity / Bounce", default: 0.62, min: 0.05, max: 0.95, step: 0.05, dependsOn: { key: "gravityMode", value: "normal" } },
      { type: "slider", key: "spawnInterval", label: "Hold Stream Rate", default: 55, min: 20, max: 200, step: 5, unit: "ms", dependsOn: { key: "gravityMode", value: ["normal", "zero-gravity"] } },
      { type: "slider", key: "repelRadius", label: "Forcefield Repel Radius", default: 350, min: 150, max: 600, step: 10, unit: "px", dependsOn: { key: "gravityMode", value: "magnetic-repulsor" } },
      { type: "slider", key: "repelForce", label: "Repulsion Shockwave Power", default: 9.2, min: 1.0, max: 25.0, step: 0.5, dependsOn: { key: "gravityMode", value: "magnetic-repulsor" } },
      { type: "slider", key: "friction", label: "Space Slide Damping", default: 0.92, min: 0.80, max: 0.99, step: 0.01, dependsOn: { key: "gravityMode", value: "magnetic-repulsor" } },
      { type: "slider", key: "maxItems", label: "Memory Pool Cap", default: 45, min: 10, max: 100, step: 5 },
      { type: "slider", key: "imageSize", label: "Shape Scale Width", default: 140, min: 70, max: 300, step: 5, unit: "px" }
    ]
  },
  "apparatus-3d-shatter-sphere": {
    id: "62",
    label: "APPARATUS 3D SHATTER SPHERE",
    filename: "Gallary/cosmos_1110264921.webp",
    desc: "Interactive 3D gallery sphere distributed in Fibonacci spatial bounds. Drag to rotate in 3D perspective space, click to trigger a 3D explosion shatter into spatial tile fragments.",
    slug: "apparatus-3d-shatter-sphere",
    category: "gallary",
    subtype: "3d-interactive",
    tags: ["3D", "Sphere", "Shatter", "Explosion", "Gallery", "WebGL"],
    previewType: "gallery",
    controls: [
      { type: "select", key: "shapeMode", label: "3D GEOMETRY SHAPE", default: "sphere", options: [{ label: "3D Sphere Shell", value: "sphere" }, { label: "3D Cube Monolith (6 Faces)", value: "cuboid" }, { label: "3D Cuboid Grid (24 Panels)", value: "cuboid-grid" }] },
      { type: "slider", key: "sphereRadius", label: "3D Structure Radius", default: 420, min: 200, max: 650, step: 10, unit: "px" },
      { type: "slider", key: "shatterForce", label: "Explosion Shatter Force", default: 1.8, min: 0.5, max: 3.5, step: 0.1 },
      { type: "slider", key: "cardScale", label: "Tile Card Scale", default: 1.05, min: 0.5, max: 2.0, step: 0.05 },
      { type: "slider", key: "itemCount", label: "3D Card Sphere Count", default: 42, min: 20, max: 60, step: 2, dependsOn: { key: "shapeMode", value: "sphere" } },
      { type: "slider", key: "autoRotateSpeed", label: "Idle Spin Momentum", default: 0.5, min: 0, max: 2.5, step: 0.05 }
    ]
  },
  "apparatus-origin-expand": {
    id: "37",
    label: "APPARATUS ORIGIN EXPAND",
    filename: "Transitions/ChatGPT Image Jul 16, 2026, 06_08_32 PM.webp",
    desc: "Dynamic route transition expanding clicked element rectangle into full-viewport background mask before revealing destination.",
    slug: "apparatus-origin-expand",
    category: "transition",
    subtype: "origin-expand",
    tags: ["GSAP", "Transition", "Origin", "BoundingRect"],
    previewType: "transition",
    controls: [
      {
        type: "select",
        key: "easingCurve",
        label: "Easing Momentum",
        default: "vessel-smooth",
        options: [
          { label: "Vessel Smooth (Cubic Bezier 0.19)", value: "vessel-smooth" },
          { label: "Luxury Smooth (Cubic Bezier 0.22)", value: "cubic-luxury" },
          { label: "Elastic Momentum (Back Out)", value: "elastic-spring" },
          { label: "Expo Power (Expo Out)", value: "expo-power" }
        ]
      },
      { type: "slider", key: "expandDuration", label: "Morph Duration", default: 600, min: 200, max: 1500, step: 50, unit: "ms" },
      { type: "slider", key: "bgBlurAmount", label: "Z-Space Depth Blur", default: 14, min: 0, max: 30, step: 1, unit: "px" },
      { type: "slider", key: "bgScaleRecede", label: "Z-Space Scale Recede", default: 0.93, min: 0.75, max: 1.0, step: 0.01 },
      { type: "slider", key: "overlayDimmer", label: "Z-Space Dimmer", default: 0.35, min: 0.0, max: 1.0, step: 0.05 },
      { type: "slider", key: "cardScaleActive", label: "Active Card Scale", default: 1.08, min: 1.0, max: 1.25, step: 0.01 },
      { type: "toggle", key: "autoPlay", label: "Auto Cycle Routes", default: false },
      { type: "slider", key: "autoPlayInterval", label: "Auto Cycle Speed", default: 5000, min: 2000, max: 10000, step: 500, unit: "ms" }
    ]
  },
  "apparatus-turbulence-lens": {
    id: "63",
    label: "APPARATUS TURBULENCE LENS",
    filename: "SVG/rajudin-hax-7bN-W2xONP4-unsplash.webp",
    desc: "Organic SVG feTurbulence + feDisplacementMap fluid distortion lens reacting to cursor proximity and scroll velocity.",
    slug: "apparatus-turbulence-lens",
    category: "svg",
    subtype: "svg-fluid",
    tags: ["SVG", "Filter", "GSAP", "Turbulence", "Cursor", "Scroll", "Physics"],
    previewType: "svg",
    controls: [
      { type: "select", key: "layoutMode", label: "Layout Composition", default: "split", options: [{ label: "Split Grid", value: "split" }, { label: "Hero Overlay", value: "overlay" }, { label: "Full Bleed", value: "full-bleed" }] },
      { type: "slider", key: "ambientDisplacement", label: "Ambient Displacement", default: 5, min: 0, max: 10, step: 0.5, unit: "px" },
      { type: "slider", key: "lensDisplacement", label: "Lens Displacement", default: 25, min: 0, max: 50, step: 1, unit: "px" },
      { type: "slider", key: "lensRadius", label: "Lens Radius", default: 160, min: 50, max: 300, step: 10, unit: "px" },
      { type: "slider", key: "noiseFrequency", label: "Noise Frequency", default: 0.012, min: 0.005, max: 0.05, step: 0.001 },
      { type: "slider", key: "noiseOctaves", label: "Noise Octaves", default: 3, min: 1, max: 5, step: 1 },
      { type: "slider", key: "lensFollowSpeed", label: "Lens Lag Duration", default: 0.3, min: 0.1, max: 1.0, step: 0.05, unit: "s" },
      { type: "slider", key: "scrollVelocityEffect", label: "Scroll Velocity Scale", default: 0.5, min: 0, max: 2.0, step: 0.1, unit: "x" },
      { type: "toggle", key: "enableCursorLens", label: "Enable Cursor Lens", default: true }
    ]
  },
  "apparatus-ripple-scramble": {
    id: "65",
    label: "APPARATUS RIPPLE SCRAMBLE",
    filename: "text/apparatus-ripple-scramble.webp",
    desc: "A high-agency multi-column editorial layout where clicking anywhere fires a 360° radial shockwave that scrambles text into curated mathematical glyphs and lifts them on a fluid vertical curve before decoding with crystal focus-pull sharpness.",
    slug: "apparatus-ripple-scramble",
    category: "text",
    subtype: "text-wave",
    tags: ["Typography", "Math Glyphs", "Wave Energy", "Focus Pull", "Editorial"],
    previewType: "text",
    controls: [
      {
        type: "select",
        key: "variant",
        label: "Acoustic Field Variant",
        default: "classic",
        options: [
          { label: "Classic — Pristine 360° Water Wave", value: "classic" },
          { label: "Singularity — Gravitational Lensing Quadrupole", value: "singularity" },
          { label: "Editorial — Vessel Monolith Warm Gold Scanline", value: "editorial" },
          { label: "Matrix — Cyberpunk Phosphor Rain", value: "matrix" },
          { label: "Quantum — Field Interference Rays", value: "quantum" },
          { label: "Nebula — Hyper-Cosmic Diamond Lattice", value: "nebula" }
        ]
      },
      { type: "slider", key: "waveSpeed", label: "Wave Propagation Speed", default: 950, min: 400, max: 2000, step: 50, unit: "px/s" },
      { type: "slider", key: "ringWidth", label: "Shockwave Band Width", default: 60, min: 20, max: 160, step: 5, unit: "px" },
      { type: "slider", key: "ripplePower", label: "Vertical Crest Lift", default: 4, min: 0, max: 16, step: 1, unit: "px" },
      { type: "slider", key: "scrambleDuration", label: "Decode Hold Duration", default: 340, min: 80, max: 800, step: 20, unit: "ms" },
      { type: "slider", key: "fontSize", label: "Base Typography Size", default: 16, min: 12, max: 26, step: 1, unit: "px" },
      { type: "slider", key: "lineHeightScale", label: "Line Rhythm Multiplier", default: 1.65, min: 1.3, max: 2.2, step: 0.05, unit: "x" },
      { type: "slider", key: "staticOpacity", label: "Resting Field Opacity", default: 0.32, min: 0.10, max: 0.80, step: 0.02, unit: "" },
      { type: "slider", key: "wakeRadius", label: "Cursor Wake Radius", default: 40, min: 15, max: 100, step: 5, unit: "px" }
    ]
  },
  "apparatus-arc-drift-gallery": {
    id: "42",
    label: "APPARATUS ARC DRIFT GALLERY",
    filename: "scroll/p1_hq.webp",
    desc: "A slow procession of photographs drifting along an invisible horizon arc where background landscapes dissolve to match the centered image.",
    slug: "apparatus-arc-drift-gallery",
    category: "scroll",
    subtype: "gallery",
    tags: ["Gallery", "Arc Drift", "ScrollTrigger", "Background Crossfade", "Editorial"],
    controls: [
      {
        type: "select",
        key: "motionVariant",
        label: "Motion Trajectory Variant",
        default: "classic-arc",
        options: [
          { label: "Classic Horizon Arc (Default)", value: "classic-arc" },
          { label: "Panoramic Film Ribbon", value: "panoramic-ribbon" }
        ]
      },
      { type: "slider", key: "scrollSpeed", label: "Scroll Speed", default: 0.5, min: 0.1, max: 2.0, step: 0.1, unit: "x" },
      { type: "slider", key: "arcHeight", label: "Arc Height", default: 45, min: 10, max: 50, step: 5, unit: "vh" },
      { type: "slider", key: "bgOpacity", label: "Background Opacity", default: 0.80, min: 0.1, max: 1.0, step: 0.05, unit: "" },
      { type: "slider", key: "crossfadeDuration", label: "Crossfade Duration", default: 0.6, min: 0.2, max: 1.5, step: 0.1, unit: "s" },
      { type: "slider", key: "thumbnailWidth", label: "Thumbnail Width", default: 180, min: 120, max: 280, step: 10, unit: "px" }
    ]
  },
  "apparatus-curved-scroll-wipe": {
    id: "68",
    label: "CURVED SCROLL WIPE",
    filename: "",
    desc: "A scroll-driven multi-section website transition using dynamic SVG curved path clip masks that morph elastically on scroll progress.",
    slug: "apparatus-curved-scroll-wipe",
    category: "transition",
    subtype: "curved-wipe",
    tags: ["Scroll", "SVG Path", "Clip Path", "Transition", "Multi-Section"],
    previewType: "transition",
    controls: [
      { type: "slider", key: "curveDepth", label: "Elastic Curve Sag Depth", default: 0.28, min: 0.05, max: 0.50, step: 0.01 },
      { type: "slider", key: "scrollSpeed", label: "Scroll Inertia Sensitivity", default: 1.0, min: 0.5, max: 2.0, step: 0.1, unit: "x" }
    ]
  },
  "apparatus-image-snake-trail": {
    id: "69",
    label: "IMAGE SNAKE TRAIL",
    filename: "Gallary/gallery-1.webp",
    desc: "Serpentine image chain following cursor with physics momentum and scale decay.",
    slug: "apparatus-image-snake-trail",
    category: "gallary",
    subtype: "snake-trail",
    tags: ["Gallery", "Cursor Trail", "Physics", "Snake", "GSAP"],
    controls: [
      { type: "slider", key: "worldSize", label: "World Map Size", default: 12000, min: 4000, max: 20000, step: 500, unit: "px" },
      { type: "slider", key: "initialLength", label: "Initial Trail Length", default: 5, min: 3, max: 12, step: 1 },
      { type: "slider", key: "collectibleCount", label: "World Food Count", default: 60, min: 15, max: 150, step: 5 },
      { type: "slider", key: "segmentSize", label: "Image Size", default: 160, min: 80, max: 280, step: 10, unit: "px" },
      { type: "slider", key: "speed", label: "Snake Speed", default: 220, min: 80, max: 600, step: 20, unit: "px/s" },
      { type: "slider", key: "damping", label: "Motion Damping", default: 0.15, min: 0.05, max: 0.45, step: 0.01 },
      { type: "slider", key: "stepDistance", label: "Step Distance", default: 40, min: 0, max: 120, step: 5, unit: "px" },
      { type: "slider", key: "zoom", label: "Camera Zoom", default: 1.0, min: 0.45, max: 1.35, step: 0.05, unit: "x" }
    ]
  },
  "apparatus-3d-cursor-trail": {
    id: "70",
    label: "ABYSS CURSOR FALL",
    filename: "Gallary/gallery-1.webp",
    desc: "Kinetic 3D image spawner plunging floating WebP & SVG cards into a deep atmospheric 3D void on cursor movement.",
    slug: "apparatus-3d-cursor-trail",
    category: "gallary",
    subtype: "3d-spawner",
    tags: ["Gallery", "Cursor Spawner", "3D", "Three.js", "WebGL", "Physics"],
    controls: [
      { type: "slider", key: "spawnDistance", label: "Spawn Distance", default: 50, min: 15, max: 180, step: 5, unit: "px" },
      { type: "slider", key: "spawnInterval", label: "Spawn Cooldown", default: 110, min: 30, max: 400, step: 10, unit: "ms" },
      { type: "slider", key: "imageSize", label: "3D Image Size", default: 2.4, min: 0.5, max: 4.5, step: 0.1 },
      { type: "slider", key: "lifespan", label: "Card Lifespan", default: 3.0, min: 1.0, max: 6.0, step: 0.2, unit: "s" },
      { type: "slider", key: "fallSpeed", label: "Void Fall Speed", default: 2.4, min: 0.5, max: 8.0, step: 0.5 },
      { type: "slider", key: "cameraParallax", label: "3D Camera Parallax", default: 2.8, min: 0.5, max: 6.0, step: 0.2 }
    ]
  },
  "apparatus-scroll-text-reveal": {
    id: "71",
    label: "3D REEL TEXT",
    filename: "",
    desc: "Two-section text component shell with header hero and active component canvas.",
    slug: "apparatus-scroll-text-reveal",
    category: "text",
    subtype: "reveal",
    tags: ["Text", "Scroll", "GSAP", "Typography"],
    controls: [
      { type: "slider", key: "speed", label: "Speed", default: 1.0, min: 0.2, max: 3.0, step: 0.1 },
      { type: "slider", key: "stagger", label: "Center Stagger", default: 0.20, min: 0.05, max: 0.5, step: 0.01, unit: "s" },
      { type: "slider", key: "fontSize", label: "Line 1 Size", default: 96, min: 48, max: 140, step: 4, unit: "px" },
      { type: "slider", key: "letterSpacing", label: "Letter Spacing", default: -2, min: -10, max: 10, step: 1, unit: "px" },
      { type: "slider", key: "lineHeight", label: "Line Height", default: 1.0, min: 0.8, max: 1.8, step: 0.05 },
      { type: "slider", key: "scrubSmoothness", label: "Scrub Weight", default: 0.8, min: 0.1, max: 2.0, step: 0.1, unit: "s" }
    ]
  }
};

