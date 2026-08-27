import React from "react";

export function GrainOverlay() {
  return (
    <svg
      className="bg-grain"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        opacity: 0.14,
        mixBlendMode: "overlay",
      }}
      aria-hidden="true"
    >
      <filter id="noiseFilter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves={3}
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  );
}
