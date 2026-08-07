import React, { useEffect, useState, useCallback, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { VesselComponentProps } from "../../engine/types";

export interface TransitionItem {
  id: string;
  label: string;
  eyebrow: string;
  headline: string;
  image: string;
}

export type OriginEasingCurve =
  | "vessel-smooth"
  | "elastic-spring"
  | "expo-power"
  | "cubic-luxury";

export interface ApparatusOriginExpandProps extends VesselComponentProps {
  items?: TransitionItem[];
  easingCurve?: OriginEasingCurve;
  expandDuration?: number;
  bgBlurAmount?: number;
  bgScaleRecede?: number;
  overlayDimmer?: number;
  cardScaleActive?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const DEFAULT_ITEMS: TransitionItem[] = [
  {
    id: "origin-01",
    label: "01",
    eyebrow: "VESSEL // ORIGIN EXPAND 01",
    headline: "ELEMENT RECTANGLE EXPANSION",
    image: "/images/components images/Transitions/ChatGPT Image Jul 15, 2026, 05_26_02 PM.webp",
  },
  {
    id: "origin-02",
    label: "02",
    eyebrow: "VESSEL // ORIGIN EXPAND 02",
    headline: "SPATIAL MORPH CONTINUITY",
    image: "/images/components images/Transitions/ChatGPT Image Jul 15, 2026, 05_29_20 PM.webp",
  },
  {
    id: "origin-03",
    label: "03",
    eyebrow: "VESSEL // ORIGIN EXPAND 03",
    headline: "DYNAMIC BOUNDING RECT",
    image: "/images/components images/Transitions/ChatGPT Image Jul 15, 2026, 05_37_33 PM.webp",
  },
];

const EASING_MAP: Record<OriginEasingCurve, string> = {
  "vessel-smooth": "cubic-bezier(0.19, 1, 0.22, 1)",
  "cubic-luxury": "cubic-bezier(0.22, 1, 0.36, 1)",
  "elastic-spring": "back.out(1.2)",
  "expo-power": "expo.out",
};

export const ApparatusOriginExpand: React.FC<ApparatusOriginExpandProps> = ({
  items = DEFAULT_ITEMS,
  className = "",
  style,
  easingCurve = "vessel-smooth",
  expandDuration = 600,
  bgBlurAmount = 14,
  bgScaleRecede = 0.93,
  overlayDimmer = 0.35,
  cardScaleActive = 1.08,
  autoPlay = false,
  autoPlayInterval = 5000,
  imageSrc,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgViewRef = useRef<HTMLDivElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const maskImgRef = useRef<HTMLImageElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayedIdx, setDisplayedIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const activeItems = items.length > 0 ? items : DEFAULT_ITEMS;
  const currentItem = activeItems[displayedIdx % activeItems.length];

  const selectedEase = EASING_MAP[easingCurve] || EASING_MAP["vessel-smooth"];

  const { contextSafe } = useGSAP({ scope: containerRef });

  const executeOriginExpand = contextSafe((nextIdx: number, originRect?: DOMRect) => {
    if (isAnimating || !maskRef.current || !containerRef.current || !maskImgRef.current) return;
    setIsAnimating(true);

    const mask = maskRef.current;
    const maskImg = maskImgRef.current;
    const bgView = bgViewRef.current;
    const containerRect = containerRef.current.getBoundingClientRect();

    let startX = containerRect.width / 2 - 42;
    let startY = containerRect.height - 90;
    let startW = 84;
    let startH = 52;

    if (originRect) {
      startX = originRect.left - containerRect.left;
      startY = originRect.top - containerRect.top;
      startW = originRect.width;
      startH = originRect.height;
    } else if (cardRefs.current[nextIdx]) {
      const cardRect = cardRefs.current[nextIdx]?.getBoundingClientRect();
      if (cardRect) {
        startX = cardRect.left - containerRect.left;
        startY = cardRect.top - containerRect.top;
        startW = cardRect.width;
        startH = cardRect.height;
      }
    }

    const nextItem = activeItems[nextIdx % activeItems.length];
    maskImg.src = nextItem.image;

    // Set FLIP initial bounds matching origin thumbnail
    gsap.set(maskImg, { opacity: 1, scale: 1 });
    gsap.set(mask, {
      position: "absolute",
      left: `${startX}px`,
      top: `${startY}px`,
      width: `${startW}px`,
      height: `${startH}px`,
      borderRadius: "12px",
      opacity: 1,
      backgroundColor: "transparent",
      display: "block",
      zIndex: 40,
    });

    const dur = expandDuration / 1000;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
        gsap.set(mask, { display: "none", opacity: 1 });
        if (bgView) {
          gsap.set(bgView, { scale: 1, filter: "blur(0px)", opacity: 1 });
        }
      },
    });

    // 1. Background Z-space recession with smooth depth blur
    if (bgView) {
      tl.to(
        bgView,
        {
          scale: bgScaleRecede,
          filter: `blur(${bgBlurAmount}px)`,
          opacity: overlayDimmer,
          duration: dur * 0.45,
          ease: selectedEase,
        },
        0
      );
    }

    // 2. Clicked image physically FLIP morphs to full viewport
    tl.to(
      mask,
      {
        left: "0px",
        top: "0px",
        width: "100%",
        height: "100%",
        borderRadius: "0px",
        duration: dur * 0.6,
        ease: selectedEase,
      },
      0
    );

    // 3. MIDPOINT LOCK: Synchronize background image & state while mask covers viewport
    tl.add(() => {
      setDisplayedIdx(nextIdx);
      setCurrentIdx(nextIdx);
      if (bgImgRef.current) {
        bgImgRef.current.src = nextItem.image;
      }
    }, dur * 0.55);

    // 4. Restore background view scale & dissolve morph overlay
    if (bgView) {
      tl.to(
        bgView,
        {
          scale: 1,
          filter: "blur(0px)",
          opacity: 1,
          duration: dur * 0.4,
          ease: selectedEase,
        },
        dur * 0.55
      );
    }

    tl.to(
      mask,
      {
        opacity: 0,
        duration: dur * 0.35,
        ease: selectedEase,
      },
      dur * 0.6
    );
  });

  const triggerTransition = useCallback(
    (targetIdx: number, rect?: DOMRect) => {
      if (isAnimating) return;
      executeOriginExpand(targetIdx, rect);
    },
    [isAnimating, executeOriginExpand]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        const nextIdx = (currentIdx + 1) % activeItems.length;
        triggerTransition(nextIdx);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        const prevIdx = (currentIdx - 1 + activeItems.length) % activeItems.length;
        triggerTransition(prevIdx);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIdx, activeItems.length, triggerTransition]);

  // AutoPlay
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      const nextIdx = (currentIdx + 1) % activeItems.length;
      triggerTransition(nextIdx);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, currentIdx, activeItems.length, triggerTransition]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[100dvh] min-h-[600px] bg-[#050507] text-white overflow-hidden select-none font-sans [perspective:1000px] ${className}`}
      style={style}
    >
      {/* Background View Container (Depth Z-Recession Target) */}
      <div ref={bgViewRef} className="absolute inset-0 z-0 overflow-hidden transform-gpu">
        <img
          ref={bgImgRef}
          src={imageSrc || currentItem.image}
          alt={currentItem.headline}
          className="w-full h-full object-cover object-center transform-gpu"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
      </div>

      {/* Bottom Center Interactive Origin Target Cards (zIndex 50 - Always Floating Above Morph) */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: "24px",
          padding: "12px 20px",
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        }}
      >
        {activeItems.map((item, idx) => (
          <div
            key={item.id}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              triggerTransition(idx, rect);
            }}
            style={{
              width: "84px",
              height: "52px",
              borderRadius: "12px",
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.19, 1, 0.22, 1)",
              opacity: displayedIdx === idx ? 1 : 0.55,
              transform: displayedIdx === idx ? `scale(${cardScaleActive})` : "scale(1)",
              border: displayedIdx === idx ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.2)",
              boxShadow: displayedIdx === idx ? "0 8px 24px rgba(255,255,255,0.25)" : "none",
            }}
          >
            <img src={item.image} alt={item.headline} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>

      {/* Shared Morph Canvas Layer (zIndex 40) */}
      <div
        ref={maskRef}
        className="absolute z-40 pointer-events-none hidden overflow-hidden shadow-2xl"
      >
        <img
          ref={maskImgRef}
          src={currentItem.image}
          alt="Morph element"
          className="w-full h-full object-cover transform-gpu"
        />
      </div>
    </div>
  );
};

export default ApparatusOriginExpand;
