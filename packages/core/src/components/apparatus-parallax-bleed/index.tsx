import { useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VesselComponentProps } from "../../engine/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Dedicated full-bleed image sections (p1, p2, p3, p4) with single-word headlines
const DEFAULT_BLEED_SECTIONS = [
  {
    id: "01",
    title: "HORIZON",
    alignClass: "inset-0 flex items-center justify-center text-center px-6",
    image: "/images/components%20images/scroll/p1.png",
  },
  {
    id: "02",
    title: "VOID",
    alignClass: "inset-0 flex items-center justify-end text-right px-8 md:px-20",
    image: "/images/components%20images/scroll/p2.png",
  },
  {
    id: "03",
    title: "MONOLITH",
    alignClass: "inset-0 flex items-center justify-start text-left px-8 md:px-20",
    image: "/images/components%20images/scroll/p3.png",
  },
  {
    id: "04",
    title: "ECHO",
    alignClass: "inset-0 flex items-center justify-center text-center px-6",
    image: "/images/components%20images/scroll/p4.png",
  },
];

export interface ApparatusParallaxBleedProps extends VesselComponentProps {
  sections?: typeof DEFAULT_BLEED_SECTIONS;
  parallaxIntensity?: number;
  scrollProgress?: number;
}

export default function ApparatusParallaxBleed({
  sections = DEFAULT_BLEED_SECTIONS,
  parallaxIntensity = 45, // 0% - 100% intensity
  className = "",
  style = {},
  onLifecycleChange,
  scrollProgress: externalProgress = 0,
}: ApparatusParallaxBleedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Infinite accumulator state
  const targetProgressRef = useRef<number>(0);
  const smoothProgressRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Parallax ratio calculation (% shift)
  const parallaxOffsetRatio = useMemo(() => {
    return (parallaxIntensity / 100) * 0.35; // max 35% shift (GEMINI.md §11.5)
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

  // Infinite Dual-Input Scroll Listener: Mouse Wheel + Touch + ScrollTrigger
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Continuous upward infinite scroll sensitivity
      const delta = e.deltaY * 0.00045;
      targetProgressRef.current += delta;
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      targetProgressRef.current += deltaY * 0.001;
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Fallback ScrollTrigger
    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
      onUpdate: (self) => {
        if (self.progress > 0) {
          targetProgressRef.current = self.progress * 4;
        }
      },
    });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      window.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      st.kill();
    };
  }, []);

  // 60FPS Continuous Upward Parallax Engine with Zero-Fade Single-Word Display Motion
  useEffect(() => {
    let lastTime = performance.now();
    let lastProgress = 0;

    const renderLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Damped lerp momentum (scrollthumbrule.md)
      const lerpSpeed = 4.5;
      smoothProgressRef.current += (targetProgressRef.current - smoothProgressRef.current) * (1 - Math.exp(-lerpSpeed * dt));

      const p = smoothProgressRef.current;

      // Velocity calculation
      const rawVelocity = (p - lastProgress) / Math.max(dt, 0.001);
      lastProgress = p;

      velocityRef.current += (rawVelocity - velocityRef.current) * (1 - Math.exp(-8.0 * dt));

      const totalCount = sections.length;

      // Lifecycle updates
      if (onLifecycleChange) {
        const cycleProgress = ((p % 1) + 1) % 1;
        if (cycleProgress < 0.25) onLifecycleChange("idle");
        else if (cycleProgress < 0.5) onLifecycleChange("discovery");
        else if (cycleProgress < 0.75) onLifecycleChange("buildUp");
        else onLifecycleChange("peak");
      }

      // Compute Continuous Upward Parallax Position & Zero-Fade Single-Word Text Glide
      sections.forEach((_, idx) => {
        const secEl = sectionRefs.current[idx];
        const imgEl = imageRefs.current[idx];
        const textEl = textRefs.current[idx];
        if (!secEl || !imgEl) return;

        // Raw distance from current virtual position
        const rawPos = idx - p;
        // Modular wrap calculation around totalCount (-totalCount/2 to +totalCount/2)
        let wrappedPos = (((rawPos + totalCount / 2) % totalCount) + totalCount) % totalCount - totalCount / 2;

        // Continuous Upward Translation (NO PINNING, NO FADING)
        const sectionY = wrappedPos * 100; // +100% -> 0% -> -100%
        const zIndex = Math.round(10 - Math.abs(wrappedPos) * 2);

        // Outer Container: Always 100% full bleed, low z-index stack
        gsap.set(secEl, {
          y: `${sectionY}%`,
          zIndex: zIndex,
          scale: 1.0,
        });

        // Expanded Inner Image Parallax Shift (GEMINI.md §11.5: top: -35%, height: 170%)
        const internalImgY = -wrappedPos * parallaxOffsetRatio * 100;
        gsap.set(imgEl, {
          y: `${internalImgY}%`,
          scale: 1.0,
          transformOrigin: "center center",
        });

        // Zero-Fade Pure Parallax Single-Word Text Glide (100% Solid Opacity Always)
        if (textEl) {
          const textBlockY = wrappedPos * 38; // Pure 3D vertical glide

          gsap.set(textEl, {
            y: `${textBlockY}%`,
            opacity: 1, // 100% solid opacity always, zero fading!
          });
        }
      });

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
      className={`relative w-full h-screen bg-[#050505] font-[#Syne',sans-serif] text-white overflow-hidden select-none ${className}`}
      style={style}
    >
      {/* Continuous Upward Full-Bleed Parallax Container */}
      <div className="relative w-full h-full overflow-hidden">
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            ref={(el) => { sectionRefs.current[idx] = el; }}
            className="absolute inset-0 w-full h-full overflow-hidden transform-gpu origin-center"
          >
            {/* Expanded Inner Image Container (GEMINI.md §11.5: top: -35%, height: 170%) */}
            <div className="absolute top-[-35%] left-0 w-full h-[170%] overflow-hidden pointer-events-none">
              <img
                ref={(el) => { imageRefs.current[idx] = el; }}
                src={sec.image}
                alt={`Bleed Scene ${sec.id}`}
                className="w-full h-full object-cover object-center transform-gpu will-change-transform brightness-90 contrast-105"
              />
            </div>

            {/* Massive Zero-Fade Single-Word Display Title */}
            <div
              ref={(el) => { textRefs.current[idx] = el; }}
              className={`absolute z-20 pointer-events-none transform-gpu ${sec.alignClass}`}
            >
              <h2
                className="font-extrabold uppercase tracking-tighter text-white drop-shadow-[0_12px_40px_rgba(0,0,0,0.8)] transform-gpu max-w-5xl font-['Syne',sans-serif]"
                style={{
                  fontSize: "clamp(4.2rem, 13.5vw, 12.0rem)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.04em",
                }}
              >
                {sec.title}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
