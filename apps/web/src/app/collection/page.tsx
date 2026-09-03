"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { COMPONENT_DETAILS, VIBE_SECTIONS, SEARCH_INDEX } from "@/lib/registry";
import { DockNavbar } from "@/components/layout/DockNavbar";
import { ProgressiveEdgeBlur } from "@/components/layout/ProgressiveEdgeBlur";
import { SectionHeader } from "@/components/collection/SectionHeader";
import { CollectionCard } from "@/components/collection/CollectionCard";
import { BottomControlPill } from "@/components/collection/BottomControlPill";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CollectionFinaleHorizon } from "@/components/collection/CollectionFinaleHorizon";
import "@/components/collection/collection.css";

const ALL_COMPONENTS = Object.values(COMPONENT_DETAILS);

function CollectionContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<"curated" | "asc" | "desc">("curated");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Command palette keyboard shortcut (Cmd+K)
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

  const handleToggleSort = () => {
    setSortMode((prev) => {
      if (prev === "curated") return "asc";
      if (prev === "asc") return "desc";
      return "curated";
    });
  };

  // Trigger Lenis scroll recalculation on filter/search changes
  useEffect(() => {
    const lenis = (window as unknown as { lenis?: { resize: () => void } }).lenis;
    if (lenis) {
      const timer = setTimeout(() => {
        lenis.resize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [sortMode, searchQuery]);

  // Filtered components based on search query
  const query = searchQuery.trim().toLowerCase();

  // Alphabetical / flat list
  const sortedAllComponents = useMemo(() => {
    const list = [...ALL_COMPONENTS];
    if (sortMode === "asc") {
      list.sort((a, b) => a.label.localeCompare(b.label));
    } else if (sortMode === "desc") {
      list.sort((a, b) => b.label.localeCompare(a.label));
    }
    if (!query) return list;
    return list.filter((c) =>
      c.label.toLowerCase().includes(query) ||
      c.desc?.toLowerCase().includes(query) ||
      c.category?.toLowerCase().includes(query) ||
      c.tags?.some((t: string) => t.toLowerCase().includes(query))
    );
  }, [sortMode, query]);

  // Curated chapters with search filter
  const curatedChapters = useMemo(() => {
    return VIBE_SECTIONS.map((section) => {
      const items = section.slugs
        .map((slug) => COMPONENT_DETAILS[slug])
        .filter(Boolean)
        .filter((c) => {
          if (!query) return true;
          return (
            c.label.toLowerCase().includes(query) ||
            c.desc?.toLowerCase().includes(query) ||
            c.category?.toLowerCase().includes(query) ||
            c.tags?.some((t) => t.toLowerCase().includes(query))
          );
        });
      return {
        ...section,
        items,
      };
    }).filter((section) => section.items.length > 0);
  }, [query]);

  const hasResults =
    sortMode !== "curated" || query
      ? sortedAllComponents.length > 0
      : curatedChapters.length > 0;

  const showCurtainFooter = !query;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        background: showCurtainFooter ? "#9be5fb" : "#0d0d0f",
        color: "#ffffff",
      }}
    >
      {/* Foreground Main Sheet with Rounded Bottom Corners */}
      <div
        id="mainSheet"
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          background: "#0d0d0f",
          borderBottomLeftRadius: showCurtainFooter ? "36px" : "0px",
          borderBottomRightRadius: showCurtainFooter ? "36px" : "0px",
          borderBottom: showCurtainFooter
            ? "1px solid rgba(255, 255, 255, 0.06)"
            : "none",
          boxShadow: showCurtainFooter
            ? "0 20px 40px -10px rgba(0, 0, 0, 0.35)"
            : "none",
          overflow: "hidden",
        }}
      >
        {/* Floating Top Dock Navbar (Foreground z-1000) */}
        <DockNavbar onOpenSearch={() => setCommandPaletteOpen(true)} />

        {/* Reusable Liquid Caustic Edge Vignette (Fixed behind DockNavbar at z-150) */}
        <ProgressiveEdgeBlur position="top" variant="liquid" height={210} zIndex={150} />

        {/* Main Collection Container */}
        <main className="collection-container" id="main-content">
          {!hasResults ? (
            <div
              style={{
                minHeight: "calc(100vh - 220px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "20px 24px 80px 24px",
                gap: "20px",
              }}
            >
              <h3
                style={{
                  fontFamily: "Ranade, -apple-system, sans-serif",
                  fontSize: "30px",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                  margin: 0,
                  lineHeight: 1.35,
                  maxWidth: "620px",
                }}
              >
                Component not found. We probably need a coffee before building that.
              </h3>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "transparent",
                  border: "none",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "13.5px",
                  fontWeight: 450,
                  color: "#9be5fb",
                  position: "relative",
                  paddingBottom: "3px",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  const line = e.currentTarget.querySelector<HTMLElement>(".reset-line");
                  if (line) line.style.transform = "scaleX(1)";
                  const arrow = e.currentTarget.querySelector<HTMLElement>(".reset-arrow");
                  if (arrow) arrow.style.transform = "translate(2px, -2px)";
                }}
                onMouseLeave={(e) => {
                  const line = e.currentTarget.querySelector<HTMLElement>(".reset-line");
                  if (line) line.style.transform = "scaleX(0)";
                  const arrow = e.currentTarget.querySelector<HTMLElement>(".reset-arrow");
                  if (arrow) arrow.style.transform = "translate(0, 0)";
                }}
              >
                <span>Reset search</span>
                <span
                  className="reset-arrow"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    transform: "translate(0, 0)",
                    transition: "transform 200ms ease",
                  }}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#9be5fb] shrink-0" />
                </span>
                <span
                  className="reset-line"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "1.5px",
                    background: "#9be5fb",
                    borderRadius: "1px",
                    transform: "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
                    pointerEvents: "none",
                  }}
                />
              </button>
            </div>
          ) : sortMode !== "curated" || (query && curatedChapters.length === 0) ? (
            /* Alphabetical / Search Flat Grid */
            <section key={`flat-${sortMode}-${query}`} className="vibe-section">
              <SectionHeader
                title={sortMode === "desc" ? "All Components (Z → A)" : "All Components"}
                count={sortedAllComponents.length}
                headlineClass="headline-s1"
              />
              <div className="card-grid">
                {sortedAllComponents.map((comp, idx) => (
                  <CollectionCard
                    key={comp.slug}
                    slug={comp.slug}
                    title={comp.label}
                    filename={comp.filename}
                    priority={idx < 6}
                  />
                ))}
              </div>
            </section>
          ) : (
            /* Curated Vibe Chapters */
            <div>
              {curatedChapters.map((section, sIdx) => (
                <section key={section.id} className="vibe-section">
                  <SectionHeader
                    title={section.title}
                    count={section.items.length}
                    headlineClass={section.headlineClass}
                  />
                  <div className="card-grid">
                    {section.items.map((comp, cIdx) => (
                      <CollectionCard
                        key={comp.slug}
                        slug={comp.slug}
                        title={comp.label}
                        filename={comp.filename}
                        priority={sIdx === 0 && cIdx < 6}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Collection Finale Horizon Poster (shown only on full catalog view) */}
          {showCurtainFooter && <CollectionFinaleHorizon />}
        </main>
      </div>

      {/* Sticky Reveal Curtain Footer (shown only on full catalog view) */}
      {showCurtainFooter && <SiteFooter activePage="/collection" />}

      {/* Floating Bottom Control Pill with Dynamic Sheet Tracking */}
      <BottomControlPill
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortMode={sortMode}
        onToggleSort={handleToggleSort}
      />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        components={SEARCH_INDEX}
        onSelectComponent={() => {}}
      />
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0d0f]" />}>
      <CollectionContent />
    </Suspense>
  );
}
