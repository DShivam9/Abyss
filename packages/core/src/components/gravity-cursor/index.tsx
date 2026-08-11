import { useRef, useEffect, useCallback } from "react";
import { VesselComponentProps } from "../../engine/types";

// 20 Vector Shape SVGs
const SHAPE_SVGS = [
  "/images/shapes/Shape%201.svg",
  "/images/shapes/Shape%202.svg",
  "/images/shapes/Shape%203.svg",
  "/images/shapes/Shape%204.svg",
  "/images/shapes/Shape%205.svg",
  "/images/shapes/Shape%206.svg",
  "/images/shapes/Shape%207.svg",
  "/images/shapes/Shape%208.svg",
  "/images/shapes/Shape%209.svg",
  "/images/shapes/Shape%2010.svg",
  "/images/shapes/Shape%2011.svg",
  "/images/shapes/Shape%2012.svg",
  "/images/shapes/Shape%2013.svg",
  "/images/shapes/Shape%2014.svg",
  "/images/shapes/Shape%2015.svg",
  "/images/shapes/Shape%2016.svg",
  "/images/shapes/Shape%2017.svg",
  "/images/shapes/Shape%2018.svg",
  "/images/shapes/Shape%2019.svg",
  "/images/shapes/Shape%2020.svg",
];

// Bright & Hard High-Contrast Colors
const VIBRANT_PALETTE = [
  "#FF0033", // Hard Neon Red
  "#00FF66", // Hard Electric Lime
  "#00E5FF", // Hard Laser Cyan
  "#FF00FF", // Hard Pure Magenta
  "#FFE600", // Hard Solar Yellow
  "#FF5500", // Hard Blaze Orange
  "#9900FF", // Hard Ultra Purple
  "#0066FF", // Hard Electric Blue
  "#FF0080", // Hard Hot Pink
  "#00FFCC", // Hard Bright Turquoise
];

export interface ApparatusGravityCursorProps extends VesselComponentProps {
  gravity?: number; // Gravitational acceleration magnitude (px/frame^2)
  bounceDamping?: number; // Elasticity coefficient (0.1 - 0.95)
  spawnInterval?: number; // Stream spawn throttle in ms (30ms - 150ms)
  imageSize?: number; // Image box width in px (80 - 240)
  maxItems?: number; // Maximum active DOM bodies in memory (10 - 80)
  zeroGravity?: boolean; // Zero-gravity mode flag
  gravityMode?: "normal" | "zero-gravity" | "magnetic-repulsor"; // Gravity physics variant
  interactionMode?: "hold-drag" | "cursor-trail"; // Mouse interaction mode
  repelRadius?: number; // Magnetic repeller field radius in px (150 - 600)
  repelForce?: number; // Repulsion shockwave power multiplier (1.0 - 25.0)
  friction?: number; // Space friction / slide damping (0.80 - 0.99)
}

interface PhysicsBody {
  active: boolean;
  id: number;
  src: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vSpin: number;
  bounces: number;
  opacity: number;
  scale: number;
  settled: boolean;
  settledAge: number;
  age: number;
  maxAge: number;
}

export default function ApparatusGravityCursor({
  gravity = 0.55,
  bounceDamping = 0.62,
  spawnInterval = 55,
  imageSize = 140,
  maxItems = 45,
  zeroGravity = false,
  gravityMode = "normal",
  interactionMode = "hold-drag",
  repelRadius = 350,
  repelForce = 9.2,
  friction = 0.92,
  className = "",
  style = {},
  onLifecycleChange,
}: ApparatusGravityCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<DOMRect | null>(null);

  // Active physics mode
  const currentMode = zeroGravity ? "zero-gravity" : gravityMode;

  // Pre-allocated object pool & DOM ref array (Zero React re-render overhead!)
  const poolSize = Math.max(maxItems, 50);
  const poolRef = useRef<PhysicsBody[]>(
    Array.from({ length: poolSize }, (_, i) => ({
      active: false,
      id: i,
      src: "",
      color: "",
      x: -9999,
      y: -9999,
      vx: 0,
      vy: 0,
      rotation: 0,
      vSpin: 0,
      bounces: 0,
      opacity: 0,
      scale: 0,
      settled: true,
      settledAge: 0,
      age: 0,
      maxAge: 0,
    }))
  );
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nextSlotRef = useRef<number>(0);

  // Mouse & interaction state
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isMouseDownRef = useRef<boolean>(false);
  const lastSpawnTimeRef = useRef<number>(0);

  // Pick next image in pool
  const imgIndexRef = useRef<number>(0);
  const getNextImage = useCallback(() => {
    const src = SHAPE_SVGS[imgIndexRef.current % SHAPE_SVGS.length];
    imgIndexRef.current += 1;
    return src;
  }, []);

  // Update cached container bounds (prevents layout thrashing on mousemove)
  const updateBounds = useCallback(() => {
    if (containerRef.current) {
      boundsRef.current = containerRef.current.getBoundingClientRect();
    }
  }, []);

  // Spawn single physics body by recycling slot from pre-allocated pool (Zero React re-renders)
  const spawnBody = useCallback(
    (x: number, y: number) => {
      const now = performance.now();
      if (now - lastSpawnTimeRef.current < spawnInterval) return;
      lastSpawnTimeRef.current = now;

      const slotIdx = nextSlotRef.current;
      nextSlotRef.current = (nextSlotRef.current + 1) % poolSize;

      const body = poolRef.current[slotIdx];
      const src = getNextImage();
      const color = VIBRANT_PALETTE[slotIdx % VIBRANT_PALETTE.length];

      let vx = 0;
      let vy = 0;
      let vSpin = 0;

      if (currentMode === "zero-gravity") {
        vx = (Math.random() - 0.5) * 2.8;
        vy = -(Math.random() * 2.0 + 1.2);
        vSpin = (Math.random() - 0.5) * 1.5;
      } else {
        vx = (Math.random() - 0.5) * 8.5;
        vy = -(Math.random() * 4.5 + 3.5);
        vSpin = (Math.random() - 0.5) * 1.5;
      }

      body.active = true;
      body.src = src;
      body.color = color;
      body.x = x - imageSize / 2;
      body.y = y - imageSize / 2;
      body.vx = vx;
      body.vy = vy;
      body.rotation = (Math.random() - 0.5) * 12;
      body.vSpin = vSpin;
      body.bounces = 0;
      body.opacity = 0;
      body.scale = 0.25;
      body.settled = false;
      body.settledAge = 0;
      body.age = 0;
      body.maxAge = 170 + Math.random() * 50;

      const imgEl = imgRefs.current[slotIdx];
      if (imgEl) {
        imgEl.style.backgroundColor = color;
        imgEl.style.webkitMaskImage = `url("${src}")`;
        imgEl.style.maskImage = `url("${src}")`;
        imgEl.style.opacity = "0";
        imgEl.style.transform = `translate3d(${body.x}px, ${body.y}px, 0px) rotate(${body.rotation}deg) scale(0.25)`;
      }

      if (onLifecycleChange) onLifecycleChange("buildUp");
    },
    [spawnInterval, poolSize, imageSize, currentMode, getNextImage, onLifecycleChange]
  );

  // Pre-populate unique floating images for magnetic-repulsor mode
  useEffect(() => {
    // Reset pool
    for (let i = 0; i < poolRef.current.length; i++) {
      const b = poolRef.current[i];
      b.active = false;
      b.opacity = 0;
      const imgEl = imgRefs.current[i];
      if (imgEl) {
        imgEl.style.opacity = "0";
        imgEl.style.transform = "translate3d(-9999px, -9999px, 0px) scale(0)";
      }
    }

    if (currentMode !== "magnetic-repulsor") return;

    updateBounds();
    const rect = boundsRef.current;
    const canvasWidth = rect && rect.width > 0 ? rect.width : window.innerWidth;
    const canvasHeight = rect && rect.height > 0 ? rect.height : window.innerHeight;

    const uniqueImages = [...SHAPE_SVGS];
    const cols = 7;
    const rows = 4;
    const cellW = Math.max((canvasWidth - 80) / cols, imageSize * 0.9);
    const cellH = Math.max((canvasHeight - 80) / rows, imageSize * 1.1);

    for (let i = 0; i < Math.min(uniqueImages.length, poolSize); i++) {
      const src = uniqueImages[i];
      const color = VIBRANT_PALETTE[i % VIBRANT_PALETTE.length];
      const c = i % cols;
      const r = Math.floor(i / cols);

      const cellX = 40 + c * cellW + cellW * 0.1;
      const cellY = 40 + r * cellH + cellH * 0.1;

      const jitterX = (Math.random() - 0.5) * (cellW * 0.25);
      const jitterY = (Math.random() - 0.5) * (cellH * 0.25);

      const x = Math.max(20, Math.min(canvasWidth - imageSize - 20, cellX + jitterX));
      const y = Math.max(20, Math.min(canvasHeight - imageSize - 20, cellY + jitterY));

      const body = poolRef.current[i];
      body.active = true;
      body.src = src;
      body.color = color;
      body.x = x;
      body.y = y;
      body.vx = 0;
      body.vy = 0;
      body.rotation = (Math.random() - 0.5) * 16;
      body.vSpin = 0;
      body.bounces = 0;
      body.opacity = 1;
      body.scale = 1.0;
      body.settled = true;
      body.settledAge = 0;
      body.age = 0;
      body.maxAge = 99999;

      const imgEl = imgRefs.current[i];
      if (imgEl) {
        imgEl.style.backgroundColor = color;
        imgEl.style.webkitMaskImage = `url("${src}")`;
        imgEl.style.maskImage = `url("${src}")`;
        imgEl.style.opacity = "1";
        imgEl.style.transform = `translate3d(${x}px, ${y}px, 0px) rotate(${body.rotation}deg) scale(1)`;
      }
    }
  }, [currentMode, imageSize, poolSize, updateBounds]);

  // Mouse & Resize Event Handlers with Cached Bounds
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

      mousePosRef.current = { x, y };

      if (currentMode !== "magnetic-repulsor") {
        if (interactionMode === "cursor-trail" || isMouseDownRef.current) {
          spawnBody(x, y);
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDownRef.current = true;
      if (!boundsRef.current) updateBounds();
      const rect = boundsRef.current!;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mousePosRef.current = { x, y };

      if (currentMode !== "magnetic-repulsor") {
        lastSpawnTimeRef.current = 0;
        spawnBody(x, y);
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
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
  }, [spawnBody, interactionMode, currentMode, updateBounds]);

  // 120FPS High-Performance Physics Simulation & GPU Transform Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const fpsInterval = 1000 / 120; // 120FPS frame throttle (8.33ms)

    const repelRadiusSq = repelRadius * repelRadius;
    const minSep = imageSize * 0.95;
    const minSepSq = minSep * minSep;

    const updatePhysics = () => {
      animId = requestAnimationFrame(updatePhysics);

      const now = performance.now();
      const elapsed = now - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = now - (elapsed % fpsInterval);

      const container = containerRef.current;
      if (!container) return;

      if (!boundsRef.current) boundsRef.current = container.getBoundingClientRect();
      const rect = boundsRef.current;
      const floorY = rect.height - imageSize - 20;
      const rightWallX = rect.width - imageSize - 20;
      const bottomWallY = rect.height - imageSize - 20;

      const pool = poolRef.current;

      for (let i = 0; i < pool.length; i++) {
        const body = pool[i];
        if (!body.active) continue;

        body.age += 1;

        if (body.opacity < 1.0 && !body.settled) {
          body.opacity = Math.min(body.opacity + 0.25, 1.0);
        }
        if (body.scale < 1.0) {
          body.scale = Math.min(body.scale + 0.15, 1.0);
        }

        if (currentMode === "magnetic-repulsor") {
          const centerBodyX = body.x + imageSize / 2;
          const centerBodyY = body.y + imageSize / 2;
          const dx = centerBodyX - mousePosRef.current.x;
          const dy = centerBodyY - mousePosRef.current.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < repelRadiusSq && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const pushFactor = Math.pow((repelRadius - dist) / repelRadius, 1.2) * repelForce;
            const angle = Math.atan2(dy, dx);

            body.vx += Math.cos(angle) * pushFactor;
            body.vy += Math.sin(angle) * pushFactor;
            body.vSpin += (Math.random() - 0.5) * 0.7;
          }

          // Anti-overlap collision pre-checked with squared distance
          for (let j = i + 1; j < pool.length; j++) {
            const other = pool[j];
            if (!other.active) continue;

            const otherCenterX = other.x + imageSize / 2;
            const otherCenterY = other.y + imageSize / 2;
            const bdx = centerBodyX - otherCenterX;
            const bdy = centerBodyY - otherCenterY;
            const bdistSq = bdx * bdx + bdy * bdy;

            if (bdistSq < minSepSq && bdistSq > 0.01) {
              const bdist = Math.sqrt(bdistSq);
              const overlapPower = ((minSep - bdist) / minSep) * 1.4;
              const bAngle = Math.atan2(bdy, bdx);
              const pushX = Math.cos(bAngle) * overlapPower;
              const pushY = Math.sin(bAngle) * overlapPower;

              body.vx += pushX;
              body.vy += pushY;
              other.vx -= pushX;
              other.vy -= pushY;
            }
          }

          body.vx *= friction;
          body.vy *= friction;
          body.vSpin *= friction * 0.98;

          if (Math.abs(body.vx) < 0.1 && Math.abs(body.vy) < 0.1) {
            body.vy += Math.sin(body.age * 0.02 + body.id) * 0.008;
          }

          body.x += body.vx;
          body.y += body.vy;
          body.rotation += body.vSpin;

          if (body.x < 15) {
            body.x = 15;
            body.vx = Math.abs(body.vx) * 0.85;
          } else if (body.x > rightWallX) {
            body.x = rightWallX;
            body.vx = -Math.abs(body.vx) * 0.85;
          }

          if (body.y < 15) {
            body.y = 15;
            body.vy = Math.abs(body.vy) * 0.85;
          } else if (body.y > bottomWallY) {
            body.y = bottomWallY;
            body.vy = -Math.abs(body.vy) * 0.85;
          }
        } else if (currentMode === "zero-gravity") {
          body.vy += -0.035;
          body.vx += Math.sin(body.age * 0.06 + body.id) * 0.06;

          body.x += body.vx;
          body.y += body.vy;
          body.rotation += body.vSpin * 0.5;

          if (body.y < 120) {
            const topFade = Math.max(body.y / 120, 0);
            body.opacity = Math.min(body.opacity, topFade);
          }
        } else {
          // DEFAULT VARIANT ("normal")
          if (!body.settled) {
            body.vy += Math.abs(gravity);

            body.x += body.vx;
            body.y += body.vy;
            body.rotation += body.vSpin;

            if (body.x < 10) {
              body.x = 10;
              body.vx = -body.vx * 0.7;
            } else if (body.x > rightWallX) {
              body.x = rightWallX;
              body.vx = -body.vx * 0.7;
            }

            if (body.y >= floorY) {
              body.y = floorY;
              if (Math.abs(body.vy) > 1.2) {
                body.vy = -body.vy * bounceDamping;
                body.vx *= 0.75;
                body.vSpin *= 0.6;
                body.bounces += 1;
              } else {
                // Done bouncing: rests on floor right where it landed
                body.vy = 0;
                body.vx = 0;
                body.vSpin = 0;
                body.settled = true;
                body.settledAge = 0;
              }
            }
          } else {
            // Rests on floor for 24 frames (~0.4s), then smoothly accelerates downward starting from 0
            body.settledAge = (body.settledAge || 0) + 1;
            if (body.settledAge > 24) {
              body.vy += 0.12;
              body.y += body.vy;
              body.x += body.vx * 0.95;
              body.rotation += body.vSpin * 0.3;
            }
          }
        }

        if (currentMode !== "normal" && body.age > body.maxAge - 35) {
          const dissolveProgress = (body.age - (body.maxAge - 35)) / 35;
          body.opacity = Math.min(body.opacity, Math.max(1 - dissolveProgress, 0));
          body.scale = Math.max(1 - dissolveProgress * 0.25, 0.7);
        }

        const domNode = imgRefs.current[i];
        if (domNode) {
          const isOffBottom = currentMode === "normal" && body.settled && body.y > rect.height + 40;
          if (isOffBottom || (currentMode !== "normal" && body.age >= body.maxAge)) {
            body.active = false;
            domNode.style.opacity = "0";
            domNode.style.transform = "translate3d(-9999px, -9999px, 0px) scale(0)";
          } else {
            domNode.style.transform = `translate3d(${body.x}px, ${body.y}px, 0px) rotate(${body.rotation}deg) scale(${body.scale})`;
            domNode.style.opacity = `${body.opacity}`;
          }
        }
      }
    };

    animId = requestAnimationFrame(updatePhysics);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gravity, bounceDamping, imageSize, currentMode, repelRadius, repelForce, friction]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen bg-[#060608] overflow-hidden select-none cursor-default ${className}`}
      style={style}
    >
      <div className="absolute bottom-5 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center font-['Syne',sans-serif] z-0 select-none">
        <h1 className="text-4xl md:text-7xl font-extrabold uppercase tracking-tight text-zinc-700/60 drop-shadow-sm">
          {currentMode === "magnetic-repulsor"
            ? "MAGNETIC REPULSOR"
            : currentMode === "zero-gravity"
            ? "ZERO GRAVITY"
            : "GRAVITY CURSOR"}
        </h1>
        <p className="mt-3 font-mono text-xs tracking-[0.3em] text-zinc-500 uppercase">
          {currentMode === "magnetic-repulsor"
            ? "MOVE CURSOR TO REPEL & DRIFT FLOATING SHAPES"
            : currentMode === "zero-gravity"
            ? "CLICK OR HOLD & DRAG TO FLOAT SHAPES"
            : "CLICK OR HOLD & DRAG TO DROP SHAPES"}
        </p>
      </div>

      {/* Pre-allocated DOM Pool (Zero React re-renders during continuous hold-drag!) */}
      {poolRef.current.map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            imgRefs.current[i] = el;
          }}
          className="absolute top-0 left-0 transform-gpu will-change-transform pointer-events-none select-none"
          style={{
            width: `${imageSize}px`,
            height: `${imageSize}px`,
            opacity: 0,
            transform: "translate3d(-9999px, -9999px, 0px) scale(0)",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
      ))}
    </div>
  );
}
