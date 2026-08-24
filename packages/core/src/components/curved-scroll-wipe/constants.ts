export const SECTIONS = [
  {
    id: "sec-1",
    bg: "#070709",
    text: "#FFFFFF",
    number: "01",
    numberColor: "#00E5FF",
    title: "KINETIC BOUNDARY",
    desc: "A spatial transition engine driven by continuous Bezier vector morphing and hardware-accelerated 120 FPS physics.",
    image: "/images/components/curved-scroll-wipe/slide-02.webp",
    shapeLeft: "/images/shapes/Shape%203.svg",
    shapeRight: "/images/shapes/Shape%2015.svg",
  },
  {
    id: "sec-2",
    bg: "#FFFFFF",
    text: "#070709",
    number: "02",
    numberColor: "#0055FF",
    title: "TACTILE SPATIAL FLOW",
    desc: "Seamless visual handoffs where sections glide physically across the viewport, bridging typography and photography.",
    imageMain: "/images/components/curved-scroll-wipe/slide-01.webp",
    imageSecondary: "/images/components/curved-scroll-wipe/slide-03.webp",
    shapeAccent: "/images/shapes/Shape%208.svg",
  },
  {
    id: "sec-3",
    bg: "#070709",
    text: "#FFFFFF",
    number: "03",
    numberColor: "#00FF66",
    title: "MONOLITHIC RESONANCE",
    desc: "Built with zero-allocation RAF engines and normalized SVG objectBoundingBox path coordinates for 100% responsive scaling.",
    heroImage: "/images/components/curved-scroll-wipe/slide-04.webp",
    cards: [
      {
        icon: "/images/shapes/Shape%205.svg",
        color: "#00E5FF",
        title: "BEZIER MASKING",
        desc: "Dynamic quadratic curve paths scaling elastically with scroll progress.",
      },
      {
        icon: "/images/shapes/Shape%2012.svg",
        color: "#00FF66",
        title: "120 FPS ENGINE",
        desc: "Direct DOM attribute mutations bypassing React state re-renders.",
      },
    ],
  },
  {
    id: "sec-4",
    bg: "#FFFFFF",
    text: "#070709",
    number: "04",
    numberColor: "#FF2A00",
    title: "ABYSS CANVAS STAGE",
    desc: "Elevating component interfaces with taste, physical momentum, and unseen details that compound.",
    gallery: [
      "/images/components/curved-scroll-wipe/slide-01.webp",
      "/images/components/curved-scroll-wipe/slide-02.webp",
      "/images/components/curved-scroll-wipe/slide-03.webp",
    ],
    cta: "EXPLORE SHOWCASE",
    shapeLeft: "/images/shapes/Shape%2018.svg",
    shapeRight: "/images/shapes/Shape%2020.svg",
  },
];

export const TEN_SCATTERED_SHAPES = [
  // 1. Far Top-Left Corner
  { icon: "/images/shapes/Shape%201.svg", color: "#FF0055", pos: "top-8 left-8 sm:top-12 sm:left-12", size: "w-14 h-14 sm:w-18 sm:h-18", rotate: "rotate-12" },
  // 2. Top Left-Center Viewport Margin
  { icon: "/images/shapes/Shape%202.svg", color: "#00E5FF", pos: "top-6 left-[28%]", size: "w-12 h-12 sm:w-16 sm:h-16", rotate: "-rotate-45" },
  // 3. Top Viewport Center Margin
  { icon: "/images/shapes/Shape%203.svg", color: "#00FF66", pos: "top-8 left-[50%] -translate-x-1/2", size: "w-12 h-12 sm:w-16 sm:h-16", rotate: "rotate-45" },
  // 4. Top Right-Center Viewport Margin
  { icon: "/images/shapes/Shape%204.svg", color: "#FFCC00", pos: "top-6 right-[25%]", size: "w-14 h-14 sm:w-18 sm:h-18", rotate: "-rotate-12" },
  // 5. Far Top-Right Corner
  { icon: "/images/shapes/Shape%205.svg", color: "#7928CA", pos: "top-8 right-8 sm:top-12 sm:right-12", size: "w-14 h-14 sm:w-18 sm:h-18", rotate: "rotate-90" },
  // 6. Far Mid-Left Viewport Edge
  { icon: "/images/shapes/Shape%206.svg", color: "#FF0080", pos: "top-1/2 left-6 sm:left-10 -translate-y-1/2", size: "w-14 h-14 sm:w-18 sm:h-18", rotate: "-rotate-30" },
  // 7. Far Mid-Right Viewport Edge
  { icon: "/images/shapes/Shape%207.svg", color: "#0070F3", pos: "top-1/2 right-6 sm:right-10 -translate-y-1/2", size: "w-14 h-14 sm:w-18 sm:h-18", rotate: "rotate-30" },
  // 8. Far Bottom-Left Corner
  { icon: "/images/shapes/Shape%208.svg", color: "#FF4D00", pos: "bottom-8 left-8 sm:bottom-12 sm:left-12", size: "w-14 h-14 sm:w-18 sm:h-18", rotate: "-rotate-15" },
  // 9. Bottom Viewport Center Margin
  { icon: "/images/shapes/Shape%209.svg", color: "#7000FF", pos: "bottom-6 left-[50%] -translate-x-1/2", size: "w-12 h-12 sm:w-16 sm:h-16", rotate: "rotate-45" },
  // 10. Far Bottom-Right Corner
  { icon: "/images/shapes/Shape%2010.svg", color: "#00DF89", pos: "bottom-8 right-8 sm:bottom-12 sm:right-12", size: "w-14 h-14 sm:w-18 sm:h-18", rotate: "-rotate-45" },
];
