import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ApparatusVenetianBlindsProps } from "./types";

gsap.registerPlugin(CustomEase);

// Register Vessel Curve
try {
  CustomEase.create("vessel", "M0,0 C0.16,1 0.3,1 1,1");
} catch (e) {
  // Already registered or fallback
}

// Safe wrapping modulo function
const getWrappedIndex = (val: number, len: number) => {
  return ((val % len) + len) % len;
};

export const ApparatusVenetianBlinds: React.FC<ApparatusVenetianBlindsProps> = ({
  imageSrc,
  images = [],
  slatCount = 10,
  duration = 0.8,
  staggerDelay = 0.04,
  direction = "center-out",
  className = "",
  style,
  onLifecycleChange,
  scrollProgress = 0,
  onScrollProgressChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const togglePanelRef = useRef<HTMLDivElement>(null);
  const backlightRef = useRef<HTMLDivElement>(null);
  const slatsRef = useRef<(HTMLDivElement | null)[]>([]);
  const glaresRef = useRef<(HTMLDivElement | null)[]>([]);
  const frontImagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const backImagesRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Interactive controls state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [parallaxEnabled, setParallaxEnabled] = useState(true);
  const [edgeHighlightEnabled, setEdgeHighlightEnabled] = useState(true);
  const [backlightEnabled, setBacklightEnabled] = useState(true);
  const [activeSlatCount, setActiveSlatCount] = useState(slatCount);
  const [activeDuration, setActiveDuration] = useState(duration);
  const [activeDirection, setActiveDirection] = useState(direction);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });

  // Inertial smooth scroll progress tracking
  const smoothProgressRef = useRef({ val: scrollProgress });
  const [activeProgressState, setActiveProgressState] = useState(scrollProgress);

  // Sync props to state if they change externally
  useEffect(() => {
    setActiveSlatCount(slatCount);
  }, [slatCount]);

  useEffect(() => {
    setActiveDuration(duration);
  }, [duration]);

  useEffect(() => {
    setActiveDirection(direction);
  }, [direction]);

  // Trim refs arrays when activeSlatCount changes to prevent memory leaks/stale elements
  useEffect(() => {
    slatsRef.current = slatsRef.current.slice(0, activeSlatCount);
    glaresRef.current = glaresRef.current.slice(0, activeSlatCount);
    frontImagesRef.current = frontImagesRef.current.slice(0, activeSlatCount);
    backImagesRef.current = backImagesRef.current.slice(0, activeSlatCount);
  }, [activeSlatCount]);

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

  // Combine imageSrc and images array, fallback to curated list if short
  const allImages = React.useMemo(() => {
    let list = [...images];
    if (imageSrc && !list.includes(imageSrc)) {
      list.push(imageSrc);
    }
    
    // Curated fallback images from Transitions folder
    if (list.length <= 1) {
      const fallbackList = [
        "/images/components images/Transitions/cosmos_1915511961.jpeg",
        "/images/components images/Transitions/cosmos_1415036495.jpeg",
        "/images/components images/Transitions/download (1).jpg",
        "/images/components images/Transitions/download.jpg",
        "/images/components images/Transitions/◍.jpg",
      ];
      
      if (list.length === 1) {
        list = [list[0], ...fallbackList.filter(img => img !== list[0])];
      } else {
        list = fallbackList;
      }
    }
    
    return list;
  }, [images, imageSrc]);

  // Calculate image indices based on active progress state
  const currentFlip = Math.floor(activeProgressState);
  const isEvenFlip = currentFlip % 2 === 0;

  const currentIndex = isEvenFlip
    ? getWrappedIndex(currentFlip, allImages.length)
    : getWrappedIndex(currentFlip + 1, allImages.length);

  const nextIndex = isEvenFlip
    ? getWrappedIndex(currentFlip + 1, allImages.length)
    : getWrappedIndex(currentFlip, allImages.length);

  // Handle lifecycle changes
  const triggerLifecycle = React.useCallback((state: "idle" | "discovery" | "buildUp" | "peak" | "recovery") => {
    onLifecycleChange?.(state);
  }, [onLifecycleChange]);

  // Initial discovery to idle on mount
  useEffect(() => {
    triggerLifecycle("discovery");
    const timer = setTimeout(() => {
      triggerLifecycle("idle");
    }, 800);
    return () => clearTimeout(timer);
  }, [triggerLifecycle]);

  // Calculate stagger delays based on direction
  const getDelay = (idx: number) => {
    const center = (activeSlatCount - 1) / 2;
    const maxDist = center;
    const dist = Math.abs(idx - center);

    switch (activeDirection) {
      case "top-to-bottom":
        return idx * staggerDelay;
      case "bottom-to-top":
        return (activeSlatCount - 1 - idx) * staggerDelay;
      case "center-out":
        return dist * staggerDelay;
      case "edges-in":
        return (maxDist - dist) * staggerDelay;
      default:
        return dist * staggerDelay;
    }
  };

  const { contextSafe } = useGSAP({ scope: containerRef });

  // Core blinds layout and translation logic
  const updateBlinds = React.useCallback((prog: number) => {
    const flip = Math.floor(prog);
    const localProg = prog - flip;
    const even = flip % 2 === 0;

    const maxStagger = (activeSlatCount - 1) * staggerDelay;
    const totalTime = maxStagger + activeDuration;

    slatsRef.current.forEach((slat, idx) => {
      if (!slat) return;

      const delay = getDelay(idx);
      const start = delay / totalTime;
      const end = (delay + activeDuration) / totalTime;
      
      const t = Math.max(0, Math.min(1, (localProg - start) / (end - start)));
      const easeT = t * t * (3 - 2 * t);
      
      const rotX = (flip + easeT) * 180;

      gsap.to(slat, {
        rotateX: rotX,
        rotateY: 0,
        z: Math.sin(t * Math.PI) * 12,
        "--slat-edge-opacity": Math.sin(t * Math.PI),
        duration: 0.05,
        ease: "none",
        overwrite: "auto",
      });

      const frontImg = frontImagesRef.current[idx];
      if (frontImg) {
        const targetY = even ? -easeT * 15 : (1 - easeT) * 15;
        gsap.to(frontImg, {
          yPercent: parallaxEnabled ? targetY : 0,
          duration: 0.05,
          ease: "none",
          overwrite: "auto",
        });
      }

      const backImg = backImagesRef.current[idx];
      if (backImg) {
        const targetY = even ? (1 - easeT) * 15 : -easeT * 15;
        gsap.to(backImg, {
          yPercent: parallaxEnabled ? targetY : 0,
          duration: 0.05,
          ease: "none",
          overwrite: "auto",
        });
      }

      const glare = glaresRef.current[idx];
      if (glare) {
        gsap.to(glare, {
          top: (easeT * 200 - 100) + "%",
          opacity: Math.sin(t * Math.PI) * 0.7,
          duration: 0.05,
          ease: "none",
          overwrite: "auto",
        });
      }
    });

    if (backlightRef.current) {
      gsap.to(backlightRef.current, {
        opacity: backlightEnabled ? Math.sin(localProg * Math.PI) * 0.8 : 0,
        duration: 0.05,
        ease: "none",
        overwrite: "auto",
      });
    }

    if (localProg > 0.02 && localProg < 0.98) {
      if (localProg > 0.4 && localProg < 0.6) {
        triggerLifecycle("peak");
      } else {
        triggerLifecycle("buildUp");
      }
    } else if (localProg >= 0.98) {
      triggerLifecycle("recovery");
    } else {
      triggerLifecycle("idle");
    }
  }, [activeSlatCount, activeDuration, staggerDelay, activeDirection, parallaxEnabled, backlightEnabled, triggerLifecycle]);

  // Scroll progress scrubbing with smooth inertial lag
  useGSAP(() => {
    if (scrollProgress === undefined) return;

    gsap.to(smoothProgressRef.current, {
      val: scrollProgress,
      duration: 0.45, // smooth easing lag (inertia)
      ease: "power2.out",
      overwrite: "auto",
      onUpdate: () => {
        const val = smoothProgressRef.current.val;
        updateBlinds(val);
        setActiveProgressState(val);
      }
    });
  }, [scrollProgress, updateBlinds]);

  // Hover and proximity tilt tracking
  const handleMouseMove = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    const isFlat = scrollProgress % 1 === 0;
    if (isTransitioning || !isFlat) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mousePos.current = { x, y };

    // Micro-tilt the container
    gsap.to(containerRef.current, {
      rotateY: x * 8,
      rotateX: -y * 8,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });

    // Tilt individual slats slightly towards the cursor (Discovery effect)
    slatsRef.current.forEach((slat, idx) => {
      if (!slat) return;
      
      const slatCenterY = (idx + 0.5) / activeSlatCount - 0.5;
      const distY = Math.abs(y - slatCenterY);
      const intensity = Math.max(0, 1 - distY * 2);

      gsap.to(slat, {
        rotateX: currentFlip * 180 - y * 15 * intensity,
        z: intensity * 8,
        duration: 0.4,
        ease: "power1.out",
        overwrite: "auto",
      });
    });
  });

  const handleMouseEnter = () => {
    const isFlat = scrollProgress % 1 === 0;
    if (isTransitioning || !isFlat) return;
    triggerLifecycle("discovery");
  };

  const handleMouseLeave = contextSafe(() => {
    const isFlat = scrollProgress % 1 === 0;
    if (isTransitioning || !isFlat) return;
    triggerLifecycle("idle");

    // Reset container and slats to flat orientation
    gsap.to(containerRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.8,
      ease: "power2.out",
      overwrite: "auto",
    });

    slatsRef.current.forEach((slat) => {
      if (!slat) return;
      gsap.to(slat, {
        rotateX: currentFlip * 180,
        rotateY: 0,
        z: 0,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  });

  // Click transition handler - unifies click with parent scrollProgress state
  const handleClick = contextSafe(() => {
    if (isTransitioning) return;

    const currentVal = scrollProgress;
    const targetVal = Math.floor(currentVal) + 1;

    setIsTransitioning(true);
    triggerLifecycle("buildUp");

    const tl = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
        triggerLifecycle("recovery");
        setTimeout(() => {
          triggerLifecycle("idle");
        }, 300);
      }
    });

    // Animate parent's scrollProgress state continuously
    tl.to({}, {
      duration: activeDuration,
      ease: "vessel",
      onUpdate: function () {
        const ratio = this.progress(); // 0 to 1
        const val = currentVal + ratio * (targetVal - currentVal);
        onScrollProgressChange?.(val);
      }
    });
  });

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none cursor-pointer ${className}`}
      style={{
        perspective: "1200px",
        transformStyle: "preserve-3d",
        backgroundColor: "#0d0d0d",
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Backlight ambient glow layer */}
      <div 
        ref={backlightRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(212, 163, 89, 0.25) 0%, rgba(212, 163, 89, 0.05) 50%, transparent 80%)",
          opacity: 0,
          zIndex: 0,
        }}
      />

      {/* Controls Dropdown Menu (Top-right corner, glassmorphic panel) */}
      <div 
        ref={togglePanelRef}
        className="absolute z-20 pointer-events-auto"
        style={{
          top: "16px",
          right: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
        }}
        onClick={(e) => e.stopPropagation()} // Prevents clicks on controls from triggering flips
      >
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
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

            {/* Toggle: Inner Parallax */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                Parallax
              </span>
              <button 
                onClick={() => setParallaxEnabled(!parallaxEnabled)}
                style={{ 
                  position: "relative",
                  width: "28px",
                  height: "16px",
                  borderRadius: "9999px",
                  backgroundColor: parallaxEnabled ? "rgba(52, 211, 153, 0.2)" : "rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  padding: "2px",
                  cursor: "pointer",
                  border: "none",
                  transition: "background-color 0.3s",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              >
                <div 
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    transition: "transform 0.3s, background-color 0.3s",
                    transform: parallaxEnabled ? "translateX(12px)" : "translateX(0px)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    ...(parallaxEnabled && { backgroundColor: "#34d399" })
                  }}
                />
              </button>
            </div>

            {/* Toggle: Edge Light */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                Edge Light
              </span>
              <button 
                onClick={() => setEdgeHighlightEnabled(!edgeHighlightEnabled)}
                style={{ 
                  position: "relative",
                  width: "28px",
                  height: "16px",
                  borderRadius: "9999px",
                  backgroundColor: edgeHighlightEnabled ? "rgba(52, 211, 153, 0.2)" : "rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  padding: "2px",
                  cursor: "pointer",
                  border: "none",
                  transition: "background-color 0.3s",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              >
                <div 
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    transition: "transform 0.3s, background-color 0.3s",
                    transform: edgeHighlightEnabled ? "translateX(12px)" : "translateX(0px)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    ...(edgeHighlightEnabled && { backgroundColor: "#34d399" })
                  }}
                />
              </button>
            </div>

            {/* Toggle: Backlight Glow */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                Backlight
              </span>
              <button 
                onClick={() => setBacklightEnabled(!backlightEnabled)}
                style={{ 
                  position: "relative",
                  width: "28px",
                  height: "16px",
                  borderRadius: "9999px",
                  backgroundColor: backlightEnabled ? "rgba(52, 211, 153, 0.2)" : "rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  padding: "2px",
                  cursor: "pointer",
                  border: "none",
                  transition: "background-color 0.3s",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              >
                <div 
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    transition: "transform 0.3s, background-color 0.3s",
                    transform: backlightEnabled ? "translateX(12px)" : "translateX(0px)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    ...(backlightEnabled && { backgroundColor: "#34d399" })
                  }}
                />
              </button>
            </div>

            {/* Slider: Slat Count */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="text-[9px] font-mono tracking-wider text-white/50 uppercase select-none">
                  Slat Count
                </span>
                <span className="text-[9px] font-mono text-[#34d399] font-bold">
                  {activeSlatCount}
                </span>
              </div>
              <input 
                type="range"
                min="4"
                max="20"
                step="1"
                value={activeSlatCount}
                onChange={(e) => setActiveSlatCount(parseInt(e.target.value))}
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
                <span className="text-[9px] font-mono tracking-wider text-white/50 uppercase select-none">
                  Speed
                </span>
                <span className="text-[9px] font-mono text-[#34d399] font-bold">
                  {activeDuration.toFixed(1)}s
                </span>
              </div>
              <input 
                type="range"
                min="0.3"
                max="2.0"
                step="0.1"
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

            {/* Toggle: Cascade Direction */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                Direction
              </span>
              <button
                onClick={() => {
                  const directions: ("top-to-bottom" | "bottom-to-top" | "center-out" | "edges-in")[] = [
                    "center-out",
                    "edges-in",
                    "top-to-bottom",
                    "bottom-to-top"
                  ];
                  const nextIdx = (directions.indexOf(activeDirection) + 1) % directions.length;
                  setActiveDirection(directions[nextIdx]);
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
                {activeDirection.replace(/-/g, " ")}
              </button>
            </div>
          </div>
        )}
      </div>

      {Array.from({ length: activeSlatCount }).map((_, idx) => {
        const topPercent = (idx * 100) / activeSlatCount;
        const heightPercent = 100 / activeSlatCount;
        const offsetPercent = -idx * 100;

        return (
          <div
            key={idx}
            className="absolute left-0 w-full"
            style={{
              top: `${topPercent}%`,
              height: `calc(${heightPercent}% + 1px)`,
              perspective: "800px",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Slat Card 3D Hinge */}
            <div
              ref={(el) => {
                slatsRef.current[idx] = el;
              }}
              className="relative w-full h-full"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateX(${activeProgressState * 180}deg)`,
              }}
            >
              {/* Front Face */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  borderTop: edgeHighlightEnabled ? "1px solid rgba(255, 255, 255, calc(0.12 * var(--slat-edge-opacity, 0)))" : "none",
                  borderBottom: edgeHighlightEnabled ? "1px solid rgba(0, 0, 0, calc(0.45 * var(--slat-edge-opacity, 0)))" : "none",
                  boxSizing: "border-box",
                }}
              >
                <div
                  ref={(el) => {
                    frontImagesRef.current[idx] = el;
                  }}
                  className="absolute left-0 w-full"
                  style={{
                    top: `${offsetPercent}%`,
                    height: `${activeSlatCount * 100}%`,
                  }}
                >
                  <img
                    src={allImages[currentIndex]}
                    alt={`Slat Front ${idx}`}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>
              </div>

              {/* Back Face */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  transform: "rotateX(180deg)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  borderTop: edgeHighlightEnabled ? "1px solid rgba(255, 255, 255, calc(0.12 * var(--slat-edge-opacity, 0)))" : "none",
                  borderBottom: edgeHighlightEnabled ? "1px solid rgba(0, 0, 0, calc(0.45 * var(--slat-edge-opacity, 0)))" : "none",
                  boxSizing: "border-box",
                }}
              >
                {/* scaleY(-1) compensates for card upside-down flip */}
                <div
                  ref={(el) => {
                    backImagesRef.current[idx] = el;
                  }}
                  className="absolute left-0 w-full"
                  style={{
                    top: `${offsetPercent}%`,
                    height: `${activeSlatCount * 100}%`,
                    transform: "scaleY(-1)",
                  }}
                >
                  <img
                    src={allImages[nextIndex]}
                    alt={`Slat Back ${idx}`}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>
              </div>

              {/* Glare/Reflection Sweep Layer */}
              <div
                className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  ref={(el) => {
                    glaresRef.current[idx] = el;
                  }}
                  className="absolute left-0 w-full h-full opacity-0"
                  style={{
                    top: "-100%",
                    background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApparatusVenetianBlinds;
