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
}

export const COMPONENT_DETAILS: Record<string, ComponentDetail> = {
  "japparii": {
    id: "01",
    label: "JAPPARII INTERCEPT",
    filename: "@japparii instagram.jpg",
    desc: "A hand-drawn Leonardo sketch paper shader rendering image luminance as dynamic cross-hatching diagonal strokes.",
    slug: "japparii",
    category: "vector-hatching"
  },
  "chromepunk-beast": {
    id: "02",
    label: "CHROMEPUNK BEAST",
    filename: "Chromepunk Beast 🧊 #chromepunk #midjourney #aiart #real #nostalgia.jpg",
    desc: "A specular normal-mapped canvas calculating height profiles and embossing shadows on the fly via Sobel filters.",
    slug: "chromepunk-beast",
    category: "normal-lightfield"
  },
  "tanvi": {
    id: "03",
    label: "TANVI TANVI",
    filename: "Gianni Gallant on Instagram_ “TANVI @tanvieverywhere”.jpg",
    desc: "A stateful Rayleigh-Bénard thermal convection fluid simulation. The cursor heats the viscous liquid, generating circulating plumes and vortexes that warp coordinates.",
    slug: "tanvi",
    category: "deform"
  },
  "glitch-streetwear": {
    id: "04",
    label: "GLITCH STREETWEAR",
    filename: "Glitch Streetwear _ Cyberpunk-Inspired Digital Art.jpg",
    desc: "[DISABLED] Static canvas image.",
    slug: "glitch-streetwear",
    category: "static"
  },
  "chai-collection": {
    id: "05",
    label: "CHAI COLLECTION",
    filename: "Illustration Collection-一些插图集合 - 柴 霖霖.jpg",
    desc: "A multi-faceted triangular crystal prism lens. Drags and shifts to refract coordinate space and disperse light into a colorful chromatic spectrum.",
    slug: "chai-collection",
    category: "lens"
  },
  "instagram-overlay": {
    id: "06",
    label: "DIGITAL OVERLAY",
    filename: "Instagram.jpg",
    desc: "A holographic analog scanline CRT screen glitch overlay. Page scroll velocity and clicks trigger electrostatic distortion, scanline shifts, and chromatic separation.",
    slug: "instagram-overlay",
    category: "illuminate"
  },
  "merlin-knights": {
    id: "07",
    label: "MERLIN KNIGHTS",
    filename: "Merlin Knights _ 4K Ultra.jpg",
    desc: "A Renaissance copperplate engraving sketch. The cursor causes paint to bleed through raw parchment paper fibers, gradually drying back to sepia when resting.",
    slug: "merlin-knights",
    category: "transform"
  },
  "red-refract": {
    id: "08",
    label: "RED REFRACT",
    filename: "Referência Fotografia Vermelha.jpg",
    desc: "An X-ray outline reveal canvas. The cursor acts as a circular focus lens showing high-contrast neon outlines underneath.",
    slug: "red-refract",
    category: "border-sweep"
  },
  "acg-fleece": {
    id: "09",
    label: "ACG FLEECE",
    filename: "Supreme Nike ACG Fleece Pullover.jpg",
    desc: "A global physical bas-relief shader that embosses the image contours in 3D, casting shadows and specular glints dynamically from a cursor-controlled studio light.",
    slug: "acg-fleece",
    category: "tactical-radar"
  },
  "apparatus-dee": {
    id: "10",
    label: "APPARATUS DEE",
    filename: "dee.jpg",
    desc: "A molten chrome & liquid mercury flow shader. Warps coordinates in viscous waves and shifts anisotropic studio reflections. Best used with high-contrast, metallic, chrome, or reflective images to maximize the liquid-metal sheen.",
    slug: "apparatus-dee",
    category: "chrome-flow"
  },
  "core-shell-a": {
    id: "11",
    label: "CORE SHELL A",
    filename: "download (1).jpg",
    desc: "A retro magnifying glass lens pixelating the image coordinates underneath.",
    slug: "core-shell-a",
    category: "pixelate-magnifier"
  },
  "core-shell-b": {
    id: "12",
    label: "CORE SHELL B",
    filename: "download (2).jpg",
    desc: "Physical expanding water wave ripples generated dynamically by mouse clicks on the canvas.",
    slug: "core-shell-b",
    category: "wave-ripple"
  },
  "kinetic-portal": {
    id: "13",
    label: "KINETIC PORTAL",
    filename: "download (3).jpg",
    desc: "An infrared thermal heat vision spectrum shader mapped dynamically around the cursor.",
    slug: "kinetic-portal",
    category: "thermic-heatmap"
  },
  "apparatus-faf": {
    id: "14",
    label: "APPARATUS FAF",
    filename: "faf.jpg",
    desc: "A retro halftone dot print shader converting image luminance into CMYK dots.",
    slug: "apparatus-faf",
    category: "halftone-print"
  },
  "apparatus-gg": {
    id: "15",
    label: "APPARATUS GG",
    filename: "gg.jpg",
    desc: "A 3D elastic membrane vertex pull mapping height protrusions and shadows to cursor coordinates.",
    slug: "apparatus-gg",
    category: "membrane-pull"
  },
  "apparatus-hh": {
    id: "16",
    label: "APPARATUS HH",
    filename: "hh.jpg",
    desc: "A 3D refractive water droplet glass bubble double-inverting details underneath with real drop shadows.",
    slug: "apparatus-hh",
    category: "water-droplet"
  },
  "apparatus-kl": {
    id: "17",
    label: "APPARATUS KL",
    filename: "kl.jpg",
    desc: "A physical oil-on-canvas simulation modeling high-viscosity lacquer paint. Cursor movement plows a physical displacement trench through the impasto texture, pushing detailed paint ridges to the sides of the stroke. Features velocity-aligned directional paint smudging, canvas micro-weave bump mapping, a deforming reactive border frame, and premium studio light specular highlights.",
    slug: "apparatus-kl",
    category: "paint-smudge"
  },
  "chromium-queen": {
    id: "18",
    label: "CHROMIUM QUEEN",
    filename: "🔷 Chromium Queen — Rise of Singularity 🔷__#digitalart #futuristicart #chromeaesthetic #cyberpunkvibes #aiartcommunity #scifiillustration #techwearstyle #neofuturism #digitalfashion #singularityrising #femalewarri.jpg",
    desc: "An anisotropic liquid silk and satin fabric simulation. Mouse movement creates organic folds, waves, and drapes directly in the fabric of the portrait. Features micro-refraction along fabric ridges, chromatic dispersion along wave boundaries, and realistic specular sheen highlights resembling luxurious satin.",
    slug: "chromium-queen",
    category: "silk-satin"
  }
};

// Dynamic imports mapping slug to component inside packages/core
export const COMPONENT_IMPORTS: Record<string, React.ComponentType<VesselComponentProps>> = {
  "japparii": dynamic(() => import("@vessel-ui/core").then((mod) => mod.Japparii), { ssr: false }),
  "chromepunk-beast": dynamic(() => import("@vessel-ui/core").then((mod) => mod.ChromepunkBeast), { ssr: false }),
  "tanvi": dynamic(() => import("@vessel-ui/core").then((mod) => mod.Tanvi), { ssr: false }),
  "glitch-streetwear": dynamic(() => import("@vessel-ui/core").then((mod) => mod.GlitchStreetwear), { ssr: false }),
  "chai-collection": dynamic(() => import("@vessel-ui/core").then((mod) => mod.ChaiCollection), { ssr: false }),
  
  "instagram-overlay": dynamic(() => import("@vessel-ui/core").then((mod) => mod.InstagramOverlay), { ssr: false }),
  "merlin-knights": dynamic(() => import("@vessel-ui/core").then((mod) => mod.MerlinKnights), { ssr: false }),
  
  "red-refract": dynamic(() => import("@vessel-ui/core").then((mod) => mod.RedRefract), { ssr: false }),
  "acg-fleece": dynamic(() => import("@vessel-ui/core").then((mod) => mod.AcgFleece), { ssr: false }),
  "apparatus-dee": dynamic(() => import("@vessel-ui/core").then((mod) => mod.ChromeFlow), { ssr: false }),
  "core-shell-a": dynamic(() => import("@vessel-ui/core").then((mod) => mod.CoreShellA), { ssr: false }),
  "core-shell-b": dynamic(() => import("@vessel-ui/core").then((mod) => mod.WaveRipple), { ssr: false }),
  "kinetic-portal": dynamic(() => import("@vessel-ui/core").then((mod) => mod.KineticPortal), { ssr: false }),
  "apparatus-faf": dynamic(() => import("@vessel-ui/core").then((mod) => mod.ApparatusFaf), { ssr: false }),
  "apparatus-gg": dynamic(() => import("@vessel-ui/core").then((mod) => mod.ApparatusGg), { ssr: false }),
  "apparatus-hh": dynamic(() => import("@vessel-ui/core").then((mod) => mod.ApparatusHh), { ssr: false }),
  "apparatus-kl": dynamic(() => import("@vessel-ui/core").then((mod) => mod.ApparatusKl), { ssr: false }),
  "chromium-queen": dynamic(() => import("@vessel-ui/core").then((mod) => mod.ChromiumQueen), { ssr: false }),
};

export function getComponent(slug: string) {
  const meta = COMPONENT_DETAILS[slug];
  const Component = COMPONENT_IMPORTS[slug];
  return { Component, meta };
}
