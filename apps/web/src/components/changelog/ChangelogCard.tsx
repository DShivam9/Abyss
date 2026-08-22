"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github, ArrowRight } from "lucide-react";
import { CommitEntry } from "@/lib/changelog-data";

interface ChangelogCardProps {
  entry: CommitEntry;
}

export function getEntryTags(entry: CommitEntry): string[] {
  if (entry.tags && entry.tags.length > 0) return entry.tags;
  if (entry.tag) return [entry.tag];
  return ["ADDITION"];
}

export function ChangelogCard({ entry }: ChangelogCardProps) {
  const tags = getEntryTags(entry);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="break-inside-avoid bg-[#101013] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] rounded-2xl p-5 md:p-6 transition-[border-color,background-color] space-y-4 mb-4.5 will-change-[transform,opacity]"
    >
      {/* Top Header Row: Date & Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[rgba(255,255,255,0.04)] font-mono text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[#8e8e93] font-medium tracking-wide">
            {entry.displayDate.split("•")[0].trim()}
          </span>
          <span className="text-[#333338] select-none">•</span>
          {tags.map((t) => (
            <span
              key={t}
              className={`inline-block px-2 py-0.5 rounded-md bg-[#0a0a0c] border border-[rgba(255,255,255,0.05)] text-[10px] uppercase font-bold tracking-widest ${
                t === "MAJOR"
                  ? "text-[#7dd3fc]"
                  : t === "ADDITION"
                  ? "text-[#6ee7b7]"
                  : t === "FIX"
                  ? "text-[#fde047]"
                  : t === "REMOVAL"
                  ? "text-[#fda4af]"
                  : "text-[#a1a1aa]"
              }`}
            >
              {t}
            </span>
          ))}
          {entry.breaking && (
            <span className="inline-block px-2 py-0.5 rounded-md bg-red-950/20 border border-red-900/30 text-[#fda4af] text-[10px] uppercase font-bold tracking-widest">
              BREAKING
            </span>
          )}
        </div>

        {/* Clean GitHub Icon Button */}
        <a
          href={
            entry.commitHash
              ? `https://github.com/DShivam9/Abyss/commit/${entry.commitHash}`
              : "https://github.com/DShivam9/Abyss"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.05)] text-[#71717a] hover:text-white hover:bg-[#141418] transition-colors flex items-center justify-center group"
          title={
            entry.commitHash
              ? `View Commit ${entry.commitHash} on GitHub`
              : "View Abyss Repository on GitHub"
          }
        >
          <Github className="w-3.5 h-3.5 group-hover:text-white transition-colors" />
        </a>
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
                <span>{slug}</span>
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
