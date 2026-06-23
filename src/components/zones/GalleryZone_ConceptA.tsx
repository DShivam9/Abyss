"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

const layers = [
  { 
    id: "01",
    src: "/images/editorial-reach.jpg", 
    title: "Scale.", 
    subtitle: "Defy proportion.",
    xOffset: "0%",
    yOffset: "0%",
    rotate: -2
  },
  { 
    id: "02",
    src: "/images/chrome-visor-portrait.jpg", 
    title: "Depth.", 
    subtitle: "Enter the void.",
    xOffset: "10%",
    yOffset: "5%",
    rotate: 3
  },
  { 
    id: "03",
    src: "/images/wet-skin-portrait.jpg", 
    title: "Focus.", 
    subtitle: "Eliminate noise.",
    xOffset: "-10%",
    yOffset: "-5%",
    rotate: -4
  },
  { 
    id: "04",
    src: "/images/cosmic-radiance.jpg", 
    title: "Absolute.", 
    subtitle: "The final layer.",
    xOffset: "5%",
    yOffset: "0%",
    rotate: 1
  },
];

export default function GalleryZone() {
  const containerRef = useRef<HTMLDivElement>(null);
  const perspectiveRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      if (!containerRef.current || !perspectiveRef.current) return;

      // Mouse Parallax Effect
      const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20; // -10 to 10 deg
        const y = (e.clientY / window.innerHeight - 0.5) * -20;
        
        gsap.to(perspectiveRef.current, {
          rotateY: x,
          rotateX: y,
          duration: 1.5,
          ease: "power2.out",
          transformOrigin: "center center"
        });
      };
      
      window.addEventListener("mousemove", handleMouseMove);

      // Z-Axis Fly-Through Math
      const proxy = { C: 0 };
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1.5, // Super smooth scrub
          start: "top top",
          end: "+=500%", 
        }
      });

      // Initial state
      layers.forEach((layer, i) => {
        const distance = i + 1; // initial C = 0
        const scale = 1 / distance;
        let alpha = 1;
        if (distance > 1) {
           alpha = 1 - (distance - 1) * 0.4;
        }
        
        gsap.set(layerRefs.current[i], {
          scale: scale,
          autoAlpha: Math.max(0, Math.min(1, alpha)),
          x: layer.xOffset,
          y: layer.yOffset,
          rotationZ: layer.rotate,
          transformOrigin: "center center"
        });
      });

      tl.to(proxy, {
        C: layers.length - 0.5, // Go past the last one slightly
        ease: "none",
        onUpdate: () => {
          layers.forEach((layer, i) => {
            const el = layerRefs.current[i];
            if (!el) return;

            const distance = i - proxy.C + 1;
            
            if (distance <= 0.1) {
              // Flown past camera
              gsap.set(el, { autoAlpha: 0 });
            } else {
              const scale = 1 / distance;
              
              let alpha = 1;
              if (distance > 1) {
                 // Fading into the distance fog
                 alpha = 1 - (distance - 1) * 0.4; 
              } else if (distance < 0.6) {
                 // Fading out as it passes through the camera
                 alpha = (distance - 0.1) / 0.5;
              }
              
              // Add a slight rotation as it approaches the camera for drama
              const approachRotation = (1 - distance) * 2;
              
              gsap.set(el, {
                scale: scale,
                rotationZ: layer.rotate + approachRotation,
                autoAlpha: Math.max(0, Math.min(1, alpha))
              });
            }
          });
        }
      });

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    });

    // Mobile fallback: simple fade sequence or vertical scroll
    mm.add("(max-width: 767px)", () => {
       // Reset styles for mobile
       gsap.set(layerRefs.current, { clearProps: "all" });
       
       const els = layerRefs.current.filter(Boolean);
       els.forEach((el, i) => {
         gsap.fromTo(el, 
           { autoAlpha: 0, scale: 0.9, y: 50 },
           {
             autoAlpha: 1,
             scale: 1,
             y: 0,
             duration: 1,
             ease: "power2.out",
             scrollTrigger: {
               trigger: el,
               start: "top 80%"
             }
           }
         );
       });
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="gallery" className="relative w-full bg-bg-base md:h-screen text-fg-primary overflow-hidden">
      
      {/* Header Info */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 md:p-12 lg:p-16 flex flex-col pointer-events-none mix-blend-difference text-white">
        <h2 className="font-sans text-[10px] md:text-xs tracking-[0.25em] uppercase opacity-70 mb-4">
          Exhibition
        </h2>
        <div className="font-mono text-xs md:text-sm tracking-widest">
          Z-AXIS JOURNEY
        </div>
      </div>

      {/* 3D Perspective Wrapper */}
      <div 
        className="w-full h-full flex flex-col md:block overflow-y-auto md:overflow-visible relative pt-32 md:pt-0"
        style={{ perspective: "1200px" }}
      >
        <div 
          ref={perspectiveRef} 
          className="w-full h-full md:absolute md:inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {layers.map((layer, i) => (
            <div
              key={layer.id}
              ref={(el) => {
                if (el) layerRefs.current[i] = el;
              }}
              className="relative md:absolute md:inset-0 flex items-center justify-center w-full md:w-auto h-[60vh] md:h-auto mb-16 md:mb-0 px-6 md:px-0 will-change-transform"
              style={{ zIndex: layers.length - i }}
            >
              
              {/* Massive Typography behind image */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -translate-y-8 md:-translate-y-12">
                <h3 className="text-[25vw] md:text-[22vw] leading-none font-cormorant italic tracking-tighter text-fg-primary/30 whitespace-nowrap drop-shadow-sm">
                  {layer.title}
                </h3>
              </div>

              {/* Image Container */}
              <div className="relative w-[75vw] md:w-[30vw] max-w-lg aspect-[4/5] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.3)] z-10 bg-black">
                <Image 
                  src={layer.src} 
                  alt={layer.title} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 30vw" 
                  className="object-cover opacity-90 grayscale-[20%]" 
                  priority={i === 0}
                />
                
                {/* Vignette / Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Content over image */}
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end text-center p-8 pb-12">
                  <p className="font-mono text-xs text-white/70 mb-2 tracking-[0.3em] uppercase">{layer.id}</p>
                  <h4 className="text-white text-3xl md:text-5xl font-sans font-light tracking-tight mix-blend-overlay">
                    {layer.title}
                  </h4>
                  <p className="text-white/60 mt-2 text-xs md:text-sm tracking-widest uppercase font-sans font-light">
                    {layer.subtitle}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
