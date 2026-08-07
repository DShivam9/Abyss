"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface StaticPreviewProps {
  filename: string;
  label: string;
  slug: string;
  priority?: boolean;
}

export function StaticPreview({ filename, label, slug }: StaticPreviewProps) {
  const imagePath = filename
    ? filename.startsWith("http") || filename.startsWith("/")
      ? filename
      : `/images/components images/${filename}`
    : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";

  return (
    <Link
      href={`/showcase/${slug}`}
      className="group relative block w-full overflow-hidden rounded-2xl bg-neutral-950 shadow-md border border-neutral-200/80 transition-all duration-300 hover:shadow-2xl aspect-[16/10]"
    >
      <img
        src={imagePath}
        alt={label}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="w-full h-full object-cover rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02] group-hover:brightness-105"
      />

      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-white shadow-lg">
          <span>OPEN SHOWCASE</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
