"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ManifestoZone() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const text3Ref = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);

  // Chrome Visor portrait detail visual
  const concreteImage = "/images/chrome-visor-portrait.jpg";

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const container = containerRef.current;
      const pinSection = pinSectionRef.current;
      const t1 = text1Ref.current;
      const t2 = text2Ref.current;
      const t3 = text3Ref.current;
      const portrait = portraitRef.current;

      if (!container || !pinSection || !t1 || !t2 || !t3 || !portrait) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        // Static layout for accessibility
        gsap.set([t1, t2, t3], { xPercent: 0, color: "#C07860" });
        gsap.set(portrait, { scale: 1.0 });
        return;
      }

      // GSAP color breathing tween
      gsap.utils.toArray(".breathe-text").forEach((el, i) => {
        gsap.to(el as HTMLElement, {
          keyframes: {
            "0%": { color: "#C07860", opacity: 0.85 },
            "33%": { color: "#8A9A86", opacity: 0.65 },
            "66%": { color: "#8A7B6A", opacity: 0.75 },
            "100%": { color: "#C07860", opacity: 0.85 }
          },
          duration: 8,
          repeat: -1,
          ease: "none",
          delay: i * 2.5
        });
      });

      // Layer sandwich timeline: Pins on scroll and scrubs the text elements in opposite directions
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: 1, // Smooth scrub delay
          invalidateOnRefresh: true,
        },
      });

      // Clamp-scaled travel range: max 12% to prevent text clipping
      tl.fromTo(t1, { xPercent: -12 }, { xPercent: 12, ease: "none" }, 0)
        .fromTo(t2, { xPercent: 12 }, { xPercent: -12, ease: "none" }, 0)
        .fromTo(t3, { xPercent: -10 }, { xPercent: 10, ease: "none" }, 0)
        .fromTo(
          portrait,
          { scale: 1.0, boxShadow: "0 16px 40px -20px rgba(192, 120, 96, 0.12)" },
          { scale: 1.04, boxShadow: "0 32px 80px -15px rgba(192, 120, 96, 0.3)" },
          0
        );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} id="manifesto" className="relative w-full h-[120vh] bg-bg-base overflow-hidden">
      <section
        ref={pinSectionRef}
        className="w-full h-screen flex flex-col justify-center items-center relative overflow-hidden select-none px-[5vw]"
      >

        {/* Dynamic Text Stack (Layer 1: Behind the image) */}
        <div className="absolute inset-0 flex flex-col justify-center gap-8 sm:gap-12 md:gap-16 z-10 w-full overflow-hidden pointer-events-none px-[5vw]">
          {/* Row 1 */}
          <div
            ref={text1Ref}
            className="w-full flex justify-center whitespace-nowrap"
          >
            <h2 className="font-sans text-[clamp(7vw,10vw,8rem)] font-black uppercase tracking-tighter text-fg-primary leading-none breathe-text" style={{ color: "#C07860" }}>
              STRUCTURE
            </h2>
          </div>
          
          {/* Row 2 */}
          <div
            ref={text2Ref}
            className="w-full flex justify-center whitespace-nowrap"
          >
            <h2 className="font-sans text-[clamp(7vw,10vw,8rem)] font-black uppercase tracking-tighter text-fg-primary leading-none breathe-text" style={{ color: "#C07860" }}>
              MOTION
            </h2>
          </div>

          {/* Row 3 */}
          <div
            ref={text3Ref}
            className="w-full flex justify-center md:whitespace-nowrap whitespace-normal text-center"
          >
            <h2 className="font-sans text-[clamp(7vw,10vw,8rem)] font-black uppercase tracking-tighter text-fg-primary leading-none breathe-text" style={{ color: "#C07860" }}>
              IMMERSION
            </h2>
          </div>
        </div>

        {/* Central Portrait Column (Layer 2: Foreground Image with higher z-index) */}
        <div
          ref={portraitRef}
          className="relative w-[50vw] sm:w-[35vw] md:w-[24vw] aspect-[2/3] z-20 pointer-events-none rounded-2xl overflow-hidden border border-border-clean/50 transition-all duration-300"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full relative"
          >
            <Image
              src={concreteImage}
              alt="Chrome Visor Portrait"
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover filter brightness-[0.9] contrast-[1.04]"
            />
          </motion.div>
        </div>

        {/* Quiet footnote at bottom */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 max-w-xs text-center">
          <p className="font-sans text-[11px] text-fg-secondary uppercase tracking-widest leading-relaxed">
            Architectural permanence meeting fluid interactivity.
          </p>
        </div>
      </section>
    </div>
  );
}
