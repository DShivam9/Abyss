import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ApparatusAccordionWallProps } from "./types";

export const ApparatusAccordionWall: React.FC<ApparatusAccordionWallProps> = ({
  images = [],
  titles: _titles = [],
  interactiveMode = "hover",
  activePanelIndex,
  onActivePanelChange,
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

  // Interactive controls states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activePanelCount, setActivePanelCount] = useState(5);
  const [activeDuration, setActiveDuration] = useState(0.65);
  const [activeInteractiveMode, setActiveInteractiveMode] = useState(interactiveMode);
  
  // Hover guard state to prevent accordion movements when hovering controls
  const [hoveringControls, setHoveringControls] = useState(false);

  // Sync props to states
  useEffect(() => {
    setActiveInteractiveMode(interactiveMode);
  }, [interactiveMode]);

  // Curated fallbacks for images
  const allImages = React.useMemo(() => {
    if (images.length > 0) return images;
    return [
      "/images/components images/Transitions/cosmos_1915511961.jpeg",
      "/images/components images/Transitions/cosmos_1415036495.jpeg",
      "/images/components images/Transitions/download (1).jpg",
      "/images/components images/Transitions/download.jpg",
      "/images/components images/Transitions/◍.jpg",
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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        togglePanelRef.current &&
        !togglePanelRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (hoveringControls) return;
    if (activeInteractiveMode === "click") {
      if (activeIdx === idx) {
        updateActivePanel(null);
      } else {
        updateActivePanel(idx);
      }
    }
  };

  const handlePanelMouseEnter = (idx: number) => {
    if (hoveringControls) return;
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

      {/* Controls Dropdown Menu (Top-right corner, glassmorphic panel) */}
      <div 
        ref={togglePanelRef}
        className="absolute z-30 pointer-events-auto"
        style={{
          top: "16px",
          right: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onMouseEnter={() => {
          setHoveringControls(true);
          updateActivePanel(null);
        }}
        onMouseLeave={() => setHoveringControls(false)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDropdownOpen(!dropdownOpen);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(13, 13, 15, 0.8)",
            color: "#ffffff",
            padding: "6px 14px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "9999px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            fontSize: "10px",
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            cursor: "pointer",
            transition: "border-color 0.3s, background-color 0.3s",
            outline: "none"
          }}
        >
          <span>Controls</span>
          <svg 
            width="8" 
            height="8" 
            viewBox="0 0 8 8" 
            fill="none" 
            style={{ 
              transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", 
              transition: "transform 0.3s",
              stroke: "rgba(255, 255, 255, 0.6)",
              strokeWidth: "1.5"
            }}
          >
            <path d="M1 2.5L4 5.5L7 2.5" />
          </svg>
        </button>

        {dropdownOpen && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              backgroundColor: "rgba(13, 13, 15, 0.9)",
              padding: "16px 14px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              backdropFilter: "blur(16px)",
              boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.6)",
              minWidth: "200px",
              animation: "fadeIn 0.2s ease-out"
            }}
          >
            {/* Slider: Panel Count */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255, 255, 255, 0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Panels
                </span>
                <span style={{ fontSize: "9px", fontFamily: "monospace", color: "#34d399", fontWeight: "bold" }}>
                  {activePanelCount}
                </span>
              </div>
              <input 
                type="range"
                min="3"
                max="8"
                step="1"
                value={activePanelCount}
                onChange={(e) => setActivePanelCount(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  outline: "none",
                  WebkitAppearance: "none",
                  cursor: "pointer",
                }}
              />
            </div>

            {/* Slider: Speed/Duration */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255, 255, 255, 0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Speed
                </span>
                <span style={{ fontSize: "9px", fontFamily: "monospace", color: "#34d399", fontWeight: "bold" }}>
                  {activeDuration.toFixed(2)}s
                </span>
              </div>
              <input 
                type="range"
                min="0.3"
                max="1.5"
                step="0.05"
                value={activeDuration}
                onChange={(e) => setActiveDuration(parseFloat(e.target.value))}
                style={{
                  width: "100%",
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  outline: "none",
                  WebkitAppearance: "none",
                  cursor: "pointer",
                }}
              />
            </div>

            {/* Trigger Toggle: Hover vs Click */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255, 255, 255, 0.65)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Trigger
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const mode = activeInteractiveMode === "hover" ? "click" : "hover";
                  setActiveInteractiveMode(mode);
                  updateActivePanel(null);
                }}
                style={{
                  fontSize: "8px",
                  fontFamily: "monospace",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  outline: "none",
                  textTransform: "uppercase"
                }}
              >
                {activeInteractiveMode}
              </button>
            </div>
          </div>
        )}
      </div>

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
