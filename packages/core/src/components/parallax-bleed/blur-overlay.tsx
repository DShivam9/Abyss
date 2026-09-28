import React from "react";
import { BleedBlurVariant } from "./types";

interface BlurOverlayProps {
  blurDepth: number;
  blurVariant: BleedBlurVariant;
}

export const BlurOverlay: React.FC<BlurOverlayProps> = ({ blurDepth, blurVariant }) => {
  return (
    <>
      {/* Inline SVG Optical Displacement Filters for Bleed Edge Falloffs */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="bleed-glass-displacement" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.006" numOctaves={2} result="warpNoise" />
            <feDisplacementMap in="SourceGraphic" in2="warpNoise" scale={16} xChannelSelector="R" yChannelSelector="G" />
          </filter>

          <filter id="bleed-caustic-displacement" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="turbulence" baseFrequency="0.03 0.015" numOctaves={3} result="wave" />
            <feDisplacementMap in="SourceGraphic" in2="wave" scale={22} xChannelSelector="G" yChannelSelector="R" />
          </filter>

          <filter id="bleed-louver-bulge" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.2" numOctaves={1} result="louverNoise" />
            <feDisplacementMap in="SourceGraphic" in2="louverNoise" scale={2.5} xChannelSelector="R" yChannelSelector="G" />
          </filter>

          <filter id="bleed-thermal-displacement" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.06 0.03" numOctaves={3} result="heat" />
            <feDisplacementMap in="SourceGraphic" in2="heat" scale={10} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* 8-Layer Mathematical Progressive Blur Overlay + Curated Flagships */}
      <div
        className="absolute inset-x-0 bottom-[-40px] pointer-events-none z-20 overflow-hidden"
        style={{ height: `${blurDepth}px` }}
      >
        {/* Flagship 2: Refractive Glass */}
        {blurVariant === "refractive" && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backdropFilter: "url(#bleed-glass-displacement) blur(1.5px)",
              WebkitBackdropFilter: "url(#bleed-glass-displacement) blur(1.5px)",
              maskImage: "linear-gradient(to top, #000 0%, #000 45%, transparent 85%)",
              WebkitMaskImage: "linear-gradient(to top, #000 0%, #000 45%, transparent 85%)",
            }}
          />
        )}

        {/* Flagship 3: Liquid Caustic */}
        {blurVariant === "liquid" && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backdropFilter: "url(#bleed-caustic-displacement) blur(2px)",
              WebkitBackdropFilter: "url(#bleed-caustic-displacement) blur(2px)",
              maskImage: "linear-gradient(to top, #000 0%, #000 40%, transparent 80%)",
              WebkitMaskImage: "linear-gradient(to top, #000 0%, #000 40%, transparent 80%)",
            }}
          />
        )}

        {/* Flagship 4: CRT Phosphor / Louver Line Glass */}
        {blurVariant === "crt" && (
          <div
            className="absolute inset-0 pointer-events-none z-[9]"
            style={{
              backdropFilter: "url(#bleed-louver-bulge) contrast(1.55) brightness(1.22) saturate(1.1)",
              WebkitBackdropFilter: "url(#bleed-louver-bulge) contrast(1.55) brightness(1.22) saturate(1.1)",
              maskImage: "repeating-linear-gradient(to bottom, #000 0px, #000 3px, transparent 3px, transparent 5px), linear-gradient(to top, #000 0%, transparent 85%)",
              WebkitMaskImage: "repeating-linear-gradient(to bottom, #000 0px, #000 3px, transparent 3px, transparent 5px), linear-gradient(to top, #000 0%, transparent 85%)",
              maskComposite: "intersect",
              WebkitMaskComposite: "destination-in",
            }}
          />
        )}

        {/* Flagship 5: Thermal Haze */}
        {blurVariant === "thermal" && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backdropFilter: "url(#bleed-thermal-displacement) blur(1px)",
              WebkitBackdropFilter: "url(#bleed-thermal-displacement) blur(1px)",
              maskImage: "linear-gradient(to top, #000 0%, #000 40%, transparent 80%)",
              WebkitMaskImage: "linear-gradient(to top, #000 0%, #000 40%, transparent 80%)",
            }}
          />
        )}

        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backdropFilter: "blur(0.078125px)",
            WebkitBackdropFilter: "blur(0.078125px)",
            maskImage: "linear-gradient(to top, transparent 87.5%, #000 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 87.5%, #000 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            backdropFilter: "blur(0.15625px)",
            WebkitBackdropFilter: "blur(0.15625px)",
            maskImage: "linear-gradient(to top, transparent 75%, #000 87.5% 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 75%, #000 87.5% 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[3]"
          style={{
            backdropFilter: "blur(0.3125px)",
            WebkitBackdropFilter: "blur(0.3125px)",
            maskImage: "linear-gradient(to top, transparent 62.5%, #000 75% 87.5%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 62.5%, #000 75% 87.5%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[4]"
          style={{
            backdropFilter: "blur(0.625px)",
            WebkitBackdropFilter: "blur(0.625px)",
            maskImage: "linear-gradient(to top, transparent 50%, #000 62.5% 75%, transparent 87.5%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 50%, #000 62.5% 75%, transparent 87.5%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            backdropFilter: "blur(1.25px)",
            WebkitBackdropFilter: "blur(1.25px)",
            maskImage: "linear-gradient(to top, transparent 37.5%, #000 50% 62.5%, transparent 75%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 37.5%, #000 50% 62.5%, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[6]"
          style={{
            backdropFilter: "blur(2.5px)",
            WebkitBackdropFilter: "blur(2.5px)",
            maskImage: "linear-gradient(to top, transparent 25%, #000 37.5% 50%, transparent 62.5%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 25%, #000 37.5% 50%, transparent 62.5%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[7]"
          style={{
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            maskImage: "linear-gradient(to top, transparent 12.5%, #000 25% 37.5%, transparent 50%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 12.5%, #000 25% 37.5%, transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[8]"
          style={{
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            maskImage: "linear-gradient(to top, transparent 0%, #000 12.5% 25%, transparent 37.5%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 0%, #000 12.5% 25%, transparent 37.5%)",
          }}
        />
      </div>
    </>
  );
};
