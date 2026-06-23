"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import CursorTrail from "../CursorTrail";

export default function PhilosophyZone() {
  const containerRef = useRef<HTMLDivElement>(null);

  const act1Ref = useRef<HTMLDivElement>(null);
  const heroWordRef = useRef<HTMLHeadingElement>(null);
  const problemParaRef = useRef<HTMLParagraphElement>(null);
  const act1ImgLeftRef = useRef<HTMLDivElement>(null);
  const act1ImgRightRef = useRef<HTMLDivElement>(null);

  const act2Ref = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const revealTextRef = useRef<HTMLHeadingElement>(null);
  const cascade1Ref = useRef<HTMLDivElement>(null);
  const cascade2Ref = useRef<HTMLDivElement>(null);
  const cascade3Ref = useRef<HTMLDivElement>(null);

  const act3Ref = useRef<HTMLDivElement>(null);
  const fullBleedImgRef = useRef<HTMLDivElement>(null);
  const overlayTextRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current) return;

      const words = revealTextRef.current?.querySelectorAll(".word-reveal");

      let mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        // --- DESKTOP: FULL CINEMATIC ---
        
        // Setup initial states
        gsap.set([act2Ref.current, act3Ref.current], { autoAlpha: 0 });
        gsap.set(problemParaRef.current, { autoAlpha: 0, y: 20 });
        gsap.set(act1ImgLeftRef.current, { autoAlpha: 0, x: -50, rotation: -2 });
        gsap.set(act1ImgRightRef.current, { autoAlpha: 0, y: 50, rotation: 3 });
        
        gsap.set(dividerRef.current, { scaleX: 0, transformOrigin: "left center" });
        if (words) gsap.set(words, { autoAlpha: 0.2, y: 10 });
        gsap.set([cascade1Ref.current, cascade2Ref.current, cascade3Ref.current], { autoAlpha: 0, y: 100 });
        
        gsap.set(fullBleedImgRef.current, { clipPath: "circle(0% at 50% 50%)", scale: 1.1 });
        gsap.set(overlayTextRef.current, { autoAlpha: 0, scale: 0.95 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=300%", 
            pin: true,
            scrub: 1.5,
            anticipatePin: 1,
          },
        });

        // ACT 1 (0 -> 30%)
        tl.addLabel("act1");
        tl.to(heroWordRef.current, {
          scale: 0.4,
          x: "-25vw",
          y: "-30vh",
          opacity: 0.4,
          ease: "power2.inOut",
        }, "act1")
        .to(problemParaRef.current, { autoAlpha: 1, y: 0, ease: "power2.out" }, "act1+=0.2")
        .to(act1ImgLeftRef.current, { autoAlpha: 1, x: 0, ease: "power2.out" }, "act1+=0.3")
        .to(act1ImgRightRef.current, { autoAlpha: 1, y: 0, ease: "power2.out" }, "act1+=0.4");
        
        // ACT 2 (30 -> 65%)
        tl.addLabel("act2Transition");
        tl.to(act1Ref.current, { autoAlpha: 0, y: -80, ease: "power2.in" }, "act2Transition");
        tl.to(act2Ref.current, { autoAlpha: 1 }, "act2Transition+=0.2");
        
        tl.addLabel("act2");
        tl.to(dividerRef.current, { scaleX: 1, ease: "power3.out" }, "act2");
        
        if (words) {
          tl.to(words, { autoAlpha: 1, y: 0, stagger: 0.1, ease: "power2.out" }, "act2+=0.2");
        }

        tl.to(cascade1Ref.current, { autoAlpha: 1, y: 0, rotation: -4, ease: "power3.out" }, "act2+=0.4")
          .to(cascade2Ref.current, { autoAlpha: 1, y: 0, rotation: 2, ease: "power3.out" }, "act2+=0.5")
          .to(cascade3Ref.current, { autoAlpha: 1, y: 0, rotation: -1, ease: "power3.out" }, "act2+=0.6");

        // ACT 3 (65 -> 100%)
        tl.addLabel("act3Transition");
        tl.to(act2Ref.current, { autoAlpha: 0, scale: 0.95, ease: "power2.in" }, "act3Transition");
        tl.to(act3Ref.current, { autoAlpha: 1 }, "act3Transition+=0.1");

        tl.addLabel("act3");
        tl.to(fullBleedImgRef.current, {
          clipPath: "circle(100% at 50% 50%)",
          scale: 1,
          ease: "power2.inOut"
        }, "act3")
        .to(overlayTextRef.current, { autoAlpha: 1, scale: 1, ease: "power2.out" }, "act3+=0.3");

        return () => tl.kill();
      });

      mm.add("(max-width: 767px)", () => {
        // --- MOBILE: SIMPLIFIED FLOW ---
        gsap.set([act1Ref.current, act2Ref.current, act3Ref.current], { autoAlpha: 1, clearProps: "all" });
        gsap.set(heroWordRef.current, { opacity: 0.5, clearProps: "transform" });
        gsap.set(fullBleedImgRef.current, { clipPath: "circle(100% at 50% 50%)", clearProps: "transform" });

        const elems = [
          problemParaRef.current,
          act1ImgLeftRef.current,
          act1ImgRightRef.current,
          dividerRef.current,
          cascade1Ref.current,
          cascade2Ref.current,
          cascade3Ref.current,
          overlayTextRef.current
        ];
        
        elems.forEach((el) => {
          if (!el) return;
          gsap.fromTo(el, 
            { autoAlpha: 0, y: 30 },
            { 
              autoAlpha: 1, 
              y: 0, 
              duration: 0.8, 
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 85%"
              }
            }
          );
        });

        if (words) {
          gsap.fromTo(words,
            { autoAlpha: 0.2, y: 10 },
            {
              autoAlpha: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: revealTextRef.current,
                start: "top 80%"
              }
            }
          );
        }
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="philosophy"
      className="relative w-full min-h-[100dvh] bg-bg-base overflow-hidden"
    >
      <CursorTrail activeRef={containerRef} />

      {/* ACT 1 */}
      <div ref={act1Ref} className="relative md:absolute md:inset-0 w-full md:h-full flex flex-col md:block p-6 md:p-0 py-24 md:py-0 pointer-events-none">
        
        {/* Mobile Title */}
        <h2 className="md:hidden font-cormorant text-[15vw] leading-none text-fg-primary z-0 opacity-40 mb-12">
          Boxes.
        </h2>

        {/* Desktop Title (Centered absolute) */}
        <div className="hidden md:flex absolute inset-0 items-center justify-center">
          <h2 ref={heroWordRef} className="font-cormorant text-[20vw] leading-none text-fg-primary z-0 opacity-20 pointer-events-auto">
            Boxes.
          </h2>
        </div>
        
        {/* Paragraph */}
        <p ref={problemParaRef} className="font-sans text-sm md:text-base text-fg-secondary max-w-sm md:absolute md:top-[60%] md:left-[30%] z-10 mb-12 md:mb-0 pointer-events-auto">
          Every interface wraps images in containers. Borders. Cards. Shadows. The image becomes secondary to the frame.
        </p>

        {/* Images */}
        <div ref={act1ImgLeftRef} className="relative w-full aspect-[3/4] md:absolute md:top-[15%] md:-left-[5%] md:w-[28vw] md:h-[50vh] rounded-2xl overflow-hidden pointer-events-auto mb-8 md:mb-0 shadow-2xl">
           <Image src="/images/editorial-reach.jpg" alt="Act 1 Left" fill sizes="(max-width: 768px) 100vw, 30vw" className="object-cover" />
        </div>

        <div ref={act1ImgRightRef} className="relative w-[80%] ml-auto aspect-[4/3] md:ml-0 md:absolute md:bottom-[10%] md:right-[5%] md:w-[32vw] md:h-[45vh] rounded-2xl overflow-hidden pointer-events-auto shadow-2xl">
           <Image src="/images/chrome-figure-warm.jpg" alt="Act 1 Right" fill sizes="(max-width: 768px) 80vw, 30vw" className="object-cover" />
        </div>
      </div>

      {/* ACT 2 */}
      <div ref={act2Ref} className="relative md:absolute md:inset-0 w-full md:h-full flex flex-col md:flex-row items-center justify-center p-6 md:p-12 z-10 py-24 md:py-12 pointer-events-none">
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center relative pointer-events-auto">
          <div ref={dividerRef} className="w-full h-px bg-fg-muted/30 mb-8 origin-left" />
          <h2 ref={revealTextRef} className="font-sans text-4xl md:text-5xl lg:text-7xl font-light tracking-tight text-fg-primary max-w-xl leading-[1.1] flex flex-wrap">
            {["What", "if", "the", "image", "was", "the", "interface?"].map((word, i) => (
              <span key={i} className={`word-reveal inline-block mr-3 md:mr-4 mb-2 md:mb-3 ${word === 'image' ? 'font-cormorant italic text-accent' : ''}`}>
                {word}
              </span>
            ))}
          </h2>
        </div>

        <div className="w-full md:w-1/2 h-[70vh] md:h-full relative flex items-center justify-center mt-16 md:mt-0 pointer-events-auto">
          {/* Double-Bezel treatment */}
          <div ref={cascade1Ref} className="absolute w-[60%] h-[60%] right-[10%] top-[10%] rounded-2xl overflow-hidden shadow-2xl z-10 p-2 md:p-3 bg-white/5 backdrop-blur-md border border-white/10">
            <div className="relative w-full h-full rounded-xl overflow-hidden">
               <Image src="/images/avant-garde-fashion.jpg" alt="Cascade 1" fill sizes="(max-width: 768px) 60vw, 30vw" className="object-cover" />
               <div className="absolute inset-0 shadow-[inset_0_4px_24px_rgba(0,0,0,0.4)] pointer-events-none ring-1 ring-white/10" />
            </div>
          </div>
          <div ref={cascade2Ref} className="absolute w-[50%] h-[50%] left-[5%] top-[30%] rounded-2xl overflow-hidden shadow-2xl z-20 p-2 md:p-3 bg-white/5 backdrop-blur-md border border-white/10">
            <div className="relative w-full h-full rounded-xl overflow-hidden">
               <Image src="/images/wet-skin-portrait.jpg" alt="Cascade 2" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
               <div className="absolute inset-0 shadow-[inset_0_4px_24px_rgba(0,0,0,0.4)] pointer-events-none ring-1 ring-white/10" />
            </div>
          </div>
          <div ref={cascade3Ref} className="absolute w-[55%] h-[55%] right-[20%] bottom-[10%] rounded-2xl overflow-hidden shadow-2xl z-30 p-2 md:p-3 bg-white/5 backdrop-blur-md border border-white/10">
            <div className="relative w-full h-full rounded-xl overflow-hidden">
               <Image src="/images/chromashift-mannequin.jpg" alt="Cascade 3" fill sizes="(max-width: 768px) 55vw, 27vw" className="object-cover" />
               <div className="absolute inset-0 shadow-[inset_0_4px_24px_rgba(0,0,0,0.4)] pointer-events-none ring-1 ring-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* ACT 3 */}
      <div ref={act3Ref} className="relative md:absolute md:inset-0 w-full h-[80vh] md:h-full z-20 overflow-hidden mt-12 md:mt-0">
        <div ref={fullBleedImgRef} className="absolute inset-0 w-full h-full">
           <Image src="/images/analogue-light-abstraction.jpg" alt="Vision Full Bleed" fill sizes="100vw" className="object-cover" />
           <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center mix-blend-difference pointer-events-none px-6">
          <h2 ref={overlayTextRef} className="font-cormorant text-[18vw] md:text-[12vw] italic text-white uppercase tracking-tighter text-center leading-none">
            Absolute UI
          </h2>
        </div>
      </div>

    </section>
  );
}
