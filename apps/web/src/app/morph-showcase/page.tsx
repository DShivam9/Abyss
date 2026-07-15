"use client";

import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

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

// Helper: Linear interpolation
function lerp(a: number, b: number, t: number): number {
  return (1 - t) * a + t * b;
}

// Helper: Easing applications
function applyEasing(t: number, mode: "linear" | "smooth" | "dramatic"): number {
  if (mode === "linear") return t;
  if (mode === "smooth") {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Formation 1: Constellation (tight grid)
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

// Formation 2: Helix (spiral staircase)
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

// Formation 3: Wedge (chevron flock)
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

// Formation 4: Scatter (chaos)
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

// Formation 5: Orbit (elliptical ring)
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

// Formation 6: River (horizontal sine flow)
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

export default function MorphShowcasePage() {
  // UI states (drives UI controls display only)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cardCount, setCardCount] = useState<4 | 6 | 9>(9);
  const [uiArc, setUiArc] = useState(50);
  const [uiStagger, setUiStagger] = useState(35);
  const [uiPerspective, setUiPerspective] = useState(1200);
  const [uiEasing, setUiEasing] = useState<"linear" | "smooth" | "dramatic">("smooth");
  const [uiTravelRotation, setUiTravelRotation] = useState(true);
  const [uiReversed, setUiReversed] = useState(false);

  // Active animation refs (read directly inside the ScrollTrigger scroll ticker callback, preventing jank)
  const arcIntensityRef = useRef(50);
  const staggerRef = useRef(35);
  const perspectiveRef = useRef(1200);
  const easingRef = useRef<"linear" | "smooth" | "dramatic">("smooth");
  const travelRotationRef = useRef(true);
  const reversedRef = useRef(false);

  const [currentFormationName, setCurrentFormationName] = useState("CONSTELLATION");
  const [scrollPct, setScrollPct] = useState(0);

  const activeScrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const activeResizeListenerRef = useRef<(() => void) | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  const visibleImages = DEFAULT_IMAGES.slice(0, cardCount);

  const updateFormations = (progress: number) => {
    const isReversed = reversedRef.current;
    
    const W = typeof window !== "undefined" ? window.innerWidth : 1200;
    const H = typeof window !== "undefined" ? window.innerHeight : 800;

    const A = getConstellation(cardCount);
    const B = getHelix(cardCount, W, H);
    const C = getWedge(cardCount, W, H);
    const D = getScatter(cardCount, W, H);
    const E = getOrbit(cardCount, W, H);
    const F = getRiver(cardCount, W, H);

    const formations = isReversed ? [F, E, D, C, B, A] : [A, B, C, D, E, F];
    
    const SEGMENT_COUNT = 5;
    const segmentFloat = progress * SEGMENT_COUNT;
    const segmentIndex = Math.min(Math.floor(segmentFloat), SEGMENT_COUNT - 1);
    const segmentProgress = segmentFloat - segmentIndex;

    const fromFormation = formations[segmentIndex];
    const toFormation = formations[segmentIndex + 1];
    
    const count = visibleImages.length;

    for (let i = 0; i < count; i++) {
      const card = cardRefs.current[i];
      const img = imageRefs.current[i];
      if (!card || !fromFormation[i] || !toFormation[i]) continue;

      const from = fromFormation[i];
      const to = toFormation[i];

      const staggerAmt = staggerRef.current * 0.003;
      const cardDelay = (i / (count - 1 || 1)) * staggerAmt;
      const cardT = Math.max(0, Math.min(1, (segmentProgress - cardDelay) / (1 - staggerAmt || 1)));
      const easedT = applyEasing(cardT, easingRef.current);

      let x = lerp(from.x, to.x, easedT);
      let y = lerp(from.y, to.y, easedT);
      let z = lerp(from.z, to.z, easedT);
      const scaleX = lerp(from.scaleX, to.scaleX, easedT);
      const scaleY = lerp(from.scaleY, to.scaleY, easedT);
      let rotation = lerp(from.rotation, to.rotation, easedT);

      const arc = Math.sin(cardT * Math.PI);
      const arcAmt = arcIntensityRef.current * 1.5;
      x += arc * arcAmt * Math.sin(i * 2.3 + 0.5);
      y += -arc * arcAmt * Math.cos(i * 1.7 + 0.3);

      z += 55 * arc;

      let rotX = 0;
      let rotY = 0;
      if (travelRotationRef.current) {
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
        transformPerspective: perspectiveRef.current,
        transformStyle: "preserve-3d",
        boxShadow: `0 ${4 + 14 * arc}px ${10 + 24 * arc}px rgba(0, 0, 0, ${0.4 + 0.15 * arc})`,
        zIndex: Math.round(10 + z + 100),
      });

      if (img) {
        gsap.set(img, {
          yPercent: (progress - 0.5) * 10,
          scale: 1.06 + (1 - arc) * 0.03,
        });
      }
    }

    const formationNames = isReversed
      ? ["RIVER", "ORBIT", "SCATTER", "WEDGE", "HELIX", "CONSTELLATION"]
      : ["CONSTELLATION", "HELIX", "WEDGE", "SCATTER", "ORBIT", "RIVER"];
    const closestIndex = Math.min(Math.round(progress * SEGMENT_COUNT), SEGMENT_COUNT);
    setCurrentFormationName(formationNames[closestIndex]);
    setScrollPct(Math.round(progress * 100));
  };

  useGSAP((context) => {
    const container = containerRef.current;
    if (!container) return;

    const cards = cardRefs.current.filter(Boolean);
    if (cards.length === 0) return;

    if (activeScrollTriggerRef.current) {
      activeScrollTriggerRef.current.kill();
      activeScrollTriggerRef.current = null;
    }
    if (activeResizeListenerRef.current) {
      window.removeEventListener("resize", activeResizeListenerRef.current);
      activeResizeListenerRef.current = null;
    }

    gsap.set(cards, {
      opacity: 0,
      scale: 0.15,
      z: -400,
      rotationY: 45,
      rotationX: 20,
    });

    gsap.to(cards, {
      opacity: 1,
      scale: 1,
      z: 0,
      rotationY: 0,
      rotationX: 0,
      duration: 1.2,
      stagger: 0.06,
      ease: "power4.out",
      delay: 0.3,
      onComplete: () => {
        context.add(() => {
          const st = ScrollTrigger.create({
            trigger: container,
            start: "top top",
            end: () => `+=${window.innerHeight * 5}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              updateFormations(self.progress);
            },
          });
          activeScrollTriggerRef.current = st;

          updateFormations(0);

          const handleResize = () => {
            if (st) {
              updateFormations(st.progress);
            }
          };
          window.addEventListener("resize", handleResize);
          activeResizeListenerRef.current = handleResize;
        });
      }
    });

    return () => {
      if (activeScrollTriggerRef.current) {
        activeScrollTriggerRef.current.kill();
        activeScrollTriggerRef.current = null;
      }
      if (activeResizeListenerRef.current) {
        window.removeEventListener("resize", activeResizeListenerRef.current);
        activeResizeListenerRef.current = null;
      }
    };
  }, [cardCount]);

  return (
    <div className="w-full min-h-screen bg-[#070708] text-white relative select-none overflow-hidden">
      <div ref={containerRef} className="w-screen h-screen relative flex items-center justify-center overflow-hidden">
        
        <div className="w-full h-full relative" style={{ perspective: `${uiPerspective}px`, transformStyle: "preserve-3d" }}>
          {visibleImages.map((imgSrc, idx) => (
            <div
              key={`card-${idx}`}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              className="absolute overflow-hidden"
              style={{
                width: `${CARD_W}px`,
                height: `${CARD_H}px`,
                left: "50%",
                top: "50%",
                marginLeft: `-${CARD_W / 2}px`,
                marginTop: `-${CARD_H / 2}px`,
                willChange: "transform",
                backfaceVisibility: "hidden",
                borderRadius: "0px",
                background: "#0f0f11",
              }}
            >
              <div className="w-full h-full relative overflow-hidden">
                <img
                  ref={(el) => {
                    imageRefs.current[idx] = el;
                  }}
                  src={imgSrc}
                  alt={DEFAULT_TITLES[idx] || `Card ${idx}`}
                  className="w-full absolute left-0 object-cover"
                  style={{
                    height: "115%",
                    top: "-7.5%",
                    filter: "brightness(0.72) contrast(1.05) grayscale(12%)",
                    transition: "filter 0.3s",
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.08) 40%, transparent 100%)",
                  }}
                />
                <span
                  className="absolute bottom-3 left-3 font-mono text-[8px] tracking-[0.2em] uppercase select-none"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {DEFAULT_TITLES[idx]}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute top-6 left-6 z-[9999] pointer-events-auto">
          <Link
            href="/components/apparatus-layout-morph"
            className="font-mono text-[10px] font-bold tracking-widest text-neutral-400 hover:text-white hover:border-[rgba(180,160,140,0.4)] transition-all bg-[#0d0d0f]/80 border border-neutral-900 px-5 py-2.5 rounded-full backdrop-blur-md"
          >
            ← BACK
          </Link>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <span
            className="font-mono text-[10px] tracking-[0.3em] uppercase transition-colors duration-300"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {currentFormationName}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-[2px] z-50">
          <div
            className="h-full bg-white/20 transition-none"
            style={{ width: `${scrollPct}%` }}
          />
        </div>

        <div
          className="absolute pointer-events-auto"
          style={{
            top: "24px",
            right: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "8px",
            zIndex: 999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="toggle-pill"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(13, 13, 15, 0.8)",
              color: "#ffffff",
              padding: "6px 14px",
              border: "1px solid rgba(180, 160, 140, 0.15)",
              borderRadius: "9999px",
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              fontSize: "10px",
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              outline: "none",
            }}
          >
            <span>Controls</span>
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              style={{
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s",
                stroke: "rgba(255, 255, 255, 0.6)",
                strokeWidth: "1.5",
              }}
            >
              <path d="M1 2.5L4 5.5L7 2.5" />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                backgroundColor: "rgba(10, 10, 12, 0.92)",
                padding: "16px 14px",
                border: "1px solid rgba(180, 160, 140, 0.12)",
                borderRadius: "12px",
                backdropFilter: "blur(16px)",
                boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 50px rgba(180, 160, 140, 0.03)",
                minWidth: "260px",
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-4px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .control-btn {
                  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .control-btn:hover {
                  border-color: rgba(180, 160, 140, 0.4) !important;
                  color: #ffffff !important;
                }
                .toggle-pill:hover {
                  border-color: rgba(180, 160, 140, 0.4) !important;
                  background-color: rgba(180, 160, 140, 0.05) !important;
                  box-shadow: 0 0 12px rgba(180, 160, 140, 0.08) !important;
                }
                input[type="range"]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background: #d4c5b9;
                  cursor: pointer;
                  transition: transform 0.15s ease;
                }
                input[type="range"]::-webkit-slider-thumb:hover {
                  transform: scale(1.3);
                  background: #ffffff;
                }
                input[type="range"]::-moz-range-thumb {
                  width: 8px;
                  height: 8px;
                  border: none;
                  border-radius: 50%;
                  background: #d4c5b9;
                  cursor: pointer;
                  transition: transform 0.15s ease;
                }
                input[type="range"]::-moz-range-thumb:hover {
                  transform: scale(1.3);
                  background: #ffffff;
                }
              `}</style>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase select-none">
                  Card Count
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {([4, 6, 9] as const).map((num) => (
                    <button
                      key={num}
                      onClick={() => setCardCount(num)}
                      className="control-btn"
                      style={{
                        padding: "4px 0",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "9px",
                        border: cardCount === num ? "1px solid rgba(180, 160, 140, 0.4)" : "1px solid rgba(255, 255, 255, 0.05)",
                        backgroundColor: cardCount === num ? "rgba(180, 160, 140, 0.08)" : "rgba(255, 255, 255, 0.02)",
                        color: cardCount === num ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      {num} Cards
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase select-none">
                  Sequence
                </span>
                <button
                  onClick={() => {
                    const nextVal = !uiReversed;
                    setUiReversed(nextVal);
                    reversedRef.current = nextVal;
                  }}
                  className="control-btn"
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                    fontSize: "9px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    color: "rgba(255, 255, 255, 0.8)",
                    cursor: "pointer",
                    outline: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span className="truncate">
                    {uiReversed ? "River → Constellation" : "Constellation → River"}
                  </span>
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  paddingTop: "12px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase select-none">
                    Travel Rotation
                  </span>
                  <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.25)" }}>Tilt cards mid-transit</span>
                </div>
                <button
                  onClick={() => {
                    const nextVal = !uiTravelRotation;
                    setUiTravelRotation(nextVal);
                    travelRotationRef.current = nextVal;
                  }}
                  className="control-btn"
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontSize: "8px",
                    border: uiTravelRotation ? "1px solid rgba(180, 160, 140, 0.4)" : "1px solid rgba(255, 255, 255, 0.05)",
                    backgroundColor: uiTravelRotation ? "rgba(180, 160, 140, 0.08)" : "rgba(255, 255, 255, 0.02)",
                    color: uiTravelRotation ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                    cursor: "pointer",
                    outline: "none",
                    fontWeight: "bold",
                  }}
                >
                  {uiTravelRotation ? "ON" : "OFF"}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase select-none">
                    Arc Deviation
                  </span>
                  <span className="text-[9px] font-mono text-white/50">{uiArc}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={uiArc}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setUiArc(val);
                    arcIntensityRef.current = val;
                  }}
                  style={{
                    width: "100%",
                    height: "2px",
                    background: "linear-gradient(to right, rgba(255,255,255,0.05) 0%, rgba(180, 160, 140, 0.3) 100%)",
                    outline: "none",
                    WebkitAppearance: "none",
                    borderRadius: "2px",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase select-none">
                    Stagger Delay
                  </span>
                  <span className="text-[9px] font-mono text-white/50">{uiStagger}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={uiStagger}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setUiStagger(val);
                    staggerRef.current = val;
                  }}
                  style={{
                    width: "100%",
                    height: "2px",
                    background: "linear-gradient(to right, rgba(255,255,255,0.05) 0%, rgba(180, 160, 140, 0.3) 100%)",
                    outline: "none",
                    WebkitAppearance: "none",
                    borderRadius: "2px",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase select-none">
                  Morph Easing
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {(["linear", "smooth", "dramatic"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setUiEasing(mode);
                        easingRef.current = mode;
                      }}
                      className="control-btn"
                      style={{
                        padding: "4px 0",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "8px",
                        border: uiEasing === mode ? "1px solid rgba(180, 160, 140, 0.4)" : "1px solid rgba(255, 255, 255, 0.05)",
                        backgroundColor: uiEasing === mode ? "rgba(180, 160, 140, 0.08)" : "rgba(255, 255, 255, 0.02)",
                        color: uiEasing === mode ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  paddingTop: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase select-none">
                    3D Perspective
                  </span>
                  <span className="text-[9px] font-mono text-white/50">{uiPerspective}px</span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="2000"
                  step="100"
                  value={uiPerspective}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setUiPerspective(val);
                    perspectiveRef.current = val;
                  }}
                  style={{
                    width: "100%",
                    height: "2px",
                    background: "linear-gradient(to right, rgba(255,255,255,0.05) 0%, rgba(180, 160, 140, 0.3) 100%)",
                    outline: "none",
                    WebkitAppearance: "none",
                    borderRadius: "2px",
                  }}
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
