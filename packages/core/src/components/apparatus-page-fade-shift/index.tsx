import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ApparatusPageFadeShiftProps } from "./types";

interface TransitionImageItem {
  id: string;
  label: string;
  tag: string;
  image: string;
}

const DEFAULT_IMAGES: TransitionImageItem[] = [
  {
    id: "img-01",
    label: "1",
    tag: "IMAGE 01 // ASYMMETRIC FADE SHIFT",
    image: "/images/components images/Transitions/ChatGPT Image Jul 15, 2026, 05_26_02 PM.png",
  },
  {
    id: "img-02",
    label: "2",
    tag: "IMAGE 02 // SPATIAL DISPLACEMENT",
    image: "/images/components images/Transitions/ChatGPT Image Jul 15, 2026, 05_29_20 PM.png",
  },
  {
    id: "img-03",
    label: "3",
    tag: "IMAGE 03 // VECTOR DECAY",
    image: "/images/components images/Transitions/ChatGPT Image Jul 15, 2026, 05_37_33 PM.png",
  },
];

export const ApparatusPageFadeShift: React.FC<ApparatusPageFadeShiftProps & {
  scaleShift?: number;
}> = ({
  pages = DEFAULT_IMAGES as any,
  className = "",
  style,
  leaveDuration = 350,
  enterDuration = 400,
  shiftY = 30,
  scaleShift = 0.04,
  easing = "power2.inOut",
  autoPlay = false,
  autoPlayInterval = 5000,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  // HUD Controls Parameters
  const leaveDur = leaveDuration;
  const enterDur = enterDuration;
  const offsetY = shiftY;
  const overlayOpacity = 0.6;
  const playInterval = autoPlayInterval;
  const easeCurve = easing;
  const isAutoPlay = autoPlay;

  const activeItems = (pages.length > 0 ? pages : DEFAULT_IMAGES) as TransitionImageItem[];
  const currentItem = activeItems[currentIdx % activeItems.length];

  // Transition Trigger
  const triggerTransition = useCallback(
    (targetIdx?: number) => {
      const nextIdx =
        targetIdx !== undefined ? targetIdx : (currentIdx + 1) % activeItems.length;
      setCurrentIdx(nextIdx);
    },
    [currentIdx, activeItems.length]
  );

  // Keyboard Navigation (Arrow Keys / Space / A-D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " " || e.key === "d" || e.key === "D") {
        triggerTransition();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "a" || e.key === "A") {
        setCurrentIdx((prev) => (prev - 1 + activeItems.length) % activeItems.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerTransition, activeItems.length]);

  // Auto Play Loop
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      triggerTransition();
    }, playInterval);
    return () => clearInterval(timer);
  }, [isAutoPlay, playInterval, triggerTransition]);

  // Easing curve tuple helper
  const getEasingTuple = (curveStr: string): number[] => {
    if (curveStr === "power3.out") return [0.215, 0.61, 0.355, 1];
    if (curveStr === "expo.out") return [0.16, 1, 0.3, 1];
    if (curveStr === "cubic-bezier(0.32,0.72,0,1)") return [0.32, 0.72, 0, 1];
    if (curveStr === "cubic-bezier(0.68,-0.6,0.32,1.6)") return [0.68, -0.6, 0.32, 1.6];
    return [0.4, 0, 0.2, 1]; // power2.inOut default
  };

  return (
    <div
      className={`relative w-full h-full min-h-[450px] bg-black overflow-hidden select-none ${className}`}
      style={style}
    >
      {/* ─── FULL BLEED IMAGE TRANSITION LAYER ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id || currentIdx}
          initial={{ y: offsetY, scale: 1 + scaleShift, opacity: 0 }}
          animate={{
            y: 0,
            scale: 1,
            opacity: 1,
            transition: {
              duration: enterDur / 1000,
              ease: getEasingTuple(easeCurve),
            },
          }}
          exit={{
            y: -offsetY,
            scale: 1 - scaleShift,
            opacity: 0,
            transition: {
              duration: leaveDur / 1000,
              ease: getEasingTuple(easeCurve),
            },
          }}
          className="absolute inset-0 w-full h-full cursor-pointer"
          onClick={() => triggerTransition()}
        >
          <img
            src={currentItem.image || (currentItem as any).heroImage}
            alt={currentItem.label || "Transition Frame"}
            className="w-full h-full object-cover select-none pointer-events-none"
          />
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at center, transparent 30%, rgba(0,0,0,${overlayOpacity}) 100%), linear-gradient(to top, rgba(0,0,0,${overlayOpacity * 0.8}), transparent 40%)`,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ─── TOP OVERLAY CONTROLS ─── */}
      {/* Top Center: Numbers (Sliding Underline, Keyboard Shortcuts Active) */}
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
          const isActive = currentIdx === itemIdx;
          return (
            <button
              key={item.id || itemIdx}
              onClick={() => triggerTransition(itemIdx)}
              className={`relative text-sm font-mono font-bold transition-colors cursor-pointer px-2 py-1 ${
                isActive ? "text-white" : "text-neutral-500 hover:text-neutral-200"
              }`}
            >
              <span>{itemIdx + 1}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default ApparatusPageFadeShift;
