import { OpticImageItem, OpticGridFx, OpticGridMode, OpticGridScale } from "./types";

export const SCALE_LEVELS: OpticGridScale[] = ["50", "75", "100", "125", "150"];

export const LAYOUT_MODES: { id: OpticGridMode; label: string }[] = [
  { id: "contact", label: "Contact" },
  { id: "cadence", label: "Cadence" },
  { id: "editorial", label: "Editorial" },
  { id: "panorama", label: "Panorama" },
  { id: "drift", label: "Drift" },
  { id: "keystone", label: "Keystone" },
];

export const NEUTRAL_FILTER = "contrast(1) grayscale(0) brightness(1) invert(0) sepia(0) hue-rotate(0deg) blur(0px)";

export const FX_PROFILES: Record<OpticGridFx, { mid: string; durMid: number; durEnd: number } | null> = {
  none: null,
  bloom: {
    mid: "contrast(1) grayscale(0) brightness(1.32) invert(0) sepia(0) hue-rotate(0deg) blur(4.5px)",
    durMid: 0.48,
    durEnd: 0.72,
  },
  halide: {
    mid: "contrast(1.45) grayscale(0.85) brightness(1.25) invert(0) sepia(0) hue-rotate(0deg) blur(2px)",
    durMid: 0.48,
    durEnd: 0.72,
  },
  xray: {
    mid: "contrast(1.35) grayscale(0) brightness(1.15) invert(0.9) sepia(0) hue-rotate(180deg) blur(2px)",
    durMid: 0.48,
    durEnd: 0.72,
  },
  cyanotype: {
    mid: "contrast(1.35) grayscale(1) brightness(0.95) invert(0) sepia(0.65) hue-rotate(190deg) blur(2.5px)",
    durMid: 0.48,
    durEnd: 0.72,
  },
  obsidian: {
    mid: "contrast(2.2) grayscale(0) brightness(0.72) invert(0.2) sepia(0) hue-rotate(0deg) blur(2px)",
    durMid: 0.48,
    durEnd: 0.72,
  },
};

export const FX_OPTIONS: { id: OpticGridFx; label: string }[] = [
  { id: "none", label: "Clean" },
  { id: "bloom", label: "Bloom" },
  { id: "halide", label: "Halide" },
  { id: "xray", label: "X-Ray" },
  { id: "cyanotype", label: "Cyanotype" },
  { id: "obsidian", label: "Obsidian" },
];

export const DEFAULT_OPTIC_IMAGES: OpticImageItem[] = [
  // Row 1
  { src: "/images/components/optic-grid/image-07.webp", width: 1080, height: 1349, aspectRatio: "1080/1349" },
  { src: "/images/components/optic-grid/image-01.webp", width: 735, height: 919, aspectRatio: "735/919" },
  { src: "/images/components/optic-grid/image-08.webp", width: 1080, height: 1351, aspectRatio: "1080/1351" },
  { src: "/images/components/optic-grid/image-06.webp", width: 1080, height: 1349, aspectRatio: "1080/1349" },
  { src: "/images/components/optic-grid/image-12.webp", width: 709, height: 887, aspectRatio: "709/887" },
  { src: "/images/components/optic-grid/image-04.webp", width: 736, height: 1104, aspectRatio: "736/1104" },
  { src: "/images/components/optic-grid/image-09.webp", width: 1080, height: 1350, aspectRatio: "1080/1350" },
  { src: "/images/components/optic-grid/image-16.webp", width: 1080, height: 1080, aspectRatio: "1080/1080" },
  { src: "/images/components/optic-grid/image-02.webp", width: 735, height: 601, aspectRatio: "735/601" },
  { src: "/images/components/optic-grid/image-29.webp", width: 735, height: 490, aspectRatio: "735/490" },
  // Row 2
  { src: "/images/components/optic-grid/image-13.webp", width: 1080, height: 1388, aspectRatio: "1080/1388" },
  { src: "/images/components/optic-grid/image-22.webp", width: 736, height: 1103, aspectRatio: "736/1103" },
  { src: "/images/components/optic-grid/image-03.webp", width: 554, height: 693, aspectRatio: "554/693" },
  { src: "/images/components/optic-grid/image-20.webp", width: 431, height: 750, aspectRatio: "431/750" },
  { src: "/images/components/optic-grid/image-25.webp", width: 736, height: 899, aspectRatio: "736/899" },
  { src: "/images/components/optic-grid/image-10.webp", width: 1080, height: 1350, aspectRatio: "1080/1350" },
  { src: "/images/components/optic-grid/image-05.webp", width: 736, height: 899, aspectRatio: "736/899" },
  { src: "/images/components/optic-grid/image-14.webp", width: 1440, height: 938, aspectRatio: "1440/938" },
  { src: "/images/components/optic-grid/image-15.webp", width: 1080, height: 1289, aspectRatio: "1080/1289" },
  { src: "/images/components/optic-grid/image-28.webp", width: 736, height: 1308, aspectRatio: "736/1308" },
  // Row 3
  { src: "/images/components/optic-grid/image-21.webp", width: 736, height: 919, aspectRatio: "736/919" },
  { src: "/images/components/optic-grid/image-19.webp", width: 736, height: 1104, aspectRatio: "736/1104" },
  { src: "/images/components/optic-grid/image-18.webp", width: 736, height: 920, aspectRatio: "736/920" },
  { src: "/images/components/optic-grid/image-23.webp", width: 736, height: 977, aspectRatio: "736/977" },
  { src: "/images/components/optic-grid/image-17.webp", width: 736, height: 1073, aspectRatio: "736/1073" },
  { src: "/images/components/optic-grid/image-27.webp", width: 736, height: 977, aspectRatio: "736/977" },
  { src: "/images/components/optic-grid/image-11.webp", width: 1080, height: 1440, aspectRatio: "1080/1440" },
  { src: "/images/components/optic-grid/image-26.webp", width: 736, height: 736, aspectRatio: "736/736" },
  { src: "/images/components/optic-grid/image-24.webp", width: 735, height: 917, aspectRatio: "735/917" },
  { src: "/images/components/optic-grid/image-30.webp", width: 736, height: 1104, aspectRatio: "736/1104" },
];
