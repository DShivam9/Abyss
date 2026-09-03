import { ComponentDetail } from "./types";

export const COMPONENT_DETAILS: Record<string, ComponentDetail> = {
  "bas-relief-shadow": {
    id: "21",
    label: "Stone Bas-Relief",
    filename: "components/bas-relief-shadow/knight-stone-relief.webp",
    desc: "A holy knight rendered as a bas-relief stone carving that casts long, ray-marched shadows in response to a raking torchlight cursor.",
    slug: "bas-relief-shadow",
    category: "image",
    subtype: "drapes",
    tags: ["Stone Relief", "Dynamic Shadows", "Raking Torchlight"]
  },
  "bronze-transmutation": {
    id: "20",
    label: "Bronze Patina",
    filename: "components/bronze-transmutation/knight-engraving.webp",
    desc: "An interactive medieval copperplate engraving shader. Renders a gleaming copperplate print with rich specular reflection and dark carbon grooves when idle. Hovering causes a rich blue-green verdigris patina to bloom and crawl along the engraved outlines.",
    slug: "bronze-transmutation",
    category: "image",
    subtype: "drapes",
    tags: ["Copperplate Etching", "Verdigris Patina", "Chemical Oxidation"]
  },
  "japparii": {
    id: "01",
    label: "Leonardo Sketch",
    filename: "components/japparii/sketch-portrait.webp",
    desc: "A hand-drawn Leonardo sketch paper shader rendering image luminance as dynamic cross-hatching diagonal strokes.",
    slug: "japparii",
    category: "image",
    subtype: "scrolls"
  },
  "chromepunk-beast": {
    id: "02",
    label: "Chromepunk Normal Map",
    filename: "components/chromepunk-beast/chrome-portrait.webp",
    desc: "A specular normal-mapped canvas calculating height profiles and embossing shadows on the fly via Sobel filters.",
    slug: "chromepunk-beast",
    category: "image",
    subtype: "radar-plates"
  },
  "merlin-knights": {
    id: "07",
    label: "Knight Wind Banner",
    filename: "components/merlin-knights/knight-banner.webp",
    desc: "A medieval heraldry banner waving in the wind with gold fringe trim and interactive cursor-driven wind physics.",
    slug: "merlin-knights",
    category: "image",
    subtype: "banners",
    tags: ["Medieval Banner", "Wind Physics", "Gold Fringe"],
    controls: [
      { type: "slider", key: "windSpeed", label: "Wind Simulation", default: 0.8, min: 0.1, max: 3.0, step: 0.1, unit: "m/s" }
    ]
  },
  "acg-fleece": {
    id: "09",
    label: "Bas-Relief Emboss",
    filename: "components/acg-fleece/emboss-portrait.webp",
    desc: "A global physical bas-relief shader that embosses the image contours in 3D, casting shadows and specular glints dynamically from a cursor-controlled studio light.",
    slug: "acg-fleece",
    category: "image",
    subtype: "radar-plates"
  },
  "molten-mercury": {
    id: "10",
    label: "Molten Mercury",
    filename: "components/molten-mercury/chrome-figure.webp",
    desc: "A molten chrome & liquid mercury flow shader. Warps coordinates in viscous waves and shifts anisotropic studio reflections. Best used with high-contrast, metallic, chrome, or reflective images to maximize the liquid-metal sheen.",
    slug: "molten-mercury",
    category: "image",
    subtype: "liquid-metal"
  },
  "core-shell-b": {
    id: "12",
    label: "Water Ripple",
    filename: "components/core-shell-b/ripple-surface.webp",
    desc: "Physical expanding water wave ripples generated dynamically by mouse clicks on the canvas.",
    slug: "core-shell-b",
    category: "image",
    subtype: "scanners"
  },
  "kinetic-portal": {
    id: "13",
    label: "Infrared Thermal",
    filename: "components/kinetic-portal/thermal-portrait.webp",
    desc: "An infrared thermal heat vision spectrum shader mapped dynamically around the cursor.",
    slug: "kinetic-portal",
    category: "image",
    subtype: "scanners"
  },
  "gilding-transmutation": {
    id: "14",
    label: "Gold Gilding",
    filename: "components/gilding-transmutation/knight-gilding.webp",
    desc: "An alchemical gilding transmutation shader that preserves a high-fidelity medieval egg-tempera portrait in its pristine, full-color idle state, while dynamically crystallizing a wave of embossed gold leaf across the knight's armor and crown on hover.",
    slug: "gilding-transmutation",
    category: "image",
    subtype: "banners",
    tags: ["Alchemical Gilding", "3D Embossed Normal Map", "GPU Wave Simulation"],
    controls: [
      { type: "slider", key: "goldIntensity", label: "Gold Intensity", default: 0.7, min: 0, max: 1, step: 0.01 },
      { type: "slider", key: "waveSpeed", label: "Wave Speed", default: 1, min: 0.1, max: 5, step: 0.1 },
      { type: "toggle", key: "showGoldLeaf", label: "Gold Leaf", default: true }
    ]
  },
  "depth-silhouette": {
    id: "19",
    label: "Depth Silhouette",
    filename: "components/depth-silhouette/knight-silhouette.webp",
    desc: "A 3D medieval knight silhouette displaying interactive depth light reflection.",
    slug: "depth-silhouette",
    category: "image",
    subtype: "drapes"
  },
  "steel-intaglio": {
    id: "22",
    label: "Steel Intaglio",
    filename: "components/steel-intaglio/armor-reflection.webp",
    desc: "A demonic knight steel armor reflection shader responding to light coordinates.",
    slug: "steel-intaglio",
    category: "image",
    subtype: "drapes"
  },
  "procedural-atlas": {
    id: "27",
    label: "Procedural Atlas",
    filename: "components/procedural-atlas/steel-relief.webp",
    desc: "A raw steel relief displacement shader.",
    slug: "procedural-atlas",
    category: "image",
    subtype: "drapes"
  },
  "accordion-wall": {
    id: "38",
    label: "Pillar Gallery",
    filename: "components/accordion-wall/art-01.webp",
    desc: "Vertical image pillars that rise on hover and expand into a towering fullscreen gallery with ambient lighting and floating typography.",
    slug: "accordion-wall",
    category: "gallery",
    subtype: "accordion",
    tags: ["GSAP", "Flexbox", "Crease Shadows"],
    previewType: "transition",
    controls: [
      { type: "slider", key: "panelCount", label: "Panels", default: 8, min: 4, max: 8, step: 1 },
      { type: "slider", key: "speed", label: "Speed", default: 1.35, min: 0.5, max: 2.0, step: 0.05, unit: "s" }
    ]
  },
  "parallax-column": {
    id: "39",
    label: "Parallax Column",
    filename: "components/parallax-column/hero.webp",
    desc: "A split-screen vertical runway where left and right columns travel in opposite directions, revealing unclipped images as they cross the viewport center.",
    slug: "parallax-column",
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
          { label: "Classic", value: "classic" },
          { label: "Concave", value: "cylinder" },
          { label: "Convex", value: "convex" }
        ]
      },
      { type: "slider", key: "parallaxIntensity", label: "Parallax Intensity", default: 60, min: 0, max: 100, step: 5, unit: "%" },
      { type: "slider", key: "borderRadius", label: "Corner Radius", default: 8, min: 0, max: 32, step: 1, unit: "px" },
      { type: "slider", key: "columnGap", label: "Column Gap Spacing", default: 4, min: 0, max: 48, step: 2, unit: "px" },
      { type: "slider", key: "imageGap", label: "Vertical Image Gap", default: 4, min: 0, max: 48, step: 2, unit: "px" }
    ]
  },
  "erosion-map": {
    id: "43",
    label: "Erosion Map",
    filename: "components/erosion-map/hero.webp",
    desc: "Images erode organically based on a Perlin noise field driven by scroll progress, revealing layers below with textured weathering patterns and active edge glowing.",
    slug: "erosion-map",
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
          { label: "Spiral Vortex", value: "vortex" },
          { label: "Sinusoidal Wave", value: "wave" },
          { label: "Turbulent Shear", value: "turbulent" }
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
  "dual-wave": {
    id: "44",
    label: "Dual Wave",
    filename: "components/dual-wave/hero.webp",
    desc: "Two columns of text names flanking a center image. Names slide horizontally along a sine wave as you scroll, flanking a center image that swaps source to match the active viewport item.",
    slug: "dual-wave",
    category: "scroll",
    subtype: "index",
    tags: ["GSAP", "Scroll", "Sine Wave", "Typography"],
    previewType: "scroll",
    controls: [
      {
        type: "select",
        key: "wavePattern",
        label: "Wave Pattern",
        default: "barrel",
        options: [
          { label: "Barrel", value: "barrel" },
          { label: "Horizon", value: "horizon" },
          { label: "Sine", value: "dualSine" }
        ]
      },
      { type: "slider", key: "scrollDamping", label: "Scroll Damping", default: 0.08, min: 0.01, max: 0.30, step: 0.005 },
      { type: "slider", key: "spacing", label: "Text Spacing", default: 72, min: 35, max: 150, step: 1, unit: "px" },
      { type: "slider", key: "maxBlur", label: "Progressive Blur", default: 2.5, min: 0, max: 10, step: 0.1, unit: "px" },
      { type: "slider", key: "amplitude", label: "Wave Amplitude", default: 55, min: 10, max: 200, step: 1, unit: "px" },
      { type: "slider", key: "maxRotation", label: "Tilt Angle", default: 7.0, min: 0, max: 30, step: 0.1, unit: "°" }
    ]
  },
  "clip-morph": {
    id: "45",
    label: "Clip Morph",
    filename: "components/clip-morph/hero.webp",
    desc: "Outgoing image is clipped by a shape. The shape morphs — shrinking inward while simultaneously transforming geometry (circle → diamond → thin vertical line → nothing) to reveal the next image.",
    slug: "clip-morph",
    category: "transition",
    subtype: "transition",
    tags: ["GSAP", "Scroll", "Clip Path", "Morph", "Tactile"],
    previewType: "transition",
    controls: [
      { type: "slider", key: "customRotation", label: "Twist Rotation", default: 180, min: 0, max: 180, step: 5, unit: "°" },
      { type: "slider", key: "customBleed", label: "Color Bleed", default: 40, min: 0, max: 100, step: 5, unit: "%" },
      { type: "slider", key: "customGrain", label: "Film Grain", default: 25, min: 0, max: 80, step: 2, unit: "%" }
    ]
  },
  "depth-swim": {
    id: "47",
    label: "Depth Swim",
    filename: "components/depth-swim/hero.webp",
    desc: "Swim forward through a 3D parallax field of suspended images that dynamically scale, blur, and fade in focus.",
    slug: "depth-swim",
    category: "scroll",
    subtype: "gallery",
    tags: ["GSAP", "Scroll", "Parallax", "Depth of Field"],
    previewType: "scroll",
    controls: [
      { type: "slider", key: "depthRange", label: "Depth Z-Spread", default: 1600, min: 600, max: 3000, step: 100, unit: "px" },
      { type: "slider", key: "maxBlur", label: "Max Focal Blur", default: 18, min: 0, max: 30, step: 1, unit: "px" },
      { type: "slider", key: "cursorParallaxPower", label: "Mouse Parallax", default: 40, min: 0, max: 100, step: 5, unit: "px" },
      { type: "slider", key: "cardScale", label: "Card Base Scale", default: 1.0, min: 0.5, max: 2.0, step: 0.1 },
      { type: "slider", key: "hoverTiltMax", label: "Max Hover Tilt", default: 15, min: 0, max: 30, step: 1, unit: "°" },
      { type: "slider", key: "ambientOpacity", label: "Ambient Opacity", default: 0.45, min: 0.0, max: 0.8, step: 0.05 },
      { type: "slider", key: "ambientBlur", label: "Ambient Blur", default: 75, min: 0, max: 150, step: 5, unit: "px" }
    ]
  },
  "cylinder-scroll": {
    id: "48",
    label: "Cylinder Scroll",
    filename: "components/cylinder-scroll/hero.webp",
    desc: "Infinite bidirectional vertical scroll of cards rotating tangentially along a 3D cylindrical drum surface with a lens focus reveal.",
    slug: "cylinder-scroll",
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
  "parallax-bleed": {
    id: "60",
    label: "Parallax Bleed",
    filename: "components/parallax-bleed/hero.webp",
    desc: "4 full-bleed image sections stacked sequentially with deep internal parallax bounds, virtual camera momentum, and weighted layer micro-latency.",
    slug: "parallax-bleed",
    category: "scroll",
    subtype: "full-bleed",
    tags: ["GSAP", "ScrollTrigger", "Parallax", "Full Bleed", "Cinematic", "Physics"],
    previewType: "scroll",
    controls: [
      { type: "slider", key: "parallaxIntensity", label: "Internal Parallax", default: 45, min: 10, max: 100, step: 5, unit: "%" },
      { type: "slider", key: "blurDepth", label: "Progressive Blur", default: 280, min: 120, max: 400, step: 20, unit: "px" },
      { type: "slider", key: "imageBrightness", label: "Image Brightness", default: 90, min: 50, max: 120, step: 5, unit: "%" },
      {
        type: "select",
        key: "blurVariant",
        label: "Edge Falloff",
        default: "pure",
        options: [
          { label: "Pure Blur", value: "pure" },
          { label: "Refractive Glass", value: "refractive" },
          { label: "Liquid Caustic", value: "liquid" },
          { label: "Line Glass (CRT)", value: "crt" },
          { label: "Thermal Haze", value: "thermal" }
        ]
      }
    ]
  },
  "gravity-cursor": {
    id: "61",
    label: "Gravity Cursor",
    filename: "components/gravity-cursor/hero.webp",
    desc: "Interactive physics-driven cursor gallery where clicking or hold-dragging stream-spawns image bodies that fall with gravity, bounce elastically on the spatial floor, and dissolve cleanly.",
    slug: "gravity-cursor",
    category: "gallery",
    subtype: "interactive-physics",
    tags: ["Cursor", "Gravity", "Physics", "Gallery", "Interactive", "Bounce"],
    previewType: "gallery",
    controls: [
      { type: "select", key: "gravityMode", label: "Gravity Mode", default: "normal", options: [{ label: "Normal", value: "normal" }, { label: "Zero-G", value: "zero-gravity" }, { label: "Magnetic", value: "magnetic-repulsor" }] },
      { type: "select", key: "interactionMode", label: "Spawn Trigger", default: "hold-drag", options: [{ label: "Hold & Drag", value: "hold-drag" }, { label: "Cursor Trail", value: "cursor-trail" }], dependsOn: { key: "gravityMode", value: ["normal", "zero-gravity"] } },
      { type: "slider", key: "imageSize", label: "Shape Size", default: 140, min: 70, max: 300, step: 5, unit: "px" },
      { type: "slider", key: "gravity", label: "Gravity Acceleration", default: 0.55, min: 0.1, max: 2.5, step: 0.05, dependsOn: { key: "gravityMode", value: "normal" } },
      { type: "slider", key: "bounceDamping", label: "Bounce Elasticity", default: 0.62, min: 0.05, max: 0.95, step: 0.05, dependsOn: { key: "gravityMode", value: "normal" } },
      { type: "slider", key: "repelRadius", label: "Repel Radius", default: 350, min: 150, max: 600, step: 10, unit: "px", dependsOn: { key: "gravityMode", value: "magnetic-repulsor" } },
      { type: "slider", key: "repelForce", label: "Repulsion Power", default: 9.2, min: 1.0, max: 25.0, step: 0.5, dependsOn: { key: "gravityMode", value: "magnetic-repulsor" } }
    ]
  },
  "3d-shatter-sphere": {
    id: "62",
    label: "3d Shatter Sphere",
    filename: "components/3d-shatter-sphere/hero.webp",
    desc: "Interactive 3D gallery sphere distributed in Fibonacci spatial bounds. Drag to rotate in 3D perspective space, click to trigger a 3D explosion shatter into spatial tile fragments.",
    slug: "3d-shatter-sphere",
    category: "gallery",
    subtype: "3d-interactive",
    tags: ["3D", "Sphere", "Shatter", "Explosion", "Gallery", "WebGL"],
    previewType: "gallery",
    controls: [
      { type: "select", key: "shapeMode", label: "3d Geometry Shape", default: "sphere", options: [{ label: "3D Sphere Shell", value: "sphere" }, { label: "3D Cube Monolith (6 Faces)", value: "cuboid" }, { label: "3D Cuboid Grid (24 Panels)", value: "cuboid-grid" }] },
      { type: "slider", key: "sphereRadius", label: "3D Structure Radius", default: 420, min: 200, max: 650, step: 10, unit: "px" },
      { type: "slider", key: "shatterForce", label: "Explosion Shatter Force", default: 1.8, min: 0.5, max: 3.5, step: 0.1 },
      { type: "slider", key: "cardScale", label: "Tile Card Scale", default: 1.05, min: 0.5, max: 2.0, step: 0.05 },
      { type: "slider", key: "itemCount", label: "3D Card Sphere Count", default: 42, min: 20, max: 60, step: 2, dependsOn: { key: "shapeMode", value: "sphere" } },
      { type: "slider", key: "autoRotateSpeed", label: "Idle Spin Momentum", default: 0.18, min: 0, max: 2.5, step: 0.02 }
    ]
  },
  "ripple-scramble": {
    id: "65",
    label: "Ripple Scramble",
    filename: "components/ripple-scramble/hero.webp",
    desc: "A high-agency multi-column editorial layout where clicking anywhere fires a 360° radial shockwave that scrambles text into curated mathematical glyphs and lifts them on a fluid vertical curve before decoding with crystal focus-pull sharpness.",
    slug: "ripple-scramble",
    category: "text",
    subtype: "text-wave",
    tags: ["Typography", "Math Glyphs", "Wave Energy", "Focus Pull", "Editorial"],
    previewType: "text",
    controls: [
      {
        type: "select",
        key: "variant",
        label: "Acoustic Variant",
        default: "classic",
        options: [
          { label: "Classic", value: "classic" },
          { label: "Editorial", value: "editorial" },
          { label: "Matrix", value: "matrix" },
          { label: "Nebula", value: "nebula" }
        ]
      },
      { type: "slider", key: "fontSize", label: "Font Size", default: 20, min: 12, max: 28, step: 1, unit: "px" },
      { type: "slider", key: "staticOpacity", label: "Resting Opacity", default: 0.32, min: 0.10, max: 0.80, step: 0.02 },
      { type: "slider", key: "waveSpeed", label: "Wave Speed", default: 950, min: 400, max: 2000, step: 50, unit: "px/s" },
      { type: "slider", key: "scrambleDuration", label: "Decode Duration", default: 340, min: 80, max: 800, step: 20, unit: "ms" },
      { type: "slider", key: "lineHeightScale", label: "Line Rhythm", default: 1.65, min: 1.3, max: 2.2, step: 0.05, unit: "x" }
    ]
  },
  "curved-scroll-wipe": {
    id: "68",
    label: "Curved Scroll Wipe",
    filename: "components/curved-scroll-wipe/hero.webp",
    desc: "A scroll-driven multi-section website transition using dynamic SVG curved path clip masks that morph elastically on scroll progress.",
    slug: "curved-scroll-wipe",
    category: "transition",
    subtype: "curved-wipe",
    tags: ["Scroll", "SVG Path", "Clip Path", "Transition", "Multi-Section"],
    previewType: "transition",
    controls: [
      { type: "slider", key: "curveDepth", label: "Elastic Curve Sag Depth", default: 0.28, min: 0.05, max: 0.50, step: 0.01 },
      { type: "slider", key: "scrollSpeed", label: "Scroll Inertia Sensitivity", default: 1.0, min: 0.5, max: 2.0, step: 0.1, unit: "x" }
    ]
  },
  "image-snake-trail": {
    id: "69",
    label: "Image Snake Trail",
    filename: "components/image-snake-trail/hero.webp",
    desc: "Serpentine image chain following cursor with physics momentum and scale decay.",
    slug: "image-snake-trail",
    category: "gallery",
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
  "abyss-cursor-fall": {
    id: "70",
    label: "Abyss Cursor Fall",
    filename: "components/abyss-cursor-fall/hero.webp",
    desc: "Kinetic 3D image spawner plunging floating WebP & SVG cards into a deep atmospheric 3D void on cursor movement.",
    slug: "abyss-cursor-fall",
    category: "gallery",
    subtype: "3d-spawner",
    tags: ["Gallery", "Cursor Spawner", "3D", "Three.js", "WebGL", "Physics"],
    controls: [
      {
        type: "select",
        key: "spawnFilter",
        label: "Spawn Type",
        default: "images-only",
        options: [
          { label: "Images", value: "images-only" },
          { label: "Shapes", value: "shapes-only" }
        ]
      },
      { type: "slider", key: "spawnDistance", label: "Spawn Distance", default: 50, min: 15, max: 180, step: 5, unit: "px" },
      { type: "slider", key: "spawnInterval", label: "Spawn Cooldown", default: 110, min: 30, max: 400, step: 10, unit: "ms" },
      { type: "slider", key: "imageSize", label: "3D Image Size", default: 2.4, min: 0.5, max: 4.5, step: 0.1 },
      { type: "slider", key: "lifespan", label: "Card Lifespan", default: 3.0, min: 1.0, max: 6.0, step: 0.2, unit: "s" },
      { type: "slider", key: "fallSpeed", label: "Void Fall Speed", default: 2.4, min: 0.5, max: 8.0, step: 0.5 },
      { type: "slider", key: "cameraParallax", label: "3D Camera Parallax", default: 2.8, min: 0.5, max: 6.0, step: 0.2 }
    ]
  },
  "tracklist-gallery": {
    id: "73",
    label: "Tracklist Gallery",
    filename: "components/tracklist-gallery/hero.webp",
    desc: "Minimalist editorial tracklist gallery mapping scroll progression to album artwork crossfades and audio metadata.",
    slug: "tracklist-gallery",
    category: "gallery",
    subtype: "audio-index",
    tags: ["Gallery", "Tracklist", "Audio", "Scroll", "GSAP", "Typography"],
    controls: [
      { type: "slider", key: "scrubSmoothness", label: "Scrub Weight", default: 0.8, min: 0.1, max: 2.0, step: 0.1, unit: "s" },
      { type: "slider", key: "titleSize", label: "Title Size", default: 72, min: 36, max: 120, step: 2, unit: "px" },
      { type: "slider", key: "artworkCrossfade", label: "Artwork Crossfade", default: 0.5, min: 0.1, max: 1.5, step: 0.1, unit: "s" },
      { type: "slider", key: "itemScrollDistance", label: "Track Height", default: 400, min: 200, max: 800, step: 50, unit: "px" }
    ]
  },
  "hover-media-stream": {
    id: "74",
    label: "Hover Media Stream",
    filename: "components/hover-media-stream/hero.webp",
    desc: "Kinetic tactile typography stream with Moiré fine-line interference baseline, alternating aperture unroll video stages, and frame-synchronized ambient backlighting.",
    slug: "hover-media-stream",
    category: "text",
    subtype: "stream",
    tags: ["Typography", "Hover Stream", "Video", "Moiré Baseline", "GSAP", "120fps"],
    controls: [
      { type: "slider", key: "backdropBlur", label: "Backdrop Blur", default: 80, min: 20, max: 150, step: 5, unit: "px" },
      { type: "slider", key: "ambientBrightness", label: "Ambient Brightness", default: 0.40, min: 0.05, max: 0.8, step: 0.01 },
      { type: "slider", key: "lineDuration", label: "Line Speed", default: 1.25, min: 0.4, max: 2.5, step: 0.05, unit: "s" },
      { type: "slider", key: "fontSize", label: "Font Size", default: 62, min: 28, max: 96, step: 2, unit: "px" }
    ]
  },
  "gimbal-stream": {
    id: "75",
    label: "Gimbal Stream",
    filename: "components/gimbal-stream/hero.webp",
    desc: "Infinite scrolling zero-g gimbal stream suspended inside a ray-marched obsidian chamber with liquid mercury centerpiece, five gimbal-mounted tilted card rings, subtle curvature vertex displacement, and Lenis-grade virtual scroll inertia.",
    slug: "gimbal-stream",
    category: "3d",
    subtype: "gallery",
    tags: ["Three.js", "Gimbal Stream", "Obsidian Chamber", "Liquid Mercury", "Lenis Inertia", "3D WebGL", "Orrery Rings"],
    controls: [
      {
        type: "select",
        key: "gridVariant",
        label: "Chamber Pattern",
        default: "plus",
        options: [
          { label: "Swiss Plus (+)", value: "plus" },
          { label: "Ghost Grid", value: "ghost" },
          { label: "Hex Honeycomb", value: "hex" }
        ]
      },
      { type: "slider", key: "autoRotateSpeed", label: "Auto Drift Speed", default: 0.10, min: 0.0, max: 0.50, step: 0.01 },
      { type: "slider", key: "scrollSpeed", label: "Scroll Orbit Speed", default: 0.0045, min: 0.001, max: 0.02, step: 0.0005 },
      { type: "slider", key: "cardBendMultiplier", label: "Card Curvature Bend", default: 6.5, min: 0.0, max: 15.0, step: 0.5 },
      { type: "slider", key: "waveBrightness", label: "Nebula Wave Brightness", default: 1.0, min: 0.30, max: 2.5, step: 0.05 },
      { type: "slider", key: "waveSpeed", label: "Nebula Wave Speed", default: 1.0, min: 0.20, max: 3.50, step: 0.10 }
    ]
  },
  "cascade-gallery": {
    id: "76",
    label: "Cascade Gallery",
    filename: "components/cascade-gallery/hero.webp",
    desc: "A timeless, editorial 3D diagonal stream conveyor gallery inspired by Apparatus Studio with thermal emulsion chemical crystallization sequence, tactile lateral tab pull, staged 4-step hero expansion, floating optical studio glass pill, and a live mechanical precision chronometer.",
    slug: "cascade-gallery",
    category: "3d",
    subtype: "gallery",
    tags: ["Three.js", "Cascade Gallery", "Thermal Emulsion", "Optical Glass", "Editorial Conveyor", "Mechanical Clock", "3D WebGL", "GSAP 3D Choreography"],
    controls: [
      { type: "slider", key: "stepDist", label: "Rack Card Density", default: 0.22, min: 0.20, max: 0.28, step: 0.01 },
      { type: "slider", key: "hoverLiftMultiplier", label: "Hover Tab Pull", default: 1.75, min: 0.8, max: 3.0, step: 0.1 },
      { type: "slider", key: "dominoLean", label: "Domino Inertia Lean", default: 1.0, min: 0.5, max: 2.5, step: 0.1 },
      { type: "slider", key: "ambientDriftSpeed", label: "Conveyor Drift Speed", default: 0.016, min: 0.0, max: 0.05, step: 0.002 }
    ]
  },
  "theme-toggle-redesign": {
    id: "77",
    label: "Theme Toggle Redesign",
    filename: "components/theme-toggle-redesign/hero.webp",
    desc: "An architectural redesign of light and dark mode toggling. Features a 3D tactile dial plunge button with 1400ms unhurried circular expanding screen wave immersion and a physical lamp pull cord with 28-bead Verlet physics and volumetric top-down room floodlight illumination.",
    slug: "theme-toggle-redesign",
    category: "interaction",
    subtype: "toggles",
    tags: ["Light Dark Mode", "Redesign", "3D Push Dial", "Lamp Pull Cord", "Verlet Physics", "Acoustic Audio", "Haptic Touch"],
    controls: [
      {
        type: "select",
        key: "variant",
        label: "Variant",
        default: "dial",
        options: [
          { label: "3D Dial", value: "dial" },
          { label: "Lamp Cord", value: "lamp" }
        ]
      },
      {
        type: "toggle",
        key: "enableAudio",
        label: "Acoustic SFX",
        default: true
      }
    ]
  },
  "mosaic-loader": {
    id: "78",
    label: "Mosaic Loader",
    filename: "components/mosaic-loader/hero.webp",
    desc: "A bespoke editorial preloader with 18 organic aspect-ratio cards, high-speed quantum cycling, a central 8-point octagram star HUD step-locked to a precision mechanical odometer drum, and unhurried Saint Regus typography.",
    slug: "mosaic-loader",
    category: "interaction",
    subtype: "loaders",
    tags: ["Mosaic Loader", "Preloader", "Odometer Drum", "Octagram Star", "Saint Regus", "Constellation Grid", "Gravitational Implosion"]
  },
  "cinema-aisle": {
    id: "79",
    label: "Cinema Aisle",
    filename: "components/cinema-aisle/hero.png",
    desc: "An endless 3D cinematic corridor featuring 16 streaming video panels along curved parabolic gallery walls, live 60/120 FPS video reflections across a dark obsidian glass runway, synchronized flight in-animation, and whisper depth-float parallax.",
    slug: "cinema-aisle",
    category: "interaction",
    subtype: "galleries",
    tags: ["3D Runway", "Video Corridor", "Parabolic Walls", "Obsidian Glass", "Live Reflections", "Gallery Glance", "High Refresh"],
    controls: [
      {
        type: "slider",
        key: "curveFlare",
        label: "Wall Flare",
        default: 6.2,
        min: 0.0,
        max: 10.0,
        step: 0.2
      },
      {
        type: "slider",
        key: "scrollSpeed",
        label: "Scroll Velocity",
        default: 1.0,
        min: 0.5,
        max: 2.0,
        step: 0.1
      },
      {
        type: "slider",
        key: "reflectionSheen",
        label: "Floor Reflection",
        default: 0.88,
        min: 0.0,
        max: 1.0,
        step: 0.05
      },
      {
        type: "slider",
        key: "corridorWidth",
        label: "Corridor Width",
        default: 3.5,
        min: 2.4,
        max: 5.2,
        step: 0.1
      },
      {
        type: "slider",
        key: "driftSpeed",
        label: "Auto Drift",
        default: 2.0,
        min: 0.0,
        max: 4.0,
        step: 0.1
      }
    ]
  }
};




