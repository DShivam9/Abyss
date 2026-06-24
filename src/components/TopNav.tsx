"use client";

import { useEffect, useState } from "react";
import { useLenis } from "@/components/SmoothScrollProvider";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import BrandLogo from "./BrandLogo";

import { EASE, DURATION } from "@/lib/animation";
import { IMAGES } from "@/lib/images";

const links = [
  { id: "arrival", label: "Arrival", num: "01", image: IMAGES.jacksonYeeWide },
  { id: "philosophy", label: "Philosophy", num: "02", image: IMAGES.chunkyBootsFashion },
  { id: "gallery", label: "Exhibition", num: "03", image: IMAGES.silverVisorPortrait },
  { id: "manifesto", label: "Manifesto", num: "04", image: IMAGES.avantGardeFashion },
  { id: "github", label: "GitHub ↗", href: "https://github.com/absoluteui/absolute-ui", num: "05" }
];

export default function TopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("arrival");
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const lenis = useLenis();

  // Active section detection
  useEffect(() => {
    const sections = ["arrival", "philosophy", "gallery", "manifesto"];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.15, rootMargin: "-40% 0px -40% 0px" }
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, []);

  // Keyboard accessibility and focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLinkClick = (targetId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(`#${targetId}`, { duration: 1.4 });
      setIsOpen(false);
    }
  };

  // Determine which image to show: hovered link's image, or active section's image, or fallback
  const currentImageId = hoveredLink || activeSection;
  const currentImage = links.find(l => l.id === currentImageId)?.image || links[0].image;

  return (
    <>
      {/* 
        Task 1.1: Static, Architectural Header
        No magnetism, no scroll-hiding. Purely fixed, precise header.
      */}
      <nav className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-6 md:px-12 py-8 select-none pointer-events-none mix-blend-difference text-white">
        {/* Brand Logo - Fixed Top Left */}
        <BrandLogo onClick={(e) => handleLinkClick("arrival", e)} />

        {/* Static Architectural Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="pointer-events-auto cursor-pointer group flex items-center relative px-4 py-2 -mr-4"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <div className="relative font-sans text-[11px] md:text-xs font-bold tracking-[0.25em] uppercase text-current transition-colors duration-300">
            <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1 opacity-40">[</span>
            <span className="mx-2">{isOpen ? "CLOSE" : "MENU"}</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 opacity-40">]</span>
            {/* Strike-through line on hover */}
            <span className="absolute left-0 top-1/2 w-0 h-[1px] bg-current transition-all duration-500 ease-out group-hover:w-full -translate-y-1/2"></span>
          </div>
        </button>
      </nav>

      {/* Task 1.2 & 1.3: Split-Panel Overlay Grid & Top-Down Wipe */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: DURATION.slow, ease: EASE.wipe }}
            className="fixed inset-0 z-50 bg-bg-base overflow-hidden"
          >
            {/* Split Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full">
              
              {/* Left Panel: Typography */}
              <div className="flex flex-col justify-end px-6 md:px-12 pb-12 md:pb-24 pt-32 h-full relative z-10">
                {/* Cinematic Noise (Left only to keep it clean) */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none mix-blend-overlay">
                  <filter id="menu-noise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.8 0" />
                  </filter>
                  <rect width="100%" height="100%" filter="url(#menu-noise)" />
                </svg>

                <motion.div
                  className="flex flex-col items-start w-full gap-2 md:gap-4 relative z-10"
                  variants={{
                    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
                    hidden: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                  }}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {links.map((link) => {
                    const isActive = activeSection === link.id && !link.href;
                    return (
                      <motion.div
                        key={link.id}
                        className="group flex flex-col w-full cursor-pointer"
                        onMouseEnter={() => setHoveredLink(link.id)}
                        onMouseLeave={() => setHoveredLink(null)}
                      >
                        <div className="flex items-start gap-4 md:gap-8 overflow-hidden pt-2">
                          {/* Number Index */}
                          <motion.div
                            variants={{
                              hidden: { y: "100%" },
                              visible: { y: "0%", transition: { duration: DURATION.medium, ease: EASE.wipe } }
                            }}
                          >
                            <span className={`font-sans text-[10px] md:text-sm font-bold tracking-[0.2em] uppercase mt-4 md:mt-8 transition-colors duration-500 block ${
                              isActive ? "text-fg-primary" : "text-fg-muted group-hover:text-fg-primary"
                            }`}>
                              {link.num}
                            </span>
                          </motion.div>
                          
                          {/* Editorial Title */}
                          <motion.div
                            variants={{
                              hidden: { y: "100%", rotate: 2 },
                              visible: { y: "0%", rotate: 0, transition: { duration: 1, ease: EASE.wipe } }
                            }}
                          >
                            <a
                              href={link.href || `#${link.id}`}
                              target={link.href ? "_blank" : undefined}
                              rel={link.href ? "noopener noreferrer" : undefined}
                              onClick={!link.href ? (e) => handleLinkClick(link.id, e) : undefined}
                              className={`font-cormorant flex italic text-[clamp(4rem,7vw,7rem)] leading-[0.85] tracking-tight relative [clip-path:inset(-0.4em_-0.2em_-0.4em_-0.2em)] ${
                                isActive ? "text-accent" : "text-fg-primary"
                              }`}
                            >
                              <div className="relative flex">
                                {/* Primary Text */}
                                <div className="flex">
                                  {link.label.split("").map((char, i) => (
                                    <span 
                                      key={i} 
                                      className="block transition-transform duration-[0.8s] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-[1.8em]"
                                      style={{ transitionDelay: `${i * 0.02}s` }}
                                    >
                                      {char === " " ? "\u00A0" : char}
                                    </span>
                                  ))}
                                </div>
                                {/* Hover Text (Roll Up) */}
                                <div className="absolute inset-0 flex pointer-events-none" aria-hidden="true">
                                  {link.label.split("").map((char, i) => (
                                    <span 
                                      key={i} 
                                      className={`block transition-transform duration-[0.8s] ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-[1.8em] group-hover:translate-y-0 ${isActive ? 'text-accent' : 'text-fg-muted'}`}
                                      style={{ transitionDelay: `${i * 0.02}s` }}
                                    >
                                      {char === " " ? "\u00A0" : char}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </a>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Bottom meta text */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { delay: 1, duration: 1 } }
                  }}
                  className="absolute bottom-6 md:bottom-12 left-6 md:left-12 pointer-events-none"
                >
                  <span className="font-sans text-[8px] md:text-[10px] tracking-[0.2em] text-fg-muted uppercase">
                    Editorial Layout <br />
                    Split Interface
                  </span>
                </motion.div>
              </div>

              {/* Task 1.4: Asymmetric Hover Image Swaps (Right Panel, Hidden on Mobile) */}
              <div className="hidden md:block relative h-full w-full bg-[#E5D5C5]/50 border-l border-fg-muted/10 overflow-hidden">
                <AnimatePresence>
                  {currentImage && (
                    <motion.div
                      key={currentImage}
                      initial={{ clipPath: "inset(100% 0 0 0)" }}
                      animate={{ clipPath: "inset(0% 0 0 0)", zIndex: 10 }}
                      exit={{ clipPath: "inset(0 0 100% 0)", zIndex: 0 }}
                      transition={{ duration: DURATION.medium, ease: EASE.wipe }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <Image 
                        src={currentImage} 
                        alt="Section Preview" 
                        fill 
                        className="object-cover object-center grayscale-[20%]" 
                        priority 
                        sizes="50vw" 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
