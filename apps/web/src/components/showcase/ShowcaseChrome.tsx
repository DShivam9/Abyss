"use client";

import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { ComponentDetail } from "@/lib/registry";
import { RulerDrawer } from "./RulerDrawer";
import { SpecimenRail } from "./SpecimenRail";
import { SpecimenInfoLedger } from "./SpecimenInfoLedger";
import { SpecimenCodeLedger } from "./SpecimenCodeLedger";

interface ShowcaseChromeProps {
  component: ComponentDetail;
  children: React.ReactNode;
  onToggleControls?: () => void;
  controlsOpen?: boolean;
}

export function ShowcaseChrome({
  component,
  children,
  onToggleControls,
  controlsOpen = false,
}: ShowcaseChromeProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  // Sync drawer class to body for smooth prototype transition
  useEffect(() => {
    if (drawerOpen) {
      document.body.classList.add("ruler-drawer-open");
    } else {
      document.body.classList.remove("ruler-drawer-open");
    }
    return () => {
      document.body.classList.remove("ruler-drawer-open");
    };
  }, [drawerOpen]);

  // ESC to close drawer and ledgers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (drawerOpen) setDrawerOpen(false);
        if (infoOpen) setInfoOpen(false);
        if (codeOpen) setCodeOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen, infoOpen, codeOpen]);

  const handleToggleInfo = () => {
    setInfoOpen((prev) => {
      if (!prev) setCodeOpen(false);
      return !prev;
    });
  };

  const handleToggleCode = () => {
    setCodeOpen((prev) => {
      if (!prev) setInfoOpen(false);
      return !prev;
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0d0d0f]">
      {/* Top-Left Keycap Menu Button */}
      <div className="top-left-menu">
        <button
          type="button"
          className="keycap-symbol"
          onClick={() => setDrawerOpen((prev) => !prev)}
          title={drawerOpen ? "Close Navigator (ESC)" : "Open Component Navigator"}
          aria-label="Component Navigator"
        >
          <span className="icon-bar" />
          <span className="icon-bar" />
          <span className="icon-bar" />
        </button>
      </div>

      {/* Chameleon Ruler Drawer Navigator */}
      <RulerDrawer
        currentSlug={component?.slug || ""}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Main Specimen Viewport */}
      <div className="w-full h-full relative z-0">
        {children}
      </div>

      {/* Floating Bottom Specimen Rail Dock */}
      <SpecimenRail
        currentSlug={component?.slug || ""}
        infoOpen={infoOpen}
        onToggleInfo={handleToggleInfo}
        codeOpen={codeOpen}
        onToggleCode={handleToggleCode}
        controlsOpen={controlsOpen}
        onToggleControls={() => onToggleControls?.()}
      />

      {/* Right Slide-out Info Ledger */}
      <SpecimenInfoLedger
        component={component}
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
      />

      {/* Right Slide-out Code Ledger */}
      <SpecimenCodeLedger
        component={component}
        isOpen={codeOpen}
        onClose={() => setCodeOpen(false)}
      />
    </div>
  );
}
