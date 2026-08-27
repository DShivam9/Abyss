"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";

// Editorial Typographic Bloom & Corner Star Accents (Matches Hand-Drawn Sketch)
export function RollingLink({
  href,
  label,
  isExternal = false,
  isSelected = false,
}: {
  href: string;
  label: string;
  isExternal?: boolean;
  isSelected?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const active = hovered || isSelected;

  return (
    <div style={{ display: "inline-flex", alignItems: "center" }}>
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          fontFamily: "Switzer, -apple-system, sans-serif",
          fontSize: "14.5px",
          color: isSelected ? "#08080a" : hovered ? "#08080a" : "#1e293b",
          fontWeight: isSelected ? 700 : hovered ? 600 : 500,
          letterSpacing: hovered ? "0.03em" : "-0.01em",
          textDecoration: "none",
          display: "inline-block",
          position: "relative",
          cursor: "pointer",
          padding: "1px 0",
          transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Top-Left Corner Star */}
        <span
          style={{
            position: "absolute",
            left: "-13px",
            top: "-4px",
            display: "inline-flex",
            alignItems: "center",
            opacity: active ? 1 : 0,
            transform: active ? "scale(1) rotate(0deg)" : "scale(0.3) rotate(-90deg)",
            transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)",
            color: "#08080a",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          ✶
        </span>

        <span>{label}</span>

        {/* Top-Right Corner Star */}
        <span
          style={{
            position: "absolute",
            right: "-13px",
            top: "-4px",
            display: "inline-flex",
            alignItems: "center",
            opacity: active ? 1 : 0,
            transform: active ? "scale(1) rotate(0deg)" : "scale(0.3) rotate(90deg)",
            transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)",
            color: "#08080a",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          ✶
        </span>
      </a>
    </div>
  );
}

export function SiteFooter({ activePage }: { activePage?: string }) {
  const pathname = usePathname();
  const current = activePage || pathname;

  return (
    <footer
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 1,
        width: "100%",
        background: "#9be5fb",
        paddingLeft: "32px",
        paddingRight: "32px",
        paddingTop: "100px",
        paddingBottom: "160px",
        boxSizing: "border-box",
      }}
    >
      {/* Main Columns Matrix */}
      <div
        style={{
          maxWidth: "920px",
          marginLeft: "auto",
          marginRight: "auto",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
          gap: "36px",
          alignItems: "start",
        }}
      >
        {/* Brand Col */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              fontFamily: "Ranade, -apple-system, sans-serif",
              fontSize: "18px",
              fontWeight: 900,
              color: "#08080a",
              letterSpacing: "-0.01em",
              display: "inline-flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 100 100"
              fill="#08080a"
              style={{ display: "block" }}
            >
              <path
                d="m50 7.5234 2.2461 29.645 5.9648-15.68-5.2891 24.566 0.089844 1.0898 37.09-22.633-27.855 22.355 20.266-5.3906-24.645 10.09 42.133 11.113-39.566-5.5469 21.109 12.812-25.188-11.445 15.898 34.777-19.363-30.055 3.1523 22.242-7.2656-24.844-21.031 32.656 14.41-31.531-16.945 14.586 17.043-19.578-42.254 5.9141 36.457-9.6016-24.191-3.6328 29.801 0.89844-32.168-25.82 28.945 17.656-11.887-17.145 19.934 22.055 0.097656 0.066406z"
                fillRule="evenodd"
              />
            </svg>
            <span>ABYSS</span>
          </div>

          <span
            style={{
              fontFamily: "Switzer, -apple-system, sans-serif",
              fontSize: "13px",
              color: "#1e293b",
              letterSpacing: "-0.01em",
              fontWeight: 500,
            }}
          >
            &copy; 2026 Abyss
          </span>
        </div>

        {/* Col 1: WEBSITE */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#08080a",
            }}
          >
            WEBSITE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            <RollingLink href="/" label="Home" isSelected={current === "/"} />
            <RollingLink href="/collection" label="Collection" isSelected={current === "/collection" || current === "/components"} />
            <RollingLink href="/docs" label="Docs" isSelected={current === "/docs"} />
            <RollingLink href="/changelog" label="Changelog" isSelected={current === "/changelog"} />
          </div>
        </div>

        {/* Col 2: COMMUNITY */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#08080a",
            }}
          >
            COMMUNITY
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            <RollingLink href="https://github.com/DShivam9/Abyss" label="GitHub" isExternal />
            <RollingLink href="https://github.com/DShivam9/Abyss" label="Contribute" isExternal />
          </div>
        </div>

        {/* Col 3: LEGAL & PRIVACY */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#08080a",
            }}
          >
            LEGAL &amp; PRIVACY
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            <RollingLink href="#" label="Privacy Policy" />
            <RollingLink href="#" label="Terms of Service" />
          </div>
        </div>
      </div>
    </footer>
  );
}

// Backward-compatible alias
export { SiteFooter as DocsFooter };
