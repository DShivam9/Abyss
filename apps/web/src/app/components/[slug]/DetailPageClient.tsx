"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getComponent, COMPONENT_DETAILS } from "@/lib/component-registry";
import { CopyButton } from "@/components/ui/copy-button";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  scroll: "#dfb15b",
  image: "#ffffff",
  geometry: "#9c8cb9",
  gallary: "#c4719d",
  hybrid: "#5b9cdf",
  transition: "#6ec49a",
  text: "#e88034",
  "yet-to-work-on": "#555555",
};

function StoryViewer({ content }: { content: string }) {
  if (!content) return null;

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-xs text-neutral-200">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = (key: string) => {
    if (currentList.length > 0) {
      blocks.push(
        <ul key={key} className="space-y-2.5 my-3 pl-1">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-300 leading-relaxed font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-2 shrink-0" />
              <span>{renderFormattedText(item)}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "---") {
      flushList(`list-${idx}`);
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushList(`list-${idx}`);
      if (trimmed.includes("(") && trimmed.includes(")")) return;
      blocks.push(
        <h2 key={idx} className="text-xl font-bold tracking-tight text-white mt-6 mb-3 font-sans">
          {trimmed.replace(/^##\s+/, "")}
        </h2>
      );
    } else if (trimmed.startsWith("### ")) {
      flushList(`list-${idx}`);
      blocks.push(
        <h3 key={idx} className="text-base font-bold tracking-tight text-white mt-5 mb-2 font-sans flex items-center gap-2">
          {trimmed.replace(/^###\s+/, "")}
        </h3>
      );
    } else if (trimmed.startsWith("> ")) {
      flushList(`list-${idx}`);
      blocks.push(
        <blockquote key={idx} className="p-4 my-4 rounded-xl bg-neutral-900/90 border-l-4 border-amber-500 text-sm font-medium text-neutral-200 italic leading-relaxed font-sans shadow-md">
          {renderFormattedText(trimmed.replace(/^>\s+/, ""))}
        </blockquote>
      );
    } else if (trimmed.startsWith("- ")) {
      currentList.push(trimmed.replace(/^-+\s+/, ""));
    } else {
      flushList(`list-${idx}`);
      blocks.push(
        <p key={idx} className="text-sm text-neutral-400 leading-relaxed font-sans my-2">
          {renderFormattedText(trimmed)}
        </p>
      );
    }
  });

  flushList("list-final");

  return <div className="space-y-3">{blocks}</div>;
}

export function DetailPageClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { meta } = getComponent(slug);
  const [activeTab, setActiveTab] = useState<"tsx" | "glsl">("tsx");
  const [tsxCode, setTsxCode] = useState("Loading source...");
  const [glslCode, setGlslCode] = useState("Loading shaders...");
  const [codeExpanded, setCodeExpanded] = useState(false);
  const [storyContent, setStoryContent] = useState<string>("");

  const allSlugs = Object.keys(COMPONENT_DETAILS);
  const currentIndex = allSlugs.indexOf(slug);
  const prevSlug = currentIndex > 0 ? allSlugs[currentIndex - 1] : null;
  const nextSlug = currentIndex < allSlugs.length - 1 ? allSlugs[currentIndex + 1] : null;

  const prevComp = prevSlug ? COMPONENT_DETAILS[prevSlug] : null;
  const nextComp = nextSlug ? COMPONENT_DETAILS[nextSlug] : null;

  useEffect(() => {
    fetch(`/api/source?slug=${slug}&type=tsx`)
      .then((res) => res.json())
      .then((data) => setTsxCode(data.code || "// Source code unavailable"))
      .catch(() => setTsxCode("// Failed to load source code"));

    fetch(`/api/source?slug=${slug}&type=glsl`)
      .then((res) => res.json())
      .then((data) => setGlslCode(data.code || "// Shaders unavailable"))
      .catch(() => setGlslCode("// Failed to load shaders"));

    fetch(`/api/source?slug=${slug}&type=story`)
      .then((res) => (res.ok ? res.text() : ""))
      .then((text) => setStoryContent(text))
      .catch(() => setStoryContent(""));
  }, [slug]);

  if (!meta) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070708] font-sans text-sm text-neutral-400">
        Component Not Found
      </div>
    );
  }

  const categoryColor = CATEGORY_COLORS[meta.category] || "#ffffff";
  const imageSrc = `/images/components images/${meta.filename}`;

  return (
    <div className="min-h-screen w-full bg-[#070708] font-sans antialiased text-white pb-24">
      {/* Header Breadcrumb */}
      <nav className="mx-auto max-w-3xl px-6 pt-10 pb-6">
        <div className="flex items-center space-x-2 font-sans text-sm text-neutral-400">
          <Link href="/components" className="hover:text-white transition-colors">
            Components
          </Link>
          <span>/</span>
          <span className="capitalize" style={{ color: categoryColor }}>
            {meta.category}
          </span>
          <span>/</span>
          <span className="text-white font-medium">{meta.label}</span>
        </div>
      </nav>

      {/* Main Single-Column Dossier */}
      <main className="mx-auto max-w-3xl px-6 flex flex-col space-y-8">
        {/* Static Preview Image */}
        <motion.div
          onClick={() => router.push(`/showcase/${slug}`)}
          className="group relative max-h-[50vh] w-full cursor-pointer overflow-hidden rounded-[6px] border border-neutral-900 bg-[#0d0d0f] p-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative h-[400px] w-full overflow-hidden rounded-[4px]">
            <Image
              src={imageSrc}
              alt={meta.label}
              fill
              className="object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01]"
              unoptimized
            />
          </div>
        </motion.div>

        {/* Component Header Info */}
        <motion.div
          className="flex flex-col space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="font-sans text-sm font-medium capitalize tracking-wide"
            style={{ color: categoryColor }}
          >
            {meta.category}
          </span>

          <h1 className="font-sans text-4xl font-bold tracking-tight text-white md:text-5xl">
            {meta.label}
          </h1>

          <p className="font-sans text-base leading-relaxed text-neutral-400 max-w-prose">
            {meta.desc}
          </p>

          {/* Tags */}
          {meta.tags && meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1 font-sans text-xs font-medium"
                  style={{
                    color: categoryColor,
                    backgroundColor: `${categoryColor}15`,
                    border: `1px solid ${categoryColor}30`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href={`/showcase/${slug}`}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[6px] border border-neutral-800 bg-[#161618] font-sans text-sm font-semibold text-neutral-200 transition-all duration-300 hover:border-white hover:bg-white hover:text-black shadow-lg group"
          >
            <span>Open Showcase</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {/* CLI Installation */}
        <motion.div
          className="flex flex-col space-y-2 rounded-[6px] border border-neutral-900 bg-[#111113] p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="font-sans text-xs font-medium text-neutral-400">
            CLI Installation
          </span>
          <div className="flex items-center justify-between font-mono text-xs text-white">
            <span className="select-all text-neutral-300">
              npx abyss-ui add {meta.slug}
            </span>
            <CopyButton text={`npx abyss-ui add ${meta.slug}`} />
          </div>
        </motion.div>

        {/* Collapsible Source Code Inspector */}
        <motion.div
          className="border-t border-neutral-900 pt-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={() => setCodeExpanded(!codeExpanded)}
            className="flex w-full items-center justify-between font-sans text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            <span>Source Code</span>
            <span className="text-xs">{codeExpanded ? "▲ Hide" : "▼ Show"}</span>
          </button>

          {codeExpanded && (
            <div className="mt-4 flex flex-col space-y-3">
              <div className="flex space-x-4 border-b border-neutral-900 pb-2">
                <button
                  onClick={() => setActiveTab("tsx")}
                  className={`font-sans text-xs font-medium transition-colors ${
                    activeTab === "tsx" ? "text-white font-bold" : "text-neutral-500 hover:text-white"
                  }`}
                >
                  Component.tsx
                </button>
                <button
                  onClick={() => setActiveTab("glsl")}
                  className={`font-sans text-xs font-medium transition-colors ${
                    activeTab === "glsl" ? "text-white font-bold" : "text-neutral-500 hover:text-white"
                  }`}
                >
                  Shaders.glsl
                </button>
              </div>

              <div className="max-h-[400px] overflow-auto rounded-[4px] border border-neutral-900 bg-[#111113] p-4 font-mono text-xs leading-relaxed text-neutral-400">
                <pre className="whitespace-pre">
                  {activeTab === "tsx" ? tsxCode : glslCode}
                </pre>
              </div>
            </div>
          )}
        </motion.div>

        {/* Design & Motion Breakdown Section */}
        {storyContent && (
          <motion.div
            className="my-16 py-10 px-6 sm:px-8 rounded-2xl bg-[#0d0d10] border border-neutral-900 shadow-2xl space-y-6 font-sans"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 border-b border-neutral-900 pb-4">
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-400">
                Design & Motion Breakdown
              </span>
            </div>

            <StoryViewer content={storyContent} />
          </motion.div>
        )}

        {/* Next / Prev Navigation */}
        <div className="flex items-center justify-between border-t border-neutral-900 pt-8 mt-12 font-sans text-sm text-neutral-400">
          {prevComp ? (
            <Link
              href={`/components/${prevComp.slug}`}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{prevComp.label}</span>
            </Link>
          ) : (
            <span />
          )}

          {nextComp ? (
            <Link
              href={`/components/${nextComp.slug}`}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <span>{nextComp.label}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <span />
          )}
        </div>
      </main>
    </div>
  );
}
