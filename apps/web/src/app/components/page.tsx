"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { COMPONENT_DETAILS, ComponentDetail } from "@/lib/component-registry";
import { Sidebar } from "@/components/catalog/Sidebar";
import { ComponentPreview } from "@/components/catalog/ComponentPreview";
import { CommandPalette } from "@/components/catalog/CommandPalette";

const CATEGORIES = [
  { id: "scroll", label: "Scroll", color: "#dfb15b" },
  { id: "image", label: "Image", color: "#e05b5b" },
  { id: "geometry", label: "Geometry", color: "#9c8cb9" },
  { id: "gallary", label: "Gallery", color: "#c4719d" },
  { id: "hybrid", label: "Hybrid", color: "#5b9cdf" },
  { id: "transition", label: "Transition", color: "#6ec49a" },
  { id: "text", label: "Text", color: "#e88034" },
];

const ALL_COMPONENTS = Object.values(COMPONENT_DETAILS);

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get("slug") || searchParams.get("select");
  const initialTab = searchParams.get("tab");

  // Determine starting component
  const defaultSlug = useMemo(() => {
    if (initialSlug && COMPONENT_DETAILS[initialSlug]) {
      return initialSlug;
    }
    if (initialTab) {
      const firstInTab = ALL_COMPONENTS.find((c) => c.category === initialTab);
      if (firstInTab) return firstInTab.slug;
    }
    return ALL_COMPONENTS[0]?.slug || "japparii";
  }, [initialSlug, initialTab]);

  const [selectedSlug, setSelectedSlug] = useState<string>(defaultSlug);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Group components by category
  const categoryGroups = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      ...cat,
      components: ALL_COMPONENTS.filter((c) => c.category === cat.id),
    }));
  }, []);

  // Selected component object
  const activeComponent = useMemo(() => {
    return COMPONENT_DETAILS[selectedSlug] || ALL_COMPONENTS[0];
  }, [selectedSlug]);

  // Flat list navigation (Next/Previous)
  const currentIndex = ALL_COMPONENTS.findIndex((c) => c.slug === selectedSlug);
  const prevComponent = currentIndex > 0 ? ALL_COMPONENTS[currentIndex - 1] : null;
  const nextComponent = currentIndex < ALL_COMPONENTS.length - 1 ? ALL_COMPONENTS[currentIndex + 1] : null;

  // Active category color
  const activeCategoryColor = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.id === activeComponent?.category);
    return cat?.color || "#5b9cdf";
  }, [activeComponent]);

  // Command palette keyboard shortcut (Cmd+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#0A0A0A] font-sans antialiased overflow-hidden">
      
      {/* Left Sidebar (Dark Canvas #0A0A0A) */}
      <Sidebar
        categories={categoryGroups}
        selectedSlug={selectedSlug}
        onSelectComponent={setSelectedSlug}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenSearch={() => setCommandPaletteOpen(true)}
      />

      {/* Main Content Area (White Canvas #FFFFFF) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
        
        {/* Mobile Navigation Header Bar */}
        <header className="lg:hidden flex h-14 items-center justify-between px-4 bg-[#0A0A0A] text-white border-b border-neutral-800 shrink-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Components</span>
          </button>

          <span className="text-xs font-mono text-neutral-400">
            {ALL_COMPONENTS.length} Total
          </span>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
            title="Search (⌘K)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </header>

        {/* Selected Component Preview Content */}
        {activeComponent ? (
          <ComponentPreview
            component={activeComponent}
            prevComponent={prevComponent}
            nextComponent={nextComponent}
            onSelectComponent={setSelectedSlug}
            categoryColor={activeCategoryColor}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-400 font-sans text-sm">
            Select a component from the sidebar.
          </div>
        )}
      </div>

      {/* Cmd+K Search Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        components={ALL_COMPONENTS}
        onSelectComponent={setSelectedSlug}
      />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] font-sans text-sm text-neutral-400">
          Loading components...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
