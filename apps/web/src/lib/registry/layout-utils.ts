import { ComponentDetail } from "./types";

export const SELF_CONTAINED_SCROLL = new Set([
  "dual-wave",
  "depth-swim",
  "cylinder-scroll",
  "parallax-bleed",
  "curved-scroll-wipe",
  "erosion-map",
  "clip-morph",
  "mosaic-loader",
]);

export function getLayoutType(meta: ComponentDetail, slug: string) {
  const isSelfContainedScroll = SELF_CONTAINED_SCROLL.has(slug);
  const previewType = meta.previewType || (meta.category === "scroll" ? "scroll" : meta.category === "text" ? "text" : "shader");
  const isText = meta.category === "text" || previewType === "text";
  const isScroll = !isText && !isSelfContainedScroll && (previewType === "scroll" || meta.category === "scroll");
  const isGallery = !isText && !isScroll && (isSelfContainedScroll || meta.category === "gallery" || meta.category === "svg" || previewType === "gallery" || (meta.category !== "scroll" && (meta.subtype === "gallery" || meta.subtype === "ring")));
  const isTransition = !isText && !isSelfContainedScroll && (meta.category === "transition" || previewType === "transition");

  return { isSelfContainedScroll, isText, isScroll, isGallery, isTransition };
}
