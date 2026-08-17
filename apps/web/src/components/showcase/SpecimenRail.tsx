"use client";

import React, { useRef, useState } from "react";
import { Code, Sliders } from "lucide-react";

interface SpecimenRailProps {
  currentSlug?: string;
  infoOpen: boolean;
  onToggleInfo: () => void;
  codeOpen: boolean;
  onToggleCode: () => void;
  controlsOpen: boolean;
  onToggleControls: () => void;
}

export function SpecimenRail({
  currentSlug,
  infoOpen,
  onToggleInfo,
  codeOpen,
  onToggleCode,
  controlsOpen,
  onToggleControls,
}: SpecimenRailProps) {
  const railRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rail = railRef.current;
    if (!rail) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const rect = rail.getBoundingClientRect();
    const initialLeft = rect.left;
    const initialTop = rect.top;
    let isDragging = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (Math.hypot(deltaX, deltaY) > 4) {
        isDragging = true;
      }

      if (isDragging) {
        const newLeft = Math.max(12, Math.min(window.innerWidth - rail.offsetWidth - 12, initialLeft + deltaX));
        const newTop = Math.max(12, Math.min(window.innerHeight - rail.offsetHeight - 12, initialTop + deltaY));
        setPosition({ x: newLeft, y: newTop });
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleToggleFullscreen = () => {
    if (currentSlug) {
      window.open(`/preview/${currentSlug}`, "_blank");
    } else if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const dynamicStyle: React.CSSProperties = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        bottom: "auto",
        right: "auto",
        transform: "none",
        cursor: "grab",
      }
    : {
        cursor: "grab",
      };

  return (
    <nav
      ref={railRef}
      className="specimen-rail"
      aria-label="Specimen Controls"
      onMouseDown={handleMouseDown}
      style={dynamicStyle}
    >
      {/* 1. Info Ledger Toggle */}
      <button
        type="button"
        className={`rail-keycap ${infoOpen ? "active" : ""}`}
        onClick={onToggleInfo}
        title={infoOpen ? "Close Information Ledger" : "Open Information Ledger"}
        aria-label="Component Information"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>

      {/* 2. Code Ledger Toggle */}
      <button
        type="button"
        className={`rail-keycap ${codeOpen ? "active" : ""}`}
        onClick={onToggleCode}
        title={codeOpen ? "Close Code Ledger" : "Open Code & Usage Ledger"}
        aria-label="Component Code"
      >
        <Code size={19} strokeWidth={2.2} />
      </button>

      {/* 3. Fullscreen / Isolate Toggle */}
      <button
        type="button"
        className="rail-keycap"
        onClick={handleToggleFullscreen}
        title="Open Fullscreen Isolated Specimen (New Tab)"
        aria-label="Toggle Fullscreen"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      </button>

      <div className="rail-separator" aria-hidden="true" />

      {/* 4. Controls Drawer Toggle */}
      <button
        type="button"
        className={`rail-keycap ${controlsOpen ? "active" : ""}`}
        onClick={onToggleControls}
        title={controlsOpen ? "Close Parameters (P)" : "Open Parameters (P)"}
        aria-label="Component Parameters"
      >
        <Sliders size={19} strokeWidth={2.2} />
      </button>
    </nav>
  );
}
