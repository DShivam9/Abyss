"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function BentoGrid() {
  // Accent switcher state
  const [accent, setAccent] = useState<"gold" | "ivory">("gold");

  // JSON Token tabs
  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "motion">("colors");

  const sectionRef = useRef<HTMLDivElement>(null);
  // Gravity Button refs & physics
  const gravityCardRef = useRef<HTMLDivElement>(null);
  const gravityButtonRef = useRef<HTMLButtonElement>(null);

  // Performance Tracker state
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(1.2);
  const [fpsHistory, setFpsHistory] = useState<number[]>(Array(24).fill(60));

  // Drift Typography scroll tracking
  const driftRef = useRef<HTMLDivElement>(null);
  const [scrollVelocity, setScrollVelocity] = useState(0);

  // Token definitions
  const tokens = {
    colors: {
      "--bg-deep": "#050505",
      "--bg-base": "#0A0A0A",
      "--bg-surface": "#121212",
      "--bg-elevated": "#1A1A1A",
      "--accent": "#D4C5A0",
    },
    typography: {
      "font-sans": "Satoshi, Switzer, Geist Sans",
      "font-mono": "JetBrains Mono (restrained)",
      "h1-tracking": "-0.04em",
    },
    motion: {
      "ease-fluid": "cubic-bezier(0.25, 1, 0.5, 1)",
      "ease-magnetic": "cubic-bezier(0.16, 1, 0.3, 1)",
      "duration-base": "250ms",
    },
  };

  // Performance FPS loop
  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;
    let animFrameId: number;

    const tick = () => {
      frameCount++;
      const time = performance.now();
      
      if (time >= lastTime + 1000) {
        const measuredFps = Math.round((frameCount * 1000) / (time - lastTime));
        setFps(measuredFps);
        setLatency(Number((1000 / measuredFps).toFixed(1)));
        
        setFpsHistory((prev) => {
          const next = [...prev.slice(1), measuredFps];
          return next;
        });

        frameCount = 0;
        lastTime = time;
      }
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  // Scroll Velocity tracking for Drift Typography
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let timeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = performance.now();
      const deltaY = Math.abs(currentScrollY - lastScrollY);
      const deltaTime = currentTime - lastTime;

      if (deltaTime > 0) {
        const velocity = (deltaY / deltaTime) * 10;
        setScrollVelocity(Math.min(velocity, 25)); // Cap velocity offset
      }

      lastScrollY = currentScrollY;
      lastTime = currentTime;

      // Decay velocity when scrolling stops
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setScrollVelocity(0);
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  // Scroll Reveal for cells
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cells = section.children;

    gsap.fromTo(cells, 
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          toggleActions: "play none none reverse",
        }
      }
    );
  }, []);

  // Gravity Button Mouse Move handler
  const handleGravityMouseMove = (e: React.MouseEvent) => {
    const card = gravityCardRef.current;
    const button = gravityButtonRef.current;
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

    const maxDist = 140;
    const maxDisplacement = 12; // Clamped Swiss limit

    if (dist < maxDist) {
      const factor = (1 - dist / maxDist);
      const pullX = distX * factor * 0.35;
      const pullY = distY * factor * 0.35;
      
      const clampedX = Math.max(-maxDisplacement, Math.min(maxDisplacement, pullX));
      const clampedY = Math.max(-maxDisplacement, Math.min(maxDisplacement, pullY));

      gsap.to(button, {
        x: clampedX,
        y: clampedY,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  };

  const handleGravityMouseLeave = () => {
    const button = gravityButtonRef.current;
    if (!button) return;
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  return (
    <section
      ref={sectionRef}
      id="components"
      className="mx-auto grid w-full max-w-7xl grid-cols-1 md:grid-cols-4 gap-0 border-t border-l border-border-subtle bg-bg-base overflow-hidden"
    >
      {/* CELL 01: Gravity Button Sandbox (2x2) */}
      <div
        ref={gravityCardRef}
        onMouseMove={handleGravityMouseMove}
        onMouseLeave={handleGravityMouseLeave}
        className="col-span-1 md:col-span-2 row-span-2 border-r border-b border-border-subtle p-8 flex flex-col justify-between min-h-[380px] relative overflow-hidden group select-none"
      >
        <div className="flex items-center justify-between font-sans text-[10px] tracking-wider uppercase">
          <span className="text-fg-muted">Interaction</span>
          <span className={accent === "gold" ? "text-accent font-bold" : "text-fg-primary font-bold"}>
            GRAVITY_FORCE
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <button
            ref={gravityButtonRef}
            className={`relative flex h-14 items-center justify-center border font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 select-none px-8 rounded-sm ${
              accent === "gold"
                ? "bg-bg-surface hover:bg-bg-elevated border-border-clean text-fg-primary hover:border-accent/40"
                : "bg-bg-surface hover:bg-bg-elevated border-border-clean text-fg-primary"
            }`}
          >
            {accent === "gold" && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
              </span>
            )}
            Hover Magnetic Force
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-sans text-sm font-bold text-fg-primary">Physical Interaction</span>
          <p className="font-sans text-[11px] leading-relaxed text-fg-secondary mt-0.5">
            Gravitational pull on interactive elements, clamped to 12px.
          </p>
        </div>
      </div>

      {/* CELL 02: Performance Matrix (1x2) */}
      <div className="col-span-1 md:col-span-1 row-span-2 border-r border-b border-border-subtle p-8 flex flex-col justify-between min-h-[380px] bg-bg-surface/10 select-none">
        <div className="flex items-center justify-between font-sans text-[10px] tracking-wider uppercase text-fg-muted">
          <span>Motion</span>
          <span>FLUID_DYNAMICS</span>
        </div>

        <div className="flex flex-col gap-6 my-auto">
          {/* FPS Gauge */}
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-5xl font-black text-fg-primary tracking-tight">
              {fps}
            </span>
            <span className="font-sans text-xs font-bold uppercase text-fg-muted">fps</span>
          </div>

          {/* Mini Chart */}
          <div className="flex h-16 items-end gap-[3px] border-b border-border-subtle pb-1 w-full overflow-hidden">
            {fpsHistory.map((val, idx) => {
              const heightPct = Math.min(100, Math.max(10, (val / 60) * 100));
              return (
                <div
                  key={idx}
                  className={`w-full transition-all duration-300 ${
                    val >= 58
                      ? accent === "gold"
                        ? "bg-accent/60"
                        : "bg-fg-primary/40"
                      : "bg-red-500/40"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4 font-sans text-[10px] uppercase">
            <div>
              <span className="text-fg-muted block">Frame Time:</span>
              <span className="text-fg-primary font-semibold">{latency} ms</span>
            </div>
            <div>
              <span className="text-fg-muted block">Jitter Index:</span>
              <span className="text-fg-primary font-semibold">0.1 ms</span>
            </div>
          </div>
        </div>

        <div>
          <span className="font-sans text-xs font-bold text-fg-primary block mb-1">Frame Dynamics</span>
          <p className="font-sans text-[11px] leading-relaxed text-fg-secondary mt-0.5">
            Hardware-accelerated rendering at continuous 60fps.
          </p>
        </div>
      </div>

      {/* CELL 03: Accent Switcher (1x2) */}
      <div className="col-span-1 md:col-span-1 row-span-2 border-r border-b border-border-subtle p-8 flex flex-col justify-between min-h-[380px] select-none">
        <div className="flex items-center justify-between font-sans text-[10px] tracking-wider uppercase text-fg-muted">
          <span>Atmosphere</span>
          <span>CHROMATIC_BALANCE</span>
        </div>

        <div className="flex flex-col gap-4 my-auto items-center">
          <div className="flex flex-col gap-2 w-full max-w-[150px]">
            <button
              onClick={() => setAccent("gold")}
              className={`w-full flex h-10 items-center justify-center font-sans text-[10px] font-bold uppercase tracking-wider border rounded-sm transition-all duration-150 cursor-pointer ${
                accent === "gold"
                  ? "bg-accent/10 border-accent text-accent font-bold"
                  : "bg-bg-surface border-border-clean text-fg-muted hover:text-fg-primary"
              }`}
            >
              Warm Gold
            </button>
            <button
              onClick={() => setAccent("ivory")}
              className={`w-full flex h-10 items-center justify-center font-sans text-[10px] font-bold uppercase tracking-wider border rounded-sm transition-all duration-150 cursor-pointer ${
                accent === "ivory"
                  ? "bg-fg-primary/10 border-fg-primary text-fg-primary font-bold"
                  : "bg-bg-surface border-border-clean text-fg-muted hover:text-fg-primary"
              }`}
            >
              Neutral Ivory
            </button>
          </div>
        </div>

        <div>
          <span className="font-sans text-xs font-bold text-fg-primary block mb-1">Visual Tone</span>
          <p className="font-sans text-[11px] leading-relaxed text-fg-secondary mt-0.5">
            Toggle highlight accents dynamically.
          </p>
        </div>
      </div>

      {/* CELL 04: JSON Registry Viewer (2x1) */}
      <div className="col-span-1 md:col-span-2 row-span-1 border-r border-b border-border-subtle p-8 flex flex-col justify-between min-h-[260px] select-none">
        <div className="flex items-center justify-between font-sans text-[10px] tracking-wider uppercase text-fg-muted">
          <span>Craft</span>
          <span>DESIGN_SPECIFICATION</span>
        </div>

        {/* Tab options */}
        <div className="flex gap-2 border-b border-border-subtle pb-2 w-full text-[10px] font-sans uppercase tracking-wider font-bold">
          {(["colors", "typography", "motion"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 border rounded-sm transition-all duration-150 cursor-pointer ${
                activeTab === tab
                  ? accent === "gold"
                    ? "bg-accent-subtle border-accent text-fg-primary font-bold"
                    : "bg-bg-elevated border-fg-primary text-fg-primary font-bold"
                  : "bg-bg-surface border-border-subtle text-fg-muted hover:text-fg-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* JSON Display */}
        <div className="bg-bg-surface/50 border border-border-subtle p-4 rounded-sm font-mono text-[11px] text-fg-secondary w-full overflow-x-auto my-4 max-h-28">
          <pre>{JSON.stringify(tokens[activeTab], null, 2)}</pre>
        </div>

        <div>
          <span className="font-sans text-xs font-bold text-fg-primary block mb-1">Design Specification</span>
          <p className="font-sans text-[11px] leading-relaxed text-fg-secondary mt-0.5">
            Tokens loaded dynamically to assemble interfaces.
          </p>
        </div>
      </div>

      {/* CELL 05: Drift Typography (2x1) */}
      <div
        ref={driftRef}
        className="col-span-1 md:col-span-2 row-span-1 border-r border-b border-border-subtle p-8 flex flex-col justify-between min-h-[260px] relative overflow-hidden group select-none"
      >
        <div className="flex items-center justify-between font-sans text-[10px] tracking-wider uppercase text-fg-muted">
          <span>Typography</span>
          <span className="text-fg-primary font-bold">DRIFT_SCALE</span>
        </div>

        {/* Drift animation text */}
        <div className="flex flex-1 items-center justify-center my-6">
          <div 
            className="flex font-sans text-2xl md:text-4xl font-extrabold tracking-[-0.04em] text-fg-primary transition-all duration-300 ease-out select-none uppercase"
            style={{ 
              letterSpacing: `${0.1 + scrollVelocity * 0.45}em`,
              transform: `skewX(${scrollVelocity * 0.75}deg)`
            }}
          >
            {"DRIFT".split("").map((letter, idx) => (
              <span 
                key={idx} 
                className="inline-block transition-transform duration-300"
                style={{
                  transform: `translateY(${(idx % 2 === 0 ? -1 : 1) * scrollVelocity * 1.5}px)`
                }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-sans text-xs font-bold text-fg-primary">Kinetic Typography</span>
          <p className="font-sans text-[11px] leading-relaxed text-fg-secondary mt-0.5">
            Letterforms skew and shift tracking relative to scroll velocity.
          </p>
        </div>
      </div>
    </section>
  );
}
