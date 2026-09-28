import React, { useRef } from "react";
import { RippleScrambleProps, RippleScrambleVariant } from "./types";
import { getVariantSpecs } from "./helpers";
import { useRippleCanvas } from "./use-ripple-canvas";
import styles from "./styles.module.css";

export const RippleScramble: React.FC<RippleScrambleProps> = ({
  variant = "classic",
  waveSpeed = 950,
  scrambleDuration = 340,
  fontSize = 24,
  lineHeightScale = 1.65,
  staticOpacity = 0.32,
  className = "",
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { handleClick, handlePointerMove } = useRippleCanvas({
    containerRef,
    canvasRef,
    variant,
    waveSpeed,
    scrambleDuration,
    fontSize,
    lineHeightScale,
    staticOpacity,
  });

  const specs = getVariantSpecs(variant, staticOpacity);

  return (
    <div
      ref={containerRef}
      style={{ backgroundColor: specs.bg, ...style }}
      className={`${styles.container} ${className}`}
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        className={styles.canvas}
      />
      {/* Soft Radial Vignette Mask for Eye-Comfort & Cinematic Depth */}
      <div
        style={{
          background: `radial-gradient(ellipse at center, transparent 35%, ${specs.bg} 95%)`,
        }}
        className={styles.vignette}
      />
    </div>
  );
};

export type { RippleScrambleProps, RippleScrambleVariant };
export default RippleScramble;
