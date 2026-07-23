import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ApparatusClipMorphProps } from "./types";

// Morph keyframe targets centered at (50, 50) using exactly 12 vertices each
const SHAPE_KEYFRAMES = {
  star: [
    { x: 50, y: 20 }, { x: 56, y: 39.6 }, { x: 76, y: 35 }, { x: 62, y: 50 },
    { x: 76, y: 65 }, { x: 56, y: 60.4 }, { x: 50, y: 80 }, { x: 44, y: 60.4 },
    { x: 24, y: 65 }, { x: 38, y: 50 }, { x: 24, y: 35 }, { x: 44, y: 39.6 }
  ],
  arch: [
    { x: 50, y: 20 }, { x: 57.5, y: 35 }, { x: 65, y: 50 }, { x: 65, y: 61.7 },
    { x: 65, y: 73.3 }, { x: 65, y: 85 }, { x: 50, y: 85 }, { x: 35, y: 85 },
    { x: 35, y: 73.3 }, { x: 35, y: 61.7 }, { x: 35, y: 50 }, { x: 42.5, y: 35 }
  ],
  shield: [
    { x: 35, y: 18 }, { x: 50, y: 18 }, { x: 65, y: 18 }, { x: 68, y: 32 },
    { x: 68, y: 48 }, { x: 64, y: 64 }, { x: 58, y: 76 }, { x: 50, y: 85 },
    { x: 42, y: 76 }, { x: 36, y: 64 }, { x: 32, y: 48 }, { x: 32, y: 32 }
  ],
  petal: [
    { x: 50, y: 15 }, { x: 53, y: 30 }, { x: 56, y: 45 }, { x: 65, y: 45 },
    { x: 78, y: 52 }, { x: 66, y: 68 }, { x: 50, y: 62 }, { x: 34, y: 68 },
    { x: 22, y: 52 }, { x: 35, y: 45 }, { x: 44, y: 45 }, { x: 47, y: 30 }
  ]
};

const DEFAULT_IMAGES = [
  "/images/components images/Transitions/ChatGPT Image Jul 16, 2026, 06_08_32 PM.png",
  "/images/components images/Transitions/ChatGPT Image Jul 16, 2026, 06_10_44 PM.png",
  "/images/components images/Transitions/ChatGPT Image Jul 16, 2026, 06_11_21 PM.png",
  "/images/components images/Transitions/ChatGPT Image Jul 16, 2026, 06_12_28 PM.png"
];

// Helper to calculate clip path polygon string by scaling and rotating the target shape
const getClipPathString = (progress: number, shape: "star" | "arch" | "shield" | "petal", maxRotation: number) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p === 0) return "none"; // Full bleed resting state

  // Scale the chosen shape from 4.5 (full bleed outside screen) to 0.0 (collapse to center)
  const s = (1 - p) * 4.5;
  const fromFrame = SHAPE_KEYFRAMES[shape];

  // Rotate shape as it morphs/collapses
  const angleRad = (p * maxRotation) * (Math.PI / 180);
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  const pts = fromFrame.map((pt) => {
    const dx = pt.x - 50;
    const dy = pt.y - 50;
    // Rotate coordinates around center (50, 50)
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    return {
      x: 50 + rx * s,
      y: 50 + ry * s
    };
  });

  return `polygon(${pts.map(pt => `${pt.x.toFixed(2)}% ${pt.y.toFixed(2)}%`).join(", ")})`;
};

export const ApparatusClipMorph: React.FC<ApparatusClipMorphProps & {
  selectedShapeMode?: "cycle" | "star" | "arch" | "shield" | "petal";
  customRotation?: number;
  customBleed?: number;
  customGrain?: number;
}> = ({
  images,
  imageSrc,
  className = "",
  style,
  scrollProgress,
  onLifecycleChange,
  selectedShapeMode: propSelectedShapeMode = "cycle",
  customRotation: propCustomRotation = 30,
  customBleed: propCustomBleed = 40,
  customGrain: propCustomGrain = 25,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const rawImages = images && images.length > 0 
    ? images 
    : (imageSrc ? [imageSrc, ...DEFAULT_IMAGES.slice(1)] : DEFAULT_IMAGES);
  const imageList = rawImages.map(url => encodeURI(url));

  // Motion physics parameters derived from props
  const customRotation = propCustomRotation;
  const customBleed = propCustomBleed;
  const customGrain = propCustomGrain;
  const selectedShapeMode = propSelectedShapeMode;



  const targetProgressRef = useRef(0);
  const lerpedProgressRef = useRef(0);
  const [smoothProgress, setSmoothProgress] = useState(0);

  const effectiveProgress = scrollProgress !== undefined ? scrollProgress : smoothProgress;

  useEffect(() => {
    if (scrollProgress !== undefined) return;
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetProgressRef.current = Math.max(0, targetProgressRef.current + e.deltaY * 0.00025);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [scrollProgress]);

  // Inertial RAF animation loop for smooth 60fps clip morphing
  useEffect(() => {
    if (scrollProgress !== undefined) return;
    let animId: number;

    const loop = () => {
      const diff = targetProgressRef.current - lerpedProgressRef.current;
      if (Math.abs(diff) > 0.0001) {
        lerpedProgressRef.current += diff * 0.1;
        setSmoothProgress(lerpedProgressRef.current);
      } else {
        lerpedProgressRef.current = targetProgressRef.current;
        setSmoothProgress(targetProgressRef.current);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [scrollProgress]);

  const handleClick = () => {
    const segmentCount = imageList.length;
    const currentSegment = Math.floor(targetProgressRef.current * segmentCount);
    const targetProgress = (currentSegment + 1) / segmentCount;

    gsap.to(targetProgressRef, {
      current: targetProgress,
      duration: 0.9,
      ease: "power2.inOut",
    });
  };

  // Resolve current active state based on effectiveProgress
  const normalizedProgress = (((effectiveProgress || 0) % 1) + 1) % 1;
  const segmentCount = imageList.length;
  const scaled = normalizedProgress * segmentCount;
  const activeCurrentIndex = Math.max(0, Math.min(Math.floor(scaled), segmentCount - 1));
  const activeNextIndex = (activeCurrentIndex + 1) % segmentCount;
  const activeProgress = scaled - activeCurrentIndex;

  // Lifecycle notifications based on scroll status
  useEffect(() => {
    if (activeProgress === 0) {
      onLifecycleChange?.("idle");
    } else if (activeProgress >= 0.45 && activeProgress <= 0.55) {
      onLifecycleChange?.("peak");
    } else if (activeProgress > 0 && activeProgress < 0.45) {
      onLifecycleChange?.("buildUp");
    } else if (activeProgress > 0.55 && activeProgress < 1) {
      onLifecycleChange?.("recovery");
    }
  }, [activeProgress]);

  // Determine shape for active morph segment
  let activeShape: "star" | "arch" | "shield" | "petal" = "star";
  if (selectedShapeMode === "cycle") {
    const shapes: ("star" | "arch" | "shield" | "petal")[] = ["star", "arch", "shield", "petal"];
    activeShape = shapes[activeCurrentIndex % shapes.length];
  } else {
    activeShape = selectedShapeMode;
  }

  const showIncoming = activeProgress > 0 && activeProgress < 1;

  // Get clip-path for foreground (active image) with dynamic twist rotation
  const foregroundClipPath = getClipPathString(activeProgress, activeShape, customRotation);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`w-full h-full relative overflow-hidden bg-[#070709] flex select-none cursor-pointer ${className}`}
      style={style}
    >
      {/* Interactive HUD */}

      {/* Main Image Viewport Area (Strictly Scroll Controlled) */}
      <div className="w-full h-full relative flex items-center justify-center pointer-events-none">
        {/* Layer 1: Background (Incoming Image) with photochemical warm desaturation fade */}
        {showIncoming ? (
          <div
            className="absolute inset-0 w-full h-full z-10"
            style={{
              backgroundImage: `url("${imageList[activeNextIndex]}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: `saturate(${activeProgress})`
            }}
          />
        ) : (
          <div
            className="absolute inset-0 w-full h-full z-10"
            style={{
              backgroundImage: `url("${imageList[activeCurrentIndex]}")`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          />
        )}

        {/* Layer 2: Foreground (Outgoing / Active Image) with Morph Mask & Photochemical Saturate/Contrast Burn */}
        <div
          className="absolute inset-0 w-full h-full z-20 overflow-hidden"
          style={{
            backgroundImage: `url("${imageList[activeCurrentIndex]}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            clipPath: foregroundClipPath,
            filter: showIncoming 
              ? `saturate(${1 + activeProgress * (customBleed / 100)}) contrast(${1 + activeProgress * (customBleed / 200)}) brightness(${1 + activeProgress * (customBleed / 400)})`
              : "none"
          }}
        >
          {/* Layer 3: Tactile Analog Film Grain Overlay */}
          {showIncoming && customGrain > 0 && (
            <div 
              className="abyss-noise-overlay"
              style={{ opacity: activeProgress * (customGrain / 100) }}
            />
          )}
        </div>
        
        {/* Subtle scroll cue in resting state */}
        {!showIncoming && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none font-mono text-[9px] uppercase tracking-[0.25em] text-white/40 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 backdrop-filter backdrop-blur-sm transition-opacity duration-300 hover:opacity-80">
            Scroll down page to morph
          </div>
        )}
      </div>
    </div>
  );
};

export default ApparatusClipMorph;
