import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ApparatusPageOverlayWipeProps,
  WipeDirection,
  WipeStyle,
} from "./types";

interface TransitionImageItem {
  id: string;
  label: string;
  tag: string;
  image: string;
  headline: string;
  eyebrow: string;
}

const DEFAULT_PAGES: TransitionImageItem[] = [
  {
    id: "page-01",
    label: "01",
    eyebrow: "VESSEL // APPARATUS TRANSITION 12",
    headline: "PHYSICAL BARRIER OVERLAY WIPE",
    tag: "ROUTE 01 // DEPLOYMENT SEAL",
    image: "/images/components images/Transitions/ChatGPT Image Jul 15, 2026, 05_26_02 PM.png",
  },
  {
    id: "page-02",
    label: "02",
    eyebrow: "VESSEL // SPATIAL SEGREGATION",
    headline: "ZERO VISUAL BLEED CONTINUITY",
    tag: "ROUTE 02 // MONOLITHIC SWEEP",
    image: "/images/components images/Transitions/ChatGPT Image Jul 15, 2026, 05_29_20 PM.png",
  },
  {
    id: "page-03",
    label: "03",
    eyebrow: "VESSEL // KINETIC HARDWARE",
    headline: "DUAL-PHASE VELOCITY CURVE",
    tag: "ROUTE 03 // VECTOR CURTAIN",
    image: "/images/components images/Transitions/ChatGPT Image Jul 15, 2026, 05_37_33 PM.png",
  },
];


export const ApparatusPageOverlayWipe: React.FC<
  ApparatusPageOverlayWipeProps
> = ({
  pages = DEFAULT_PAGES as any,
  className = "",
  style,
  coverDuration = 400,
  revealDuration = 400,
  wipeDirection = "bottom-to-top",
  wipeStyle = "solid",
  overlayColor = "#0e0e11",
  accentLineColor = "#3b82f6",
  showAccentHairline = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  enable3DDepth = true,
  enableParallaxCounter = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const slatGroupRef = useRef<HTMLDivElement>(null);


  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayedIdx, setDisplayedIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // HUD Control parameters derived from props
  const covDur = coverDuration;
  const revDur = revealDuration;
  const direction = wipeDirection;
  const styleVariant = wipeStyle;
  const panelColor = overlayColor;
  const accentColor = accentLineColor;
  const hasHairline = showAccentHairline;
  const isAutoPlay = autoPlay;
  const playInterval = autoPlayInterval;

  // Awwwards Enhancement Toggles
  const has3DDepth = enable3DDepth;
  const hasParallax = enableParallaxCounter;

  const activeItems = (
    pages.length > 0 ? pages : DEFAULT_PAGES
  ) as TransitionImageItem[];
  const currentItem = activeItems[displayedIdx % activeItems.length];

  // Vector offset calculations based on direction
  const getTransforms = useCallback((dir: WipeDirection) => {
    switch (dir) {
      case "bottom-to-top":
        return {
          start: { xPercent: 0, yPercent: 100 },
          covered: { xPercent: 0, yPercent: 0 },
          exit: { xPercent: 0, yPercent: -100 },
          hairlineStyle: "top-0 left-0 w-full h-[2px]",
        };
      case "top-to-bottom":
        return {
          start: { xPercent: 0, yPercent: -100 },
          covered: { xPercent: 0, yPercent: 0 },
          exit: { xPercent: 0, yPercent: 100 },
          hairlineStyle: "bottom-0 left-0 w-full h-[2px]",
        };
      case "left-to-right":
        return {
          start: { xPercent: -100, yPercent: 0 },
          covered: { xPercent: 0, yPercent: 0 },
          exit: { xPercent: 100, yPercent: 0 },
          hairlineStyle: "top-0 right-0 w-2 h-full",
        };
      case "right-to-left":
        return {
          start: { xPercent: 100, yPercent: 0 },
          covered: { xPercent: 0, yPercent: 0 },
          exit: { xPercent: -100, yPercent: 0 },
          hairlineStyle: "top-0 left-0 w-2 h-full",
        };
    }
  }, []);

  const { contextSafe } = useGSAP({ scope: containerRef });

  // Trigger 2-phase GSAP overlay transition with WipeStyle variants
  const executeWipe = contextSafe((nextIndex: number) => {
    if (isAnimating || !overlayRef.current) return;
    setIsAnimating(true);

    const t = getTransforms(direction);
    const overlay = overlayRef.current;
    const hairline = hairlineRef.current;
    const viewContainer = viewContainerRef.current;
    const imgEl = imageRef.current;
    const slatEls = slatGroupRef.current?.children;


    const vesselCurve = "cubic-bezier(0.16, 1, 0.3, 1)";
    const isVert = direction === "bottom-to-top" || direction === "top-to-bottom";

    // Set initial position
    gsap.set(overlay, {
      xPercent: styleVariant === "solid" ? t.start.xPercent : 0,
      yPercent: styleVariant === "solid" ? t.start.yPercent : 0,
      clipPath: styleVariant === "iris-portal" ? "circle(0% at 50% 50%)" : "none",
      display: "block",
    });

    if (slatEls && styleVariant === "multi-layer-slat") {
      gsap.set(slatEls, { yPercent: 100 });
    }

    if (hairline && hasHairline) {
      gsap.set(hairline, { opacity: 1 });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
        gsap.set(overlay, { display: "none" });
        if (viewContainer) gsap.set(viewContainer, { rotateX: 0, scale: 1, opacity: 1 });
        if (imgEl) gsap.set(imgEl, { yPercent: 0, xPercent: 0 });
      },
    });

    // Phase 1: COVER
    if (has3DDepth && viewContainer) {
      tl.to(
        viewContainer,
        {
          rotateX: styleVariant === "solid" ? -6 : 0,
          scale: 0.94,
          opacity: 0.5,
          duration: covDur / 1000,
          ease: vesselCurve,
        },
        0
      );
    }

    if (hasParallax && imgEl && styleVariant === "solid") {
      const pOffset = direction === "bottom-to-top" || direction === "right-to-left" ? -12 : 12;
      tl.to(
        imgEl,
        {
          [isVert ? "yPercent" : "xPercent"]: pOffset,
          duration: covDur / 1000,
          ease: vesselCurve,
        },
        0
      );
    }

    if (styleVariant === "multi-layer-slat" && slatEls) {
      tl.to(
        slatEls,
        {
          yPercent: 0,
          stagger: 0.06,
          duration: covDur / 1000,
          ease: vesselCurve,
        },
        0
      );
    } else if (styleVariant === "iris-portal") {
      tl.to(
        overlay,
        {
          clipPath: "circle(150% at 50% 50%)",
          duration: covDur / 1000,
          ease: vesselCurve,
        },
        0
      );
    } else {
      tl.to(
        overlay,
        {
          xPercent: t.covered.xPercent,
          yPercent: t.covered.yPercent,
          duration: covDur / 1000,
          ease: vesselCurve,
        },
        0
      );
    }

    // Phase 2: SWAP (Midpoint callback when viewport is 100% covered)
    tl.add(() => {
      setDisplayedIdx(nextIndex);
      setCurrentIdx(nextIndex);
      if (has3DDepth && viewContainer) {
        gsap.set(viewContainer, { rotateX: styleVariant === "solid" ? 6 : 0, scale: 1.06, opacity: 0.7 });
      }
      if (hasParallax && imgEl && styleVariant === "solid") {
        const pOffset = direction === "bottom-to-top" || direction === "right-to-left" ? 12 : -12;
        gsap.set(imgEl, { [isVert ? "yPercent" : "xPercent"]: pOffset });
      }
    });

    // Phase 3: REVEAL
    if (styleVariant === "multi-layer-slat" && slatEls) {
      tl.to(slatEls, {
        yPercent: -100,
        stagger: 0.06,
        duration: revDur / 1000,
        ease: vesselCurve,
      });
    } else if (styleVariant === "iris-portal") {
      tl.to(overlay, {
        clipPath: "circle(0% at 50% 50%)",
        duration: revDur / 1000,
        ease: vesselCurve,
      });
    } else {
      tl.to(overlay, {
        xPercent: t.exit.xPercent,
        yPercent: t.exit.yPercent,
        duration: revDur / 1000,
        ease: vesselCurve,
      });
    }



    if (has3DDepth && viewContainer) {
      tl.to(
        viewContainer,
        {
          rotateX: 0,
          scale: 1.0,
          opacity: 1.0,
          duration: revDur / 1000,
          ease: vesselCurve,
        },
        ">-=" + revDur / 1000
      );
    }

    if (hasParallax && imgEl) {
      tl.to(
        imgEl,
        {
          xPercent: 0,
          yPercent: 0,
          duration: revDur / 1000,
          ease: vesselCurve,
        },
        "<"
      );
    }
  });


  const requestTransition = useCallback(
    (targetIdx?: number) => {
      if (isAnimating) return;
      const nextIdx =
        targetIdx !== undefined
          ? targetIdx
          : (currentIdx + 1) % activeItems.length;
      executeWipe(nextIdx);
    },
    [isAnimating, currentIdx, activeItems.length, executeWipe]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement
      )
        return;
      if (
        e.key === "ArrowRight" ||
        e.key === "ArrowDown" ||
        e.key === " " ||
        e.key === "d" ||
        e.key === "D"
      ) {
        requestTransition();
      } else if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "a" ||
        e.key === "A"
      ) {
        const prevIdx =
          (currentIdx - 1 + activeItems.length) % activeItems.length;
        requestTransition(prevIdx);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [requestTransition, currentIdx, activeItems.length]);

  // AutoPlay loop
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      requestTransition();
    }, playInterval);
    return () => clearInterval(timer);
  }, [isAutoPlay, playInterval, requestTransition]);

  const currentTransforms = getTransforms(direction);

  return (
    <div
      ref={containerRef}
      onClick={() => requestTransition()}
      className={`relative w-full h-full min-h-[500px] bg-[#050507] text-white overflow-hidden select-none cursor-pointer font-sans [perspective:1000px] ${className}`}
      style={style}
    >
      {/* ─── FULL-BLEED IMAGE VIEW CONTAINER (3D Z-recession target) ─── */}
      <div ref={viewContainerRef} className="absolute inset-0 z-0 overflow-hidden transform-gpu">
        <img
          ref={imageRef}
          src={currentItem.image}
          alt="Transition view"
          className="w-full h-full object-cover object-center transform-gpu"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* ─── TOP CENTER: MINIMAL NUMBER TABS (1  2  3) WITH SLIDING UNDERLINE ─── */}
      <div
        className="pointer-events-auto"
        style={{
          position: "absolute",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 150,
          display: "flex",
          alignItems: "center",
          gap: "24px",
        }}
      >
        {activeItems.map((item, itemIdx) => {
          const isActive = displayedIdx === itemIdx;
          return (
            <button
              key={item.id || itemIdx}
              onClick={(e) => {
                e.stopPropagation();
                requestTransition(itemIdx);
              }}
              disabled={isAnimating}
              className={`relative text-sm font-mono font-bold transition-colors cursor-pointer px-2 py-1 ${
                isActive ? "text-white" : "text-neutral-500 hover:text-neutral-200"
              }`}
            >
              <span>{itemIdx + 1}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderlineOverlayWipe"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ─── PHYSICAL BARRIER OVERLAY PANEL ─── */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-50 pointer-events-none hidden overflow-hidden"
        style={{
          backgroundColor:
            styleVariant === "multi-layer-slat"
              ? "transparent"
              : panelColor,
        }}
      >
        {/* Multi-Layer Slats */}
        {styleVariant === "multi-layer-slat" && (
          <div ref={slatGroupRef} className="absolute inset-0 w-full h-full">
            <div
              className="absolute inset-0 w-full h-full"
              style={{ backgroundColor: accentColor, opacity: 0.8 }}
            />
            <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: "#1e1e24" }} />
            <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: panelColor }} />
          </div>
        )}

        {/* Accent Hairline on Leading Edge */}
        {hasHairline && styleVariant === "solid" && (
          <div
            ref={hairlineRef}
            className={`absolute ${currentTransforms.hairlineStyle}`}
            style={{ backgroundColor: accentColor }}
          />
        )}
      </div>

    </div>
  );
};

export default ApparatusPageOverlayWipe;
