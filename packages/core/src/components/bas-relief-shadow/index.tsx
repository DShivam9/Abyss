import React, { useRef } from "react";
import * as THREE from "three";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { ApparatusIalfaProps } from "./types";
import vert from "./shader.vert.glsl";
import frag from "./shader.frag.glsl";

export const ApparatusIalfa: React.FC<ApparatusIalfaProps> = (props) => {
  const hoverActiveRef = useRef(0.0);
  const clickWaveRef = useRef(0.0);
  const lastMouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const velocityRef = useRef(new THREE.Vector2(0.0, 0.0));

  const handleAnimate = (material: THREE.ShaderMaterial, _clock: THREE.Clock, delta: number) => {
    const uMouse = material.uniforms.uMouse.value as THREE.Vector2;
    const uHover = material.uniforms.uHover.value as number;

    // Calculate cursor coordinate shifts on this frame
    const deltaX = uMouse.x - lastMouseRef.current.x;
    const deltaY = uMouse.y - lastMouseRef.current.y;

    // Scale up and damp the velocity wind vectors
    const targetVelocityX = deltaX * 18.0;
    const targetVelocityY = deltaY * 18.0;

    const vf = 1 - Math.pow(0.92, delta * 60);
    velocityRef.current.set(
      velocityRef.current.x + (targetVelocityX - velocityRef.current.x) * vf,
      velocityRef.current.y + (targetVelocityY - velocityRef.current.y) * vf
    );

    // Save coordinates for the next frame delta
    lastMouseRef.current.copy(uMouse);

    // Interpolate interactive states
    hoverActiveRef.current += (uHover - hoverActiveRef.current) * (1 - Math.pow(0.94, delta * 60));
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
    <VesselCanvas
      {...props}
      fit="cover"
      className={`!w-full !h-full !max-w-none !max-h-none !aspect-auto absolute inset-0 ${props.className || ""}`}
      style={{ width: "100%", height: "100%", aspectRatio: "auto", ...props.style }}
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
      ariaLabel="Interactive medieval knight stone bas-relief carving with raking torchlight and raymarched contact shadows."
    />
  );
};

export default ApparatusIalfa;
