import React from "react";

export interface DualWaveProgressiveBlurProps {
  maxBlur: number;
}

export const DualWaveProgressiveBlur: React.FC<DualWaveProgressiveBlurProps> = ({ maxBlur }) => {
  if (maxBlur <= 0.1) return null;

  const height = Math.max(60, Math.min(220, maxBlur * 36));
  const blurScale = maxBlur / 2.5;

  return (
    <>
      {/* Top Progressive Blur (Masked to bottom) */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none z-30 overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backdropFilter: `blur(${0.078125 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${0.078125 * blurScale}px)`,
            maskImage: "linear-gradient(to bottom, transparent 87.5%, #000 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 87.5%, #000 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            backdropFilter: `blur(${0.15625 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${0.15625 * blurScale}px)`,
            maskImage: "linear-gradient(to bottom, transparent 75%, #000 87.5% 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 75%, #000 87.5% 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[3]"
          style={{
            backdropFilter: `blur(${0.3125 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${0.3125 * blurScale}px)`,
            maskImage: "linear-gradient(to bottom, transparent 62.5%, #000 75% 87.5%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 62.5%, #000 75% 87.5%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[4]"
          style={{
            backdropFilter: `blur(${0.625 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${0.625 * blurScale}px)`,
            maskImage: "linear-gradient(to bottom, transparent 50%, #000 62.5% 75%, transparent 87.5%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 50%, #000 62.5% 75%, transparent 87.5%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            backdropFilter: `blur(${1.25 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${1.25 * blurScale}px)`,
            maskImage: "linear-gradient(to bottom, transparent 37.5%, #000 50% 62.5%, transparent 75%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 37.5%, #000 50% 62.5%, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[6]"
          style={{
            backdropFilter: `blur(${2.5 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${2.5 * blurScale}px)`,
            maskImage: "linear-gradient(to bottom, transparent 25%, #000 37.5% 50%, transparent 62.5%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 25%, #000 37.5% 50%, transparent 62.5%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[7]"
          style={{
            backdropFilter: `blur(${5.0 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${5.0 * blurScale}px)`,
            maskImage: "linear-gradient(to bottom, transparent 12.5%, #000 25% 37.5%, transparent 50%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 12.5%, #000 25% 37.5%, transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[8]"
          style={{
            backdropFilter: `blur(${10.0 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${10.0 * blurScale}px)`,
            maskImage: "linear-gradient(to bottom, transparent 0%, #000 12.5% 25%, transparent 37.5%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 12.5% 25%, transparent 37.5%)",
          }}
        />
      </div>

      {/* Bottom Progressive Blur (Masked to top) */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none z-30 overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backdropFilter: `blur(${0.078125 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${0.078125 * blurScale}px)`,
            maskImage: "linear-gradient(to top, transparent 87.5%, #000 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 87.5%, #000 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            backdropFilter: `blur(${0.15625 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${0.15625 * blurScale}px)`,
            maskImage: "linear-gradient(to top, transparent 75%, #000 87.5% 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 75%, #000 87.5% 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[3]"
          style={{
            backdropFilter: `blur(${0.3125 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${0.3125 * blurScale}px)`,
            maskImage: "linear-gradient(to top, transparent 62.5%, #000 75% 87.5%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 62.5%, #000 75% 87.5%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[4]"
          style={{
            backdropFilter: `blur(${0.625 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${0.625 * blurScale}px)`,
            maskImage: "linear-gradient(to top, transparent 50%, #000 62.5% 75%, transparent 87.5%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 50%, #000 62.5% 75%, transparent 87.5%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            backdropFilter: `blur(${1.25 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${1.25 * blurScale}px)`,
            maskImage: "linear-gradient(to top, transparent 37.5%, #000 50% 62.5%, transparent 75%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 37.5%, #000 50% 62.5%, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[6]"
          style={{
            backdropFilter: `blur(${2.5 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${2.5 * blurScale}px)`,
            maskImage: "linear-gradient(to top, transparent 25%, #000 37.5% 50%, transparent 62.5%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 25%, #000 37.5% 50%, transparent 62.5%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[7]"
          style={{
            backdropFilter: `blur(${5.0 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${5.0 * blurScale}px)`,
            maskImage: "linear-gradient(to top, transparent 12.5%, #000 25% 37.5%, transparent 50%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 12.5%, #000 25% 37.5%, transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none z-[8]"
          style={{
            backdropFilter: `blur(${10.0 * blurScale}px)`,
            WebkitBackdropFilter: `blur(${10.0 * blurScale}px)`,
            maskImage: "linear-gradient(to top, transparent 0%, #000 12.5% 25%, transparent 37.5%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 0%, #000 12.5% 25%, transparent 37.5%)",
          }}
        />
      </div>
    </>
  );
};
