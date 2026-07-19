import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { ApparatusDepthSwimProps, DepthSwimImage } from "./types";

gsap.registerPlugin(CustomEase);

try {
  CustomEase.create("vessel", "M0,0 C0.16,1 0.3,1 1,1");
} catch (e) {
  // Already registered
}

const DEFAULT_IMAGES = [
  "/images/components images/scroll/cosmos_1067833670.jpeg",
  "/images/components images/scroll/cosmos_1207399578.jpeg",
  "/images/components images/scroll/cosmos_1215932660.jpeg",
  "/images/components images/scroll/cosmos_1225764898.jpeg",
  "/images/components images/scroll/cosmos_1244425812.jpeg",
  "/images/components images/scroll/cosmos_1292975902.jpeg",
  "/images/components images/scroll/cosmos_1298955025.jpeg",
  "/images/components images/scroll/cosmos_1309660817.jpeg",
  "/images/components images/scroll/cosmos_1452408749.jpeg",
  "/images/components images/scroll/cosmos_1556080729.jpeg",
  "/images/components images/scroll/cosmos_1591705408.jpeg",
  "/images/components images/scroll/cosmos_1633231397.jpeg",
  "/images/components images/scroll/cosmos_169178344.jpeg",
  "/images/components images/scroll/cosmos_1859262512.jpeg",
  "/images/components images/scroll/cosmos_1872135509.jpeg",
  "/images/components images/scroll/cosmos_1994819013.jpeg",
  "/images/components images/scroll/cosmos_2063063057.jpeg",
  "/images/components images/scroll/cosmos_2086495860.jpeg",
  "/images/components images/scroll/cosmos_2093433371.jpeg",
  "/images/components images/scroll/cosmos_362742055.jpeg",
  "/images/components images/scroll/cosmos_496247602.jpeg",
  "/images/components images/scroll/cosmos_51140502.jpeg",
  "/images/components images/scroll/cosmos_51259133.jpeg",
  "/images/components images/scroll/cosmos_520815919.jpeg",
  "/images/components images/scroll/cosmos_524862175.jpeg",
  "/images/components images/scroll/cosmos_553216837.jpeg",
  "/images/components images/scroll/cosmos_586109684.jpeg",
  "/images/components images/scroll/cosmos_641044503.jpeg",
  "/images/components images/scroll/cosmos_664508213.jpeg",
  "/images/components images/scroll/cosmos_666194661.jpeg",
  "/images/components images/scroll/cosmos_679994644.jpeg",
  "/images/components images/scroll/cosmos_861775148.jpeg",
  "/images/components images/scroll/cosmos_961582572.jpeg"
];

const getDeterministicCoords = (index: number, total: number): { x: number; y: number; z: number } => {
  const z = index / (total - 1 || 1);
  
  // 5 columns covering full widescreen width: -40vw to 40vw
  const colIndex = index % 5;
  const baseCols = [-40, -20, 0, 20, 40];
  const baseX = baseCols[colIndex];
  
  // 6 rows covering vertical space: -30vh to 30vh
  const rowIndex = (index * 2) % 6;
  const baseRows = [-30, -18, -6, 6, 18, 30];
  const baseY = baseRows[rowIndex];
  
  // Add subtle deterministic jitter to avoid rigid grid alignment
  // ponytail: subtle jitter to make it look scattered but highly structured
  const jitterX = Math.sin(index * 4.3) * 4; // ±4vw
  const jitterY = Math.cos(index * 2.9) * 3; // ±3vh
  
  const x = baseX + jitterX;
  const y = baseY + jitterY;
  
  return { x, y, z };
};

export const ApparatusDepthSwim: React.FC<ApparatusDepthSwimProps> = ({
  imageSrc,
  images,
  scrollProgress,
  className = "",
  style,
  onLifecycleChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastStateRef = useRef<"idle" | "discovery" | "buildUp" | "peak" | "recovery">("idle");

  // Config States
  const [dropdownOpen, setDropdownOpen] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<"tunnel" | "matrix" | "cinematic" | "micro">("tunnel");
  
  const [smoothFactor, setSmoothFactor] = useState(0.08); // Scroll smoothness level
  const [depthRange, setDepthRange] = useState(1600); // Default: 1600px Z spread
  const [scrollSpeed, setScrollSpeed] = useState(140); // Default: 140 scroll parallax pitch
  const [cursorParallaxPower, setCursorParallaxPower] = useState(40); // Default: 40px shift
  const [maxBlur, setMaxBlur] = useState(18); // Default: 18px DOF blur
  const [cardScale, setCardScale] = useState(1.0); // Default: 1.0 (360px)
  const [hoverTiltMax, setHoverTiltMax] = useState(8); // Default: 8 degrees hover tilt
  const [ambientOpacity, setAmbientOpacity] = useState(0.35); // Default: 0.35 background opacity
  const [ambientBlur, setAmbientBlur] = useState(5); // Default: 5px blur
  const [scrollDirection, setScrollDirection] = useState<"vertical" | "horizontal" | "diagonal" | "creative" | "radial" | "zigzag">("vertical");

  const getVariantDefaults = (variant: "tunnel" | "matrix" | "cinematic" | "micro") => {
    if (variant === "tunnel") {
      return {
        smoothFactor: 0.08,
        depthRange: 1600,
        scrollSpeed: 140,
        cursorParallaxPower: 40,
        maxBlur: 18,
        cardScale: 1.0,
        hoverTiltMax: 8,
        ambientOpacity: 0.35,
        ambientBlur: 5
      };
    }
    if (variant === "matrix") {
      return {
        smoothFactor: 0.10,
        depthRange: 700,
        scrollSpeed: 90,
        cursorParallaxPower: 55,
        maxBlur: 6,
        cardScale: 1.05,
        hoverTiltMax: 14,
        ambientOpacity: 0.20,
        ambientBlur: 40
      };
    }
    if (variant === "cinematic") {
      return {
        smoothFactor: 0.04,
        depthRange: 2400,
        scrollSpeed: 110,
        cursorParallaxPower: 25,
        maxBlur: 32,
        cardScale: 0.85,
        hoverTiltMax: 8,
        ambientOpacity: 0.60,
        ambientBlur: 110
      };
    }
    // micro
    return {
      smoothFactor: 0.08,
      depthRange: 1300,
      scrollSpeed: 70,
      cursorParallaxPower: 30,
      maxBlur: 12,
      cardScale: 0.65,
      hoverTiltMax: 6,
      ambientOpacity: 0.30,
      ambientBlur: 5
    };
  };

  const applyVariant = (variant: "tunnel" | "matrix" | "cinematic" | "micro") => {
    setSelectedVariant(variant);
    const defaults = getVariantDefaults(variant);
    setSmoothFactor(defaults.smoothFactor);
    setDepthRange(defaults.depthRange);
    setScrollSpeed(defaults.scrollSpeed);
    setCursorParallaxPower(defaults.cursorParallaxPower);
    setMaxBlur(defaults.maxBlur);
    setCardScale(defaults.cardScale);
    setHoverTiltMax(defaults.hoverTiltMax);
    setAmbientOpacity(defaults.ambientOpacity);
    setAmbientBlur(defaults.ambientBlur);
    setScrollDirection("vertical");
  };

  const scrollOffsetRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const isScrollingRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const bg1Ref = useRef<HTMLDivElement>(null);
  const bg2Ref = useRef<HTMLDivElement>(null);
  const currentBgToggleRef = useRef(true); // true = bg1 active, false = bg2 active
  const lastActiveIndexRef = useRef<number>(-1);

  const hoveredIndexRef = useRef<number>(-1);
  const hoverProgressRef = useRef<number[]>([]);


  // Global mouse tracking for volumetric parallax field
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMoveGlobal = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    const handleMouseLeaveGlobal = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    container.addEventListener("mousemove", handleMouseMoveGlobal, { passive: true });
    container.addEventListener("mouseleave", handleMouseLeaveGlobal, { passive: true });

    return () => {
      container.removeEventListener("mousemove", handleMouseMoveGlobal);
      container.removeEventListener("mouseleave", handleMouseLeaveGlobal);
    };
  }, []);

  const rawImages = images && images.length > 0
    ? images
    : imageSrc
      ? [imageSrc, ...DEFAULT_IMAGES.slice(1)]
      : DEFAULT_IMAGES;
  const totalCount = rawImages.length;

  // Process images into full DepthSwimImage structures
  const swimItems = React.useMemo<DepthSwimImage[]>(() => {
    return rawImages.map((img, i) => {
      const src = typeof img === "string" ? img : img.src;
      const coords = getDeterministicCoords(i, totalCount);

      // Add a randomized organic offset to each card initialized once on mount
      // ponytail: randomized X/Y offset to prevent predictable patterns
      const randX = (Math.random() - 0.5) * 16; // ±8vw
      const randY = (Math.random() - 0.5) * 14; // ±7vh

      return {
        src,
        x: coords.x + randX,
        y: coords.y + randY,
        z: coords.z
      };
    });
  }, [rawImages, totalCount]);

  // Initialize initial background image
  useEffect(() => {
    if (swimItems.length > 0 && bg1Ref.current) {
      bg1Ref.current.style.backgroundImage = `url("${swimItems[0].src}")`;
      bg1Ref.current.style.opacity = String(ambientOpacity);
      lastActiveIndexRef.current = 0;
    }
  }, [swimItems, ambientOpacity]);

  // Virtual Scroll Mouse/Touch Bindings (fallback if scrollProgress prop is undefined)
  useEffect(() => {
    if (scrollProgress !== undefined) return;

    const handleWheel = (e: WheelEvent) => {
      // scroll camera Z depth (0.0 to 1.0)
      scrollVelocityRef.current = Math.max(-0.06, Math.min(0.06, scrollVelocityRef.current + e.deltaY * 0.00003));
      isScrollingRef.current = true;
    };

    let lastTouchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = lastTouchY - touchY;
      lastTouchY = touchY;

      scrollVelocityRef.current = Math.max(-0.06, Math.min(0.06, scrollVelocityRef.current + deltaY * 0.00006));
      isScrollingRef.current = true;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: true });
      container.addEventListener("touchstart", handleTouchStart, { passive: true });
      container.addEventListener("touchmove", handleTouchMove, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, [scrollProgress]);

  // Sync prop parameters to refs for use inside animation loop
  const smoothRef = useRef(smoothFactor);
  useEffect(() => {
    smoothRef.current = smoothFactor;
  }, [smoothFactor]);

  const depthRangeRef = useRef(depthRange);
  useEffect(() => {
    depthRangeRef.current = depthRange;
  }, [depthRange]);

  const scrollSpeedRef = useRef(scrollSpeed);
  useEffect(() => {
    scrollSpeedRef.current = scrollSpeed;
  }, [scrollSpeed]);

  const cursorParallaxPowerRef = useRef(cursorParallaxPower);
  useEffect(() => {
    cursorParallaxPowerRef.current = cursorParallaxPower;
  }, [cursorParallaxPower]);

  const maxBlurRef = useRef(maxBlur);
  useEffect(() => {
    maxBlurRef.current = maxBlur;
  }, [maxBlur]);

  const ambientOpacityRef = useRef(ambientOpacity);
  useEffect(() => {
    ambientOpacityRef.current = ambientOpacity;
  }, [ambientOpacity]);

  const ambientBlurRef = useRef(ambientBlur);
  useEffect(() => {
    ambientBlurRef.current = ambientBlur;
  }, [ambientBlur]);

  const scrollDirectionRef = useRef(scrollDirection);
  useEffect(() => {
    scrollDirectionRef.current = scrollDirection;
  }, [scrollDirection]);

  if (typeof window !== "undefined") {
    (window as any).depthRangeRef = depthRangeRef;
  }

  // Main animation tick loop
  useGSAP(() => {
    let lastFrameTime = performance.now() / 1000;
    let cameraZ = 0;
    let animFrame: number;

    const tick = () => {
      const now = performance.now() / 1000;
      const dt = Math.min(0.1, now - lastFrameTime);
      lastFrameTime = now;

      const range = 1.0;
      const minZ = -0.35;

      // Lerp mouse positions for smooth springy inertia
      // ponytail: smooth lerping based on frame time delta
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * (1 - Math.pow(1 - 0.08, dt * 60));
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * (1 - Math.pow(1 - 0.08, dt * 60));

      // Update hover progress values with smooth easing
      // ponytail: smooth easing for hover lift states
      for (let i = 0; i < swimItems.length; i++) {
        if (hoverProgressRef.current[i] === undefined) hoverProgressRef.current[i] = 0;
        const target = hoveredIndexRef.current === i ? 1.0 : 0.0;
        hoverProgressRef.current[i] += (target - hoverProgressRef.current[i]) * (1 - Math.pow(1 - 0.1, dt * 60));
      }

      // Calculate cameraZ position
      if (scrollProgress !== undefined) {
        // Direct sync with page scroll progress
        const targetZ = scrollProgress;
        cameraZ += (targetZ - cameraZ) * (1 - Math.pow(1 - smoothRef.current, dt * 60));
      } else {
        // Fallback virtual physics velocity scroll (infinite loop wrap)
        const friction = 1.0 - smoothRef.current;
        scrollOffsetRef.current = (scrollOffsetRef.current + scrollVelocityRef.current + 1.0) % 1.0;
        scrollVelocityRef.current *= Math.pow(friction, dt * 60);
        cameraZ = scrollOffsetRef.current;

        // Reset scroll state
        if (Math.abs(scrollVelocityRef.current) < 0.0001) {
          isScrollingRef.current = false;
        }
      }

      // Update transforms of each scattered card
      for (let i = 0; i < swimItems.length; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;

        const item = swimItems[i];
        
        // Map cameraZ: when scrollProgress is provided, map [0, 1] to [-0.15, 1.15]
        const adjustedCameraZ = scrollProgress !== undefined
          ? scrollProgress * 1.3 - 0.15
          : cameraZ;

        let relativeZ = item.z - adjustedCameraZ;

        // Infinite Z wrap: cards wrap seamlessly when out of view
        // ponytail: wrap relativeZ to stay in a continuous range [-0.35, 0.65]
        relativeZ = ((relativeZ - minZ) % range + range) % range + minZ;

        const hoverProgress = hoverProgressRef.current[i] || 0;

        // Perspective-correct translateZ
        const baseTranslateZ = relativeZ * -depthRangeRef.current;
        const hoverZOffset = hoverProgress * 40; // lift card 40px closer on hover
        const translateZ = baseTranslateZ + hoverZOffset;
        
        // Depth-of-field blur (decreased to 0 on hover)
        const baseBlur = Math.min(maxBlurRef.current, Math.abs(relativeZ) * (maxBlurRef.current * 1.25));
        const blur = baseBlur * (1 - hoverProgress);
        
        // Depth-based scroll parallax factor: closer cards (low z) scroll faster
        // ponytail: closer cards (z=0) scroll faster, distant cards (z=1) scroll slower
        const parallaxFactor = 1.5 - item.z * 0.8;
        const scrollAmount = relativeZ * scrollSpeedRef.current * parallaxFactor;
        
        let finalX = item.x;
        let finalY = item.y;

        const direction = scrollDirectionRef.current;
        if (direction === "vertical") {
          finalY = item.y + scrollAmount;
        } else if (direction === "horizontal") {
          finalX = item.x + scrollAmount;
        } else if (direction === "diagonal") {
          finalX = item.x + scrollAmount * 0.7;
          finalY = item.y + scrollAmount * 0.7;
        } else if (direction === "creative") {
          // Vortex spiral rotation + expansion
          const baseAngle = Math.atan2(item.y, item.x);
          const baseDist = Math.sqrt(item.x * item.x + item.y * item.y);
          const rotationAngle = relativeZ * Math.PI * 0.6; // rotation based on Z depth position
          const expansionFactor = 1.0 + relativeZ * 0.3;
          
          const angle = baseAngle + rotationAngle;
          const dist = baseDist * expansionFactor;
          
          finalX = Math.cos(angle) * dist;
          finalY = Math.sin(angle) * dist;
        } else if (direction === "radial") {
          // Radial explosion outward along card's angle
          const angle = Math.atan2(item.y, item.x);
          finalX = item.x + Math.cos(angle) * scrollAmount * 0.6;
          finalY = item.y + Math.sin(angle) * scrollAmount * 0.6;
        } else if (direction === "zigzag") {
          // Criss-cross diagonal lanes
          const zigzagFactor = i % 2 === 0 ? 0.6 : -0.6;
          finalX = item.x + scrollAmount * zigzagFactor;
          finalY = item.y + scrollAmount * 0.75;
        }

        // Dynamic opacity fade:
        // approaching: fades in from distance 0.5 to 0.0
        // departing: fades out as it moves towards the top of the screen
        let opacity = 0;
        if (relativeZ > 0) {
          opacity = Math.max(0, 1.0 - relativeZ * 2.0);
        } else {
          if (direction === "vertical" || direction === "diagonal" || direction === "zigzag") {
            // ponytail: fade based on Y coordinate to ensure all cards fade at screen top
            const fadeStart = -12; // starts fading at -12vh
            const fadeEnd = -42; // fully invisible at -42vh
            const yProgress = Math.max(0, Math.min(1.0, (finalY - fadeStart) / (fadeEnd - fadeStart)));
            opacity = (1.0 - yProgress) * Math.max(0, 1.0 - Math.abs(relativeZ) * 3.3);
          } else if (direction === "horizontal") {
            // For horizontal, fade out as they depart left
            const fadeStart = -20; // starts fading at -20vw
            const fadeEnd = -50; // fully invisible at -50vw
            const xProgress = Math.max(0, Math.min(1.0, (finalX - fadeStart) / (fadeEnd - fadeStart)));
            opacity = (1.0 - xProgress) * Math.max(0, 1.0 - Math.abs(relativeZ) * 3.3);
          } else {
            // For creative / radial, fade out purely based on relativeZ
            opacity = Math.max(0, 1.0 - Math.abs(relativeZ) * 3.3);
          }
        }
        
        // zIndex layer stacking
        const zIndexVal = Math.round(1000 - relativeZ * 1000);

        // Volumetric cursor parallax offset: closer cards shift more to cursor position
        const mouseParallaxFactor = (1.5 - item.z) * cursorParallaxPowerRef.current;
        const mouseShiftX = mouseRef.current.x * mouseParallaxFactor;
        const mouseShiftY = mouseRef.current.y * mouseParallaxFactor;

        // Apply transformations
        el.style.transform = `translate3d(calc(-50% + ${finalX}vw + ${mouseShiftX}px), calc(-50% + ${finalY}vh + ${mouseShiftY}px), ${translateZ}px)`;
        el.style.filter = `blur(${blur}px)`;
        el.style.opacity = `${opacity}`;
        el.style.zIndex = `${zIndexVal}`;

        // ponytail: scroll-based parallax on image inside frame
        const img = el.querySelector("img");
        if (img) {
          const imgY = Math.max(-22, Math.min(22, relativeZ * -55));
          img.style.transform = `scale(1.2) translateY(${imgY}px)`;
        }
      }

      // Calculate current active image and active state
      let activeIndex = 0;
      let minDistance = 999;
      for (let i = 0; i < swimItems.length; i++) {
        const adjustedCameraZ = scrollProgress !== undefined
          ? scrollProgress * 1.3 - 0.15
          : cameraZ;
        let relativeZ = swimItems[i].z - adjustedCameraZ;
        relativeZ = ((relativeZ - minZ) % range + range) % range + minZ;
        const dist = Math.abs(relativeZ);
        if (dist < minDistance) {
          minDistance = dist;
          activeIndex = i;
        }
      }

      // Handle ambient background crossfade
      if (activeIndex !== lastActiveIndexRef.current && swimItems[activeIndex]) {
        lastActiveIndexRef.current = activeIndex;
        const newSrc = swimItems[activeIndex].src;
        const bg1 = bg1Ref.current;
        const bg2 = bg2Ref.current;
        if (bg1 && bg2) {
          if (currentBgToggleRef.current) {
            // Fade out bg1, fade in bg2
            bg2.style.backgroundImage = `url("${newSrc}")`;
            gsap.to(bg2, { opacity: ambientOpacityRef.current, duration: 1.2, ease: "power2.out", overwrite: "auto" });
            gsap.to(bg1, { opacity: 0, duration: 1.2, ease: "power2.out", overwrite: "auto" });
          } else {
            // Fade out bg2, fade in bg1
            bg1.style.backgroundImage = `url("${newSrc}")`;
            gsap.to(bg1, { opacity: ambientOpacityRef.current, duration: 1.2, ease: "power2.out", overwrite: "auto" });
            gsap.to(bg2, { opacity: 0, duration: 1.2, ease: "power2.out", overwrite: "auto" });
          }
          currentBgToggleRef.current = !currentBgToggleRef.current;
        }
      }

      let state: "idle" | "discovery" | "buildUp" | "peak" | "recovery" = "idle";
      const isMoving = scrollProgress !== undefined 
        ? Math.abs(cameraZ - scrollOffsetRef.current) > 0.001 
        : isScrollingRef.current;

      if (scrollProgress !== undefined) {
        scrollOffsetRef.current = cameraZ;
      }

      if (!isMoving) {
        state = "idle";
      } else {
        const adjustedCameraZ = scrollProgress !== undefined
          ? scrollProgress * 1.3 - 0.15
          : cameraZ;
        const relativeZ = swimItems[activeIndex].z - adjustedCameraZ;
        if (Math.abs(relativeZ) <= 0.08) {
          state = "peak";
        } else if (relativeZ > 0.08) {
          state = "buildUp";
        } else {
          state = "recovery";
        }
      }

      if (state !== lastStateRef.current) {
        lastStateRef.current = state;
        onLifecycleChange?.(state);
      }

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [swimItems, scrollProgress]);

  // Dynamic cursor parallax tilt on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const el = innerRefs.current[idx];
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

    gsap.to(el, {
      rotateX: -y * hoverTiltMax,
      rotateY: x * hoverTiltMax,
      duration: 0.35,
      ease: "vessel",
      overwrite: "auto"
    });
  };

  const handleMouseLeave = (idx: number) => {
    const el = innerRefs.current[idx];
    if (!el) return;

    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "vessel",
      overwrite: "auto"
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-[#070708] overflow-hidden select-none ${className}`}
      style={style}
    >
      {/* Ambient Volumetric Background Bleed */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div
          ref={bg1Ref}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            opacity: 0,
            filter: `blur(${ambientBlur}px) saturate(140%) brightness(35%)`,
            transform: "scale(1.15)",
            willChange: "opacity"
          }}
        />
        <div
          ref={bg2Ref}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            opacity: 0,
            filter: `blur(${ambientBlur}px) saturate(140%) brightness(35%)`,
            transform: "scale(1.15)",
            willChange: "opacity"
          }}
        />
        <div className="absolute inset-0 w-full h-full bg-black/40" />
      </div>

      {/* Scattered Parallax Cards */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center [perspective:1000px] [transform-style:preserve-3d] pointer-events-none z-10">
        {swimItems.map((item, idx) => (
          <div
            key={idx}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            className="absolute left-1/2 top-1/2 pointer-events-auto origin-center"
            style={{
              width: `${360 * cardScale}px`,
              aspectRatio: "16/10",
              willChange: "transform, opacity, filter"
            }}
          >
            {/* 3D Inner Wrapper for cursor interactive tilt */}
            <div
              ref={(el) => {
                innerRefs.current[idx] = el;
              }}
              onMouseEnter={() => {
                hoveredIndexRef.current = idx;
              }}
              onMouseMove={(e) => handleMouseMove(e, idx)}
              onMouseLeave={() => {
                hoveredIndexRef.current = -1;
                handleMouseLeave(idx);
              }}
              className="w-full h-full origin-center border border-white/5 bg-neutral-900 overflow-hidden cursor-crosshair [transform-style:preserve-3d]"
              style={{
                willChange: "transform"
              }}
            >
              <img
                src={item.src}
                alt={`Specimen ${idx + 1}`}
                className="w-full h-full object-cover pointer-events-none select-none"
                style={{
                  filter: "grayscale(15%) contrast(100%) brightness(95%)",
                  transform: "scale(1.2)", // ponytail: scale up for scroll parallax bleed
                  willChange: "transform"
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Global Presets Panel (Virtual control overlay positioned on the right) */}
      <div
        className="absolute z-[9999] pointer-events-auto"
        style={{
          top: "24px",
          right: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
          zIndex: 9999
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="abyss-controls-trigger"
        >
          <span>Depth Controls</span>
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
          <div className="abyss-controls-panel">
            {(() => {
              const defaults = getVariantDefaults(selectedVariant);
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Variant Selector */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase">
                      Layout Preset Variant
                    </span>
                    <select
                      value={selectedVariant}
                      onChange={(e) => applyVariant(e.target.value as any)}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: "4px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "rgba(255, 255, 255, 0.8)",
                        fontFamily: "monospace",
                        fontSize: "9px",
                        outline: "none",
                        cursor: "pointer"
                      }}
                    >
                      <option value="tunnel" style={{ background: "#111" }}>Cosmos Tunnel (Default)</option>
                      <option value="matrix" style={{ background: "#111" }}>Zero-Gravity Matrix</option>
                      <option value="cinematic" style={{ background: "#111" }}>Cinematic Focus</option>
                      <option value="micro" style={{ background: "#111" }}>Micro-Catalog</option>
                    </select>
                  </div>

                  {/* Scroll Direction dropdown */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase">
                      Scroll Direction
                    </span>
                    <select
                      value={scrollDirection}
                      onChange={(e) => setScrollDirection(e.target.value as any)}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: "4px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "rgba(255, 255, 255, 0.8)",
                        fontFamily: "monospace",
                        fontSize: "9px",
                        outline: "none",
                        cursor: "pointer"
                      }}
                    >
                      <option value="vertical" style={{ background: "#111" }}>Vertical (Default)</option>
                      <option value="horizontal" style={{ background: "#111" }}>Horizontal</option>
                      <option value="diagonal" style={{ background: "#111" }}>Diagonal</option>
                      <option value="creative" style={{ background: "#111" }}>Creative (Spiral Vortex)</option>
                      <option value="radial" style={{ background: "#111" }}>Radial (Big Bang)</option>
                      <option value="zigzag" style={{ background: "#111" }}>Zig-Zag (Interlaced)</option>
                    </select>
                  </div>

                  {/* Smoothness slider */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase">
                        Scroll Smoothness
                      </span>
                      <span className="text-[9px] font-mono text-white/50">{smoothFactor}</span>
                    </div>
                    <div style={{ position: "relative", width: "100%", height: "16px", display: "flex", alignItems: "center" }}>
                      <input
                        type="range"
                        min="0.01"
                        max="0.30"
                        step="0.01"
                        value={smoothFactor}
                        onChange={(e) => setSmoothFactor(Number(e.target.value))}
                        style={{
                          width: "100%",
                          margin: 0,
                          background: `linear-gradient(to right, #6ec49a 0%, #6ec49a ${((smoothFactor - 0.01) / 0.29) * 100}%, rgba(255, 255, 255, 0.08) ${((smoothFactor - 0.01) / 0.29) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: `${((defaults.smoothFactor - 0.01) / 0.29) * 100}%`,
                          top: "50%",
                          width: "1.5px",
                          height: "6px",
                          backgroundColor: "rgba(255, 255, 255, 0.45)",
                          pointerEvents: "none",
                          transform: "translate(-50%, -50%)",
                          borderRadius: "0.5px"
                        }}
                      />
                    </div>
                  </div>

                  {/* Depth Intensity slider */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase">
                        Depth Intensity
                      </span>
                      <span className="text-[9px] font-mono text-white/50">{depthRange}px</span>
                    </div>
                    <div style={{ position: "relative", width: "100%", height: "16px", display: "flex", alignItems: "center" }}>
                      <input
                        type="range"
                        min="400"
                        max="2800"
                        step="50"
                        value={depthRange}
                        onChange={(e) => setDepthRange(Number(e.target.value))}
                        style={{
                          width: "100%",
                          margin: 0,
                          background: `linear-gradient(to right, #6ec49a 0%, #6ec49a ${((depthRange - 400) / 2400) * 100}%, rgba(255, 255, 255, 0.08) ${((depthRange - 400) / 2400) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: `${((defaults.depthRange - 400) / 2400) * 100}%`,
                          top: "50%",
                          width: "1.5px",
                          height: "6px",
                          backgroundColor: "rgba(255, 255, 255, 0.45)",
                          pointerEvents: "none",
                          transform: "translate(-50%, -50%)",
                          borderRadius: "0.5px"
                        }}
                      />
                    </div>
                  </div>

                  {/* Scroll Speed slider */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase">
                        Scroll Parallax Speed
                      </span>
                      <span className="text-[9px] font-mono text-white/50">{scrollSpeed}</span>
                    </div>
                    <div style={{ position: "relative", width: "100%", height: "16px", display: "flex", alignItems: "center" }}>
                      <input
                        type="range"
                        min="20"
                        max="300"
                        step="5"
                        value={scrollSpeed}
                        onChange={(e) => setScrollSpeed(Number(e.target.value))}
                        style={{
                          width: "100%",
                          margin: 0,
                          background: `linear-gradient(to right, #6ec49a 0%, #6ec49a ${((scrollSpeed - 20) / 280) * 100}%, rgba(255, 255, 255, 0.08) ${((scrollSpeed - 20) / 280) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: `${((defaults.scrollSpeed - 20) / 280) * 100}%`,
                          top: "50%",
                          width: "1.5px",
                          height: "6px",
                          backgroundColor: "rgba(255, 255, 255, 0.45)",
                          pointerEvents: "none",
                          transform: "translate(-50%, -50%)",
                          borderRadius: "0.5px"
                        }}
                      />
                    </div>
                  </div>

                  {/* Cursor Parallax Power slider */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase">
                        Cursor Parallax
                      </span>
                      <span className="text-[9px] font-mono text-white/50">{cursorParallaxPower}px</span>
                    </div>
                    <div style={{ position: "relative", width: "100%", height: "16px", display: "flex", alignItems: "center" }}>
                      <input
                        type="range"
                        min="0"
                        max="120"
                        step="5"
                        value={cursorParallaxPower}
                        onChange={(e) => setCursorParallaxPower(Number(e.target.value))}
                        style={{
                          width: "100%",
                          margin: 0,
                          background: `linear-gradient(to right, #6ec49a 0%, #6ec49a ${(cursorParallaxPower / 120) * 100}%, rgba(255, 255, 255, 0.08) ${(cursorParallaxPower / 120) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: `${(defaults.cursorParallaxPower / 120) * 100}%`,
                          top: "50%",
                          width: "1.5px",
                          height: "6px",
                          backgroundColor: "rgba(255, 255, 255, 0.45)",
                          pointerEvents: "none",
                          transform: "translate(-50%, -50%)",
                          borderRadius: "0.5px"
                        }}
                      />
                    </div>
                  </div>

                  {/* DOF Blur slider */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase">
                        Depth of Field Blur
                      </span>
                      <span className="text-[9px] font-mono text-white/50">{maxBlur}px</span>
                    </div>
                    <div style={{ position: "relative", width: "100%", height: "16px", display: "flex", alignItems: "center" }}>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        step="2"
                        value={maxBlur}
                        onChange={(e) => setMaxBlur(Number(e.target.value))}
                        style={{
                          width: "100%",
                          margin: 0,
                          background: `linear-gradient(to right, #6ec49a 0%, #6ec49a ${(maxBlur / 40) * 100}%, rgba(255, 255, 255, 0.08) ${(maxBlur / 40) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: `${(defaults.maxBlur / 40) * 100}%`,
                          top: "50%",
                          width: "1.5px",
                          height: "6px",
                          backgroundColor: "rgba(255, 255, 255, 0.45)",
                          pointerEvents: "none",
                          transform: "translate(-50%, -50%)",
                          borderRadius: "0.5px"
                        }}
                      />
                    </div>
                  </div>

                  {/* Card Scale slider */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase">
                        Card Scale
                      </span>
                      <span className="text-[9px] font-mono text-white/50">{cardScale.toFixed(2)}x</span>
                    </div>
                    <div style={{ position: "relative", width: "100%", height: "16px", display: "flex", alignItems: "center" }}>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={cardScale}
                        onChange={(e) => setCardScale(Number(e.target.value))}
                        style={{
                          width: "100%",
                          margin: 0,
                          background: `linear-gradient(to right, #6ec49a 0%, #6ec49a ${((cardScale - 0.5) / 1.0) * 100}%, rgba(255, 255, 255, 0.08) ${((cardScale - 0.5) / 1.0) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: `${((defaults.cardScale - 0.5) / 1.0) * 100}%`,
                          top: "50%",
                          width: "1.5px",
                          height: "6px",
                          backgroundColor: "rgba(255, 255, 255, 0.45)",
                          pointerEvents: "none",
                          transform: "translate(-50%, -50%)",
                          borderRadius: "0.5px"
                        }}
                      />
                    </div>
                  </div>

                  {/* Hover Tilt Max slider */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase">
                        Max Hover Tilt
                      </span>
                      <span className="text-[9px] font-mono text-white/50">{hoverTiltMax}°</span>
                    </div>
                    <div style={{ position: "relative", width: "100%", height: "16px", display: "flex", alignItems: "center" }}>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="1"
                        value={hoverTiltMax}
                        onChange={(e) => setHoverTiltMax(Number(e.target.value))}
                        style={{
                          width: "100%",
                          margin: 0,
                          background: `linear-gradient(to right, #6ec49a 0%, #6ec49a ${(hoverTiltMax / 30) * 100}%, rgba(255, 255, 255, 0.08) ${(hoverTiltMax / 30) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: `${(defaults.hoverTiltMax / 30) * 100}%`,
                          top: "50%",
                          width: "1.5px",
                          height: "6px",
                          backgroundColor: "rgba(255, 255, 255, 0.45)",
                          pointerEvents: "none",
                          transform: "translate(-50%, -50%)",
                          borderRadius: "0.5px"
                        }}
                      />
                    </div>
                  </div>

                  {/* Ambient Background Opacity slider */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase">
                        Ambient Opacity
                      </span>
                      <span className="text-[9px] font-mono text-white/50">{ambientOpacity.toFixed(2)}</span>
                    </div>
                    <div style={{ position: "relative", width: "100%", height: "16px", display: "flex", alignItems: "center" }}>
                      <input
                        type="range"
                        min="0.0"
                        max="0.8"
                        step="0.05"
                        value={ambientOpacity}
                        onChange={(e) => setAmbientOpacity(Number(e.target.value))}
                        style={{
                          width: "100%",
                          margin: 0,
                          background: `linear-gradient(to right, #6ec49a 0%, #6ec49a ${(ambientOpacity / 0.8) * 100}%, rgba(255, 255, 255, 0.08) ${(ambientOpacity / 0.8) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: `${(defaults.ambientOpacity / 0.8) * 100}%`,
                          top: "50%",
                          width: "1.5px",
                          height: "6px",
                          backgroundColor: "rgba(255, 255, 255, 0.45)",
                          pointerEvents: "none",
                          transform: "translate(-50%, -50%)",
                          borderRadius: "0.5px"
                        }}
                      />
                    </div>
                  </div>

                  {/* Ambient Background Blur slider */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span className="text-[9px] font-mono tracking-widest text-white/65 uppercase">
                        Ambient Blur
                      </span>
                      <span className="text-[9px] font-mono text-white/50">{ambientBlur}px</span>
                    </div>
                    <div style={{ position: "relative", width: "100%", height: "16px", display: "flex", alignItems: "center" }}>
                      <input
                        type="range"
                        min="0"
                        max="150"
                        step="5"
                        value={ambientBlur}
                        onChange={(e) => setAmbientBlur(Number(e.target.value))}
                        style={{
                          width: "100%",
                          margin: 0,
                          background: `linear-gradient(to right, #6ec49a 0%, #6ec49a ${(ambientBlur / 150) * 100}%, rgba(255, 255, 255, 0.08) ${(ambientBlur / 150) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: `${(defaults.ambientBlur / 150) * 100}%`,
                          top: "50%",
                          width: "1.5px",
                          height: "6px",
                          backgroundColor: "rgba(255, 255, 255, 0.45)",
                          pointerEvents: "none",
                          transform: "translate(-50%, -50%)",
                          borderRadius: "0.5px"
                        }}
                      />
                    </div>
                  </div>

                  {/* Reset to Defaults button */}
                  <div style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingTop: "10px",
                    marginTop: "4px",
                    display: "flex",
                    justifyContent: "center"
                  }}>
                    <button
                      onClick={() => {
                        applyVariant("tunnel");
                        scrollOffsetRef.current = 0;
                        scrollVelocityRef.current = 0;
                      }}
                      className="py-1.5 px-3 rounded-md text-[9px] font-mono border border-white/10 bg-white/5 text-[#6ec49a] hover:bg-white/10 hover:text-[#5eb389] transition-all select-none cursor-pointer w-full text-center"
                    >
                      Reset to Defaults
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApparatusDepthSwim;
