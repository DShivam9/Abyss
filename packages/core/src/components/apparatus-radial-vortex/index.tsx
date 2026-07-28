import { useRef, useEffect } from "react";
import { VesselComponentProps } from "../../engine/types";

interface RingConfig {
  char: string;
  count: number;
  baseRadiusRatio: number;
  baseSpeed: number; // deg/frame
  fontSize: number;
}

const ARC_RINGS: RingConfig[] = [
  { char: "P", count: 6, baseRadiusRatio: 1.0, baseSpeed: 0.18, fontSize: 13 },
  { char: "O", count: 9, baseRadiusRatio: 2.0, baseSpeed: -0.15, fontSize: 13 },
  { char: "|", count: 12, baseRadiusRatio: 3.0, baseSpeed: 0.22, fontSize: 12 },
  { char: "N", count: 15, baseRadiusRatio: 4.0, baseSpeed: -0.12, fontSize: 13 },
  { char: "T", count: 18, baseRadiusRatio: 5.0, baseSpeed: 0.16, fontSize: 14 },
];

export default function ApparatusRadialVortex({
  text,
  word,
  presetText = "POINT",
  ringSpeed = 1.0,
  vortexScale = 1.0,
  scrollSens = 1.0,
  arcCoverage = 240,
  letterSpacing = 30,
  letterOpacity = 0.98,
  breathAmount = 1.0,
  scrollProgress: externalProgress,
  className = "",
  style,
}: VesselComponentProps & {
  text?: string;
  word?: string;
  presetText?: string;
  ringSpeed?: number;
  vortexScale?: number;
  scrollSens?: number;
  arcCoverage?: number;
  letterSpacing?: number;
  letterOpacity?: number;
  breathAmount?: number;
  scrollProgress?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const vortexBoxRef = useRef<HTMLDivElement>(null);
  const ringGroupRefs = useRef<(SVGGElement | null)[]>([]);

  // Active word selection from controls/props
  const activeWord = (presetText || word || text || "POINT").toUpperCase();
  const ringChars = activeWord.length >= 5 ? activeWord.slice(0, 5).split("") : ["P", "O", "I", "N", "T"];

  const dynamicRings = ARC_RINGS.map((ring, idx) => ({
    ...ring,
    radius: ring.baseRadiusRatio * letterSpacing,
    char: ring.char === "|" ? "|" : ringChars[idx] || ring.char,
  }));

  const scrollVelRef = useRef(0);
  const lastProgressRef = useRef(0);

  // 1. Passive Wheel Listener for Infinite Rotational Accumulation
  useEffect(() => {
    const handlePassiveWheel = (e: WheelEvent) => {
      scrollVelRef.current += e.deltaY * 0.04 * scrollSens;
      const maxClamp = 15.0 * scrollSens;
      scrollVelRef.current = Math.max(-maxClamp, Math.min(maxClamp, scrollVelRef.current));
    };

    window.addEventListener("wheel", handlePassiveWheel, { passive: true });
    return () => window.removeEventListener("wheel", handlePassiveWheel);
  }, [scrollSens]);

  // 2. Handle external scrollProgress updates if passed
  useEffect(() => {
    if (typeof externalProgress === "number") {
      const delta = externalProgress - lastProgressRef.current;
      lastProgressRef.current = externalProgress;
      scrollVelRef.current += delta * 18.0 * scrollSens;
      const maxClamp = 15.0 * scrollSens;
      scrollVelRef.current = Math.max(-maxClamp, Math.min(maxClamp, scrollVelRef.current));
    }
  }, [externalProgress, scrollSens]);

  // 3. Single 60fps Infinite Rotational Kinetic Loop
  useEffect(() => {
    let animId: number;
    let time = 0;
    const angles = [0, 0, 0, 0, 0];
    let heavySmoothVel = 0;

    const updateLoop = () => {
      time += 0.016;

      heavySmoothVel += (scrollVelRef.current - heavySmoothVel) * 0.08;
      scrollVelRef.current *= 0.94;

      dynamicRings.forEach((ring, idx) => {
        const dir = idx % 2 === 0 ? 1 : -1.25;
        angles[idx] = (angles[idx] + ring.baseSpeed * ringSpeed + heavySmoothVel * dir * 0.8) % 360;

        const breath = Math.sin(time * 1.5 + idx * 0.4) * 0.004 * breathAmount;

        const el = ringGroupRefs.current[idx];
        if (el) {
          el.style.transform = `rotate(${angles[idx]}deg) scale(${1 + breath})`;
          el.style.transformOrigin = "0px 0px";
        }
      });

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [ringSpeed, breathAmount, activeWord]);

  // Dynamic Arc Coverage Angle Math (arcCoverage slider from 120° to 360°)
  const arcSpan = (arcCoverage * Math.PI) / 180;
  const startAngle = -Math.PI * 0.9;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen bg-[#060608] text-white flex items-center justify-center select-none overflow-hidden ${className}`}
      style={style}
    >
      {/* Pure Centered Minimal Vortex Container */}
      <div
        ref={vortexBoxRef}
        className="relative w-72 md:w-96 aspect-square flex items-center justify-center pointer-events-none transition-transform duration-300 origin-center"
        style={{ transform: `scale(${vortexScale})` }}
      >
        <svg
          className="w-full h-full"
          viewBox="-200 -200 400 400"
          style={{ overflow: "visible" }}
        >
          {dynamicRings.map((ring, ringIdx) => {
            const letterArray = Array.from({ length: ring.count });
            const angleStep = ring.count > 1 ? arcSpan / (ring.count - 1) : 0;

            return (
              <g
                key={`${activeWord}-${ringIdx}-${letterSpacing}`}
                ref={(el) => {
                  ringGroupRefs.current[ringIdx] = el;
                }}
              >
                {letterArray.map((_, i) => {
                  const angle = startAngle + i * angleStep;
                  const x = ring.radius * Math.cos(angle);
                  const y = ring.radius * Math.sin(angle);
                  const rotDeg = (angle * 180) / Math.PI + 90;

                  return (
                    <text
                      key={i}
                      x={x}
                      y={y}
                      fill="#FFFFFF"
                      fontSize={ring.fontSize}
                      fontWeight={ring.char === "|" ? "400" : "700"}
                      fontFamily="ui-sans-serif, system-ui, -apple-system, monospace"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${rotDeg}, ${x}, ${y})`}
                      style={{
                        opacity: ring.char === "|" ? letterOpacity * 0.65 : letterOpacity,
                      }}
                    >
                      {ring.char}
                    </text>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
