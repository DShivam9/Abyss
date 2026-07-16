import dynamic from "next/dynamic";
import React from "react";
import { VesselComponentProps } from "@abyss-ui/core";

export interface ComponentDetail {
  id: string;
  label: string;
  filename: string;
  desc: string;
  slug: string;
  category: string;
  subtype: string;
  tags?: string[];
  previewType?: "shader" | "scroll" | "gallery" | "transition";
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
  "tanvi": {
    id: "03",
    label: "TANVI",
    filename: "Image(shader)/tanvi.jpg",
    desc: "A stateful Rayleigh-Bénard thermal convection fluid simulation. The cursor heats the viscous liquid, generating circulating plumes and vortexes that warp coordinates.",
    slug: "tanvi",
    category: "image",
    subtype: "liquid-metal"
  },
  "glitch-streetwear": {
    id: "04",
    label: "GLITCH STREETWEAR",
    filename: "Image(shader)/glitch-streetwear.jpg",
    desc: "[DISABLED] Static canvas image.",
    slug: "glitch-streetwear",
    category: "image",
    subtype: "huds"
  },
  "chai-collection": {
    id: "05",
    label: "CHAI COLLECTION",
    filename: "Image(shader)/chai-collection.jpg",
    desc: "A multi-faceted triangular crystal prism lens. Drags and shifts to refract coordinate space and disperse light into a colorful chromatic spectrum.",
    slug: "chai-collection",
    category: "geometry",
    subtype: "refractors"
  },
  "instagram-overlay": {
    id: "06",
    label: "DIGITAL OVERLAY",
    filename: "Image(shader)/instagram.jpg",
    desc: "A holographic analog scanline CRT screen glitch overlay. Page scroll velocity and clicks trigger electrostatic distortion, scanline shifts, and chromatic separation.",
    slug: "instagram-overlay",
    category: "image",
    subtype: "huds"
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
  "red-refract": {
    id: "08",
    label: "RED REFRACT",
    filename: "Image(shader)/red-refract.jpg",
    desc: "An X-ray outline reveal canvas. The cursor acts as a circular focus lens showing high-contrast neon outlines underneath.",
    slug: "red-refract",
    category: "geometry",
    subtype: "scanners"
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
  "core-shell-a": {
    id: "11",
    label: "CORE SHELL A",
    filename: "Image(shader)/download (1).jpg",
    desc: "A retro magnifying glass lens pixelating the image coordinates underneath.",
    slug: "core-shell-a",
    category: "geometry",
    subtype: "scanners"
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
    category: "hybrid",
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
    tags: ["Alchemical Gilding", "3D Embossed Normal Map", "GPU Wave Simulation"]
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
  "apparatus-hh": {
    id: "16",
    label: "APPARATUS HH",
    filename: "Image(shader)/hh.jpg",
    desc: "A 3D refractive water droplet glass bubble double-inverting details underneath with real drop shadows.",
    slug: "apparatus-hh",
    category: "geometry",
    subtype: "refractors"
  },
  "apparatus-kl": {
    id: "17",
    label: "APPARATUS KL",
    filename: "Image(shader)/kl.jpg",
    desc: "A physical oil-on-canvas simulation modeling high-viscosity lacquer paint. Cursor movement plows a physical displacement trench through the impasto texture, pushing detailed paint ridges to the sides of the stroke. Features velocity-aligned directional paint smudging, canvas micro-weave bump mapping, a deforming reactive border frame, and premium studio light specular highlights.",
    slug: "apparatus-kl",
    category: "geometry",
    subtype: "canvases"
  },
  "chromium-queen": {
    id: "18",
    label: "CHROMIUM QUEEN",
    filename: "Image(shader)/chromium-queen.jpg",
    desc: "An anisotropic liquid silk and satin fabric simulation. Mouse movement creates organic folds, waves, and drapes directly in the fabric of the portrait. Features micro-refraction along fabric ridges, chromatic dispersion along wave boundaries, and realistic specular sheen highlights resembling luxurious satin.",
    slug: "chromium-queen",
    category: "image",
    subtype: "silk-drapes"
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
    category: "hybrid",
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
  "deepwood-glimmer": {
    id: "23",
    label: "DEEPWOOD GLIMMER",
    filename: "Image(shader)/deepwood-glimmer.jpg",
    desc: "A heavy velvet tapestry forest with volumetric light glimmers.",
    slug: "deepwood-glimmer",
    category: "image",
    subtype: "drapes"
  },
  "stippled-dark": {
    id: "24",
    label: "STIPPLED DARK",
    filename: "Image(shader)/stippled-dark.jpg",
    desc: "A hand-stippled dark gothic ink shader creating micro-stipple shading under pointer.",
    slug: "stippled-dark",
    category: "yet-to-work-on",
    subtype: "drapes"
  },
  "apparatus-dajd": {
    id: "25",
    label: "APPARATUS DAJD",
    filename: "Image(shader)/dajd.jpg",
    desc: "A custom light-scattering refraction shader.",
    slug: "apparatus-dajd",
    category: "yet-to-work-on",
    subtype: "drapes"
  },
  "apparatus-jjjj": {
    id: "26",
    label: "APPARATUS JJJJ",
    filename: "Image(shader)/jjjj.jpg",
    desc: "A stippled ink drawing with dynamic density based on cursor motion.",
    slug: "apparatus-jjjj",
    category: "yet-to-work-on",
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
  "apparatus-ljbfaf": {
    id: "28",
    label: "APPARATUS LJBFAF",
    filename: "Image(shader)/ljbfaf.jpg",
    desc: "A chrome metal reflection shader.",
    slug: "apparatus-ljbfaf",
    category: "yet-to-work-on",
    subtype: "drapes"
  },
  "apparatus-underscore": {
    id: "29",
    label: "APPARATUS UNDERSCORE",
    filename: "Image(shader)/_.jpg",
    desc: "A brutalist distressed steel layout shader.",
    slug: "apparatus-underscore",
    category: "yet-to-work-on",
    subtype: "drapes"
  },
  "apparatus-hdhd": {
    id: "30",
    label: "APPARATUS HDHD",
    filename: "Image(shader)/hdhd.jpg",
    desc: "A medieval tapestry layout shader.",
    slug: "apparatus-hdhd",
    category: "yet-to-work-on",
    subtype: "drapes"
  },
  "apparatus-stshsh": {
    id: "31",
    label: "APPARATUS IMAGE FOSSIL",
    filename: "Image(shader)/stshsh.jpg",
    desc: "Procedural basalt stone slab excavation with branching cracks and falling chips dust particles.",
    slug: "apparatus-stshsh",
    category: "yet-to-work-on",
    subtype: "excavation"
  },
  "apparatus-merged-v3": {
    id: "32",
    label: "APPARATUS MERGED V3",
    filename: "Image(shader)/merged-v3.jpg",
    desc: "A classical stone bust shader reflecting soft studio lights.",
    slug: "apparatus-merged-v3",
    category: "yet-to-work-on",
    subtype: "drapes"
  },
  "apparatus-ldhad": {
    id: "33",
    label: "APPARATUS LDHAD",
    filename: "Image(shader)/ldhad.jpg",
    desc: "A high-fidelity refraction layout shader.",
    slug: "apparatus-ldhad",
    category: "yet-to-work-on",
    subtype: "drapes"
  },
  "apparatus-ribbon": {
    id: "34",
    label: "APPARATUS IMAGE ORBIT",
    filename: "Image(shader)/chromium-queen.jpg",
    desc: "A double-sided 3D photograph card suspended in mid-air that sways, tilts, and sways dynamically following mouse velocity and scroll progress.",
    slug: "apparatus-ribbon",
    category: "yet-to-work-on",
    subtype: "orbit"
  },
  "apparatus-velocity-deck": {
    id: "35",
    label: "APPARATUS VELOCITY DECK",
    filename: "scroll/Glowing White Horse.jpg",
    desc: "Scroll-pinned image deck that physically stretches, skews, and splits into offset slices in response to scroll velocity.",
    slug: "apparatus-velocity-deck",
    category: "scroll",
    subtype: "deck",
    tags: ["GSAP", "Lenis", "Scroll Velocity", "CSS 3D"]
  },
  "orbit-ring-gallery": {
    id: "36",
    label: "ORBIT RING GALLERY",
    filename: "Gallary/cosmos_145253936.jpeg",
    desc: "Scroll to revolve through an immersive 3D ring of images, with the active hero image scaling dynamically at the forefront.",
    slug: "orbit-ring-gallery",
    category: "gallary",
    subtype: "ring",
    tags: ["Three.js", "R3F", "GSAP ScrollTrigger", "Framer Motion"]
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
    previewType: "transition"
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
    previewType: "transition"
  },
  "apparatus-parallax-column": {
    id: "39",
    label: "PARALLAX COLUMN",
    filename: "scroll/cosmos_1309660817.jpeg",
    desc: "A split-screen vertical runway where left and right columns travel in opposite directions, revealing unclipped images as they cross the viewport center.",
    slug: "apparatus-parallax-column",
    category: "scroll",
    subtype: "transition",
    tags: ["GSAP", "Lenis", "Split Scroll", "Clip Path"],
    previewType: "scroll"
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
  "apparatus-specimen-box": {
    id: "42",
    label: "APPARATUS SPECIMEN BOX",
    filename: "scroll/cosmos_1309660817.jpeg",
    desc: "Images sit as pinned entomological specimens in a velvet case that tilts with cursor movement; clicking an image slides out the metal pin, lifting the specimen to float at center.",
    slug: "apparatus-specimen-box",
    category: "gallary",
    subtype: "gallery",
    tags: ["GSAP", "CSS 3D", "Interactive", "Tactile"],
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
    previewType: "scroll"
  },
  "apparatus-dual-wave": {
    id: "44",
    label: "APPARATUS DUAL WAVE",
    filename: "scroll/cosmos_1309660817.jpeg",
    desc: "Two columns of text names flanking a center image. Names slide horizontally along a sine wave as you scroll, flanking a center image that swaps source to match the active viewport item.",
    slug: "apparatus-dual-wave",
    category: "scroll",
    subtype: "index",
    tags: ["GSAP", "Scroll", "Sine Wave", "Typography"],
    previewType: "scroll"
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
    previewType: "transition"
  }
};



// Dynamic imports mapping slug to component inside packages/core
export const COMPONENT_IMPORTS: Record<string, React.ComponentType<VesselComponentProps>> = {
  "japparii": dynamic(() => import("../../../../packages/core/src/components/japparii"), { ssr: false }),
  "chromepunk-beast": dynamic(() => import("../../../../packages/core/src/components/chromepunk-beast"), { ssr: false }),
  "tanvi": dynamic(() => import("../../../../packages/core/src/components/tanvi"), { ssr: false }),
  "glitch-streetwear": dynamic(() => import("../../../../packages/core/src/components/glitch-streetwear"), { ssr: false }),
  "chai-collection": dynamic(() => import("../../../../packages/core/src/components/chai-collection"), { ssr: false }),
  
  "instagram-overlay": dynamic(() => import("../../../../packages/core/src/components/instagram-overlay"), { ssr: false }),
  "merlin-knights": dynamic(() => import("../../../../packages/core/src/components/merlin-knights"), { ssr: false }),
  
  "red-refract": dynamic(() => import("../../../../packages/core/src/components/red-refract"), { ssr: false }),
  "acg-fleece": dynamic(() => import("../../../../packages/core/src/components/acg-fleece"), { ssr: false }),
  "apparatus-dee": dynamic(() => import("../../../../packages/core/src/components/apparatus-dee"), { ssr: false }),
  "core-shell-a": dynamic(() => import("../../../../packages/core/src/components/core-shell-a"), { ssr: false }),
  "core-shell-b": dynamic(() => import("../../../../packages/core/src/components/core-shell-b"), { ssr: false }),
  "kinetic-portal": dynamic(() => import("../../../../packages/core/src/components/kinetic-portal"), { ssr: false }),
  "apparatus-faf": dynamic(() => import("../../../../packages/core/src/components/apparatus-faf"), { ssr: false }),
  "apparatus-gg": dynamic(() => import("../../../../packages/core/src/components/apparatus-gg"), { ssr: false }),
  "apparatus-hh": dynamic(() => import("../../../../packages/core/src/components/apparatus-hh"), { ssr: false }),
  "apparatus-kl": dynamic(() => import("../../../../packages/core/src/components/apparatus-kl"), { ssr: false }),
  "chromium-queen": dynamic(() => import("../../../../packages/core/src/components/chromium-queen"), { ssr: false }),
  "apparatus-fblf": dynamic(() => import("../../../../packages/core/src/components/apparatus-fblf"), { ssr: false }),
  "apparatus-fjvfba": dynamic(() => import("../../../../packages/core/src/components/apparatus-fjvfba"), { ssr: false }),
  "apparatus-ialfa": dynamic(() => import("../../../../packages/core/src/components/apparatus-ialfa"), { ssr: false }),
  "apparatus-ll": dynamic(() => import("../../../../packages/core/src/components/apparatus-ll"), { ssr: false }),
  "deepwood-glimmer": dynamic(() => import("../../../../packages/core/src/components/deepwood-glimmer"), { ssr: false }),
  "stippled-dark": dynamic(() => import("../../../../packages/core/src/components/static-image"), { ssr: false }),
  "apparatus-dajd": dynamic(() => import("../../../../packages/core/src/components/static-image"), { ssr: false }),
  "apparatus-jjjj": dynamic(() => import("../../../../packages/core/src/components/static-image"), { ssr: false }),
  "apparatus-hoqnl": dynamic(() => import("../../../../packages/core/src/components/apparatus-hoqnl"), { ssr: false }),
  "apparatus-ljbfaf": dynamic(() => import("../../../../packages/core/src/components/static-image"), { ssr: false }),
  "apparatus-underscore": dynamic(() => import("../../../../packages/core/src/components/static-image"), { ssr: false }),
  "apparatus-hdhd": dynamic(() => import("../../../../packages/core/src/components/static-image"), { ssr: false }),
  "apparatus-stshsh": dynamic(() => import("../../../../packages/core/src/components/static-image"), { ssr: false }),
  "apparatus-merged-v3": dynamic(() => import("../../../../packages/core/src/components/static-image"), { ssr: false }),
  "apparatus-ldhad": dynamic(() => import("../../../../packages/core/src/components/static-image"), { ssr: false }),
  "apparatus-ribbon": dynamic(() => import("../../../../packages/core/src/components/static-image"), { ssr: false }),
  "apparatus-velocity-deck": dynamic(() => import("../../../../packages/core/src/components/apparatus-velocity-deck"), { ssr: false }),
  "orbit-ring-gallery": dynamic(() => import("../../../../packages/core/src/components/orbit-ring-gallery"), { ssr: false }),
  "apparatus-venetian-blinds": dynamic(() => import("../../../../packages/core/src/components/apparatus-venetian-blinds"), { ssr: false }),
  "apparatus-accordion-wall": dynamic(() => import("../../../../packages/core/src/components/apparatus-accordion-wall"), { ssr: false }),
  "apparatus-parallax-column": dynamic(() => import("../../../../packages/core/src/components/apparatus-parallax-column"), { ssr: false }),
  "apparatus-layout-morph": dynamic(() => import("../../../../packages/core/src/components/apparatus-layout-morph"), { ssr: false }),
  "apparatus-specimen-box": dynamic(() => import("../../../../packages/core/src/components/apparatus-specimen-box"), { ssr: false }),
  "apparatus-erosion-map": dynamic(() => import("../../../../packages/core/src/components/apparatus-erosion-map"), { ssr: false }),
  "apparatus-dual-wave": dynamic(() => import("../../../../packages/core/src/components/apparatus-dual-wave"), { ssr: false }),
  "apparatus-clip-morph": dynamic(() => import("../../../../packages/core/src/components/apparatus-clip-morph"), { ssr: false })
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
    } else {
      meta.previewType = "shader";
    }
  }
  const Component = COMPONENT_IMPORTS[slug];
  return { Component, meta };
}
