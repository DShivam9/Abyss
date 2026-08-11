import React, { useRef } from "react";
import * as THREE from "three";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { ApparatusFafProps } from "./types";
import vert from "./shader.vert.glsl";
import frag from "./shader.frag.glsl";

export const ApparatusFaf: React.FC<ApparatusFafProps> = (props) => {
  const hoverActiveRef = useRef(0.0);
  const clickWaveRef = useRef(0.0);

  const handleAnimate = (material: THREE.ShaderMaterial) => {
    const uHover = material.uniforms.uHover.value as number;

    // Smoothly interpolate the gilding activation wave front
    hoverActiveRef.current = THREE.MathUtils.lerp(hoverActiveRef.current, uHover, 0.07);
    
    // Decay the click alchemical surge wave
    clickWaveRef.current = THREE.MathUtils.lerp(clickWaveRef.current, 0.0, 0.06);

    // Update custom uniforms
    if (material.uniforms.uHoverActive) {
      material.uniforms.uHoverActive.value = hoverActiveRef.current;
    }
    if (material.uniforms.uClickWave) {
      material.uniforms.uClickWave.value = clickWaveRef.current;
    }
  };

  // Surge the alchemical gilding wave on canvas click
  const handleClickCanvas = () => {
    clickWaveRef.current = 1.0;
  };

  return (
    <VesselCanvas
      {...props}
      vertexShader={vert}
      fragmentShader={frag}
      uniforms={{
        uHoverActive: 0.0,
        uClickWave: 0.0,
      }}
      onAnimate={handleAnimate}
      onClickCanvas={handleClickCanvas}
      subdivisions={{ x: 32, y: 32 }}
      ariaLabel="Illuminated medieval knight. Hovering sweeps a rich, organic wave of gold leaf crystallization across the portrait, adhering to the crown, armor, and sword. Leaving dissolves it back to the colored painting."
    />
  );
};

export default ApparatusFaf;