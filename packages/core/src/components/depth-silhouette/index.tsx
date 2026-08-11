import React, { useRef } from "react";
import * as THREE from "three";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { ApparatusFblfProps } from "./types";
import vert from "./shader.vert.glsl";
import frag from "./shader.frag.glsl";

export const ApparatusFblf: React.FC<ApparatusFblfProps> = (props) => {
  const lastHoverRef = useRef(0.0);
  const entryOriginRef = useRef(new THREE.Vector2(0.5, 0.5));
  const sweepDirRef = useRef(new THREE.Vector2(0.6, 0.4).normalize());
  const maxDistRef = useRef(1.0);
  const revealProgressRef = useRef(0.0);

  const handleAnimate = (material: THREE.ShaderMaterial) => {
    const uHover = material.uniforms.uHover.value as number;
    const uMouse = material.uniforms.uMouse.value as THREE.Vector2;

    // Capture the entry origin and calculate target direction/distance when hover starts
    if (uHover > 0.0 && lastHoverRef.current === 0.0) {
      entryOriginRef.current.copy(uMouse);

      // Point sweep direction from entry point toward center
      const dirX = 0.5 - uMouse.x;
      const dirY = 0.5 - uMouse.y;
      const length = Math.sqrt(dirX * dirX + dirY * dirY);
      if (length > 0.02) {
        sweepDirRef.current.set(dirX / length, dirY / length);
      } else {
        sweepDirRef.current.set(0.6, 0.4).normalize();
      }

      // Project opposite corner along sweep direction to find max sweep distance
      const oppX = sweepDirRef.current.x >= 0 ? 1.0 : 0.0;
      const oppY = sweepDirRef.current.y >= 0 ? 1.0 : 0.0;
      maxDistRef.current = (oppX - uMouse.x) * sweepDirRef.current.x + (oppY - uMouse.y) * sweepDirRef.current.y;
      if (maxDistRef.current <= 0) maxDistRef.current = 1.0;
    }
    lastHoverRef.current = uHover;

    // Calculate current target peel progress based on mouse projection
    let targetProgress = 0.0;
    if (uHover > 0.0) {
      const proj = (uMouse.x - entryOriginRef.current.x) * sweepDirRef.current.x + 
                   (uMouse.y - entryOriginRef.current.y) * sweepDirRef.current.y;
      targetProgress = Math.max(0.0, Math.min(1.0, proj / maxDistRef.current));
    } else {
      targetProgress = 0.0;
    }

    // Asymmetric organic interpolation: responsive reveal (0.08), slow damped recovery (0.025)
    const easeFactor = uHover > 0.01 ? 0.08 : 0.025;
    revealProgressRef.current = THREE.MathUtils.lerp(revealProgressRef.current, targetProgress, easeFactor);

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
