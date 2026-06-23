"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Pre-flight Bento Math:
// Grid is 6 cols x 3 rows = 18 cells total
// Item 1: 4x2 = 8 cells
// Item 2: 2x1 = 2 cells
// Item 3: 2x2 = 4 cells
// Item 4: 2x1 = 2 cells
// Item 5: 2x1 = 2 cells
// Sum: 18 cells. Zero empty space with grid-flow-dense.
const items = [
  { 
    id: "ex-1", 
    title: "Geometric Expansion", 
    type: "Framer Motion", 
    colSpan: "md:col-span-4", 
    rowSpan: "md:row-span-2", 
    img: "/images/editorial-reach.jpg" 
  },
  { 
    id: "ex-2", 
    title: "Liquid State", 
    type: "SVG Filters", 
    colSpan: "md:col-span-2", 
    rowSpan: "md:row-span-1", 
    img: "/images/wet-skin-portrait.jpg" 
  },
  { 
    id: "ex-3", 
    title: "Spring Physics", 
    type: "Interaction", 
    colSpan: "md:col-span-2", 
    rowSpan: "md:row-span-2", 
    img: "/images/chrome-visor-portrait.jpg" 
  },
  { 
    id: "ex-4", 
    title: "Velocity", 
    type: "Scroll Scrub", 
    colSpan: "md:col-span-2", 
    rowSpan: "md:row-span-1", 
    img: "/images/cosmic-radiance.jpg" 
  },
  { 
    id: "ex-5", 
    title: "Cinematic", 
    type: "GSAP Timeline", 
    colSpan: "md:col-span-2", 
    rowSpan: "md:row-span-1", 
    img: "/images/editorial-reach.jpg" 
  },
];

export default function GalleryZone() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Twin-Engine Phase 1: GSAP Geometric Multi-Shutter
  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (!containerRef.current) return;
    
    const shutters = gsap.utils.toArray('.shutter');
    
    // Set initial shutter state
    gsap.set(shutters, { scaleY: 1, transformOrigin: 'top' });

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 70%", // Trigger when section is 70% into view
      onEnter: () => {
        gsap.to(shutters, {
          scaleY: 0,
          duration: 1.6,
          stagger: 0.1,
          ease: "power4.inOut"
        });
      },
      once: true
    });
    
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      id="exhibition-zone"
      className="relative w-full min-h-screen bg-[#050505] text-white py-32 md:py-48"
    >
      {/* GSAP Shutters (Geometric Mask) */}
      <div className="absolute inset-0 z-40 flex pointer-events-none">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className="shutter w-1/5 h-full bg-[#111] border-r border-white/5" 
          />
        ))}
      </div>

      <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* Left Column: Pinned AIDA Interest Title */}
        <div className="lg:col-span-3 hidden lg:block">
          <div className="sticky top-48">
            <h2 className="text-4xl md:text-6xl font-sans tracking-tighter uppercase leading-[0.9] w-full">
              Interactive <br />
              <span className="text-white/30">Exhibition</span>
            </h2>
            <p className="mt-8 text-white/50 text-sm max-w-xs leading-relaxed font-mono uppercase tracking-widest">
              Select a module to enter the interactive workspace. Powered by Framer Motion shared layouts.
            </p>
          </div>
        </div>

        {/* Right Column: High-Density Bento Grid */}
        <div className="lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-6 auto-rows-[250px] md:auto-rows-[350px] grid-flow-dense gap-4">
            {items.map((item) => {
              const isActive = activeId === item.id;
              
              return (
                <motion.div
                  layoutId={`card-container-${item.id}`}
                  key={item.id}
                  onClick={() => !activeId && setActiveId(item.id)}
                  className={`relative overflow-hidden cursor-pointer group bg-[#111] border border-white/10 rounded-sm ${item.colSpan} ${item.rowSpan} ${activeId && !isActive ? 'pointer-events-none' : ''}`}
                  animate={{
                    opacity: activeId ? (isActive ? 0 : 0.2) : 1, // Active becomes invisible (modal takes over). Unselected fades out.
                    scale: activeId ? (isActive ? 1 : 0.95) : 1,
                    filter: activeId && !isActive ? "blur(4px)" : "blur(0px)"
                  }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Image Background */}
                  <motion.div className="absolute inset-0 w-full h-full" layoutId={`card-image-${item.id}`}>
                    <Image 
                      src={item.img} 
                      alt={item.title} 
                      fill 
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 mix-blend-luminosity opacity-50 grayscale group-hover:grayscale-0" 
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                  {/* Typography Content */}
                  <motion.div 
                    layoutId={`card-content-${item.id}`}
                    className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end pointer-events-none"
                  >
                    <h3 className="text-3xl md:text-5xl font-sans tracking-tighter text-white uppercase leading-none">
                      {item.title}
                    </h3>
                    <p className="text-white/50 font-mono text-xs uppercase tracking-[0.2em] mt-3">
                      {item.type}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Twin-Engine Phase 3: Framer Motion Interactive Expansion */}
      <AnimatePresence>
        {activeId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 pointer-events-none">
            {/* Dark Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-[#050505]/95 backdrop-blur-xl pointer-events-auto"
              onClick={() => setActiveId(null)}
            />
            
            {/* The Expanded Workspace */}
            <motion.div
              layoutId={`card-container-${activeId}`}
              className="relative w-full h-full max-w-7xl max-h-[900px] bg-[#0a0a0a] overflow-hidden pointer-events-auto border border-white/10 shadow-2xl flex flex-col md:flex-row rounded-sm"
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setActiveId(null)} 
                className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white backdrop-blur-md"
              >
                <span className="font-mono text-sm leading-none">✕</span>
              </button>

              {/* Left Column: Massive Image/Visuals */}
              <motion.div 
                layoutId={`card-image-${activeId}`}
                className="w-full md:w-1/2 h-1/2 md:h-full relative bg-black overflow-hidden"
              >
                <Image 
                  src={items.find(i => i.id === activeId)?.img || ''} 
                  fill 
                  className="object-cover mix-blend-luminosity opacity-40" 
                  alt="" 
                />
              </motion.div>

              {/* Right Column: Component Content */}
              <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative bg-gradient-to-t md:bg-gradient-to-r from-black/50 to-transparent">
                 <motion.div layoutId={`card-content-${activeId}`}>
                   <h2 className="text-4xl md:text-7xl font-sans tracking-tighter uppercase text-white leading-[0.9]">
                     {items.find(i => i.id === activeId)?.title}
                   </h2>
                   <p className="text-white/50 font-mono text-xs uppercase tracking-[0.2em] mt-4">
                     {items.find(i => i.id === activeId)?.type} // Workspace Active
                   </p>
                 </motion.div>

                 {/* Simulated Interactive Component Area */}
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   transition={{ delay: 0.3, duration: 0.5 }}
                   className="mt-12 md:mt-24 w-full"
                 >
                   <div className="w-full h-px bg-white/10 mb-8" />
                   <h4 className="text-white/70 font-sans text-xl mb-4">Interactive Controls</h4>
                   <div className="flex gap-4">
                     <button className="px-6 py-3 bg-white text-black font-sans uppercase tracking-widest text-xs hover:bg-white/90 transition-colors">
                       Run Sequence
                     </button>
                     <button onClick={() => setActiveId(null)} className="px-6 py-3 border border-white/20 text-white font-sans uppercase tracking-widest text-xs hover:bg-white/5 transition-colors">
                       Close
                     </button>
                   </div>
                 </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
