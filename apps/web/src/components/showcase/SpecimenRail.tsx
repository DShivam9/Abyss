"use client";

import React, { useRef, useState } from "react";
import { FileText, Code2, Scan, SlidersHorizontal } from "lucide-react";

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
        <FileText size={19} strokeWidth={1.75} />
      </button>

      {/* 2. Code Ledger Toggle */}
      <button
        type="button"
        className={`rail-keycap ${codeOpen ? "active" : ""}`}
        onClick={onToggleCode}
        title={codeOpen ? "Close Code Ledger" : "Open Code & Usage Ledger"}
        aria-label="Component Code"
      >
        <Code2 size={19} strokeWidth={1.75} />
      </button>

      {/* 3. Fullscreen / Isolate Toggle */}
      <button
        type="button"
        className="rail-keycap"
        onClick={handleToggleFullscreen}
        title="Open Fullscreen Isolated Specimen (New Tab)"
        aria-label="Toggle Fullscreen"
      >
        <Scan size={19} strokeWidth={1.75} />
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
        <SlidersHorizontal size={19} strokeWidth={1.75} />
      </button>
    </nav>
  );
}
