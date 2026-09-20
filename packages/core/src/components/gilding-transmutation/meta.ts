import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
    id: "14",
    label: "Gold Gilding",
    filename: "components/gilding-transmutation/knight-gilding.webp",
    desc: "An alchemical gilding transmutation shader that preserves a high-fidelity medieval egg-tempera portrait in its pristine, full-color idle state, while dynamically crystallizing a wave of embossed gold leaf across the knight's armor and crown on hover.",
    slug: "gilding-transmutation",
    category: "image",
    subtype: "banners",
    tags: ["Alchemical Gilding", "3D Embossed Normal Map", "GPU Wave Simulation"],
    controls: [
      { type: "slider", key: "goldIntensity", label: "Gold Intensity", default: 0.7, min: 0, max: 1, step: 0.01 },
      { type: "slider", key: "waveSpeed", label: "Wave Speed", default: 1, min: 0.1, max: 5, step: 0.1 },
      { type: "toggle", key: "showGoldLeaf", label: "Gold Leaf", default: true }
    ]
  };
