import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ApparatusSpecimenBoxProps } from "./types";

// Register CustomEase for custom physics/curves if available
if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
  // ponytail: Use standard Vessel Curve: cubic-bezier(0.16, 1, 0.3, 1)
  CustomEase.create("vessel", "M0,0 C0.16,1 0.3,1 1,1");
}

interface SpecimenData {
  id: number;
  title: string;
  left: number; // percentage
  top: number;  // percentage
  width: number; // percentage
  height: number; // percentage
  rotation: number; // degrees
  weight: number; // parallax factor
}

const SPECIMENS: SpecimenData[] = [
  { id: 1, title: "PHASE I — ADAPT", left: 8, top: 12, width: 22, height: 28, rotation: -3, weight: 1.2 },
  { id: 2, title: "PHASE II — DECAY", left: 38, top: 16, width: 20, height: 26, rotation: 4, weight: 0.8 },
  { id: 3, title: "PHASE III — FLUX", left: 66, top: 10, width: 24, height: 32, rotation: -1.5, weight: 1.5 },
  { id: 4, title: "PHASE IV — CRISTAL", left: 12, top: 54, width: 20, height: 26, rotation: 5, weight: 0.9 },
  { id: 5, title: "PHASE V — SOL", left: 40, top: 58, width: 24, height: 30, rotation: -4, weight: 1.3 },
  { id: 6, title: "PHASE VI — STELLA", left: 70, top: 50, width: 21, height: 27, rotation: 2, weight: 0.7 }
];

const DEFAULT_GALLARY_IMAGES = [
  "/images/components images/Gallary/cosmos_145253936.jpeg",
  "/images/components images/Gallary/cosmos_1110264921.jpeg",
  "/images/components images/Gallary/cosmos_1309943729.jpeg",
  "/images/components images/Gallary/cosmos_1578342658.jpeg",
  "/images/components images/Gallary/cosmos_1724531036.jpeg",
  "/images/components images/Gallary/cosmos_1948095192.jpeg",
  "/images/components images/Gallary/cosmos_854490082.jpeg"
];

export const ApparatusSpecimenBox: React.FC<ApparatusSpecimenBoxProps> = ({
  images: propImages,
  imageSrc,
  className = "",
  style,
  onLifecycleChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  
  // Array refs to animate items independently
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pinRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Sizing ref
  const boundsRef = useRef({ width: 800, height: 600 });

  // Interactive controls states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [velvetColor, setVelvetColor] = useState<"navy" | "burgundy" | "charcoal">("charcoal");
  const [tiltSensitivity, setTiltSensitivity] = useState(1.0);
  const [shadowDepth, setShadowDepth] = useState(1.0);
  const [pinStyle, setPinStyle] = useState<"brass" | "chrome" | "steel">("brass");

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  interface OverlayState {
    active: boolean;
    idx: number | null;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }
  const [overlayState, setOverlayState] = useState<OverlayState | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Dynamically build a pool of distinct specimen images
  const displayImages = React.useMemo(() => {
    if (propImages && propImages.length > 1) {
      return propImages;
    }
    const base = imageSrc ? [imageSrc] : [];
    const combined = [...base];
    for (const img of DEFAULT_GALLARY_IMAGES) {
      if (combined.length >= 6) break;
      if (!combined.includes(img)) {
        combined.push(img);
      }
    }
    return combined;
  }, [propImages, imageSrc]);

  // ponytail: store configs in ref to avoid re-triggering animations on option adjustments
  const configRef = useRef({ velvetColor, tiltSensitivity, shadowDepth, pinStyle });
  useEffect(() => {
    configRef.current = { velvetColor, tiltSensitivity, shadowDepth, pinStyle };
  }, [velvetColor, tiltSensitivity, shadowDepth, pinStyle]);

  // Lifecycle reporting
  useEffect(() => {
    onLifecycleChange?.("discovery");
    const timer = setTimeout(() => {
      onLifecycleChange?.("idle");
    }, 1000);
    return () => clearTimeout(timer);
  }, [onLifecycleChange]);

  // Update container boundaries
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        boundsRef.current = {
          width: entry.contentRect.width || 800,
          height: entry.contentRect.height || 600
        };
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const clickOutside = () => setDropdownOpen(false);
    window.addEventListener("click", clickOutside);
    return () => window.removeEventListener("click", clickOutside);
  }, []);

  // Main interaction logic using useGSAP
  useGSAP(() => {
    const tray = trayRef.current;
    if (!tray) return;

    // 1. Initial Discovery Reveal Animation (Staggered pins entry)
    SPECIMENS.forEach((_, idx) => {
      const item = itemRefs.current[idx];
      const pin = pinRefs.current[idx];
      if (item && pin) {
        gsap.fromTo(item,
          { opacity: 0, scaleX: 0.8, scaleY: 0.8, y: 20, z: 0 },
          { opacity: 1, scaleX: 1, scaleY: 1, y: 0, z: 4, duration: 0.8, delay: idx * 0.1, ease: "vessel" }
        );
        gsap.fromTo(pin,
          { y: -80, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, delay: 0.4 + idx * 0.1, ease: "bounce.out" }
        );
      }
    });

    // 2. Cursor dynamic coordinates and tilt animators
    const tiltX = gsap.quickTo(tray, "rotationX", { duration: 0.6, ease: "power2.out" });
    const tiltY = gsap.quickTo(tray, "rotationY", { duration: 0.6, ease: "power2.out" });

    // Individual item parallax shifts
    const itemShiftsX = SPECIMENS.map((_, idx) => 
      gsap.quickTo(itemRefs.current[idx], "x", { duration: 0.7, ease: "power2.out" })
    );
    const itemShiftsY = SPECIMENS.map((_, idx) => 
      gsap.quickTo(itemRefs.current[idx], "y", { duration: 0.7, ease: "power2.out" })
    );

    // Individual shadow parallax offsets
    const shadowShiftsX = SPECIMENS.map((_, idx) => 
      gsap.quickTo(shadowRefs.current[idx], "x", { duration: 0.7, ease: "power2.out" })
    );
    const shadowShiftsY = SPECIMENS.map((_, idx) => 
      gsap.quickTo(shadowRefs.current[idx], "y", { duration: 0.7, ease: "power2.out" })
    );

    // Mouse movement event handler
    const handlePointerMove = (e: PointerEvent) => {
      // Skip cursor tracking when a specimen is unpinned/fullscreened (PEAK state)
      if (activeIdx !== null) return;

      const rect = tray.getBoundingClientRect();
      const rawX = (e.clientX - rect.left) / rect.width;
      const rawY = (e.clientY - rect.top) / rect.height;

      // Map to -0.5 to 0.5 coordinate plane
      const normalizedX = rawX - 0.5;
      const normalizedY = rawY - 0.5;

      // Animate container tilt
      const sens = configRef.current.tiltSensitivity;
      tiltX(-normalizedY * 15 * sens);
      tiltY(normalizedX * 15 * sens);

      // Animate parallax shifts
      SPECIMENS.forEach((spec, idx) => {
        // Only apply parallax if not active
        const weight = spec.weight;
        const px = normalizedX * 25 * weight;
        const py = normalizedY * 25 * weight;

        itemShiftsX[idx](px);
        itemShiftsY[idx](py);

        // Shadow shifts (opposite direction + offset for depth elevation simulation)
        const depthSens = configRef.current.shadowDepth;
        shadowShiftsX[idx](px - normalizedX * 10 * depthSens);
        shadowShiftsY[idx](py - normalizedY * 10 * depthSens + 5);
      });
    };

    const handlePointerLeave = () => {
      if (activeIdx !== null) return;
      
      // Reset tilt and offsets to neutral
      tiltX(0);
      tiltY(0);
      SPECIMENS.forEach((_, idx) => {
        itemShiftsX[idx](0);
        itemShiftsY[idx](0);
        shadowShiftsX[idx](0);
        shadowShiftsY[idx](0);
      });
    };

    tray.addEventListener("pointermove", handlePointerMove);
    tray.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      tray.removeEventListener("pointermove", handlePointerMove);
      tray.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [activeIdx]); // Re-run triggers on select state changes

  // 3. Peak Lift / Recovery Animation triggers
  useGSAP(() => {
    if (activeIdx === null) {
      // RECOVERY state: Return active item to original spot, restore others
      SPECIMENS.forEach((spec, idx) => {
        const item = itemRefs.current[idx];
        const pin = pinRefs.current[idx];
        const shadow = shadowRefs.current[idx];
        if (item && pin && shadow) {
          // Reset main item layout dimensions and transforms
          gsap.to(item, {
            left: `${spec.left}%`,
            top: `${spec.top}%`,
            width: `${spec.width}%`,
            height: `${spec.height}%`,
            x: 0,
            y: 0,
            z: 4,
            scaleX: 1,
            scaleY: 1,
            rotation: spec.rotation,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.0,
            ease: "vessel",
            overwrite: "auto"
          });

          // Reset frame padding/border
          const frame = item.querySelector(".specimen-frame");
          if (frame) {
            gsap.to(frame, {
              padding: "6px",
              borderWidth: "1px",
              borderRadius: "2px",
              duration: 1.0,
              ease: "vessel",
              overwrite: "auto"
            });
          }

          // Reset description tag
          const tag = item.querySelector(".specimen-tag");
          if (tag) {
            gsap.to(tag, {
              opacity: 1,
              height: "auto",
              marginTop: "6px",
              duration: 0.8,
              ease: "vessel",
              overwrite: "auto"
            });
          }

          // Reset pin with a tactile drop and bounce
          gsap.to(pin, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "bounce.out",
            delay: 0.3,
            overwrite: "auto"
          });

          // Reset shadow
          gsap.to(shadow, {
            scale: 1,
            x: 0,
            y: 0,
            opacity: 0.5,
            filter: "blur(6px)",
            duration: 1.0,
            ease: "vessel",
            overwrite: "auto"
          });
        }
      });
      onLifecycleChange?.("recovery");
      setTimeout(() => onLifecycleChange?.("idle"), 1000);
    } else {
      // PEAK state: Lift active specimen to cover the ENTIRE canvas, hide others
      onLifecycleChange?.("peak");
      
      const item = itemRefs.current[activeIdx];
      const pin = pinRefs.current[activeIdx];
      const shadow = shadowRefs.current[activeIdx];

      if (item && pin && shadow) {
        // Slide out pin (unpin action)
        gsap.to(pin, {
          y: -60,
          opacity: 0,
          duration: 0.4,
          ease: "power3.in"
        });

        // Expand specimen wrapper layout to fill the entire velvet case
        gsap.to(item, {
          left: "0%",
          top: "0%",
          width: "100%",
          height: "100%",
          x: 0,
          y: 0,
          z: 100, // Float above siblings
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "vessel",
          overwrite: "auto"
        });

        // Morph the specimen frame to become borderless and flat fullscreen
        const frame = item.querySelector(".specimen-frame");
        if (frame) {
          gsap.to(frame, {
            padding: "0px",
            borderWidth: "0px",
            borderRadius: "0px",
            duration: 1.2,
            ease: "vessel",
            overwrite: "auto"
          });
        }

        // Hide entomology description tag during bleed out
        const tag = item.querySelector(".specimen-tag");
        if (tag) {
          gsap.to(tag, {
            opacity: 0,
            height: "0px",
            marginTop: "0px",
            duration: 0.5,
            ease: "vessel",
            overwrite: "auto"
          });
        }

        // Hide shadow (since it matches the container boundaries)
        gsap.to(shadow, {
          opacity: 0,
          scale: 0.95,
          duration: 0.8,
          ease: "vessel",
          overwrite: "auto"
        });

        // Fade out and blur all other specimens completely
        SPECIMENS.forEach((_, idx) => {
          if (idx !== activeIdx) {
            const sibling = itemRefs.current[idx];
            const sibShadow = shadowRefs.current[idx];
            if (sibling) {
              gsap.to(sibling, {
                opacity: 0,
                filter: "blur(12px)",
                scaleX: 0.85,
                scaleY: 0.85,
                duration: 0.8,
                ease: "vessel",
                overwrite: "auto"
              });
            }
            if (sibShadow) {
              gsap.to(sibShadow, {
                opacity: 0,
                duration: 0.6,
                overwrite: "auto"
              });
            }
          }
        });
      }
    }
  }, [activeIdx]);

  // 4. Subtle Idle Breathing Timeline (Z-depth oscillation)
  useEffect(() => {
    // Skip breathing if active unpinned or hovered
    if (activeIdx !== null) return;

    const tweens = SPECIMENS.map((spec, idx) => {
      const item = itemRefs.current[idx];
      const shadow = shadowRefs.current[idx];
      if (!item || !shadow) return null;

      // Staggered breathing timeline
      return gsap.timeline({ repeat: -1, yoyo: true })
        .to(item, {
          z: 8,
          rotation: spec.rotation + (idx % 2 === 0 ? 0.5 : -0.5),
          duration: 3 + idx * 0.4,
          ease: "sine.inOut"
        }, 0)
        .to(shadow, {
          scale: 0.96,
          opacity: 0.4,
          filter: "blur(8px)",
          duration: 3 + idx * 0.4,
          ease: "sine.inOut"
        }, 0);
    });

    return () => {
      tweens.forEach((t) => t?.kill());
    };
  }, [activeIdx]);

  // CSS Velvet Background values mapping
  const bgGradient = {
    navy: "radial-gradient(circle at center, #0F172A 0%, #050811 100%)",
    burgundy: "radial-gradient(circle at center, #1E0C0C 0%, #080303 100%)",
    charcoal: "radial-gradient(circle at center, #121212 0%, #060606 100%)"
  }[velvetColor];

  // Metal pin color mapping
  const pinHeadGradient = {
    brass: "radial-gradient(circle at 35% 35%, #FFEFA8 0%, #CFA14B 50%, #75551A 100%)",
    chrome: "radial-gradient(circle at 35% 35%, #FFFFFF 0%, #B5B5B5 50%, #4D4D4D 100%)",
    steel: "radial-gradient(circle at 35% 35%, #A8B2C4 0%, #687387 50%, #29303D 100%)"
  }[pinStyle];

  const handleSpecimenClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx !== null) return;

    const item = itemRefs.current[idx];
    const tray = trayRef.current;
    if (item && tray) {
      const rect = item.getBoundingClientRect();
      const trayRect = tray.getBoundingClientRect();
      const localX = rect.left - trayRect.left;
      const localY = rect.top - trayRect.top;

      setOverlayState({
        active: true,
        idx,
        x: localX,
        y: localY,
        width: rect.width,
        height: rect.height,
        rotation: SPECIMENS[idx].rotation
      });
      setActiveIdx(idx);

      // Fade out siblings
      SPECIMENS.forEach((_, sIdx) => {
        if (sIdx !== idx) {
          const sibling = itemRefs.current[sIdx];
          const sibShadow = shadowRefs.current[sIdx];
          if (sibling) {
            gsap.to(sibling, {
              opacity: 0,
              filter: "blur(12px)",
              scaleX: 0.85,
              scaleY: 0.85,
              duration: 0.8,
              ease: "vessel",
              overwrite: "auto"
            });
          }
          if (sibShadow) {
            gsap.to(sibShadow, {
              opacity: 0,
              duration: 0.6,
              overwrite: "auto"
            });
          }
        }
      });

      // Hide original item
      gsap.to(item, {
        opacity: 0,
        duration: 0.1,
        overwrite: "auto"
      });
    }
  };

  const handleCloseOverlay = (e?: React.MouseEvent) => {
    console.log("handleCloseOverlay called! Event present:", !!e);
    if (e) e.stopPropagation();
    console.log("overlayState details:", overlayState, "overlayRef.current:", overlayRef.current);
    if (!overlayState || overlayState.idx === null || !overlayRef.current) {
      console.warn("handleCloseOverlay aborted due to missing state or ref");
      return;
    }

    const card = overlayRef.current.querySelector(".overlay-card");
    const tag = overlayRef.current.querySelector(".overlay-tag");
    const idx = overlayState.idx;

    // Tactile pin return
    const pin = pinRefs.current[idx];
    if (pin) {
      gsap.to(pin, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "bounce.out",
        delay: 0.4,
        overwrite: "auto"
      });
    }

    if (card) {
      gsap.to(card, {
        left: `${overlayState.x}px`,
        top: `${overlayState.y}px`,
        width: `${overlayState.width}px`,
        height: `${overlayState.height}px`,
        rotation: overlayState.rotation,
        padding: "6px",
        borderWidth: "1px",
        borderRadius: "2px",
        duration: 1.0,
        ease: "vessel",
        overwrite: "auto",
        onComplete: () => {
          // Restore original item state and reveal it
          const item = itemRefs.current[idx];
          if (item) {
            gsap.set(item, { opacity: 1 });
          }
          setOverlayState(null);
          setActiveIdx(null);
        }
      });
    }

    if (tag) {
      gsap.to(tag, {
        opacity: 1,
        height: "auto",
        marginTop: "6px",
        duration: 0.8,
        ease: "vessel",
        overwrite: "auto"
      });
    }

    // Restore siblings
    SPECIMENS.forEach((_, sIdx) => {
      if (sIdx !== idx) {
        const sibling = itemRefs.current[sIdx];
        const sibShadow = shadowRefs.current[sIdx];
        if (sibling) {
          gsap.to(sibling, {
            opacity: 1,
            filter: "blur(0px)",
            scaleX: 1,
            scaleY: 1,
            duration: 1.0,
            ease: "vessel",
            overwrite: "auto"
          });
        }
        if (sibShadow) {
          gsap.to(sibShadow, {
            opacity: 0.5,
            duration: 1.0,
            ease: "vessel",
            overwrite: "auto"
          });
        }
      }
    });
  };

  // Mount animation for the overlay card
  useGSAP(() => {
    if (overlayState?.active && overlayRef.current) {
      const card = overlayRef.current.querySelector(".overlay-card");
      const tag = overlayRef.current.querySelector(".overlay-tag");
      
      if (card) {
        // Slide out the pin of the active specimen
        const pin = pinRefs.current[overlayState.idx!];
        if (pin) {
          gsap.to(pin, {
            y: -60,
            opacity: 0,
            duration: 0.4,
            ease: "power3.in"
          });
        }

        // Animate overlay card layout properties to fill screen
        gsap.to(card, {
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          rotation: 0,
          padding: "0px",
          borderWidth: "0px",
          borderRadius: "0px",
          duration: 1.2,
          ease: "vessel",
          overwrite: "auto"
        });
      }

      if (tag) {
        // Hide description tag
        gsap.to(tag, {
          opacity: 0,
          height: "0px",
          marginTop: "0px",
          duration: 0.5,
          ease: "vessel",
          overwrite: "auto"
        });
      }
    }
  }, [overlayState]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[600px] md:h-[700px] overflow-hidden select-none cursor-default ${className}`}
      style={{
        ...style,
        perspective: "1200px"
      }}
    >
      {/* 3D Case Grid Velvet Tray */}
      <div
        ref={trayRef}
        className="w-full h-full relative transition-all duration-300"
        style={{
          background: bgGradient,
          transformStyle: "preserve-3d",
          transform: "rotateX(0deg) rotateY(0deg)"
        }}
        onClick={(e) => handleCloseOverlay(e)}
      >
        {/* Soft fabric dust overlay */}
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay" />

        {/* Specimens mapping */}
        {SPECIMENS.map((spec, idx) => {
          const imgUrl = displayImages[idx % displayImages.length];
          const isCurrentActive = activeIdx === idx;
          const isHovered = hoveredIdx === idx && activeIdx === null;

          return (
            <div
              key={spec.id}
              ref={(el) => { itemRefs.current[idx] = el; }}
              className="absolute group"
              style={{
                left: `${spec.left}%`,
                top: `${spec.top}%`,
                width: `${spec.width}%`,
                height: `${spec.height}%`,
                transformStyle: "preserve-3d",
                transform: "translate3d(0px, 0px, 4px)",
                zIndex: isCurrentActive ? 50 : 10,
                cursor: isCurrentActive ? "zoom-out" : "zoom-in",
                pointerEvents: "auto"
              }}
              onClick={(e) => handleSpecimenClick(idx, e)}
              onPointerEnter={() => {
                setHoveredIdx(idx);
                if (activeIdx === null) onLifecycleChange?.("buildUp");
              }}
              onPointerLeave={() => {
                setHoveredIdx(null);
                if (activeIdx === null) onLifecycleChange?.("idle");
              }}
            >
              {/* 3D Specimen Shadow (Rendered separately to allow elevation blur/scale changes) */}
              <div
                ref={(el) => { shadowRefs.current[idx] = el; }}
                className="absolute inset-0 rounded-sm bg-black opacity-50 select-none pointer-events-none origin-center"
                style={{
                  transform: "translateZ(-10px)",
                  filter: "blur(6px)"
                }}
              />

              {/* Specimen Frame + Image */}
              <div
                className="specimen-frame w-full h-full relative bg-neutral-900 border border-white/5 p-1.5 rounded-sm transition-shadow duration-300 shadow-md group-hover:shadow-lg overflow-hidden flex flex-col justify-between"
                style={{
                  transformStyle: "preserve-3d",
                  boxShadow: isHovered 
                    ? "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)" 
                    : "0 4px 6px -1px rgba(0, 0, 0, 0.2)"
                }}
              >
                {/* Specimen image container */}
                <div className="w-full h-full relative overflow-hidden flex-grow bg-neutral-950 rounded-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={spec.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out ${activeIdx === null ? "group-hover:scale-105" : ""}`}
                  />
                  {/* Glass reflections overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-60 pointer-events-none" />
                </div>

                {/* Specimen entomology description tag */}
                <div className="specimen-tag mt-1.5 flex items-center justify-between text-[8px] font-mono tracking-wider text-neutral-400 border-t border-white/5 pt-1 overflow-hidden">
                  <span>{spec.title}</span>
                  <span className="text-[7px] text-neutral-500 opacity-60">SP.{spec.id.toString().padStart(3, "0")}</span>
                </div>
              </div>

              {/* Removable locking metal pin */}
              <div
                ref={(el) => { pinRefs.current[idx] = el; }}
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 pointer-events-none"
                style={{
                  transformStyle: "preserve-3d",
                  zIndex: 20
                }}
              >
                {/* Pin Head */}
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-md"
                  style={{
                    background: pinHeadGradient,
                    transform: "translateZ(10px)"
                  }}
                />
                {/* Pin Shaft */}
                <div className="w-[1.5px] h-5 bg-gradient-to-b from-neutral-400 to-transparent opacity-60 mx-auto -mt-0.5" />
              </div>
            </div>
          );
        })}

        {/* Cinematic Fullscreen Inspection Overlay */}
        {overlayState && overlayState.idx !== null && (
          <div
            ref={overlayRef}
            className="absolute inset-0 z-50 pointer-events-auto cursor-zoom-out"
            onClick={(e) => handleCloseOverlay(e)}
          >
            <div
              className="overlay-card absolute bg-neutral-900 border border-white/5 p-1.5 rounded-sm shadow-2xl overflow-hidden flex flex-col justify-between"
              style={{
                transformStyle: "preserve-3d",
                left: `${overlayState.x}px`,
                top: `${overlayState.y}px`,
                width: `${overlayState.width}px`,
                height: `${overlayState.height}px`,
                transform: `rotate(${overlayState.rotation}deg) translateZ(100px)`
              }}
            >
              {/* Specimen image container */}
              <div className="w-full h-full relative overflow-hidden flex-grow bg-neutral-950 rounded-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImages[overlayState.idx % displayImages.length]}
                  alt={SPECIMENS[overlayState.idx].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-60 pointer-events-none" />
              </div>

              {/* Specimen entomology description tag */}
              <div className="overlay-tag mt-1.5 flex items-center justify-between text-[8px] font-mono tracking-wider text-neutral-400 border-t border-white/5 pt-1 overflow-hidden">
                <span>{SPECIMENS[overlayState.idx].title}</span>
                <span className="text-[7px] text-neutral-500 opacity-60">
                  SP.{SPECIMENS[overlayState.idx].id.toString().padStart(3, "0")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pill Controls Panel */}
      <div 
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          zIndex: 999,
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="abyss-controls-trigger"
        >
          {dropdownOpen ? "Close Controls" : "Configure Drawer"}
        </button>

        {dropdownOpen && (
          <div
            className="abyss-controls-panel"
          >
            {/* 1. Velvet Color selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "9px", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Velvet Color</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["charcoal", "navy", "burgundy"] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => setVelvetColor(color)}
                    className={`abyss-segment-button ${velvetColor === color ? "abyss-segment-button-active" : ""}`}
                    style={{
                      flexGrow: 1,
                      padding: "4px 8px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      textTransform: "uppercase"
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Tilt Sensitivity slider */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                <span>Tilt Sensitivity</span>
                <span>{tiltSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={tiltSensitivity}
                onChange={(e) => setTiltSensitivity(parseFloat(e.target.value))}
                style={{
                  width: "100%"
                }}
              />
            </div>

            {/* 3. Shadow Depth slider */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                <span>Shadow Blur</span>
                <span>{shadowDepth.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={shadowDepth}
                onChange={(e) => setShadowDepth(parseFloat(e.target.value))}
                style={{
                  width: "100%"
                }}
              />
            </div>

            {/* 4. Pin Style selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "9px", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Pin Hardware</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["brass", "chrome", "steel"] as const).map((styleName) => (
                  <button
                    key={styleName}
                    onClick={() => setPinStyle(styleName)}
                    className={`abyss-segment-button ${pinStyle === styleName ? "abyss-segment-button-active" : ""}`}
                    style={{
                      flexGrow: 1,
                      padding: "4px 8px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      textTransform: "uppercase"
                    }}
                  >
                    {styleName}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                setVelvetColor("charcoal");
                setTiltSensitivity(1.0);
                setShadowDepth(1.0);
                setPinStyle("brass");
                setActiveIdx(null);
              }}
              className="abyss-segment-button"
              style={{
                marginTop: "8px",
                padding: "6px",
                borderRadius: "6px",
                cursor: "pointer",
                textTransform: "uppercase",
                borderStyle: "dashed"
              }}
            >
              Reset to Rest
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApparatusSpecimenBox;
