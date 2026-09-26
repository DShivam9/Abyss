import React, { useRef } from "react";
import * as THREE from "three";
import { AbyssCanvas } from "../../engine/AbyssCanvas";
import { BronzeTransmutationProps } from "./types";
import vert from "./shader.vert.glsl";
import frag from "./shader.frag.glsl";

export const BronzeTransmutation: React.FC<BronzeTransmutationProps> = (props) => {
  const hoverActiveRef = useRef(0.0);
  const clickWaveRef = useRef(0.0);
  const lastMouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const velocityRef = useRef(new THREE.Vector2(0.0, 0.0));

  const handleAnimate = (material: THREE.ShaderMaterial, _clock: THREE.Clock, delta: number) => {
    const uMouse = material.uniforms.uMouse.value as THREE.Vector2;
    const uHover = material.uniforms.uHover.value as number;

    // Calculate cursor delta on this frame
    const deltaX = uMouse.x - lastMouseRef.current.x;
    const deltaY = uMouse.y - lastMouseRef.current.y;

    // Scale up and damp the velocity vector
    const targetVelocityX = deltaX * 18.0;
    const targetVelocityY = deltaY * 18.0;

    const vf = 1 - Math.pow(0.92, delta * 60);
    velocityRef.current.set(
      velocityRef.current.x + (targetVelocityX - velocityRef.current.x) * vf,
      velocityRef.current.y + (targetVelocityY - velocityRef.current.y) * vf
    );

    // Save mouse coordinate for the next frame delta
    lastMouseRef.current.copy(uMouse);

    // Smoothly interpolate hover state
    hoverActiveRef.current += (uHover - hoverActiveRef.current) * (1 - Math.pow(0.93, delta * 60));
    
    // Decay click surge
    clickWaveRef.current *= Math.pow(0.94, delta * 60);

    if (material.uniforms.uHoverActive) {
      material.uniforms.uHoverActive.value = hoverActiveRef.current;
    }
    if (material.uniforms.uClickWave) {
      material.uniforms.uClickWave.value = clickWaveRef.current;
    }
    if (material.uniforms.uVelocity) {
      material.uniforms.uVelocity.value.copy(velocityRef.current);
    }
  };

  const handleClickCanvas = () => {
    clickWaveRef.current = 1.0;
  };

  return (
    <AbyssCanvas
      {...props}
      vertexShader={vert}
      fragmentShader={frag}
      uniforms={{
        uHoverActive: 0.0,
        uClickWave: 0.0,
        uVelocity: new THREE.Vector2(0.0, 0.0),
      }}
      onAnimate={handleAnimate}
      onClickCanvas={handleClickCanvas}
      subdivisions={{ x: 32, y: 32 }}
      ariaLabel="Interactive woodblock print registration drift. Moving the mouse dynamically slides and misaligns the CMYK color channels globally, revealing the raw textured paper in the gaps."
    />
  );
};

export default BronzeTransmutation;
