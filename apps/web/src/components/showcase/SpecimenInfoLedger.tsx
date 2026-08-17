"use client";

import React from "react";
import { X, Layers, Cpu, Compass } from "lucide-react";
import { ComponentDetail } from "@/lib/registry";
import { useSmoothScroll } from "@/lib/useSmoothScroll";

interface SpecimenInfoLedgerProps {
  component: ComponentDetail;
  isOpen: boolean;
  onClose: () => void;
}

export function SpecimenInfoLedger({
  component,
  isOpen,
  onClose,
}: SpecimenInfoLedgerProps) {
  const bodyRef = useSmoothScroll<HTMLDivElement>();

  if (!component) return null;

  return (
    <aside
      className={`specimen-ledger ${isOpen ? "open" : ""}`}
      aria-label="Component Information"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        type="button"
        className="ledger-close-btn"
        onClick={onClose}
        title="Close Panel (ESC)"
        aria-label="Close Info Panel"
      >
        <X size={15} />
      </button>

      {/* Scrollable Content Body */}
      <div ref={bodyRef} className="ledger-body">
        {/* Section 1: Overview */}
        <div className="ledger-section">
          <span className="section-tag">OVERVIEW</span>
          <h2 className="ledger-title">{component.label}</h2>
          <p className="ledger-desc">
            {component.desc ||
              "Interactive physics-driven specimen rendering responsive visual dynamics and real-time GPU shaders."}
          </p>
        </div>

        {/* Section 2: Tech & Dependencies */}
        <div className="ledger-section">
          <span className="section-tag">TECH & DEPENDENCIES</span>
          <div className="tech-pill-group">
            <div className="tech-pill-dark">
              <Layers size={15} />
              <span>React 18+ / Next.js</span>
            </div>
            <div className="tech-pill-dark">
              <Cpu size={15} />
              <span>Three.js / WebGL</span>
            </div>
            <div className="tech-pill-dark">
              <Compass size={15} />
              <span>GSAP ScrollTrigger</span>
            </div>
            {component.tags?.map((tag) => (
              <div key={tag} className="tech-pill-dark">
                <span>• {tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Application & Use Cases */}
        <div className="ledger-section">
          <span className="section-tag">APPLICATION & USE CASES</span>
          <p className="ledger-desc">
            Designed for high-impact hero viewports, editorial showcases, interactive product galleries, and atmospheric landing page sections.
          </p>
        </div>

        {/* Section 4: Properties & Controls */}
        {component.controls && component.controls.length > 0 && (
          <div className="ledger-section">
            <span className="section-tag">PROPERTIES</span>
            <div className="ledger-props-table">
              {component.controls.map((ctrl, idx) => (
                <div key={`${ctrl.key}-${ctrl.label}-${idx}`} className="ledger-prop-row">
                  <span className="ledger-prop-name">
                    {ctrl.label} ({ctrl.key})
                  </span>
                  <span className="ledger-prop-desc">
                    Type: {ctrl.type} • Default: {String(ctrl.default)} {ctrl.unit || ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 5: Engineering Notes */}
        <div className="ledger-section">
          <span className="section-tag">ENGINEERING NOTES</span>
          <p className="ledger-desc" style={{ fontSize: "14px", lineHeight: "1.8" }}>
            • GPU-accelerated frame interpolation with delta-time correction.<br />
            • 60 FPS target performance profile on mid-range hardware.<br />
            • Automatic context loss recovery and memory disposal on unmount.
          </p>
        </div>

        {/* Section 6: License & Usage */}
        <div className="ledger-section" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px" }}>
          <span className="section-tag">LICENSE & USAGE</span>
          <p className="ledger-desc" style={{ fontSize: "14px", lineHeight: "1.7", color: "var(--text-muted)" }}>
            Released under MIT License for open-source and commercial use in modern web applications.
          </p>
        </div>
      </div>
    </aside>
  );
}
