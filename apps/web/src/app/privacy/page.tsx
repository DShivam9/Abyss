"use client";

import React, { useEffect, useRef, useState } from "react";
import { DockNavbar } from "@/components/layout/DockNavbar";
import { ProgressiveEdgeBlur } from "@/components/layout/ProgressiveEdgeBlur";
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

export default function PrivacyPage() {
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

        {/* Liquid Caustic Top Edge Vignette */}
        <ProgressiveEdgeBlur position="top" variant="liquid" height={210} zIndex={150} />

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
              Privacy Policy
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

          {/* Overview */}
          <LedgerSection label="Overview">
            <p style={{ margin: 0 }}>
              Abyss is an open-source React component library created for creative developers and digital studios. We hold a <span className="highlight-phrase">strict privacy-first standard</span> across everything we publish.
            </p>
            <p style={{ margin: 0, color: "#a1a1aa" }}>
              The short version: <span className="highlight-phrase">we collect very little data</span>, we never sell anything, and there are no ads or individual user tracking mechanisms embedded anywhere.
            </p>
          </LedgerSection>

          {/* Website Telemetry */}
          <LedgerSection label="Website Visits">
            <p style={{ margin: 0 }}>
              When you browse our showcase, documentation, or interactive galleries, our servers record <span className="highlight-phrase">minimal aggregate telemetry</span> to ensure reliability and measure general interest.
            </p>
            <p style={{ margin: 0, color: "#a1a1aa" }}>
              This includes total page views, broad country-level geography, device categories, and referring websites. We collect <span className="highlight-phrase">no personal identity markers</span> or exact IP addresses.
            </p>
          </LedgerSection>

          {/* Component Privacy */}
          <LedgerSection label="Library Code">
            <p style={{ margin: 0 }}>
              When you copy, install, or import Abyss components into your React applications, all component logic, physics loops, and shader pipelines <span className="highlight-phrase">run entirely in your browser</span>.
            </p>
            <p style={{ margin: 0, color: "#a1a1aa" }}>
              No runtime telemetry, usage pings, or phone-home requests are made from the component library back to our servers. There is <span className="highlight-phrase">no telemetry in our source code</span>.
            </p>
          </LedgerSection>

          {/* Cookies & Storage */}
          <LedgerSection label="Cookies & Storage">
            <p style={{ margin: 0 }}>
              The website may store <span className="highlight-phrase">essential local preferences</span> or minimal analytics tokens to distinguish unique sessions and preserve user interface settings.
            </p>
            <p style={{ margin: 0, color: "#a1a1aa" }}>
              We <span className="highlight-phrase">don&apos;t use advertising cookies</span> or third-party marketing trackers. You can disable all cookies in your browser settings with zero disruption to the website experience.
            </p>
          </LedgerSection>

          {/* External Assets */}
          <LedgerSection label="External Delivery">
            <p style={{ margin: 0 }}>
              To ensure lightning-fast performance, the website delivers typefaces, media assets, and scripts through <span className="highlight-phrase">global content delivery networks</span> and edge hosting providers.
            </p>
            <p style={{ margin: 0, color: "#a1a1aa" }}>
              These infrastructure partners process standard network headers to deliver web files in accordance with their respective <span className="highlight-phrase">security and privacy standards</span>.
            </p>
          </LedgerSection>

          {/* Open Source Guarantee */}
          <LedgerSection label="Open Source">
            <p style={{ margin: 0 }}>
              The entire Abyss codebase is <span className="highlight-phrase">publicly accessible on GitHub</span> for transparency and inspection. You are welcome to audit our implementation directly.
            </p>
            <p style={{ margin: 0, color: "#a1a1aa" }}>
              There is <span className="highlight-phrase">no hidden data collection</span>, background listener, or covert logging within any published package or component file.
            </p>
          </LedgerSection>

          {/* Data Retention */}
          <LedgerSection label="Data Retention">
            <p style={{ margin: 0 }}>
              Aggregate traffic metrics are <span className="highlight-phrase">periodically rolled up and purged</span>. Because we do not maintain personal accounts, user profiles, or contact databases, there is <span className="highlight-phrase">no personal database to manage</span> or store.
            </p>
          </LedgerSection>

          {/* Updates & Contact */}
          <LedgerSection label="Updates & Contact">
            <p style={{ margin: 0 }}>
              If we introduce new features or meaningful updates to our data handling practices, the date at the top of this page will be <span className="highlight-phrase">revised accordingly</span>.
            </p>
            <p style={{ margin: 0, color: "#a1a1aa" }}>
              For any questions, discussions, or inquiries regarding privacy, please connect with the maintainers directly through our <span className="highlight-phrase">public GitHub repository</span>.
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
