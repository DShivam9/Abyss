import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ApparatusClipMorphProps } from "./types";
import { DEFAULT_IMAGES } from "./constants";
import { getClipPathString } from "./helpers";

export const ApparatusClipMorph: React.FC<ApparatusClipMorphProps> = ({
  images,
  imageSrc,
  className = "",
  style,
  scrollProgress,
  onLifecycleChange,
  customRotation = 180,
  customBleed = 40,
  customGrain = 25,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const rawImages = images && images.length > 0 
    ? images 
    : (imageSrc ? [imageSrc, ...DEFAULT_IMAGES.slice(1)] : DEFAULT_IMAGES);
  const imageList = rawImages.map(url => encodeURI(url));

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
      targetProgressRef.current = Math.max(0, targetProgressRef.current + e.deltaY * 0.00010);
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
        lerpedProgressRef.current += diff * 0.06;
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

  const showIncoming = activeProgress > 0 && activeProgress < 1;

  // Get clip-path for foreground with dynamic twist rotation
  const foregroundClipPath = getClipPathString(activeProgress, customRotation);

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
