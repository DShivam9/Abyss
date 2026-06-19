"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AnatomyOfInterface() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const stepTextRef = useRef<HTMLParagraphElement>(null);

  // Inner element refs for animating morphs
  const btnBgRef = useRef<HTMLDivElement>(null);
  const btnTextRef = useRef<HTMLSpanElement>(null);
  const cardImageRef = useRef<HTMLDivElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);
  
  // Dashboard/Module elements
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarLinksRef = useRef<HTMLDivElement>(null);
  const dashContentRef = useRef<HTMLDivElement>(null);

  // Layout grid lines & cells
  const gridLinesRef = useRef<HTMLDivElement>(null);
  const landingHeaderRef = useRef<HTMLDivElement>(null);
  const landingHeroRef = useRef<HTMLDivElement>(null);
  const landingGridRef = useRef<HTMLDivElement>(null);

  // Portfolio & Editorial
  const portfolioGridRef = useRef<HTMLDivElement>(null);
  const editorialRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);

  // Scale handler to fit canvas on mobile screens
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScale(width / 750);
      } else if (width < 1024) {
        setScale(width / 1000);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useGSAP(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const canvas = canvasRef.current;
    const stepText = stepTextRef.current;

    if (!section || !pin || !canvas || !stepText) return;

    // Timeline to scrub with longer scroll distance
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        pin: pin,
        anticipatePin: 1,
      },
    });

    // Step descriptions to show as scroll progresses
    const steps = [
      "Primitive: Component Atom",
      "Evolution: Self-Contained Card",
      "Expansion: Interactive Panel Module",
      "Assembly: Grid Layout System",
      "Spatial: 3D Depth Portfolio Grid",
      "Editorial: High-Contrast Layout Craft",
    ];

    const updateText = (index: number) => {
      if (stepText) {
        stepText.textContent = steps[index];
      }
    };

    // Initialize initial visual state
    gsap.set(canvas, { 
      width: 140, 
      height: 48, 
      borderRadius: 2, 
      rotateX: 0, 
      rotateY: 0, 
      z: 0 
    });
    
    gsap.set(btnBgRef.current, { 
      opacity: 1, 
      top: 6, 
      left: 10, 
      width: 120, 
      height: 36 
    });
    
    gsap.set(btnTextRef.current, { opacity: 1, scale: 1 });
    
    gsap.set([
      cardImageRef.current, cardContentRef.current,
      sidebarRef.current, sidebarLinksRef.current, dashContentRef.current,
      gridLinesRef.current, landingHeaderRef.current, landingHeroRef.current, landingGridRef.current,
      portfolioGridRef.current, editorialRef.current
    ], { opacity: 0 });

    // Timeline sequence

    // --- STEP 1 -> STEP 2: Button to Card ---
    tl.to(canvas, {
      width: 280,
      height: 380,
      borderRadius: 4,
      duration: 1,
      ease: "power2.inOut",
      onStart: () => updateText(0),
      onReverseComplete: () => updateText(0),
    });
    tl.to(btnTextRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      ease: "power2.out",
    }, "<");
    tl.to(btnBgRef.current, {
      top: 320,
      left: 16,
      width: 248,
      height: 40,
      duration: 0.8,
      ease: "power2.inOut",
    }, "<+=0.2");
    tl.to(cardImageRef.current, {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out",
    }, "<+=0.3");
    tl.to(cardContentRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
    }, "<+=0.2");

    // --- STEP 2 -> STEP 3: Card to Module (Dashboard) ---
    tl.to(canvas, {
      width: 540,
      height: 360,
      duration: 1,
      ease: "power2.inOut",
      onStart: () => updateText(1),
      onReverseComplete: () => updateText(1),
    });
    tl.to([cardImageRef.current, cardContentRef.current, btnBgRef.current], {
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut",
    }, "<");
    tl.to(sidebarRef.current, {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out",
    }, "<+=0.3");
    tl.to(sidebarLinksRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
    }, "<+=0.2");
    tl.to(dashContentRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: "power2.out",
    }, "<+=0.2");

    // --- STEP 3 -> STEP 4: Module to Layout ---
    tl.to(canvas, {
      width: 720,
      height: 440,
      duration: 1,
      ease: "power2.inOut",
      onStart: () => updateText(2),
      onReverseComplete: () => updateText(2),
    });
    tl.to([sidebarRef.current, sidebarLinksRef.current, dashContentRef.current], {
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut",
    }, "<");
    tl.to(gridLinesRef.current, {
      opacity: 1,
      duration: 0.4,
    }, "<+=0.3");
    tl.to(landingHeaderRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
    }, "<+=0.2");
    tl.to(landingHeroRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
    }, "<+=0.1");
    tl.to(landingGridRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
    }, "<+=0.1");

    // --- STEP 4 -> STEP 5: Layout to 3D Portfolio ---
    tl.to(canvas, {
      rotateX: 25,
      rotateY: -15,
      z: 50,
      boxShadow: "0 25px 50px -12px rgba(212, 197, 160, 0.15)",
      borderColor: "var(--accent)",
      duration: 1,
      ease: "power2.inOut",
      onStart: () => updateText(3),
      onReverseComplete: () => updateText(3),
    });
    tl.to([landingHeaderRef.current, landingHeroRef.current, landingGridRef.current, gridLinesRef.current], {
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut",
    }, "<");
    tl.to(portfolioGridRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
    }, "<+=0.3");

    // --- STEP 5 -> STEP 6: Portfolio to Editorial ---
    tl.to(canvas, {
      rotateX: 0,
      rotateY: 0,
      z: 0,
      width: 780,
      height: 480,
      boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
      borderColor: "var(--border-clean)",
      duration: 1,
      ease: "power2.inOut",
      onStart: () => updateText(4),
      onComplete: () => updateText(5),
      onReverseComplete: () => updateText(4),
    });
    tl.to(portfolioGridRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.4,
      ease: "power2.inOut",
    }, "<");
    tl.to(editorialRef.current, {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out",
    }, "<+=0.4");
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="exhibition"
      className="relative w-full bg-bg-base select-none border-b border-border-subtle"
      style={{ height: "450vh" }}
    >
      <div
        ref={pinRef}
        className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Floating HUD info */}
        <div className="absolute top-24 left-0 w-full text-center pointer-events-none select-none z-10 flex flex-col gap-2 px-6">
          <h2 className="font-sans text-xl md:text-2xl font-black text-fg-primary uppercase tracking-tight">
            The Anatomy of an Interface
          </h2>
          <p
            ref={stepTextRef}
            className="font-sans text-[11px] text-fg-muted font-bold tracking-wider uppercase"
          >
            Primitive: Component Atom
          </p>
        </div>

        {/* Evolving interface container wrapped for scaling */}
        <div
          className="flex items-center justify-center transition-transform duration-300"
          style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
        >
          <div
            ref={canvasRef}
            className="relative border border-border-clean bg-bg-surface flex items-center justify-center overflow-hidden transition-all duration-300"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* BACKGROUND ATOM: Glowing core */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-32 w-32 rounded-full bg-accent-subtle/20 blur-xl pointer-events-none" />

            {/* --- STATE 1: PRIMITIVE BUTTON --- */}
            <div
              ref={btnBgRef}
              className="absolute border border-accent bg-accent/10 flex items-center justify-center rounded-sm select-none"
            >
              <span
                ref={btnTextRef}
                className="font-sans text-[9px] font-extrabold uppercase tracking-wider text-accent"
              >
                Assemble
              </span>
            </div>

            {/* --- STATE 2: CARD SUB-ELEMENTS --- */}
            <div
              ref={cardImageRef}
              className="absolute top-4 left-4 right-4 bg-bg-deep border border-border-subtle overflow-hidden h-40"
            >
              <div className="absolute inset-0 bg-radial-gradient from-accent-subtle/10 to-transparent" />
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-10 border border-border-clean bg-bg-surface/60 rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/80" />
                </div>
              </div>
            </div>
            <div
              ref={cardContentRef}
              className="absolute bottom-[76px] left-4 right-4 flex flex-col gap-2"
              style={{ transform: "translateY(15px)" }}
            >
              <div className="h-3 bg-fg-primary w-2/3 rounded-full" />
              <div className="h-2 bg-fg-secondary w-5/6 rounded-full" />
              <div className="h-1.5 bg-border-clean w-1/2 rounded-full" />
            </div>

            {/* --- STATE 3: PANEL MODULE (DASHBOARD) --- */}
            {/* Sidebar panel */}
            <div
              ref={sidebarRef}
              className="absolute left-0 top-0 bottom-0 border-r border-border-subtle bg-bg-deep flex flex-col justify-between p-4 w-[140px]"
            >
              <div className="flex flex-col gap-4">
                <div className="w-6 h-6 rounded-sm border border-accent bg-accent-subtle/20" />
                <div
                  ref={sidebarLinksRef}
                  className="flex flex-col gap-2"
                  style={{ transform: "translateY(10px)" }}
                >
                  <div className="h-1.5 bg-fg-secondary w-16 rounded-full" />
                  <div className="h-1.5 bg-border-clean w-12 rounded-full" />
                  <div className="h-1.5 bg-border-clean w-14 rounded-full" />
                </div>
              </div>
              <div className="w-full h-1.5 bg-border-subtle rounded-full" />
            </div>
            {/* Main content grid */}
            <div
              ref={dashContentRef}
              className="absolute left-[160px] right-6 top-6 bottom-6 flex flex-col gap-6"
              style={{ transform: "translateX(20px)" }}
            >
              <div className="flex justify-between items-center">
                <div className="h-3 bg-fg-primary w-28 rounded-full" />
                <div className="w-12 h-5 border border-border-clean bg-bg-deep rounded-sm" />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="border border-border-subtle bg-bg-deep/40 p-4 rounded-sm flex flex-col justify-between">
                  <div className="h-1 bg-fg-secondary w-1/2 rounded-full" />
                  <div className="h-5 bg-accent/10 border border-accent/20 w-12 rounded-sm" />
                </div>
                <div className="border border-border-subtle bg-bg-deep/40 p-4 rounded-sm flex flex-col justify-between">
                  <div className="h-1 bg-fg-secondary w-2/3 rounded-full" />
                  <div className="h-5 bg-border-clean w-16 rounded-sm" />
                </div>
              </div>
            </div>

            {/* --- STATE 4: LANDING PAGE LAYOUT --- */}
            {/* Grid dividers */}
            <div ref={gridLinesRef} className="absolute inset-0 pointer-events-none">
              <div className="absolute top-12 left-0 right-0 h-[1px] bg-border-subtle" />
              <div className="absolute bottom-10 left-0 right-0 h-[1px] bg-border-subtle" />
            </div>
            {/* Header */}
            <div
              ref={landingHeaderRef}
              className="absolute top-3 left-6 right-6 flex justify-between items-center"
              style={{ transform: "translateY(-10px)" }}
            >
              <div className="h-2 bg-fg-primary w-14 rounded-full" />
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-fg-secondary" />
                <div className="w-2 h-2 rounded-full bg-fg-secondary" />
                <div className="w-2 h-2 rounded-full bg-fg-secondary" />
              </div>
            </div>
            {/* Hero details */}
            <div
              ref={landingHeroRef}
              className="absolute top-[80px] left-8 right-8 flex flex-col items-center text-center gap-3"
              style={{ transform: "translateY(15px)" }}
            >
              <div className="h-4 bg-fg-primary w-40 rounded-full" />
              <div className="h-2.5 bg-fg-secondary w-64 rounded-full" />
              <div className="w-16 h-6 border border-accent bg-accent/10 rounded-sm mt-2" />
            </div>
            {/* Feature Grid */}
            <div
              ref={landingGridRef}
              className="absolute bottom-14 left-8 right-8 grid grid-cols-4 gap-4"
              style={{ transform: "translateY(15px)" }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border border-border-subtle bg-bg-deep/60 p-3 rounded-sm flex flex-col gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent/25" />
                  <div className="h-1 bg-fg-secondary w-full rounded-full" />
                  <div className="h-1 bg-border-clean w-2/3 rounded-full" />
                </div>
              ))}
            </div>

            {/* --- STATE 5: 3D PORTFOLIO GRID --- */}
            <div
              ref={portfolioGridRef}
              className="absolute inset-6 grid grid-cols-3 gap-3"
              style={{ transform: "scale(0.95)" }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="border border-border-clean bg-bg-deep flex flex-col justify-between p-3 rounded-sm relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-radial-gradient from-accent-subtle/5 to-transparent opacity-60" />
                  <div className="w-full h-[65%] border border-border-subtle bg-bg-surface/40 flex items-center justify-center">
                    <span className="text-[7px] font-mono text-fg-muted font-bold">PROJECT_0{i}</span>
                  </div>
                  <div className="h-1 bg-fg-secondary w-1/2 rounded-full mt-2" />
                </div>
              ))}
            </div>

            {/* --- STATE 6: EDITORIAL COMPOSITION --- */}
            <div
              ref={editorialRef}
              className="absolute inset-0 grid grid-cols-12 gap-0"
            >
              <div className="col-span-5 border-r border-border-subtle p-6 flex flex-col justify-between bg-bg-deep">
                <span className="font-serif text-5xl font-light text-accent/80 block">01</span>
                <div>
                  <span className="font-sans text-[10px] font-extrabold uppercase tracking-widest text-fg-primary block mb-1">
                    Editorial Frame
                  </span>
                  <div className="h-1 bg-border-clean w-1/3 rounded-full" />
                </div>
              </div>
              <div className="col-span-7 flex flex-col">
                <div className="flex-1 border-b border-border-subtle p-6 flex flex-col justify-between bg-bg-surface">
                  <div className="flex gap-4">
                    <div className="w-16 h-12 border border-border-clean bg-bg-deep" />
                    <div className="flex flex-col gap-1.5 justify-center">
                      <div className="h-2 bg-fg-primary w-20 rounded-full" />
                      <div className="h-1.5 bg-fg-secondary w-32 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="h-1/2 p-6 flex items-center justify-between bg-bg-deep">
                  <div className="h-2 bg-border-clean w-24 rounded-full" />
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom indicator hint */}
        <div className="absolute bottom-16 left-0 w-full text-center pointer-events-none select-none z-10 flex justify-center items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-accent animate-ping" />
          <span className="font-sans text-[8px] uppercase tracking-widest text-fg-muted font-semibold">
            Interactive scroll timeline active
          </span>
        </div>
      </div>
    </section>
  );
}
