import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
  id: "73",
  label: "Tracklist Gallery",
  filename: "components/tracklist-gallery/hero.webp",
  desc: "Minimalist editorial audio tracklist pairing responsive scroll scrub with album artwork crossfades, synthesized acoustic notch clicks, and dynamic track palette illumination.",
  slug: "tracklist-gallery",
  category: "gallery",
  subtype: "audio-index",
  tags: ["Gallery", "Tracklist", "Audio", "Scroll", "GSAP", "Typography"],
  previewType: "gallery",
  overview: "Editorial audio index mapping vertical scroll scrub directly to album artwork crossfades and track playback. Features synthesized Web Audio haptic notch clicks on track index transitions, responsive track scrubbing, and dynamic ambient background lighting that shifts with each album palette.",
  techStack: ["React", "GSAP", "Web Audio API", "TypeScript"],
  useCases: [
    "Record label and artist discography pages showcasing album releases with synchronized audio previews and artwork crossfades.",
    "Podcast network landing sites letting listeners scrub through season episodes with chapter metadata and ambient mood lighting.",
    "Soundtrack and sound design portfolio sites featuring interactive audio reels that respond with tactile acoustic clicks on scroll."
  ],
  engineeringNotes: [
    "Synthesizes procedural mechanical tick audio via AudioContext bandpass noise bursts on track boundary crossings.",
    "Drives smooth scroll inertia and artwork crossfade timelines with sub-pixel GSAP tween interpolation.",
    "Extracts and transitions dynamic ambient background glows to mirror active track color palettes in real time."
  ],
  controls: [
    {
      type: "slider",
      key: "scrubSmoothness",
      label: "Scrub Weight",
      default: 0.8,
      min: 0.1,
      max: 2.0,
      step: 0.1,
      unit: "s",
      description: "Adjusts the inertia smoothing duration in seconds when scrolling through the track list."
    },
    {
      type: "slider",
      key: "titleSize",
      label: "Title Size",
      default: 72,
      min: 36,
      max: 120,
      step: 2,
      unit: "px",
      description: "Sets the typographic font size in pixels for the right-hand active track headlines."
    },
    {
      type: "slider",
      key: "artworkCrossfade",
      label: "Artwork Crossfade",
      default: 0.5,
      min: 0.1,
      max: 1.5,
      step: 0.1,
      unit: "s",
      description: "Controls the crossfade transition duration in seconds between adjacent album sleeves."
    },
    {
      type: "slider",
      key: "itemScrollDistance",
      label: "Track Height",
      default: 400,
      min: 200,
      max: 800,
      step: 50,
      unit: "px",
      description: "Sets the virtual scroll height in pixels required to advance between consecutive tracks."
    }
  ]
};
