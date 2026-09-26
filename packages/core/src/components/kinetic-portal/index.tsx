import React from "react";
import { AbyssCanvas } from "../../engine/AbyssCanvas";
import { AbyssComponentProps } from "../../engine/types";
import vert from "./shader.vert.glsl";
import frag from "./shader.frag.glsl";

export const KineticPortal: React.FC<AbyssComponentProps> = (props) => {
  return (
    <AbyssCanvas
      {...props}
      vertexShader={vert}
      fragmentShader={frag}
      subdivisions={{ x: 1, y: 1 }}
    />
  );
};

export default KineticPortal;