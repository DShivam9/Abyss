import { PhotoCaption } from "./types";

export const DEFAULT_IMAGES = Array.from({ length: 24 }, (_, i) => 
  `/images/components/cascade-gallery/photo-${String(i + 1).padStart(2, '0')}.webp`
);

export const PHOTO_CAPTIONS: PhotoCaption[] = [
  { left: "In the silent strike,", right: "the spirit stays unyielding." },
  { left: "Every choice in motion,", right: "shapes what cannot fade." },
  { left: "At the edge of velocity,", right: "the world turns to stillness." },
  { left: "Alone beneath the cosmos,", right: "witnessing architecture of time." },
  { left: "Cold stone and silent peaks,", right: "standing against the wind." },
  { left: "When conviction is tested,", right: "only the resolve endures." },
  { left: "Beneath smoke and fire,", right: "victory needs no defense." },
  { left: "In the arena of giants,", right: "fear gives way to defiance." },
  { left: "The only rival that matters,", right: "is the shadow within." },
  { left: "Behind the dark visor,", right: "the mind locks into clarity." },
  { left: "Quiet watchful eyes,", right: "seeing what shadows conceal." },
  { left: "A spark of light mischief,", right: "in a serious world." },
  { left: "Unbroken in spirit,", right: "running wild across crimson." },
  { left: "A fleeting apparition,", right: "dissolving into memory." },
  { left: "A sea of faces,", right: "each carrying a universe." },
  { left: "Sacred geometry,", right: "poised in timeless grace." },
  { left: "Under the midnight moon,", right: "embracing the dusk." },
  { left: "Defined by shadows,", right: "revealed at the edge of light." },
  { left: "Energy into momentum,", right: "transcending human limits." },
  { left: "Sculpted in ambition,", right: "cast against the darkness." },
  { left: "A flash of burning fury,", right: "roaring into legend." },
  { left: "A battle of wills,", right: "suspended in the dust." },
  { left: "A clean solitary line,", right: "across the silent slope." },
  { left: "Wings against the canopy,", right: "rising in unison." }
];
