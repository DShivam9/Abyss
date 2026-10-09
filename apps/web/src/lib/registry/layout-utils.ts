import { ComponentDetail } from "./types";

export const SELF_CONTAINED_SCROLL = new Set([
  "dual-wave",
  "parallax-bleed",
  "erosion-map",
  "mosaic-loader",
  "cinema-aisle",
  "cyclorama-matrix",
  "paper-curve",
  "gooey-loop",
]);

export const FULL_BLEED_SHADERS = new Set<string>();

export function getLayoutType(meta: ComponentDetail, slug: string) {
  const isSelfContainedScroll = SELF_CONTAINED_SCROLL.has(slug);
  const isFullBleed = FULL_BLEED_SHADERS.has(slug);
  const previewType = meta.previewType || (meta.category === "scroll" ? "scroll" : meta.category === "text" ? "text" : "shader");
  const isText = meta.category === "text" || previewType === "text";
  const isScroll = !isText && !isSelfContainedScroll && (previewType === "scroll" || meta.category === "scroll");
  const isGallery = !isText && !isScroll && (isSelfContainedScroll || meta.category === "gallery" || meta.category === "svg" || previewType === "gallery" || (meta.category !== "scroll" && (meta.subtype === "gallery" || meta.subtype === "ring")));
  const isTransition = !isText && !isSelfContainedScroll && (meta.category === "transition" || previewType === "transition");

  return { isSelfContainedScroll, isFullBleed, isText, isScroll, isGallery, isTransition };
}

const DEFAULT_BG = "#070708";

export function getComponentBg(slug: string, meta?: ComponentDetail): string {
  if (meta?.bgColor) return meta.bgColor;
  return DEFAULT_BG;
}
