import React, { useRef } from "react";
import * as THREE from "three";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { VesselComponentProps } from "../../engine/types";
import vert from "./shader.vert.glsl";
import frag from "./shader.frag.glsl";

export const InstagramOverlay: React.FC<VesselComponentProps> = (props) => {
  const clickPosRef = useRef(new THREE.Vector2(0.5, 0.5));
  const clickTimeRef = useRef(-999.0);

  const handleClickCanvas = (uv: THREE.Vector2, clock: THREE.Clock) => {
    clickPosRef.current.copy(uv);
    clickTimeRef.current = clock.getElapsedTime();
  };

  const handleAnimate = (material: THREE.ShaderMaterial) => {
    if (material.uniforms.uClickPos) {
      material.uniforms.uClickPos.value.copy(clickPosRef.current);
    }
    if (material.uniforms.uClickTime) {
      material.uniforms.uClickTime.value = clickTimeRef.current;
    }
  };

  return (
    <VesselCanvas
      {...props}
      vertexShader={vert}
      fragmentShader={frag}
      subdivisions={{ x: 80, y: 80 }}
      uniforms={{
        uClickPos: new THREE.Vector2(0.5, 0.5),
        uClickTime: -999.0,
      }}
      onClickCanvas={handleClickCanvas}
      onAnimate={handleAnimate}
      ariaLabel="Analog Cathode Ray Degauss Magnetic Deflection Simulation"
    />
  );
};

export default InstagramOverlay;