import React, { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ApparatusLayoutMorphProps } from "./types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CARD_W = 260;
const CARD_H = 340;

const DEFAULT_IMAGES = [
  "/images/components%20images/scroll/cosmos_1309660817.jpeg",
  "/images/components%20images/scroll/cosmos_1859262512.jpeg",
  "/images/components%20images/scroll/cosmos_2063063057.jpeg",
  "/images/components%20images/scroll/cosmos_679994644.jpeg",
  "/images/components%20images/scroll/cosmos_1244425812.jpeg",
  "/images/components%20images/scroll/cosmos_1994819013.jpeg",
  "/images/components%20images/scroll/cosmos_2086495860.jpeg",
  "/images/components%20images/scroll/cosmos_51259133.jpeg",
  "/images/components%20images/scroll/cosmos_586109684.jpeg",
];

const DEFAULT_TITLES = [
  "ANDROMEDA",
  "CYGNUS",
  "VELA",
  "LYRA",
  "ORION",
  "DRACO",
  "AQUILA",
  "PHOENIX",
  "CORVUS",
];

interface CardTransform {
  x: number;
  y: number;
  z: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

function lerp(a: number, b: number, t: number): number {
  return (1 - t) * a + t * b;
}

function applyEasing(t: number, mode: "linear" | "smooth" | "dramatic"): number {
  if (mode === "linear") return t;
  if (mode === "smooth") {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Formation generators
function getConstellation(count: number): CardTransform[] {
  const transforms: CardTransform[] = [];
  const cols = count <= 4 ? 2 : 3;
  const rows = Math.ceil(count / cols);
  const scale = 0.52;
  const gapX = 28;
  const gapY = 28;

  const gridTotalW = cols * CARD_W * scale + (cols - 1) * gapX;
  const gridTotalH = rows * CARD_H * scale + (rows - 1) * gapY;
  const startX = -gridTotalW / 2 + (CARD_W * scale) / 2;
  const startY = -gridTotalH / 2 + (CARD_H * scale) / 2;

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (CARD_W * scale + gapX);
    const y = startY + row * (CARD_H * scale + gapY);
    const rotation = ((i % 2 === 0) ? 1.2 : -1.2) * ((i % 3) + 1) * 0.3;
    transforms.push({ x, y, z: 0, scaleX: scale, scaleY: scale, rotation });
  }
  return transforms;
}

function getHelix(count: number, W: number, H: number): CardTransform[] {
  const transforms: CardTransform[] = [];
  const scale = 0.45;
  const radiusBase = Math.min(W, H) * 0.18;
  const ySpacing = CARD_H * scale * 0.55;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2.5;
    const radius = radiusBase + i * 12;
    const x = Math.cos(angle) * radius;
    const y = (i - (count - 1) / 2) * ySpacing;
    const z = Math.sin(angle) * 120;
    const s = scale - Math.sin(angle) * 0.06;
    const rotation = (angle * 180 / Math.PI) * 0.08;
    transforms.push({ x, y, z, scaleX: s, scaleY: s, rotation });
  }
  return transforms;
}

function getWedge(count: number, W: number, H: number): CardTransform[] {
  const transforms: CardTransform[] = [];
  const scale = 0.48;

  for (let i = 0; i < count; i++) {
    if (i === 0) {
      transforms.push({ x: 0, y: -H * 0.15, z: 30, scaleX: scale, scaleY: scale, rotation: 0 });
    } else {
      const side = (i % 2 !== 0) ? -1 : 1;
      const step = Math.ceil(i / 2);
      const x = side * step * (CARD_W * scale * 1.05);
      const y = -H * 0.15 + step * (CARD_H * scale * 0.42);
      const z = -step * 15;
      const s = scale - step * 0.015;
      const rotation = side * 5;
      transforms.push({ x, y, z, scaleX: s, scaleY: s, rotation });
    }
  }
  return transforms;
}

function getScatter(count: number, W: number, H: number): CardTransform[] {
  const transforms: CardTransform[] = [];
  const scale = 0.42;

  for (let i = 0; i < count; i++) {
    const seedAngle = (i * 137.508) * (Math.PI / 180);
    const seedRadius = Math.sqrt(i / count) * Math.min(W, H) * 0.38;
    const x = Math.cos(seedAngle) * seedRadius;
    const y = Math.sin(seedAngle) * seedRadius * 0.7;
    const z = ((i % 3) - 1) * 60;
    const s = scale + (i % 4) * 0.03;
    const rotation = ((i * 47) % 30) - 15;
    transforms.push({ x, y, z, scaleX: s, scaleY: s, rotation });
  }
  return transforms;
}

function getOrbit(count: number, W: number, H: number): CardTransform[] {
  const transforms: CardTransform[] = [];
  const rx = W * 0.32;
  const ry = H * 0.2;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = rx * Math.cos(angle);
    const y = ry * Math.sin(angle);
    const depth = Math.sin(angle);
    const normalizedDepth = (depth + 1) / 2;
    const z = -80 + normalizedDepth * 160;
    const s = 0.38 + normalizedDepth * 0.14;
    transforms.push({ x, y, z, scaleX: s, scaleY: s, rotation: 0 });
  }
  return transforms;
}

function getRiver(count: number, W: number, H: number): CardTransform[] {
  const transforms: CardTransform[] = [];
  const scale = 0.44;

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1 || 1);
    const x = (t - 0.5) * (W * 0.85);
    const y = Math.sin(t * Math.PI * 2) * (H * 0.2);
    const z = Math.cos(t * Math.PI) * 40;
    const rotation = Math.cos(t * Math.PI * 2) * 10;
    transforms.push({ x, y, z, scaleX: scale, scaleY: scale, rotation });
  }
  return transforms;
}

export const ApparatusLayoutMorph: React.FC<ApparatusLayoutMorphProps> = ({
  images = DEFAULT_IMAGES,
  titles = DEFAULT_TITLES,
  scrollProgress: propScrollProgress,
  cardCount = 9,
  travelRotation = true,
  perspective = 1200,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  const [localProgress, setLocalProgress] = useState(0);
  const [currentFormationName, setCurrentFormationName] = useState("CONSTELLATION");
  const [scrollPct, setScrollPct] = useState(0);

  const displayImages = images.length > 0 ? images.slice(0, cardCount) : DEFAULT_IMAGES.slice(0, cardCount);
  const displayTitles = titles.length > 0 ? titles.slice(0, cardCount) : DEFAULT_TITLES.slice(0, cardCount);

  const lerpedProgressRef = useRef(0);

  // Smooth wheel & touch scroll handler for standalone container
  useEffect(() => {
    if (propScrollProgress !== undefined) return;
    const el = containerRef.current;
    if (!el) return;

    let targetProg = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetProg = Math.max(0, Math.min(1, targetProg + e.deltaY * 0.0006));
      setLocalProgress(targetProg);
      onLifecycleChange?.(targetProg > 0 && targetProg < 1 ? "buildUp" : "idle");
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [propScrollProgress, onLifecycleChange]);

  const updateFormations = (prog: number) => {
    const W = containerRef.current?.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 1200);
    const H = containerRef.current?.clientHeight || (typeof window !== "undefined" ? window.innerHeight : 800);

    const A = getConstellation(displayImages.length);
    const B = getHelix(displayImages.length, W, H);
    const C = getWedge(displayImages.length, W, H);
    const D = getScatter(displayImages.length, W, H);
    const E = getOrbit(displayImages.length, W, H);
    const F = getRiver(displayImages.length, W, H);

    const formations = [A, B, C, D, E, F];
    
    const SEGMENT_COUNT = 5;
    const segmentFloat = prog * SEGMENT_COUNT;
    const segmentIndex = Math.min(Math.floor(segmentFloat), SEGMENT_COUNT - 1);
    const segmentProgress = segmentFloat - segmentIndex;

    const fromFormation = formations[segmentIndex];
    const toFormation = formations[segmentIndex + 1];

    for (let i = 0; i < displayImages.length; i++) {
      const card = cardRefs.current[i];
      const img = imageRefs.current[i];
      if (!card || !fromFormation[i] || !toFormation[i]) continue;

      const from = fromFormation[i];
      const to = toFormation[i];

      const staggerAmt = 0.1;
      const cardDelay = (i / (displayImages.length - 1 || 1)) * staggerAmt;
      const cardT = Math.max(0, Math.min(1, (segmentProgress - cardDelay) / (1 - staggerAmt || 1)));
      const easedT = applyEasing(cardT, "smooth");

      let x = lerp(from.x, to.x, easedT);
      let y = lerp(from.y, to.y, easedT);
      let z = lerp(from.z, to.z, easedT);
      const scaleX = lerp(from.scaleX, to.scaleX, easedT);
      const scaleY = lerp(from.scaleY, to.scaleY, easedT);
      let rotation = lerp(from.rotation, to.rotation, easedT);

      const arc = Math.sin(cardT * Math.PI);
      const arcAmt = 50 * 1.5;
      x += arc * arcAmt * Math.sin(i * 2.3 + 0.5);
      y += -arc * arcAmt * Math.cos(i * 1.7 + 0.3);
      z += 55 * arc;

      let rotX = 0;
      let rotY = 0;
      if (travelRotation) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        rotX = Math.max(-12, Math.min(12, dy * 0.03 * arc));
        rotY = Math.max(-12, Math.min(12, -dx * 0.03 * arc));
        rotation += dx * 0.012 * arc;
      }

      gsap.set(card, {
        x,
        y,
        z,
        scaleX,
        scaleY,
        rotation,
        rotationX: rotX,
        rotationY: rotY,
        transformPerspective: perspective,
        transformStyle: "preserve-3d",
        boxShadow: `0 ${4 + 14 * arc}px ${10 + 24 * arc}px rgba(0, 0, 0, ${0.4 + 0.15 * arc})`,
        zIndex: Math.round(10 + z + 100),
      });

      if (img) {
        gsap.set(img, {
          yPercent: (prog - 0.5) * 10,
          scale: 1.06 + (1 - arc) * 0.03,
        });
      }
    }

    const formationNames = ["CONSTELLATION", "HELIX", "WEDGE", "SCATTER", "ORBIT", "RIVER"];
    const closestIndex = Math.min(Math.round(prog * SEGMENT_COUNT), SEGMENT_COUNT);
    setCurrentFormationName(formationNames[closestIndex]);
    setScrollPct(Math.round(prog * 100));
  };

  // Inertial RAF animation loop for 60fps smooth card morphing
  useEffect(() => {
    let animId: number;
    const targetProgress = propScrollProgress !== undefined ? propScrollProgress : localProgress;

    const loop = () => {
      const diff = targetProgress - lerpedProgressRef.current;
      if (Math.abs(diff) > 0.0001) {
        lerpedProgressRef.current += diff * 0.12;
        updateFormations(lerpedProgressRef.current);
      } else {
        lerpedProgressRef.current = targetProgress;
        updateFormations(targetProgress);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [propScrollProgress, localProgress, displayImages.length]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-screen bg-[#070708] overflow-hidden select-none ${className}`}
      style={{
        ...style,
      }}
    >
      {/* Background fabric noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay z-10" />


      {/* 3D Viewport Layer */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ perspective: `${perspective}px` }}
      >
        {displayImages.map((src, idx) => (
          <div
            key={idx}
            ref={(el) => { cardRefs.current[idx] = el; }}
            className="absolute top-1/2 left-1/2 rounded-xl overflow-hidden bg-neutral-900 pointer-events-auto cursor-pointer group shadow-2xl"
            style={{
              width: `${CARD_W}px`,
              height: `${CARD_H}px`,
              marginLeft: `-${CARD_W / 2}px`,
              marginTop: `-${CARD_H / 2}px`,
              willChange: "transform",
            }}
          >
            <img
              ref={(el) => { imageRefs.current[idx] = el; }}
              src={src}
              alt={displayTitles[idx] || `Specimen ${idx + 1}`}
              className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-500 group-hover:scale-110"
              draggable={false}
            />

            {/* Title Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
              <span className="font-mono text-[10px] tracking-[0.2em] font-bold text-white/90 uppercase">
                {displayTitles[idx] || `SPECIMEN ${idx + 1}`}
              </span>
              <span className="font-mono text-[8px] text-white/40 tracking-wider">
                SPECIMEN 0{idx + 1}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApparatusLayoutMorph;
