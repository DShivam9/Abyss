"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Image from "next/image";
import { IMAGES } from "@/lib/images";

export default function ManifestoZone() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const text3Ref = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);

  const concreteImage = IMAGES.skateboardDollarGraphic;

  useGSAP(
    () => {


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
        gsap.set([t1, t2, t3], { xPercent: 0, opacity: 1 });
        gsap.set(portrait, { scale: 1.0, opacity: 1 });
        return;
      }

      // Initial state
      gsap.set(t1, { autoAlpha: 0, z: -200, xPercent: -20 });
      gsap.set(t2, { autoAlpha: 0, z: -300, xPercent: 20 });
      gsap.set(t3, { autoAlpha: 0, z: -200, xPercent: -20 });
      gsap.set(portrait, { autoAlpha: 0, scale: 0.9, y: 50 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // Enter
      tl.addLabel("enter")
        .to(t1, { autoAlpha: 1, z: 0, xPercent: -8, duration: 1, ease: "power2.out" }, "enter")
        .to(t2, { autoAlpha: 1, z: 0, xPercent: 8, duration: 1, ease: "power2.out" }, "enter+=0.1")
        .to(t3, { autoAlpha: 1, z: 0, xPercent: -8, duration: 1, ease: "power2.out" }, "enter+=0.2")
        .to(portrait, { autoAlpha: 1, scale: 1, y: 0, duration: 1.2, ease: "power3.out" }, "enter+=0.3");

      // Active
      tl.addLabel("active")
        .to(t1, { xPercent: 8, duration: 3, ease: "none" }, "active")
        .to(t2, { xPercent: -8, duration: 3, ease: "none" }, "active")
        .to(t3, { xPercent: 8, duration: 3, ease: "none" }, "active")
        .to(portrait, { scale: 1.03, duration: 3, ease: "none" }, "active");

      // Exit
      tl.addLabel("exit")
        .to([t1, t2, t3], { autoAlpha: 0.2, filter: "blur(4px)", duration: 1, ease: "power2.inOut" }, "exit")
        .to(portrait, { autoAlpha: 0.6, y: -20, duration: 1, ease: "power2.inOut" }, "exit+=0.2");

      return () => tl.kill();
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} id="manifesto" className="relative w-full min-h-screen bg-bg-base overflow-hidden" style={{ perspective: "1000px" }}>
      <section
        ref={pinSectionRef}
        className="w-full h-[100dvh] flex flex-col justify-center items-center relative overflow-hidden select-none px-[5vw]"
      >

        {/* Dynamic Text Stack */}
        <div className="absolute inset-0 flex flex-col justify-center gap-8 sm:gap-12 md:gap-16 z-10 w-full overflow-hidden pointer-events-none px-[5vw]" style={{ transformStyle: "preserve-3d" }}>
          {/* Row 1 */}
          <div ref={text1Ref} className="w-full flex justify-center whitespace-nowrap">
            <h2 className="font-sans text-[clamp(7vw,10vw,8rem)] font-black uppercase tracking-tighter text-fg-primary leading-none opacity-80">
              STRUCTURE
            </h2>
          </div>
          
          {/* Row 2 */}
          <div ref={text2Ref} className="w-full flex justify-center whitespace-nowrap">
            <h2 className="font-sans text-[clamp(7vw,10vw,8rem)] font-black uppercase tracking-tighter text-fg-primary leading-none opacity-80">
              MOTION
            </h2>
          </div>

          {/* Row 3 */}
          <div ref={text3Ref} className="w-full flex justify-center md:whitespace-nowrap whitespace-normal text-center">
            <h2 className="font-sans text-[clamp(7vw,10vw,8rem)] font-black uppercase tracking-tighter text-fg-primary leading-none opacity-80">
              IMMERSION
            </h2>
          </div>
        </div>

        {/* Central Portrait */}
        <div
          ref={portraitRef}
          className="relative w-[50vw] sm:w-[35vw] md:w-[24vw] aspect-[2/3] z-20 pointer-events-none rounded-2xl overflow-hidden border border-border-clean/50 shadow-sm"
        >
          <div className="w-full h-full relative">
            <Image
              src={concreteImage}
              alt="Chrome Visor Portrait"
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
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
