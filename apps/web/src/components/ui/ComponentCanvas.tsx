"use client";

import React, { useState, useEffect, useRef } from "react";

interface ComponentCanvasProps {
  slug: string;
  category: string;
  previewType: "shader" | "scroll" | "gallery" | "transition";
  Component: React.ComponentType<{
    imageSrc?: string;
    scrollProgress?: number;
    onScrollProgressChange?: (progress: number) => void;
    isFullscreen?: boolean;
    className?: string;
  }>;
  imageSrc: string;
}

export function ComponentCanvas({
  previewType,
  Component,
  imageSrc,
}: ComponentCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);


  // Wheel tracking for scroll/gallery categories
  useEffect(() => {
    const el = containerRef.current;
    if (!el || (previewType !== "scroll" && previewType !== "gallery" && previewType !== "transition")) return;

    const handleWheel = (e: WheelEvent) => {
      // Only prevent default if we're actively interacting
      e.preventDefault();
      e.stopPropagation();
      
      setScrollProgress((prev) => {
        const factor = previewType === "gallery" ? 0.0005 : 0.001;
        const next = prev + e.deltaY * factor;
        
        // Gallery and transition wrap around (circular), Scroll clamps 0 to 1
        if (previewType === "gallery" || previewType === "transition") {
          return next;
        }
        return Math.max(0.0, Math.min(1.0, next));
      });

      // Dispatch fake window scroll event for components like apparatus-underscore
      // that listen directly to window.scrollY/velocity
      const fakeScrollY = window.scrollY + e.deltaY;
      try {
        Object.defineProperty(window, "scrollY", {
          value: fakeScrollY,
          configurable: true,
        });
      } catch {
        // Safe catch block
      }
      window.dispatchEvent(new Event("scroll"));
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [previewType]);

  // Gallery drag state (for apparatus-ribbon and gallery previews)
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const progressAtDragStartRef = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (previewType !== "gallery") return;

    // Ignore drags if the user clicked a button, input, select, or svg inside controls
    const target = e.target as HTMLElement;
    if (
      target.closest("button") || 
      target.closest("input") || 
      target.closest("select") ||
      target.closest("svg")
    ) {
      return;
    }

    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    progressAtDragStartRef.current = scrollProgress;
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || previewType !== "gallery") return;
    const deltaX = e.clientX - dragStartXRef.current;
    // Normalized displacement
    const width = containerRef.current?.clientWidth || 800;
    const progressDelta = -deltaX / width; // invert drag direction for natural feel
    setScrollProgress(progressAtDragStartRef.current + progressDelta);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (previewType !== "gallery") return;
    setIsDragging(false);
    containerRef.current?.releasePointerCapture(e.pointerId);
  };



  if (previewType === "shader") {
    return (
      <div className="w-full max-w-[420px] aspect-[3/4] relative bg-transparent overflow-hidden flex items-center justify-center">
        <Component
          imageSrc={imageSrc}
          isFullscreen={false}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseLeave={() => {
        setIsDragging(false);
      }}
      data-lenis-prevent
      className={`w-full relative bg-[#070708] border border-neutral-900 overflow-hidden select-none flex flex-col justify-between items-center transition-all duration-500 rounded-[6px] aspect-video w-full ${isDragging ? "cursor-grabbing" : previewType === "gallery" ? "cursor-grab" : "cursor-default"}`}
    >
      {/* Main Canvas Component Container */}
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden flex-grow">
        <Component
          imageSrc={imageSrc}
          scrollProgress={scrollProgress}
          onScrollProgressChange={setScrollProgress}
          isFullscreen={false}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
