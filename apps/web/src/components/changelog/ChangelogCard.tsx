"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github, ArrowRight } from "lucide-react";
import { CommitEntry } from "@/lib/data/changelog-data";
import { COMPONENT_DETAILS } from "@/lib/registry";

interface ChangelogCardProps {
  entry: CommitEntry;
}

export function getEntryTags(entry: CommitEntry): string[] {
  if (entry.tags && entry.tags.length > 0) return entry.tags;
  if (entry.tag) return [entry.tag];
  return ["ADDITION"];
}

export function getTagBadgeStyle(tag: string): string {
  switch (tag) {
    case "MAJOR": return "text-[#7dd3fc] bg-[#0c4a6e]/20 border border-[#075985]/30";
    case "ADDITION": return "text-[#6ee7b7] bg-[#064e3b]/20 border border-[#065f46]/30";
    case "FIX": return "text-[#fde047] bg-[#713f12]/20 border border-[#854d0e]/30";
    case "REMOVAL": return "text-[#fda4af] bg-[#881337]/20 border border-[#9f1239]/30";
    default: return "text-[#a1a1aa] bg-[#27272a]/40 border border-[#3f3f46]/30";
  }
}

export function ChangelogCard({ entry }: ChangelogCardProps) {
  const tags = getEntryTags(entry);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="p-5 md:p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#0d0d10] hover:border-[rgba(255,255,255,0.12)] transition-colors duration-200 space-y-4"
    >
      {/* Top Header: Date, Multi-Tags Badges, and optional Commit Hash Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Date Display */}
          <span className="font-mono text-[#71717a] font-medium tracking-tight">
            {entry.displayDate.split(" • ")[0]}
          </span>

          {/* Optional IST time sub-label */}
          {entry.displayDate.includes(" • ") && (
            <span className="text-[#3f3f46] hidden sm:inline select-none">•</span>
          )}
          {entry.displayDate.includes(" • ") && (
            <span className="font-mono text-[#52525b] hidden sm:inline">
              {entry.displayDate.split(" • ")[1]}
            </span>
          )}

          {/* Multi-Tags Badges */}
          <div className="flex items-center gap-1.5 ml-1">
            {tags.map((t) => (
              <span
                key={t}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase ${getTagBadgeStyle(
                  t
                )}`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Commit Hash Github Link */}
        {entry.commitHash && (
          <a
            href={`https://github.com/Abyss-UI/Abyss/commit/${entry.commitHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-[11px] text-[#71717a] hover:text-white transition-colors duration-150 group"
          >
            <Github className="w-3 h-3 text-[#52525b] group-hover:text-white transition-colors" />
            <span>{entry.commitHash}</span>
          </a>
        )}
      </div>

      {/* Title & 1-Sentence Summary */}
      <div className="space-y-2">
        <h2 className="text-base md:text-lg font-bold text-white tracking-tight leading-snug font-['Ranade',sans-serif]">
          {entry.title}
        </h2>
        <p className="text-[#8e8e93] text-xs leading-relaxed font-['Switzer',sans-serif]">
          {entry.summary}
        </p>

        {/* Component Launcher Link Pills Below Summary */}
        {entry.affectedSlugs && entry.affectedSlugs.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {entry.affectedSlugs.map((slug) => (
              <Link
                key={slug}
                href={`/showcase/${slug}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#0a0a0c] hover:bg-[#141418] text-xs font-mono font-medium text-[#d4d4d8] hover:text-[#9be5fb] transition-[color,background-color,transform] duration-150 ease-out cursor-pointer group active:scale-[0.98]"
              >
                <span>{COMPONENT_DETAILS[slug]?.label || slug}</span>
                <ArrowRight className="w-3 h-3 text-[#71717a] group-hover:text-[#9be5fb] group-hover:translate-x-0.5 transition-[color,transform] duration-150 ease-out" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Clean Updates List with Generous Spacing and Legible Text */}
      {entry.items && entry.items.length > 0 && (
        <div className="pt-3.5 border-t border-[rgba(255,255,255,0.04)] space-y-3">
          {entry.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 text-[13px] md:text-sm text-[#d4d4d8] leading-relaxed font-['Switzer',sans-serif]"
            >
              <span className="text-[#55555c] select-none shrink-0 font-mono text-xs mt-0.5">
                —
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </motion.article>
  );
}
