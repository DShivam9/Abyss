import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ApparatusScrollTextRevealProps } from "./types";

type CascadeMode = "center-outward" | "left-to-right" | "right-to-left" | "edges-inward" | "alternating" | "random";
type RollDirection = "upward" | "downward";

interface VariantItem {
  id: string;
  word: string;
  label: string;
  cascadeMode: CascadeMode;
  rollDirection: RollDirection;
}

const VARIANTS: VariantItem[] = [
  { id: "1", word: "TRANSCENDENCE", label: "CENTER-OUTWARD / UPWARD", cascadeMode: "center-outward", rollDirection: "upward" },
  { id: "2", word: "INFRASTRUCTURE", label: "LEFT-TO-RIGHT / UPWARD", cascadeMode: "left-to-right", rollDirection: "upward" },
  { id: "3", word: "SYNCHRONICITY", label: "RIGHT-TO-LEFT / UPWARD", cascadeMode: "right-to-left", rollDirection: "upward" },
  { id: "4", word: "ARCHITECTURAL", label: "EDGES-INWARD / UPWARD", cascadeMode: "edges-inward", rollDirection: "upward" },
  { id: "5", word: "AUTHENTICITY", label: "CENTER-OUTWARD / DOWNWARD", cascadeMode: "center-outward", rollDirection: "downward" },
  { id: "6", word: "EXTRAORDINARY", label: "LEFT-TO-RIGHT / DOWNWARD", cascadeMode: "left-to-right", rollDirection: "downward" },
  { id: "7", word: "REVOLUTIONARY", label: "RIGHT-TO-LEFT / DOWNWARD", cascadeMode: "right-to-left", rollDirection: "downward" },
  { id: "8", word: "INTERCONNECTED", label: "EDGES-INWARD / DOWNWARD", cascadeMode: "edges-inward", rollDirection: "downward" },
  { id: "9", word: "DISPROPORTION", label: "ALTERNATING WAVE / UPWARD", cascadeMode: "alternating", rollDirection: "upward" },
  { id: "10", word: "UNQUESTIONABLE", label: "ALTERNATING WAVE / DOWNWARD", cascadeMode: "alternating", rollDirection: "downward" },
  { id: "11", word: "MULTIDIMENSIONAL", label: "RANDOM CHAOS / UPWARD", cascadeMode: "random", rollDirection: "upward" },
  { id: "12", word: "COMPREHENSIVE", label: "RANDOM CHAOS / DOWNWARD", cascadeMode: "random", rollDirection: "downward" },
];

const HERO_WORD = "ABYSS 3D REEL";

// Helper: Calculate character step indices based on cascade mode
function getStepIndices(length: number, mode: CascadeMode): number[] {
  const steps = new Array(length).fill(0);
  const center = (length - 1) / 2;

  for (let i = 0; i < length; i++) {
    if (mode === "center-outward") {
      steps[i] = Math.round(Math.abs(i - center));
    } else if (mode === "left-to-right") {
      steps[i] = i;
    } else if (mode === "right-to-left") {
      steps[i] = length - 1 - i;
    } else if (mode === "edges-inward") {
      steps[i] = Math.min(i, length - 1 - i);
    } else if (mode === "alternating") {
      steps[i] = i % 2 === 0 ? 0 : 2;
    } else if (mode === "random") {
      steps[i] = (i * 3 + 1) % 5;
    }
  }
  return steps;
}

// Helper: Calculate character roll duration
function getCharDuration(stepIndex: number, speed: number, mode: CascadeMode): number {
  const baseDuration = 0.55;
  if (mode === "center-outward" || mode === "edges-inward") {
    const catchupScale = 0.04;
    return Math.max(0.35, baseDuration - stepIndex * catchupScale) / speed;
  }
  return 0.45 / speed;
}

// Pre-process static variants once outside component body
const PROCESSED_VARIANTS = VARIANTS.map((v) => {
  const chars = v.word.split("");
  const steps = getStepIndices(chars.length, v.cascadeMode);
  const wordChars = chars.map((char, idx) => ({
    char,
    stepIndex: steps[idx],
    duration: getCharDuration(steps[idx], 1.0, v.cascadeMode),
  }));
  return { ...v, wordChars };
});

export const ApparatusScrollTextReveal: React.FC<ApparatusScrollTextRevealProps> = ({
  subtitle = "DISCOVER INTERACTIVE VARIANTS",
  speed = 1.0,
  stagger = 0.15,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLHeadingElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const timelinesRef = useRef<(gsap.core.Timeline | null)[]>([]);

  const [heroIndex, setHeroIndex] = useState(0);

  const currentHeroVariant = VARIANTS[heroIndex];

  // Automated Hero Loop Animation
  useGSAP(
    () => {
      if (!heroRef.current) return;

      const wrappers = heroRef.current.querySelectorAll(".char-wrapper");
      if (!wrappers || wrappers.length === 0) return;

      const initialRotateBottom = currentHeroVariant.rollDirection === "upward" ? -90 : 90;
      const targetRotateTop = currentHeroVariant.rollDirection === "upward" ? 90 : -90;

      const trackBottoms = heroRef.current.querySelectorAll(".track-bottom");
      gsap.set(trackBottoms, {
        rotateX: initialRotateBottom,
        opacity: 0.2,
        filter: "brightness(0.2)",
      });

      const heroChars = HERO_WORD.split("").map((char, idx) => {
        const steps = getStepIndices(HERO_WORD.length, currentHeroVariant.cascadeMode);
        return {
          char,
          stepIndex: steps[idx],
          duration: getCharDuration(steps[idx], speed, currentHeroVariant.cascadeMode),
        };
      });

      const stepDelay = (stagger * 0.4) / speed;
      const tl = gsap.timeline();

      wrappers.forEach((wrapperEl, idx) => {
        const trackTop = wrapperEl.querySelector(".track-top");
        const trackBottom = wrapperEl.querySelector(".track-bottom");
        const item = heroChars[idx];
        if (!trackTop || !trackBottom || !item) return;

        const startDelay = item.stepIndex * stepDelay;

        tl.fromTo(
          trackTop,
          { rotateX: 0, opacity: 1, filter: "brightness(1)" },
          {
            rotateX: targetRotateTop,
            opacity: 0.2,
            filter: "brightness(0.2)",
            duration: item.duration,
            ease: "power3.inOut",
          },
          startDelay
        );

        tl.fromTo(
          trackBottom,
          { rotateX: initialRotateBottom, opacity: 0.2, filter: "brightness(0.2)" },
          {
            rotateX: 0,
            opacity: 1,
            filter: "brightness(1)",
            duration: item.duration,
            ease: "power3.inOut",
          },
          startDelay
        );
      });

      const maxDist = Math.max(...heroChars.map((c) => c.stepIndex));
      const finishTime = maxDist * stepDelay + 0.6;
      tl.to({}, { duration: 3.0 }, finishTime).call(() => {
        setHeroIndex((prev) => (prev + 1) % VARIANTS.length);
      });
    },
    { scope: containerRef, dependencies: [heroIndex, speed, stagger] }
  );

  // Section 2 Interactive Hover Timelines + Staggered Row Divider Line Wipes
  useGSAP(
    () => {
      if (!containerRef.current || !section2Ref.current) return;

      onLifecycleChange?.("discovery");

      // 1. Setup Card Hover Timelines
      timelinesRef.current = PROCESSED_VARIANTS.map((v, itemIdx) => {
        const itemEl = itemsRef.current[itemIdx];
        if (!itemEl) return null;

        const wrappers = itemEl.querySelectorAll(".char-wrapper");
        if (!wrappers || wrappers.length === 0) return null;

        const initialRotateBottom = v.rollDirection === "upward" ? -90 : 90;
        const targetRotateTop = v.rollDirection === "upward" ? 90 : -90;

        const trackBottoms = itemEl.querySelectorAll(".track-bottom");
        gsap.set(trackBottoms, {
          rotateX: initialRotateBottom,
          opacity: 0.2,
          filter: "brightness(0.2)",
        });

        const tl = gsap.timeline({ paused: true });
        const stepDelay = (stagger * 0.4) / speed;

        wrappers.forEach((wrapperEl, idx) => {
          const trackTop = wrapperEl.querySelector(".track-top");
          const trackBottom = wrapperEl.querySelector(".track-bottom");
          const item = v.wordChars[idx];
          if (!trackTop || !trackBottom || !item) return;

          const startDelay = item.stepIndex * stepDelay;

          tl.fromTo(
            trackTop,
            { rotateX: 0, opacity: 1, filter: "brightness(1)" },
            {
              rotateX: targetRotateTop,
              opacity: 0.2,
              filter: "brightness(0.2)",
              duration: item.duration,
              ease: "power3.inOut",
            },
            startDelay
          );

          tl.fromTo(
            trackBottom,
            { rotateX: initialRotateBottom, opacity: 0.2, filter: "brightness(0.2)" },
            {
              rotateX: 0,
              opacity: 1,
              filter: "brightness(1)",
              duration: item.duration,
              ease: "power3.inOut",
            },
            startDelay
          );
        });

        return tl;
      });

      // 2. Scroll-Triggered Alternating Row Line Wipes
      const dividerLines = section2Ref.current.querySelectorAll(".row-divider-line");
      if (dividerLines && dividerLines.length > 0) {
        dividerLines.forEach((line, idx) => {
          const isEven = idx % 2 === 0;
          const origin = isEven ? "left center" : "right center";
          gsap.set(line, { scaleX: 0, transformOrigin: origin });

          gsap.to(line, {
            scaleX: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section2Ref.current,
              start: `top+=${idx * 160 + 80}px 70%`,
              toggleActions: "play reverse play reverse",
            },
          });
        });
      }
    },
    { scope: containerRef, dependencies: [stagger, speed] }
  );

  const handleMouseEnter = (index: number) => {
    timelinesRef.current[index]?.restart();
  };

  const handleMouseLeave = (index: number) => {
    timelinesRef.current[index]?.reverse();
  };

  return (
    <div
      ref={containerRef}
      className={`w-full min-h-screen bg-[#0A0A0A] text-[#E5E5E5] font-sans antialiased ${className}`}
      style={style}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      {/* Section 1: Fullscreen Hero */}
      <section className="w-full h-screen flex flex-col justify-between items-center py-12 px-8 select-none text-center relative overflow-hidden">
        {/* Dynamic Hero Title Loop */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2
            key={heroIndex}
            ref={heroRef}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#FAFAFA] uppercase leading-none flex justify-center [perspective:400px] [transform-style:preserve-3d]"
          >
            {HERO_WORD.split("").map((char, idx) => (
              <span
                key={idx}
                className="char-wrapper relative inline-block overflow-hidden h-[1.15em] leading-none select-none [transform-style:preserve-3d]"
              >
                <span
                  className="track-top block leading-none text-[#FAFAFA] [transform-style:preserve-3d] [backface-visibility:hidden]"
                  style={{ transformOrigin: "50% 50% -0.5em" }}
                >
                  {char}
                </span>
                <span
                  className="track-bottom absolute inset-0 block leading-none text-[#FAFAFA] [transform-style:preserve-3d] [backface-visibility:hidden]"
                  style={{ transformOrigin: "50% 50% -0.5em" }}
                >
                  {char}
                </span>
              </span>
            ))}
          </h2>

          {/* Clean 3D Rolling Number Indicator 07 / 12 */}
          <div className="mt-8 flex items-center justify-center gap-1.5 font-mono text-xs text-[#888888]">
            <span
              key={heroIndex}
              className="inline-block overflow-hidden h-[1.15em] leading-none [perspective:200px] [transform-style:preserve-3d]"
            >
              <span className="block leading-none text-[#FAFAFA] animate-[slideUp_0.4s_cubic-bezier(0.23,1,0.32,1)]">
                {String(heroIndex + 1).padStart(2, "0")}
              </span>
            </span>
            <span>/ 12</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="flex flex-col items-center gap-3 select-none cursor-pointer group pb-4">
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#666666] uppercase group-hover:text-[#FAFAFA] transition-colors duration-200">
            {subtitle}
          </span>
          <div className="w-5 h-9 rounded-full border border-white/20 flex justify-center p-1.5 group-hover:border-white/50 transition-colors duration-200">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FAFAFA] animate-bounce" />
          </div>
        </div>
      </section>

      {/* Section 2: Direct Canvas Grid (Interactive Hover Variants) */}
      <section
        ref={section2Ref}
        className="w-full min-h-screen flex flex-col items-center justify-center px-8 py-24 select-none relative"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 w-full max-w-7xl">
          {PROCESSED_VARIANTS.map((variant, vIdx) => (
            <React.Fragment key={variant.id}>
              <div
                ref={(el) => {
                  itemsRef.current[vIdx] = el;
                }}
                onMouseEnter={() => handleMouseEnter(vIdx)}
                onMouseLeave={() => handleMouseLeave(vIdx)}
                className="group flex flex-col justify-between items-center p-6 cursor-pointer select-none min-h-[180px]"
              >
                {/* Top: 3D Roll Word */}
                <div className="w-full flex justify-center items-center overflow-hidden py-4">
                  <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-[#FAFAFA] uppercase leading-none flex justify-center [perspective:400px] [transform-style:preserve-3d]">
                    {variant.wordChars.map((item, cIdx) => (
                      <span
                        key={cIdx}
                        className="char-wrapper relative inline-block overflow-hidden h-[1.15em] leading-none select-none [transform-style:preserve-3d]"
                      >
                        <span
                          className="track-top block leading-none text-[#FAFAFA] [transform-style:preserve-3d] [backface-visibility:hidden]"
                          style={{ transformOrigin: "50% 50% -0.5em" }}
                        >
                          {item.char}
                        </span>
                        <span
                          className="track-bottom absolute inset-0 block leading-none text-[#FAFAFA] [transform-style:preserve-3d] [backface-visibility:hidden]"
                          style={{ transformOrigin: "50% 50% -0.5em" }}
                        >
                          {item.char}
                        </span>
                      </span>
                    ))}
                  </h3>
                </div>

                {/* Bottom: Direction Badge Label */}
                <div className="w-full flex justify-center items-center mt-4">
                  <span className="text-[10px] font-mono tracking-widest text-[#666666] uppercase group-hover:text-[#FAFAFA] transition-colors duration-200">
                    {variant.label}
                  </span>
                </div>
              </div>

              {/* Row Divider Line */}
              {(vIdx + 1) % 3 === 0 && vIdx < PROCESSED_VARIANTS.length - 1 && (
                <div className="hidden lg:block col-span-3 w-full my-4 overflow-hidden">
                  <div className="row-divider-line w-full h-[1px] bg-white/10" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ApparatusScrollTextReveal;
