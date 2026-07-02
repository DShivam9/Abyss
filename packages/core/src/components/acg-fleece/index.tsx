import React from "react";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { VesselComponentProps } from "../../engine/types";
import vert from "./shader.vert.glsl";
import frag from "./shader.frag.glsl";

export const AcgFleece: React.FC<VesselComponentProps> = (props) => {
  return (
    <VesselCanvas
      {...props}
      vertexShader={vert}
      fragmentShader={frag}
      subdivisions={{ x: 64, y: 64 }}
    />
  );
};

export default AcgFleece;