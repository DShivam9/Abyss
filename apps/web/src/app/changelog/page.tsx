"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { CHANGELOG_DATA, CommitEntry } from "@/lib/data/changelog-data";
import { SEARCH_INDEX } from "@/lib/registry";
import { DockNavbar } from "@/components/layout/DockNavbar";
import { ProgressiveEdgeBlur } from "@/components/layout/ProgressiveEdgeBlur";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ChangelogHeader } from "@/components/changelog/ChangelogHeader";
import { ScrollToTopButton } from "@/components/changelog/ScrollToTopButton";
import { ChangelogEntry, getEntryTags } from "@/components/changelog/ChangelogEntry";
import { ChangelogFinaleHorizon } from "@/components/changelog/ChangelogFinaleHorizon";
import {
  ChangelogControlConsole,
  TagFilter,
} from "@/components/changelog/ChangelogControlConsole";

function getMonthYear(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Recent Updates";
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function ChangelogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<TagFilter>("ALL");
  const [componentFilter, setComponentFilter] = useState<string>("ALL");
  const [monthFilter, setMonthFilter] = useState<string>("ALL");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global Cmd+K shortcut for Universal Search Command Palette
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

  // Calculate component frequency
  const componentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CHANGELOG_DATA.forEach((entry) => {
      entry.affectedSlugs?.forEach((slug) => {
        counts[slug] = (counts[slug] || 0) + 1;
      });
    });
    return counts;
  }, []);

  const availableComponents = useMemo(() => {
    return Object.keys(componentCounts).sort();
  }, [componentCounts]);

  // Extract unique months
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    CHANGELOG_DATA.forEach((entry) => {
      months.add(getMonthYear(entry.date));
    });
    return Array.from(months);
  }, []);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return CHANGELOG_DATA.filter((entry) => {
      // 1. Tag filter
      if (tagFilter !== "ALL") {
        const entryTags = getEntryTags(entry);
        if (!entryTags.includes(tagFilter)) return false;
      }

      // 2. Component filter
      if (componentFilter !== "ALL") {
        if (!entry.affectedSlugs?.includes(componentFilter)) return false;
      }

      // 3. Month filter
      if (monthFilter !== "ALL") {
        if (getMonthYear(entry.date) !== monthFilter) return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = entry.title.toLowerCase().includes(query);
        const matchesSummary = entry.summary.toLowerCase().includes(query);
        const matchesItems = entry.items.some((item) =>
          item.toLowerCase().includes(query)
        );
        const matchesSlug = entry.affectedSlugs?.some((s) =>
          s.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesSummary && !matchesItems && !matchesSlug) {
          return false;
        }
      }

      return true;
    });
  }, [tagFilter, componentFilter, monthFilter, searchQuery]);

  // Group filtered entries by Month
  const groupedByMonth = useMemo(() => {
    const groups: { month: string; entries: CommitEntry[] }[] = [];
    filteredEntries.forEach((entry) => {
      const month = getMonthYear(entry.date);
      const existing = groups.find((g) => g.month === month);
      if (existing) {
        existing.entries.push(entry);
      } else {
        groups.push({ month, entries: [entry] });
      }
    });
    return groups;
  }, [filteredEntries]);

  const hasActiveFilters =
    tagFilter !== "ALL" ||
    componentFilter !== "ALL" ||
    monthFilter !== "ALL" ||
    searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setTagFilter("ALL");
    setComponentFilter("ALL");
    setMonthFilter("ALL");
    setSearchQuery("");
  };

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
        @media (max-width: 768px) {
          .changelog-entry-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding-top: 28px !important;
            padding-bottom: 28px !important;
          }
        }
      `}</style>

      {/* Foreground Main Sheet with Rounded Bottom Corners */}
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
        {/* Universal Floating Dock Navbar with Search Command Trigger */}
        <DockNavbar onOpenSearch={() => setCommandPaletteOpen(true)} />

        {/* Liquid Caustic Top Edge Vignette */}
        <ProgressiveEdgeBlur position="top" variant="liquid" height={210} zIndex={150} />

        {/* Main Page Container */}
        <main className="max-w-5xl mx-auto px-6 lg:px-8 pt-28 md:pt-36 pb-12 space-y-10">
          {/* Header Area */}
          <ChangelogHeader totalCount={CHANGELOG_DATA.length} />

          {/* Unified Control Console Bar */}
          <ChangelogControlConsole
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            tagFilter={tagFilter}
            onTagFilterChange={setTagFilter}
            monthFilter={monthFilter}
            onMonthFilterChange={setMonthFilter}
            componentFilter={componentFilter}
            onComponentFilterChange={setComponentFilter}
            availableMonths={availableMonths}
            availableComponents={availableComponents}
            componentCounts={componentCounts}
            filteredCount={filteredEntries.length}
            totalCount={CHANGELOG_DATA.length}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
          />

          {/* Grouped Month Feed — Flat Git-Log Timeline */}
          <section className="space-y-16">
            {filteredEntries.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "90px 24px",
                  gap: "16px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "Ranade, -apple-system, sans-serif",
                    fontSize: "26px",
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "-0.02em",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  Looked everywhere. Checked under the rug too. Nothing.
                </h3>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "transparent",
                    border: "none",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "13px",
                    fontWeight: 450,
                    color: "#9be5fb",
                    borderBottom: "1px solid rgba(155, 229, 251, 0.45)",
                    paddingBottom: "2px",
                    cursor: "pointer",
                    transition: "border-color 150ms ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = "#9be5fb")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = "rgba(155, 229, 251, 0.45)")}
                >
                  <span>Clear filters and try again</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#9be5fb] shrink-0" />
                </button>
              </div>
            ) : (
              groupedByMonth.map((group) => (
                <div
                  key={group.month}
                  id={`month-section-${group.month.replace(/\s+/g, "-")}`}
                  className="space-y-6 scroll-mt-28"
                >
                  {/* Month Milestone Separator */}
                  <div className="flex items-center justify-between pb-2">
                    <span
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "13px",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "#8e8e93",
                        fontWeight: 600,
                      }}
                    >
                      {group.month}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "12px",
                        color: "#52525b",
                      }}
                    >
                      {group.entries.length}{" "}
                      {group.entries.length === 1 ? "release" : "releases"}
                    </span>
                  </div>

                  {/* Single-Column Flat Git-Log List */}
                  <div>
                    {group.entries.map((entry) => (
                      <ChangelogEntry key={entry.id} entry={entry} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Horizon Laser Finale with Centerpiece 3D Star Logo */}
          <ChangelogFinaleHorizon />
        </main>

        {/* Floating "Go to Top" Button */}
        <ScrollToTopButton />
      </div>

      {/* Sticky Reveal Curtain Footer on Solid Ice Blue Background */}
      <SiteFooter activePage="/changelog" />

      {/* Universal Search Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        components={SEARCH_INDEX}
      />
    </div>
  );
}
