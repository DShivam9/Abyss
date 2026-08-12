import { COMPONENT_DETAILS } from "./registry";
import { ComponentDetail } from "./registry/types";

export interface PeerDep {
  name: string;
  version: string;
  purpose: string;
}

export const PEER_DEPS: PeerDep[] = [
  { name: "@abyss-ui/core", version: "^0.1.0", purpose: "Core WebGL, Three.js & GSAP component primitives" },
  { name: "three", version: "^0.168.0", purpose: "3D scene graph & WebGL rendering engine" },
  { name: "@react-three/fiber", version: "^9.0.0", purpose: "React renderer for Three.js scenes" },
  { name: "@react-three/drei", version: "^10.0.0", purpose: "Useful helpers and controls for React Three Fiber" },
  { name: "gsap", version: "^3.12.5", purpose: "Animation engine for scroll & timeline choreography" },
  { name: "@gsap/react", version: "^2.1.1", purpose: "React hook wrappers for safe GSAP cleanup" },
];

export const INSTALL_COMMANDS = {
  npm: "npm install @abyss-ui/core three @react-three/fiber @react-three/drei gsap @gsap/react",
  yarn: "yarn add @abyss-ui/core three @react-three/fiber @react-three/drei gsap @gsap/react",
  pnpm: "pnpm add @abyss-ui/core three @react-three/fiber @react-three/drei gsap @gsap/react",
  bun: "bun add @abyss-ui/core three @react-three/fiber @react-three/drei gsap @gsap/react",
};

export const QUICK_EXAMPLE_CODE = `import { VesselCanvas, ParallaxColumn } from "@abyss-ui/core";

export default function GalleryPage() {
  return (
    <main className="w-full min-h-screen bg-[#0A0A0A]">
      <VesselCanvas>
        <ParallaxColumn
          images={[
            "/images/scroll/cosmos_1859262512.webp",
            "/images/scroll/p1_hq.webp",
          ]}
          parallaxIntensity={70}
          speedFactor={1.0}
        />
      </VesselCanvas>
    </main>
  );
}`;

/**
 * Returns all 34 components sorted alphabetically by label for direct flat listing.
 */
export function getAllDocsComponents(): ComponentDetail[] {
  return Object.values(COMPONENT_DETAILS).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}
