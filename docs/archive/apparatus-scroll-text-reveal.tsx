// Saved backup of scroll-text-reveal
// Created for later reference/use.

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { VesselComponentProps } from "../../packages/core/src/engine/types";

export interface ApparatusScrollTextRevealProps extends VesselComponentProps {
  title?: string;
  subtitle?: string;
  speed?: number;
  stagger?: number;
}

export const ApparatusScrollTextReveal: React.FC<ApparatusScrollTextRevealProps> = ({
  title = "SCROLL TEXT REVEAL",
  subtitle = "Scroll Down",
  speed = 1.0,
  stagger = 0.05,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !section2Ref.current) return;

      onLifecycleChange?.("discovery");

      const chars = section2Ref.current.querySelectorAll(".reveal-char");

      gsap.fromTo(
        chars,
        {
          opacity: 0.15,
          y: 20,
          rotateX: -45,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8 * (1 / Math.max(0.1, speed)),
          stagger: stagger,
          ease: "cubic-bezier(0.16, 1, 0.3, 1)",
          scrollTrigger: {
            trigger: section2Ref.current,
            start: "top 75%",
            end: "bottom 40%",
            scrub: 0.8,
            onEnter: () => onLifecycleChange?.("buildUp"),
            onLeave: () => onLifecycleChange?.("peak"),
            onLeaveBack: () => onLifecycleChange?.("recovery"),
          },
        }
      );
    },
    { scope: containerRef, dependencies: [speed, stagger] }
  );

  const paragraphText =
    "Typography is the balance between spatial geometry and physical rhythm. As motion passes through each character, weight shifts, atmosphere transforms, and structure reveals itself.";

  const words = paragraphText.split(" ");

  return (
    <div
      ref={containerRef}
      className={`w-full min-h-screen bg-[#0A0A0A] text-[#E5E5E5] font-sans antialiased ${className}`}
      style={style}
    >
      <section
        ref={section1Ref}
        className="w-full h-screen flex flex-col justify-between items-center py-16 px-8 select-none text-center"
      >
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl tracking-widest font-medium uppercase text-[#FAFAFA]">
            {title}
          </h1>
        </div>
        <div className="flex flex-col items-center gap-3 opacity-60">
          <span className="text-xs uppercase tracking-[0.3em] font-mono">
            {subtitle}
          </span>
          <div className="w-[1px] h-8 bg-[#E5E5E5]/40 animate-pulse" />
        </div>
      </section>

      <section
        ref={section2Ref}
        className="w-full min-h-screen flex items-center justify-center px-6 py-24 md:px-20 max-w-5xl mx-auto"
      >
        <p className="text-2xl md:text-4xl lg:text-5xl leading-relaxed tracking-tight text-[#FAF9F6] font-light flex flex-wrap gap-x-3 gap-y-2">
          {words.map((word, wIdx) => (
            <span key={wIdx} className="inline-block whitespace-nowrap">
              {word.split("").map((char, cIdx) => (
                <span
                  key={cIdx}
                  className="reveal-char inline-block transition-colors duration-150 origin-bottom"
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </p>
      </section>
    </div>
  );
};

export default ApparatusScrollTextReveal;
