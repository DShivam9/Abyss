"use client";

import React, { useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const ShatterSphere = dynamic(
  () => import("../../../../packages/core/src/components/3d-shatter-sphere"),
  { ssr: false }
);

type CascadeMode = "center-outward" | "edges-inward";
type RollDirection = "upward" | "downward";

function getStepIndices(length: number, mode: CascadeMode): number[] {
  const steps = new Array(length).fill(0);
  const center = (length - 1) / 2;
  for (let i = 0; i < length; i++) {
    if (mode === "center-outward") {
      steps[i] = Math.round(Math.abs(i - center));
    } else {
      steps[i] = Math.min(i, length - 1 - i);
    }
  }
  return steps;
}

interface RollTextTrackProps {
  text: string;
  className?: string;
  fontFamilyClass?: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function RollTextTrack({
  text,
  className = "",
  fontFamilyClass = "",
  containerRef,
}: RollTextTrackProps) {
  const chars = text.split("");
  return (
    <div
      ref={containerRef}
      className={`inline-flex justify-center items-center select-none [perspective:400px] [transform-style:preserve-3d] ${fontFamilyClass} ${className}`}
    >
      {chars.map((char, idx) => (
        <span
          key={idx}
          className="char-wrapper relative inline-block overflow-hidden h-[1.15em] leading-none select-none [transform-style:preserve-3d]"
        >
          <span
            className="track-top block leading-none [transform-style:preserve-3d] [backface-visibility:hidden]"
            style={{ transformOrigin: "50% 50% -0.5em" }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
          <span
            className="track-bottom absolute inset-0 block leading-none [transform-style:preserve-3d] [backface-visibility:hidden]"
            style={{ transformOrigin: "50% 50% -0.5em" }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function HomePage() {
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!titleRef.current || !subtitleRef.current) return;

      const setupTextRoll = (
        containerEl: HTMLDivElement,
        text: string,
        mode: CascadeMode,
        direction: RollDirection,
        staggerVal: number
      ) => {
        const wrappers = containerEl.querySelectorAll(".char-wrapper");
        if (!wrappers.length) return [];

        const initialRotateBottom = direction === "upward" ? -90 : 90;
        const targetRotateTop = direction === "upward" ? 90 : -90;
        const trackBottoms = containerEl.querySelectorAll(".track-bottom");

        gsap.set(trackBottoms, {
          rotateX: initialRotateBottom,
          opacity: 0.2,
          filter: "brightness(0.2)",
        });

        const chars = text.split("");
        const steps = getStepIndices(chars.length, mode);
        const stepDelay = staggerVal * 0.4;

        const tweens: { topFrom: Record<string, unknown>; topTo: Record<string, unknown>; botFrom: Record<string, unknown>; botTo: Record<string, unknown>; delay: number; duration: number; topEl: Element; botEl: Element }[] = [];

        wrappers.forEach((wrapperEl, idx) => {
          const trackTop = wrapperEl.querySelector(".track-top");
          const trackBottom = wrapperEl.querySelector(".track-bottom");
          if (!trackTop || !trackBottom) return;

          const stepIndex = steps[idx];
          const duration = Math.max(0.85, 1.25 - stepIndex * 0.05);
          const startDelay = stepIndex * stepDelay;

          tweens.push({
            topEl: trackTop,
            botEl: trackBottom,
            delay: startDelay,
            duration,
            topFrom: { rotateX: 0, opacity: 1, filter: "brightness(1)" },
            topTo: { rotateX: targetRotateTop, opacity: 0.2, filter: "brightness(0.2)" },
            botFrom: { rotateX: initialRotateBottom, opacity: 0.2, filter: "brightness(0.2)" },
            botTo: { rotateX: 0, opacity: 1, filter: "brightness(1)" },
          });
        });

        return tweens;
      };

      const titleTweens = setupTextRoll(titleRef.current, "Unorthodox", "center-outward", "upward", 0.28);
      const subTweens = setupTextRoll(subtitleRef.current, "Components", "center-outward", "downward", 0.28);

      // Delayed fade-in for subtitle text and CTA button
      gsap.fromTo(
        ".hero-fade-in",
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          delay: 0.35,
          ease: "power2.out",
        }
      );

      const masterTl = gsap.timeline({ repeat: -1, repeatDelay: 6.0 });

      titleTweens.forEach((tw) => {
        masterTl.fromTo(tw.topEl, tw.topFrom, { ...tw.topTo, duration: tw.duration, ease: "power2.inOut" }, tw.delay);
        masterTl.fromTo(tw.botEl, tw.botFrom, { ...tw.botTo, duration: tw.duration, ease: "power2.inOut" }, tw.delay);
      });

      subTweens.forEach((tw) => {
        masterTl.fromTo(tw.topEl, tw.topFrom, { ...tw.topTo, duration: tw.duration, ease: "power2.inOut" }, tw.delay);
        masterTl.fromTo(tw.botEl, tw.botFrom, { ...tw.botTo, duration: tw.duration, ease: "power2.inOut" }, tw.delay);
      });
    },
    { scope: heroContainerRef }
  );

  return (
    <>
      <link 
        rel="stylesheet" 
        href="https://api.fontshare.com/v2/css?f[]=ranade@400,500,700&f[]=switzer@400,500,600&display=swap" 
      />
      <div className="min-h-screen bg-[#0A0A0A] text-[#E8E8ED] flex flex-col font-['Switzer',sans-serif] selection:bg-white selection:text-black">
        {/* Clean Top Navigation - Stays static & immediately visible */}
        <header className="relative z-50 w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between pointer-events-auto">
          <Link 
            href="/" 
            className="text-base md:text-lg font-semibold tracking-tight text-white/90 hover:text-white transition-colors duration-200 active:scale-[0.97] font-['Ranade',sans-serif] cursor-pointer"
          >
            ABYSS
          </Link>
          <nav className="flex items-center gap-8 md:gap-10 text-sm md:text-base font-medium text-neutral-400 font-['Switzer',sans-serif]">
            <Link 
              href="/docs" 
              className="hover:text-white transition-colors duration-200 active:scale-[0.97] cursor-pointer"
            >
              Docs
            </Link>
            <Link 
              href="/components" 
              className="hover:text-white transition-colors duration-200 active:scale-[0.97] cursor-pointer"
            >
              Components
            </Link>
            <Link 
              href="/changelog" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-200 active:scale-[0.97] cursor-pointer"
            >
              Changelog
            </Link>
          </nav>
        </header>

        {/* Super Minimalist Hero with 3D Shatter Sphere Backdrop */}
        <main ref={heroContainerRef} className="relative flex-1 flex flex-col items-center justify-center px-6 text-center gap-1 -mt-24">
          {/* Interactive 3D Shatter Sphere Backdrop (Sphere Mode Only) */}
          <div className="absolute inset-0 z-0 pointer-events-auto opacity-60 hover:opacity-100 transition-opacity duration-700 overflow-hidden">
            <ShatterSphere
              shapeMode="sphere"
              showCenterText={false}
              sphereRadius={540}
              shatterForce={2.6}
              autoRotateSpeed={0.5}
              itemCount={38}
              autoShatterDelay={9000}
              disableRebuildOnClick={true}
            />
          </div>

          {/* Main Hero Text - Stays immediately visible in foreground */}
          <div className="relative z-10 pointer-events-none flex flex-col items-center justify-center gap-1">
            <RollTextTrack
              text="Unorthodox"
              containerRef={titleRef}
              fontFamilyClass="font-['Ranade',sans-serif]"
              className="text-5xl sm:text-6xl md:text-8xl font-medium tracking-tight text-white leading-[0.95]"
            />
            <RollTextTrack
              text="Components"
              containerRef={subtitleRef}
              fontFamilyClass="font-['Ranade',sans-serif]"
              className="text-5xl sm:text-6xl md:text-8xl font-medium tracking-tight text-white leading-[0.95]"
            />

            {/* Subtitle & CTA Button fade in slightly later */}
            <p className="hero-fade-in opacity-0 mt-4 text-xs sm:text-sm text-neutral-400 font-normal tracking-wide font-['Switzer',sans-serif]">
              Building things a little differently.
            </p>

            {/* Pill Hover-Reveal Arrow Hero Action Button */}
            <div className="hero-fade-in opacity-0 mt-8 flex items-center justify-center pointer-events-auto">
              <Link
                href="/components"
                className="group relative flex items-center h-12 text-black font-['Switzer',sans-serif] active:scale-[0.97] transition-transform duration-160 cursor-pointer"
              >
                {/* Inner Label */}
                <div className="bg-white rounded-full h-12 px-8 flex items-center justify-center whitespace-nowrap text-sm font-semibold relative z-10 w-full group-hover:w-[calc(100%-52px)] transition-all duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)]">
                  Browse Components
                </div>

                {/* Stark Lime Circle Arrow Reveal */}
                <div className="bg-[#a3e635] rounded-full h-12 w-12 flex items-center justify-center absolute right-0 scale-0 origin-left group-hover:scale-100 transition-transform duration-500 ease-[cubic-bezier(0.165,0.84,0.44,1)]">
                  <span className="grid place-items-center w-full h-full text-black -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] delay-100">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}





