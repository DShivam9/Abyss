"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { COMPONENT_DETAILS, VIBE_SECTIONS } from "@/lib/registry";
import { DockNavbar } from "@/components/shared/DockNavbar";
import { SectionHeader } from "@/components/collection/SectionHeader";
import { CollectionCard } from "@/components/collection/CollectionCard";
import { BottomControlPill } from "@/components/collection/BottomControlPill";
import { CommandPalette } from "@/components/catalog/CommandPalette";

const ALL_COMPONENTS = Object.values(COMPONENT_DETAILS);

function CollectionContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<"curated" | "asc" | "desc">("curated");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Set tab title
  useEffect(() => {
    document.title = "Collection ✶ Abyss";
  }, []);

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
      c.tags?.some((t) => t.toLowerCase().includes(query))
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

  return (
    <div className="min-h-screen w-full bg-[#0d0d0f] text-white">
      {/* Floating Dock Navbar */}
      <DockNavbar onOpenSearch={() => setCommandPaletteOpen(true)} />

      {/* Main Collection Container */}
      <main className="collection-container" id="mainContainer">
        <AnimatePresence mode="wait">
          {!hasResults ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="no-results-box"
            >
              No specimens found matching your search.
            </motion.div>
          ) : sortMode !== "curated" || (query && curatedChapters.length === 0) ? (
            /* Alphabetical / Search Flat Grid */
            <motion.section
              key={`flat-${sortMode}-${query}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="vibe-section"
            >
              <SectionHeader
                title={sortMode === "desc" ? "All Components (Z → A)" : "All Components"}
                count={sortedAllComponents.length}
                headlineClass="headline-s1"
              />
              <div className="card-grid">
                {sortedAllComponents.map((comp) => (
                  <CollectionCard
                    key={comp.slug}
                    slug={comp.slug}
                    title={comp.label}
                    filename={comp.filename}
                  />
                ))}
              </div>
            </motion.section>
          ) : (
            /* Curated Vibe Chapters */
            <motion.div
              key="curated"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              {curatedChapters.map((section, idx) => (
                <motion.section
                  key={section.id}
                  className="vibe-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: idx * 0.03,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <SectionHeader
                    title={section.title}
                    count={section.items.length}
                    headlineClass={section.headlineClass}
                  />
                  <div className="card-grid">
                    {section.items.map((comp) => (
                      <CollectionCard
                        key={comp.slug}
                        slug={comp.slug}
                        title={comp.label}
                        filename={comp.filename}
                      />
                    ))}
                  </div>
                </motion.section>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Control Pill */}
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
        components={ALL_COMPONENTS}
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
