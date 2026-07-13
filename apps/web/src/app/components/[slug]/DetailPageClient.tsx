"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getComponent } from "@/lib/component-registry";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { CopyButton } from "@/components/ui/copy-button";
import { ComponentCanvas } from "@/components/ui/ComponentCanvas";
import { fadeSlideUp } from "../../../lib/motion/variants";

const getBadgeStyles = (category: string) => {
  switch (category) {
    case "scroll":
      return "border-[#dfb15b]/20 bg-[#dfb15b]/5 text-[#dfb15b]";
    case "image":
      return "border-neutral-800 bg-neutral-900/60 text-white";
    case "geometry":
      return "border-[#9c8cb9]/20 bg-[#9c8cb9]/5 text-[#9c8cb9]";
    case "gallary":
      return "border-[#c4719d]/20 bg-[#c4719d]/5 text-[#c4719d]";
    case "hybrid":
      return "border-[#5b9cdf]/20 bg-[#5b9cdf]/5 text-[#5b9cdf]";
    case "transition":
      return "border-neutral-800 bg-neutral-900/30 text-neutral-400";
    default:
      return "border-neutral-800 bg-neutral-950 text-neutral-400";
  }
};

export function DetailPageClient({ slug }: { slug: string }) {
  const { Component, meta } = getComponent(slug);
  const DynamicComponent = Component as React.ComponentType<{
    imageSrc?: string;
    imageSrcs?: string[];
    className?: string;
    isFullscreen?: boolean;
    scrollProgress?: number;
  }>;
  const [activeTab, setActiveTab] = useState<"tsx" | "glsl">("tsx");
  const [tsxCode, setTsxCode] = useState("Loading source...");
  const [glslCode, setGlslCode] = useState("Loading shaders...");

  // Image Upload State
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Full Screen / Immersive State (for scroll-based components)
  const [isImmersive, setIsImmersive] = useState(false);

  const isScrollComponent = false;
  const isWideLayout = ["scroll", "gallery", "gallary", "transition"].includes(meta?.category || "");

  // Widescreen Trapped Scroll Progress
  const [scrollProgress, setScrollProgress] = useState(0);
  const wideWorkspaceRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ponytail: track page scroll progress for scroll components using framer-motion useScroll
  const { scrollYProgress } = useScroll({
    target: isScrollComponent ? scrollContainerRef : undefined,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (isScrollComponent) {
      setScrollProgress(latest);
      // Dispatch scroll event for components (like apparatus-underscore) that compute scroll velocity
      window.dispatchEvent(new Event("scroll"));
    }
  });

  useEffect(() => {
    const el = wideWorkspaceRef.current;
    if (!el || !isWideLayout || isScrollComponent || !meta) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScrollProgress((prev) => {
        if (meta.category === "gallary") {
          return prev + e.deltaY * 0.0005;
        }
        return Math.max(0.0, Math.min(1.0, prev + e.deltaY * 0.001));
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [isWideLayout, isScrollComponent, meta]);

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

  // Clean up Object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (uploadedImageSrc && uploadedImageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(uploadedImageSrc);
      }
    };
  }, [uploadedImageSrc]);

  // Handle ESC key to exit immersive mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isImmersive) {
        setIsImmersive(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isImmersive]);

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

  const currentImageSrc = uploadedImageSrc || getEncodedSrc(meta.filename);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (uploadedImageSrc && uploadedImageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(uploadedImageSrc);
      }
      const url = URL.createObjectURL(file);
      setUploadedImageSrc(url);
      setUploadedFileName(file.name);
    }
  };

  const handleResetImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (uploadedImageSrc && uploadedImageSrc.startsWith("blob:")) {
      URL.revokeObjectURL(uploadedImageSrc);
    }
    setUploadedImageSrc(null);
    setUploadedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-white flex flex-col font-sans antialiased pb-24 select-none">
      {isScrollComponent ? (
        <>
          {/* Scroll Runway Section */}
          <div ref={scrollContainerRef} className="relative w-full h-[250vh]">
            <div className="sticky top-0 h-screen w-full flex flex-col justify-between py-8">
              {/* Header Navigation */}
              <nav className="w-full px-12 flex justify-between items-center bg-transparent shrink-0">
                <Link
                  href="/components"
                  className="font-mono text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  ← CATALOG
                </Link>
              </nav>

              {/* Main Content Area */}
              <div className="w-full max-w-7xl mx-auto px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-grow">
                {/* Left Column: Info */}
                <section className="lg:col-span-5 flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
                      {meta.category}
                    </span>
                    <span className="text-neutral-700 font-mono text-[10px]">•</span>
                    <span className="font-mono text-[10px] text-neutral-400 tracking-wider">
                      NODE 0{meta.id}
                    </span>
                  </div>

                  <motion.h1 
                    variants={fadeSlideUp}
                    initial="hidden"
                    animate="visible"
                    className="font-sans font-black text-4xl xl:text-5xl tracking-tight leading-none uppercase text-white"
                  >
                    {meta.label}
                  </motion.h1>

                  <motion.p 
                    variants={fadeSlideUp}
                    initial="hidden"
                    animate="visible"
                    className="font-sans text-neutral-400 text-sm leading-relaxed"
                  >
                    {meta.desc}
                  </motion.p>

                  <motion.div 
                    variants={fadeSlideUp}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-2 flex-wrap"
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
                      </>
                    )}
                  </motion.div>

                  {/* CLI & Photo Upload on Pinned Canvas Left Column */}
                  <div className="flex flex-col gap-6 mt-4">
                    {/* CLI Installation */}
                    <div className="flex flex-col gap-2">
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                        CLI Installation
                      </span>
                      <div className="w-full bg-[#111113]/60 border border-neutral-900 px-4 py-3 rounded-[4px] flex justify-between items-center font-mono text-xs text-white">
                        <span className="select-all tracking-wider text-[11px] text-neutral-300">
                          npx vessel-ui add {meta.slug}
                        </span>
                        <CopyButton text={`npx vessel-ui add ${meta.slug}`} />
                      </div>
                    </div>

                    {/* Upload Custom Image */}
                    <div className="flex flex-col gap-2">
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                        Test with your own photo
                      </span>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border border-dashed border-neutral-800 hover:border-neutral-700 bg-[#111113]/20 hover:bg-[#111113]/40 px-4 py-3 rounded-[4px] transition-all duration-300 flex items-center justify-between cursor-pointer group"
                      >
                        {uploadedFileName ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="font-mono text-[10px] text-white truncate max-w-[200px]">
                              {uploadedFileName}
                            </span>
                            <button 
                              onClick={handleResetImage}
                              className="font-mono text-[9px] uppercase tracking-wider text-red-500 hover:text-red-400 bg-transparent border-none cursor-pointer"
                            >
                              [Reset]
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest group-hover:text-neutral-300">
                              Upload image file
                            </span>
                            <svg className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Right Column: Scroll-Based Component directly on page canvas */}
                <section className="lg:col-span-7 w-full h-[70vh] flex items-center justify-center relative overflow-hidden select-none">
                  {DynamicComponent && (
                    <DynamicComponent
                      imageSrc={currentImageSrc}
                      scrollProgress={scrollProgress}
                      isFullscreen={false}
                      className="w-full h-full object-cover"
                    />
                  )}
                </section>
              </div>

              {/* Scroll Progress HUD */}
              <div className="w-full max-w-7xl mx-auto px-12 flex justify-between items-center font-mono text-[8px] text-neutral-500 uppercase tracking-widest shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#dfb15b] animate-pulse" />
                  SCROLL DOWN THE PAGE TO INTERACT
                </span>
                <span className="text-[#dfb15b]">{(scrollProgress * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Specifications / Source Code area below scroll runway */}
          <div className="w-full max-w-7xl mx-auto px-12 py-12 flex flex-col gap-4 border-t border-neutral-900/60 mt-12">
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

            <div className="w-full bg-[#111113] rounded-[4px] p-6 overflow-x-auto border border-neutral-900 font-mono text-[10px] leading-relaxed text-neutral-400 select-text max-h-[500px]">
              <pre className="whitespace-pre">
                {activeTab === "tsx" ? tsxCode : glslCode}
              </pre>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Header Navigation */}
          <nav className="w-full px-12 py-8 flex justify-between items-center bg-transparent border-b border-neutral-900 shrink-0">
            <Link
              href="/components"
              className="font-mono text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              ← CATALOG
            </Link>
          </nav>

          {/* Main Spec 3-Column Layout */}
          <main className="w-full max-w-7xl mx-auto px-12 pt-16 flex flex-col gap-16">
            
            {isWideLayout ? (
              /* Widescreen Layout */
              <div className="flex flex-col gap-12">
                {/* Top Row: Info Left, Actions Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  {/* Left Column: Title & Desc (6/12 cols) */}
                  <section className="lg:col-span-6 flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
                        {meta.category}
                      </span>
                      <span className="text-neutral-700 font-mono text-[10px]">•</span>
                      <span className="font-mono text-[10px] text-neutral-400 tracking-wider">
                        NODE 0{meta.id}
                      </span>
                    </div>

                    <motion.h1 
                      variants={fadeSlideUp}
                      initial="hidden"
                      animate="visible"
                      className="font-sans font-black text-4xl xl:text-5xl tracking-tight leading-none uppercase text-white"
                    >
                      {meta.label}
                    </motion.h1>

                    <motion.p 
                      variants={fadeSlideUp}
                      initial="hidden"
                      animate="visible"
                      className="font-sans text-neutral-400 text-sm leading-relaxed"
                    >
                      {meta.desc}
                    </motion.p>

                    {/* Badges */}
                    <motion.div 
                      variants={fadeSlideUp}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center gap-2 flex-wrap"
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
                        </>
                      )}
                    </motion.div>
                  </section>

                  {/* Right Column: Actions (6/12 cols) */}
                  <section className="lg:col-span-6 flex flex-col gap-3 justify-end">
                    {/* CLI Installation Block */}
                    <div className="flex flex-col gap-3">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        CLI Installation
                      </span>
                      <div className="w-full bg-[#111113]/60 border border-neutral-900 p-4 rounded-[4px] flex justify-between items-center font-mono text-xs text-white">
                        <span className="select-all tracking-wider text-[11px] text-neutral-300">
                          npx vessel-ui add {meta.slug}
                        </span>
                        <CopyButton text={`npx vessel-ui add ${meta.slug}`} />
                      </div>
                    </div>
                  </section>
                </div>

                {/* Expansive Showcase Workspace Zone */}
                <div className="w-full">
                  <ComponentCanvas
                    slug={slug}
                    category={meta.category}
                    previewType={meta.previewType || "shader"}
                    Component={DynamicComponent}
                    imageSrc={currentImageSrc}
                  />
                </div>
              </div>
            ) : (
              /* Standard 3-Column Layout */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Column 1: Name and Info (4/12 cols) */}
                <section className="lg:col-span-4 flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
                      {meta.category}
                    </span>
                    <span className="text-neutral-700 font-mono text-[10px]">•</span>
                    <span className="font-mono text-[10px] text-neutral-400 tracking-wider">
                      NODE 0{meta.id}
                    </span>
                  </div>

                  <motion.h1 
                    variants={fadeSlideUp}
                    initial="hidden"
                    animate="visible"
                    className="font-sans font-black text-4xl xl:text-5xl tracking-tight leading-none uppercase text-white"
                  >
                    {meta.label}
                  </motion.h1>

                  <motion.p 
                    variants={fadeSlideUp}
                    initial="hidden"
                    animate="visible"
                    className="font-sans text-neutral-400 text-sm leading-relaxed mt-1"
                  >
                    {meta.desc}
                  </motion.p>

                  {/* Accent Badges */}
                  <motion.div 
                    variants={fadeSlideUp}
                    initial="hidden"
                    animate="visible"
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
                </section>

                {/* Column 2: Picture / Component Showcase in the Middle (4/12 cols) */}
                <section className="lg:col-span-4 flex flex-col items-center justify-center w-full">
                  <ComponentCanvas
                    slug={slug}
                    category={meta.category}
                    previewType={meta.previewType || "shader"}
                    Component={DynamicComponent}
                    imageSrc={currentImageSrc}
                  />
                </section>

                {/* Column 3: CLI and Picture Button on the Right (4/12 cols) */}
                <section className="lg:col-span-4 flex flex-col gap-8">
                  {/* CLI Installation Block */}
                  <div className="flex flex-col gap-3">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      CLI Installation
                    </span>
                    <div className="w-full bg-[#111113]/60 border border-neutral-900 p-4 rounded-[4px] flex justify-between items-center font-mono text-xs text-white">
                      <span className="select-all tracking-wider text-[11px] text-neutral-300">
                        npx vessel-ui add {meta.slug}
                      </span>
                      <CopyButton text={`npx vessel-ui add ${meta.slug}`} />
                    </div>
                  </div>

                  {/* Upload Custom Image Block */}
                  {["image", "geometry"].includes(meta?.category || "") && (
                    <div className="flex flex-col gap-3">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        Test with your own photo
                      </span>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />

                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border border-dashed border-neutral-800 hover:border-neutral-600 bg-[#111113]/30 hover:bg-[#111113]/60 p-5 rounded-[4px] transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer group text-center"
                      >
                        <svg 
                          className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors duration-300" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {uploadedFileName ? (
                          <div className="flex flex-col items-center gap-1.5 w-full px-2">
                            <span className="font-mono text-[10px] text-white truncate max-w-full">
                              {uploadedFileName}
                            </span>
                            <button 
                              onClick={handleResetImage}
                              className="font-mono text-[9px] uppercase tracking-wider text-red-500 hover:text-red-400 bg-transparent border-none cursor-pointer mt-1"
                            >
                              [Reset Photo]
                            </button>
                          </div>
                        ) : (
                          <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest group-hover:text-neutral-300 transition-colors duration-300">
                            Click to upload image file
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* Dynamic Component Code Sheets (Full Width Below) */}
            <div className="flex flex-col gap-4 w-full border-t border-neutral-900 pt-8 mt-8">
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

              {/* Syntax block for source sheets */}
              <div className="w-full bg-[#111113] rounded-[4px] p-6 overflow-x-auto border border-neutral-900 font-mono text-[10px] leading-relaxed text-neutral-400 select-text max-h-[500px]">
                <pre className="whitespace-pre">
                  {activeTab === "tsx" ? tsxCode : glslCode}
                </pre>
              </div>
            </div>

          </main>
        </>
      )}
    </div>
  );
}
