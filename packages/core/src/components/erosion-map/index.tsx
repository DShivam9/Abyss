"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ErosionMapProps } from "./types";
import { DEFAULT_IMAGES } from "./constants";
import { usePerformance } from "../../engine/PerformanceProvider";
import { useLatestRef } from "../../hooks/use-latest-ref";
import { createErosionScene, ErosionSceneHandle } from "./scene";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const ErosionMap: React.FC<ErosionMapProps> = ({
  images: propImages,
  imageSrc,
  noiseScale,
  edgeGlow,
  octaves: propOctaves = 3,
  windPattern: propWindPattern = "linear",
  windAngle: propWindAngle = 180,
  windStretch: propWindStretch = 2.5,
  curvePower: propCurvePower = 1.0,
  erosionDamper = 1.0,
  className = "",
  style,
  onLifecycleChange,
  scrollProgress: propScrollProgress
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleCanvasRef = useRef<HTMLCanvasElement>(null);
  const sceneHandleRef = useRef<ErosionSceneHandle | null>(null);

  const perf = usePerformance();

  const grainScale = noiseScale !== undefined ? noiseScale : 0.005;
  const octaves = propOctaves;
  const windPattern = propWindPattern;
  const windAngle = propWindAngle;
  const windStretch = propWindStretch;
  const edgeWidth = edgeGlow !== undefined ? edgeGlow * 0.03 : 0.04;
  const edgeColor = useMemo(() => ({ r: 223, g: 177, b: 91 }), []);
  const curvePower = propCurvePower;

  const [localScrollProgress, setLocalScrollProgress] = useState(0);
  const scrollProgress = propScrollProgress !== undefined ? propScrollProgress : localScrollProgress;
  const scrollProgressRef = useLatestRef(scrollProgress);

  const displayImages = useMemo(() => {
    if (propImages && propImages.length > 1) return propImages;
    const base = imageSrc ? [imageSrc] : [];
    const combined = [...base];
    for (const img of DEFAULT_IMAGES) {
      if (combined.length >= 8) break;
      if (!combined.includes(img)) combined.push(img);
    }
    return combined;
  }, [propImages, imageSrc]);

  // Lifecycle monitoring
  useEffect(() => {
    onLifecycleChange?.("discovery");
    const timer = setTimeout(() => onLifecycleChange?.("idle"), 1000);
    return () => clearTimeout(timer);
  }, [onLifecycleChange]);

  // GSAP pinned timeline
  useGSAP(() => {
    if (propScrollProgress !== undefined) return;
    const el = containerRef.current;
    if (!el) return;

    ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "+=6000%",
      pin: true,
      scrub: 1.5,
      onUpdate: (self) => {
        setLocalScrollProgress(self.progress);
        onLifecycleChange?.(self.progress > 0 && self.progress < 1 ? "buildUp" : "idle");
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === el) trigger.kill();
      });
    };
  }, [propScrollProgress, onLifecycleChange]);

  // Fallback wheel scroll listener if scroll height is limited
  useEffect(() => {
    if (propScrollProgress !== undefined) return;
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setLocalScrollProgress((prev) => {
        const delta = e.deltaY * 0.00015;
        const next = Math.max(0, Math.min(1, prev + delta));
        onLifecycleChange?.(next > 0 && next < 1 ? "buildUp" : "idle");
        return next;
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [propScrollProgress, onLifecycleChange]);

  // Scene lifecycle
  useEffect(() => {
    const canvas = visibleCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const loadedImages = displayImages.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const handle = createErosionScene(
      canvas,
      container,
      {
        grainScale,
        octaves,
        windPattern,
        windAngle,
        windStretch,
        edgeWidth,
        edgeColor,
        curvePower,
        erosionDamper,
        scrollProgress: scrollProgressRef.current,
        dpr: perf.dpr,
        reducedMotion: perf.reducedMotion
      },
      loadedImages
    );
    sceneHandleRef.current = handle;

    return () => {
      handle.dispose();
      sceneHandleRef.current = null;
    };
  }, [displayImages]);

  // Update dynamic config on prop changes
  useEffect(() => {
    sceneHandleRef.current?.updateConfig({
      grainScale,
      octaves,
      windPattern,
      windAngle,
      windStretch,
      edgeWidth,
      edgeColor,
      curvePower,
      erosionDamper,
      scrollProgress,
      dpr: perf.dpr,
      reducedMotion: perf.reducedMotion
    });
  }, [
    grainScale,
    octaves,
    windPattern,
    windAngle,
    windStretch,
    edgeWidth,
    edgeColor,
    curvePower,
    erosionDamper,
    scrollProgress,
    perf.dpr,
    perf.reducedMotion
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden bg-[#070708] ${className}`.trim()}
      style={style}
    >
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay z-10" />
      <canvas ref={visibleCanvasRef} className="w-full h-full object-cover block" />
    </div>
  );
};

export default ErosionMap;
