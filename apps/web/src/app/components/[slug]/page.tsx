"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getComponent } from "@/lib/component-registry";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ComponentDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const { Component, meta } = getComponent(slug);
  const [copied, setCopied] = useState(false);
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
      <div className="min-h-screen flex items-center justify-center font-sans text-sm text-neutral-500">
        Component not found.
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`npx vessel-ui add ${meta.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEncodedSrc = (filename: string) => {
    const encodedFilename = filename.replace(/#/g, "%23");
    return `/images/components images/${encodedFilename}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#ffffff] text-[#111113] flex flex-col font-sans antialiased selection:bg-[#111113] selection:text-white pb-24">
      {/* Header Navigation */}
      <nav className="w-full px-12 py-8 flex justify-between items-center bg-[#ffffff] border-b border-neutral-200/50">
        <Link
          href="/components"
          className="font-sans text-xs font-medium text-neutral-500 hover:text-black transition-colors flex items-center gap-1.5"
        >
          ← Back to Catalog
        </Link>
      </nav>

      {/* Main Spec Asymmetric Grid Layout */}
      <main className="w-full max-w-7xl mx-auto px-12 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left Column - Sticky Details HUD (5/12 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-8 lg:sticky lg:top-24">
          <div className="flex flex-col gap-4">
            <span className="font-sans text-xs font-bold text-[#ff007f] tracking-wide uppercase">
              {meta.category?.replace("-", " ") || ""}
            </span>
            <h1 className="font-sans font-black text-4xl xl:text-5xl tracking-tight leading-none uppercase text-[#111113]">
              {meta.label}
            </h1>
            <p className="font-sans text-sm text-neutral-500 leading-relaxed mt-2">
              {meta.desc}
            </p>

            {/* Accent Badges */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="font-mono text-[9px] font-semibold border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-neutral-500 uppercase tracking-wider rounded-[3px]">
                React
              </span>
              <span className="font-mono text-[9px] font-semibold border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-neutral-500 uppercase tracking-wider rounded-[3px]">
                Three.js
              </span>
              <span className="font-mono text-[9px] font-semibold border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-neutral-500 uppercase tracking-wider rounded-[3px]">
                GLSL Shader
              </span>
            </div>
          </div>

          {/* CLI Command Block */}
          <div className="flex flex-col gap-3">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-400">
              CLI Installation
            </span>
            <div className="w-full bg-[#f9f9f9] rounded-[4px] border border-neutral-200/50 p-4 flex justify-between items-center font-mono text-xs text-[#111113]">
              <span className="select-all tracking-wider text-[11px]">
                npx vessel-ui add {meta.slug}
              </span>
              <button
                onClick={handleCopy}
                className="cursor-pointer border-none bg-[#111113] hover:bg-neutral-800 text-white font-sans text-xs font-semibold px-4 py-2 transition-colors rounded-[3px]"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </section>

        {/* Right Column - Lab Showcase & Code Sheets (7/12 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-12 w-full">
          {/* Main Visual Showcase Frame */}
          <div className="flex flex-col gap-3 w-full items-center">
            {/* Frameless WebGL Viewport Container with dynamic aspect ratio and max sizing bounds */}
            <div className="w-full max-w-[420px] max-h-[500px] relative overflow-hidden bg-transparent rounded-none border-none shadow-none flex items-center justify-center cursor-crosshair lg:mx-0 mx-auto">
              <Component imageSrc={getEncodedSrc(meta.filename)} className="max-h-[500px]" />
            </div>
          </div>

          {/* Dynamic Component Code Sheets */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-center border-b border-neutral-200/60 pb-2">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-400">
                Source Specification
              </span>
              <div className="flex gap-4 font-sans text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("tsx")}
                  className={`cursor-pointer transition-colors ${
                    activeTab === "tsx"
                      ? "text-black font-semibold border-b-2 border-black pb-2 -mb-[10px]"
                      : "text-neutral-400 hover:text-black pb-2"
                  }`}
                >
                  Component.tsx
                </button>
                <button
                  onClick={() => setActiveTab("glsl")}
                  className={`cursor-pointer transition-colors ${
                    activeTab === "glsl"
                      ? "text-black font-semibold border-b-2 border-black pb-2 -mb-[10px]"
                      : "text-neutral-400 hover:text-black pb-2"
                  }`}
                >
                  Shaders.glsl
                </button>
              </div>
            </div>

            {/* Syntax block for source sheets */}
            <div className="w-full bg-[#fafaf9] rounded-[4px] p-6 overflow-x-auto border border-neutral-200/50 font-mono text-[10px] leading-relaxed text-[#55555c] select-text max-h-[500px]">
              <pre className="whitespace-pre">
                {activeTab === "tsx" ? tsxCode : glslCode}
              </pre>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
