import React, { useRef } from "react";
import * as THREE from "three";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { ApparatusSteelIntaglioProps } from "./types";
import { VERTEX_SHADER, FRAGMENT_SHADER } from "./shaders";

export const ApparatusSteelIntaglio: React.FC<ApparatusSteelIntaglioProps> = (props) => {
  const clickRef = useRef({ time: 99.0, x: 0.5, y: 0.5 });
  const tiltRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  // Update press coordinates and inject physical tilt impulse on click
  const onClickCanvas = (uv: THREE.Vector2) => {
    clickRef.current = {
      time: 0.0, // trigger hydraulic press
      x: uv.x,
      y: uv.y,
    };

    // Calculate angular tilt impulse proportional to the distance from center
    const cx = uv.x - 0.5;
    const cy = uv.y - 0.5;
    tiltRef.current.vx = cx * 0.38;
    tiltRef.current.vy = -cy * 0.38;
  };

  // Custom frame animation loop to tick timers and solve physics
  const onAnimate = (material: THREE.ShaderMaterial, _clock: THREE.Clock) => {
    // 1. Tick click timer
    if (clickRef.current.time < 99.0) {
      const lastTime = material.uniforms.uClickTime.value;
      if (lastTime > 98.0) {
        clickRef.current.time = 0.0;
      } else {
        clickRef.current.time += 0.016;
      }
    }

    material.uniforms.uClickTime.value = clickRef.current.time;
    material.uniforms.uClickPos.value.copy(clickRef.current);

    // 2. Solve physical spring-inertia tilt for the plate impact wobble
    const springK = 0.085; // restoring spring stiffness
    const damping = 0.86; // air friction damping

    const tilt = tiltRef.current;
    const ax = -tilt.x * springK;
    const ay = -tilt.y * springK;

    tilt.vx = (tilt.vx + ax) * damping;
    tilt.vy = (tilt.vy + ay) * damping;
    
    tilt.x += tilt.vx;
    tilt.y += tilt.vy;

    // Pass the calculated physical tilt angles to the vertex shader
    if (material.uniforms.uTilt) {
      material.uniforms.uTilt.value.set(tilt.x, tilt.y);
    } else {
      material.uniforms.uTilt = { value: new THREE.Vector2(tilt.x, tilt.y) };
    }
  };

  return (
    <VesselCanvas
      {...props}
      vertexShader={VERTEX_SHADER}
      fragmentShader={FRAGMENT_SHADER}
      subdivisions={{ x: 32, y: 32 }}
      uniforms={{
        uClickTime: 99.0,
        uClickPos: new THREE.Vector2(0.5, 0.5),
        uTilt: new THREE.Vector2(0, 0),
      }}
      onClickCanvas={onClickCanvas}
      onAnimate={onAnimate}
      ariaLabel="Industrial steel intaglio printing plate. Hovering behaves like a squeegee, smudging and bleeding the carbon ink channels horizontally along the brushed steel grain. Clicking triggers a hydraulic press stroke, splattering ink and wiggling the plate."
    />
  );
};

export const ApparatusLl = ApparatusSteelIntaglio;
export default ApparatusSteelIntaglio;
