import { ComponentDetail } from "../../types/meta";

export const meta: ComponentDetail = {
    id: "07",
    label: "Knight Wind Banner",
    filename: "components/merlin-knights/knight-banner.webp",
    desc: "A medieval heraldry banner waving in the wind with gold fringe trim and interactive cursor-driven wind physics.",
    slug: "merlin-knights",
    category: "image",
    subtype: "banners",
    tags: ["Medieval Banner", "Wind Physics", "Gold Fringe"],
    controls: [
      { type: "slider", key: "windSpeed", label: "Wind Simulation", default: 0.8, min: 0.1, max: 3.0, step: 0.1, unit: "m/s" }
    ]
  };
