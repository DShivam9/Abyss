"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

import ScaleScene from "../exhibition/ScaleScene";
import DepthScene from "../exhibition/DepthScene";
import FocusScene from "../exhibition/FocusScene";
import AbsoluteScene from "../exhibition/AbsoluteScene";

export default function GalleryZone() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {

    
    // Only run GSAP timeline on desktop and if reduced motion is false
    const mm = gsap.matchMedia();
    
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      if (!containerRef.current) return;

      // Initial States
      gsap.set(".scene-01", { autoAlpha: 1 });
      gsap.set([".scene-02", ".scene-03", ".scene-04"], { autoAlpha: 0 });
      gsap.set(".scale-scene-img", { scale: 1 });
      gsap.set(".scale-scene-text", { autoAlpha: 0, y: 50 });
      gsap.set(".depth-scene-text", { autoAlpha: 0, y: 50 });
      gsap.set(".focus-scene-text", { autoAlpha: 0, y: 50 });
      
      gsap.set(".depth-layer-mid", { clipPath: "inset(15% 15% 15% 15%)" });
      gsap.set(".depth-layer-fg", { clipPath: "inset(30% 30% 30% 30%)" });

      gsap.set(".focus-scene-container", { "--focus-radius": "10%" });
      gsap.set(".focus-sharp-image", { scale: 1.2 });

      gsap.set(".absolute-scene-wrapper", { width: "35vw", height: "60vh", borderRadius: "8px" });
      gsap.set(".absolute-scene-img", { scale: 1.1 });
      gsap.set(".absolute-text", { autoAlpha: 0, scale: 0.95 });
      gsap.set(".absolute-overlay", { autoAlpha: 0 });

      // Master Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=400%", // 4 phases
          pin: ".desktop-exhibition",
          scrub: 1.2,
          anticipatePin: 1,
        }
      });

      // Phase 1: Scale
      tl.addLabel("s1_start")
        .to(".scale-scene-img", { scale: 1.5, ease: "power2.inOut", duration: 1.5 })
        .to(".scale-scene-text", { autoAlpha: 1, y: 0, ease: "power3.out", duration: 1 }, "s1_start+=0.5")
        .addLabel("s1_end", "+=0.5")
        .to(".scene-01", { autoAlpha: 0, scale: 0.95, duration: 0.8 }, "s1_end");

      // Phase 2: Depth
      tl.addLabel("s2_start", "s1_end")
        .to(".scene-02", { autoAlpha: 1, duration: 0.5 }, "s2_start")
        .to(".depth-scene-text", { autoAlpha: 1, y: 0, ease: "power3.out", duration: 1 }, "s2_start+=0.5")
        .to(".depth-layer-mid", { clipPath: "inset(5% 5% 5% 5%)", ease: "power3.inOut", duration: 1.5 }, "s2_start+=0.2")
        .to(".depth-layer-fg", { clipPath: "inset(15% 15% 15% 15%)", ease: "power3.inOut", duration: 1.5 }, "s2_start+=0.2")
        .addLabel("s2_end", "+=0.5")
        .to(".scene-02", { autoAlpha: 0, scale: 1.05, duration: 0.8 }, "s2_end");

      // Phase 3: Focus
      tl.addLabel("s3_start", "s2_end")
        .to(".scene-03", { autoAlpha: 1, duration: 0.5 }, "s3_start")
        .to(".focus-scene-text", { autoAlpha: 1, y: 0, ease: "power3.out", duration: 1 }, "s3_start+=0.5")
        .to(".focus-scene-container", { "--focus-radius": "35%", ease: "power2.inOut", duration: 1.5 }, "s3_start+=0.2")
        .to(".focus-sharp-image", { scale: 1, ease: "power2.inOut", duration: 1.5 }, "s3_start+=0.2")
        .addLabel("s3_end", "+=0.5")
        .to(".scene-03", { autoAlpha: 0, filter: "blur(10px)", duration: 0.8 }, "s3_end");

      // Phase 4: Absolute
      tl.addLabel("s4_start", "s3_end")
        .to(".scene-04", { autoAlpha: 1, duration: 0.5 }, "s4_start")
        .to(".absolute-scene-wrapper", { 
          width: "100vw", 
          height: "100vh", 
          borderRadius: "0px", 
          duration: 1.5, 
          ease: "power3.inOut" 
        }, "s4_start+=0.2")
        .to(".absolute-scene-img", { scale: 1, duration: 1.5, ease: "power3.inOut" }, "s4_start+=0.2")
        .to(".absolute-text", { autoAlpha: 1, scale: 1, duration: 1, ease: "power2.out" }, "s4_start+=0.8")
        .to(".absolute-overlay", { autoAlpha: 1, duration: 1 }, "s4_start+=0.8");
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="gallery" className="relative w-full bg-[#050505] text-white">
      {/* Desktop/Motion-Enabled: Pinned Container */}
      <div className="desktop-exhibition hidden md:block md:motion-reduce:hidden w-full h-[100dvh] overflow-hidden relative">
        {/* Left Typography/Index */}
        <div className="absolute left-8 bottom-16 z-50 mix-blend-difference pointer-events-none">
          <h2 className="text-6xl font-sans tracking-tighter uppercase leading-[0.9]">
            Interactive <br />
            <span className="text-white/40">Exhibition</span>
          </h2>
          <p className="mt-8 text-white/50 text-sm max-w-xs font-mono uppercase tracking-widest">
            Scroll to shift states.
          </p>
        </div>

        {/* Stacked Scenes */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="scene-01 absolute inset-0"><ScaleScene /></div>
          <div className="scene-02 absolute inset-0"><DepthScene /></div>
          <div className="scene-03 absolute inset-0"><FocusScene /></div>
          <div className="scene-04 absolute inset-0"><AbsoluteScene /></div>
        </div>
      </div>

      {/* Mobile/Reduced-Motion: Vertical Stack */}
      <div className="mobile-exhibition flex flex-col md:hidden md:motion-reduce:flex w-full min-h-screen py-24 gap-32">
        <div className="px-6 mb-12">
          <h2 className="text-4xl font-sans tracking-tighter uppercase leading-[0.9]">
            Visual <br />
            <span className="text-white/40">Exhibition</span>
          </h2>
          <p className="mt-6 text-white/50 text-sm max-w-xs font-mono uppercase tracking-widest">
            Sequential exploration.
          </p>
        </div>

        <div className="relative w-full"><ScaleScene /></div>
        <div className="relative w-full"><DepthScene /></div>
        <div className="relative w-full"><FocusScene /></div>
        <div className="relative w-full"><AbsoluteScene /></div>
      </div>
    </section>
  );
}
