"use client";

import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import AnatomyOfInterface from "../components/AnatomyOfInterface";
import BentoGrid from "../components/BentoGrid";
import Showcase from "../components/Showcase";
import Atmosphere from "../components/Atmosphere";
import Footer from "../components/Footer";
import Lenis from "lenis";

export default function Home() {
  // Initialize Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard Decelerated ease
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-bg-base text-fg-secondary">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {/* Section 01: Hero Environment */}
        <Hero />

        {/* Section 02: Signature Experience (Anatomy of an Interface) */}
        <AnatomyOfInterface />

        {/* Section 03: Bento Grid (Tokens & Dynamic Interaction) */}
        <BentoGrid />

        {/* Section 04: Pinned Showcase (Live Functional Component Previews) */}
        <Showcase />

        {/* Section 05: Atmosphere (Visual depth / environment) */}
        <Atmosphere />
      </main>

      {/* Footer Action */}
      <Footer />
    </div>
  );
}
