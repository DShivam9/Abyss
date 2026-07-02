import React from "react";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { VesselComponentProps } from "../../engine/types";
import vert from "./shader.vert.glsl";
import frag from "./shader.frag.glsl";

export const ApparatusGg: React.FC<VesselComponentProps> = (props) => {
  return (
    <VesselCanvas
      {...props}
      vertexShader={vert}
      fragmentShader={frag}
      subdivisions={{ x: 32, y: 32 }}
    />
  );
};

export default ApparatusGg;