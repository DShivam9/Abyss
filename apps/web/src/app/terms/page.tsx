"use client";

import React, { useEffect, useRef, useState } from "react";
import { DockNavbar } from "@/components/layout/DockNavbar";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { SEARCH_INDEX } from "@/lib/registry";
import { SiteFooter } from "@/components/layout/SiteFooter";

function LedgerSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          const phrases = el.querySelectorAll<HTMLElement>(".highlight-phrase");
          phrases.forEach((phrase, i) => {
            setTimeout(() => phrase.classList.add("revealed"), 250 + i * 280);
          });
          observer.unobserve(el);
        }
      },
      { rootMargin: "-80px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="ledger-row"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "36px",
        paddingTop: "52px",
        paddingBottom: "52px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "14.5px",
          fontWeight: 500,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#8e8e93",
          paddingTop: "4px",
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 650ms cubic-bezier(0.16, 1, 0.3, 1), transform 650ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontFamily: "Switzer, -apple-system, sans-serif",
          fontSize: "22px",
          lineHeight: 1.6,
          color: "#ededee",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          letterSpacing: "-0.015em",
          maxWidth: "680px",
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 750ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 750ms cubic-bezier(0.16, 1, 0.3, 1) 100ms",
        }}
      >
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        background: "#9be5fb",
        color: "#ffffff",
      }}
    >
      <style>{`
        .ledger-row {
          grid-template-columns: 240px 1fr !important;
        }
        @media (max-width: 860px) {
          .ledger-row {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            padding-top: 36px !important;
            padding-bottom: 36px !important;
          }
        }
        .highlight-phrase {
          position: relative;
          display: inline;
        }
        .highlight-phrase::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -3px;
          height: 2px;
          background: rgba(155, 229, 251, 0.45);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 1400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 1400ms ease-out;
          opacity: 0;
          pointer-events: none;
        }
        .highlight-phrase.revealed::after {
          transform: scaleX(1);
          opacity: 1;
        }
      `}</style>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "#0d0d0f",
          borderBottomLeftRadius: "36px",
          borderBottomRightRadius: "36px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
        }}
      >
        <DockNavbar onOpenSearch={() => setCommandPaletteOpen(true)} />

        <main
          style={{
            width: "100%",
            maxWidth: "920px",
            marginLeft: "auto",
            marginRight: "auto",
            paddingTop: "220px",
            paddingBottom: "180px",
            paddingLeft: "36px",
            paddingRight: "36px",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <header
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              marginBottom: "72px",
            }}
          >
            <h1
              style={{
                fontFamily: "Ranade, -apple-system, sans-serif",
                fontSize: "48px",
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "-0.035em",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Terms of Service
            </h1>
            <p
              style={{
                fontFamily: "Switzer, -apple-system, sans-serif",
                fontSize: "16px",
                color: "#71717a",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Last updated August 2026
            </p>
          </header>

          {/* Overview & Acceptance */}
          <LedgerSection label="Acceptance">
            <p style={{ margin: 0 }}>
              Abyss is a <span className="highlight-phrase">free, open-source component library</span> engineered for creative developers. By accessing the website, importing packages, or incorporating component code into your projects, you agree to be bound by these terms.
            </p>
          </LedgerSection>

          {/* MIT License & Commercial Rights */}
          <LedgerSection label="License & Usage">
            <p style={{ margin: 0 }}>
              All Abyss components, shader modules, and animation hooks are <span className="highlight-phrase">released under the MIT License</span>. You are <span className="highlight-phrase">free to use them in personal and commercial projects</span> with full rights to modify and adapt the code to your specifications.
            </p>
            <p style={{ margin: 0, color: "#a1a1aa" }}>
              The complete license terms are maintained within our public repository on GitHub.
            </p>
          </LedgerSection>

          {/* Commercial Products & Client Work */}
          <LedgerSection label="Commercial Work">
            <p style={{ margin: 0 }}>
              Using Abyss to <span className="highlight-phrase">craft bespoke client websites</span>, portfolio showcases, commercial SaaS applications, or interactive agency work is fully authorized and encouraged.
            </p>
            <p style={{ margin: 0, color: "#a1a1aa" }}>
              There are <span className="highlight-phrase">no royalty fees or commercial licensing fees</span> required to ship client software with Abyss.
            </p>
          </LedgerSection>

          {/* Prohibited Use / Reselling Restrictions */}
          <LedgerSection label="Restrictions">
            <p style={{ margin: 0 }}>
              You may <span className="highlight-phrase">not resell or redistribute Abyss components</span> as a standalone paid UI kit, template marketplace pack, or competing component repository.
            </p>
            <p style={{ margin: 0, color: "#a1a1aa" }}>
              Claiming the core library architecture or shaders as an original proprietary creation without preserving appropriate copyright notices is strictly prohibited.
            </p>
          </LedgerSection>

          {/* Attribution */}
          <LedgerSection label="Attribution">
            <p style={{ margin: 0 }}>
              If you build with Abyss, <span className="highlight-phrase">a mention in your README</span>, documentation, or credits page is always appreciated. It helps others across the creative developer community discover the project.
            </p>
            <p style={{ margin: 0, color: "#a1a1aa" }}>
              <span className="highlight-phrase">Attribution is voluntary</span>, and you are never required to display visible badges, watermarks, or links within your product&apos;s live user interface.
            </p>
          </LedgerSection>

          {/* Demo Media & Assets */}
          <LedgerSection label="Demo Media">
            <p style={{ margin: 0 }}>
              Components ship with <span className="highlight-phrase">curated images, video loops, and shader presets</span> to showcase motion mechanics and tactile interactions in the browser.
            </p>
            <p style={{ margin: 0, color: "#a1a1aa" }}>
              These demo assets are intended for prototyping. For production deployments, you are expected to <span className="highlight-phrase">replace demo media with your own branded assets</span> to tailor each interaction to your project.
            </p>
          </LedgerSection>

          {/* Lifecycle & Versioning */}
          <LedgerSection label="Component Lifecycle">
            <p style={{ margin: 0 }}>
              As our library evolves, components may be added, enhanced, or refactored. If your production product depends on a specific component version, we recommend <span className="highlight-phrase">pinning to a version</span> or maintaining a local copy in your repository.
            </p>
          </LedgerSection>

          {/* Disclaimer & Community */}
          <LedgerSection label="Disclaimer & Contact">
            <p style={{ margin: 0 }}>
              Abyss is <span className="highlight-phrase">provided &ldquo;as is&rdquo;</span>, without warranty of any kind. The maintainers shall not be liable for any claims or issues arising from integration.
            </p>
            <p style={{ margin: 0, color: "#a1a1aa" }}>
              For questions, feedback, or contribution discussions, <span className="highlight-phrase">connect with us directly on our GitHub repository</span>.
            </p>
          </LedgerSection>
        </main>
      </div>

      <SiteFooter />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        components={SEARCH_INDEX}
      />
    </div>
  );
}
