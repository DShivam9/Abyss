"use client";

import React from "react";
import { X, Code2 } from "lucide-react";
import { ComponentDetail } from "@/lib/registry";
import { useSmoothScroll } from "@/lib/hooks/useSmoothScroll";

interface SpecimenInfoLedgerProps {
  component: ComponentDetail;
  isOpen: boolean;
  onClose: () => void;
  onOpenCode?: () => void;
}

function GeometricPlus({ size = 10 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="currentColor"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path d="M4 1h2v8H4zM1 4h8v2H1z" />
    </svg>
  );
}

const TECH_LOGO_MAP: Record<string, { label: string; iconSrc: string }> = {
  react: { label: "React", iconSrc: "/icons/tech/react.svg" },
  "react 18+ / next.js": { label: "React / Next.js", iconSrc: "/icons/tech/react.svg" },
  "next.js": { label: "Next.js", iconSrc: "/icons/tech/react.svg" },
  "three.js": { label: "Three.js", iconSrc: "/icons/tech/threejs.svg" },
  threejs: { label: "Three.js", iconSrc: "/icons/tech/threejs.svg" },
  "three.js / webgl": { label: "Three.js / WebGL", iconSrc: "/icons/tech/threejs.svg" },
  webgl: { label: "WebGL / GLSL", iconSrc: "/icons/tech/webgl.svg" },
  "webgl / glsl": { label: "WebGL / GLSL", iconSrc: "/icons/tech/webgl.svg" },
  "framer motion": { label: "Framer Motion", iconSrc: "/icons/tech/framer-motion.svg" },
  "framer-motion": { label: "Framer Motion", iconSrc: "/icons/tech/framer-motion.svg" },
  motion: { label: "Motion", iconSrc: "/icons/tech/framer-motion.svg" },
  gsap: { label: "GSAP", iconSrc: "/icons/tech/gsap.svg" },
  "gsap scrolltrigger": { label: "GSAP", iconSrc: "/icons/tech/gsap.svg" },
  lenis: { label: "Lenis", iconSrc: "/icons/tech/lenis.svg" },
  typescript: { label: "TypeScript", iconSrc: "/icons/tech/typescript.svg" },
  "tailwind css": { label: "Tailwind CSS", iconSrc: "/icons/tech/tailwind-css.svg" },
  "anime.js": { label: "Anime.js", iconSrc: "/icons/tech/animedotjs.svg" },
  animejs: { label: "Anime.js", iconSrc: "/icons/tech/animedotjs.svg" },
  "canvas 2d": { label: "Canvas 2D", iconSrc: "/icons/tech/html5.svg" },
  canvas: { label: "Canvas 2D", iconSrc: "/icons/tech/html5.svg" },
  html5: { label: "HTML5", iconSrc: "/icons/tech/html5.svg" },
  "html5 (dom / css)": { label: "HTML5 (DOM / CSS)", iconSrc: "/icons/tech/html5.svg" },
  "web audio api": { label: "Web Audio API", iconSrc: "/icons/tech/html5.svg" },
};

export function SpecimenInfoLedger({
  component,
  isOpen,
  onClose,
  onOpenCode,
}: SpecimenInfoLedgerProps) {
  const bodyRef = useSmoothScroll<HTMLDivElement>();

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!component) return null;

  // Resolve tech stack items with logos
  const techItems = (component.techStack && component.techStack.length > 0)
    ? component.techStack.map((tech) => {
        const lower = tech.toLowerCase().trim();
        const found = TECH_LOGO_MAP[lower];
        return found || { label: tech, iconSrc: "/icons/tech/html5.svg" };
      })
    : [
        { label: "React / Next.js", iconSrc: "/icons/tech/react.svg" },
        { label: "Three.js / WebGL", iconSrc: "/icons/tech/threejs.svg" },
        { label: "GSAP", iconSrc: "/icons/tech/gsap.svg" },
      ];

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
            {component.overview ||
              component.desc ||
              "Interactive physics-driven specimen rendering responsive visual dynamics and real-time GPU shaders."}
          </p>
        </div>

        {/* Section 2: Tech & Dependencies */}
        <div className="ledger-section">
          <span className="section-tag">TECH & DEPENDENCIES</span>
          <div className="tech-pill-group">
            {techItems.map((tech) => (
              <div key={tech.label} className="tech-pill-dark">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tech.iconSrc}
                  alt={tech.label}
                  style={{
                    width: "19px",
                    height: "19px",
                    objectFit: "contain",
                    opacity: 0.85,
                  }}
                />
                <span>{tech.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Section 3: Where to Use */}
        <div className="ledger-section">
          <span className="section-tag">WHERE TO USE</span>
          {component.useCases && component.useCases.length > 0 ? (
            <ul className="ledger-list">
              {component.useCases.map((useCase, idx) => {
                let text = "";
                if (typeof useCase === "object" && useCase !== null) {
                  const uc = useCase as { title?: string; desc?: string };
                  text = uc.title && uc.desc ? `${uc.title}: ${uc.desc}` : uc.desc || uc.title || "";
                } else if (typeof useCase === "string") {
                  text = useCase;
                }

                return (
                  <li key={idx} className="ledger-list-item">
                    <span className="ledger-list-bullet">
                      <GeometricPlus size={10} />
                    </span>
                    <span>{text}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="ledger-desc">
              Portfolios, case studies, and creative photography galleries.
            </p>
          )}
        </div>

        {/* Section 4: Properties & Controls */}
        {component.controls && component.controls.length > 0 && (
          <div className="ledger-section">
            <div className="ledger-props-table">
              <div className="ledger-props-header">
                <span className="props-col-header">PROPS</span>
                <span className="props-col-header">DESCRIPTION</span>
              </div>
              {component.controls.map((ctrl, idx) => (
                <div key={`${ctrl.key}-${ctrl.label}-${idx}`} className="ledger-prop-row">
                  <div className="ledger-prop-col">
                    <code className="ledger-prop-pill">{ctrl.key}</code>
                  </div>
                  <div className="ledger-prop-desc-col">
                    <p className="ledger-prop-text">
                      {ctrl.description || ctrl.desc || `Controls the ${ctrl.label.toLowerCase()} parameter.`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source Code */}
        {onOpenCode && (
          <div className="ledger-section">
            <span className="section-tag">SOURCE CODE</span>
            <p className="ledger-desc">
              Click{" "}
              <button
                type="button"
                className="ledger-code-icon-btn"
                onClick={onOpenCode}
                title="Open Source Code (C)"
                aria-label="Open Source Code"
              >
                <Code2 size={16} strokeWidth={2} />
              </button>{" "}
              to inspect and copy the component source code.
            </p>
          </div>
        )}

        {/* Section: Notes */}
        <div className="ledger-section">
          <span className="section-tag">NOTES</span>
          {component.engineeringNotes && component.engineeringNotes.length > 0 ? (
            <ul className="ledger-list">
              {component.engineeringNotes.map((note, idx) => (
                <li key={idx} className="ledger-list-item">
                  <span className="ledger-list-bullet">
                    <GeometricPlus size={10} />
                  </span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ledger-desc">
              Frame-rate independent animation loop with delta-time correction. Verified 60fps performance profile and automatic memory disposal on unmount.
            </p>
          )}
        </div>

        {/* Section 6: Our Approach */}
        <div className="ledger-section">
          <span className="section-tag">OUR APPROACH</span>
          <p className="ledger-desc">
            We take creative interactions we spot across the web, break them down, and rebuild them with our own spin. The goal is to experiment with different ways of building things and make components that feel great to use.
          </p>
        </div>

        {/* Section 7: Let Us Know */}
        <div className="ledger-section">
          <span className="section-tag">LET US KNOW</span>
          <p className="ledger-desc">
            Spotted a bug, have an idea, or want to contribute? Open an issue or start a discussion on our GitHub repository. We&apos;d love to hear from you.
          </p>
        </div>

        {/* Section 8: Usage & Attribution */}
        <div className="ledger-section">
          <span className="section-tag">USAGE & ATTRIBUTION</span>
          <p className="ledger-desc">
            Everything here is free to customize and ship in your commercial work or personal projects. You never have to credit us, but if you build something you&apos;re proud of, a shout-out or link back to Abyss goes a long way.
          </p>
        </div>
      </div>
    </aside>
  );
}
