"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useLenis } from "@/components/SmoothScrollProvider";
import { motion } from "framer-motion";
import Image from "next/image";
import { EASE } from "@/lib/animation";
import { IMAGES } from "@/lib/images";

const heroImages = [
  { src: IMAGES.sunsetSilhouetteCollage, alt: "Sunset Silhouette" },
  { src: IMAGES.jacksonYeeWide, alt: "Jackson Yee" },
  { src: IMAGES.mahmoodWarmPortrait, alt: "Mahmood Warm Portrait" },
  { src: IMAGES.baggyJeansStrut, alt: "Baggy Jeans Strut" },
  { src: IMAGES.fisheyePufferVest, alt: "Fisheye Puffer Vest" },
];

export default function ArrivalZone() {
  const containerRef = useRef<HTMLDivElement>(null);
  const arrayContainerRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLSpanElement>(null);
  const title2Ref = useRef<HTMLSpanElement>(null);
  const sublineRef = useRef<HTMLDivElement>(null);
  const ctaContainerRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const lenis = useLenis();
  const ctaLabel = "Explore Exhibition ➔";

  useGSAP(
    () => {


      const t1 = title1Ref.current;
      const t2 = title2Ref.current;
      const subline = sublineRef.current;
      const ctaContainer = ctaContainerRef.current;
      const scrollIndicator = scrollIndicatorRef.current;
      const arrayContainer = arrayContainerRef.current;

      if (!containerRef.current || !t1 || !t2 || !subline || !ctaContainer || !scrollIndicator || !arrayContainer) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        gsap.set([t1, t2], { yPercent: 0 });
        gsap.set(subline, { opacity: 1, y: 0 });
        gsap.set(ctaContainer, { opacity: 1, y: 0 });
        gsap.set(scrollIndicator, { opacity: 1 });
        return;
      }

      // Entrance Sequence
      gsap.set([t1, t2], { yPercent: 110 });
      gsap.set(subline, { opacity: 0, y: 12 });
      gsap.set(ctaContainer, { opacity: 0, y: 12 });
      gsap.set(scrollIndicator, { opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.5 }); // Added slight delay to let cards animate in first

      tl.to(t1, { yPercent: 0, duration: 1.2 })
        .to(t2, { yPercent: 0, duration: 1.2 }, "-=1.05")
        .to(subline, { opacity: 1, y: 0, duration: 0.8 }, "-=0.6")
        .to(ctaContainer, { opacity: 1, y: 0, duration: 0.8 }, "-=0.6")
        .to(scrollIndicator, { opacity: 1, duration: 0.6 }, "-=0.4");

      // Scroll exit parallax
      gsap.to(arrayContainer, {
        scale: 0.9,
        yPercent: -15,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Fade overlay instead of arrayContainer to avoid flattening 3D transform-style
      gsap.to(".scroll-fade-overlay", {
        opacity: 0.85,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Cursor parallax on the image array
      const handleMouseMove = (e: MouseEvent) => {
        const normX = (e.clientX / window.innerWidth - 0.5) * 2;
        const normY = (e.clientY / window.innerHeight - 0.5) * 2;
        
        gsap.to(arrayContainer, {
          rotateY: normX * 5,
          rotateX: -normY * 3,
          duration: 1.2,
          ease: "power2.out",
          overwrite: "auto",
        });

        // Interpolated Accent Color Shift
        const currentAccent = gsap.utils.interpolate("#C07860", "#8A7B6A", (normX + 1) / 2);
        const currentHover = gsap.utils.interpolate("#E8A088", "#B8AFA4", (normX + 1) / 2);

        gsap.to(document.documentElement, {
          "--accent": currentAccent,
          "--accent-hover": currentHover,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const handleMouseLeave = () => {
        gsap.to(arrayContainer, {
          rotateY: 0,
          rotateX: 0,
          duration: 1.2,
          ease: "power2.out",
        });
        gsap.to(document.documentElement, {
          "--accent": "#C07860",
          "--accent-hover": "#E8A088",
          duration: 1.0,
          ease: "power3.out",
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      containerRef.current.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        if (containerRef.current) {
          containerRef.current.removeEventListener("mouseleave", handleMouseLeave);
        }
      };
    },
    { scope: containerRef }
  );

  const handleCtaClick = () => {
    lenis?.scrollTo("#gallery", { duration: 1.4 });
  };

  return (
    <section
      ref={containerRef}
      id="arrival"
      className="relative w-full h-screen bg-bg-base overflow-hidden flex flex-col justify-center items-center"
      style={{ perspective: "1000px" }}
    >
      {/* 3D Image Array */}
      <div 
        ref={arrayContainerRef} 
        className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
        style={{ transformStyle: "preserve-3d" }}
      >
        {heroImages.map((img, i) => {
          // Calculate arc positions: 5 cards, Center is i=2
          const offset = i - 2; 
          const rotateY = offset * -25; // center 0, left cards positive rotateY to face inwards, right cards negative rotateY
          const translateZ = Math.abs(offset) * -120 + (offset === 0 ? 50 : 0);
          const translateX = offset * 220; // 220px apart
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto"
              style={{
                width: "min(20vw, 260px)",
                aspectRatio: "3/4",
                transformStyle: "preserve-3d"
              }}
              initial={{ 
                opacity: 0, 
                scale: 0.8, 
                y: 40,
                rotateY: rotateY,
                z: translateZ,
                x: translateX
              }}
              animate={{ 
                opacity: 0.6 + (offset === 0 ? 0.4 : 0.2), 
                scale: 1, 
                y: 0,
                rotateY: rotateY,
                z: translateZ,
                x: translateX
              }}
              transition={{ duration: 1.0, delay: i * 0.1, ease: EASE.reveal }}
              whileHover={{ 
                scale: 1.05, 
                z: translateZ + 30, 
                opacity: 1,
                boxShadow: "0 30px 60px rgba(0,0,0,0.8)",
                transition: { duration: 0.3 } 
              }}
            >
              <Image 
                src={img.src} 
                alt={img.alt} 
                fill 
                className="object-cover"
                sizes="(max-width: 768px) 30vw, 20vw"
                priority={offset === 0}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Fade Overlay for Parallax Exit */}
      <div className="scroll-fade-overlay absolute inset-0 w-full h-full bg-bg-base pointer-events-none z-[5]" style={{ opacity: 0 }} />

      {/* Layer 3 — Subtle Film Grain Noise Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] z-10 pointer-events-none mix-blend-overlay">
        <filter id="hero-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.8 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-noise)" />
      </svg>

      {/* Content Overlay */}
      <div className="relative z-20 flex flex-col justify-center items-center w-full text-center gap-6 md:gap-8 pointer-events-none mix-blend-difference text-white">
        <h1 className="flex flex-col items-center">
          {/* Row 1: ABSOLUTE */}
          <span className="block overflow-hidden relative">
            <span
              ref={title1Ref}
              className="font-sans font-black leading-[0.85] tracking-[-0.04em] uppercase block"
              style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)" }}
            >
              ABSOLUTE
            </span>
          </span>

          {/* Row 2: Interface */}
          <span className="block overflow-hidden relative mt-2 md:mt-3">
            <span
              ref={title2Ref}
              className="font-cormorant font-light italic leading-[0.85] tracking-tight block text-white/90"
              style={{ fontSize: "clamp(2rem, 7vw, 6rem)" }}
            >
              Interface
            </span>
          </span>
        </h1>

        <div
          ref={sublineRef}
          className="font-sans text-sm md:text-base max-w-[28ch] leading-relaxed text-white/80"
        >
          Image-first interactive components.
        </div>

        <div ref={ctaContainerRef} className="pointer-events-auto mt-4">
          <motion.button
            onClick={handleCtaClick}
            aria-label="Explore Exhibition"
            className="font-sans text-xs uppercase tracking-[0.2em] px-8 py-3.5 rounded-full bg-white/10 backdrop-blur-md transition-all duration-300 cursor-pointer flex items-center justify-center overflow-hidden group text-white border border-white/20"
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.5)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE.smooth }}
          >
            <div className="relative overflow-hidden flex" aria-hidden="true">
              {/* Front Face */}
              <span className="flex transition-colors duration-300 text-white">
                {ctaLabel.split("").map((char, i) => (
                  <span
                    key={i}
                    className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-full"
                    style={{ transitionDelay: `${i * 0.006}s` }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </span>
              {/* Back Face */}
              <span className="absolute inset-0 flex text-white/80">
                {ctaLabel.split("").map((char, i) => (
                  <span
                    key={i}
                    className="inline-block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-0"
                    style={{ transitionDelay: `${i * 0.006}s` }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 w-full flex flex-col items-center justify-end z-20 pointer-events-none mix-blend-difference text-white"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-sans text-[8px] font-bold tracking-[0.25em] uppercase text-white/60">
            Scroll
          </span>
          <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
