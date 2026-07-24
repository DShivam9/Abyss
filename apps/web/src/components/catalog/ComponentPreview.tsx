"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  MousePointer,
  Sparkles,
  Box,
  LayoutGrid,
  Layers,
  Zap,
  ChevronLeft,
  ChevronRight,
  Type,
  Code2,
} from "lucide-react";
import { ComponentDetail, COMPONENT_DETAILS } from "@/lib/component-registry";
import Lenis from "lenis";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  scroll: MousePointer,
  image: Sparkles,
  geometry: Box,
  gallary: LayoutGrid,
  gallery: LayoutGrid,
  hybrid: Layers,
  transition: Zap,
  text: Type,
};

interface ComponentPreviewProps {
  component: ComponentDetail;
  prevComponent?: ComponentDetail | null;
  nextComponent?: ComponentDetail | null;
  onSelectComponent: (slug: string) => void;
  categoryColor?: string;
}

function RollUpText({ text }: { text: string }) {
  return (
    <span className="relative inline-flex overflow-hidden font-sans">
      <motion.span
        variants={{
          initial: { y: "0%" },
          hover: { y: "-100%" },
        }}
        transition={{ type: "spring", stiffness: 450, damping: 28 }}
        className="inline-block"
      >
        {text}
      </motion.span>
      <motion.span
        variants={{
          initial: { y: "100%" },
          hover: { y: "0%" },
        }}
        transition={{ type: "spring", stiffness: 450, damping: 28 }}
        className="absolute inset-0 inline-block"
      >
        {text}
      </motion.span>
    </span>
  );
}

function AnimatedCopyButton({
  text,
  label = "Copy Code",
  icon: DefaultIcon = Copy,
}: {
  text: string;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={handleCopy}
      className="px-2.5 py-1 text-xs font-sans font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 transition-colors border border-neutral-800 flex items-center justify-center shrink-0 min-w-[85px] overflow-hidden select-none"
    >
      <AnimatePresence mode="wait" initial={false}>
        {!copied ? (
          <motion.span
            key="copy"
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="flex items-center gap-1.5"
          >
            <DefaultIcon className="w-3.5 h-3.5 text-neutral-400" />
            <span>{label}</span>
          </motion.span>
        ) : (
          <motion.span
            key="check"
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="flex items-center gap-1.5 text-emerald-400 font-semibold"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Copied!</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function ShowcaseCTAButton({ href }: { href: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const originalText = "OPEN SHOWCASE";
  const [displayText, setDisplayText] = useState(originalText);

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(originalText);
      return;
    }

    let frame = 0;
    const waveWidth = 2;
    const totalFrames = (originalText.length + waveWidth) * 2;
    let intervalId: NodeJS.Timeout;

    intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);

      const result = originalText
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          const isInsideWave = i >= waveCenter - waveWidth && i <= waveCenter;
          if (isInsideWave) {
            const isUpper = char === char.toUpperCase();
            const chars = isUpper ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "abcdefghijklmnopqrstuvwxyz";
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return char;
        })
        .join("");

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText(originalText);
      }
    }, 28);

    return () => clearInterval(intervalId);
  }, [isHovered]);

  return (
    <Link
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="inline-block group pt-1"
    >
      <motion.div
        initial="initial"
        whileHover="hover"
        className="relative flex items-center gap-2.5 cursor-pointer select-none py-2 px-5 rounded-lg overflow-hidden"
      >
        {/* Hover-Only Dark Lens Pill Reveal (Scale & Opacity, Zero Borders) */}
        <motion.div
          variants={{
            initial: { scale: 0.85, opacity: 0 },
            hover: { scale: 1, opacity: 1 },
          }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 bg-neutral-900 rounded-lg pointer-events-none"
        />

        {/* Content Container (Flips color from black to white on hover) */}
        <motion.div
          variants={{
            initial: { color: "#171717" },
            hover: { color: "#FFFFFF" },
          }}
          transition={{ duration: 0.2 }}
          className="relative z-10 text-sm font-mono font-bold uppercase tracking-widest flex items-center gap-2.5"
        >
          {/* Text with Wave Scramble */}
          <span className="font-mono min-w-[150px] inline-block">{displayText}</span>

          {/* Symmetrical Diagonal 45deg Arrow Spring Cascade */}
          <div className="relative w-4 h-4 overflow-hidden shrink-0 flex items-center justify-center">
            {/* Primary Arrow: Exits UP-RIGHT on hover, returns from UP-RIGHT on unhover */}
            <motion.div
              variants={{
                initial: { x: "0%", y: "0%" },
                hover: { x: "100%", y: "-100%" },
              }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ArrowUpRight className="w-4 h-4 text-neutral-400" />
            </motion.div>

            {/* Secondary Arrow: Enters from bottom-left on hover, exits to bottom-left on unhover */}
            <motion.div
              variants={{
                initial: { x: "-100%", y: "100%" },
                hover: { x: "0%", y: "0%" },
              }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ArrowUpRight className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
}

function GithubSourceButton({ slug }: { slug: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const originalText = "VIEW CODE";
  const [displayText, setDisplayText] = useState(originalText);

  const githubUrl = `https://github.com/DShivam9/Abyss/tree/main/packages/core/src/components/${slug}`;

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(originalText);
      return;
    }

    let frame = 0;
    const waveWidth = 2;
    const totalFrames = (originalText.length + waveWidth) * 2;
    let intervalId: NodeJS.Timeout;

    intervalId = setInterval(() => {
      frame++;
      const waveCenter = Math.floor(frame / 2);

      const result = originalText
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          const isInsideWave = i >= waveCenter - waveWidth && i <= waveCenter;
          if (isInsideWave) {
            const isUpper = char === char.toUpperCase();
            const chars = isUpper ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "abcdefghijklmnopqrstuvwxyz";
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return char;
        })
        .join("");

      setDisplayText(result);

      if (frame >= totalFrames) {
        clearInterval(intervalId);
        setDisplayText(originalText);
      }
    }, 28);

    return () => clearInterval(intervalId);
  }, [isHovered]);

  return (
    <a
      href={githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="inline-block group pt-1"
    >
      <motion.div
        initial="initial"
        whileHover="hover"
        className="relative flex items-center gap-2.5 cursor-pointer select-none py-2 px-5 rounded-lg overflow-hidden"
      >
        {/* Hover-Only Dark Lens Pill Reveal */}
        <motion.div
          variants={{
            initial: { scale: 0.85, opacity: 0 },
            hover: { scale: 1, opacity: 1 },
          }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 bg-neutral-900 rounded-lg pointer-events-none"
        />

        {/* Content Container */}
        <motion.div
          variants={{
            initial: { color: "#525252" },
            hover: { color: "#FFFFFF" },
          }}
          transition={{ duration: 0.2 }}
          className="relative z-10 text-sm font-mono font-bold uppercase tracking-widest flex items-center gap-2"
        >
          {/* Code Icon */}
          <Code2 className="w-4 h-4 shrink-0 text-neutral-400 group-hover:text-white transition-colors" />

          {/* Text with Wave Scramble */}
          <span className="font-mono min-w-[100px] inline-block">{displayText}</span>

          {/* Symmetrical Diagonal 45deg Arrow Spring Cascade */}
          <div className="relative w-4 h-4 overflow-hidden shrink-0 flex items-center justify-center">
            {/* Primary Arrow */}
            <motion.div
              variants={{
                initial: { x: "0%", y: "0%" },
                hover: { x: "100%", y: "-100%" },
              }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ArrowUpRight className="w-4 h-4 text-neutral-400" />
            </motion.div>

            {/* Secondary Arrow */}
            <motion.div
              variants={{
                initial: { x: "-100%", y: "100%" },
                hover: { x: "0%", y: "0%" },
              }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ArrowUpRight className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </a>
  );
}

function TechStackRollUpItem({ tag }: { tag: string }) {
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      className="relative inline-flex items-center cursor-pointer select-none group"
    >
      {tag.split("").map((char, index) => {
        if (char === " ") {
          return <span key={index} className="inline-block w-1 select-none" />;
        }
        return (
          <div key={index} className="relative inline-block h-4 overflow-hidden">
            {/* Stationary Base Faded Gray Letter (Stays fixed in place) */}
            <span className="block text-xs font-mono font-medium text-neutral-400 leading-none">
              {char}
            </span>

            {/* Overlapping Hover Bold Black Letter (Rolls UP from below & overlaps faded text) */}
            <motion.span
              variants={{
                initial: { y: "100%" },
                hover: { y: "0%" },
              }}
              transition={{
                duration: 0.28,
                delay: index * 0.025,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute inset-0 block text-xs font-mono font-bold text-black leading-none bg-white"
            >
              {char}
            </motion.span>
          </div>
        );
      })}
    </motion.div>
  );
}

function TextScramble({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [displayText, setDisplayText] = useState(text);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  useEffect(() => {
    if (!isInView || hasAnimated) return;
    setHasAnimated(true);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let iteration = 0;
    const totalFrames = 14;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < (iteration / totalFrames) * text.length) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      iteration += 1;
      if (iteration >= totalFrames) {
        setDisplayText(text);
        clearInterval(interval);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [isInView, text, hasAnimated]);

  return (
    <h3 ref={ref} className={className}>
      {displayText}
    </h3>
  );
}

function StoryViewer({ content }: { content: string }) {
  if (!content) return null;

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-neutral-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200/80 font-mono text-xs text-neutral-800">{part.slice(1, -1)}</code>;
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
        <ul key={key} className="space-y-2.5 my-4">
          {currentList.map((item, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-2.5 text-sm text-neutral-600 leading-relaxed font-sans"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 mt-2 shrink-0" />
              <span className="flex-1">{renderFormattedText(item)}</span>
            </motion.li>
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
        <TextScramble
          key={idx}
          text={trimmed.replace(/^##\s+/, "")}
          className="text-base font-bold tracking-tight text-neutral-900 mt-8 mb-3 font-sans"
        />
      );
    } else if (trimmed.startsWith("### ")) {
      flushList(`list-${idx}`);
      blocks.push(
        <TextScramble
          key={idx}
          text={trimmed.replace(/^###\s+/, "")}
          className="text-sm font-bold tracking-tight text-neutral-900 mt-6 mb-2 font-sans"
        />
      );
    } else if (trimmed.startsWith("> ")) {
      flushList(`list-${idx}`);
      blocks.push(
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 12, x: -4 }}
          whileInView={{ opacity: 1, y: 0, x: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg text-neutral-800 font-normal italic leading-relaxed pl-4 border-l-2 border-neutral-900 my-6 font-sans"
        >
          {renderFormattedText(trimmed.replace(/^>\s+/, ""))}
        </motion.p>
      );
    } else if (trimmed.startsWith("- ")) {
      currentList.push(trimmed.replace(/^-+\s+/, ""));
    } else {
      flushList(`list-${idx}`);
      blocks.push(
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm text-neutral-600 leading-relaxed font-sans my-3"
        >
          {renderFormattedText(trimmed)}
        </motion.p>
      );
    }
  });

  flushList("list-final");

  return <div className="space-y-2">{blocks}</div>;
}const containerVariants = {
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

    // Stable ResizeObserver continuously updates Lenis bounds as content expands
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
                <Link
                  href={`/showcase/${component.slug}`}
                  className="group relative block w-full overflow-hidden rounded-2xl bg-neutral-950 shadow-md border border-neutral-200/80 transition-all duration-300 hover:shadow-2xl"
                >
                  <img
                    src={imagePath}
                    alt={displayName}
                    className="w-full max-h-[54vh] min-h-[320px] object-cover rounded-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.015]"
                  />
                </Link>
              </motion.div>

              {/* Action CTAs (Showcase + GitHub Source) */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-6 pt-2 pb-1">
                <ShowcaseCTAButton href={`/showcase/${component.slug}`} />
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
              {/* Category & Subtype Typographic Header */}
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

              {/* Tech Stack Typographic List with Dual-Text RollUp */}
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

              {/* CLI Quick Install Card */}
              <motion.div variants={itemVariants} className="space-y-2 pt-3 border-t border-neutral-100">
                <h2 className="text-xs font-semibold tracking-wider uppercase text-neutral-400 font-sans">
                  CLI Installation
                </h2>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0A0A0A] border border-neutral-800 text-white font-mono text-xs shadow-sm">
                  <span className="select-all text-neutral-300 font-mono">
                    npx abyss-ui add {component.slug}
                  </span>
                  <AnimatedCopyButton
                    text={`npx abyss-ui add ${component.slug}`}
                    label="Copy"
                    icon={Terminal}
                  />
                </div>
              </motion.div>

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

          {/* Middle Section: Design & Motion Story (Clean Professional Technical Spec) */}
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

          {/* Bottom Section: Related Category Components Carousel */}
          <motion.div variants={itemVariants} className="mt-12 pt-10 border-t border-neutral-200/70">
            {/* Category Components Infinite Horizontal Carousel */}
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

                  {/* Left / Right Carousel Arrow Controls */}
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

                {/* Horizontal Scrollable Carousel Container */}
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

