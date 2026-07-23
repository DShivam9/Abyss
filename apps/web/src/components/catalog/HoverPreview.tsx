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
      className="pointer-events-none fixed z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        right: "4rem",
        top: `${Math.max(80, Math.min(mousePos.y - 200, window.innerHeight - 440))}px`,
        opacity: activeComponent ? 1 : 0,
        transform: activeComponent ? "scale(1)" : "scale(0.95)",
      }}
    >
      <div className="relative h-[400px] w-[300px] overflow-hidden rounded-[6px] border border-neutral-800 bg-[#0d0d0f] shadow-2xl">
        <Image
          src={imageSrc}
          alt={activeComponent.label}
          fill
          className="object-cover"
          sizes="300px"
          unoptimized
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
          <p className="font-sans text-xs font-medium uppercase tracking-wider text-neutral-400">
            {activeComponent.category}
          </p>
          <p className="font-sans text-sm font-bold text-white">
            {activeComponent.label}
          </p>
        </div>
      </div>
    </div>
  );
}
