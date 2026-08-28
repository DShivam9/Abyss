"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { DockNavbar } from "@/components/layout/DockNavbar";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { SEARCH_INDEX } from "@/lib/registry";
import { NotFoundCanvas } from "./NotFoundCanvas";
import styles from "./not-found.module.css";

export function NotFoundView() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  // Lock document title on mount & Command palette keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const applyTitle = () => {
      document.title = "404 — Page Not Found ✶ Abyss";
    };
    applyTitle();
    const t1 = setTimeout(applyTitle, 50);
    const t2 = setTimeout(applyTitle, 250);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      data-lenis-prevent
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--bg, #0d0d0f)", color: "var(--text-primary, #ffffff)" }}
    >
      {/* Floating Global Dock Navigation */}
      <div ref={navRef} className={styles.navWrapper}>
        <DockNavbar onOpenSearch={() => setCommandPaletteOpen(true)} />
      </div>

      {/* WebGL Three.js Ambient Fluid + 3D Liquid Chrome Star */}
      <NotFoundCanvas
        navRef={navRef}
        titleRef={titleRef}
        descRef={descRef}
        actionsRef={actionsRef}
        anchorRef={anchorRef}
      />

      {/* Central Editorial Hero */}
      <main className={styles.heroContent}>
        <h1 ref={titleRef} className={styles.heroTitle}>
          404
        </h1>

        <p ref={descRef} className={styles.heroDesc}>
          Are you lost, or did you just want to see what our 404 looks like?
        </p>

        <div ref={actionsRef} className={styles.heroActions}>
          <Link href="/collection" className={styles.linkBtn}>
            <span>Return to Collection</span>
            <span className={styles.arrow}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </span>
            <span className={styles.line} />
          </Link>

          <Link href="/docs" className={styles.linkBtnSecondary}>
            <span>Docs</span>
            <span className={styles.arrow}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </span>
            <span className={styles.line} />
          </Link>
        </div>

        {/* Spatial DOM Anchor for 3D Star Precision Alignment */}
        <div ref={anchorRef} className={styles.logo3dAnchor} />
      </main>

      {/* Interactive Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        components={SEARCH_INDEX}
      />
    </div>
  );
}
