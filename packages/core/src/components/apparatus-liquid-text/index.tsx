import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { VesselComponentProps } from "../../engine/types";

gsap.registerPlugin(ScrollTrigger);

export interface ApparatusLiquidTextProps extends VesselComponentProps {
  text?: string;
  subtext?: string;
  scrollProgress?: number;
  liquidColor?: string;
  strokeColor?: string;
  waveSpeed?: number;
  waveAmplitude?: number;
}

export const ApparatusLiquidText: React.FC<ApparatusLiquidTextProps> = ({
  text = "ABYSS",
  subtext = "LIQUID KINETIC TYPOGRAPHY",
  scrollProgress,
  liquidColor = "#3b82f6",
  strokeColor = "#ffffff",
  waveSpeed = 1.5,
  waveAmplitude = 10,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalProgressRef = useRef(0);

  const [, setFillLevels] = useState<number[]>(() => new Array(text.length).fill(0));
  const wavePathsRef = useRef<string[]>(new Array(text.length).fill(""));
  const surfaceLinesRef = useRef<string[]>(new Array(text.length).fill(""));
  const [, setTick] = useState(0);

  const characters = text.split("");

  // Sync scrollProgress prop directly when passed by ScrollShowcaseLayout
  useEffect(() => {
    if (typeof scrollProgress === "number") {
      internalProgressRef.current = scrollProgress;

      let newState: "idle" | "discovery" | "buildUp" | "peak" | "recovery" = "idle";
      if (scrollProgress > 0.05 && scrollProgress < 0.3) newState = "discovery";
      else if (scrollProgress >= 0.3 && scrollProgress < 0.7) newState = "buildUp";
      else if (scrollProgress >= 0.7 && scrollProgress < 0.95) newState = "peak";
      else if (scrollProgress >= 0.95) newState = "recovery";

      onLifecycleChange?.(newState);
    }
  }, [scrollProgress, onLifecycleChange]);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      onLifecycleChange?.("idle");

      let st: ScrollTrigger | null = null;

      if (typeof scrollProgress !== "number") {
        st = ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: "+=200%",
          scrub: 0.8,
          onUpdate: (self) => {
            internalProgressRef.current = self.progress;

            let newState: "idle" | "discovery" | "buildUp" | "peak" | "recovery" = "idle";
            if (self.progress > 0.05 && self.progress < 0.3) newState = "discovery";
            else if (self.progress >= 0.3 && self.progress < 0.7) newState = "buildUp";
            else if (self.progress >= 0.7 && self.progress < 0.95) newState = "peak";
            else if (self.progress >= 0.95) newState = "recovery";

            onLifecycleChange?.(newState);
          },
        });
      }

      let time = 0;

      // Real-time Wave & Liquid Fill Ticker
      const tickerCallback = () => {
        time += 0.03 * waveSpeed;

        const currentProg = internalProgressRef.current;
        const total = characters.length;

        const newLevels: number[] = [];
        const newPaths: string[] = [];
        const newLines: string[] = [];

        characters.forEach((_, i) => {
          // Staggered fill range per character
          const start = (i / Math.max(1, total)) * 0.35;
          const end = 0.65 + (i / Math.max(1, total)) * 0.35;

          const charProg = Math.max(0, Math.min(1, (currentProg - start) / (end - start)));
          newLevels.push(charProg);

          // Liquid surface Y: 270 = 0% fill (bottom), 50 = 100% fill (top)
          const fillY = 270 - charProg * 220;

          // Wave amplitude dampening when almost full
          const amp = charProg >= 0.98 ? waveAmplitude * (1 - (charProg - 0.98) * 50) : waveAmplitude;

          const phase = i * 0.85;
          const w = 220; // Wave width covering letter bounds

          const sin1 = Math.sin(time * 2.2 + phase) * amp;
          const sin2 = Math.cos(time * 2.7 + phase) * amp;

          // Closed wave polygon for fill
          const fillPathD = `M -20 340 L -20 ${fillY + sin1} Q ${w * 0.35} ${fillY - sin2} ${w * 0.65} ${
            fillY + sin1
          } T ${w + 20} ${fillY} L ${w + 20} 340 Z`;

          // Top wave line ONLY for specular highlight (no side/bottom strokes!)
          const surfaceLineD = `M -20 ${fillY + sin1} Q ${w * 0.35} ${fillY - sin2} ${w * 0.65} ${
            fillY + sin1
          } T ${w + 20} ${fillY}`;

          newPaths.push(fillPathD);
          newLines.push(surfaceLineD);
        });

        wavePathsRef.current = newPaths;
        surfaceLinesRef.current = newLines;
        setFillLevels(newLevels);
        setTick((t) => (t + 1) % 1000);
      };

      gsap.ticker.add(tickerCallback);

      return () => {
        gsap.ticker.remove(tickerCallback);
        if (st) st.kill();
      };
    },
    { scope: containerRef, dependencies: [text, waveSpeed, waveAmplitude, scrollProgress] }
  );

  const charWidth = 115;
  const viewBoxWidth = 1000;
  const totalTextWidth = (characters.length - 1) * charWidth;
  const startX = (viewBoxWidth - totalTextWidth) / 2; // Perfect center calculation

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-screen bg-transparent text-white overflow-hidden select-none flex flex-col items-center justify-center ${className}`}
      style={{ fontFamily: "Satoshi, Inter, sans-serif", ...style }}
    >
      <div className="relative w-full max-w-4xl flex items-center justify-center px-4">
        <svg
          viewBox={`0 0 ${viewBoxWidth} 320`}
          className="w-full h-auto max-h-[55vh] filter drop-shadow(0 20px 35px rgba(0,0,0,0.6))"
        >
          <defs>
            {characters.map((char, index) => {
              const xPos = startX + index * charWidth;
              return (
                <clipPath key={`clip-${index}`} id={`liquid-clip-${index}`}>
                  <text
                    x={xPos}
                    y={215}
                    fontSize="135"
                    fontWeight="900"
                    letterSpacing="-0.04em"
                    textAnchor="middle"
                  >
                    {char}
                  </text>
                </clipPath>
              );
            })}
          </defs>

          {/* 1. Hollow Outline Glyph Shells (Empty Vessels) */}
          <g fill="none" stroke={strokeColor} strokeWidth="3" opacity="0.30">
            {characters.map((char, index) => {
              const xPos = startX + index * charWidth;
              return (
                <text
                  key={`outline-${index}`}
                  x={xPos}
                  y={215}
                  fontSize="135"
                  fontWeight="900"
                  letterSpacing="-0.04em"
                  textAnchor="middle"
                >
                  {char}
                </text>
              );
            })}
          </g>

          {/* 2. Liquid Fill Layer inside Glyph ClipPaths */}
          {characters.map((_, index) => {
            const xPos = startX + index * charWidth;
            const wavePath = wavePathsRef.current[index] || `M -20 340 L -20 340 L 240 340 Z`;
            const surfaceLine = surfaceLinesRef.current[index] || `M -20 340 L 240 340`;

            return (
              <g key={`liquid-group-${index}`} clipPath={`url(#liquid-clip-${index})`}>
                {/* Surface wave fill & top specular line */}
                <g transform={`translate(${xPos - 100}, 0)`}>
                  <path
                    d={wavePath}
                    fill={liquidColor}
                    opacity="0.95"
                  />
                  {/* Top liquid surface wave highlight line ONLY (no vertical box side lines) */}
                  <path
                    d={surfaceLine}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    opacity="0.75"
                    strokeLinecap="round"
                  />
                </g>
              </g>
            );
          })}

          {/* 3. Crisp Foreground Outline for Sharp Boundaries */}
          <g fill="none" stroke={strokeColor} strokeWidth="3.5" opacity="0.95">
            {characters.map((char, index) => {
              const xPos = startX + index * charWidth;
              return (
                <text
                  key={`fg-outline-${index}`}
                  x={xPos}
                  y={215}
                  fontSize="135"
                  fontWeight="900"
                  letterSpacing="-0.04em"
                  textAnchor="middle"
                >
                  {char}
                </text>
              );
            })}
          </g>
        </svg>
      </div>

      {subtext ? (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs sm:text-sm font-mono tracking-widest text-neutral-400 uppercase pointer-events-none flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          {subtext}
        </div>
      ) : null}
    </div>
  );
};

export default ApparatusLiquidText;
