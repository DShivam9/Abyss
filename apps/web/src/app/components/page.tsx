"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { COMPONENT_DETAILS, ComponentDetail } from "@/lib/component-registry";
import { staggerContainer, clipReveal, cardEntrance } from "@/lib/motion/variants";

type CategoryTab = 
  | "all" 
  | "image" 
  | "scroll" 
  | "geometry" 
  | "gallary"
  | "hybrid"
  | "transition"
  | "yet-to-work-on";

const SOURCE_IMAGES = Object.values(COMPONENT_DETAILS);

// Counter up animation component for catalog HUD
function CounterUp({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800; // ms
    const increment = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toString().padStart(2, "0")}</span>;
}

// Category Badge Color Map
const badgeStyles: Record<string, { border: string; text: string; bg: string }> = {
  scroll: { border: "border-[#dfb15b]/20", text: "text-[#dfb15b]", bg: "bg-[#dfb15b]/5" },
  image: { border: "border-neutral-800", text: "text-white", bg: "bg-neutral-900/60" },
  geometry: { border: "border-[#9c8cb9]/20", text: "text-[#9c8cb9]", bg: "bg-[#9c8cb9]/5" },
  gallary: { border: "border-[#c4719d]/20", text: "text-[#c4719d]", bg: "bg-[#c4719d]/5" },
  hybrid: { border: "border-[#5b9cdf]/20", text: "text-[#5b9cdf]", bg: "bg-[#5b9cdf]/5" },
  transition: { border: "border-[#6ec49a]/20", text: "text-[#6ec49a]", bg: "bg-[#6ec49a]/5" },
  "yet-to-work-on": { border: "border-neutral-800/40 border-dashed", text: "text-neutral-500", bg: "bg-neutral-950/20" },
};

function ComponentCard({ item, activeTab, index }: { item: ComponentDetail; activeTab: CategoryTab; index: number }) {
  const router = useRouter();

  const getEncodedSrc = (filename: string) => {
    const encodedFilename = filename.replace(/#/g, "%23");
    return `/images/components%20images/${encodedFilename}`;
  };

  const currentStyles = badgeStyles[item.category] || badgeStyles.image;

  // Bento layout classes based on item id/index to break regular grid patterns
  const getBentoClasses = (idx: number) => {
    // Featured Hero Slots (tall & wide cards)
    if (idx === 0) return "md:col-span-2 md:row-span-2 aspect-[3/4]";
    if (idx === 5 || idx === 12) return "md:col-span-2 aspect-video";
    return "aspect-[3/4]";
  };

  return (
    <motion.div
      custom={index % 8}
      variants={cardEntrance}
      onClick={() => router.push(`/components/${item.slug}?tab=${activeTab}`)}
      className={`group relative flex flex-col bg-[#111113] rounded-[6px] overflow-hidden cursor-pointer select-none border border-neutral-950 transition-all duration-500 hover:border-neutral-900 ${getBentoClasses(
        index
      )}`}
    >
      {/* Visual Workspace Zone */}
      <div className="relative w-full h-full flex-grow overflow-hidden">
        {/* Static Image / Background */}
        <Image
          src={getEncodedSrc(item.filename)}
          alt={item.label}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={index < 8}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />

        {/* Soft background scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 z-20 pointer-events-none" />
      </div>

      {/* Floating Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1 z-30 pointer-events-none">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
            NODE 0{item.id}
          </span>
          <span className={`font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 border rounded-[2px] ${currentStyles.border} ${currentStyles.text} ${currentStyles.bg}`}>
            {item.category.replace(/-/g, " ")}
          </span>
        </div>
        <h3 className="font-sans font-black text-base tracking-tight text-white uppercase mt-0.5">
          {item.label}
        </h3>
      </div>
    </motion.div>
  );
}

function ComponentsCatalogContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");

  useEffect(() => {
    const tab = searchParams.get("tab");
    const validTabs: CategoryTab[] = ["all", "image", "scroll", "geometry", "gallary", "hybrid", "transition", "yet-to-work-on"];
    if (tab && validTabs.includes(tab as CategoryTab)) {
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

  const filteredItems = activeTab === "all"
    ? SOURCE_IMAGES
    : SOURCE_IMAGES.filter((item) => item.category === activeTab);

  // Category counts
  const getCategoryCount = (cat: CategoryTab) => {
    if (cat === "all") return SOURCE_IMAGES.length;
    return SOURCE_IMAGES.filter((i) => i.category === cat).length;
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0A0A0C] text-white select-none font-sans antialiased pb-24">
      {/* Editorial Header */}
      <motion.header 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="w-full px-12 pt-16 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-transparent border-b border-neutral-900 shrink-0"
      >
        <div className="flex flex-col gap-2 overflow-hidden">
          <motion.h1
            variants={clipReveal}
            className="font-sans font-black text-6xl xl:text-7xl tracking-tighter text-white uppercase leading-none"
          >
            ABYSS
          </motion.h1>
          <motion.div
            variants={clipReveal}
            className="flex items-center gap-3 font-mono text-neutral-500 text-[10px] tracking-widest mt-1"
          >
            <span>ACTIVE INTERACTIONS CATALOG</span>
            <span>{"//"}</span>
            <span className="text-white font-bold">
              NODE_COUNT: <CounterUp value={filteredItems.length} />
            </span>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Workspace */}
      <main className="flex-grow w-full relative px-12 py-8 flex flex-col gap-8">
        {/* Pills category filters */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 select-none pb-4 border-b border-neutral-900/40">
          {(["all", "image", "scroll", "geometry", "gallary", "hybrid", "transition", "yet-to-work-on"] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleCategoryTabChange(t)}
              className={`cursor-pointer transition-all duration-300 relative px-4 py-1.5 rounded-full font-mono text-[9px] tracking-wider uppercase border border-neutral-900 ${
                activeTab === t
                  ? "bg-white text-black font-extrabold border-white"
                  : "bg-[#111113]/40 text-neutral-500 hover:text-white hover:border-neutral-800"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {t.replace(/-/g, " ")}
                <span className={`text-[8px] font-bold ${activeTab === t ? "text-neutral-600" : "text-neutral-600"}`}>
                  ({getCategoryCount(t)})
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Bento Masonry Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          key={activeTab}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full mt-4"
        >
          {filteredItems.map((item, idx) => (
            <ComponentCard
              key={item.id}
              item={item}
              activeTab={activeTab}
              index={idx}
            />
          ))}
        </motion.div>
      </main>

      {/* Brutally Minimal Editorial Footer */}
      <footer className="w-full px-12 py-6 bg-transparent border-t border-neutral-900 shrink-0 font-mono text-[9px] text-[#55555C] flex justify-between items-center mt-24">
        <span>© 2026 VESSEL LAB</span>
        <span>MIT LICENSED</span>
      </footer>
    </div>
  );
}

export default function ComponentsCatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center font-mono text-[9px] uppercase tracking-widest text-neutral-500">Loading Vessel Catalog...</div>}>
      <ComponentsCatalogContent />
    </Suspense>
  );
}
