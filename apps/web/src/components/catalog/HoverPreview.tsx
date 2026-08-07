"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ComponentDetail } from "@/lib/component-registry";

interface HoverPreviewProps {
  activeComponent: ComponentDetail | null;
}

export function HoverPreview({ activeComponent }: HoverPreviewProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!activeComponent) return null;

  const imageSrc = `/images/components images/${activeComponent.filename}`;

  return (
    <div
      className="pointer-events-none fixed z-50 transition-all duration-400 ease-[cubic-bezier(0.33,1,0.68,1)]"
      style={{
        right: "4rem",
        top: `${Math.max(80, Math.min(mousePos.y - 200, window.innerHeight - 440))}px`,
        opacity: activeComponent ? 1 : 0,
        transform: activeComponent ? "scale(1) translateY(0)" : "scale(0.94) translateY(8px)",
      }}
    >
      <div className="relative h-[400px] w-[300px] overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <Image
          src={imageSrc}
          alt={activeComponent.label}
          fill
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] scale-[1.02]"
          sizes="300px"
          unoptimized
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 backdrop-blur-[2px]">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {activeComponent.category}
          </p>
          <p className="font-sans text-sm font-bold tracking-tight text-white mt-0.5">
            {activeComponent.label}
          </p>
        </div>
      </div>
    </div>
  );
}
