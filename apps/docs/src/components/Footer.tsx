"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─────────────────────────────────────────────────────────
   EDITORIAL FOOTER — Magazine Colophon & Index
   Inspired by Kinfolk / Cereal / Monocle back-pages.
   No columns. No link lists. Pure typographic architecture.
   ───────────────────────────────────────────────────────── */

const INDEX_ENTRIES = [
  { label: "Exhibition", href: "#exhibition", page: "01" },
  { label: "Components", href: "#components", page: "02" },
  { label: "Showcase", href: "#showcase", page: "03" },
  { label: "Docs", href: "/docs", page: "04" },
  { label: "GitHub", href: "https://github.com", page: "→", external: true },
];

const COLOPHON = [
  { role: "Stack", value: "React · Next.js" },
  { role: "Motion", value: "GSAP · Lenis" },
  { role: "Type", value: "Geist Sans · Mono" },
  { role: "License", value: "MIT" },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const indexRowRef = useRef<HTMLDivElement>(null);
  const colophonRef = useRef<HTMLDivElement>(null);
  const ruleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [localTime, setLocalTime] = useState("");
  const [currentYear] = useState(() => new Date().getFullYear());
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("npx absoluteui init");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  }, []);

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setLocalTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // GSAP scroll-reveal choreography
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Horizontal rules draw in from center
      ruleRefs.current.forEach((rule) => {
        if (!rule) return;
        gsap.fromTo(
          rule,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.2,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: rule,
              start: "top 92%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // Brand name rises into place
      if (brandRef.current) {
        gsap.fromTo(
          brandRef.current,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.4,
            ease: "power4.out",
            scrollTrigger: {
              trigger: brandRef.current,
              start: "top 95%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Index entries stagger in
      if (indexRowRef.current) {
        const items = indexRowRef.current.querySelectorAll("[data-index-item]");
        gsap.fromTo(
          items,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: indexRowRef.current,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Colophon entries stagger in
      if (colophonRef.current) {
        const items =
          colophonRef.current.querySelectorAll("[data-colophon-item]");
        gsap.fromTo(
          items,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: colophonRef.current,
              start: "top 92%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const addRuleRef = (el: HTMLDivElement | null, idx: number) => {
    ruleRefs.current[idx] = el;
  };

  return (
    <footer
      ref={footerRef}
      id="footer"
      className="w-full bg-bg-deep relative overflow-hidden select-none"
    >
      {/* Subtle noise texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.018] bg-[url('data:image/svg+xml;utf8,<svg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22><filter id=%22noise%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/></svg>')] bg-repeat" />

      <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16">
        {/* ▬▬▬ TOP RULE ▬▬▬ */}
        <div
          ref={(el) => addRuleRef(el, 0)}
          className="w-full h-px bg-border-clean origin-center"
        />

        {/* ▬▬▬ EDITION STRIP — thin mono bar ▬▬▬ */}
        <div className="flex items-center justify-between py-5">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-fg-muted font-medium">
            Edition {currentYear} — v1.0
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-fg-muted font-medium flex items-center gap-2">
            <span className="inline-block w-[5px] h-[5px] rounded-full bg-accent animate-pulse" />
            {localTime || "—"}
          </span>
        </div>

        {/* ▬▬▬ RULE ▬▬▬ */}
        <div
          ref={(el) => addRuleRef(el, 1)}
          className="w-full h-px bg-border-clean origin-center"
        />

        {/* ▬▬▬ BRAND TYPOGRAPHY BLOCK ▬▬▬
            Massive tracked-out brand name — the visual anchor.
            Set in the project's own sans (Geist) not a fake serif. */}
        <div
          ref={brandRef}
          className="py-16 md:py-24 lg:py-32 flex flex-col items-start gap-8"
        >
          {/* Primary mark */}
          <div className="w-full flex flex-col gap-1">
            <h2
              className="text-[11vw] md:text-[9vw] lg:text-[7.5vw] font-black uppercase leading-[0.85] tracking-[-0.04em] text-fg-primary"
              style={{ fontFeatureSettings: '"ss01", "cv02"' }}
            >
              Absolute
            </h2>
            <h2
              className="text-[11vw] md:text-[9vw] lg:text-[7.5vw] font-black uppercase leading-[0.85] tracking-[-0.04em] text-transparent"
              style={{
                WebkitTextStroke: "1.5px var(--fg-primary)",
                fontFeatureSettings: '"ss01", "cv02"',
              }}
            >
              UI
            </h2>
          </div>

          {/* Install command — the one thing that actually matters */}
          <button
            onClick={handleCopy}
            className="group flex items-center gap-3 border border-border-clean hover:border-accent/40 bg-bg-surface/50 hover:bg-bg-surface px-5 py-3 rounded-sm transition-all duration-300 cursor-pointer"
          >
            <span className="font-mono text-[12px] md:text-[13px] text-fg-secondary group-hover:text-fg-primary transition-colors duration-300 tracking-wide">
              npx absoluteui init
            </span>
            <span className="font-mono text-[10px] text-fg-muted group-hover:text-accent transition-colors duration-300 uppercase tracking-widest">
              {copied ? "copied" : "copy"}
            </span>
          </button>
        </div>

        {/* ▬▬▬ RULE ▬▬▬ */}
        <div
          ref={(el) => addRuleRef(el, 2)}
          className="w-full h-px bg-border-clean origin-center"
        />

        {/* ▬▬▬ INDEX ROW — magazine table-of-contents strip ▬▬▬
            Horizontal entries separated by vertical rules.
            Each entry has a page number and title. */}
        <div ref={indexRowRef} className="py-2">
          <div className="flex flex-wrap">
            {INDEX_ENTRIES.map((entry, i) => (
              <a
                key={entry.label}
                href={entry.href}
                data-index-item
                {...(entry.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={`
                  group flex items-center gap-3 md:gap-4 py-5 md:py-6 px-4 md:px-8
                  ${i > 0 ? "border-l border-border-clean" : ""}
                  flex-1 min-w-[140px]
                  transition-colors duration-300
                  hover:bg-bg-surface/40
                `}
              >
                {/* Page number */}
                <span className="font-mono text-[10px] text-fg-muted group-hover:text-accent transition-colors duration-300 tabular-nums font-medium">
                  {entry.page}
                </span>

                {/* Label */}
                <span className="font-sans text-[13px] md:text-[15px] uppercase tracking-[0.15em] font-semibold text-fg-primary group-hover:text-accent transition-colors duration-300">
                  {entry.label}
                </span>

                {/* Arrow — reveals on hover */}
                <span className="ml-auto font-sans text-[14px] text-fg-muted opacity-0 translate-x-[-6px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  →
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ▬▬▬ RULE ▬▬▬ */}
        <div
          ref={(el) => addRuleRef(el, 3)}
          className="w-full h-px bg-border-clean origin-center"
        />

        {/* ▬▬▬ COLOPHON — magazine masthead credits ▬▬▬ */}
        <div ref={colophonRef} className="py-8 md:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8">
            {COLOPHON.map((item) => (
              <div
                key={item.role}
                data-colophon-item
                className="flex flex-col gap-1.5"
              >
                <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-fg-muted font-bold">
                  {item.role}
                </span>
                <span className="font-sans text-[12px] text-fg-secondary font-medium tracking-wide">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ▬▬▬ BOTTOM RULE ▬▬▬ */}
        <div
          ref={(el) => addRuleRef(el, 4)}
          className="w-full h-px bg-border-clean origin-center"
        />

        {/* ▬▬▬ LEGAL STRIP ▬▬▬ */}
        <div className="flex items-center justify-center py-6">
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-fg-muted font-medium">
            © {currentYear} AbsoluteUI
          </span>
        </div>
      </div>


    </footer>
  );
}
