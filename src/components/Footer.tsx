"use client";

import { useEffect, useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/components/SmoothScrollProvider";

function RollingSocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="relative inline-block overflow-hidden py-1 group pointer-events-auto cursor-pointer font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-fg-secondary"
    >
      <span className="flex" aria-hidden="true">
        {label.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-full"
            style={{ transitionDelay: `${i * 0.015}s` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
      <span className="absolute inset-0 flex" aria-hidden="true">
        {label.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-0 text-accent"
            style={{ transitionDelay: `${i * 0.015}s` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-x-100" />
    </a>
  );
}

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

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    contextSafe(() => {
      const btn = buttonRef.current;
      const arrow = arrowRef.current;
      if (!btn || !arrow) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const { clientX, clientY } = e;
      const { left, top, width, height } = btn.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const x = clientX - centerX;
      const y = clientY - centerY;

      const angle = Math.atan2(y, x) * (180 / Math.PI);

      const length = Math.sqrt(x * x + y * y);
      const maxMove = 8;
      const factor = length > 0 ? Math.min(maxMove / length, 0.3) : 0;

      gsap.to(btn, {
        x: x * factor,
        y: y * factor,
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(arrow, {
        rotation: angle + 90,
        duration: 0.2,
        ease: "power1.out",
      });
    })();
  };

  const handleMouseLeave = () => {
    contextSafe(() => {
      const btn = buttonRef.current;
      const arrow = arrowRef.current;
      if (!btn || !arrow) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
      });

      gsap.to(arrow, {
        rotation: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    })();
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleScrollTop}
      aria-label="Back to top"
      className="w-14 h-14 rounded-full border border-border-clean hover:border-accent flex items-center justify-center pointer-events-auto cursor-pointer transition-colors duration-500 group bg-transparent relative"
    >
      <span
        ref={arrowRef}
        className="inline-block transform origin-center text-fg-primary text-xl font-light transition-colors duration-500 group-hover:text-accent"
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
  const contentRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);

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
      
      const mm = gsap.matchMedia();
      
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([topLineRef.current, contentRef.current, clockRef.current], { autoAlpha: 1, clearProps: "all" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(topLineRef.current, { scaleX: 0, transformOrigin: "center center" });
        gsap.set(contentRef.current, { autoAlpha: 0, y: 30 });
        gsap.set(clockRef.current, { autoAlpha: 0, y: 10 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });

        tl.to(topLineRef.current, { scaleX: 1, duration: 1, ease: "power3.inOut" })
          .to(contentRef.current, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.4")
          .to(clockRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.4");
          
        return () => tl.kill();
      });
      
      return () => mm.revert();
    },
    { scope: footerRef }
  );

  return (
    <footer
      ref={footerRef}
      className="relative w-full bg-bg-deep px-8 md:px-16 lg:px-24 py-16 md:py-24 select-none flex flex-col gap-24 md:gap-32 overflow-hidden z-20"
    >
      <div
        ref={topLineRef}
        className="absolute top-0 left-8 right-8 md:left-16 md:right-16 lg:left-24 lg:right-24 h-[1px] bg-border-clean"
      />

      <div ref={contentRef} className="flex flex-col items-center text-center max-w-7xl mx-auto w-full pt-12 md:pt-0">
        <h2 className="font-cormorant italic text-4xl md:text-6xl lg:text-7xl text-fg-primary mb-16 md:mb-32">
          Images should feel alive.
        </h2>

        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-16 md:gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-sans text-[11px] font-extrabold tracking-[0.3em] uppercase text-fg-primary">
              Absolute UI
            </span>
            <span className="font-sans text-[9px] tracking-[0.15em] text-fg-muted uppercase leading-relaxed">
              Image-first. Motion-driven.
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            <RollingSocialLink href="https://github.com/absoluteui/absolute-ui" label="GitHub" />
            <RollingSocialLink href="https://twitter.com/absoluteui" label="Twitter" />
            <RollingSocialLink href="https://discord.gg/absoluteui" label="Discord" />
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <BackToTopCompass />
          </div>
        </div>
      </div>

      <div ref={clockRef} className="w-full flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border-clean/50 gap-6 md:gap-4 text-center md:text-left font-sans text-[10px] uppercase tracking-[0.18em] text-fg-muted/80 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
          <span className="text-fg-primary font-semibold">Absolute UI</span>
          <span>© {new Date().getFullYear()}</span>
          <span className="text-border-clean font-light hidden md:inline">|</span>
          <span className="hidden md:inline">MIT License</span>
        </div>
        
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center md:justify-end gap-2 md:text-right min-w-[120px]">
           <span className="text-accent font-medium tracking-[0.25em]">{time || "00:00:00"}</span>
           <span className="text-[8px] text-fg-muted/60">LONDON (GMT)</span>
        </div>
      </div>
    </footer>
  );
}
