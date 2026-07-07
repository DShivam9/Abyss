import React, { useRef } from "react";
import * as THREE from "three";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { VesselComponentProps } from "../../engine/types";
import vert from "./shader.vert.glsl";
import frag from "./shader.frag.glsl";

export const ApparatusGg: React.FC<VesselComponentProps> = (props) => {
  const introTime = useRef(0.0);

  const handleAnimate = (material: THREE.ShaderMaterial) => {
    if (introTime.current < 3.0) {
      introTime.current += 0.016;
    }
    if (material.uniforms.uIntro) {
      material.uniforms.uIntro.value = introTime.current;
    }
  };

  return (
    <VesselCanvas
      {...props}
      vertexShader={vert}
      fragmentShader={frag}
      subdivisions={{ x: 2, y: 2 }}
      uniforms={{
        uIntro: 0.0,
      }}
      onAnimate={handleAnimate}
      className={props.className}
      ariaLabel="Interactive 3D split-flap mechanical timetable display view"
    />
  );
};

export default ApparatusGg;