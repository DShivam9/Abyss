"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { CHANGELOG_DATA, CommitEntry } from "@/lib/changelog-data";
import { COMPONENT_DETAILS } from "@/lib/registry";
import { DockNavbar } from "@/components/shared/DockNavbar";
import { CommandPalette } from "@/components/catalog/CommandPalette";
import { DocsFooter } from "@/components/docs/DocsFooter";
import { ChangelogHeader } from "@/components/changelog/ChangelogHeader";
import { ScrollToTopButton } from "@/components/changelog/ScrollToTopButton";
import { ChangelogCard, getEntryTags } from "@/components/changelog/ChangelogCard";
import { ChangelogFinaleHorizon } from "@/components/changelog/ChangelogFinaleHorizon";
import {
  ChangelogControlConsole,
  TagFilter,
} from "@/components/changelog/ChangelogControlConsole";

const ALL_COMPONENTS = Object.values(COMPONENT_DETAILS);

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

  useEffect(() => {
    document.title = "Changelog — Abyss";
  }, []);

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

          {/* Grouped Month Feed — 2-Column Responsive CSS Masonry Grid */}
          <section className="space-y-12">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-16 px-6 bg-[#101013] border border-[rgba(255,255,255,0.05)] rounded-2xl space-y-4">
                <Sparkles className="w-8 h-8 text-[#55555c] mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-medium text-white font-['Ranade',sans-serif]">
                    No release entries found
                  </h3>
                  <p className="text-xs text-[#8e8e93]">
                    No log updates match your active search and filter combinations.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-1.5 rounded-lg bg-[#18181c] border border-[rgba(255,255,255,0.08)] text-xs font-mono text-white hover:text-[#9be5fb] transition-colors cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              groupedByMonth.map((group) => (
                <div
                  key={group.month}
                  id={`month-section-${group.month.replace(/\s+/g, "-")}`}
                  className="space-y-4 scroll-mt-28"
                >
                  {/* Month Milestone Separator */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="font-mono text-xs uppercase tracking-widest text-[#8e8e93] font-semibold bg-[#101013] px-3 py-1 rounded-md border border-[rgba(255,255,255,0.05)]">
                      {group.month}
                    </div>
                    <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
                    <span className="font-mono text-[11px] text-[#55555c]">
                      {group.entries.length}{" "}
                      {group.entries.length === 1 ? "release" : "releases"}
                    </span>
                  </div>

                  {/* CSS Masonry Columns */}
                  <div className="columns-1 md:columns-2 gap-4.5 space-y-4.5 [column-fill:_balance]">
                    {group.entries.map((entry) => (
                      <ChangelogCard key={entry.id} entry={entry} />
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
      <DocsFooter activePage="/changelog" />

      {/* Universal Search Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        components={ALL_COMPONENTS}
      />
    </div>
  );
}
