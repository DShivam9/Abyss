import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ApparatusAccordionWallProps } from "./types";

export const ApparatusAccordionWall: React.FC<ApparatusAccordionWallProps & {
  panelCount?: number;
  speed?: number;
  triggerMode?: "hover" | "click";
}> = ({
  images = [],
  titles: _titles = [],
  interactiveMode = "hover",
  activePanelIndex,
  onActivePanelChange,
  panelCount = 5,
  speed = 0.65,
  triggerMode,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const togglePanelRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Local active panel index if uncontrolled
  const [localActiveIdx, setLocalActiveIdx] = useState<number | null>(null);
  const activeIdx = activePanelIndex !== undefined ? activePanelIndex : localActiveIdx;

  // Interactive controls states derived from props
  const activePanelCount = panelCount;
  const activeDuration = speed;
  const activeInteractiveMode = triggerMode || interactiveMode;

  // Curated fallbacks for images
  const allImages = React.useMemo(() => {
    if (images.length > 0) return images;
    return [
      "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015%2C%202026%2C%2005_26_02%20PM.png",
      "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015%2C%202026%2C%2005_29_20%20PM.png",
      "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015%2C%202026%2C%2005_37_33%20PM.png",
      "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015%2C%202026%2C%2005_44_29%20PM.png",
      "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015%2C%202026%2C%2005_45_55%20PM.png",
    ];
  }, [images]);

  // Slice list dynamically based on panel count
  const visibleImages = React.useMemo(() => {
    const list: string[] = [];
    for (let i = 0; i < activePanelCount; i++) {
      list.push(allImages[i % allImages.length]);
    }
    return list;
  }, [allImages, activePanelCount]);

  // Trim refs array when activePanelCount changes
  useEffect(() => {
    panelsRef.current = panelsRef.current.slice(0, activePanelCount);
  }, [activePanelCount]);

  // Lifecycle updates
  const triggerLifecycle = React.useCallback((state: "idle" | "discovery" | "buildUp" | "peak" | "recovery") => {
    onLifecycleChange?.(state);
  }, [onLifecycleChange]);

  useEffect(() => {
    triggerLifecycle("discovery");
    const timer = setTimeout(() => {
      triggerLifecycle("idle");
    }, 800);
    return () => clearTimeout(timer);
  }, [triggerLifecycle]);

  const updateActivePanel = (idx: number | null) => {
    if (activePanelIndex === undefined) {
      setLocalActiveIdx(idx);
    }
    if (idx !== null) {
      onActivePanelChange?.(idx);
    }
  };

  const handlePanelInteraction = (idx: number) => {
    if (activeInteractiveMode === "click") {
      if (activeIdx === idx) {
        updateActivePanel(null);
      } else {
        updateActivePanel(idx);
      }
    }
  };

  const handlePanelMouseEnter = (idx: number) => {
    if (activeInteractiveMode === "hover") {
      updateActivePanel(idx);
    }
  };

  const handleMouseLeaveContainer = () => {
    if (activeInteractiveMode === "hover") {
      updateActivePanel(null);
    }
  };

  // GSAP animation orchestration
  useGSAP(() => {
    const isAnyActive = activeIdx !== null;

    if (isAnyActive) {
      triggerLifecycle("buildUp");
      setTimeout(() => {
        triggerLifecycle("peak");
      }, 300);
    } else {
      triggerLifecycle("recovery");
      setTimeout(() => {
        triggerLifecycle("idle");
      }, 500);
    }

    visibleImages.forEach((_, idx) => {
      const panel = panelsRef.current[idx];
      if (!panel) return;

      const isActive = activeIdx === idx;
      
      // Flex Sizing transition
      let targetFlex = 1;
      if (isAnyActive) {
        targetFlex = isActive ? 5 : 0.65;
      }

      gsap.to(panel, {
        flexGrow: targetFlex,
        duration: activeDuration,
        ease: "power3.out",
        overwrite: "auto",
      });
    });
  }, [activeIdx, visibleImages, activeDuration, triggerLifecycle]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none flex flex-row gap-0 bg-[#070708] ${className}`}
      style={{
        ...style,
      }}
      onMouseLeave={handleMouseLeaveContainer}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #34d399;
          cursor: pointer;
          transition: transform 0.1s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border: none;
          border-radius: 50%;
          background: #34d399;
          cursor: pointer;
          transition: transform 0.1s;
        }
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.3);
        }
      `}</style>



      {visibleImages.map((img, idx) => {
        const isActive = activeIdx === idx;

        return (
          <div
            key={idx}
            ref={(el) => {
              panelsRef.current[idx] = el;
            }}
            className="relative h-full overflow-hidden cursor-pointer flex-shrink-0"
            style={{
              flexGrow: 1,
              flexBasis: "0%",
              borderRight: idx < visibleImages.length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none",
              borderLeft: idx > 0 ? "1px solid rgba(0, 0, 0, 0.5)" : "none",
            }}
            onClick={() => handlePanelInteraction(idx)}
            onMouseEnter={() => handlePanelMouseEnter(idx)}
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src={img}
                alt={`Panel ${idx}`}
                className="w-full h-full object-cover transition-transform duration-700"
                style={{
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}
                draggable={false}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApparatusAccordionWall;
