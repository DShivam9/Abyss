"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getComponent } from "@/lib/component-registry";
import { motion } from "framer-motion";
import { CopyButton } from "@/components/ui/copy-button";
import { staggerContainer, fadeSlideUp, springMount } from "../../../lib/motion/variants";

// Helper to style badges based on category mood for dark theme
const getBadgeStyles = (category: string) => {
  switch (category) {
    case "medieval":
      return "border-[#dfb15b]/20 bg-[#dfb15b]/5 text-[#dfb15b]";
    case "premium":
      return "border-neutral-800 bg-neutral-900/60 text-white";
    case "aesthetic":
      return "border-[#9c8cb9]/20 bg-[#9c8cb9]/5 text-[#9c8cb9]";
    case "dark-styled":
      return "border-[#c4719d]/20 bg-[#c4719d]/5 text-[#c4719d]";
    case "brutalist":
      return "border-neutral-800/40 bg-neutral-900/30 text-neutral-400";
    default:
      return "border-neutral-800 bg-neutral-950 text-neutral-400";
  }
};

export function DetailPageClient({ slug }: { slug: string }) {
  const { Component, meta } = getComponent(slug);
  const [activeTab, setActiveTab] = useState<"tsx" | "glsl">("tsx");
  const [tsxCode, setTsxCode] = useState("Loading source...");
  const [glslCode, setGlslCode] = useState("Loading shaders...");

  useEffect(() => {
    if (!slug) return;

    setTsxCode("Loading source...");
    setGlslCode("Loading shaders...");

    // Fetch tsx
    fetch(`/api/code?slug=${slug}&type=tsx`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then((data) => setTsxCode(data))
      .catch(() => setTsxCode("// Failed to load tsx component source."));

    // Fetch glsl
    fetch(`/api/code?slug=${slug}&type=glsl`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then((data) => setGlslCode(data))
      .catch(() => setGlslCode("// Failed to load shader source."));
  }, [slug]);

  if (!meta || !Component) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans text-sm text-neutral-500 bg-[#0A0A0A]">
        Component not found.
      </div>
    );
  }

  const getEncodedSrc = (filename: string) => {
    const encodedFilename = filename.replace(/#/g, "%23");
    return `/images/components images/${encodedFilename}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-white flex flex-col font-sans antialiased pb-24 select-none">
      {/* Header Navigation */}
      <nav className="w-full px-12 py-8 flex justify-between items-center bg-transparent border-b border-neutral-900">
        <Link
          href="/components"
          className="font-mono text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          ← CATALOG
        </Link>
      </nav>

      {/* Main Spec Centered Column Flow */}
      <main className="w-full max-w-4xl mx-auto px-6 pt-12 flex flex-col gap-16 items-center">
        
        {/* Visual Showcase Frame */}
        <section className="w-full flex justify-center">
          <motion.div 
            variants={springMount}
            initial="hidden"
            animate="visible"
            className="w-full max-w-[500px] relative bg-transparent rounded-none border-none shadow-none flex items-center justify-center"
          >
            <Component imageSrc={getEncodedSrc(meta.filename)} className="max-h-[550px]" />
          </motion.div>
        </section>

        {/* Specimen Metadata HUD & Installation Strip */}
        <motion.section 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-neutral-900 pb-12"
        >
          {/* Metadata Block */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
                {meta.category?.replace("-", " ") || ""}
              </span>
              <span className="text-neutral-700 font-mono text-[10px]">•</span>
              <span className="font-mono text-[10px] text-neutral-400 tracking-wider">
                NODE 0{meta.id}
              </span>
            </div>
            
            <motion.h1 
              variants={fadeSlideUp}
              className="font-sans font-black text-4xl xl:text-5xl tracking-tight leading-none uppercase text-white"
            >
              {meta.label}
            </motion.h1>
            
            <motion.p 
              variants={fadeSlideUp}
              className="font-sans text-neutral-400 text-sm leading-relaxed mt-1"
            >
              {meta.desc}
            </motion.p>

            {/* Premium Highlights Badges */}
            <motion.div 
              variants={fadeSlideUp}
              className="flex items-center gap-2 mt-2 flex-wrap"
            >
              {meta.tags && Array.isArray(meta.tags) && meta.tags.length > 0 ? (
                meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`font-mono text-[9px] border px-2 py-0.5 tracking-wide rounded-[2px] uppercase ${getBadgeStyles(
                      meta.category || ""
                    )}`}
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <>
                  <span className="font-mono text-[9px] border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-neutral-400 tracking-wide rounded-[2px] uppercase">
                    Interactive
                  </span>
                  <span className="font-mono text-[9px] border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-neutral-400 tracking-wide rounded-[2px] uppercase">
                    Three.js
                  </span>
                  <span className="font-mono text-[9px] border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-neutral-400 tracking-wide rounded-[2px] uppercase">
                    GLSL Shader
                  </span>
                </>
              )}
            </motion.div>
          </div>

          {/* Installation Block */}
          <motion.div 
            variants={fadeSlideUp}
            className="md:col-span-5 flex flex-col gap-2.5 w-full border border-neutral-900 bg-neutral-950/60 p-4 rounded-[4px]"
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              CLI Installation
            </span>
            <div className="w-full flex justify-between items-center font-mono text-xs text-white">
              <span className="select-all tracking-wider text-[11px] text-neutral-300">
                npx vessel-ui add {meta.slug}
              </span>
              <CopyButton text={`npx vessel-ui add ${meta.slug}`} />
            </div>
          </motion.div>
        </motion.section>

        {/* Source Code Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="w-full flex flex-col gap-4"
        >
          <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Source Specification
            </span>
            <div className="flex gap-4 font-mono text-[10px] tracking-wider">
              <button
                onClick={() => setActiveTab("tsx")}
                className={`cursor-pointer transition-colors relative pb-2 ${
                  activeTab === "tsx" ? "text-white font-bold" : "text-neutral-500 hover:text-white"
                }`}
              >
                Component.tsx
                {activeTab === "tsx" && (
                  <motion.div 
                    layoutId="activeDetailTab"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("glsl")}
                className={`cursor-pointer transition-colors relative pb-2 ${
                  activeTab === "glsl" ? "text-white font-bold" : "text-neutral-500 hover:text-white"
                }`}
              >
                Shaders.glsl
                {activeTab === "glsl" && (
                  <motion.div 
                    layoutId="activeDetailTab"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Monospace Code Sheet Container */}
          <div className="w-full bg-[#111113] rounded-[4px] p-6 overflow-x-auto border border-neutral-900 font-mono text-[10px] leading-relaxed text-neutral-400 select-text max-h-[500px]">
            <pre className="whitespace-pre">
              {activeTab === "tsx" ? tsxCode : glslCode}
            </pre>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
