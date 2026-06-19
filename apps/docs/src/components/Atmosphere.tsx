"use client";

import React, { useRef, useEffect, useState } from "react";

export default function Atmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track mouse coordinates for radial light glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize handler
    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    const handleResize = () => {
      if (!canvas || !container) return;
      width = canvas.width = container.clientWidth;
      height = canvas.height = container.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.15;
        this.speedY = (Math.random() - 0.5) * 0.15;
        this.opacity = Math.random() * 0.5;
        this.fadeSpeed = Math.random() * 0.005 + 0.002;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around bounds
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Subtle alpha drift
        this.opacity += this.fadeSpeed;
        if (this.opacity > 0.6 || this.opacity < 0.1) {
          this.fadeSpeed = -this.fadeSpeed;
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(245, 242, 235, ${this.opacity})`;
        context.fill();
      }
    }

    // Initialize particles
    const particleCount = Math.floor((width * height) / 25000); // Dense but performance-friendly ratio
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation Loop
    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render & update particles
      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex min-h-[70vh] w-full flex-col items-center justify-center border-b border-l border-r border-border-subtle bg-bg-base px-6 py-32 text-center overflow-hidden select-none"
    >
      {/* HTML5 Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 -z-10 h-full w-full pointer-events-none opacity-40"
      />

      {/* Atmospheric cursor radial spotlight (replaces glowing cyberpunk neon with soft editorial light) */}
      <div
        className="absolute -z-20 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-opacity duration-1000 ease-out bg-radial-gradient from-accent-subtle to-transparent blur-[120px]"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          opacity: isHovered ? 0.75 : 0,
        }}
      />

      {/* Atmospheric static ambient background lighting */}
      <div className="absolute top-1/2 left-1/2 -z-30 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none bg-accent-subtle/40 blur-[200px]" />

      {/* Static premium fine grain overlay simulation */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.015] bg-[url('data:image/svg+xml;utf8,<svg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22><filter id=%22noise%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/></svg>')] bg-repeat" />

      {/* Editorial Content */}
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-6 z-10">
        
        <h2 className="font-sans text-3xl font-black leading-none tracking-[-0.04em] text-fg-primary md:text-6xl uppercase">
          ATMOSPHERE DEFINES PERCEPTION.
        </h2>
        
        <h2 className="font-sans text-3xl font-black leading-none tracking-[-0.04em] text-accent md:text-6xl uppercase mt-1">
          WE CONSTRUCT SPACES, NOT INTERFACES.
        </h2>

        <p className="font-sans text-[10px] uppercase tracking-widest text-fg-muted font-bold mt-4 flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-accent animate-ping" />
          Pointer drift influences lighting vectors
        </p>
      </div>
    </section>
  );
}
