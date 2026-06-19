"use client";

import React, { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Showcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);

  // 1. Magnetic Button Refs
  const magnetCardRef = useRef<HTMLDivElement>(null);
  const magnetBtnRef = useRef<HTMLButtonElement>(null);

  // 2. Kinetic Typography State/Refs
  const typoCardRef = useRef<HTMLDivElement>(null);
  const [typoMouseX, setTypoMouseX] = useState(0);
  const [typoCardWidth, setTypoCardWidth] = useState(0);

  // 3. Spring Tooltip State/Refs
  const tooltipCardRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // 4. Atmospheric Background Canvas Refs
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);
  const miniCanvasCardRef = useRef<HTMLDivElement>(null);

  // 5. Image Reveal state/refs
  const revealCardRef = useRef<HTMLDivElement>(null);
  const [revealPos, setRevealPos] = useState({ x: 100, y: 100 });
  const [revealActive, setRevealActive] = useState(false);

  // 6. Navigation Pill Refs
  const navCardRef = useRef<HTMLDivElement>(null);
  const navPillRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Pin Left Column layout logic
  useGSAP(() => {
    const leftPanel = leftPanelRef.current;
    const container = containerRef.current;
    if (!leftPanel || !container) return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    let pinTrigger: globalThis.ScrollTrigger | null = null;

    const setupPin = () => {
      if (mediaQuery.matches) {
        pinTrigger = ScrollTrigger.create({
          trigger: container,
          start: "top top+=80px",
          end: "bottom bottom",
          pin: leftPanel,
          pinSpacing: false,
          anticipatePin: 1,
        });
      } else {
        if (pinTrigger) {
          pinTrigger.kill();
          pinTrigger = null;
        }
        gsap.set(leftPanel, { clearProps: "all" });
      }
    };

    // Stagger reveal left panel contents
    const leftChildren = leftPanelRef.current?.children;
    if (leftChildren) {
      gsap.fromTo(leftChildren,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: leftPanelRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

    // Stagger reveal right panel interactive cards
    const cards = cardsContainerRef.current?.children;
    if (cards) {
      gsap.fromTo(cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardsContainerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

    setupPin();
    mediaQuery.addEventListener("change", setupPin);

    return () => {
      if (pinTrigger) pinTrigger.kill();
      mediaQuery.removeEventListener("change", setupPin);
    };
  }, { scope: containerRef });

  // 1. Magnetic Button Mouse Move
  const handleMagnetMove = (e: React.MouseEvent) => {
    const card = magnetCardRef.current;
    const button = magnetBtnRef.current;
    if (!card || !button) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const btnRect = button.getBoundingClientRect();
    const btnCenterX = btnRect.left - rect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top - rect.top + btnRect.height / 2;

    const distX = x - btnCenterX;
    const distY = y - btnCenterY;
    const dist = Math.sqrt(distX * distX + distY * distY);

    const activeRange = 100;
    const maxPull = 22;

    if (dist < activeRange) {
      const factor = 1 - dist / activeRange;
      const pullX = distX * factor * 0.45;
      const pullY = distY * factor * 0.45;
      
      gsap.to(button, {
        x: Math.max(-maxPull, Math.min(maxPull, pullX)),
        y: Math.max(-maxPull, Math.min(maxPull, pullY)),
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1.1, 0.4)",
        overwrite: "auto",
      });
    }
  };

  const handleMagnetLeave = () => {
    if (magnetBtnRef.current) {
      gsap.to(magnetBtnRef.current, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1.2, 0.3)",
        overwrite: "auto",
      });
    }
  };

  // 2. Kinetic Typography Mouse Move
  const handleTypoMove = (e: React.MouseEvent) => {
    const card = typoCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    setTypoMouseX(e.clientX - rect.left);
    setTypoCardWidth(rect.width);
  };

  // 3. Spring Tooltip Mouse Move
  const handleTooltipMove = (e: React.MouseEvent) => {
    const card = tooltipCardRef.current;
    const tooltip = tooltipRef.current;
    if (!card || !tooltip) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    gsap.to(tooltip, {
      left: x,
      top: y - 12,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  // 4. Interactive Miniature Atmosphere Canvas
  useEffect(() => {
    const canvas = miniCanvasRef.current;
    const card = miniCanvasCardRef.current;
    if (!canvas || !card) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = card.clientWidth);
    let height = (canvas.height = 180);

    const handleResize = () => {
      width = canvas.width = card.clientWidth;
      height = canvas.height = 180;
    };
    window.addEventListener("resize", handleResize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      alpha: number;
      decay: number;
    }

    const particles: Particle[] = [];

    // Animation Loop
    let animFrame: number;
    const render = () => {
      ctx.fillStyle = "rgba(10, 10, 10, 0.25)";
      ctx.fillRect(0, 0, width, height);

      // Render vertical lines outline
      ctx.strokeStyle = "rgba(31, 31, 31, 0.3)";
      ctx.lineWidth = 1;
      for (let x = 40; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 197, 160, ${p.alpha})`;
        ctx.fill();

        if (p.alpha <= 0) {
          particles.splice(idx, 1);
        }
      });

      // Spawn subtle ambient particles periodically
      if (Math.random() < 0.1 && particles.length < 50) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          alpha: Math.random() * 0.4 + 0.2,
          decay: Math.random() * 0.003 + 0.001,
        });
      }

      animFrame = requestAnimationFrame(render);
    };

    render();

    // Click to spawn wave of particles
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.8 + 0.4;
        particles.push({
          x: clickX,
          y: clickY,
          size: Math.random() * 2 + 1,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 0.9,
          decay: Math.random() * 0.015 + 0.01,
        });
      }
    };

    canvas.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  // 5. Image Reveal Mouse Move
  const handleRevealMove = (e: React.MouseEvent) => {
    const card = revealCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    setRevealPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // 6. Navigation Pill Mouse Enter menu items
  const handleNavHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const pill = navPillRef.current;
    const card = navCardRef.current;
    if (!pill || !card) return;

    const item = e.currentTarget;
    const itemRect = item.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const top = itemRect.top - cardRect.top;
    const height = itemRect.height;

    gsap.to(pill, {
      top: top + 4,
      height: height - 8,
      opacity: 1,
      duration: 0.35,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const handleNavLeave = () => {
    if (navPillRef.current) {
      gsap.to(navPillRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  return (
    <section
      ref={containerRef}
      id="showcase"
      className="mx-auto flex w-full max-w-7xl flex-col gap-0 border-l border-r border-border-subtle bg-bg-base lg:flex-row relative"
    >
      {/* LEFT COLUMN: Pinned Information Node */}
      <div className="w-full border-b border-border-subtle lg:w-1/2 lg:border-b-0 lg:border-r lg:min-h-screen">
        <div
          ref={leftPanelRef}
          className="flex flex-col justify-between p-8 md:p-12 lg:h-[calc(100vh-120px)] lg:justify-between"
        >
          <div className="flex flex-col gap-4">
            <h2 className="font-sans text-3xl font-black tracking-[-0.04em] text-fg-primary md:text-5xl uppercase leading-tight">
              TACTILE
              <br />
              COMPONENTS.
            </h2>
            <p className="font-sans text-xs leading-relaxed text-fg-secondary max-w-sm mt-4 font-medium">
              Interact directly with the component nodes. These previews are fully responsive visual and functional system demonstrators.
            </p>
          </div>

          <div className="flex flex-col gap-6 mt-12 lg:mt-0 border-t border-border-subtle pt-8 font-sans text-[10px] tracking-wider uppercase">
            <div className="flex justify-between items-center">
              <span className="text-fg-muted font-bold">Standard:</span>
              <span className="text-accent font-bold">Beauty First</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-fg-muted font-bold">Interpolation:</span>
              <span className="text-fg-primary font-bold">Spring Physics</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-fg-muted font-bold">Validation:</span>
              <span className="text-fg-primary font-bold">Touch Adaptive</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Live Component Previews */}
      <div
        ref={cardsContainerRef}
        className="w-full lg:w-1/2 flex flex-col"
      >
        
        {/* SHOWCASE 01: Magnetic Button */}
        <div
          ref={magnetCardRef}
          onMouseMove={handleMagnetMove}
          onMouseLeave={handleMagnetLeave}
          className="border-b border-border-subtle p-8 md:p-12 flex flex-col justify-between min-h-[420px] select-none"
        >
          <div className="flex justify-between items-center font-sans text-[9px] tracking-wider uppercase text-fg-muted">
            <span>Button</span>
            <span className="text-accent font-bold">Hover_Force</span>
          </div>

          <div className="flex flex-1 items-center justify-center my-6">
            <button
              ref={magnetBtnRef}
              className="px-6 h-11 border border-accent bg-accent-subtle/20 hover:bg-accent-subtle/30 text-accent font-sans text-xs uppercase tracking-widest font-bold rounded-sm pointer-events-none"
            >
              Magnetic
            </button>
          </div>

          <div>
            <span className="font-sans text-xs font-bold text-fg-primary block mb-1">Magnetic Action</span>
            <p className="font-sans text-[11px] text-fg-secondary font-medium">
              Interactive node attracts towards pointer coordinates. Returns via elastic spring deceleration.
            </p>
          </div>
        </div>

        {/* SHOWCASE 02: Kinetic Typography */}
        <div
          ref={typoCardRef}
          onMouseMove={handleTypoMove}
          className="border-b border-border-subtle p-8 md:p-12 flex flex-col justify-between min-h-[420px] select-none cursor-ew-resize"
        >
          <div className="flex justify-between items-center font-sans text-[9px] tracking-wider uppercase text-fg-muted">
            <span>Typography</span>
            <span className="text-fg-primary font-bold">Interactive_Skew</span>
          </div>

          <div className="flex flex-1 items-center justify-center my-6">
            <div className="flex gap-1">
              {"KINETIC".split("").map((letter, idx) => {
                const charCenter = (idx + 0.5) * (typoCardWidth / 7);
                const distance = Math.abs(typoMouseX - charCenter);
                const maxRange = 120;
                let skew = 0;
                let scale = 1;
                let weight = 900;
                
                if (distance < maxRange) {
                  const pct = 1 - distance / maxRange;
                  skew = pct * 20 * (typoMouseX > charCenter ? -1 : 1);
                  scale = 1 + pct * 0.25;
                  weight = Math.round(900 - pct * 600);
                }

                return (
                  <span
                    key={idx}
                    className="font-sans text-3xl md:text-5xl font-black text-fg-primary inline-block transition-all duration-150 ease-out"
                    style={{
                      transform: `scale(${scale}) skewX(${skew}deg)`,
                      fontWeight: weight,
                    }}
                  >
                    {letter}
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <span className="font-sans text-xs font-bold text-fg-primary block mb-1">Kinetic Typography</span>
            <p className="font-sans text-[11px] text-fg-secondary font-medium">
              Letterforms adjust weights and dynamic horizontal skew profiles on pointer alignment.
            </p>
          </div>
        </div>

        {/* SHOWCASE 03: Animated Tooltip */}
        <div
          ref={tooltipCardRef}
          onMouseMove={handleTooltipMove}
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
          className="border-b border-border-subtle p-8 md:p-12 flex flex-col justify-between min-h-[420px] relative overflow-hidden select-none cursor-crosshair"
        >
          <div className="flex justify-between items-center font-sans text-[9px] tracking-wider uppercase text-fg-muted z-10">
            <span>Tooltip</span>
            <span className="text-fg-primary font-bold">Physics_Follow</span>
          </div>

          <div className="flex flex-1 items-center justify-center my-6 z-10">
            <span className="font-sans text-[10px] uppercase tracking-wider text-fg-muted border border-dashed border-border-clean px-4 py-2 rounded-sm bg-bg-surface/20">
              Hover context canvas
            </span>
          </div>

          {/* Floating spring tooltip node */}
          <div
            ref={tooltipRef}
            className="absolute z-20 pointer-events-none border border-accent bg-bg-deep px-3 py-1.5 rounded-sm shadow-xl flex items-center gap-2 -translate-x-1/2 -translate-y-full transition-opacity duration-300"
            style={{
              opacity: tooltipVisible ? 1 : 0,
              left: "50%",
              top: "50%",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-accent font-bold">
              AbsoluteUI Node
            </span>
          </div>

          <div>
            <span className="font-sans text-xs font-bold text-fg-primary block mb-1">Lagging Spring Tooltip</span>
            <p className="font-sans text-[11px] text-fg-secondary font-medium">
              Tooltip node tracking pointer coordinates with physical fluid deceleration.
            </p>
          </div>
        </div>

        {/* SHOWCASE 04: Interactive Atmosphere */}
        <div
          ref={miniCanvasCardRef}
          className="border-b border-border-subtle p-8 md:p-12 flex flex-col justify-between min-h-[420px] select-none cursor-pointer"
        >
          <div className="flex justify-between items-center font-sans text-[9px] tracking-wider uppercase text-fg-muted">
            <span>Atmosphere</span>
            <span className="text-accent font-bold">Canvas_Ripple</span>
          </div>

          <div className="w-full h-[180px] border border-border-clean bg-bg-deep rounded-sm overflow-hidden relative my-6">
            <canvas ref={miniCanvasRef} className="absolute inset-0 w-full h-full" />
            <div className="absolute bottom-3 right-3 pointer-events-none text-[8px] uppercase tracking-widest text-fg-muted font-bold">
              Click to emit waves
            </div>
          </div>

          <div>
            <span className="font-sans text-xs font-bold text-fg-primary block mb-1">Ambient Vector Canvas</span>
            <p className="font-sans text-[11px] text-fg-secondary font-medium">
              Miniature HTML5 canvas particle environment. Gestures generate dynamic circular vectors.
            </p>
          </div>
        </div>

        {/* SHOWCASE 05: Image Reveal */}
        <div
          ref={revealCardRef}
          onMouseMove={handleRevealMove}
          onMouseEnter={() => setRevealActive(true)}
          onMouseLeave={() => setRevealActive(false)}
          className="border-b border-border-subtle p-8 md:p-12 flex flex-col justify-between min-h-[420px] relative overflow-hidden select-none cursor-none"
        >
          <div className="flex justify-between items-center font-sans text-[9px] tracking-wider uppercase text-fg-muted z-10">
            <span>Reveal</span>
            <span className="text-fg-primary font-bold">Circular_Mask</span>
          </div>

          <div className="w-full h-[180px] border border-border-clean bg-bg-deep rounded-sm overflow-hidden relative my-6">
            {/* Grayscale baseline image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://picsum.photos/seed/editorial/800/400"
              alt="Reveal preview base"
              className="absolute inset-0 w-full h-full object-cover opacity-15 filter grayscale"
            />
            {/* Accent revealed image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://picsum.photos/seed/editorial/800/400"
              alt="Reveal preview mask"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              style={{
                opacity: revealActive ? 1 : 0,
                clipPath: revealActive
                  ? `circle(60px at ${revealPos.x}px ${revealPos.y}px)`
                  : "circle(0px at 0px 0px)",
              }}
            />
          </div>

          <div>
            <span className="font-sans text-xs font-bold text-fg-primary block mb-1">Image Spotlight Reveal</span>
            <p className="font-sans text-[11px] text-fg-secondary font-medium">
              Reveal full color depth profiles within pointer radius bounding metrics.
            </p>
          </div>
        </div>

        {/* SHOWCASE 06: Spring Navigation Menu */}
        <div
          ref={navCardRef}
          className="border-b lg:border-b-0 border-border-subtle p-8 md:p-12 flex flex-col justify-between min-h-[420px] relative overflow-hidden select-none"
        >
          <div className="flex justify-between items-center font-sans text-[9px] tracking-wider uppercase text-fg-muted">
            <span>Navigation</span>
            <span className="text-fg-primary font-bold">Slider_Plate</span>
          </div>

          <div className="flex flex-col gap-3 w-full my-auto max-w-sm mx-auto relative py-4" onMouseLeave={handleNavLeave}>
            {/* Hover sliding pill */}
            <div
              ref={navPillRef}
              className="absolute left-0 w-full bg-accent-subtle border border-accent/20 rounded-sm pointer-events-none opacity-0"
              style={{ top: 0, height: 0 }}
            />
            
            {["Interface Anatomy", "Bento Demonstration", "Atmosphere Drift"].map((title, i) => (
              <div
                key={i}
                onMouseEnter={handleNavHover}
                className="flex items-center justify-between py-2.5 px-4 rounded-sm cursor-pointer text-xs font-sans uppercase tracking-widest font-extrabold text-fg-secondary hover:text-accent transition-colors duration-150 relative z-10 group"
              >
                <span>{title}</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold">→</span>
              </div>
            ))}
          </div>

          <div>
            <span className="font-sans text-xs font-bold text-fg-primary block mb-1">Spring Menu Slider</span>
            <p className="font-sans text-[11px] text-fg-secondary font-medium">
              Menu container coordinates hover items, sliding an active accent pill behind elements.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
