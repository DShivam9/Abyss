import { useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import { VesselComponentProps } from "../../engine/types";

// Dedicated full-bleed image sections with asymmetrical editorial alignment & prose subtitles
// ponytail: optimized webp assets and lightweight 60fps render loop
const DEFAULT_BLEED_SECTIONS = [
  {
    id: "01",
    title: "HORIZON",
    subtitle: "A vast expanse frozen in atmospheric silence.",
    alignClass: "inset-y-0 left-0 w-full md:w-3/5 flex flex-col justify-center items-start text-left px-8 md:px-20",
    image: "/images/components%20images/scroll/p1_hq.webp",
  },
  {
    id: "02",
    title: "VOID",
    subtitle: "Surrendering all sound to the weight of shadow.",
    alignClass: "inset-y-0 right-0 w-full md:w-3/5 flex flex-col justify-center items-end text-right px-8 md:px-20",
    image: "/images/components%20images/scroll/p2_hq.webp",
  },
  {
    id: "03",
    title: "MONOLITH",
    subtitle: "Standing static through centuries of shifting storm.",
    alignClass: "inset-y-0 left-0 w-full md:w-3/5 flex flex-col justify-center items-start text-left px-8 md:px-20",
    image: "/images/components%20images/scroll/p3_hq.webp",
  },
  {
    id: "04",
    title: "ECHO",
    subtitle: "Ripples of light drifting across empty space.",
    alignClass: "inset-y-0 right-0 w-full md:w-3/5 flex flex-col justify-center items-end text-right px-8 md:px-20",
    image: "/images/components%20images/scroll/p4_hq.webp",
  },
];

// Baked defaults for smooth physics & kinetic drift
const BAKED_SCROLL_SPEED = 1.0;
const BAKED_INERTIAL_DAMPING = 6.0;
const BAKED_MOUSE_DRIFT = 4;

export interface ApparatusParallaxBleedProps extends VesselComponentProps {
  sections?: typeof DEFAULT_BLEED_SECTIONS;
  parallaxIntensity?: number;
  blurDepth?: number;
  indicatorStyle?: "dashes" | "dots" | "hidden";
  imageBrightness?: number;
  scrollProgress?: number;
}

export default function ApparatusParallaxBleed({
  sections = DEFAULT_BLEED_SECTIONS,
  parallaxIntensity = 45, // 0% - 100% intensity
  blurDepth = 280,
  indicatorStyle = "dots",
  imageBrightness = 90,
  className = "",
  style = {},
  onLifecycleChange,
  scrollProgress: externalProgress = 0,
}: ApparatusParallaxBleedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dashRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Mouse position state for stationary cursor parallax
  // ponytail: native mousemove tracking without heavy external libraries
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Accumulator state
  const targetProgressRef = useRef<number>(0);
  const smoothProgressRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  // Dynamic props ref (prevents RAF re-initialization on prop changes)
  // ponytail: keeps scroll engine 100% stable when dropdown controls update
  const propsRef = useRef({
    parallaxIntensity,
    indicatorStyle,
  });

  useEffect(() => {
    propsRef.current = {
      parallaxIntensity,
      indicatorStyle,
    };
  }, [parallaxIntensity, indicatorStyle]);

  // Parallax ratio calculation (% shift)
  const parallaxOffsetRatio = useMemo(() => {
    return (parallaxIntensity / 100) * 0.20; // max 20% shift for natural un-cropped framing
  }, [parallaxIntensity]);

  // Inject High-Contrast Editorial Google Fonts (Syne 800)
  useEffect(() => {
    const fontId = "vessel-editorial-title-font";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Sync external scroll progress when provided
  useEffect(() => {
    if (externalProgress > 0) {
      targetProgressRef.current = externalProgress;
    }
  }, [externalProgress]);

  // Mouse move listener for stationary cursor depth
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      };
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Self-contained container wheel + touch listener
  // ponytail: direct container wheel listener prevents bounds trap and dropdown focus freezes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.00045 * BAKED_SCROLL_SPEED;
      targetProgressRef.current += delta;
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      targetProgressRef.current += deltaY * 0.001 * BAKED_SCROLL_SPEED;
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // 60FPS Continuous Upward Parallax Engine — Lenis-style exponential easing
  useEffect(() => {
    let lastTime = performance.now();
    let lastProgress = 0;

    const renderLoop = (time: number) => {
      try {
        const dt = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;

        const { indicatorStyle: indStyle } = propsRef.current;
        const lerpSpeed = BAKED_INERTIAL_DAMPING;
        const drift = BAKED_MOUSE_DRIFT;
        smoothProgressRef.current += (targetProgressRef.current - smoothProgressRef.current) * (1 - Math.exp(-lerpSpeed * dt));

        const p = smoothProgressRef.current;

        // Smooth mouse position interpolation (soft 2D inertial lag coast)
        smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * (1 - Math.exp(-2.5 * dt));
        smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * (1 - Math.exp(-2.5 * dt));

        // Velocity calculation for dynamic spatial inertia
        const rawVelocity = (p - lastProgress) / Math.max(dt, 0.001);
        lastProgress = p;

        velocityRef.current += (rawVelocity - velocityRef.current) * (1 - Math.exp(-8.0 * dt));

        const totalCount = sections.length;

        // Update indicators safely
        if (indStyle !== "hidden") {
          const activeIndex = (((Math.round(p) % totalCount) + totalCount) % totalCount);
          dashRefs.current.forEach((dash, idx) => {
            if (!dash || !document.body.contains(dash)) return;
            const isActive = idx === activeIndex;
            if (indStyle === "dots") {
              gsap.set(dash, {
                height: 6,
                width: isActive ? 12 : 6,
                borderRadius: 9999,
                opacity: isActive ? 1.0 : 0.25,
              });
            } else {
              gsap.set(dash, {
                height: isActive ? 28 : 10,
                width: 2,
                borderRadius: 9999,
                opacity: isActive ? 1.0 : 0.25,
              });
            }
          });
        }

        // Lifecycle updates
        if (onLifecycleChange) {
          const cycleProgress = ((p % 1) + 1) % 1;
          if (cycleProgress < 0.25) onLifecycleChange("idle");
          else if (cycleProgress < 0.5) onLifecycleChange("discovery");
          else if (cycleProgress < 0.75) onLifecycleChange("buildUp");
          else onLifecycleChange("peak");
        }

        // Compute Continuous Upward Parallax Position (GPU Accelerated)
        sections.forEach((_, idx) => {
          const secEl = sectionRefs.current[idx];
          const imgEl = imageRefs.current[idx];
          const textEl = textRefs.current[idx];
          if (!secEl || !imgEl || !document.body.contains(secEl)) return;

          // Raw distance from current virtual position
          const rawPos = idx - p;
          // Modular wrap calculation around totalCount (-totalCount/2 to +totalCount/2)
          const wrappedPos = (((rawPos + totalCount / 2) % totalCount) + totalCount) % totalCount - totalCount / 2;

          // Continuous Upward Translation
          const sectionY = wrappedPos * 100;
          const zIndex = Math.round(10 - Math.abs(wrappedPos) * 2);

          // Outer Container: GPU layer isolation
          gsap.set(secEl, {
            y: `${sectionY}%`,
            zIndex: zIndex,
          });

          // Expanded Inner Image Parallax Shift + Soft 2D Inertial Drift
          const internalImgY = -wrappedPos * parallaxOffsetRatio * 100;
          const mouseShiftX = smoothMouseRef.current.x * drift;
          const mouseShiftY = smoothMouseRef.current.y * drift;

          gsap.set(imgEl, {
            y: `${internalImgY}%`,
            x: `${mouseShiftX}px`,
            yPercent: mouseShiftY,
          });

          // Text position glide
          if (textEl) {
            const textBlockY = wrappedPos * 38;
            gsap.set(textEl, {
              y: `${textBlockY}%`,
              x: `${-mouseShiftX * 0.4}px`,
            });
          }
        });
      } catch (err) {
        // Prevent unhandled DOM exceptions from crashing RAF engine loop
        console.warn("[ParallaxBleed] Render loop warning:", err);
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [sections, parallaxOffsetRatio, onLifecycleChange]);

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      className={`relative w-full h-screen bg-[#050505] font-['Syne',sans-serif] text-white overflow-hidden select-none ${className}`}
      style={style}
    >
      {/* 8-Layer Mathematical Progressive Blur Overlay */}
      {/* ponytail: 8-step contiguous masked backdrop-filter layers with exponential doubling */}
      <div
        className="absolute inset-x-0 bottom-[-40px] pointer-events-none z-20 overflow-hidden"
        style={{ height: `${blurDepth}px` }}
      >
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backdropFilter: "blur(0.078125px)",
            WebkitBackdropFilter: "blur(0.078125px)",
            maskImage: "linear-gradient(to top, transparent 87.5%, #000 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 87.5%, #000 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            backdropFilter: "blur(0.15625px)",
            WebkitBackdropFilter: "blur(0.15625px)",
            maskImage: "linear-gradient(to top, transparent 75%, #000 87.5% 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 75%, #000 87.5% 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[3]"
          style={{
            backdropFilter: "blur(0.3125px)",
            WebkitBackdropFilter: "blur(0.3125px)",
            maskImage: "linear-gradient(to top, transparent 62.5%, #000 75% 87.5%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 62.5%, #000 75% 87.5%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[4]"
          style={{
            backdropFilter: "blur(0.625px)",
            WebkitBackdropFilter: "blur(0.625px)",
            maskImage: "linear-gradient(to top, transparent 50%, #000 62.5% 75%, transparent 87.5%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 50%, #000 62.5% 75%, transparent 87.5%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            backdropFilter: "blur(1.25px)",
            WebkitBackdropFilter: "blur(1.25px)",
            maskImage: "linear-gradient(to top, transparent 37.5%, #000 50% 62.5%, transparent 75%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 37.5%, #000 50% 62.5%, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[6]"
          style={{
            backdropFilter: "blur(2.5px)",
            WebkitBackdropFilter: "blur(2.5px)",
            maskImage: "linear-gradient(to top, transparent 25%, #000 37.5% 50%, transparent 62.5%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 25%, #000 37.5% 50%, transparent 62.5%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[7]"
          style={{
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            maskImage: "linear-gradient(to top, transparent 12.5%, #000 25% 37.5%, transparent 50%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 12.5%, #000 25% 37.5%, transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[8]"
          style={{
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            maskImage: "linear-gradient(to top, transparent 0%, #000 12.5% 25%, transparent 37.5%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 0%, #000 12.5% 25%, transparent 37.5%)",
          }}
        />
      </div>

      {/* Dynamic Indicator (Dashes / Dots / Hidden) */}
      {indicatorStyle !== "hidden" && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-40 pointer-events-none hidden md:flex flex-col items-center gap-2.5">
          {sections.map((sec, idx) => (
            <div
              key={`dash-${sec.id}`}
              ref={(el) => { dashRefs.current[idx] = el; }}
              className="rounded-full bg-white transition-all duration-300 transform-gpu will-change-transform opacity-25"
            />
          ))}
        </div>
      )}

      {/* Continuous Upward Full-Bleed Parallax Container */}
      <div className="relative w-full h-full overflow-hidden">
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            ref={(el) => { sectionRefs.current[idx] = el; }}
            className="absolute inset-0 w-full h-full overflow-hidden transform-gpu will-change-transform origin-center"
          >
            {/* Expanded Inner Image Container (top: -20%, height: 140%) */}
            <div className="absolute top-[-20%] left-0 w-full h-[140%] overflow-hidden pointer-events-none z-0">
              <img
                ref={(el) => { imageRefs.current[idx] = el; }}
                src={sec.image}
                alt={`Bleed Scene ${sec.id}`}
                className="w-full h-full object-cover object-center transform-gpu will-change-transform contrast-105"
                style={{ filter: `brightness(${imageBrightness}%) contrast(105%)` }}
              />
            </div>

            {/* Asymmetrical Editorial Display Title & Real Subtitle (z-30 above blur) */}
            <div
              ref={(el) => { textRefs.current[idx] = el; }}
              className={`absolute z-30 pointer-events-none transform-gpu will-change-transform ${sec.alignClass}`}
            >
              <h2
                className="font-extrabold uppercase tracking-tighter text-white drop-shadow-[0_12px_40px_rgba(0,0,0,0.8)] transform-gpu max-w-5xl font-['Syne',sans-serif]"
                style={{
                  fontSize: "clamp(3.8rem, 12vw, 10.5rem)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.04em",
                }}
              >
                {sec.title}
              </h2>
              {sec.subtitle && (
                <p className="mt-4 text-sm md:text-base font-normal tracking-wide text-white/75 max-w-md font-sans leading-relaxed drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                  {sec.subtitle}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

