import React, { useRef, useState, useMemo, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ApparatusImageSnakeTrailProps,
  CollectibleData,
  BodySegment,
  RippleImpulse,
} from "./types";
import {
  MIXED_FOOD_POOL,
  SVG_COLOR_FILTERS,
  WORLD_CENTER,
  WRAP_SPAN,
} from "./constants";

export const ApparatusImageSnakeTrail: React.FC<ApparatusImageSnakeTrailProps> = ({
  images = [],
  worldSize = 12000,
  initialLength = 5,
  collectibleCount = 60,
  segmentSize = 160,
  speed = 220,
  damping = 0.15,
  stepDistance = 40,
  zoom = 1.0,
  className = "",
  style,
  onLifecycleChange,
  onControlChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldLayerRef = useRef<HTMLDivElement>(null);

  const pool = useMemo(() => (images.length > 0 ? images : MIXED_FOOD_POOL), [images]);

  // Ref to hold onControlChange callback
  const onControlChangeRef = useRef(onControlChange);
  onControlChangeRef.current = onControlChange;

  // Keep props hot-ref updated for seamless ticker reading
  const propsRef = useRef({
    worldSize,
    speed,
    damping,
    stepDistance,
    segmentSize,
    zoom,
  });
  propsRef.current = {
    worldSize,
    speed,
    damping,
    stepDistance,
    segmentSize,
    zoom,
  };

  // Inertia-damped zoom refs
  const targetZoomRef = useRef<number>(zoom);
  const smoothZoomRef = useRef<number>(zoom);

  // Sync zoom prop change from Tuning Inspector slider
  useEffect(() => {
    targetZoomRef.current = Math.max(0.45, Math.min(1.35, zoom));
  }, [zoom]);

  // Reactive state for segment list (with locked colorFilter per segment)
  const [snakeBody, setSnakeBody] = useState<BodySegment[]>(() => {
    const initial: BodySegment[] = [];
    const now = Date.now();
    for (let i = 0; i < initialLength; i++) {
      const src = pool[i % pool.length];
      const isSvg = src.endsWith(".svg");
      initial.push({
        id: `seg-init-${i}-${now}`,
        src,
        colorFilter: isSvg ? SVG_COLOR_FILTERS[i % SVG_COLOR_FILTERS.length] : undefined,
      });
    }
    return initial;
  });

  // Sync initialLength changes from controls
  useEffect(() => {
    setSnakeBody((prev) => {
      if (prev.length === initialLength) return prev;
      if (prev.length < initialLength) {
        const added: BodySegment[] = [];
        const now = Date.now();
        for (let i = prev.length; i < initialLength; i++) {
          const src = pool[i % pool.length];
          const isSvg = src.endsWith(".svg");
          added.push({
            id: `seg-ctrl-${i}-${now}`,
            src,
            colorFilter: isSvg ? SVG_COLOR_FILTERS[i % SVG_COLOR_FILTERS.length] : undefined,
          });
        }
        return [...prev, ...added];
      }
      return prev.slice(0, initialLength);
    });
  }, [initialLength, pool]);

  // Collectible items state (with permanent locked colorFilter per item)
  const [collectibles, setCollectibles] = useState<CollectibleData[]>([]);

  useEffect(() => {
    setCollectibles((prev) => {
      const updated: CollectibleData[] = [];
      const now = Date.now();

      for (let i = 0; i < collectibleCount; i++) {
        if (prev[i]) {
          updated.push(prev[i]);
        } else {
          const src = pool[i % pool.length];
          const isSvg = src.endsWith(".svg");
          updated.push({
            id: `food-${i}-${now}-${Math.random()}`,
            x: WORLD_CENTER + (Math.random() - 0.5) * WRAP_SPAN,
            y: WORLD_CENTER + (Math.random() - 0.5) * WRAP_SPAN,
            src,
            floatOffset: Math.random() * Math.PI * 2,
            colorFilter: isSvg ? SVG_COLOR_FILTERS[i % SVG_COLOR_FILTERS.length] : undefined,
          });
        }
      }
      return updated.slice(0, collectibleCount);
    });
  }, [collectibleCount, pool]);

  // DOM node refs
  const segmentsRef = useRef<(HTMLElement | null)[]>([]);
  const collectiblesRef = useRef<(HTMLElement | null)[]>([]);

  // Ref tracking physics state
  const snakeBodyRef = useRef<BodySegment[]>(snakeBody);
  snakeBodyRef.current = snakeBody;

  const collectiblesRefData = useRef<CollectibleData[]>(collectibles);
  collectiblesRefData.current = collectibles;

  // Persistent physics position refs & active shockwave ripples
  const headPosRef = useRef({ x: WORLD_CENTER, y: WORLD_CENTER });
  const camPosRef = useRef({ x: WORLD_CENTER - 960, y: WORLD_CENTER - 540 });
  const mouseOffsetRef = useRef({ x: 0, y: 0 });
  const bodyPositionsRef = useRef<{ x: number; y: number }[]>([]);
  const activeRipplesRef = useRef<RippleImpulse[]>([]);
  const lastEatTimeRef = useRef<number>(0);

  // Maintain position array size matching maximum body capacity
  if (bodyPositionsRef.current.length < 60) {
    const currentLen = bodyPositionsRef.current.length;
    for (let i = currentLen; i < 60; i++) {
      bodyPositionsRef.current.push({
        x: WORLD_CENTER,
        y: WORLD_CENTER,
      });
    }
  }

  useGSAP(() => {
    if (!containerRef.current || !worldLayerRef.current) return;

    let hasStarted = false;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      mouseOffsetRef.current.x = e.clientX - rect.left - centerX;
      mouseOffsetRef.current.y = e.clientY - rect.top - centerY;

      if (!hasStarted) {
        hasStarted = true;
        onLifecycleChange?.("discovery");
        onLifecycleChange?.("buildUp");
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomChange = e.deltaY * -0.0008;
      const nextZoom = Math.max(0.45, Math.min(1.35, targetZoomRef.current + zoomChange));
      targetZoomRef.current = nextZoom;

      if (onControlChangeRef.current) {
        onControlChangeRef.current("zoom", Number(nextZoom.toFixed(2)));
      }
    };

    const containerEl = containerRef.current;
    window.addEventListener("pointermove", handlePointerMove);
    containerEl.addEventListener("wheel", handleWheel, { passive: false });

    const updateLoop = (time: number, deltaTime: number) => {
      const {
        speed: curSpeed,
        damping: curDamping,
        stepDistance: curStepDistance,
        segmentSize: curSegmentSize,
      } = propsRef.current;

      const dt = Math.min(deltaTime / 1000, 0.05);
      const dampFactor = 1 - Math.pow(1 - curDamping, dt * 60);

      // Silky inertia-damped smooth zoom interpolation
      smoothZoomRef.current += (targetZoomRef.current - smoothZoomRef.current) * (dampFactor * 0.7);
      const curZoom = Math.max(0.45, Math.min(1.35, smoothZoomRef.current));

      const currentBodyCount = snakeBodyRef.current.length;
      const positions = bodyPositionsRef.current;
      const headPos = headPosRef.current;
      const camPos = camPosRef.current;
      const mouseOffset = mouseOffsetRef.current;

      // Infinite Head Steering (Unbounded)
      const offsetDist = Math.hypot(mouseOffset.x, mouseOffset.y);

      if (offsetDist > 15) {
        const moveDist = Math.min(offsetDist * 1.5, curSpeed) * dt;
        const angle = Math.atan2(mouseOffset.y, mouseOffset.x);

        headPos.x += Math.cos(angle) * moveDist;
        headPos.y += Math.sin(angle) * moveDist;
      }

      positions[0].x += (headPos.x - positions[0].x) * dampFactor;
      positions[0].y += (headPos.y - positions[0].y) * dampFactor;

      // Joint physics for trailing body segments
      for (let i = 1; i < currentBodyCount; i++) {
        const prev = positions[i - 1];
        const curr = positions[i];

        let dx = curr.x - prev.x;
        let dy = curr.y - prev.y;
        let dist = Math.hypot(dx, dy);

        if (dist < 0.001) {
          dx = (i * 0.1) || 0.1;
          dy = 0.1;
          dist = Math.hypot(dx, dy);
        }

        const targetX = prev.x + (dx / dist) * curStepDistance;
        const targetY = prev.y + (dy / dist) * curStepDistance;

        curr.x += (targetX - curr.x) * dampFactor;
        curr.y += (targetY - curr.y) * dampFactor;
      }

      // Viewport dimensions in world space
      let viewWidth = 1920;
      let viewHeight = 1080;

      // Smooth camera tracking centered on head
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        viewWidth = rect.width / curZoom;
        viewHeight = rect.height / curZoom;

        const targetCamX = headPos.x - viewWidth / 2;
        const targetCamY = headPos.y - viewHeight / 2;

        camPos.x += (targetCamX - camPos.x) * dampFactor;
        camPos.y += (targetCamY - camPos.y) * dampFactor;

        // Render tiled dot matrix background on container
        if (containerEl) {
          containerEl.style.backgroundPosition = `${-camPos.x * curZoom}px ${-camPos.y * curZoom}px`;
          containerEl.style.backgroundSize = `${60 * curZoom}px ${60 * curZoom}px`;
        }
      }

      // World layer transform
      gsap.set(worldLayerRef.current, {
        x: -camPos.x * curZoom,
        y: -camPos.y * curZoom,
        scale: curZoom,
        transformOrigin: "0 0",
        force3D: true,
      });

      // Spatial Wrapping & Soft Edge Distance Fade for Food Collectibles
      const activeItems = collectiblesRefData.current;
      const camCenterX = camPos.x + viewWidth / 2;
      const camCenterY = camPos.y + viewHeight / 2;

      for (let idx = 0; idx < activeItems.length; idx++) {
        const item = activeItems[idx];
        const dx = item.x - headPos.x;
        const dy = item.y - headPos.y;

        if (dx > WRAP_SPAN / 2) item.x -= WRAP_SPAN;
        else if (dx < -WRAP_SPAN / 2) item.x += WRAP_SPAN;

        if (dy > WRAP_SPAN / 2) item.y -= WRAP_SPAN;
        else if (dy < -WRAP_SPAN / 2) item.y += WRAP_SPAN;

        const foodEl = collectiblesRef.current[idx];
        if (foodEl) {
          const floatY = Math.sin(time * 2 + item.floatOffset) * 6;

          // Smooth distance-based opacity & scale fade near viewport edges
          const distFromCamX = Math.abs(item.x - camCenterX);
          const distFromCamY = Math.abs(item.y - camCenterY);

          const fadeMarginX = viewWidth * 0.45;
          const fadeMarginY = viewHeight * 0.45;
          const fadeZoneX = viewWidth * 0.15;
          const fadeZoneY = viewHeight * 0.15;

          const opacityX = Math.max(0, Math.min(1, (fadeMarginX + fadeZoneX - distFromCamX) / fadeZoneX));
          const opacityY = Math.max(0, Math.min(1, (fadeMarginY + fadeZoneY - distFromCamY) / fadeZoneY));
          const targetOpacity = Math.min(opacityX, opacityY);
          const targetScale = 0.35 + 0.65 * targetOpacity;

          gsap.set(foodEl, {
            x: item.x - (curSegmentSize * 0.85) / 2,
            y: item.y - (curSegmentSize * 0.85) / 2 + floatY,
            opacity: targetOpacity,
            scale: targetScale,
            force3D: true,
          });
        }
      }

      // Calculate Shockwave Recoil Displacement along trail from Head to Tail
      const activeRipples = activeRipplesRef.current;
      // Filter finished ripples
      activeRipplesRef.current = activeRipples.filter(
        (r) => time - r.startTime < (currentBodyCount + 6) * 0.065
      );

      // Render segment DOM elements with head-to-tail propagating shockwave ripple
      for (let i = 0; i < currentBodyCount; i++) {
        const el = segmentsRef.current[i];
        const pos = positions[i];

        let recoilX = 0;
        let recoilY = 0;
        let scalePulse = 1.0;

        // Calculate push-back impulse from all active ripples for segment i
        for (let r = 0; r < activeRipplesRef.current.length; r++) {
          const ripple = activeRipplesRef.current[r];
          const elapsedTime = time - ripple.startTime;
          // Buttery smooth wave speed: 1 segment index every 65ms
          const waveFrontIndex = elapsedTime / 0.065;
          const nodeDist = Math.abs(i - waveFrontIndex);

          if (nodeDist < 3.5) {
            const gaussianPeak = Math.exp(-nodeDist * nodeDist * 0.45);
            const pushAmt = gaussianPeak * 85; // 85px smooth displacement push-back!
            recoilX += -ripple.dirX * pushAmt;
            recoilY += -ripple.dirY * pushAmt;

            // Silky scale swell as food passes down the spine
            scalePulse += gaussianPeak * 0.28;
          }
        }

        if (el) {
          gsap.set(el, {
            x: pos.x + recoilX - curSegmentSize / 2,
            y: pos.y + recoilY - curSegmentSize / 2,
            scale: scalePulse,
            force3D: true,
          });
        }
      }

      // Collision check with cooldown
      const now = Date.now();
      if (now - lastEatTimeRef.current > 280) {
        for (let idx = 0; idx < activeItems.length; idx++) {
          const item = activeItems[idx];
          const dist = Math.hypot(headPos.x - item.x, headPos.y - item.y);

          if (dist < curSegmentSize * 0.65) {
            lastEatTimeRef.current = now;
            const eatenSrc = item.src;
            const eatenFilter = item.colorFilter;
            const foodEl = collectiblesRef.current[idx];

            // 1. Swallow animation
            if (foodEl) {
              gsap.to(foodEl, {
                scale: 0,
                rotate: 90,
                duration: 0.22,
                ease: "back.in(2)",
              });
            }

            // 2. TRIGGER HEAD-TO-TAIL RECOIL SHOCKWAVE (Propagates down body 0 -> Tail)
            const moveDx = mouseOffset.x;
            const moveDy = mouseOffset.y;
            const moveLen = Math.hypot(moveDx, moveDy) || 1;
            const pushDirX = moveDx / moveLen;
            const pushDirY = moveDy / moveLen;

            activeRipplesRef.current.push({
              startTime: time,
              dirX: pushDirX,
              dirY: pushDirY,
            });

            // 3. Digestive Insertion with locked permanent colorFilter
            const newSeg: BodySegment = {
              id: `seg-eaten-${now}-${Math.random()}`,
              src: eatenSrc,
              colorFilter: eatenFilter,
            };

            // Prepend new position at head position
            positions.splice(0, 0, { x: headPos.x, y: headPos.y });

            setSnakeBody((prev) => (prev.length < 50 ? [newSeg, ...prev] : [newSeg, ...prev.slice(0, 49)]));

            // Reverse rotation pop on new head segment
            setTimeout(() => {
              const newHeadEl = segmentsRef.current[0];
              if (newHeadEl) {
                gsap.fromTo(
                  newHeadEl,
                  { scale: 0, rotate: -90 },
                  { scale: 1, rotate: 0, duration: 0.35, ease: "back.out(2)" }
                );
              }
            }, 15);

            // 4. Respawn eaten collectible around active head area
            setTimeout(() => {
              const newX = headPos.x + (Math.random() - 0.5) * (WRAP_SPAN * 0.8);
              const newY = headPos.y + (Math.random() - 0.5) * (WRAP_SPAN * 0.8);
              const newSrc = pool[Math.floor(Math.random() * pool.length)];
              const isSvg = newSrc.endsWith(".svg");
              const newFilter = isSvg ? SVG_COLOR_FILTERS[Math.floor(Math.random() * SVG_COLOR_FILTERS.length)] : undefined;

              if (foodEl) {
                gsap.set(foodEl, { scale: 1, rotate: 0 });
              }

              setCollectibles((prev) => {
                const updated = [...prev];
                if (updated[idx]) {
                  updated[idx] = {
                    id: `food-${now}-${Math.random()}`,
                    x: newX,
                    y: newY,
                    src: newSrc,
                    floatOffset: Math.random() * Math.PI * 2,
                    colorFilter: newFilter,
                  };
                }
                return updated;
              });
            }, 230);

            onLifecycleChange?.("peak");
            break;
          }
        }
      }
    };

    gsap.ticker.add(updateLoop);

    return () => {
      gsap.ticker.remove(updateLoop);
      window.removeEventListener("pointermove", handlePointerMove);
      containerEl.removeEventListener("wheel", handleWheel);
    };
  }, { scope: containerRef, dependencies: [] });

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#070709] cursor-crosshair select-none ${className}`}
      style={{
        ...style,
        backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.28) 2.5px, transparent 2.5px)",
      }}
    >
      {/* World Canvas Container */}
      <div
        ref={worldLayerRef}
        className="absolute top-0 left-0 w-[12000px] h-[12000px]"
      >
        {/* World Food Collectibles */}
        {collectibles.map((item, idx) => {
          const isSvg = item.src.endsWith(".svg");
          return (
            <img
              key={item.id}
              ref={(el) => {
                collectiblesRef.current[idx] = el;
              }}
              src={item.src}
              alt=""
              draggable={false}
              className={`absolute top-0 left-0 pointer-events-none ${
                isSvg ? "object-contain" : "object-cover shadow-lg"
              }`}
              style={{
                width: `${segmentSize * 0.85}px`,
                height: `${segmentSize * 0.85}px`,
                zIndex: 5,
                filter: isSvg ? item.colorFilter : undefined,
              }}
            />
          );
        })}

        {/* Snake Trail Segments */}
        {snakeBody.map((seg, i) => {
          const isSvg = seg.src.endsWith(".svg");
          const zIndex = 100 - i;
          return (
            <img
              key={seg.id}
              ref={(el) => {
                segmentsRef.current[i] = el;
              }}
              src={seg.src}
              alt=""
              draggable={false}
              className={`absolute top-0 left-0 pointer-events-none ${
                isSvg ? "object-contain" : "object-cover shadow-2xl"
              }`}
              style={{
                width: `${segmentSize}px`,
                height: `${segmentSize}px`,
                zIndex,
                willChange: "transform",
                filter: isSvg ? seg.colorFilter : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ApparatusImageSnakeTrail;
