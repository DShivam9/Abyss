import React, { useRef } from "react";
import * as THREE from "three";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { ApparatusFblfProps } from "./types";
import vert from "./shader.vert.glsl";
import frag from "./shader.frag.glsl";

export const ApparatusFblf: React.FC<ApparatusFblfProps> = (props) => {
  const entryOriginRef = useRef(new THREE.Vector2(0.5, 0.5));
  const sweepDirRef = useRef(new THREE.Vector2(0.6, 0.4).normalize());
  const maxDistRef = useRef(1.0);
  const revealProgressRef = useRef(0.0);

  const handleAnimate = (material: THREE.ShaderMaterial, _clock: THREE.Clock, delta: number) => {
    const uHover = material.uniforms.uHover.value as number;
    const uMouse = material.uniforms.uMouse.value as THREE.Vector2;

    // Stable, elegant diagonal peel vector from top-left to bottom-right
    entryOriginRef.current.set(0.0, 1.0);
    sweepDirRef.current.set(0.7071068, -0.7071068);
    maxDistRef.current = 1.4142136;

    // Smoothly track mouse traversal across the diagonal peel
    let targetProgress = 0.0;
    if (uHover > 0.001) {
      const cursorProj = (uMouse.x * 0.7071068 + (1.0 - uMouse.y) * 0.7071068) / 1.4142136;
      // Responsive blend: base hover activation + cursor position tracking
      targetProgress = THREE.MathUtils.clamp(0.25 + cursorProj * 0.75, 0.0, 1.0) * uHover;
    }

    // Asymmetric organic interpolation: responsive reveal (0.08), slow damped recovery (0.035)
    const easeFactor = uHover > 0.01 ? 0.08 : 0.035;
    revealProgressRef.current += (targetProgress - revealProgressRef.current) * (1 - Math.pow(1 - easeFactor, delta * 60));

    if (material.uniforms.uEntryOrigin) {
      material.uniforms.uEntryOrigin.value.copy(entryOriginRef.current);
    }
    if (material.uniforms.uSweepDir) {
      material.uniforms.uSweepDir.value.copy(sweepDirRef.current);
    }
    if (material.uniforms.uMaxDist) {
      material.uniforms.uMaxDist.value = maxDistRef.current;
    }
    if (material.uniforms.uRevealProgress) {
      material.uniforms.uRevealProgress.value = revealProgressRef.current;
    }
  };

  return (
    <VesselCanvas
      {...props}
      vertexShader={vert}
      fragmentShader={frag}
      uniforms={{
        uEntryOrigin: new THREE.Vector2(0.5, 0.5),
        uSweepDir: new THREE.Vector2(0.6, 0.4).normalize(),
        uMaxDist: 1.0,
        uRevealProgress: 0.0,
      }}
      onAnimate={handleAnimate}
      subdivisions={{ x: 1, y: 1 }}
      ariaLabel="Halftone matrix grid visual effect. Convers the image into monochromatic dots that dynamically fade and open to reveal the colored high-fidelity photograph on cursor hover."
    />
  );
};

export default ApparatusFblf;
