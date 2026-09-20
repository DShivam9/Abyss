"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Check, ArrowUp } from "lucide-react";
import { ComponentDetail } from "@/lib/registry";
import { useSmoothScroll } from "@/lib/hooks/useSmoothScroll";

interface SpecimenCodeLedgerProps {
  component: ComponentDetail;
  isOpen: boolean;
  onClose: () => void;
}

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

// ponytail: right-click drag-to-pan for wide code blocks without scrollbars
function DraggableCodeArea({
  children,
  className = "code-container",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isDraggingRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const startScrollLeftRef = React.useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 2) {
      e.preventDefault();
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      if (containerRef.current) {
        startScrollLeftRef.current = containerRef.current.scrollLeft;
      }
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    }
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const deltaX = e.clientX - startXRef.current;
      containerRef.current.scrollLeft = startScrollLeftRef.current - deltaX;
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onWheel={handleWheel}
    >
      {children}
    </div>
  );
}

export function SpecimenCodeLedger({
  component,
  isOpen,
  onClose,
}: SpecimenCodeLedgerProps) {
  const [pkgManager, setPkgManager] = useState<PackageManager>("npm");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [glslSource, setGlslSource] = useState<string | null>(null);
  const [glslHtml, setGlslHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const bodyRef = useSmoothScroll<HTMLDivElement>();

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    const onScroll = () => {
      setShowScrollTop(el.scrollTop > 180);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [bodyRef]);

  // ponytail: native element.scrollTo with smooth behavior replaces custom anim loop
  const handleScrollToTop = () => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
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

  // Reset source when component changes
  useEffect(() => {
    setSource(null);
    setHtml(null);
    setGlslSource(null);
    setGlslHtml(null);
  }, [component?.slug]);

  // Dynamically load component source on drawer open
  useEffect(() => {
    if (!isOpen || !component?.slug || source) return;
    setLoading(true);
    import(`@/lib/registry/sources/${component.slug}`)
      .then((mod) => {
        setSource(mod.source || "// Source not available");
        setHtml(mod.html || null);
        setGlslSource(mod.glslSource || null);
        setGlslHtml(mod.glslHtml || null);
      })
      .catch(() => {
        setSource("// Source not available");
        setHtml(null);
        setGlslSource(null);
        setGlslHtml(null);
      })
      .finally(() => setLoading(false));
  }, [isOpen, component?.slug, source]);

  if (!component) return null;

  const installCommands: Record<PackageManager, string> = {
    npm: `npm install @abyss-ui/core`,
    pnpm: `pnpm add @abyss-ui/core`,
    yarn: `yarn add @abyss-ui/core`,
    bun: `bun add @abyss-ui/core`,
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <aside
      className={`specimen-ledger ${isOpen ? "open" : ""}`}
      aria-label="Component Code and Integration"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        type="button"
        className="ledger-close-btn"
        onClick={onClose}
        title="Close Panel (ESC)"
        aria-label="Close Code Panel"
      >
        <X size={15} />
      </button>

      {/* Scrollable Content Body */}
      <div ref={bodyRef} className="ledger-body">
        {/* Section 1: Installation */}
        <div className="ledger-section">
          <span className="section-tag">INSTALLATION</span>
          <div className="pkg-tabs">
            {(["npm", "pnpm", "yarn", "bun"] as PackageManager[]).map((mgr) => (
              <button
                key={mgr}
                type="button"
                className={`pkg-tab ${pkgManager === mgr ? "active" : ""}`}
                onClick={() => setPkgManager(mgr)}
              >
                {mgr}
              </button>
            ))}
          </div>
          <div className="code-install-box">
            {/* ponytail: 28-char install string needs no drag panning */}
            <div className="code-install-content">
              <pre className="code-pre">
                <code>{installCommands[pkgManager]}</code>
              </pre>
            </div>
            <button
              type="button"
              className={`code-copy-text-btn ${copiedId === "install" ? "copied" : ""}`}
              onClick={() => handleCopy(installCommands[pkgManager], "install")}
              title="Copy Command"
              aria-label="Copy Command"
            >
              {copiedId === "install" ? (
                <Check size={15} strokeWidth={2.2} className="copy-icon-check" />
              ) : (
                <Copy size={15} strokeWidth={2} className="copy-icon-copy" />
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Source Code */}
        <div className="ledger-section">
          <div className="ledger-section-header-row">
            <span className="section-tag">SOURCE CODE</span>
            <button
              type="button"
              className={`code-copy-text-btn ${copiedId === "source" ? "copied" : ""}`}
              onClick={() => source && handleCopy(source, "source")}
              title="Copy Source Code"
              aria-label="Copy Source Code"
            >
              {copiedId === "source" ? (
                <Check size={15} strokeWidth={2.2} className="copy-icon-check" />
              ) : (
                <Copy size={15} strokeWidth={2} className="copy-icon-copy" />
              )}
            </button>
          </div>
          <DraggableCodeArea className="code-container">
            {loading ? (
              <p className="ledger-desc">Loading source...</p>
            ) : html ? (
              <div
                className="code-shiki-block"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <pre className="code-pre">
                <code>{source || ""}</code>
              </pre>
            )}
          </DraggableCodeArea>
        </div>

        {/* Section 3: Shaders (GLSL) if present */}
        {glslSource && (
          <div className="ledger-section">
            <div className="ledger-section-header-row">
              <span className="section-tag">SHADERS (GLSL)</span>
              <button
                type="button"
                className={`code-copy-text-btn ${copiedId === "glsl" ? "copied" : ""}`}
                onClick={() => handleCopy(glslSource, "glsl")}
                title="Copy GLSL Code"
                aria-label="Copy GLSL Code"
              >
                {copiedId === "glsl" ? (
                  <Check size={15} strokeWidth={2.2} className="copy-icon-check" />
                ) : (
                  <Copy size={15} strokeWidth={2} className="copy-icon-copy" />
                )}
              </button>
            </div>
            <DraggableCodeArea className="code-container">
              {glslHtml ? (
                <div
                  className="code-shiki-block"
                  dangerouslySetInnerHTML={{ __html: glslHtml }}
                />
              ) : (
                <pre className="code-pre">
                  <code>{glslSource}</code>
                </pre>
              )}
            </DraggableCodeArea>
          </div>
        )}
      </div>

      {/* Traversal Smooth Scroll-To-Top Button */}
      <button
        type="button"
        className={`ledger-scroll-top-btn ${showScrollTop ? "visible" : ""}`}
        onClick={handleScrollToTop}
        title="Scroll to top"
        aria-label="Scroll to top"
      >
        <span className="scroll-top-arrow-slot" aria-hidden="true">
          <span className="scroll-top-arrow-roller">
            <ArrowUp size={13} strokeWidth={2.2} />
            <ArrowUp size={13} strokeWidth={2.2} />
          </span>
        </span>
        <span>TOP</span>
      </button>
    </aside>
  );
}


