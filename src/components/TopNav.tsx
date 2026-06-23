"use client";

import { useEffect, useState, useRef } from "react";
import { useLenis } from "@/components/SmoothScrollProvider";
import { motion, AnimatePresence } from "framer-motion";

interface TopNavLinkProps {
  label: string;
  targetId?: string;
  href?: string;
  activeSection?: string;
  onClick?: (e: React.MouseEvent) => void;
}

function TopNavLink({ label, targetId, href, activeSection, onClick }: TopNavLinkProps) {
  const isActive = targetId ? activeSection === targetId : false;
  const isExternal = href && !href.startsWith("#");

  return (
    <a
      href={href || `#${targetId}`}
      onClick={onClick}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      aria-label={label}
      className="relative flex flex-col items-center group pointer-events-auto cursor-pointer font-sans text-[9px] font-bold uppercase tracking-[0.2em] py-1"
    >
      <div className="relative overflow-hidden" aria-hidden="true">
        {/* Front Face */}
        <span className={`flex transition-colors duration-300 ${isActive ? "text-accent" : "text-fg-secondary group-hover:text-fg-primary"}`}>
          {label.split("").map((char, i) => (
            <span
              key={i}
              className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-full"
              style={{ transitionDelay: `${i * 0.012}s` }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
        {/* Back Face (rolling up from bottom) */}
        <span className="absolute inset-0 flex">
          {label.split("").map((char, i) => (
            <span
              key={i}
              className={`inline-block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-0 ${isActive ? "text-accent-hover" : "text-accent"}`}
              style={{ transitionDelay: `${i * 0.012}s` }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </div>

      {/* Active Indicator Dot */}
      <span
        className={`absolute bottom-[-4px] w-1 h-1 rounded-full bg-accent transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isActive ? "opacity-100 scale-100" : "opacity-0 scale-0 group-hover:opacity-40 group-hover:scale-75"
        }`}
      />
    </a>
  );
}

export default function TopNav() {
  const [activeSection, setActiveSection] = useState("arrival");
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lenis = useLenis();
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync scroll state with Lenis
  useEffect(() => {
    if (!lenis) return;
    const handleScroll = () => {
      setScrolled(lenis.scroll > 80);
    };
    lenis.on("scroll", handleScroll);
    return () => {
      lenis.off("scroll", handleScroll);
    };
  }, [lenis]);

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

  // Keyboard accessibility and focus trap for mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
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
  }, [isMobileMenuOpen]);

  const handleLinkClick = (targetId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(`#${targetId}`, { duration: 1.4 });
      setIsMobileMenuOpen(false);
    }
  };

  const mobileLinks = [
    { id: "gallery", label: "Exhibition", num: "01" },
    { id: "philosophy", label: "Philosophy", num: "02" },
    { id: "github", label: "GitHub ↗", href: "https://github.com/absoluteui/absolute-ui", num: "03" }
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 lg:px-24 py-6 select-none transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          scrolled || isMobileMenuOpen
            ? "backdrop-blur-xl bg-bg-base/80 border-b border-border-clean/50 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        {/* Brand Logo */}
        <a
          href="#arrival"
          onClick={(e) => handleLinkClick("arrival", e)}
          className="flex flex-col gap-0.5 group pointer-events-auto cursor-pointer"
        >
          <span className="font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-fg-primary transition-colors duration-300 group-hover:text-accent">
            ABSOLUTE UI
          </span>
          <span className="font-sans text-[7px] tracking-[0.18em] text-fg-muted uppercase transition-colors duration-300 group-hover:text-fg-secondary">
            EXHIBITION SYSTEM
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-10">
          <TopNavLink
            label="Exhibition"
            targetId="gallery"
            activeSection={activeSection}
            onClick={(e) => handleLinkClick("gallery", e)}
          />
          <TopNavLink
            label="Philosophy"
            targetId="philosophy"
            activeSection={activeSection}
            onClick={(e) => handleLinkClick("philosophy", e)}
          />
          <TopNavLink
            label="GitHub"
            href="https://github.com/absoluteui/absolute-ui"
          />
        </div>

        {/* Mobile menu trigger button with fluid morph */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden relative w-6 h-6 flex items-center justify-center cursor-pointer pointer-events-auto group z-50"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <div className="w-full h-full relative flex flex-col justify-center gap-[5px]">
            <span 
              className={`block w-full h-[1px] bg-fg-primary transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] origin-center ${
                isMobileMenuOpen ? "absolute top-1/2 -translate-y-1/2 rotate-45" : ""
              }`}
            />
            <span 
              className={`block w-[70%] h-[1px] bg-fg-primary transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] self-end group-hover:w-full ${
                isMobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100"
              }`}
            />
            <span 
              className={`block w-full h-[1px] bg-fg-primary transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] origin-center ${
                isMobileMenuOpen ? "absolute top-1/2 -translate-y-1/2 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Menu Overlay with Framer Motion AnimatePresence */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-40 bg-bg-base/90 flex flex-col justify-between p-8 pt-24"
          >
            {/* Large Editorial Links with Staggered Entrance */}
            <motion.div 
              className="flex flex-col gap-8 my-auto pl-4"
              variants={{
                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
                hidden: {}
              }}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {mobileLinks.map((link) => (
                <motion.div
                  key={link.id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
                  }}
                  className="flex flex-col gap-2"
                >
                  <span className="font-sans text-[8px] font-bold tracking-[0.2em] text-fg-muted uppercase">
                    {link.num}
                  </span>
                  {link.href ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-cormorant text-5xl font-light italic text-fg-primary hover:text-accent transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <a
                      href={`#${link.id}`}
                      onClick={(e) => handleLinkClick(link.id, e)}
                      className="font-cormorant text-5xl font-light italic text-fg-primary hover:text-accent transition-colors duration-300 block"
                    >
                      {link.label}
                    </a>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Mobile Menu Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="w-full text-center border-t border-border-clean/30 pt-6 mt-8"
            >
              <span className="font-sans text-[8px] tracking-[0.2em] text-fg-muted uppercase">
                Warm light mode only · London studio
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
