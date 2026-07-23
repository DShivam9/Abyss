import React, { useEffect, useRef } from "react";
import { ApparatusCursorWakeProps, CursorWakeItem } from "./types";

const DEFAULT_ITEMS: CursorWakeItem[] = [
  { id: "01", name: "SPECIMEN 1724", imageSrc: "/images/components images/Gallary/cosmos_1724531036.jpeg" },
  { id: "02", name: "SPECIMEN 1948", imageSrc: "/images/components images/Gallary/cosmos_1948095192.jpeg" },
  { id: "03", name: "SPECIMEN 2046", imageSrc: "/images/components images/Gallary/cosmos_2046923474.jpeg" },
  { id: "04", name: "SPECIMEN 0623", imageSrc: "/images/components images/Gallary/cosmos_623139356.jpeg" },
  { id: "05", name: "SPECIMEN 0842", imageSrc: "/images/components images/Gallary/cosmos_842932938.jpeg" },
  { id: "06", name: "SPECIMEN 0854", imageSrc: "/images/components images/Gallary/cosmos_854490082.jpeg" },
];

interface PathPoint {
  x: number;
  y: number;
  time: number;
}

export const ApparatusCursorWake: React.FC<ApparatusCursorWakeProps & {
  decay?: number;
  scaleBase?: number;
  satMax?: number;
  maxBlur?: number;
}> = ({
  items = DEFAULT_ITEMS,
  className = "",
  style,
  decayDuration = 1800,
  baseScale = 0.55,
  maxSaturation = 1.5,
  decay: propDecay,
  scaleBase: propScaleBase,
  satMax: propSatMax,
  maxBlur: propMaxBlur = 3.5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);

  // Active values derived from props or defaults
  const decay = propDecay ?? decayDuration;
  const scaleBase = propScaleBase ?? baseScale;
  const satMax = propSatMax ?? maxSaturation;
  const maxBlur = propMaxBlur;

  // Physical calculation refs (running outside react renders)
  const pointerXRef = useRef(-1000);
  const pointerYRef = useRef(-1000);
  const lastPointerXRef = useRef(-1000);
  const lastPointerYRef = useRef(-1000);
  const pointerSpeedRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const pointerActiveRef = useRef(false);

  // Smooth lerp states per item
  const currentVibranciesRef = useRef<number[]>([]);
  const pointerHistoryRef = useRef<PathPoint[]>([]);

  // Synchronize state values to refs for the render loop
  const decayRef = useRef(decay);
  const scaleBaseRef = useRef(scaleBase);
  const satMaxRef = useRef(satMax);
  const maxBlurRef = useRef(maxBlur);

  useEffect(() => {
    decayRef.current = decay;
    scaleBaseRef.current = scaleBase;
    satMaxRef.current = satMax;
    maxBlurRef.current = maxBlur;
  }, [decay, scaleBase, satMax, maxBlur]);

  // Reset/Initialize vibrancies
  useEffect(() => {
    currentVibranciesRef.current = new Array(items.length).fill(0);
  }, [items.length]);

  // Pointer event handlers
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    pointerXRef.current = e.clientX;
    pointerYRef.current = e.clientY;
    pointerActiveRef.current = true;

    // Push local coordinate to path history
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    pointerHistoryRef.current.push({
      x: localX,
      y: localY,
      time: performance.now(),
    });
  };

  const handlePointerLeave = () => {
    pointerActiveRef.current = false;
    pointerXRef.current = -1000;
    pointerYRef.current = -1000;
  };

  // Physics Ticker
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const now = performance.now();

      // Calculate speed (pixels per millisecond)
      let speed = 0;
      if (pointerActiveRef.current && lastPointerXRef.current !== -1000) {
        const dx = pointerXRef.current - lastPointerXRef.current;
        const dy = pointerYRef.current - lastPointerYRef.current;
        const dt = Math.max(1, now - lastTimeRef.current);
        speed = Math.sqrt(dx * dx + dy * dy) / dt;
      }

      lastPointerXRef.current = pointerXRef.current;
      lastPointerYRef.current = pointerYRef.current;
      lastTimeRef.current = now;

      // Low-pass filter for smooth speed decay
      pointerSpeedRef.current += (speed - pointerSpeedRef.current) * 0.08;

      // 1. Update image tile transformations (Pure Restrained Wake + Ambient Liquid Float)
      for (let i = 0; i < items.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        const rect = el.getBoundingClientRect();

        // Direct hover check with slight corridor margin
        const isHovered =
          pointerActiveRef.current &&
          pointerXRef.current >= rect.left - 15 &&
          pointerXRef.current <= rect.right + 15 &&
          pointerYRef.current >= rect.top - 15 &&
          pointerYRef.current <= rect.bottom + 15;

        const targetVibrancy = isHovered ? 1.0 : 0.0;

        // Smooth Lerp easing: fast attack entry (0.18), fluid decay release (0.035)
        const lerpRate = targetVibrancy > currentVibranciesRef.current[i] ? 0.18 : 0.035;
        currentVibranciesRef.current[i] += (targetVibrancy - currentVibranciesRef.current[i]) * lerpRate;

        const vibrancy = currentVibranciesRef.current[i];

        // Editorial Ambient Liquid Float (idle micro-orbit)
        const floatX = Math.sin(now * 0.0008 + i * 1.7) * 3.0;
        const floatY = Math.cos(now * 0.0006 + i * 2.3) * 3.0;

        // Scale bounded from base (0.55x) up to 0.85x max (never zoomed in!)
        const currentScale = scaleBaseRef.current + (0.85 - scaleBaseRef.current) * vibrancy;
        const currentOpacity = 0.35 + 0.65 * vibrancy;
        const currentSaturation = 0.15 + (satMaxRef.current - 0.15) * vibrancy;
        const blurAmount = (1.0 - vibrancy) * maxBlurRef.current;

        el.style.transform = `translate3d(${floatX.toFixed(2)}px, ${floatY.toFixed(2)}px, 0) scale(${currentScale.toFixed(3)})`;
        el.style.opacity = currentOpacity.toFixed(3);
        el.style.filter = `saturate(${currentSaturation.toFixed(3)})${blurAmount > 0.05 ? ` blur(${blurAmount.toFixed(2)}px)` : ""}`;
      }

      // 2. Render SVG tracing path trail
      pointerHistoryRef.current = pointerHistoryRef.current.filter(
        (pt) => now - pt.time < decayRef.current * 0.5
      );

      const points = pointerHistoryRef.current;
      if (pathRef.current && points.length > 1) {
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
          const xc = (points[i].x + points[i - 1].x) / 2;
          const yc = (points[i].y + points[i - 1].y) / 2;
          d += ` Q ${points[i - 1].x} ${points[i - 1].y}, ${xc} ${yc}`;
        }
        pathRef.current.setAttribute("d", d);

        const strokeWidth = 0.75 + Math.min(0.35, pointerSpeedRef.current * 0.2);
        const strokeOpacity = 0.06 + Math.min(0.06, pointerSpeedRef.current * 0.04);
        pathRef.current.setAttribute("stroke-width", strokeWidth.toFixed(2));
        pathRef.current.setAttribute("stroke", `rgba(255, 255, 255, ${strokeOpacity.toFixed(3)})`);

        pathRef.current.style.opacity = "1";
      } else if (pathRef.current) {
        pathRef.current.style.opacity = "0";
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [items.length]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`absolute inset-0 select-none overflow-hidden touch-none ${className}`}
      style={{
        backgroundColor: "#08080a",
        ...style,
      }}
    >
      {/* ─── BACKGROUND SVG PATH TRACER ─── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
        <path
          ref={pathRef}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="transition-opacity duration-300"
        />
      </svg>

      {/* ─── COMPACT 6-IMAGE SPECIMEN GALLERY (3x2 GRID STRICTLY FROM Gallary FOLDER) ─── */}
      <div
        className="absolute inset-0 overflow-hidden px-6 py-12 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 20 }}
      >
        <div className="grid grid-cols-3 gap-6 max-w-3xl w-full">
          {items.map((item, idx) => (
            <div
              key={item.id}
              ref={(ref) => {
                cardRefs.current[idx] = ref;
              }}
              className="pointer-events-auto relative overflow-hidden rounded-lg bg-neutral-950 aspect-[4/3] group select-none will-change-transform transform-gpu"
            >
              <img
                src={item.imageSrc}
                alt={item.name}
                className="w-full h-full object-cover select-none pointer-events-none"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApparatusCursorWake;
