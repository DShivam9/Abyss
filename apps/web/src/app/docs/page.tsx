"use client";

import React, { useEffect, useState } from "react";
import { DockNavbar } from "@/components/shared/DockNavbar";
import { CommandPalette } from "@/components/catalog/CommandPalette";
import { COMPONENT_DETAILS } from "@/lib/registry";
import { DocsSections } from "@/components/docs/DocsSections";
import { DocsFooter } from "@/components/docs/DocsFooter";

const ALL_COMPONENTS = Object.values(COMPONENT_DETAILS);

export default function DocsPage() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    document.title = "Docs ✶ Abyss";
  }, []);

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
        {/* Floating Top Dock Navbar */}
        <DockNavbar onOpenSearch={() => setCommandPaletteOpen(true)} />

        {/* Editorial Content Sections & 3D Logo Finale */}
        <DocsSections />
      </div>

      {/* Sticky Reveal Curtain Footer on Solid Ice Blue Background */}
      <DocsFooter />

      {/* Universal Search Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        components={ALL_COMPONENTS}
      />
    </div>
  );
}
