import React from "react";
import { AbyssComponentProps } from "../../engine/types";

export interface MediaDef {
  file: string;
  type: "image" | "video";
  aspect: number;
}

export interface AssetMetadata {
  title: string;
  pill: string;
}

export interface CycloramaMatrixProps extends AbyssComponentProps {
  media?: MediaDef[];
  metadata?: AssetMetadata[];
  radiusX?: number;
  radiusY?: number;
  baseCamZ?: number;
  zoomCamZ?: number;
  friction?: number;
  className?: string;
  style?: React.CSSProperties;
  onCardClick?: (index: number, meta: AssetMetadata) => void;
}

export interface CardObject {
  mat: import("three").ShaderMaterial;
  bgMat: import("three").ShaderMaterial;
  labelMat: import("three").ShaderMaterial;
  mesh: import("three").Mesh;
  bgMesh: import("three").Mesh;
  labelMesh: import("three").Mesh;
  mediaIndex: number;
  baseX: number;
  baseY: number;
  currentHover: number;
}

export interface MediaPoolItem {
  geom: import("three").PlaneGeometry;
  texture: import("three").Texture;
  vid: HTMLVideoElement | null;
  aspect: number;
  path: string;
  type: "image" | "video";
}
