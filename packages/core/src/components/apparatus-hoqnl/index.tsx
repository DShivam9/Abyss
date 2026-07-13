import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { ApparatusHoqnlProps } from "./types";
import vert from "./shader.vert.glsl";
import frag from "./shader.frag.glsl";

export const ApparatusHoqnl: React.FC<ApparatusHoqnlProps> = ({
  imageSrc,
  className = "",
  style,
  onLifecycleChange,
}) => {
  // 1. Programmatically generate character atlas texture once
  const [atlasTex] = useState<THREE.CanvasTexture | null>(() => {
    if (typeof document === "undefined") return null;
    const charCanvas = document.createElement("canvas");
    const charCount = 8;
    const charWidth = 64;
    const charHeight = 64;
    charCanvas.width = charWidth * charCount;
    charCanvas.height = charHeight;
    const ctx = charCanvas.getContext("2d");
    
    if (ctx) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, charCanvas.width, charCanvas.height);
      
      ctx.fillStyle = "white";
      // Raw brutalist bold monospaced typography
      ctx.font = '900 46px "Courier New", Courier, monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const chars = [" ", ".", "-", "+", "=", "*", "#", "@"];
      for (let i = 0; i < charCount; i++) {
        const x = i * charWidth + charWidth / 2;
        const y = charHeight / 2;
        ctx.fillText(chars[i], x, y);
      }
    }
    const tex = new THREE.CanvasTexture(charCanvas);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    return tex;
  });

  // Cleanup texture on unmount
  useEffect(() => {
    return () => {
      if (atlasTex) atlasTex.dispose();
    };
  }, [atlasTex]);

  return (
    <div
      style={style}
      className={`w-full relative select-none bg-[#050507] border-4 border-[#121216] ${className}`}
    >
      {/* 3D WebGL Canvas via VesselCanvas wrapper */}
      <VesselCanvas
        imageSrc={imageSrc}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={{
          tAtlas: atlasTex,
        }}
        onLifecycleChange={onLifecycleChange}
        ariaLabel="Interactive ASCII inspect loupe. Hovering reveals a high-resolution window of the image under the cursor, surrounded by a glowing warning border, while the rest remains represented as monospaced ASCII glyphs."
      />
    </div>
  );
};

export default ApparatusHoqnl;
