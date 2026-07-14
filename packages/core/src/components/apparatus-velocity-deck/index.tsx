import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ApparatusVelocityDeckProps } from "./types";

export const ApparatusVelocityDeck: React.FC<ApparatusVelocityDeckProps> = ({
  images,
  imageSrc,
  className = "",
  style,
  onLifecycleChange,
  scrollProgress = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const slicesRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Velocity and physics tracking refs
  const prevProgress = useRef(scrollProgress);
  const prevTime = useRef(typeof window !== "undefined" ? performance.now() : 0);
  const velocityRef = useRef(0);
  const smoothVelocity = useRef(0);
  
  // Idle breathing timeline ref
  const idleTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const idleTimeoutRef = useRef<any>(null);
  
  // Responsive sizing states
  const [dimensions, setDimensions] = useState({ width: 185, height: 278 });

  // Interactive controls states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [skewEnabled, setSkewEnabled] = useState(true);
  const [spreadIntensity, setSpreadIntensity] = useState(50); // 0 to 100
  const [exitStyle, setExitStyle] = useState<"cinematic" | "uniform" | "chaos">("cinematic");
  const [breathingEnabled, setBreathingEnabled] = useState(true);
  const [heroVignetteEnabled, setHeroVignetteEnabled] = useState(true);
  
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // ponytail: use references for configuration toggles to avoid dependency churn in useGSAP
  const configRef = useRef({
    skewEnabled,
    spreadIntensity,
    exitStyle,
    breathingEnabled,
    heroVignetteEnabled
  });

  useEffect(() => {
    configRef.current = {
      skewEnabled,
      spreadIntensity,
      exitStyle,
      breathingEnabled,
      heroVignetteEnabled
    };
  }, [skewEnabled, spreadIntensity, exitStyle, breathingEnabled, heroVignetteEnabled]);

  // Lifecycle discovery trigger on mount
  useEffect(() => {
    onLifecycleChange?.("discovery");
    const timer = setTimeout(() => {
      onLifecycleChange?.("idle");
    }, 1000);
    return () => clearTimeout(timer);
  }, [onLifecycleChange]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle responsive card sizing via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        // ponytail: simple scale calculation based on 16% of container width clamped safely
        const cardW = Math.max(140, Math.min(220, w * 0.16));
        setDimensions({
          width: Math.round(cardW),
          height: Math.round(cardW * 1.5),
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Track scroll progress delta to compute velocity spikes and drive physics
  useEffect(() => {
    const now = performance.now();
    const dt = Math.max(1, now - prevTime.current);
    const dp = scrollProgress - prevProgress.current;
    
    // Instantaneous velocity calculation
    const instantVelocity = (dp / dt) * 2000;
    
    // Smooth out velocity tracking (LERP filter)
    smoothVelocity.current += (instantVelocity - smoothVelocity.current) * 0.25;
    velocityRef.current = smoothVelocity.current;
    
    prevProgress.current = scrollProgress;
    prevTime.current = now;

    // Trigger lifecycles based on scroll action
    const absVel = Math.abs(instantVelocity);
    if (absVel > 2.0) {
      onLifecycleChange?.("peak");
    } else if (absVel > 0.3) {
      onLifecycleChange?.("buildUp");
    }
  }, [scrollProgress, onLifecycleChange]);

  // Idle state detection and breathing animation manager
  useEffect(() => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    
    // Kill any active breathing immediately on scroll input to avoid animation conflicts
    if (idleTimelineRef.current) {
      idleTimelineRef.current.kill();
      idleTimelineRef.current = null;
      onLifecycleChange?.("idle");
    }

    // Reset card inner positions to center before we start tracking scroll
    cardInnerRefs.current.forEach((inner, idx) => {
      if (!inner || hoveredIdx === idx) return;
      gsap.to(inner, {
        x: 0,
        y: 0,
        z: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        duration: 0.3,
        overwrite: "auto"
      });
    });

    // Start idle timeout
    idleTimeoutRef.current = setTimeout(() => {
      if (!configRef.current.breathingEnabled || hoveredIdx !== null) return;
      onLifecycleChange?.("idle");
      
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      idleTimelineRef.current = tl;

      cardInnerRefs.current.forEach((inner, idx) => {
        if (!inner) return;
        const delay = idx * 0.15;
        // ponytail: gentle breathing using simple sine waves
        tl.to(inner, {
          y: "+=4",
          z: "+=6",
          rotateZ: "+=0.6",
          duration: 2.2,
          ease: "sine.inOut",
        }, delay);
      });
    }, 1500);

    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [scrollProgress, hoveredIdx, onLifecycleChange]);

  // Map scrollProgress and velocity to card transforms
  useGSAP(() => {
    slicesRef.current.forEach((slice, idx) => {
      if (!slice) return;

      const offset = idx - 2; // -2, -1, 0, 1, 2
      const isHero = idx === 0;

      // Calculate current velocity effect
      const currentVel = velocityRef.current;
      const velocitySkew = configRef.current.skewEnabled ? Math.max(-12, Math.min(12, currentVel * 6)) : 0;
      const velocitySpread = (configRef.current.spreadIntensity / 100) * Math.min(25, Math.abs(currentVel) * 15);

      if (isHero) {
        // --- Last card (idx 0): perspective dive to full-bleed hero ---
        const DIVE_START = 0.78;
        const dp = Math.max(0, Math.min(1, (scrollProgress - DIVE_START) / (1 - DIVE_START)));
        const de = dp * dp * (3 - 2 * dp); // smoothstep ease

        const container = containerRef.current;
        const cw = container?.clientWidth ?? 1182;
        const ch = container?.clientHeight ?? 664;
        const TZ_END = 500; // dolly distance
        const persp = 1400 / (1400 - TZ_END);
        
        // Scale target based on computed responsive dimensions
        const coverScale = Math.max(cw / (dimensions.width * persp), ch / (dimensions.height * persp)) * 1.04;

        const startZ = (0 - 4) * 12;
        const startY = offset * 2.5;

        // Depth blur from cards above, fading out as dive finishes
        let presenceAbove = 0;
        for (let i = 1; i <= 4; i++) {
          const sA = (4 - i) * 0.15;
          const eA = sA + 0.35;
          presenceAbove += 1 - Math.max(0, Math.min(1, (scrollProgress - sA) / (eA - sA)));
        }
        const blurVal = presenceAbove * 2.0 * (1 - de);

        gsap.to(slice, {
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: startY * (1 - de),
          z: startZ + (TZ_END - startZ) * de - velocitySpread, // Add velocity recoil
          rotateY: 0,
          rotateZ: 0,
          skewY: velocitySkew * (1 - de),
          scale: 1 + (coverScale - 1) * de,
          opacity: 1,
          filter: `blur(${blurVal}px)`,
          duration: 0.45,
          ease: "power2.out",
          overwrite: "auto",
        });

        // Dissolve the card border/radius into a full-bleed window
        const inner = cardInnerRefs.current[idx];
        if (inner) {
          gsap.to(inner, {
            borderRadius: 8 * (1 - de),
            borderColor: `rgba(255, 255, 255, ${0.1 * (1 - de)})`,
            duration: 0.45,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
        return;
      }

      // Exit animations for index 1, 2, 3, 4
      const start = (4 - idx) * 0.15;
      const end = start + 0.35;
      const t = Math.max(0, Math.min(1, (scrollProgress - start) / (end - start)));

      // Starting stack position (at t = 0)
      const startX = 0;
      const startY = offset * 2.5;
      const startZ = (idx - 4) * 12; // Linear depth stack

      // Custom exit trajectories for unique personalities
      let endX = 0;
      let endY = 0;
      let endZ = 220;
      let endRotY = 0;
      let endRotZ = 0;
      let endScale = 0.8;
      let easeMethod = "power2.out";

      const styleMode = configRef.current.exitStyle;

      if (styleMode === "uniform") {
        const dir = idx % 2 === 0 ? -1 : 1;
        endX = dir * 380;
        endY = -460;
        endRotY = dir * 45;
        endRotZ = dir * 30;
      } else if (styleMode === "chaos") {
        // ponytail: deterministic chaos based on index seed values to avoid random recreation glitches
        const seedX = Math.sin(idx * 45) * 400;
        const seedY = -350 - (idx * 30);
        const seedRot = Math.cos(idx * 75) * 45;
        endX = seedX;
        endY = seedY;
        endRotY = seedRot;
        endRotZ = seedRot * 0.5;
      } else {
        // "cinematic" choreographed exit paths
        if (idx === 4) {
          // Card 5 (Top card): Hard left upward swipe, accelerates fast
          endX = -450;
          endY = -520;
          endRotY = -40;
          endRotZ = -35;
          endScale = 0.75;
          easeMethod = "power3.in";
        } else if (idx === 3) {
          // Card 4: Right shallow glide, decelerates slow, floats
          endX = 400;
          endY = -360;
          endRotY = 25;
          endRotZ = 15;
          endScale = 0.85;
          easeMethod = "power1.out";
        } else if (idx === 2) {
          // Card 3: Left horizontal flat slide, stays clean
          endX = -480;
          endY = -150;
          endRotY = -10;
          endRotZ = -8;
          endScale = 0.8;
        } else {
          // Card 2: Right downward exit, breaks upward trajectory expectation
          endX = 420;
          endY = 220;
          endRotY = 30;
          endRotZ = 22;
          endScale = 0.82;
        }
      }

      // Interpolation logic
      const xVal = startX * (1 - t) + endX * Math.pow(t, 1.4);
      const yVal = startY * (1 - t) + endY * Math.pow(t, 1.2);
      const zVal = startZ * (1 - t) + endZ * t - (t === 0 ? velocitySpread * (5 - idx) * 0.4 : 0);
      const rotY = endRotY * t;
      const rotZ = endRotZ * t;
      const scaleVal = 1 * (1 - t) + endScale * t;
      const opacityVal = 1 - t * t;

      // Blur calculation: Exiting blur + stack depth blur
      const exitBlur = Math.max(0, (t - 0.4) * 8);
      let depthBlur = 0;
      if (idx < 4) {
        let presenceAbove = 0;
        for (let i = idx + 1; i <= 4; i++) {
          const startAbove = (4 - i) * 0.15;
          const endAbove = startAbove + 0.35;
          const tAbove = Math.max(0, Math.min(1, (scrollProgress - startAbove) / (endAbove - startAbove)));
          presenceAbove += (1 - tAbove);
        }
        depthBlur = presenceAbove * 2.0;
      }
      const totalBlur = Math.max(exitBlur, depthBlur);

      gsap.to(slice, {
        xPercent: -50,
        yPercent: -50,
        x: xVal,
        y: yVal,
        z: zVal,
        rotateY: rotY,
        rotateZ: rotZ,
        skewY: t === 0 ? velocitySkew : 0, // Apply velocity skew to stacked cards
        scale: scaleVal,
        opacity: opacityVal,
        filter: `blur(${totalBlur}px)`,
        duration: 0.45,
        ease: easeMethod,
        overwrite: "auto",
      });
    });
  }, [scrollProgress, dimensions]);

  // Handle active card scaling & dimming on hover
  useEffect(() => {
    if (idleTimelineRef.current) return; // Skip if breathing is active
    
    cardInnerRefs.current.forEach((inner, idx) => {
      if (!inner) return;

      let cardScale = 1.0;
      let opacityVal = 1.0;
      let borderColor = "rgba(255, 255, 255, 0.08)";
      let shadow = "0 30px 60px -15px rgba(0, 0, 0, 0.85)";

      if (hoveredIdx === idx) {
        cardScale = 1.06;
        borderColor = "rgba(255, 255, 255, 0.35)";
        shadow = "0 35px 70px -15px rgba(0, 0, 0, 0.95), 0 0 25px rgba(255, 255, 255, 0.04)";
      } else if (hoveredIdx !== null) {
        cardScale = 0.94;
        opacityVal = 0.35;
        borderColor = "rgba(255, 255, 255, 0.03)";
        shadow = "0 10px 20px -10px rgba(0, 0, 0, 0.6)";
      }

      gsap.to(inner, {
        scale: cardScale,
        opacity: opacityVal,
        borderColor: borderColor,
        boxShadow: shadow,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  }, [hoveredIdx]);

  // Track cursor position for 3D card tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // ponytail: skip tilt if breathing is currently running or dropdown is open
    if (!containerRef.current || idleTimelineRef.current || dropdownOpen) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    cardInnerRefs.current.forEach((inner, idx) => {
      if (!inner) return;
      const factor = 1 - idx * 0.05; // Inner cards tilt slightly less
      gsap.to(inner, {
        rotateY: x * 22 * factor,
        rotateX: -y * 22 * factor,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  };

  const handleMouseLeave = () => {
    onLifecycleChange?.("recovery");
    setHoveredIdx(null);
    cardInnerRefs.current.forEach((inner) => {
      if (!inner) return;
      gsap.to(inner, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  };

  // 5 standard image items
  const defaultImages = [
    "/images/components%20images/scroll/cosmos_1309660817.jpeg",
    "/images/components%20images/scroll/cosmos_1859262512.jpeg",
    "/images/components%20images/scroll/cosmos_2063063057.jpeg",
    "/images/components%20images/scroll/cosmos_679994644.jpeg",
    imageSrc || "/images/components%20images/scroll/cosmos_1309660817.jpeg"
  ];
  
  const displayImages = images && images.length >= 5 ? images : defaultImages;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`absolute inset-0 flex justify-center items-center select-none overflow-hidden ${className}`}
      style={{
        backgroundColor: "#070709",
        perspective: "1400px",
        ...style,
      }}
    >
      {/* Controls Dropdown Panel */}
      <div
        className="absolute z-20 pointer-events-auto"
        style={{
          top: "16px",
          right: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
        }}
        onClick={(e) => e.stopPropagation()}
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
              minWidth: "220px",
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

            {/* Toggle: Velocity Skew */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                Velocity Skew
              </span>
              <button 
                onClick={() => setSkewEnabled(!skewEnabled)}
                style={{ 
                  position: "relative",
                  width: "28px",
                  height: "16px",
                  borderRadius: "9999px",
                  backgroundColor: skewEnabled ? "rgba(52, 211, 153, 0.2)" : "rgba(255, 255, 255, 0.1)",
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
                    transform: skewEnabled ? "translateX(12px)" : "translateX(0px)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    ...(skewEnabled && { backgroundColor: "#34d399" })
                  }}
                />
              </button>
            </div>

            {/* Slider: Spread Intensity */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                  Spread
                </span>
                <span className="text-[9px] font-mono text-white/50">{spreadIntensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={spreadIntensity}
                onChange={(e) => setSpreadIntensity(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: "2px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  outline: "none",
                  WebkitAppearance: "none"
                }}
              />
            </div>

            {/* Cycle: Exit Style */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                Exit Path
              </span>
              <div style={{ display: "flex", gap: "4px" }}>
                {(["cinematic", "uniform", "chaos"] as const).map((styleOpt) => (
                  <button
                    key={styleOpt}
                    onClick={() => setExitStyle(styleOpt)}
                    style={{
                      flex: 1,
                      backgroundColor: exitStyle === styleOpt ? "rgba(52, 211, 153, 0.15)" : "transparent",
                      color: exitStyle === styleOpt ? "#34d399" : "rgba(255, 255, 255, 0.4)",
                      border: `1px solid ${exitStyle === styleOpt ? "rgba(52, 211, 153, 0.3)" : "rgba(255, 255, 255, 0.05)"}`,
                      borderRadius: "4px",
                      padding: "4px 0",
                      fontSize: "8px",
                      fontFamily: "monospace",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {styleOpt}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle: Idle Breathing */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                Idle Breathe
              </span>
              <button 
                onClick={() => setBreathingEnabled(!breathingEnabled)}
                style={{ 
                  position: "relative",
                  width: "28px",
                  height: "16px",
                  borderRadius: "9999px",
                  backgroundColor: breathingEnabled ? "rgba(52, 211, 153, 0.2)" : "rgba(255, 255, 255, 0.1)",
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
                    transform: breathingEnabled ? "translateX(12px)" : "translateX(0px)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    ...(breathingEnabled && { backgroundColor: "#34d399" })
                  }}
                />
              </button>
            </div>

            {/* Toggle: Hero Vignette */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase select-none">
                Hero Vignette
              </span>
              <button 
                onClick={() => setHeroVignetteEnabled(!heroVignetteEnabled)}
                style={{ 
                  position: "relative",
                  width: "28px",
                  height: "16px",
                  borderRadius: "9999px",
                  backgroundColor: heroVignetteEnabled ? "rgba(52, 211, 153, 0.2)" : "rgba(255, 255, 255, 0.1)",
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
                    transform: heroVignetteEnabled ? "translateX(12px)" : "translateX(0px)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    ...(heroVignetteEnabled && { backgroundColor: "#34d399" })
                  }}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3D Scene Viewport */}
      <div 
        className="w-full max-w-5xl h-full relative flex justify-center items-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        {Array.from({ length: 5 }).map((_, idx) => {
          const isHero = idx === 0;
          const DIVE_START = 0.78;
          const dp = Math.max(0, Math.min(1, (scrollProgress - DIVE_START) / (1 - DIVE_START)));
          const de = dp * dp * (3 - 2 * dp); // smoothstep value

          return (
            <div
              key={idx}
              ref={(el) => {
                slicesRef.current[idx] = el;
              }}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
                transform: "translate(-50%, -50%)",
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
            >
              {/* Inner Wrapper (Handles Hover Scaling, custom tilt, and vignette overlay) */}
              <div
                ref={(el) => {
                  cardInnerRefs.current[idx] = el;
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="w-full h-full relative overflow-hidden rounded-[8px] bg-[#0c0c0e] cursor-pointer"
                style={{
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transformStyle: "preserve-3d",
                  willChange: "transform, opacity, border-color, box-shadow",
                  backfaceVisibility: "hidden",
                }}
              >
                {/* Vignette Overlay for Hero Card */}
                {isHero && heroVignetteEnabled && (
                  <div
                    className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300"
                    style={{
                      opacity: de,
                      boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.5)",
                    }}
                  />
                )}

                {/* Premium Image element with zoom-drift effect at peak */}
                {/* ponytail: use standard CSS animation-play-state toggled on completion for zoom drift */}
                <div
                  className="w-full h-full transition-all duration-700 ease-out"
                  style={{
                    backgroundImage: `url("${displayImages[idx]}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transform: isHero && de > 0.95 ? "scale(1.05)" : "scale(1)",
                    transition: "transform 4s ease-out-in",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApparatusVelocityDeck;
