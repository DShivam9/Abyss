import React, { useEffect, useRef, useState } from "react";
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

export const ApparatusClipMorph: React.FC<ApparatusClipMorphProps> = ({
  images,
  imageSrc,
  className = "",
  style,
  scrollProgress,
  onScrollProgressChange,
  onLifecycleChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  const imageList = images && images.length > 0 
    ? images 
    : (imageSrc ? [imageSrc, ...DEFAULT_IMAGES.slice(1)] : DEFAULT_IMAGES);

  const [dropdownOpen, setDropdownOpen] = useState(true);

  // Motion physics parameter states
  const [customRotation, setCustomRotation] = useState(30); // 0 to 90 deg twist
  const [customBleed, setCustomBleed] = useState(40);       // 0% to 100% saturation burn
  const [customGrain, setCustomGrain] = useState(25);       // 0% to 80% overlay grain opacity

  const [selectedShapeMode, setSelectedShapeMode] = useState<"cycle" | "star" | "arch" | "shield" | "petal">("cycle");

  // Click outside listener for dropdown panel
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (hudRef.current && !hudRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("click", clickOutside);
    return () => window.removeEventListener("click", clickOutside);
  }, []);

  // Resolve current active state based on scrollProgress
  const normalizedProgress = (((scrollProgress || 0) % 1) + 1) % 1;
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

  // Dynamic filling calculations for visual sliders
  const rotationPct = (customRotation / 90) * 100;
  const bleedPct = customBleed;
  const grainPct = (customGrain / 80) * 100;

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden bg-[#070709] flex select-none ${className}`}
      style={style}
    >
      {/* Interactive HUD / Controls */}
      <div
        ref={hudRef}
        className="absolute z-50 pointer-events-auto"
        style={{
          top: "16px",
          right: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="abyss-controls-trigger"
        >
          <span>Morph Control</span>
          <svg 
            width="8" 
            height="8" 
            viewBox="0 0 8 8" 
            fill="none" 
            style={{ 
              transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", 
              transition: "transform 0.3s",
              stroke: "rgba(255, 255, 255, 0.6)",
              strokeWidth: "1.5"
            }}
          >
            <path d="M1 2.5L4 5.5L7 2.5" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="abyss-controls-panel">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Geometry Selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Morph Geometry
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "4px" }}>
                  {(["cycle", "star", "arch", "shield", "petal"] as const).map((shape) => (
                    <button
                      key={shape}
                      onClick={() => setSelectedShapeMode(shape)}
                      style={{
                        gridColumn: shape === "cycle" ? "span 2" : "auto",
                        backgroundColor: selectedShapeMode === shape ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.02)",
                        color: selectedShapeMode === shape ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                        border: `1px solid ${selectedShapeMode === shape ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.05)"}`,
                        borderRadius: "4px",
                        fontSize: "9px",
                        fontFamily: "monospace",
                        padding: "4px",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        outline: "none"
                      }}
                    >
                      {shape === "petal" ? "ivy leaf" : shape}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)", margin: "2px 0" }} />

              {/* Slider 1: Twist Rotation */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                    Twist Rotation
                  </span>
                  <span className="text-[9px] font-mono text-white/50">{customRotation}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="1"
                  value={customRotation}
                  onChange={(e) => setCustomRotation(Number(e.target.value))}
                  style={{
                    width: "100%",
                    background: `linear-gradient(to right, #6ec49a 0%, #6ec49a ${rotationPct}%, rgba(255, 255, 255, 0.08) ${rotationPct}%, rgba(255, 255, 255, 0.08) 100%)`
                  }}
                />
              </div>

              {/* Slider 2: Color Bleed */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                    Color Bleed
                  </span>
                  <span className="text-[9px] font-mono text-white/50">{customBleed}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={customBleed}
                  onChange={(e) => setCustomBleed(Number(e.target.value))}
                  style={{
                    width: "100%",
                    background: `linear-gradient(to right, #6ec49a 0%, #6ec49a ${bleedPct}%, rgba(255, 255, 255, 0.08) ${bleedPct}%, rgba(255, 255, 255, 0.08) 100%)`
                  }}
                />
              </div>

              {/* Slider 3: Film Grain */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                    Film Grain
                  </span>
                  <span className="text-[9px] font-mono text-white/50">{customGrain}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="2"
                  value={customGrain}
                  onChange={(e) => setCustomGrain(Number(e.target.value))}
                  style={{
                    width: "100%",
                    background: `linear-gradient(to right, #6ec49a 0%, #6ec49a ${grainPct}%, rgba(255, 255, 255, 0.08) ${grainPct}%, rgba(255, 255, 255, 0.08) 100%)`
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Image Viewport Area (Strictly Scroll Controlled) */}
      <div className="w-full h-full relative flex items-center justify-center cursor-default">
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
