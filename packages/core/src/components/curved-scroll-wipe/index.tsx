"use client";

import { useRef, useEffect } from "react";
import Lenis from "lenis";
import { VesselComponentProps } from "../../engine/types";

export interface ApparatusCurvedScrollWipeProps extends VesselComponentProps {
  curveDepth?: number; // Curve sag intensity (0.05 - 0.45, default: 0.28)
  scrollSpeed?: number; // Scroll sensitivity multiplier (0.5 - 2.0, default: 1.0)
}

const SECTIONS = [
  {
    id: "sec-1",
    bg: "#070709",
    text: "#FFFFFF",
    number: "01",
    numberColor: "#00E5FF",
    title: "KINETIC BOUNDARY",
    desc: "A spatial transition engine driven by continuous Bezier vector morphing and hardware-accelerated 120 FPS physics.",
    image: "/images/components%20images/scroll/p2_hq.webp",
    shapeLeft: "/images/shapes/Shape%203.svg",
    shapeRight: "/images/shapes/Shape%2015.svg",
  },
  {
    id: "sec-2",
    bg: "#FFFFFF",
    text: "#070709",
    number: "02",
    numberColor: "#0055FF",
    title: "TACTILE SPATIAL FLOW",
    desc: "Seamless visual handoffs where sections glide physically across the viewport, bridging typography and photography.",
    imageMain: "/images/components%20images/scroll/p1_hq.webp",
    imageSecondary: "/images/components%20images/scroll/p3_hq.webp",
    shapeAccent: "/images/shapes/Shape%208.svg",
  },
  {
    id: "sec-3",
    bg: "#070709",
    text: "#FFFFFF",
    number: "03",
    numberColor: "#00FF66",
    title: "MONOLITHIC RESONANCE",
    desc: "Built with zero-allocation RAF engines and normalized SVG objectBoundingBox path coordinates for 100% responsive scaling.",
    heroImage: "/images/components%20images/scroll/p4_hq.webp",
    cards: [
      {
        icon: "/images/shapes/Shape%205.svg",
        color: "#00E5FF",
        title: "BEZIER MASKING",
        desc: "Dynamic quadratic curve paths scaling elastically with scroll progress.",
      },
      {
        icon: "/images/shapes/Shape%2012.svg",
        color: "#00FF66",
        title: "120 FPS ENGINE",
        desc: "Direct DOM attribute mutations bypassing React state re-renders.",
      },
    ],
  },
  {
    id: "sec-4",
    bg: "#FFFFFF",
    text: "#070709",
    number: "04",
    numberColor: "#FF2A00",
    title: "ABYSS CANVAS STAGE",
    desc: "Elevating component interfaces with taste, physical momentum, and unseen details that compound.",
    gallery: [
      "/images/components%20images/scroll/p1_hq.webp",
      "/images/components%20images/scroll/p2_hq.webp",
      "/images/components%20images/scroll/p3_hq.webp",
    ],
    cta: "EXPLORE SHOWCASE",
    shapeLeft: "/images/shapes/Shape%2018.svg",
    shapeRight: "/images/shapes/Shape%2020.svg",
  },
];

const TEN_SCATTERED_SHAPES = [
  // 1. Far Top-Left Corner
  { icon: "/images/shapes/Shape%201.svg", color: "#FF0055", pos: "top-8 left-8 sm:top-12 sm:left-12", size: "w-14 h-14 sm:w-18 sm:h-18", rotate: "rotate-12" },
  // 2. Top Left-Center Viewport Margin
  { icon: "/images/shapes/Shape%202.svg", color: "#00E5FF", pos: "top-6 left-[28%]", size: "w-12 h-12 sm:w-16 sm:h-16", rotate: "-rotate-45" },
  // 3. Top Viewport Center Margin
  { icon: "/images/shapes/Shape%203.svg", color: "#00FF66", pos: "top-8 left-[50%] -translate-x-1/2", size: "w-12 h-12 sm:w-16 sm:h-16", rotate: "rotate-45" },
  // 4. Top Right-Center Viewport Margin
  { icon: "/images/shapes/Shape%204.svg", color: "#FFCC00", pos: "top-6 right-[25%]", size: "w-14 h-14 sm:w-18 sm:h-18", rotate: "-rotate-12" },
  // 5. Far Top-Right Corner
  { icon: "/images/shapes/Shape%205.svg", color: "#7928CA", pos: "top-8 right-8 sm:top-12 sm:right-12", size: "w-14 h-14 sm:w-18 sm:h-18", rotate: "rotate-90" },
  // 6. Far Mid-Left Viewport Edge
  { icon: "/images/shapes/Shape%206.svg", color: "#FF0080", pos: "top-1/2 left-6 sm:left-10 -translate-y-1/2", size: "w-14 h-14 sm:w-18 sm:h-18", rotate: "-rotate-30" },
  // 7. Far Mid-Right Viewport Edge
  { icon: "/images/shapes/Shape%207.svg", color: "#0070F3", pos: "top-1/2 right-6 sm:right-10 -translate-y-1/2", size: "w-14 h-14 sm:w-18 sm:h-18", rotate: "rotate-30" },
  // 8. Far Bottom-Left Corner
  { icon: "/images/shapes/Shape%208.svg", color: "#FF4D00", pos: "bottom-8 left-8 sm:bottom-12 sm:left-12", size: "w-14 h-14 sm:w-18 sm:h-18", rotate: "-rotate-15" },
  // 9. Bottom Viewport Center Margin
  { icon: "/images/shapes/Shape%209.svg", color: "#7000FF", pos: "bottom-6 left-[50%] -translate-x-1/2", size: "w-12 h-12 sm:w-16 sm:h-16", rotate: "rotate-45" },
  // 10. Far Bottom-Right Corner
  { icon: "/images/shapes/Shape%2010.svg", color: "#00DF89", pos: "bottom-8 right-8 sm:bottom-12 sm:right-12", size: "w-14 h-14 sm:w-18 sm:h-18", rotate: "-rotate-45" },
];

export function ApparatusCurvedScrollWipe({
  curveDepth = 0.28,
  scrollSpeed = 1.0,
  style,
  className = "",
}: ApparatusCurvedScrollWipeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const sectionContentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const curveDepthRef = useRef(curveDepth);
  curveDepthRef.current = curveDepth;
  // Persistent scroll direction tracking (+1 for down, -1 for up, zero pause twitching)
  const lastDirRef = useRef(1);
  const smoothDirRef = useRef(1);

  // Initialize 120 FPS capped Lenis smooth scroll engine with Emil Kowalski luxury dampening
  useEffect(() => {
    const wrapper = containerRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const lenis = new Lenis({
      wrapper,
      content,
      duration: 1.2 / Math.max(0.2, scrollSpeed),
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    let lastTime = performance.now();
    let rafId: number;

    const updateLoop = (now: number) => {
      rafId = requestAnimationFrame(updateLoop);

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      lenis.raf(now);

      const scrollTop = wrapper.scrollTop;
      const viewHeight = wrapper.clientHeight || window.innerHeight;
      const maxScroll = content.scrollHeight - viewHeight;

      if (maxScroll <= 0) return;

      const totalScrollProgress = Math.max(0, Math.min(scrollTop / maxScroll, 1));
      const sectionProgress = totalScrollProgress * (SECTIONS.length - 1);

      // Track persistent scroll direction without zero-reset twitching
      const vel = lenis.velocity || 0;
      if (Math.abs(vel) > 0.05) {
        lastDirRef.current = vel < 0 ? -1 : 1;
      }
      smoothDirRef.current += (lastDirRef.current - smoothDirRef.current) * (1 - Math.exp(-8.0 * dt));

      // Update SVG curved path mask and physical content parallax travel
      for (let i = 0; i < SECTIONS.length; i++) {
        const contentEl = sectionContentRefs.current[i];

        if (i === 0) {
          // Base section parallax recede as section 2 covers it
          if (contentEl) {
            const p1 = Math.max(0, Math.min(sectionProgress, 1));
            const recedeY = -p1 * 80;
            const scale = 1 - p1 * 0.06;
            const opacity = 1 - p1 * 0.4;
            contentEl.style.transform = `translate3d(0px, ${recedeY}px, 0px) scale(${scale})`;
            contentEl.style.opacity = `${opacity}`;
          }
          continue;
        }

        const pathEl = pathRefs.current[i];
        const p = Math.max(0, Math.min(sectionProgress - (i - 1), 1));

        // SVG Curve Path Morphing — Directional Inversion + Zero Pause Twitching
        if (pathEl) {
          const Y = p;
          const baseSag = curveDepthRef.current * Math.sin(p * Math.PI);
          const sag = smoothDirRef.current * baseSag;
          const Cy = Math.max(0.0, Math.min(1.0, Y + sag));

          const pathD = `M 0 0 L 1 0 L 1 ${Y.toFixed(4)} Q 0.5 ${Cy.toFixed(4)} 0 ${Y.toFixed(4)} Z`;
          pathEl.setAttribute("d", pathD);
        }

        // Section Content Parallax Glide
        if (contentEl) {
          const glideY = (1 - p) * 120;
          const nextP = Math.max(0, Math.min(sectionProgress - i, 1));
          const recedeY = -nextP * 80;
          const scale = 1 - nextP * 0.06;
          const opacity = (0.3 + 0.7 * p) * (1 - nextP * 0.4);

          const totalY = glideY + recedeY;
          contentEl.style.transform = `translate3d(0px, ${totalY}px, 0px) scale(${scale})`;
          contentEl.style.opacity = `${opacity}`;
        }
      }
    };

    rafId = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [scrollSpeed]);

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      className={`relative w-full h-screen overflow-y-auto overflow-x-hidden bg-[#070709] text-white custom-scrollbar overscroll-contain ${className}`}
      style={style}
    >
      {/* SVG ClipPath Definitions for 120FPS Vector Morphing */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {SECTIONS.map((sec, idx) => {
            if (idx === 0) return null;
            return (
              <clipPath key={sec.id} id={`curved-wipe-clip-${idx}`} clipPathUnits="objectBoundingBox">
                <path
                  ref={(el) => {
                    pathRefs.current[idx] = el;
                  }}
                  d="M 0 0 L 1 0 L 1 0 Q 0.5 0 0 0 Z"
                />
              </clipPath>
            );
          })}
        </defs>
      </svg>

      {/* Runway scroll height content container (400vh total scroll distance) */}
      <div ref={contentRef} className="relative w-full h-[400vh]">
        {/* Sticky Viewport Stage containing layered sections */}
        <div className="sticky top-0 w-full h-screen overflow-hidden">
          {SECTIONS.map((sec, idx) => {
            const isDark = sec.bg === "#070709";

            return (
              <div
                key={sec.id}
                className="absolute inset-0 w-full h-full flex items-center justify-center select-none overflow-hidden px-8 py-10"
                style={{
                  backgroundColor: sec.bg,
                  color: sec.text,
                  zIndex: idx + 1,
                  clipPath: idx > 0 ? `url(#curved-wipe-clip-${idx})` : undefined,
                }}
              >
                {/* Background Dot Matrix Pattern (White on Dark, Black on White) */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: isDark
                      ? "radial-gradient(circle, rgba(255, 255, 255, 0.15) 1.2px, transparent 1.2px)"
                      : "radial-gradient(circle, rgba(7, 7, 9, 0.14) 1.2px, transparent 1.2px)",
                    backgroundSize: "28px 28px",
                  }}
                />

                {/* 10 Widescreen Viewport-Scattered Vector SVGs for Section 04 */}
                {idx === 3 && (
                  <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
                    {TEN_SCATTERED_SHAPES.map((item, sIdx) => (
                      <div
                        key={sIdx}
                        className={`absolute ${item.pos} ${item.size} ${item.rotate} opacity-90 drop-shadow-md`}
                        style={{
                          backgroundColor: item.color,
                          WebkitMaskImage: `url("${item.icon}")`,
                          maskImage: `url("${item.icon}")`,
                          WebkitMaskSize: "contain",
                          maskSize: "contain",
                          WebkitMaskRepeat: "no-repeat",
                          maskRepeat: "no-repeat",
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Section Content Wrapper */}
                <div
                  ref={(el) => {
                    sectionContentRefs.current[idx] = el;
                  }}
                  className="relative z-10 w-full max-w-6xl"
                >
                  {/* Section 01: Left Text & Number 01, Right Photo */}
                  {idx === 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left w-full">
                      <div className="lg:col-span-7 space-y-4">
                        <div
                          className="font-mono text-7xl sm:text-8xl md:text-[9.5rem] font-black tracking-tighter leading-none select-none"
                          style={{ color: sec.numberColor }}
                        >
                          {sec.number}
                        </div>
                        <h1 className="font-mono text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight uppercase leading-[0.95]">
                          {sec.title}
                        </h1>
                        <p className="font-sans text-base md:text-lg text-white/70 max-w-xl leading-relaxed">
                          {sec.desc}
                        </p>
                      </div>

                      <div className="lg:col-span-5 relative">
                        <div className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-[1.025] hover:-translate-y-1.5 hover:shadow-[0_25px_50px_rgba(0,0,0,0.5)] cursor-pointer">
                          <img
                            src={sec.image}
                            alt="Architectural editorial"
                            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                        </div>

                        {sec.shapeLeft && (
                          <div
                            className="absolute -left-6 -bottom-6 w-24 h-24 opacity-90 pointer-events-none drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                            style={{
                              backgroundColor: "#00E5FF",
                              WebkitMaskImage: `url("${sec.shapeLeft}")`,
                              maskImage: `url("${sec.shapeLeft}")`,
                              WebkitMaskSize: "contain",
                              maskSize: "contain",
                              WebkitMaskRepeat: "no-repeat",
                              maskRepeat: "no-repeat",
                            }}
                          />
                        )}
                        {sec.shapeRight && (
                          <div
                            className="absolute -right-6 -top-6 w-24 h-24 opacity-90 pointer-events-none drop-shadow-[0_0_20px_rgba(0,255,102,0.4)]"
                            style={{
                              backgroundColor: "#00FF66",
                              WebkitMaskImage: `url("${sec.shapeRight}")`,
                              maskImage: `url("${sec.shapeRight}")`,
                              WebkitMaskSize: "contain",
                              maskSize: "contain",
                              WebkitMaskRepeat: "no-repeat",
                              maskRepeat: "no-repeat",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section 02: Left Dual Photos, Right Text & Number 02 */}
                  {idx === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left w-full">
                      <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                        <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-black/10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-[1.025] hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer">
                          <img
                            src={sec.imageMain}
                            alt="Editorial main"
                            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                          />
                          {sec.shapeAccent && (
                            <div
                              className="absolute top-4 right-4 w-9 h-9 opacity-90 drop-shadow-md transition-transform duration-500 ease-out group-hover:rotate-12 group-hover:scale-110"
                              style={{
                                backgroundColor: "#FFFFFF",
                                WebkitMaskImage: `url("${sec.shapeAccent}")`,
                                maskImage: `url("${sec.shapeAccent}")`,
                                WebkitMaskSize: "contain",
                                maskSize: "contain",
                                WebkitMaskRepeat: "no-repeat",
                                maskRepeat: "no-repeat",
                              }}
                            />
                          )}
                        </div>
                        <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-black/10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-[1.025] hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer">
                          <img
                            src={sec.imageSecondary}
                            alt="Editorial secondary"
                            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                          />
                        </div>
                      </div>

                      <div className="lg:col-span-5 space-y-4">
                        <div
                          className="font-mono text-7xl sm:text-8xl md:text-[9.5rem] font-black tracking-tighter leading-none select-none"
                          style={{ color: sec.numberColor }}
                        >
                          {sec.number}
                        </div>
                        <h2 className="font-mono text-3xl sm:text-5xl font-extrabold tracking-tight uppercase leading-[0.95] text-black">
                          {sec.title}
                        </h2>
                        <p className="font-sans text-base text-black/70 leading-relaxed">
                          {sec.desc}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Section 03: Left Text & Number 03, Right Bento Grid */}
                  {idx === 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left w-full">
                      <div className="lg:col-span-5 space-y-4">
                        <div
                          className="font-mono text-7xl sm:text-8xl md:text-[9.5rem] font-black tracking-tighter leading-none select-none"
                          style={{ color: sec.numberColor }}
                        >
                          {sec.number}
                        </div>
                        <h2 className="font-mono text-3xl sm:text-5xl font-extrabold tracking-tight uppercase leading-[0.95]">
                          {sec.title}
                        </h2>
                        <p className="font-sans text-base text-white/70 leading-relaxed">
                          {sec.desc}
                        </p>
                      </div>

                      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="group relative aspect-[4/3] sm:aspect-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-[1.025] hover:-translate-y-1.5 hover:shadow-[0_25px_50px_rgba(0,0,0,0.5)] cursor-pointer">
                          <img
                            src={sec.heroImage}
                            alt="Monolithic structure"
                            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                        </div>

                        <div className="flex flex-col gap-4 justify-between">
                          {sec.cards?.map((card) => (
                            <div
                              key={card.title}
                              className="group/card p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-6 h-6 transition-transform duration-300 ease-out group-hover/card:scale-110"
                                  style={{
                                    backgroundColor: card.color,
                                    WebkitMaskImage: `url("${card.icon}")`,
                                    maskImage: `url("${card.icon}")`,
                                    WebkitMaskSize: "contain",
                                    maskSize: "contain",
                                    WebkitMaskRepeat: "no-repeat",
                                    maskRepeat: "no-repeat",
                                  }}
                                />
                                <h3 className="font-mono text-xs font-bold tracking-wider uppercase text-white">
                                  {card.title}
                                </h3>
                              </div>
                              <p className="font-sans text-xs text-white/60 leading-relaxed group-hover/card:text-white/80 transition-colors duration-300">
                                {card.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 04: Hero Showcase & CTA */}
                  {idx === 3 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left w-full relative z-10">

                      {/* Left: Dual Offset Photography Cards */}
                      <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                        <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-black/10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-[1.025] hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer">
                          <img
                            src={sec.gallery?.[0] || "/images/components%20images/scroll/p1_hq.webp"}
                            alt="Showcase main 1"
                            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                          />
                        </div>
                        <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-black/10 translate-y-6 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-[1.025] hover:translate-y-4 hover:shadow-2xl cursor-pointer">
                          <img
                            src={sec.gallery?.[1] || "/images/components%20images/scroll/p2_hq.webp"}
                            alt="Showcase main 2"
                            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                          />
                        </div>
                      </div>

                      {/* Right: Text Content & Number 04 */}
                      <div className="lg:col-span-6 space-y-6">
                        <div
                          className="font-mono text-7xl sm:text-8xl md:text-[9.5rem] font-black tracking-tighter leading-none select-none"
                          style={{ color: sec.numberColor }}
                        >
                          {sec.number}
                        </div>
                        <div className="space-y-3">
                          <h2 className="font-mono text-3xl sm:text-5xl font-extrabold tracking-tight uppercase leading-[0.95] text-black">
                            {sec.title}
                          </h2>
                          <p className="font-sans text-base text-black/70 max-w-md leading-relaxed">
                            {sec.desc}
                          </p>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            className="group/btn relative px-8 py-4 rounded-xl bg-[#070709] text-white font-mono text-xs font-bold tracking-widest uppercase overflow-hidden shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 transition-all duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer flex items-center gap-3"
                          >
                            <span className="relative flex flex-col h-[15px] overflow-hidden leading-tight">
                              <span className="block transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/btn:-translate-y-full group-hover/btn:blur-[1px]">
                                {sec.cta}
                              </span>
                              <span className="block transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/btn:-translate-y-full text-[#00E5FF]">
                                {sec.cta}
                              </span>
                            </span>
                            <svg
                              className="w-4 h-4 text-white/70 group-hover/btn:text-[#00E5FF] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/btn:translate-x-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ApparatusCurvedScrollWipe;
