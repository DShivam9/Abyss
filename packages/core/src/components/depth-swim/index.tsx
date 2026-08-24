import React, { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { ApparatusDepthSwimProps, DepthSwimImage } from "./types";
import { DEFAULT_IMAGES } from "./constants";

gsap.registerPlugin(CustomEase);

try {
  CustomEase.create("vessel", "M0,0 C0.16,1 0.3,1 1,1");
} catch (e) {
  // Already registered
}

// 42-Point Organic Constellation Matrix with Tightened Vertical & Cluster Gaps
const generateOrganicConstellation = (): { x: number; y: number; z: number }[] => {
  const cols = 7;
  const rows = 6;
  const total = cols * rows; // 42
  const coords: { x: number; y: number; z: number }[] = [];

  for (let i = 0; i < total; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const staggerX = r % 2 === 1 ? 6.5 : -6.5;
    const jitterX = Math.sin(i * 3.7 + 1.2) * 1.4;
    const jitterY = Math.cos(i * 2.9 + 0.8) * 1.2;

    const x = -42 + c * 14.0 + staggerX + jitterX;
    const y = -28 + r * 11.2 + (c % 2 === 1 ? 2.2 : -2.2) + jitterY;
    const z = ((i * 13) % total) / total;
    coords.push({ x, y, z });
  }

  return coords;
};

const HONEYCOMB_COORDS = generateOrganicConstellation();

const DEFAULT_CONFIG = {
  smoothFactor: 0.065,
  depthRange: 6500,
  scrollSpeed: 120,
  cursorParallaxPower: 35,
  maxBlur: 14,
  cardScale: 1.0,
  hoverTiltMax: 12,
  ambientOpacity: 0.45,
  ambientBlur: 80
};

export const ApparatusDepthSwim: React.FC<ApparatusDepthSwimProps & {
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
  depthRange: propDepthRange = DEFAULT_CONFIG.depthRange,
  maxBlur: propMaxBlur = DEFAULT_CONFIG.maxBlur,
  cursorParallaxPower: propCursorParallaxPower = DEFAULT_CONFIG.cursorParallaxPower,
  cardScale: propCardScale = DEFAULT_CONFIG.cardScale,
  hoverTiltMax: propHoverTiltMax = DEFAULT_CONFIG.hoverTiltMax,
  ambientOpacity: propAmbientOpacity = DEFAULT_CONFIG.ambientOpacity,
  ambientBlur: propAmbientBlur = DEFAULT_CONFIG.ambientBlur,
  className = "",
  style,
  onLifecycleChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const lastStateRef = useRef<"idle" | "discovery" | "buildUp" | "peak" | "recovery">("idle");

  const depthRange = propDepthRange;
  const cursorParallaxPower = propCursorParallaxPower;
  const maxBlur = propMaxBlur;
  const cardScale = propCardScale;
  const hoverTiltMax = propHoverTiltMax;
  const ambientOpacity = propAmbientOpacity;
  const ambientBlur = propAmbientBlur;

  const targetScrollZRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // 2D Infinite Canvas Pan Drag with Momentum
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const panVelocityRef = useRef({ x: 0, y: 0 });
  const smoothVelocityRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const bg1Ref = useRef<HTMLDivElement>(null);
  const bg2Ref = useRef<HTMLDivElement>(null);
  const currentBgToggleRef = useRef(true);
  const lastActiveIndexRef = useRef<number>(-1);

  const hoveredIndexRef = useRef<number>(-1);
  const hoverProgressRef = useRef<number[]>([]);

  // Smooth mouse tracking for volumetric parallax
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMoveGlobal = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
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

  // Process images into full 42-node organic constellation depth lattice
  const swimItems = useMemo<DepthSwimImage[]>(() => {
    return HONEYCOMB_COORDS.map((coords, i) => {
      const raw = rawImages[i % rawImages.length];
      const src = encodeURI(typeof raw === "string" ? raw : raw.src);
      return {
        src,
        x: coords.x,
        y: coords.y,
        z: coords.z
      };
    });
  }, [rawImages]);

  // Initialize initial background image
  useEffect(() => {
    if (swimItems.length > 0 && bg1Ref.current) {
      bg1Ref.current.style.backgroundImage = `url("${swimItems[0].src}")`;
      bg1Ref.current.style.opacity = String(ambientOpacity);
      lastActiveIndexRef.current = 0;
    }
  }, [swimItems, ambientOpacity]);

  // Silky Spring-Damped Scroll Bindings
  useEffect(() => {
    if (scrollProgress !== undefined) return;

    const handleWheel = (e: WheelEvent) => {
      targetScrollZRef.current += e.deltaY * 0.00045;
    };

    let lastTouchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = lastTouchY - touchY;
      lastTouchY = touchY;
      targetScrollZRef.current += deltaY * 0.00075;
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

  // 2D Omnidirectional Pan Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panVelocityRef.current = { x: 0, y: 0 };
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    panOffsetRef.current.x += dx;
    panOffsetRef.current.y += dy;
    panVelocityRef.current.x = dx * 0.85;
    panVelocityRef.current.y = dy * 0.85;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    if (containerRef.current) {
      try {
        containerRef.current.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Props sync refs
  const depthRangeRef = useRef(depthRange);
  useEffect(() => { depthRangeRef.current = depthRange; }, [depthRange]);

  const cursorParallaxPowerRef = useRef(cursorParallaxPower);
  useEffect(() => { cursorParallaxPowerRef.current = cursorParallaxPower; }, [cursorParallaxPower]);

  const maxBlurRef = useRef(maxBlur);
  useEffect(() => { maxBlurRef.current = maxBlur; }, [maxBlur]);

  const ambientOpacityRef = useRef(ambientOpacity);
  useEffect(() => { ambientOpacityRef.current = ambientOpacity; }, [ambientOpacity]);

  // Main 60FPS Render & Optical Physics Loop
  useGSAP(() => {
    let lastFrameTime = performance.now() / 1000;
    let cameraZ = 0;
    let animFrame: number;

    const handleVisibility = () => {
      lastFrameTime = performance.now() / 1000;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const tick = () => {
      const now = performance.now() / 1000;
      const rawDt = now - lastFrameTime;
      lastFrameTime = now;

      const dt = Math.min(rawDt, 0.033);

      const range = 1.0;
      const minZ = -0.15;

      // Silky mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * (1 - Math.exp(-7.5 * dt));
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * (1 - Math.exp(-7.5 * dt));

      // Hover progress per tile
      for (let i = 0; i < swimItems.length; i++) {
        if (hoverProgressRef.current[i] === undefined) hoverProgressRef.current[i] = 0;
        const target = hoveredIndexRef.current === i ? 1.0 : 0.0;
        hoverProgressRef.current[i] += (target - hoverProgressRef.current[i]) * (1 - Math.exp(-9.0 * dt));
      }

      // Camera Z calculation with continuous spring damping
      if (scrollProgress !== undefined) {
        cameraZ += (scrollProgress - cameraZ) * (1 - Math.exp(-9.0 * dt));
      } else {
        cameraZ += (targetScrollZRef.current - cameraZ) * (1 - Math.exp(-6.5 * dt));
      }

      // Dynamic Active Lead Card Tracking
      let activeIndex = 0;
      let minFocalDist = 999;

      // 2D Omnidirectional pan velocity inertia decay & silky velocity smoothing
      smoothVelocityRef.current.x += (panVelocityRef.current.x - smoothVelocityRef.current.x) * (1 - Math.exp(-14.0 * dt));
      smoothVelocityRef.current.y += (panVelocityRef.current.y - smoothVelocityRef.current.y) * (1 - Math.exp(-14.0 * dt));

      if (!isDraggingRef.current) {
        panOffsetRef.current.x += panVelocityRef.current.x;
        panOffsetRef.current.y += panVelocityRef.current.y;
        panVelocityRef.current.x *= Math.exp(-3.2 * dt);
        panVelocityRef.current.y *= Math.exp(-3.2 * dt);
      }

      // Update transforms of each card in 3D perspective space
      for (let i = 0; i < swimItems.length; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;

        const item = swimItems[i];
        const adjustedCameraZ = scrollProgress !== undefined ? scrollProgress * 1.25 - 0.08 : cameraZ;

        let relativeZ = item.z - adjustedCameraZ;
        relativeZ = ((relativeZ - minZ) % range + range) % range + minZ;

        // Dynamic infinite image swap when wrapped in complete invisible void
        const img = imgRefs.current[i];
        if (img && (relativeZ > 0.80 || relativeZ < -0.12)) {
          const cycle = Math.floor(cameraZ - item.z + 0.5);
          const nextRaw = rawImages[Math.abs(i + cycle * 42) % rawImages.length];
          const nextSrc = encodeURI(typeof nextRaw === "string" ? nextRaw : nextRaw.src);
          if (img.getAttribute("data-src") !== nextSrc) {
            img.setAttribute("data-src", nextSrc);
            img.src = nextSrc;
            item.src = nextSrc;
          }
        }

        // Track closest item to optical sweet spot (0.10 ahead of camera)
        const focalDist = Math.abs(relativeZ - 0.10);
        if (focalDist < minFocalDist) {
          minFocalDist = focalDist;
          activeIndex = i;
        }

        const hoverProgress = hoverProgressRef.current[i] || 0;

        // Perspective translate Z
        const baseTranslateZ = relativeZ * -depthRangeRef.current;
        const hoverZOffset = hoverProgress * 80;
        const translateZ = baseTranslateZ + hoverZOffset;

        // Optical Focal Sharpness & Smoothstep Z-Depth Envelopes (Zero Z-Popping)
        let opacity = 1.0;
        let blurPx = 0;
        let brightness = 1.0;
        let saturation = 1.1;

        if (relativeZ > 0.15) {
          // Distant field lighting attenuation
          const depthDist = Math.min(1.0, (relativeZ - 0.15) / 0.70);
          blurPx = Math.min(1.5, depthDist * 1.5);
          brightness = Math.max(0.45, 1.0 - depthDist * 0.55);
          saturation = Math.max(0.70, 1.1 - depthDist * 0.40);

          if (relativeZ > 0.55) {
            // Smooth horizon fade to EXACT 0.0 at Z=0.85
            const horizonT = Math.min(1.0, (relativeZ - 0.55) / 0.30);
            const smoothT = horizonT * horizonT * (3 - 2 * horizonT);
            opacity = Math.max(0, 1.0 - smoothT);
          } else {
            // Mid-distant visibility
            opacity = Math.max(0.70, 1.0 - depthDist * 0.30);
          }
        } else if (relativeZ < -0.02) {
          // Near-camera fly-by exit: smooth fade to EXACT 0.0 at Z=-0.15
          const nearT = Math.min(1.0, (-0.02 - relativeZ) / 0.13);
          const smoothT = nearT * nearT * (3 - 2 * nearT);
          opacity = Math.max(0, 1.0 - smoothT);
          blurPx = Math.min(4.0, nearT * 4.0);
        } else {
          // Crisp focal sweet spot
          opacity = 1.0;
          blurPx = 0;
          brightness = 1.0;
          saturation = 1.1;
        }

        const winW = window.innerWidth;
        const winH = window.innerHeight;

        // True 2D Orthogonal Pan Translation (Decoupled from Z-depth so scroll never drifts sideways)
        const panShiftX = panOffsetRef.current.x;
        const panShiftY = panOffsetRef.current.y;

        // Seamless 2D Toroidal Wrapping (1.35x field domain)
        const fieldW = winW * 1.35;
        const minFieldX = -fieldW / 2;
        const rawX = (winW * item.x) / 100 + panShiftX;
        const wrappedX = ((rawX - minFieldX) % fieldW + fieldW) % fieldW + minFieldX;

        const fieldH = winH * 1.35;
        const minFieldY = -fieldH / 2;
        const rawY = (winH * item.y) / 100 + panShiftY;
        const wrappedY = ((rawY - minFieldY) % fieldH + fieldH) % fieldH + minFieldY;

        // Smooth 2D Edge-Fade Envelope
        const normEdgeX = Math.abs(wrappedX) / (fieldW * 0.5);
        const edgeFadeX = normEdgeX > 0.82 ? Math.max(0, 1.0 - (normEdgeX - 0.82) / 0.18) : 1.0;

        const normEdgeY = Math.abs(wrappedY) / (fieldH * 0.5);
        const edgeFadeY = normEdgeY > 0.82 ? Math.max(0, 1.0 - (normEdgeY - 0.82) / 0.18) : 1.0;

        opacity *= (edgeFadeX * edgeFadeY);

        if (opacity <= 0.005) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          continue;
        }

        // Volumetric cursor parallax
        const mouseParallaxFactor = (1.4 - item.z) * cursorParallaxPowerRef.current;
        const mouseShiftX = mouseRef.current.x * mouseParallaxFactor;
        const mouseShiftY = mouseRef.current.y * mouseParallaxFactor;

        // Zero-G harmonic breathing wave
        const floatY = Math.sin(now * 1.4 + i * 0.8) * 3.5;
        const floatX = Math.cos(now * 1.1 + i * 0.6) * 2.8;

        const posX = wrappedX + mouseShiftX + floatX;
        const posY = wrappedY + mouseShiftY + floatY;

        // Static Outward Convex Optical Lens (Calibrated Golden Sweet Spot)
        const screenNormX = posX / (winW * 0.5); // -1.0 on left edge, 0 at center, +1.0 on right edge
        const screenNormY = posY / (winH * 0.5); // -1.0 on top edge, 0 at center, +1.0 on bottom edge

        // Calibrated outward convex orientation angles (distinct curve, zero distortion)
        const curvedYaw = screenNormX * 18.0; // right cards face outward right (max ~18 deg)
        const curvedPitch = -screenNormY * 11.0; // top cards face outward up (max ~11 deg)

        // Refined convex dome depth recession
        const distSq = Math.min(2.0, screenNormX * screenNormX + screenNormY * screenNormY);
        const curvedPosZ = -distSq * 65;

        const finalTranslateZ = translateZ + curvedPosZ;

        // Apply hardware GPU transform with straight linear Z-depth flight & calibrated convex lens
        el.style.transform = `translate3d(${posX.toFixed(1)}px, ${posY.toFixed(1)}px, ${finalTranslateZ.toFixed(1)}px) rotateX(${curvedPitch.toFixed(1)}deg) rotateY(${curvedYaw.toFixed(1)}deg)`;
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = blurPx > 0.4
          ? `blur(${blurPx.toFixed(1)}px) brightness(${brightness.toFixed(2)}) saturate(${saturation.toFixed(2)})`
          : `brightness(${brightness.toFixed(2)}) saturate(${saturation.toFixed(2)})`;
        el.style.pointerEvents = opacity > 0.6 ? "auto" : "none";
      }

      // Dynamic Active Lead Card Background Cross-Fade
      if (activeIndex !== lastActiveIndexRef.current && swimItems[activeIndex]) {
        lastActiveIndexRef.current = activeIndex;
        const newSrc = swimItems[activeIndex].src;
        const bg1 = bg1Ref.current;
        const bg2 = bg2Ref.current;
        if (bg1 && bg2) {
          if (currentBgToggleRef.current) {
            bg2.style.backgroundImage = `url("${newSrc}")`;
            gsap.to(bg2, { opacity: ambientOpacityRef.current, duration: 1.4, ease: "power2.out", overwrite: "auto" });
            gsap.to(bg1, { opacity: 0, duration: 1.4, ease: "power2.out", overwrite: "auto" });
          } else {
            bg1.style.backgroundImage = `url("${newSrc}")`;
            gsap.to(bg1, { opacity: ambientOpacityRef.current, duration: 1.4, ease: "power2.out", overwrite: "auto" });
            gsap.to(bg2, { opacity: 0, duration: 1.4, ease: "power2.out", overwrite: "auto" });
          }
          currentBgToggleRef.current = !currentBgToggleRef.current;
        }
      }

      let state: "idle" | "discovery" | "buildUp" | "peak" | "recovery" = "idle";
      const isMoving = Math.abs(targetScrollZRef.current - cameraZ) > 0.0005 || isDraggingRef.current;

      if (!isMoving) {
        state = "idle";
      } else {
        const adjustedCameraZ = scrollProgress !== undefined ? scrollProgress * 1.25 - 0.12 : cameraZ;
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
    return () => {
      cancelAnimationFrame(animFrame);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [swimItems, scrollProgress, rawImages]);

  // Dynamic cursor parallax tilt on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const el = innerRefs.current[idx];
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full h-full bg-[#050507] overflow-hidden select-none cursor-grab active:cursor-grabbing touch-none ${className}`}
      style={style}
    >
      {/* Dynamic Ambient Hero Lead Card Atmosphere */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div
          ref={bg1Ref}
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 ease-out"
          style={{
            opacity: 0,
            filter: `blur(${ambientBlur}px) saturate(160%) brightness(32%)`,
            transform: "scale(1.2)",
            willChange: "opacity"
          }}
        />
        <div
          ref={bg2Ref}
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 ease-out"
          style={{
            opacity: 0,
            filter: `blur(${ambientBlur}px) saturate(160%) brightness(32%)`,
            transform: "scale(1.2)",
            willChange: "opacity"
          }}
        />
        {/* Cinematic Deep Space Vignette */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(5,5,7,0.15) 0%, rgba(5,5,7,0.75) 75%, rgba(5,5,7,0.98) 100%)"
          }}
        />
      </div>

      {/* 3D Depth Field */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center [perspective:1200px] [transform-style:preserve-3d] pointer-events-none z-10">
        {swimItems.map((item, idx) => (
          <div
            key={idx}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            className="absolute left-1/2 top-1/2 pointer-events-auto origin-center"
            style={{
              width: `${300 * cardScale}px`,
              aspectRatio: "16/10",
              willChange: "transform, opacity, filter"
            }}
          >
            {/* 3D Inner Card with glass highlight & drop-shadow */}
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
              className="group relative w-full h-full origin-center rounded-xl bg-neutral-900 overflow-hidden cursor-crosshair [transform-style:preserve-3d] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.85)] transition-shadow duration-300 hover:border-white/25 hover:shadow-[0_30px_70px_rgba(0,0,0,0.95)]"
              style={{
                willChange: "transform"
              }}
            >
              <img
                ref={(el) => {
                  imgRefs.current[idx] = el;
                }}
                src={item.src}
                data-src={item.src}
                alt={`Specimen ${idx + 1}`}
                className="w-full h-full object-cover pointer-events-none select-none"
                style={{
                  filter: "contrast(106%) brightness(100%) saturate(110%)"
                }}
              />
              {/* Subtle glass rim highlight reflection */}
              <div className="absolute inset-0 rounded-xl pointer-events-none border border-white/15 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApparatusDepthSwim;
