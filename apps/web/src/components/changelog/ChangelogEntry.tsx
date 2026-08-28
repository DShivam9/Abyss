"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github, ArrowUpRight } from "lucide-react";
import { CommitEntry } from "@/lib/data/changelog-data";
import { COMPONENT_DETAILS } from "@/lib/registry";

interface ChangelogEntryProps {
  entry: CommitEntry;
}

export function getEntryTags(entry: CommitEntry): string[] {
  if (entry.tags && entry.tags.length > 0) return entry.tags;
  if (entry.tag) return [entry.tag];
  return ["ADDITION"];
}

function formatTagLabel(tag: string): { label: string; isMajor: boolean } {
  switch (tag) {
    case "MAJOR":
      return { label: "MAJOR", isMajor: true };
    case "ADDITION":
    case "ADD":
      return { label: "ADD", isMajor: false };
    case "FIX":
      return { label: "FIX", isMajor: false };
    case "REMOVAL":
    case "REM":
      return { label: "REM", isMajor: false };
    default:
      return { label: tag, isMajor: false };
  }
}

export function ChangelogEntry({ entry }: ChangelogEntryProps) {
  const tags = getEntryTags(entry);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="changelog-entry-row"
      style={{
        display: "grid",
        gridTemplateColumns: "170px 1fr",
        gap: "36px",
        paddingTop: "40px",
        paddingBottom: "40px",
      }}
    >
      {/* Left Column: Date & Metadata */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          paddingTop: "2px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "14px",
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: "-0.01em",
          }}
        >
          {entry.displayDate.split(" • ")[0]}
        </span>

        {/* Tags Stack */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {tags.map((t) => {
            const { label, isMajor } = formatTagLabel(t);
            return (
              <span
                key={t}
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: isMajor ? "#9be5fb" : "#8e8e93",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
            );
          })}
        </div>

        {/* Commit Hash Link */}
        {entry.commitHash && (
          <a
            href={`https://github.com/Abyss-UI/Abyss/commit/${entry.commitHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "11.5px",
              color: "#52525b",
              textDecoration: "none",
              transition: "color 150ms ease",
              marginTop: "2px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
          >
            <Github className="w-3 h-3 text-[#52525b]" />
            <span>{entry.commitHash}</span>
          </a>
        )}
      </div>

      {/* Right Column: Title, Summary, Bullets, and Launchers */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          maxWidth: "700px",
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontFamily: "Ranade, -apple-system, sans-serif",
            fontSize: "22px",
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {entry.title}
        </h2>

        {/* Summary */}
        <p
          style={{
            fontFamily: "Switzer, -apple-system, sans-serif",
            fontSize: "15.5px",
            lineHeight: 1.65,
            color: "#a1a1aa",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {entry.summary}
        </p>

        {/* Bullet Items */}
        {entry.items && entry.items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "4px" }}>
            {entry.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  fontFamily: "Switzer, -apple-system, sans-serif",
                  fontSize: "14.5px",
                  lineHeight: 1.6,
                  color: "#d4d4d8",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  letterSpacing: "-0.01em",
                }}
              >
                <span
                  style={{
                    color: "#52525b",
                    flexShrink: 0,
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "13px",
                    marginTop: "1px",
                  }}
                >
                  —
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Component Launcher Hyperlinks */}
        {entry.affectedSlugs && entry.affectedSlugs.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", paddingTop: "6px" }}>
            {entry.affectedSlugs.map((slug) => (
              <Link
                key={slug}
                href={`/showcase/${slug}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "13px",
                  fontWeight: 450,
                  color: "#9be5fb",
                  position: "relative",
                  paddingBottom: "3px",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget;
                  const line = target.querySelector<HTMLElement>(".link-underline");
                  if (line) line.style.transform = "scaleX(1)";
                  const arrow = target.querySelector<HTMLElement>(".link-arrow");
                  if (arrow) arrow.style.transform = "translate(2.5px, -2.5px)";
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget;
                  const line = target.querySelector<HTMLElement>(".link-underline");
                  if (line) line.style.transform = "scaleX(0)";
                  const arrow = target.querySelector<HTMLElement>(".link-arrow");
                  if (arrow) arrow.style.transform = "translate(0, 0)";
                }}
              >
                <span>{COMPONENT_DETAILS[slug]?.label || slug}</span>
                <span
                  className="link-arrow"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    transform: "translate(0, 0)",
                    transition: "transform 250ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#9be5fb] shrink-0" />
                </span>

                {/* Ink-Draw Underline */}
                <span
                  className="link-underline"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "1.5px",
                    background: "#9be5fb",
                    borderRadius: "1px",
                    transform: "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                    pointerEvents: "none",
                  }}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
