"use client";

import Link from "next/link";

interface ShowcaseNavProps {
  slug: string;
  label: string;
  category: string;
  id?: string;
}

export function ShowcaseNav({ slug, label, category, id }: ShowcaseNavProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 px-8 flex items-center justify-between bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 z-[900]">
      <div className="flex items-center gap-6">
        <Link
          href={`/components/${slug}`}
          className="font-mono text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
        >
          ← BACK TO SPEC
        </Link>
        <div className="h-4 w-[1px] bg-neutral-800" />
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
            {category} {id ? `• NODE 0${id}` : ""}
          </span>
          <h1 className="font-sans text-sm font-extrabold tracking-wider uppercase text-white">
            {label}
          </h1>
        </div>
      </div>
    </nav>
  );
}
