import { AccordionWallItem } from "./types";

export const DEFAULT_ACCORDION_ITEMS: AccordionWallItem[] = [
  {
    id: "01",
    title: "Geigy Graphic",
    image: "/images/components/accordion-wall/full-01.webp",
    moodColor: "#0f2613",
  },
  {
    id: "02",
    title: "Atelier Cashmere",
    image: "/images/components/accordion-wall/full-02.webp",
    moodColor: "#1c1711",
  },
  {
    id: "03",
    title: "Vermilion Flora",
    image: "/images/components/accordion-wall/full-03.webp",
    moodColor: "#1a0d12",
  },
  {
    id: "04",
    title: "Nocturne Feline",
    image: "/images/components/accordion-wall/full-04.webp",
    moodColor: "#1e1914",
  },
  {
    id: "05",
    title: "Vinyl Studio",
    image: "/images/components/accordion-wall/full-05.webp",
    moodColor: "#1a1816",
  },
  {
    id: "06",
    title: "Orbital Rings",
    image: "/images/components/accordion-wall/full-06.webp",
    moodColor: "#1e0d10",
  },
  {
    id: "07",
    title: "Crimson Horizon",
    image: "/images/components/accordion-wall/full-07.webp",
    moodColor: "#260b0e",
  },
  {
    id: "08",
    title: "Frost Seraph",
    image: "/images/components/accordion-wall/full-08.webp",
    moodColor: "#0a141a",
  },
];

export const DEFAULT_PANEL_IMAGES: string[] = DEFAULT_ACCORDION_ITEMS.map((item) => item.image);
