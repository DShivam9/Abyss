"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, fadeSlideUp } from "../../lib/motion/variants";

type CategoryTab = 
  | "all" 
  | "medieval" 
  | "dark-styled" 
  | "premium" 
  | "aesthetic"
  | "brutalist"
  | "noir"
  | "mythic"
  | "desolate"
  | "occult"
  | "sacred";

interface ImageNodeData {
  id: string;
  filename: string;
  label: string;
  slug: string;
  tab: Exclude<CategoryTab, "all">;
}

// 18 unique source images with new category tags
const SOURCE_IMAGES: ImageNodeData[] = [
  { id: "01", filename: "noir/japparii.jpg", label: "JAPPARII", slug: "japparii", tab: "noir" },
  { id: "02", filename: "dark-styled/chromepunk-beast.jpg", label: "CHROMEPUNK BEAST", slug: "chromepunk-beast", tab: "dark-styled" },
  { id: "03", filename: "premium/tanvi.jpg", label: "TANVI", slug: "tanvi", tab: "premium" },
  { id: "04", filename: "dark-styled/glitch-streetwear.jpg", label: "GLITCH STREETWEAR", slug: "glitch-streetwear", tab: "dark-styled" },
  { id: "05", filename: "asthetic/chai-collection.jpg", label: "CHAI COLLECTION", slug: "chai-collection", tab: "aesthetic" },
  { id: "06", filename: "asthetic/instagram.jpg", label: "DIGITAL OVERLAY", slug: "instagram-overlay", tab: "aesthetic" },
  { id: "07", filename: "medival/merlin-knights.jpg", label: "MERLIN KNIGHTS", slug: "merlin-knights", tab: "medieval" },
  { id: "08", filename: "dark-styled/red-refract.jpg", label: "RED REFRACT", slug: "red-refract", tab: "dark-styled" },
  { id: "09", filename: "dark-styled/acg-fleece.jpg", label: "ACG FLEECE", slug: "acg-fleece", tab: "dark-styled" },
  { id: "10", filename: "premium/dee.jpg", label: "DEE", slug: "apparatus-dee", tab: "premium" },
  { id: "11", filename: "dark-styled/download (1).jpg", label: "CORE SHELL A", slug: "core-shell-a", tab: "dark-styled" },
  { id: "12", filename: "dark-styled/download (2).jpg", label: "CORE SHELL B", slug: "core-shell-b", tab: "dark-styled" },
  { id: "13", filename: "dark-styled/download (3).jpg", label: "KINETIC PORTAL", slug: "kinetic-portal", tab: "dark-styled" },
  { id: "14", filename: "medival/faf.jpg", label: "FAF", slug: "apparatus-faf", tab: "medieval" },
  { id: "15", filename: "asthetic/gg.jpg", label: "GG", slug: "apparatus-gg", tab: "aesthetic" },
  { id: "16", filename: "dark-styled/hh.jpg", label: "HH", slug: "apparatus-hh", tab: "dark-styled" },
  { id: "17", filename: "asthetic/kl.jpg", label: "KL", slug: "apparatus-kl", tab: "aesthetic" },
  { id: "18", filename: "premium/chromium-queen.jpg", label: "CHROMIUM QUEEN", slug: "chromium-queen", tab: "premium" },
  { id: "19", filename: "brutalist/fblf.jpg", label: "FBLF", slug: "apparatus-fblf", tab: "brutalist" },
  { id: "20", filename: "medival/fjvfba.jpg", label: "FJVFBA", slug: "apparatus-fjvfba", tab: "medieval" },
  { id: "21", filename: "medival/i  alfa.jpg", label: "IALFA", slug: "apparatus-ialfa", tab: "medieval" },
  { id: "22", filename: "brutalist/ll.jpg", label: "LL", slug: "apparatus-ll", tab: "brutalist" },
  { id: "23", filename: "medival/deepwood-glimmer.jpg", label: "DEEPWOOD GLIMMER", slug: "deepwood-glimmer", tab: "medieval" },
  { id: "24", filename: "asthetic/stippled-dark.jpg", label: "STIPPLED DARK", slug: "stippled-dark", tab: "aesthetic" },
  { id: "25", filename: "asthetic/dajd.jpg", label: "DAJD", slug: "apparatus-dajd", tab: "aesthetic" },
  { id: "26", filename: "asthetic/jjjj.jpg", label: "JJJJ", slug: "apparatus-jjjj", tab: "aesthetic" },
  { id: "27", filename: "brutalist/hoqnl.jpg", label: "HOQNL", slug: "apparatus-hoqnl", tab: "brutalist" },
  { id: "28", filename: "brutalist/ljbfaf.jpg", label: "LJBFAF", slug: "apparatus-ljbfaf", tab: "brutalist" },
  { id: "29", filename: "brutalist/_.jpg", label: "UNDERSCORE", slug: "apparatus-underscore", tab: "brutalist" },
  { id: "30", filename: "medival/hdhd.jpg", label: "HDHD", slug: "apparatus-hdhd", tab: "medieval" },
  { id: "31", filename: "noir/stshsh.jpg", label: "STSHSH", slug: "apparatus-stshsh", tab: "noir" },
  { id: "32", filename: "noir/merged-v3.jpg", label: "MERGED V3", slug: "apparatus-merged-v3", tab: "noir" },
  { id: "33", filename: "ldhad.jpg", label: "LDHAD", slug: "apparatus-ldhad", tab: "aesthetic" }
];


// Swatch Item Card component with static image preview
function SwatchItem({
  item,
  activeTab
}: {
  item: ImageNodeData;
  activeTab: CategoryTab;
}) {
  const router = useRouter();

  const getEncodedSrc = (filename: string) => {
    const encodedFilename = filename.replace(/#/g, "%23");
    return `/images/components images/${encodedFilename}`;
  };

  return (
    <motion.div
      variants={fadeSlideUp}
      className="relative overflow-hidden bg-[#1a1a1a] rounded-[4px] flex flex-col justify-end border-none shadow-none flex-grow h-full cursor-pointer group transition-[flex] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex-1 hover:flex-[4.5]"
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={getEncodedSrc(item.filename)}
          alt={item.label}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          className="object-cover select-none pointer-events-none group-hover:scale-[1.03] transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 opacity-70 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* Collapsed Rotated Label (Fades out and moves down on hover) */}
      <div
        className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-100 group-hover:opacity-0 group-hover:translate-y-5"
      >
        <span 
          style={{ writingMode: "vertical-rl" }} 
          className="font-mono text-[9px] font-bold text-white uppercase tracking-[0.25em] rotate-180 select-none whitespace-nowrap"
        >
          {item.id} {item.label}
        </span>
      </div>

      {/* Expanded Content Card Sheet (Reveals and moves up on hover) */}
      <div
        className="relative z-10 p-6 flex flex-col gap-3.5 pointer-events-none select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] delay-75 opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0"
      >
        <span className="font-mono text-[8px] text-white/50 tracking-widest uppercase">
          NODE 0{item.id}
        </span>
        <h2 className="font-sans font-black text-2xl text-white tracking-tight leading-none uppercase">
          {item.label}
        </h2>
        <p className="font-sans font-light text-[11px] text-[#cccccc] tracking-normal leading-relaxed max-w-[280px]">
          An interactive shader component built for immersive, physics-driven layouts.
        </p>
        
        <div className="flex gap-2 mt-1">
          <span className="font-mono text-[7px] border border-neutral-700 bg-neutral-900/60 px-2 py-0.5 text-neutral-300 uppercase">
            REACT
          </span>
          <span className="font-mono text-[7px] border border-neutral-700 bg-neutral-900/60 px-2 py-0.5 text-neutral-300 uppercase">
            THREE.JS
          </span>
        </div>

        <button 
          onClick={() => router.push(`/components/${item.slug}?tab=${activeTab}`)}
          className="mt-3 w-fit px-4.5 py-2.5 font-mono text-[8px] uppercase tracking-[0.1em] bg-white hover:bg-neutral-100 text-black rounded-none pointer-events-auto cursor-pointer border-none shadow-md transition-all duration-300"
        >
          VIEW COMPONENT
        </button>
      </div>
    </motion.div>
  );
}

function ComponentsCatalogContent() {
  const searchParams = useSearchParams();

  // State controllers for active tab
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");

  // Sync activeTab state with URL search parameters on mount
  useEffect(() => {
    const tab = searchParams.get("tab");
    const validTabs = ["all", "medieval", "dark-styled", "premium", "aesthetic", "brutalist", "noir", "mythic", "desolate", "occult", "sacred"];
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab as CategoryTab);
    }
  }, [searchParams]);

  const handleCategoryTabChange = (tab: CategoryTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Dynamically filter swatches list based on selected category tab
  const filteredSwatches = activeTab === "all"
    ? SOURCE_IMAGES
    : SOURCE_IMAGES.filter((item) => item.tab === activeTab);

  return (
    <div className="w-full h-screen flex flex-col bg-[#0A0A0A] text-white overflow-hidden select-none">
      
      {/* 1. Brutally Minimal Typographic Header */}
      <motion.header 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="w-full px-12 pt-8 pb-5 flex justify-between items-end bg-transparent border-b border-neutral-900 shrink-0"
      >
        <div className="flex flex-col gap-1">
          <motion.h1 
            variants={fadeSlideUp}
            className="font-sans font-black text-3xl tracking-tight text-white uppercase"
          >
            VESSEL COMPONENTS
          </motion.h1>
          <motion.span 
            variants={fadeSlideUp}
            className="font-sans text-neutral-400 font-light tracking-normal text-[11px] normal-case mt-0.5"
          >
            An open-source React component library for immersive, physics-driven image interactions.
          </motion.span>
        </div>
      </motion.header>

      {/* 2. Bounded Gallery Container Workspace */}
      <main className="flex-grow w-full relative px-12 py-4 flex flex-col gap-3">
        
        {/* Swatch Categories Selector bar */}
        <div className="flex gap-6 font-mono text-[9px] tracking-widest text-[#a6a6ac] select-none h-8 items-center border-b border-neutral-900/60 pb-1 shrink-0">
          <span className="text-white font-black tracking-widest">FILTER</span>
          <div className="flex gap-5 overflow-x-auto no-scrollbar py-1">
            {(["all", "medieval", "dark-styled", "premium", "aesthetic", "brutalist", "noir", "mythic", "desolate", "occult", "sacred"] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleCategoryTabChange(t)}
                className={`cursor-pointer transition-all duration-200 relative pb-1`}
              >
                <span className={activeTab === t ? "text-white font-extrabold" : "text-neutral-500 hover:text-white"}>
                  {t.toUpperCase()}
                </span>
                {activeTab === t && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex-grow w-full h-[65vh] min-h-[460px] max-h-[660px] rounded-[4px] overflow-hidden bg-transparent border border-neutral-950">
          
          {/* Elastic Swatch Accordion (Spacious Dual-Row and Single-Row views) */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            key={activeTab}
            className="absolute inset-0 w-full h-full flex flex-col p-6 gap-3 select-none bg-transparent overflow-hidden"
          >
            {activeTab === "all" ? (
              // Dual-Row Spacious Accordion (Row 1: 01-09, Row 2: 10-18)
              <div className="w-full h-full flex flex-col gap-3">
                {/* Row 1 */}
                <div className="flex-1 flex gap-3 items-stretch min-h-[190px]">
                  {filteredSwatches.slice(0, 9).map((item) => (
                    <SwatchItem
                      key={item.id}
                      item={item}
                      activeTab={activeTab}
                    />
                  ))}
                </div>
                {/* Row 2 */}
                <div className="flex-1 flex gap-3 items-stretch min-h-[190px]">
                  {filteredSwatches.slice(9, 18).map((item) => (
                    <SwatchItem
                      key={item.id}
                      item={item}
                      activeTab={activeTab}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // Single-Row Spacious Filtered Accordion
              <div className="w-full h-full flex gap-3 items-stretch">
                {filteredSwatches.map((item) => (
                  <SwatchItem
                    key={item.id}
                    item={item}
                    activeTab={activeTab}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* 3. Brutally Minimal Editorial Footer */}
      <footer className="w-full px-12 py-5 bg-transparent border-t border-neutral-950 shrink-0 font-mono text-[9px] text-[#55555C] flex justify-between items-center select-none">
        <span>© 2026 VESSEL</span>
        <span>MIT LICENSED</span>
      </footer>
    </div>
  );
}

export default function ComponentsCatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center font-mono text-[9px] uppercase tracking-widest text-[#a6a6ac]">Loading Vessel Components...</div>}>
      <ComponentsCatalogContent />
    </Suspense>
  );
}
