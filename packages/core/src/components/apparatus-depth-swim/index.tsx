import React, { useEffect, useRef } from "react";
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

export const ApparatusDepthSwim: React.FC<ApparatusDepthSwimProps & {
  selectedVariant?: "tunnel" | "matrix" | "cinematic" | "micro";
  depthRange?: number;
  maxBlur?: number;
  cursorParallaxPower?: number;
  cardScale?: number;
  hoverTiltMax?: number;
  ambientOpacity?: number;
  ambientBlur?: number;
}> = ({
  imageSrc,
  images,
  scrollProgress,
  selectedVariant: propSelectedVariant = "tunnel",
  depthRange: propDepthRange = 1600,
  maxBlur: propMaxBlur = 18,
  cursorParallaxPower: propCursorParallaxPower = 40,
  cardScale: propCardScale = 1.0,
  hoverTiltMax: propHoverTiltMax = 15,
  ambientOpacity: propAmbientOpacity = 0.45,
  ambientBlur: propAmbientBlur = 75,
  className = "",
  style,
  onLifecycleChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastStateRef = useRef<"idle" | "discovery" | "buildUp" | "peak" | "recovery">("idle");

  // Config derived from props
  const variantDefaults = getVariantDefaults(propSelectedVariant);
  const smoothFactor = variantDefaults.smoothFactor;
  const depthRange = propDepthRange;
  const scrollSpeed = variantDefaults.scrollSpeed;
  const cursorParallaxPower = propCursorParallaxPower;
  const maxBlur = propMaxBlur;
  const cardScale = propCardScale;
  const hoverTiltMax = propHoverTiltMax;
  const ambientOpacity = propAmbientOpacity;
  const ambientBlur = propAmbientBlur;
  const scrollDirection = "vertical";





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
              className="w-full h-full origin-center bg-neutral-900 overflow-hidden cursor-crosshair [transform-style:preserve-3d]"
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

    </div>
  );
};

export default ApparatusDepthSwim;
