import React, { useRef } from "react";
import * as THREE from "three";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { VesselComponentProps } from "../../engine/types";
import vert from "./shader.vert.glsl";
import frag from "./shader.frag.glsl";

export const WaveRipple: React.FC<VesselComponentProps> = (props) => {
  const rippleCenters = useRef<THREE.Vector2[]>(
    Array(6).fill(0).map(() => new THREE.Vector2(0.5, 0.5))
  );
  const rippleTimes = useRef<number[]>(Array(6).fill(0));
  const rippleIntensities = useRef<number[]>(Array(6).fill(0));
  const rippleIndex = useRef(0);

  const handleClickCanvas = (uv: THREE.Vector2, clock: THREE.Clock) => {
    const idx = rippleIndex.current;
    rippleCenters.current[idx].copy(uv);
    rippleTimes.current[idx] = clock.getElapsedTime();
    rippleIntensities.current[idx] = 1.0;
    rippleIndex.current = (idx + 1) % 6;
  };

  const handleAnimate = (material: THREE.ShaderMaterial) => {
    for (let i = 0; i < 6; i++) {
      if (rippleIntensities.current[i] > 0.0) {
        rippleIntensities.current[i] -= 0.004;
        if (rippleIntensities.current[i] < 0.0) rippleIntensities.current[i] = 0.0;
      }
    }
    material.uniforms.uRippleCenters.value = rippleCenters.current;
    material.uniforms.uRippleTimes.value = [...rippleTimes.current];
    material.uniforms.uRippleIntensities.value = [...rippleIntensities.current];
  };

  return (
    <VesselCanvas
      {...props}
      vertexShader={vert}
      fragmentShader={frag}
      uniforms={{
        uRippleCenters: rippleCenters.current,
        uRippleTimes: rippleTimes.current,
        uRippleIntensities: rippleIntensities.current,
      }}
      onClickCanvas={handleClickCanvas}
      onAnimate={handleAnimate}
      subdivisions={{ x: 1, y: 1 }}
    />
  );
};

export default WaveRipple;