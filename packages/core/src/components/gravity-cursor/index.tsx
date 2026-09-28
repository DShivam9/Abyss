import { useRef, useEffect, useCallback } from "react";
import { GravityCursorProps } from "./types";
import { usePerformance } from "../../engine/PerformanceProvider";
import { useLatestRef } from "../../hooks/use-latest-ref";
import {
  SHAPE_SVGS,
  BAKED_MAX_ITEMS,
} from "./constants";
import {
  createInitialPool,
  spawnBody,
  releaseTrailBodies,
  updatePhysicsStep,
} from "./physics";

export function GravityCursor({
  gravity = 0.28,
  imageSize = 220,
  zeroGravity = false,
  gravityMode = "normal",
  interactionMode = "hold-drag",
  images,
  className = "",
  style = {},
  onLifecycleChange,
}: GravityCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<DOMRect | null>(null);

  const perf = usePerformance();
  const perfRef = useLatestRef(perf);
  const onLifecycleChangeRef = useLatestRef(onLifecycleChange);

  const currentMode = zeroGravity ? "zero-gravity" : gravityMode;
  const activeMediaList = images && images.length > 0 ? images : SHAPE_SVGS;

  const poolSize = BAKED_MAX_ITEMS;
  const poolRef = useRef(createInitialPool(poolSize, activeMediaList));
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const nextSlotRef = useRef<number>(0);
  const imageIndexRef = useRef<number>(0);
  const zIndexRef = useRef<number>(10);

  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseVelRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const lastSpawnPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastMouseTimeRef = useRef<number>(0);
  const isMouseDownRef = useRef<boolean>(false);
  const isMovingRef = useRef<boolean>(false);

  // Preload and pre-decode all specimen images in background so first mousemove is instantaneous (0ms hitch)
  useEffect(() => {
    if (typeof window === "undefined") return;
    activeMediaList.forEach((src) => {
      const img = new Image();
      img.src = src;
      if ("decode" in img) {
        img.decode().catch(() => {});
      }
    });
  }, [activeMediaList]);

  const updateBounds = useCallback(() => {
    if (containerRef.current) {
      boundsRef.current = containerRef.current.getBoundingClientRect();
    }
  }, []);

  const spawnSingle = useCallback(
    (x: number, y: number) => {
      const isMotionReduced = perfRef.current.reducedMotion;
      const effectivePoolCap = poolRef.current.length;
      const slotIdx = nextSlotRef.current % effectivePoolCap;
      nextSlotRef.current = (nextSlotRef.current + 1) % effectivePoolCap;

      // Follow image pool sequentially: 100% diverse, zero duplicate streaks
      const src = activeMediaList[imageIndexRef.current % activeMediaList.length];
      imageIndexRef.current += 1;
      zIndexRef.current += 1;

      const body = poolRef.current[slotIdx];

      spawnBody(
        body,
        imgRefs.current[slotIdx],
        x,
        y,
        imageSize,
        src,
        zIndexRef.current,
        mouseVelRef.current,
        isMotionReduced
      );

      onLifecycleChangeRef.current?.("buildUp");
    },
    [imageSize, activeMediaList, onLifecycleChangeRef, perfRef]
  );

  // Mouse & interaction listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateBounds();

    const handleResize = () => updateBounds();

    const handleMouseMove = (e: MouseEvent) => {
      if (!boundsRef.current) updateBounds();
      const rect = boundsRef.current!;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const now = performance.now();

      // Guard initial entry or long pause: calibrate cursor position cleanly without false jump or initial lag
      if (lastMouseTimeRef.current === 0 || now - lastMouseTimeRef.current > 350) {
        lastMouseTimeRef.current = now;
        mousePosRef.current = { x, y };
        lastSpawnPosRef.current = { x, y };
        mouseVelRef.current = { vx: 0, vy: 0 };
        isMovingRef.current = true;
        return;
      }

      const dx = x - mousePosRef.current.x;
      const dy = y - mousePosRef.current.y;

      mouseVelRef.current.vx = mouseVelRef.current.vx * 0.4 + dx * 0.6;
      mouseVelRef.current.vy = mouseVelRef.current.vy * 0.4 + dy * 0.6;

      lastMouseTimeRef.current = now;
      mousePosRef.current = { x, y };
      isMovingRef.current = true;

      // Always activate on natural mouse movement
      const deltaSpawnX = x - lastSpawnPosRef.current.x;
      const deltaSpawnY = y - lastSpawnPosRef.current.y;
      const dist = Math.hypot(deltaSpawnX, deltaSpawnY);

      // Generous spacing: lets each specimen card breathe with clear portrait visibility
      const minDistance = Math.max(130, Math.round(imageSize * 0.62));

      if (dist >= minDistance) {
        spawnSingle(x, y);
        lastSpawnPosRef.current = { x, y };
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDownRef.current = true;
      isMovingRef.current = true;
      if (!boundsRef.current) updateBounds();
      const rect = boundsRef.current!;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mousePosRef.current = { x, y };
      lastSpawnPosRef.current = { x, y };
      lastMouseTimeRef.current = performance.now();
      mouseVelRef.current = { vx: 0, vy: 0 };

      spawnSingle(x, y);
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      isMovingRef.current = false;
      releaseTrailBodies(poolRef.current, mouseVelRef.current);
    };

    container.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
    };
  }, [spawnSingle, interactionMode, updateBounds]);

  // Unified animation loop for motion release & dissolve
  useEffect(() => {
    let animId: number;

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);

      const now = performance.now();

      // Check if mouse movement has stopped (> 260ms sweet spot pause)
      if (isMovingRef.current && now - lastMouseTimeRef.current > 260) {
        isMovingRef.current = false;
        releaseTrailBodies(poolRef.current, mouseVelRef.current);
        mouseVelRef.current = { vx: 0, vy: 0 };
      }

      const viewportHeight = boundsRef.current ? boundsRef.current.height : 900;

      updatePhysicsStep({
        pool: poolRef.current,
        imgRefs: imgRefs.current,
        currentMode,
        gravity,
        viewportHeight,
      });
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gravity, currentMode]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen bg-[#060608] overflow-hidden select-none cursor-default ${className}`}
      style={style}
    >
      <div className="absolute bottom-5 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center font-['Syne',sans-serif] z-0 select-none">
        <h1 className="text-4xl md:text-7xl font-extrabold uppercase tracking-tight text-zinc-700/60 drop-shadow-sm">
          {currentMode === "zero-gravity" ? "ZERO GRAVITY" : "GRAVITY CURSOR"}
        </h1>
        <p className="mt-3 font-mono text-xs tracking-[0.3em] text-zinc-500 uppercase">
          JUST MOVE MOUSE
        </p>
      </div>

      {poolRef.current.map((body, i) => (
        <img
          key={i}
          ref={(el) => {
            imgRefs.current[i] = el;
          }}
          src={body.src || activeMediaList[i % activeMediaList.length]}
          decoding="async"
          loading="eager"
          alt=""
          draggable={false}
          className="absolute top-0 left-0 transform-gpu will-change-transform pointer-events-none select-none object-contain"
          style={{
            width: `${imageSize}px`,
            height: "auto",
            opacity: 0,
            filter: "drop-shadow(0 18px 30px rgba(0, 0, 0, 0.7))",
            transform: "translate3d(-9999px, -9999px, 0px)",
          }}
        />
      ))}
    </div>
  );
}

export type { GravityCursorProps };
export default GravityCursor;
