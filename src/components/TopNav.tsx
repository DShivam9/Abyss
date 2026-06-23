"use client";

import { useEffect, useState, useRef } from "react";
import { useLenis } from "@/components/SmoothScrollProvider";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { id: "arrival", label: "Arrival", num: "01" },
  { id: "philosophy", label: "Philosophy", num: "02" },
  { id: "gallery", label: "Exhibition", num: "03" },
  { id: "manifesto", label: "Manifesto", num: "04" },
  { id: "github", label: "GitHub ↗", href: "https://github.com/absoluteui/absolute-ui", num: "05" }
];

export default function TopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("arrival");
  const lenis = useLenis();
  const menuRef = useRef<HTMLDivElement>(null);

  // Set up active section detection with IntersectionObserver
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

  // Keyboard accessibility and focus trap for menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scroll
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

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-6 md:px-12 py-8 select-none pointer-events-none mix-blend-difference text-white">
        {/* Brand Logo - Fixed Top Left */}
        <a
          href="#arrival"
          onClick={(e) => handleLinkClick("arrival", e)}
          className="flex flex-col gap-0.5 group pointer-events-auto cursor-pointer"
        >
          <span className="font-sans text-[10px] md:text-[11px] font-black tracking-[0.3em] uppercase text-white/90 transition-colors duration-300 hover:text-white">
            ABSOLUTE UI
          </span>
          <span className="font-sans text-[7px] md:text-[8px] tracking-[0.18em] text-white/60 uppercase transition-colors duration-300 group-hover:text-white/80">
            EXHIBITION SYSTEM
          </span>
        </a>

        {/* Minimalist Raw Toggle Button - Fixed Top Right */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="pointer-events-auto cursor-pointer group flex items-center gap-2 overflow-hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <span className="font-sans text-[10px] md:text-[11px] font-black tracking-[0.3em] uppercase text-white/90 group-hover:text-white transition-colors duration-300">
            [ {isOpen ? "CLOSE" : "MENU"} ]
          </span>
        </button>
      </nav>

      {/* Full-Screen Monolithic Takeover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
            animate={{ opacity: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" }}
            exit={{ opacity: 0, clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-50 flex flex-col justify-end bg-bg-base overflow-hidden px-6 md:px-12 pb-12 md:pb-24 pt-32"
          >
            {/* Cinematic Noise Overlay inside Menu */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none mix-blend-overlay">
              <filter id="menu-noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.8 0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#menu-noise)" />
            </svg>

            {/* Giant Staggered Typography */}
            <motion.div
              className="flex flex-col items-start w-full gap-2 md:gap-4 relative z-10"
              variants={{
                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
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
                    variants={{
                      hidden: { opacity: 0, y: 100, rotate: 2 },
                      visible: { opacity: 1, y: 0, rotate: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className="group flex flex-col w-full"
                  >
                    <div className="flex items-start gap-4 md:gap-8 overflow-hidden">
                      <span className="font-sans text-[10px] md:text-sm font-bold tracking-[0.2em] text-fg-muted uppercase mt-4 md:mt-8 group-hover:text-accent transition-colors duration-500">
                        {link.num}
                      </span>
                      {link.href ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-cormorant italic text-[clamp(4rem,10vw,8rem)] leading-[0.85] tracking-tight text-fg-primary group-hover:text-accent transition-colors duration-500 relative"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <a
                          href={`#${link.id}`}
                          onClick={(e) => handleLinkClick(link.id, e)}
                          className={`font-cormorant italic text-[clamp(4rem,10vw,8rem)] leading-[0.85] tracking-tight transition-colors duration-500 relative block ${
                            isActive ? "text-accent" : "text-fg-primary group-hover:text-accent"
                          }`}
                        >
                          {link.label}
                        </a>
                      )}
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
              className="absolute bottom-6 md:bottom-12 right-6 md:right-12 text-right relative z-10"
            >
              <span className="font-sans text-[8px] md:text-[10px] tracking-[0.2em] text-fg-muted uppercase">
                Warm light mode only <br />
                London studio
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
