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

export const ApparatusVenetianBlinds: React.FC<ApparatusVenetianBlindsProps & {
  slatCount?: number;
  duration?: number;
  staggerDelay?: number;
  parallaxEnabled?: boolean;
  edgeHighlightEnabled?: boolean;
  backlightEnabled?: boolean;
  direction?: "center-out" | "top-to-bottom" | "bottom-to-top" | "edges-in";
}> = ({
  imageSrc,
  images = [],
  slatCount: propSlatCount = 12,
  duration: propDuration = 0.8,
  staggerDelay: propStaggerDelay = 0.04,
  parallaxEnabled: propParallaxEnabled = true,
  edgeHighlightEnabled: propEdgeHighlightEnabled = true,
  backlightEnabled: propBacklightEnabled = true,
  direction: propDirection = "center-out",
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
  
  // Interactive controls values from props
  const parallaxEnabled = propParallaxEnabled;
  const edgeHighlightEnabled = propEdgeHighlightEnabled;
  const backlightEnabled = propBacklightEnabled;
  const activeSlatCount = propSlatCount;
  const activeDuration = propDuration;
  const activeDirection = propDirection;
  const staggerDelay = propStaggerDelay;

  const [isTransitioning, setIsTransitioning] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });

  // Inertial smooth scroll progress tracking
  const smoothProgressRef = useRef({ val: scrollProgress });
  const [activeProgressState, setActiveProgressState] = useState(scrollProgress);

  // Trim refs arrays when activeSlatCount changes to prevent memory leaks/stale elements
  useEffect(() => {
    slatsRef.current = slatsRef.current.slice(0, activeSlatCount);
    glaresRef.current = glaresRef.current.slice(0, activeSlatCount);
    frontImagesRef.current = frontImagesRef.current.slice(0, activeSlatCount);
    backImagesRef.current = backImagesRef.current.slice(0, activeSlatCount);
  }, [activeSlatCount]);

  // Combine imageSrc and images array, fallback to curated list if short
  const allImages = React.useMemo(() => {
    let list = [...images];
    if (imageSrc && !list.includes(imageSrc)) {
      list.push(imageSrc);
    }
    
    // Curated fallback images from Transitions folder
    if (list.length <= 1) {
      const fallbackList = [
        "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015%2C%202026%2C%2005_26_02%20PM.png",
        "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015%2C%202026%2C%2005_29_20%20PM.png",
        "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015%2C%202026%2C%2005_37_33%20PM.png",
        "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015%2C%202026%2C%2005_44_29%20PM.png",
        "/images/components%20images/Transitions/ChatGPT%20Image%20Jul%2015%2C%202026%2C%2005_45_55%20PM.png",
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

  // Sync updateBlinds whenever activeProgressState changes
  useEffect(() => {
    updateBlinds(activeProgressState);
  }, [activeProgressState, updateBlinds]);

  // Add wheel listener for self-contained scroll/wheel interaction
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let wheelTimeout: any = null;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.0015;
      setActiveProgressState((prev) => {
        const next = Math.max(0, prev + delta);
        onScrollProgressChange?.(next);
        return next;
      });
      triggerLifecycle("buildUp");

      if (wheelTimeout) clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        triggerLifecycle("idle");
      }, 150);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, [onScrollProgressChange, triggerLifecycle]);

  // Scroll progress scrubbing with smooth inertial lag
  useGSAP(() => {
    if (scrollProgress === undefined || scrollProgress === 0) return;

    gsap.to(smoothProgressRef.current, {
      val: scrollProgress,
      duration: 0.45, // smooth easing lag (inertia)
      ease: "power2.out",
      overwrite: "auto",
      onUpdate: () => {
        const val = smoothProgressRef.current.val;
        setActiveProgressState(val);
        updateBlinds(val);
      }
    });
  }, [scrollProgress]);

  const handleMouseMove = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    const isFlat = activeProgressState % 1 === 0;
    if (isTransitioning || !isFlat) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;

    mousePos.current = { x: normX, y: normY };

    if (parallaxEnabled) {
      gsap.to(container, {
        rotateY: normX * 8,
        rotateX: -normY * 8,
        duration: 0.4,
        ease: "power1.out",
        overwrite: "auto",
      });
    }

    slatsRef.current.forEach((slat, idx) => {
      if (!slat) return;
      const center = (activeSlatCount - 1) / 2;
      const dist = Math.abs(idx - center);
      const slatFactor = 1 - dist / center;

      gsap.to(slat, {
        rotateX: currentFlip * 180 + normY * 5 * slatFactor,
        rotateY: normX * 3 * slatFactor,
        z: (1 - Math.abs(normX)) * 8,
        duration: 0.3,
        ease: "power1.out",
        overwrite: "auto",
      });
    });
  });

  const handleMouseEnter = contextSafe(() => {
    const isFlat = activeProgressState % 1 === 0;
    if (isTransitioning || !isFlat) return;
    triggerLifecycle("discovery");
  });

  const handleMouseLeave = contextSafe(() => {
    const isFlat = activeProgressState % 1 === 0;
    if (isTransitioning || !isFlat) return;
    triggerLifecycle("idle");

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

    const currentVal = activeProgressState;
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
        setActiveProgressState(val);
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
