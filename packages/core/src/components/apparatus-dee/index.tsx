import React, { useRef } from "react";
import * as THREE from "three";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { VesselComponentProps } from "../../engine/types";
import vert from "./shader.vert.glsl";
import frag from "./shader.frag.glsl";

export const ChromeFlow: React.FC<VesselComponentProps> = (props) => {
  const hoverStart = useRef<number | null>(null);

  const handleAnimate = (material: THREE.ShaderMaterial) => {
    if (material.uniforms.uHover.value > 0.05) {
      if (hoverStart.current === null) {
        hoverStart.current = performance.now();
      }
      material.uniforms.uHoverTime.value = (performance.now() - hoverStart.current) / 1000;
    } else {
      hoverStart.current = null;
      material.uniforms.uHoverTime.value = 0.0;
    }
  };

  return (
    <VesselCanvas
      {...props}
      vertexShader={vert}
      fragmentShader={frag}
      uniforms={{
        uHoverTime: 0.0,
      }}
      onAnimate={handleAnimate}
      subdivisions={{ x: 64, y: 64 }}
    />
  );
};

export default ChromeFlow;