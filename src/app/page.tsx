"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ArrivalZone from "@/components/zones/ArrivalZone";
import PhilosophyZone from "@/components/zones/PhilosophyZone";
import GalleryZone from "@/components/zones/GalleryZone";
import ManifestoZone from "@/components/zones/ManifestoZone";
import Footer from "@/components/Footer";

const sectionColors = {
  arrival: { accent: "#C07860", hover: "#E8A088" },
  philosophy: { accent: "#8A7B6A", hover: "#B8AFA4" },
  gallery: { accent: "#9E6B5A", hover: "#CFA396" },
  manifesto: { accent: "#6B8A7B", hover: "#9FBEAF" },
};

export default function Home() {
  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    Object.entries(sectionColors).forEach(([id, colors]) => {
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: "top 60%",
        end: "bottom 40%",
        onEnter: () => transitionColors(colors.accent, colors.hover),
        onEnterBack: () => transitionColors(colors.accent, colors.hover),
      });
    });

    function transitionColors(accent: string, hover: string) {
      gsap.to(document.documentElement, {
        "--accent": accent,
        "--accent-hover": hover,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, []);

  return (
    <main className="w-full min-h-screen bg-bg-base overflow-x-hidden">
      {/* Zone 1 — Arrival (Hero) */}
      <ArrivalZone />

      {/* Zone 2 — Philosophy (Scroll Pinned Text Scrub) */}
      <PhilosophyZone />

      {/* Zone 3 — Gallery (Horizontal Exhibition Scroll) */}
      <GalleryZone />

      {/* Zone 4 — Manifesto (Geometric Statement) */}
      <ManifestoZone />

      {/* Footer */}
      <Footer />
    </main>
  );
}
