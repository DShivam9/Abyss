"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Image from "next/image";
import { IMAGES } from "@/lib/images";
import CursorTrail from "../CursorTrail";

export default function PhilosophyZone() {
  const containerRef = useRef<HTMLDivElement>(null);

  const act1Ref = useRef<HTMLDivElement>(null);
  const heroWordRef = useRef<HTMLHeadingElement>(null);
  const problemParaRef = useRef<HTMLParagraphElement>(null);
  const act1ImgLeftRef = useRef<HTMLDivElement>(null);
  const act1ImgRightRef = useRef<HTMLDivElement>(null);

  const act2Ref = useRef<HTMLDivElement>(null);
  const revealTextRef = useRef<HTMLHeadingElement>(null);
  const act2ImagesRef = useRef<HTMLDivElement>(null);
  const cascade1Ref = useRef<HTMLDivElement>(null);
  const cascade2Ref = useRef<HTMLDivElement>(null);

  const act3Ref = useRef<HTMLDivElement>(null);
  const fullBleedImgRef = useRef<HTMLDivElement>(null);
  const overlayTextRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {

      if (!containerRef.current) return;

      const words = revealTextRef.current?.querySelectorAll(".word-reveal");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // --- REDUCED MOTION: FULLY VISIBLE, STATIC FLOW ---
        gsap.set([act1Ref.current, act2Ref.current, act3Ref.current], { autoAlpha: 1, clearProps: "all" });
        gsap.set(heroWordRef.current, { opacity: 0.2, clearProps: "transform" });
        gsap.set(fullBleedImgRef.current, { clipPath: "circle(100% at 50% 50%)", clearProps: "transform" });
        
        const elems = [
          problemParaRef.current, act1ImgLeftRef.current, act1ImgRightRef.current,
          cascade1Ref.current, cascade2Ref.current, overlayTextRef.current
        ];
        elems.forEach(el => el && gsap.set(el, { autoAlpha: 1, clearProps: "transform" }));
        if (words) gsap.set(words, { autoAlpha: 1, color: "var(--color-fg-primary)", clearProps: "transform" });
      });

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        // --- DESKTOP: FULL CINEMATIC ---
        
        // Setup initial states
        gsap.set([act2Ref.current, act3Ref.current], { autoAlpha: 0 });
        gsap.set(problemParaRef.current, { autoAlpha: 1, y: 0 }); // Readable earlier
        gsap.set(heroWordRef.current, { opacity: 1, scale: 1, y: 0 });
        
        // Clean editorial frames, subtly tightened
        gsap.set(act1ImgLeftRef.current, { clipPath: "inset(0% 0% 0% 0%)", autoAlpha: 1 });
        gsap.set(act1ImgRightRef.current, { clipPath: "inset(0% 0% 0% 0%)", autoAlpha: 1 });
        
        if (words) {
          // Initial opacity no lower than 45%
          gsap.set(words, { opacity: 0.45, color: "var(--color-fg-primary)" });
        }
        
        gsap.set(act2ImagesRef.current, { autoAlpha: 0, y: 30 });
        
        gsap.set(fullBleedImgRef.current, { clipPath: "circle(0% at 50% 50%)", scale: 1.05 });
        gsap.set(overlayTextRef.current, { autoAlpha: 0, scale: 0.95 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=350%", 
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        // ACT 1: The Problem (0 -> 30%)
        tl.addLabel("act1")
          .to(heroWordRef.current, { scale: 0.8, opacity: 0.1, y: -50, duration: 1, ease: "power2.inOut" }, "act1")
          .to(act1ImgLeftRef.current, { clipPath: "inset(5% 5% 5% 5%)", y: -30, duration: 1, ease: "power2.inOut" }, "act1")
          .to(act1ImgRightRef.current, { clipPath: "inset(10% 2% 10% 2%)", y: -50, duration: 1, ease: "power2.inOut" }, "act1")
          .to(problemParaRef.current, { opacity: 0.3, y: -20, duration: 1, ease: "power2.inOut" }, "act1")
          .addLabel("act1_end")
          .to(act1Ref.current, { autoAlpha: 0, duration: 0.5 }, "act1_end");

        // ACT 2: The Turn (30 -> 65%)
        tl.addLabel("act2", "act1_end")
          .to(act2Ref.current, { autoAlpha: 1, duration: 0.5 }, "act2");

        if (words) {
          words.forEach((word, i) => {
            tl.to(word, {
              opacity: 1,
              color: "var(--color-accent)", // Active word uses accent
              duration: 0.2,
            }, `act2+=${i * 0.12}`)
            .to(word, {
              color: "var(--color-fg-primary)", // Settled words remain readable
              duration: 0.2,
            }, `act2+=${i * 0.12 + 0.3}`);
          });
        }

        tl.to(act2ImagesRef.current, { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" }, "act2+=0.8")
          .addLabel("act2_end")
          .to(act2Ref.current, { autoAlpha: 0, scale: 0.98, duration: 0.5 }, "act2_end");

        // ACT 3: The Proof (65 -> 100%)
        tl.addLabel("act3", "act2_end")
          .to(act3Ref.current, { autoAlpha: 1, duration: 0.2 }, "act3")
          .to(fullBleedImgRef.current, {
            clipPath: "circle(100% at 50% 50%)",
            scale: 1,
            duration: 1.5,
            ease: "power3.inOut"
          }, "act3")
          .to(overlayTextRef.current, { autoAlpha: 1, scale: 1, duration: 1, ease: "power2.out" }, "act3+=1.2");

        return () => tl.kill();
      });

      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        // --- MOBILE: SIMPLIFIED FLOW ---
        // Act 1 to 3 are not pinned but stacked vertically
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} id="philosophy" className="relative w-full bg-bg-base text-fg-primary overflow-hidden">
      <CursorTrail activeRef={containerRef} />

      {/* Desktop/Motion-Enabled: Pinned Container */}
      <div className="hidden md:block md:motion-reduce:hidden w-full h-[100dvh] overflow-hidden relative">
        
        {/* ACT 1 */}
        <div ref={act1Ref} className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none p-12">
          {/* Centered big word */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 ref={heroWordRef} className="font-cormorant text-[22vw] leading-none text-fg-primary/10">
              Boxes.
            </h2>
          </div>
          
          <div className="relative w-full max-w-7xl h-full flex justify-between items-center pointer-events-auto">
            <div className="w-1/3 flex flex-col gap-8 z-10">
              <p ref={problemParaRef} className="font-sans text-xl text-fg-secondary max-w-sm leading-relaxed">
                Every interface wraps images in containers. Borders. Cards. Shadows. The image becomes secondary to the frame.
              </p>
              <div ref={act1ImgLeftRef} className="relative w-full aspect-[4/5]">
                <Image src={IMAGES.editorialReach} alt="Framed Image 1" fill sizes="33vw" className="object-cover" />
              </div>
            </div>
            
            <div className="w-1/4 translate-y-12 z-10">
              <div ref={act1ImgRightRef} className="relative w-full aspect-square mt-20 md:mt-32">
                <Image src={IMAGES.blackJacketShades} alt="Framed Image 2" fill sizes="25vw" className="object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* ACT 2 */}
        <div ref={act2Ref} className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-12 pointer-events-none">
          <div className="max-w-4xl text-center pointer-events-auto z-20">
            <h2 ref={revealTextRef} className="font-sans text-5xl lg:text-7xl font-light tracking-tight text-fg-primary leading-[1.1] flex flex-wrap justify-center">
              {["What", "if", "the", "image", "was", "the", "interface?"].map((word, i) => (
                <span key={i} className={`word-reveal inline-block mx-2 mb-4 ${word === 'image' || word === 'interface?' ? 'font-cormorant italic' : ''}`}>
                  {word}
                </span>
              ))}
            </h2>
          </div>
          
          {/* Subtle contextual imagery establishing the turn, without glassmorphism/bloat */}
          <div ref={act2ImagesRef} className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center gap-12">
             <div ref={cascade1Ref} className="parallax-img-1 absolute right-[-10%] top-[20%] w-[40%] md:w-[30%] aspect-[3/4]">
               <Image src={IMAGES.greyFleecePose} alt="Abstract" fill sizes="20vw" className="object-cover" />
             </div>
             <div ref={cascade2Ref} className="parallax-img-2 absolute left-[10%] bottom-[10%] w-[50%] md:w-[40%] aspect-[4/5]">
               <Image src={IMAGES.wideAngleHeadphones} alt="Abstract" fill sizes="25vw" className="object-cover" />
             </div>
          </div>
        </div>

        {/* ACT 3 */}
        <div ref={act3Ref} className="absolute inset-0 w-full h-full z-30 pointer-events-none">
          <div ref={fullBleedImgRef} className="proof-bleed-img absolute inset-0 w-full h-full grayscale-[50%] origin-center">
             <Image src={IMAGES.chunkyBootsFashion} alt="Proof Full Bleed" fill sizes="100vw" className="object-cover" />
             {/* Warm light context overlay, NO dark-mode treatment */}
             <div className="absolute inset-0 bg-bg-base/10 mix-blend-overlay" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center px-6 mix-blend-color-burn">
            <h2 ref={overlayTextRef} className="font-cormorant text-[15vw] italic text-fg-secondary uppercase tracking-tighter text-center leading-none">
              Absolute UI
            </h2>
          </div>
        </div>
      </div>

      {/* Mobile/Reduced-Motion: Vertical Stack */}
      <div className="flex flex-col md:hidden md:motion-reduce:flex w-full py-24 px-6 gap-32">
        {/* ACT 1 */}
        <div className="flex flex-col gap-12 relative">
          <h2 className="font-cormorant text-[25vw] leading-none text-fg-primary/10 absolute -top-12 -left-4">
            Boxes.
          </h2>
          <p className="font-sans text-xl text-fg-secondary leading-relaxed pt-12 z-10">
            Every interface wraps images in containers. Borders. Cards. Shadows. The image becomes secondary to the frame.
          </p>
          <div className="relative w-full aspect-[4/5]">
            <Image src={IMAGES.editorialReach} alt="Framed Image 1" fill sizes="100vw" className="object-cover" />
          </div>
        </div>

        {/* ACT 2 */}
        <div className="flex flex-col gap-12">
          <h2 className="font-sans text-4xl font-light tracking-tight text-fg-primary leading-[1.2]">
            What if the <span className="font-cormorant italic text-accent">image</span> was the <span className="font-cormorant italic text-accent">interface?</span>
          </h2>
          <div className="parallax-img-m absolute left-[10%] bottom-[20%] w-[60%] aspect-[4/5]">
             <Image src={IMAGES.greyFleecePose} alt="Abstract" fill sizes="100vw" className="object-cover" />
          </div>
        </div>

        {/* ACT 3 */}
        <div className="relative w-full h-[60vh] rounded-sm overflow-hidden border border-border-clean">
           <Image src={IMAGES.chunkyBootsFashion} alt="Proof Full Bleed" fill sizes="100vw" className="object-cover" />
           <div className="absolute inset-0 flex items-center justify-center mix-blend-color-burn bg-bg-base/5">
             <h2 className="font-cormorant text-[18vw] italic text-fg-primary uppercase tracking-tighter text-center leading-none">
               Absolute UI
             </h2>
           </div>
        </div>
      </div>
    </section>
  );
}
