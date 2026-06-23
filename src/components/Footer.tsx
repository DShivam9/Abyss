"use client";

import { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { useLenis } from "@/components/SmoothScrollProvider";

// Character-by-character rolling link component
function RollingSocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="relative inline-block overflow-hidden py-1 group pointer-events-auto cursor-pointer font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-fg-muted"
    >
      {/* Front Face */}
      <span className="flex" aria-hidden="true">
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
      <span className="absolute inset-0 flex" aria-hidden="true">
        {label.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-0 text-accent"
            style={{ transitionDelay: `${i * 0.012}s` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    </a>
  );
}

// Magnetic circular arrow back-to-top compass (no elastic ease)
function BackToTopCompass() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();

  const { contextSafe } = useGSAP({ scope: buttonRef });

  const handleScrollTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleMouseMove = contextSafe((e: React.MouseEvent) => {
    const btn = buttonRef.current;
    const arrow = arrowRef.current;
    if (!btn || !arrow) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = btn.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;

    // Point arrow toward cursor coordinates
    const angle = Math.atan2(y, x) * (180 / Math.PI);

    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: "power2.out",
    });

    gsap.to(arrow, {
      rotation: angle - 90, // align pointing to cursor
      duration: 0.2,
      ease: "power1.out",
    });
  });

  const handleMouseLeave = contextSafe(() => {
    const btn = buttonRef.current;
    const arrow = arrowRef.current;
    if (!btn || !arrow) return;

    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "power3.out", // no elastic ease
    });

    gsap.to(arrow, {
      rotation: 0,
      duration: 0.5,
      ease: "power2.out",
    });
  });

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleScrollTop}
      aria-label="Back to top"
      className="w-11 h-11 rounded-full border border-border-clean/20 hover:border-fg-primary flex items-center justify-center pointer-events-auto cursor-pointer transition-colors duration-300 group bg-bg-surface/50"
    >
      <span
        ref={arrowRef}
        className="inline-block transform origin-center text-fg-primary text-sm font-light transition-colors duration-300 group-hover:text-accent"
      >
        ↑
      </span>
    </button>
  );
}

export default function Footer() {
  const [time, setTime] = useState("");
  const footerRef = useRef<HTMLDivElement>(null);
  const topLineRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const compassRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Europe/London",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setTime(new Intl.DateTimeFormat("en-GB", options).format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 95%",
          toggleActions: "play none none none",
        },
      });

      // 1. Accent line draws left-to-right
      tl.fromTo(
        topLineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: "cubic-bezier(0.16, 1, 0.3, 1)" }
      )
        // 2. Logo and Compass fade up
        .fromTo(
          [logoRef.current, compassRef.current],
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
          "-=0.4"
        );
    },
    { scope: footerRef }
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  return (
    <footer
      ref={footerRef}
      className="relative w-full bg-bg-deep py-20 md:py-28 px-8 md:px-16 lg:px-24 select-none flex flex-col gap-16 overflow-hidden"
    >
      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Top Hairline Divider: Gradient from transparent to border-clean to transparent */}
      <div
        ref={topLineRef}
        className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border-clean/50 to-transparent origin-center"
      />

      {/* Main 3-Column Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 items-start w-full relative z-10">
        {/* Column 1: Logo block */}
        <div ref={logoRef} className="flex flex-col gap-2 items-start">
          <span className="font-sans text-[10px] font-extrabold tracking-[0.3em] uppercase text-fg-primary">
            ABSOLUTE UI
          </span>
          <span className="font-sans text-[8px] tracking-[0.15em] text-fg-muted uppercase max-w-[20ch] leading-relaxed">
            Image-first. Motion-driven.
          </span>
        </div>

        {/* Column 2: Social Links (Framer Motion Stagger) */}
        <div className="flex flex-col md:items-center justify-center gap-3">
          <span className="font-sans text-[8px] tracking-[0.2em] text-fg-muted/60 uppercase mb-1 md:text-center">
            Connect
          </span>
          <motion.div 
            className="flex flex-col gap-2 md:items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div variants={itemVariants}>
              <RollingSocialLink href="https://github.com/absoluteui/absolute-ui" label="GitHub ↗" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <RollingSocialLink href="https://twitter.com/absoluteui" label="Twitter ↗" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <RollingSocialLink href="https://discord.gg/absoluteui" label="Discord ↗" />
            </motion.div>
          </motion.div>
        </div>

        {/* Column 3: Back to top Compass */}
        <div ref={compassRef} className="flex flex-col md:items-end justify-center gap-3">
          <span className="font-sans text-[8px] tracking-[0.2em] text-fg-muted/60 uppercase mb-1 md:text-right">
            Back to top
          </span>
          <BackToTopCompass />
        </div>
      </div>

      {/* Bottom Copyright & Clock row */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border-clean/20 gap-4 text-center md:text-left font-sans text-[9px] uppercase tracking-[0.18em] text-fg-muted/80 relative z-10">
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
          <span className="text-fg-primary font-bold">Absolute UI</span>
          <span>© {new Date().getFullYear()}</span>
          <span className="text-border-clean font-light">|</span>
          <span>MIT License</span>
        </div>
        
        {/* Render London Time */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center md:justify-end gap-2 md:text-right min-w-[120px]">
           <span className="text-accent font-medium tracking-[0.25em]">{time || "00:00:00"}</span>
           <span className="text-[7px] text-fg-muted">LONDON (GMT)</span>
        </div>
      </div>

    </footer>
  );
}
