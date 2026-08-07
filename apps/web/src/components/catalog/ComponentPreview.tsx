"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Copy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ComponentDetail, COMPONENT_DETAILS } from "@/lib/component-registry";
import Lenis from "lenis";

import { CATEGORY_ICONS } from "./catalog-constants";
import { AnimatedCopyButton } from "./AnimatedCopyButton";
import { OpenShowcaseButton, GithubSourceButton } from "./ComponentNavigation";
import { TechStackRollUpItem, TextScramble, StoryViewer } from "./StoryViewer";
import { StaticPreview } from "./StaticPreview";

interface ComponentPreviewProps {
  component: ComponentDetail;
  prevComponent?: ComponentDetail | null;
  nextComponent?: ComponentDetail | null;
  onSelectComponent: (slug: string) => void;
  categoryColor?: string;
}

const containerVariants = {
  initial: { opacity: 1 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 14, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
  },
};

const imageVariants = {
  initial: { opacity: 0, scale: 0.96, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
  },
};

export function ComponentPreview({
  component,
  prevComponent,
  nextComponent,
  onSelectComponent,
}: ComponentPreviewProps) {
  const [codeOpen, setCodeOpen] = useState(true);
  const [storyContent, setStoryContent] = useState<string>("");

  useEffect(() => {
    fetch(`/api/code?slug=${component.slug}&type=story`)
      .then((res) => (res.ok ? res.text() : ""))
      .then((text) => setStoryContent(text))
      .catch(() => setStoryContent(""));
  }, [component.slug]);

  const cleanLabel = (label: string) => {
    let clean = label.replace(/^APPARATUS\s+/i, "");
    if (clean === clean.toUpperCase()) {
      clean = clean
        .toLowerCase()
        .replace(/(?:^|\s|-)\S/g, (m) => m.toUpperCase());
    }
    return clean;
  };

  const imagePath = component.filename
    ? component.filename.startsWith("http") || component.filename.startsWith("/")
      ? component.filename
      : `/images/components images/${component.filename}`
    : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";

  const displayName = cleanLabel(component.label);

  const relatedComponents = Object.values(COMPONENT_DETAILS).filter(
    (c) =>
      c.category.toLowerCase() === component.category.toLowerCase() &&
      c.slug !== component.slug
  );

  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = direction === "left" ? -320 : 320;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const codeSnippet = `import { ${component.slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("")} } from "@abyss-ui/core";

export default function ExamplePage() {
  return (
    <${component.slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("")}
      imageSrc="${imagePath}"
    />
  );
}`;

  const prevImage = prevComponent?.filename
    ? prevComponent.filename.startsWith("http") || prevComponent.filename.startsWith("/")
      ? prevComponent.filename
      : `/images/components images/${prevComponent.filename}`
    : null;

  const nextImage = nextComponent?.filename
    ? nextComponent.filename.startsWith("http") || nextComponent.filename.startsWith("/")
      ? nextComponent.filename
      : `/images/components images/${nextComponent.filename}`
    : null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis smooth scroll instance for preview pane
  useEffect(() => {
    const wrapper = scrollRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const lenis = new Lenis({
      wrapper,
      content,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    resizeObserver.observe(content);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Reset scroll position & update Lenis bounds on slug or storyContent changes
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      const timer = setTimeout(() => {
        lenisRef.current?.resize();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [component.slug, storyContent]);

  return (
    <div
      ref={scrollRef}
      data-lenis-prevent
      className="w-full h-full overflow-y-auto overscroll-contain bg-white text-[#111113] p-6 lg:p-10 font-sans antialiased custom-scrollbar"
    >
      <div ref={contentRef} className="min-h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={component.slug}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-6xl mx-auto pb-16 transform-gpu"
          >
            {/* 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Left Column (7 Cols): Standalone Image & Action CTAs */}
              <div className="lg:col-span-7 space-y-6">
                {/* Image Preview Card */}
                <motion.div variants={imageVariants}>
                  <StaticPreview
                    filename={component.filename || ""}
                    label={displayName}
                    slug={component.slug}
                    priority
                  />
                </motion.div>

                {/* Action CTAs (Showcase + GitHub Source) */}
                <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-6 pt-2 pb-1">
                  <OpenShowcaseButton slug={component.slug} />
                  <GithubSourceButton slug={component.slug} />
                </motion.div>

                {/* Next / Previous Directional Cards with Mini Thumbnails */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 pt-2">
                  {prevComponent ? (
                    <button
                      onClick={() => onSelectComponent(prevComponent.slug)}
                      className="group relative flex items-center gap-3.5 p-3.5 rounded-2xl border border-neutral-200/90 bg-neutral-50/70 hover:bg-[#0A0A0A] hover:border-neutral-950 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-left shadow-sm hover:shadow-xl cursor-pointer"
                    >
                      {prevImage && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-neutral-200/60 group-hover:border-neutral-800 transition-colors">
                          <img
                            src={prevImage}
                            alt={cleanLabel(prevComponent.label)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[11px] font-sans font-semibold uppercase tracking-wider text-neutral-400 group-hover:text-neutral-400">
                          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1 text-neutral-400 group-hover:text-white" />
                          <span>Previous</span>
                        </div>
                        <div className="text-sm font-bold tracking-tight text-neutral-900 group-hover:text-white transition-colors truncate mt-0.5 font-sans">
                          {cleanLabel(prevComponent.label)}
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div />
                  )}

                  {nextComponent ? (
                    <button
                      onClick={() => onSelectComponent(nextComponent.slug)}
                      className="group relative flex items-center justify-between gap-3.5 p-3.5 rounded-2xl border border-neutral-200/90 bg-neutral-50/70 hover:bg-[#0A0A0A] hover:border-neutral-950 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-right shadow-sm hover:shadow-xl cursor-pointer"
                    >
                      <div className="flex-1 min-w-0 flex flex-col items-end">
                        <div className="flex items-center justify-end gap-1 text-[11px] font-sans font-semibold uppercase tracking-wider text-neutral-400 group-hover:text-neutral-400">
                          <span>Next</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 text-neutral-400 group-hover:text-white" />
                        </div>
                        <div className="text-sm font-bold tracking-tight text-neutral-900 group-hover:text-white transition-colors truncate mt-0.5 font-sans">
                          {cleanLabel(nextComponent.label)}
                        </div>
                      </div>
                      {nextImage && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-neutral-200/60 group-hover:border-neutral-800 transition-colors">
                          <img
                            src={nextImage}
                            alt={cleanLabel(nextComponent.label)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                    </button>
                  ) : (
                    <div />
                  )}
                </motion.div>
              </div>

              {/* Right Column (5 Cols): Component Specs & Code Card */}
              <div className="lg:col-span-5 space-y-6">
                {/* Category & Subtype Header */}
                <motion.div variants={itemVariants} className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-neutral-400 select-none">
                  {(() => {
                    const CategoryIcon =
                      CATEGORY_ICONS[component.category.toLowerCase()] || Sparkles;
                    return (
                      <span className="flex items-center gap-1.5 text-neutral-900 font-semibold">
                        <CategoryIcon className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                        <span>{component.category.toUpperCase()}</span>
                      </span>
                    );
                  })()}

                  {component.subtype && (
                    <>
                      <span className="text-neutral-300 font-normal">/</span>
                      <span className="text-neutral-500 font-medium">{component.subtype.toUpperCase()}</span>
                    </>
                  )}
                </motion.div>

                {/* Title */}
                <motion.div variants={itemVariants}>
                  <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight font-sans">
                    {displayName}
                  </h1>
                </motion.div>

                {/* Overview Description */}
                <motion.div variants={itemVariants} className="space-y-1.5 pt-1">
                  <h2 className="text-[11px] font-mono font-bold tracking-widest uppercase text-neutral-400">
                    Overview
                  </h2>
                  <p className="text-sm text-neutral-600 leading-relaxed font-sans">
                    {component.desc}
                  </p>
                </motion.div>

                {/* Tech Stack List */}
                {component.tags && component.tags.length > 0 && (
                  <motion.div variants={itemVariants} className="space-y-1.5 pt-2">
                    <h2 className="text-[11px] font-mono font-bold tracking-widest uppercase text-neutral-400">
                      Tech Stack
                    </h2>
                    <div className="text-xs font-mono flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      {component.tags.map((tag, idx) => (
                        <React.Fragment key={tag}>
                          {idx > 0 && <span className="text-neutral-300 select-none">•</span>}
                          <TechStackRollUpItem tag={tag} />
                        </React.Fragment>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Source Code Usage Box */}
                <motion.div variants={itemVariants} className="pt-3 border-t border-neutral-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold tracking-wider uppercase text-neutral-400 font-sans">
                      Source Code Usage
                    </h2>
                    <button
                      onClick={() => setCodeOpen(!codeOpen)}
                      className="text-xs font-sans font-medium text-neutral-400 hover:text-neutral-900 transition-colors"
                    >
                      {codeOpen ? "Hide" : "Show"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {codeOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-neutral-800 text-neutral-200 space-y-3 relative shadow-md">
                          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2 font-sans">
                            <span className="text-neutral-400 text-xs font-medium">
                              React Integration
                            </span>
                            <AnimatedCopyButton
                              text={codeSnippet}
                              label="Copy Code"
                              icon={Copy}
                            />
                          </div>
                          <pre className="text-xs text-neutral-200 overflow-x-auto leading-relaxed font-mono">
                            <code>{codeSnippet}</code>
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

              </div>
            </div>

            {/* Middle Section: Design & Motion Story */}
            {storyContent && (
              <motion.div variants={itemVariants} className="my-16 pt-10 pb-6 border-t border-neutral-200/80 font-sans">
                <div className="space-y-6">
                  <TextScramble
                    text="DESIGN & MOTION BREAKDOWN"
                    className="text-sm font-bold tracking-widest uppercase text-neutral-900 font-sans border-b border-neutral-200/80 pb-3"
                  />

                  <StoryViewer content={storyContent} />
                </div>
              </motion.div>
            )}

            {/* Bottom Section: Related Components Carousel */}
            <motion.div variants={itemVariants} className="mt-12 pt-10 border-t border-neutral-200/70">
              {relatedComponents.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs font-semibold tracking-wider uppercase text-neutral-400 font-sans">
                        More in {component.category}
                      </h2>
                      <span className="text-[10px] font-mono font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200/80">
                        {relatedComponents.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => scrollCarousel("left")}
                        className="p-1.5 rounded-lg border border-neutral-200/80 bg-neutral-50 hover:bg-[#0A0A0A] hover:border-neutral-900 text-neutral-600 hover:text-white transition-all duration-200 shadow-sm cursor-pointer"
                        title="Scroll Left"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollCarousel("right")}
                        className="p-1.5 rounded-lg border border-neutral-200/80 bg-neutral-50 hover:bg-[#0A0A0A] hover:border-neutral-900 text-neutral-600 hover:text-white transition-all duration-200 shadow-sm cursor-pointer"
                        title="Scroll Right"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={carouselRef}
                    data-lenis-prevent
                    className="flex gap-4 overflow-x-auto scroll-smooth custom-scrollbar snap-x snap-mandatory py-1 px-0.5"
                  >
                    {relatedComponents.map((relComp, idx) => {
                      const relImg = relComp.filename
                        ? relComp.filename.startsWith("http") || relComp.filename.startsWith("/")
                          ? relComp.filename
                          : `/images/components images/${relComp.filename}`
                        : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";

                      return (
                        <motion.button
                          key={relComp.slug}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          whileInView={{ opacity: 1, y: 0, scale: 1 }}
                          viewport={{ once: true, margin: "-20px" }}
                          transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                          onClick={() => onSelectComponent(relComp.slug)}
                          className="group shrink-0 w-[280px] text-left p-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 hover:bg-[#0A0A0A] hover:border-neutral-950 transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer snap-start"
                        >
                          <div className="aspect-video w-full rounded-xl overflow-hidden bg-neutral-900 mb-3 border border-neutral-200/60 group-hover:border-neutral-800">
                            <img
                              src={relImg}
                              alt={relComp.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="px-1">
                            <div className="text-xs font-bold text-neutral-900 group-hover:text-white transition-colors truncate font-sans">
                              {cleanLabel(relComp.label)}
                            </div>
                            <div className="text-[10px] text-neutral-400 group-hover:text-neutral-400 line-clamp-1 mt-0.5 font-sans">
                              {relComp.desc}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
