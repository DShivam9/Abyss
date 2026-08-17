"use client";

import React, { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { ComponentDetail } from "@/lib/registry";
import { useSmoothScroll } from "@/lib/useSmoothScroll";

interface SpecimenCodeLedgerProps {
  component: ComponentDetail;
  isOpen: boolean;
  onClose: () => void;
}

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export function SpecimenCodeLedger({
  component,
  isOpen,
  onClose,
}: SpecimenCodeLedgerProps) {
  const [pkgManager, setPkgManager] = useState<PackageManager>("npm");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bodyRef = useSmoothScroll<HTMLDivElement>();

  if (!component) return null;

  const componentExportName = component.label
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

  const installCommands: Record<PackageManager, string> = {
    npm: `npm install @abyss-ui/core`,
    pnpm: `pnpm add @abyss-ui/core`,
    yarn: `yarn add @abyss-ui/core`,
    bun: `bun add @abyss-ui/core`,
  };

  const usageSnippet = `import { ${componentExportName} } from "@abyss-ui/core";

export default function MyView() {
  return (
    <div className="w-full h-screen">
      <${componentExportName}
        imageSrc="/images/hero.webp"
      />
    </div>
  );
}`;

  const controlledSnippet = `<${componentExportName}
  imageSrc="/images/hero.webp"
  className="w-full h-full"
  style={{ borderRadius: "14px" }}
/>`;

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
          <div className="code-card">
            <button
              type="button"
              className={`code-copy-btn ${copiedId === "install" ? "copied" : ""}`}
              onClick={() => handleCopy(installCommands[pkgManager], "install")}
              title="Copy Command"
              aria-label="Copy Command"
            >
              {copiedId === "install" ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <pre className="code-pre">
              <code>{installCommands[pkgManager]}</code>
            </pre>
          </div>
        </div>

        {/* Section 2: Basic Usage */}
        <div className="ledger-section">
          <span className="section-tag">BASIC USAGE</span>
          <div className="code-card">
            <button
              type="button"
              className={`code-copy-btn ${copiedId === "usage" ? "copied" : ""}`}
              onClick={() => handleCopy(usageSnippet, "usage")}
              title="Copy Snippet"
              aria-label="Copy Usage Snippet"
            >
              {copiedId === "usage" ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <pre className="code-pre">
              <code>{usageSnippet}</code>
            </pre>
          </div>
        </div>

        {/* Section 3: Controlled Props */}
        <div className="ledger-section">
          <span className="section-tag">CONTROLLED PROPERTIES</span>
          <div className="code-card">
            <button
              type="button"
              className={`code-copy-btn ${copiedId === "controlled" ? "copied" : ""}`}
              onClick={() => handleCopy(controlledSnippet, "controlled")}
              title="Copy Props Snippet"
              aria-label="Copy Props Snippet"
            >
              {copiedId === "controlled" ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <pre className="code-pre">
              <code>{controlledSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </aside>
  );
}
