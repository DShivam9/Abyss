import React, { useRef, useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { VesselComponentProps } from "../../engine/types";

export interface ApparatusTypewriterDecayProps extends VesselComponentProps {
  text?: string;
  subtext?: string;
  decayRate?: number;
  particleCount?: number;
}

export const ApparatusTypewriterDecay: React.FC<ApparatusTypewriterDecayProps> = ({
  text = "EPHEMERAL CODE // ENTROPY IN MOTION",
  subtext = "HOVER TO DISTORT • CLICK TO COLLAPSE & RE-TYPE",
  decayRate = 1.0,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const characters = text.split("");

  // Interactive States
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [typedCount, setTypedCount] = useState(0);
  const [decayingOrigin, setDecayingOrigin] = useState<number | null>(null);
  const [decayProgress, setDecayProgress] = useState(0); // 0 to 1 wave progress on click
  const [, setTick] = useState(0);

  // Initial Auto-Typewriter sequence on mount
  const startTypingSequence = useCallback(() => {
    onLifecycleChange?.("discovery");
    setTypedCount(0);
    setDecayingOrigin(null);
    setDecayProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setTypedCount(current);
      if (current >= characters.length) {
        clearInterval(interval);
        onLifecycleChange?.("idle");
      }
    }, 45);

    return () => clearInterval(interval);
  }, [characters.length, onLifecycleChange]);

  useEffect(() => {
    startTypingSequence();
  }, [startTypingSequence]);

  // Click Shockwave Handler
  const handleCharClick = (clickIndex: number) => {
    if (decayingOrigin !== null) return; // Prevent double trigger during wave

    onLifecycleChange?.("buildUp");
    setDecayingOrigin(clickIndex);
    setDecayProgress(0);

    // Animate decayProgress from 0 to 1 over 650ms using GSAP
    gsap.to(
      { p: 0 },
      {
        p: 1,
        duration: 0.65 / decayRate,
        ease: "power2.inOut",
        onUpdate: function () {
          setDecayProgress(this.targets()[0].p);
        },
        onComplete: () => {
          onLifecycleChange?.("peak");
          // After collapse, re-type cleanly
          setTimeout(() => {
            startTypingSequence();
          }, 150);
        },
      }
    );
  };

  // Continuous micro-jitter ticker for hovered/decaying characters
  useGSAP(
    () => {
      const tickerCallback = () => {
        setTick((t) => (t + 1) % 1000);
      };
      gsap.ticker.add(tickerCallback);
      return () => gsap.ticker.remove(tickerCallback);
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[70vh] bg-transparent text-white overflow-hidden select-none flex flex-col items-center justify-center py-12 ${className}`}
      style={{ fontFamily: "Satoshi, Inter, monospace", ...style }}
    >
      {/* SVG Turbulence Filter for Digital Noise Distortion */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <filter id="decay-noise-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="decay-heavy-noise">
          <feTurbulence type="turbulence" baseFrequency="0.25" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Main Interactive Typography Headline */}
      <div className="relative w-full px-6 flex flex-wrap justify-center items-center gap-x-1 sm:gap-x-2 max-w-6xl text-center">
        {characters.map((char, index) => {
          if (char === " ") {
            return <span key={index} className="inline-block w-6 sm:w-12" />;
          }

          const isUnrevealed = index >= typedCount;
          const isCurrentCursor = index === typedCount - 1 && typedCount < characters.length;
          const isHovered = hoveredIndex === index;
          const isNeighborHovered = hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1;

          // Shockwave decay calculations on click
          let waveDistance = 0;
          let waveAge = 0;
          if (decayingOrigin !== null) {
            waveDistance = Math.abs(index - decayingOrigin) / Math.max(1, characters.length);
            waveAge = Math.max(0, (decayProgress - waveDistance * 0.6) * 2.2);
          }

          if (isUnrevealed) {
            return (
              <span
                key={index}
                className="inline-block opacity-0"
                style={{ fontSize: "clamp(2rem, 4.5vw, 5rem)" }}
              >
                {char}
              </span>
            );
          }

          // Visual Decay Transformations
          let opacity = 1;
          let filter = "none";
          let clipPath = "none";
          let transform = "none";
          let colorClass = "text-white";

          // Click Decay Wave progression
          if (decayingOrigin !== null && waveAge > 0) {
            if (waveAge < 0.4) {
              // Wave Phase 1: Heavy Noise & Jitter
              opacity = 0.9;
              filter = "url(#decay-noise-filter)";
              const jx = (Math.random() - 0.5) * 8;
              const jy = (Math.random() - 0.5) * 8;
              transform = `translate(${jx.toFixed(1)}px, ${jy.toFixed(1)}px)`;
              colorClass = "text-emerald-300";
            } else if (waveAge >= 0.4 && waveAge < 1.2) {
              // Wave Phase 2: Polygon Shards & Rotation Drift
              opacity = Math.max(0.1, 1 - (waveAge - 0.4) * 1.2);
              filter = "url(#decay-heavy-noise)";
              const shardVal = Math.floor((waveAge - 0.4) * 35);
              clipPath = `polygon(${shardVal}% 0%, 100% ${shardVal}%, ${100 - shardVal}% 100%, 0% ${100 - shardVal}%)`;
              const driftX = (index % 2 === 0 ? 1 : -1) * waveAge * 22;
              const driftY = waveAge * 18;
              transform = `translate(${driftX.toFixed(1)}px, ${driftY.toFixed(1)}px) rotate(${(driftX * 0.8).toFixed(1)}deg)`;
              colorClass = "text-neutral-400";
            } else {
              // Wave Phase 3: Total Dissolution / Ghost
              opacity = 0;
            }
          } else if (isHovered) {
            // Mouse Hovered Character: Glitch Noise & Shard Clipping
            opacity = 0.95;
            filter = "url(#decay-noise-filter)";
            clipPath = "polygon(0% 0%, 100% 12%, 88% 100%, 12% 88%)";
            const jx = (Math.random() - 0.5) * 4;
            const jy = (Math.random() - 0.5) * 4;
            transform = `translate(${jx.toFixed(1)}px, ${jy.toFixed(1)}px) scale(1.08)`;
            colorClass = "text-emerald-400";
          } else if (isNeighborHovered) {
            // Hovered Neighbor: Mild Jitter
            opacity = 0.9;
            filter = "url(#decay-noise-filter)";
            const jx = (Math.random() - 0.5) * 2;
            transform = `translate(${jx.toFixed(1)}px, 0px)`;
          }

          return (
            <span
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleCharClick(index)}
              className={`relative inline-block cursor-pointer transition-colors duration-150 font-black tracking-tight ${colorClass}`}
              style={{
                fontSize: "clamp(2rem, 4.5vw, 5rem)",
                lineHeight: 1,
                opacity,
                filter,
                clipPath,
                transform,
              }}
            >
              {char}

              {/* Cursor Blinking Block during Typewriting */}
              {isCurrentCursor ? (
                <span className="absolute -right-2 top-0 bottom-0 w-2 bg-emerald-400 animate-pulse shadow-[0_0_12px_#34d399]" />
              ) : null}
            </span>
          );
        })}
      </div>

      {subtext ? (
        <div
          onClick={() => handleCharClick(Math.floor(characters.length / 2))}
          className="mt-12 text-xs sm:text-sm font-mono tracking-widest text-neutral-400 uppercase cursor-pointer hover:text-emerald-400 transition-colors flex items-center gap-3"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {subtext}
        </div>
      ) : null}
    </div>
  );
};

export default ApparatusTypewriterDecay;
