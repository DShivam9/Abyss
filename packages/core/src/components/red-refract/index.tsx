import React from "react";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { VesselComponentProps } from "../../engine/types";
import vert from "./shader.vert.glsl";
import frag from "./shader.frag.glsl";

export const RedRefract: React.FC<VesselComponentProps> = (props) => {
  return (
    <VesselCanvas
      {...props}
      vertexShader={vert}
      fragmentShader={frag}
      subdivisions={{ x: 1, y: 1 }}
    />
  );
};

export default RedRefract;