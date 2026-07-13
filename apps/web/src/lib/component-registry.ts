import dynamic from "next/dynamic";
import React from "react";
import { VesselComponentProps } from "@vessel-ui/core";

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
    filename: "noir/japparii.jpg",
    desc: "A hand-drawn Leonardo sketch paper shader rendering image luminance as dynamic cross-hatching diagonal strokes.",
    slug: "japparii",
    category: "image",
    subtype: "scrolls"
  },
  "chromepunk-beast": {
    id: "02",
    label: "CHROMEPUNK BEAST",
    filename: "dark-styled/chromepunk-beast.jpg",
    desc: "A specular normal-mapped canvas calculating height profiles and embossing shadows on the fly via Sobel filters.",
    slug: "chromepunk-beast",
    category: "image",
    subtype: "radar-plates"
  },
  "tanvi": {
    id: "03",
    label: "TANVI",
    filename: "premium/tanvi.jpg",
    desc: "A stateful Rayleigh-Bénard thermal convection fluid simulation. The cursor heats the viscous liquid, generating circulating plumes and vortexes that warp coordinates.",
    slug: "tanvi",
    category: "image",
    subtype: "liquid-metal"
  },
  "glitch-streetwear": {
    id: "04",
    label: "GLITCH STREETWEAR",
    filename: "dark-styled/glitch-streetwear.jpg",
    desc: "[DISABLED] Static canvas image.",
    slug: "glitch-streetwear",
    category: "image",
    subtype: "huds"
  },
  "chai-collection": {
    id: "05",
    label: "CHAI COLLECTION",
    filename: "asthetic/chai-collection.jpg",
    desc: "A multi-faceted triangular crystal prism lens. Drags and shifts to refract coordinate space and disperse light into a colorful chromatic spectrum.",
    slug: "chai-collection",
    category: "geometry",
    subtype: "refractors"
  },
  "instagram-overlay": {
    id: "06",
    label: "DIGITAL OVERLAY",
    filename: "asthetic/instagram.jpg",
    desc: "A holographic analog scanline CRT screen glitch overlay. Page scroll velocity and clicks trigger electrostatic distortion, scanline shifts, and chromatic separation.",
    slug: "instagram-overlay",
    category: "image",
    subtype: "huds"
  },
  "merlin-knights": {
    id: "07",
    label: "MERLIN KNIGHTS",
    filename: "medival/merlin-knights.jpg",
    desc: "A Renaissance copperplate engraving sketch. The cursor causes paint to bleed through raw parchment paper fibers, gradually drying back to sepia when resting.",
    slug: "merlin-knights",
    category: "geometry",
    subtype: "engravings"
  },
  "red-refract": {
    id: "08",
    label: "RED REFRACT",
    filename: "dark-styled/red-refract.jpg",
    desc: "An X-ray outline reveal canvas. The cursor acts as a circular focus lens showing high-contrast neon outlines underneath.",
    slug: "red-refract",
    category: "geometry",
    subtype: "scanners"
  },
  "acg-fleece": {
    id: "09",
    label: "ACG FLEECE",
    filename: "dark-styled/acg-fleece.jpg",
    desc: "A global physical bas-relief shader that embosses the image contours in 3D, casting shadows and specular glints dynamically from a cursor-controlled studio light.",
    slug: "acg-fleece",
    category: "image",
    subtype: "radar-plates"
  },
  "apparatus-dee": {
    id: "10",
    label: "APPARATUS DEE",
    filename: "premium/dee.jpg",
    desc: "A molten chrome & liquid mercury flow shader. Warps coordinates in viscous waves and shifts anisotropic studio reflections. Best used with high-contrast, metallic, chrome, or reflective images to maximize the liquid-metal sheen.",
    slug: "apparatus-dee",
    category: "image",
    subtype: "liquid-metal"
  },
  "core-shell-a": {
    id: "11",
    label: "CORE SHELL A",
    filename: "dark-styled/download (1).jpg",
    desc: "A retro magnifying glass lens pixelating the image coordinates underneath.",
    slug: "core-shell-a",
    category: "geometry",
    subtype: "scanners"
  },
  "core-shell-b": {
    id: "12",
    label: "CORE SHELL B",
    filename: "dark-styled/download (2).jpg",
    desc: "Physical expanding water wave ripples generated dynamically by mouse clicks on the canvas.",
    slug: "core-shell-b",
    category: "image",
    subtype: "scanners"
  },
  "kinetic-portal": {
    id: "13",
    label: "KINETIC PORTAL",
    filename: "dark-styled/download (3).jpg",
    desc: "An infrared thermal heat vision spectrum shader mapped dynamically around the cursor.",
    slug: "kinetic-portal",
    category: "hybrid",
    subtype: "scanners"
  },
  "apparatus-faf": {
    id: "14",
    label: "APPARATUS FAF",
    filename: "medival/faf.jpg",
    desc: "An alchemical gilding transmutation shader that preserves a high-fidelity medieval egg-tempera portrait in its pristine, full-color idle state, while dynamically crystallizing a wave of embossed gold leaf across the knight's armor and crown on hover.",
    slug: "apparatus-faf",
    category: "image",
    subtype: "banners",
    tags: ["Alchemical Gilding", "3D Embossed Normal Map", "GPU Wave Simulation"]
  },
  "apparatus-gg": {
    id: "15",
    label: "APPARATUS GG",
    filename: "asthetic/gg.jpg",
    desc: "A 3D elastic membrane vertex pull mapping height protrusions and shadows to cursor coordinates.",
    slug: "apparatus-gg",
    category: "geometry",
    subtype: "canvases"
  },
  "apparatus-hh": {
    id: "16",
    label: "APPARATUS HH",
    filename: "dark-styled/hh.jpg",
    desc: "A 3D refractive water droplet glass bubble double-inverting details underneath with real drop shadows.",
    slug: "apparatus-hh",
    category: "geometry",
    subtype: "refractors"
  },
  "apparatus-kl": {
    id: "17",
    label: "APPARATUS KL",
    filename: "asthetic/kl.jpg",
    desc: "A physical oil-on-canvas simulation modeling high-viscosity lacquer paint. Cursor movement plows a physical displacement trench through the impasto texture, pushing detailed paint ridges to the sides of the stroke. Features velocity-aligned directional paint smudging, canvas micro-weave bump mapping, a deforming reactive border frame, and premium studio light specular highlights.",
    slug: "apparatus-kl",
    category: "geometry",
    subtype: "canvases"
  },
  "chromium-queen": {
    id: "18",
    label: "CHROMIUM QUEEN",
    filename: "premium/chromium-queen.jpg",
    desc: "An anisotropic liquid silk and satin fabric simulation. Mouse movement creates organic folds, waves, and drapes directly in the fabric of the portrait. Features micro-refraction along fabric ridges, chromatic dispersion along wave boundaries, and realistic specular sheen highlights resembling luxurious satin.",
    slug: "chromium-queen",
    category: "image",
    subtype: "silk-drapes"
  },
  "apparatus-fblf": {
    id: "19",
    label: "APPARATUS FBLF",
    filename: "brutalist/fblf.jpg",
    desc: "A 3D medieval knight silhouette displaying interactive depth light reflection.",
    slug: "apparatus-fblf",
    category: "geometry",
    subtype: "drapes"
  },
  "apparatus-fjvfba": {
    id: "20",
    label: "APPARATUS COPPER PATINA",
    filename: "medival/fjvfba.jpg",
    desc: "An interactive medieval copperplate engraving shader. Renders a gleaming copperplate print with rich specular reflection and dark carbon grooves when idle. Hovering causes a rich blue-green verdigris patina to bloom and crawl along the engraved outlines.",
    slug: "apparatus-fjvfba",
    category: "image",
    subtype: "drapes",
    tags: ["Copperplate Etching", "Verdigris Patina", "Chemical Oxidation"]
  },
  "apparatus-ialfa": {
    id: "21",
    label: "APPARATUS IALFA",
    filename: "medival/i  alfa.jpg",
    desc: "A holy knight rendered as a bas-relief stone carving that casts long, ray-marched shadows in response to a raking torchlight cursor.",
    slug: "apparatus-ialfa",
    category: "hybrid",
    subtype: "drapes",
    tags: ["Stone Relief", "Dynamic Shadows", "Raking Torchlight"]
  },
  "apparatus-ll": {
    id: "22",
    label: "APPARATUS LL",
    filename: "brutalist/ll.jpg",
    desc: "A demonic knight steel armor reflection shader responding to light coordinates.",
    slug: "apparatus-ll",
    category: "image",
    subtype: "drapes"
  },
  "deepwood-glimmer": {
    id: "23",
    label: "DEEPWOOD GLIMMER",
    filename: "medival/deepwood-glimmer.jpg",
    desc: "A heavy velvet tapestry forest with volumetric light glimmers.",
    slug: "deepwood-glimmer",
    category: "image",
    subtype: "drapes"
  },
  "stippled-dark": {
    id: "24",
    label: "STIPPLED DARK",
    filename: "asthetic/stippled-dark.jpg",
    desc: "A hand-stippled dark gothic ink shader creating micro-stipple shading under pointer.",
    slug: "stippled-dark",
    category: "yet-to-work-on",
    subtype: "drapes"
  },
  "apparatus-dajd": {
    id: "25",
    label: "APPARATUS DAJD",
    filename: "asthetic/dajd.jpg",
    desc: "A custom light-scattering refraction shader.",
    slug: "apparatus-dajd",
    category: "yet-to-work-on",
    subtype: "drapes"
  },
  "apparatus-jjjj": {
    id: "26",
    label: "APPARATUS JJJJ",
    filename: "asthetic/jjjj.jpg",
    desc: "A stippled ink drawing with dynamic density based on cursor motion.",
    slug: "apparatus-jjjj",
    category: "yet-to-work-on",
    subtype: "drapes"
  },
  "apparatus-hoqnl": {
    id: "27",
    label: "APPARATUS HOQNL",
    filename: "brutalist/hoqnl.jpg",
    desc: "A raw steel relief displacement shader.",
    slug: "apparatus-hoqnl",
    category: "image",
    subtype: "drapes"
  },
  "apparatus-ljbfaf": {
    id: "28",
    label: "APPARATUS LJBFAF",
    filename: "brutalist/ljbfaf.jpg",
    desc: "A chrome metal reflection shader.",
    slug: "apparatus-ljbfaf",
    category: "yet-to-work-on",
    subtype: "drapes"
  },
  "apparatus-underscore": {
    id: "29",
    label: "APPARATUS UNDERSCORE",
    filename: "brutalist/_.jpg",
    desc: "A brutalist distressed steel layout shader.",
    slug: "apparatus-underscore",
    category: "yet-to-work-on",
    subtype: "drapes"
  },
  "apparatus-hdhd": {
    id: "30",
    label: "APPARATUS HDHD",
    filename: "medival/hdhd.jpg",
    desc: "A medieval tapestry layout shader.",
    slug: "apparatus-hdhd",
    category: "yet-to-work-on",
    subtype: "drapes"
  },
  "apparatus-stshsh": {
    id: "31",
    label: "APPARATUS IMAGE FOSSIL",
    filename: "noir/stshsh.jpg",
    desc: "Procedural basalt stone slab excavation with branching cracks and falling chips dust particles.",
    slug: "apparatus-stshsh",
    category: "yet-to-work-on",
    subtype: "excavation"
  },
  "apparatus-merged-v3": {
    id: "32",
    label: "APPARATUS MERGED V3",
    filename: "noir/merged-v3.jpg",
    desc: "A classical stone bust shader reflecting soft studio lights.",
    slug: "apparatus-merged-v3",
    category: "yet-to-work-on",
    subtype: "drapes"
  },
  "apparatus-ldhad": {
    id: "33",
    label: "APPARATUS LDHAD",
    filename: "ldhad.jpg",
    desc: "A high-fidelity refraction layout shader.",
    slug: "apparatus-ldhad",
    category: "yet-to-work-on",
    subtype: "drapes"
  },
  "apparatus-ribbon": {
    id: "34",
    label: "APPARATUS IMAGE ORBIT",
    filename: "premium/chromium-queen.jpg",
    desc: "A double-sided 3D photograph card suspended in mid-air that sways, tilts, and sways dynamically following mouse velocity and scroll progress.",
    slug: "apparatus-ribbon",
    category: "yet-to-work-on",
    subtype: "orbit"
  },
  "apparatus-velocity-deck": {
    id: "35",
    label: "APPARATUS VELOCITY DECK",
    filename: "dark-styled/acg-fleece.jpg",
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
