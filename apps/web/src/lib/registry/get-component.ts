import { COMPONENT_DETAILS } from "./component-details";
import { COMPONENT_IMPORTS } from "./component-imports";
import { ComponentDetail } from "./types";

export function getComponent(slug: string) {
  const meta = COMPONENT_DETAILS[slug];
  if (!meta) return { Component: null, meta: null };

  let previewType = meta.previewType;
  if (!previewType) {
    const typeMap: Record<string, ComponentDetail["previewType"]> = {
      scroll: "scroll",
      gallery: "gallery",
      transition: "transition",
      text: "text",
      svg: "svg",
    };
    previewType = typeMap[meta.category] || "shader";
  }

  const Component = COMPONENT_IMPORTS[slug];
  return { Component, meta: { ...meta, previewType } };
}
