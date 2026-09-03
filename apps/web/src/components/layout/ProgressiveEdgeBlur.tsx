"use client";

import React from "react";

export type ProgressiveEdgeBlurVariant = "pure" | "refractive" | "liquid" | "crt" | "thermal";
export type ProgressiveEdgeBlurPosition = "top" | "bottom" | "both";

export interface ProgressiveEdgeBlurProps {
  position?: ProgressiveEdgeBlurPosition;
  variant?: ProgressiveEdgeBlurVariant;
  height?: number;
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface VignetteSliceProps {
  side: "top" | "bottom";
  variant: ProgressiveEdgeBlurVariant;
  height: number;
  zIndex: number;
}

function VignetteSlice({ side, variant, height, zIndex }: VignetteSliceProps) {
  const isTop = side === "top";
  const direction = isTop ? "to bottom" : "to top";
  const posStyle: React.CSSProperties = isTop
    ? { top: "-32px", height: `${height}px`, zIndex }
    : { bottom: "-32px", height: `${height}px`, zIndex };

  return (
    <div
      className={`fixed inset-x-0 pointer-events-none overflow-hidden ${isTop ? "abyss-edge-top" : "abyss-edge-bottom"}`}
      style={posStyle}
      aria-hidden="true"
    >
      {/* 2. Refractive Glass Lens Curvature */}
      {variant === "refractive" && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backdropFilter: "url(#abyss-edge-glass) blur(1.5px)",
            WebkitBackdropFilter: "url(#abyss-edge-glass) blur(1.5px)",
            maskImage: `linear-gradient(${direction}, #000 0%, #000 45%, transparent 85%)`,
            WebkitMaskImage: `linear-gradient(${direction}, #000 0%, #000 45%, transparent 85%)`,
          }}
        />
      )}

      {/* 3. Liquid Caustic Undulation */}
      {variant === "liquid" && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backdropFilter: "url(#abyss-edge-caustic) blur(2px)",
            WebkitBackdropFilter: "url(#abyss-edge-caustic) blur(2px)",
            maskImage: `linear-gradient(${direction}, #000 0%, #000 40%, transparent 80%)`,
            WebkitMaskImage: `linear-gradient(${direction}, #000 0%, #000 40%, transparent 80%)`,
          }}
        />
      )}

      {/* 4. CRT Phosphor / Louver Line Glass (Calibrated 3px/2px Slits, Pure Zero-Pixel Void) */}
      {variant === "crt" && (
        <div
          className="absolute inset-0 pointer-events-none z-[9]"
          style={{
            backdropFilter: "url(#abyss-edge-louver) contrast(1.55) brightness(1.22) saturate(1.1)",
            WebkitBackdropFilter: "url(#abyss-edge-louver) contrast(1.55) brightness(1.22) saturate(1.1)",
            maskImage: `repeating-linear-gradient(to bottom, #000 0px, #000 3px, transparent 3px, transparent 5px), linear-gradient(${direction}, #000 0%, transparent 85%)`,
            WebkitMaskImage: `repeating-linear-gradient(to bottom, #000 0px, #000 3px, transparent 3px, transparent 5px), linear-gradient(${direction}, #000 0%, transparent 85%)`,
            maskComposite: "intersect",
            WebkitMaskComposite: "destination-in",
          }}
        />
      )}

      {/* 5. Thermal Heat Haze Schlieren */}
      {variant === "thermal" && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backdropFilter: "url(#abyss-edge-thermal) blur(1px)",
            WebkitBackdropFilter: "url(#abyss-edge-thermal) blur(1px)",
            maskImage: `linear-gradient(${direction}, #000 0%, #000 40%, transparent 80%)`,
            WebkitMaskImage: `linear-gradient(${direction}, #000 0%, #000 40%, transparent 80%)`,
          }}
        />
      )}

      {/* 8 Canonical Mathematical Progressive Blur Layers (Doubling Power-of-Two) */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backdropFilter: "blur(0.078125px)",
          WebkitBackdropFilter: "blur(0.078125px)",
          maskImage: `linear-gradient(${direction}, transparent 87.5%, #000 100%)`,
          WebkitMaskImage: `linear-gradient(${direction}, transparent 87.5%, #000 100%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          backdropFilter: "blur(0.15625px)",
          WebkitBackdropFilter: "blur(0.15625px)",
          maskImage: `linear-gradient(${direction}, transparent 75%, #000 87.5% 100%)`,
          WebkitMaskImage: `linear-gradient(${direction}, transparent 75%, #000 87.5% 100%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{
          backdropFilter: "blur(0.3125px)",
          WebkitBackdropFilter: "blur(0.3125px)",
          maskImage: `linear-gradient(${direction}, transparent 62.5%, #000 75% 87.5%, transparent 100%)`,
          WebkitMaskImage: `linear-gradient(${direction}, transparent 62.5%, #000 75% 87.5%, transparent 100%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-[4]"
        style={{
          backdropFilter: "blur(0.625px)",
          WebkitBackdropFilter: "blur(0.625px)",
          maskImage: `linear-gradient(${direction}, transparent 50%, #000 62.5% 75%, transparent 87.5%)`,
          WebkitMaskImage: `linear-gradient(${direction}, transparent 50%, #000 62.5% 75%, transparent 87.5%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          backdropFilter: "blur(1.25px)",
          WebkitBackdropFilter: "blur(1.25px)",
          maskImage: `linear-gradient(${direction}, transparent 37.5%, #000 50% 62.5%, transparent 75%)`,
          WebkitMaskImage: `linear-gradient(${direction}, transparent 37.5%, #000 50% 62.5%, transparent 75%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-[6]"
        style={{
          backdropFilter: "blur(2.5px)",
          WebkitBackdropFilter: "blur(2.5px)",
          maskImage: `linear-gradient(${direction}, transparent 25%, #000 37.5% 50%, transparent 62.5%)`,
          WebkitMaskImage: `linear-gradient(${direction}, transparent 25%, #000 37.5% 50%, transparent 62.5%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-[7]"
        style={{
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          maskImage: `linear-gradient(${direction}, transparent 12.5%, #000 25% 37.5%, transparent 50%)`,
          WebkitMaskImage: `linear-gradient(${direction}, transparent 12.5%, #000 25% 37.5%, transparent 50%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-[8]"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          maskImage: `linear-gradient(${direction}, transparent 0%, #000 12.5% 25%, transparent 37.5%)`,
          WebkitMaskImage: `linear-gradient(${direction}, transparent 0%, #000 12.5% 25%, transparent 37.5%)`,
        }}
      />
    </div>
  );
}

export function ProgressiveEdgeBlur({
  position = "top",
  variant = "liquid",
  height = 210,
  zIndex = 150,
  className = "",
  style = {},
}: ProgressiveEdgeBlurProps) {
  const showTop = position === "top" || position === "both";
  const showBottom = position === "bottom" || position === "both";

  return (
    <div className={`abyss-progressive-edge-blur-root ${className}`} style={style}>
      {/* Universal SVG Filter Definitions */}
      <svg className="fixed w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* Refractive Glass */}
          <filter id="abyss-edge-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.006" numOctaves={2} result="warpNoise" />
            <feDisplacementMap in="SourceGraphic" in2="warpNoise" scale={16} xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* Liquid Caustic */}
          <filter id="abyss-edge-caustic" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="turbulence" baseFrequency="0.03 0.015" numOctaves={3} result="wave" />
            <feDisplacementMap in="SourceGraphic" in2="wave" scale={22} xChannelSelector="G" yChannelSelector="R" />
          </filter>

          {/* Louver Line Glass (CRT Bulge) */}
          <filter id="abyss-edge-louver" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.2" numOctaves={1} result="louverNoise" />
            <feDisplacementMap in="SourceGraphic" in2="louverNoise" scale={2.5} xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* Thermal Haze */}
          <filter id="abyss-edge-thermal" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.06 0.03" numOctaves={3} result="heat" />
            <feDisplacementMap in="SourceGraphic" in2="heat" scale={10} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {showTop && <VignetteSlice side="top" variant={variant} height={height} zIndex={zIndex} />}
      {showBottom && <VignetteSlice side="bottom" variant={variant} height={height} zIndex={zIndex} />}
    </div>
  );
}

export default ProgressiveEdgeBlur;
