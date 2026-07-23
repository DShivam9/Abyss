"use client";

import React, { useState, useEffect, useRef } from "react";

interface ComponentCanvasProps {
  slug: string;
  category: string;
  previewType: "shader" | "scroll" | "gallery" | "transition" | "text";
  Component: React.ComponentType<Record<string, unknown>>;
  imageSrc: string;
  controlValues?: Record<string, number | boolean | string>;
}

export function ComponentCanvas({
  slug,
  previewType,
  Component,
  imageSrc,
  controlValues = {},
}: ComponentCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Smooth LERP scroll-wheel refs
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);

  // Sync refs initially
  useEffect(() => {
    targetProgress.current = 0;
    currentProgress.current = 0;
    setScrollProgress(0);
  }, [previewType]);

  // LERP interpolation loop (60fps smooth physics scroll)
  useEffect(() => {
    if (previewType !== "scroll" && previewType !== "gallery" && previewType !== "transition") return;

    let active = true;
    const tick = () => {
      if (!active) return;

      const diff = targetProgress.current - currentProgress.current;
      // Interpolate when there is meaningful delta to prevent infinite CPU wake lock
      if (Math.abs(diff) > 0.0001) {
        currentProgress.current += diff * 0.035; // Eased LERP factor for heavy, smooth scroll physics
        setScrollProgress(currentProgress.current);

        // Dispatch window scroll event for components listening to scroll position/velocity
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("scroll"));
        }
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return () => {
      active = false;
    };
  }, [previewType]);

  // Wheel tracking (input listener)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || (previewType !== "scroll" && previewType !== "gallery" && previewType !== "transition")) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const factor = previewType === "gallery" ? 0.0001 : slug === "apparatus-erosion-map" ? 0.000025 : 0.00015; // High-precision scroll resolution
      let next = targetProgress.current + e.deltaY * factor;

      // Clamp scroll progress in scroll mode
      if (previewType === "scroll") {
        next = Math.max(0.0, Math.min(1.0, next));
      }

      targetProgress.current = next;

      // Update fake scrollY property for components that read scrollY directly
      const fakeScrollY = window.scrollY + e.deltaY;
      try {
        Object.defineProperty(window, "scrollY", {
          value: fakeScrollY,
          configurable: true,
        });
      } catch {
        // Safe catch
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [previewType, slug]);

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
    progressAtDragStartRef.current = targetProgress.current; // Sync with target progress
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || previewType !== "gallery") return;
    const deltaX = e.clientX - dragStartXRef.current;
    // Normalized displacement
    const width = containerRef.current?.clientWidth || 800;
    const progressDelta = -deltaX / width; // invert drag direction for natural feel
    
    const next = progressAtDragStartRef.current + progressDelta;
    targetProgress.current = next;
    currentProgress.current = next; // Instant tracking during drag
    setScrollProgress(next);
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
          {...controlValues}
        />
      </div>
    );
  }

  if (previewType === "text") {
    return (
      <div className="w-full aspect-video relative bg-[#070708] border border-neutral-900 overflow-hidden flex items-center justify-center rounded-[6px]">
        <Component
          isFullscreen={false}
          className="w-full h-full"
          {...controlValues}
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
          onScrollProgressChange={(val: number) => {
            targetProgress.current = val;
            currentProgress.current = val;
            setScrollProgress(val);
          }}
          isFullscreen={false}
          className="w-full h-full object-cover"
          {...controlValues}
        />
      </div>
    </div>
  );
}
