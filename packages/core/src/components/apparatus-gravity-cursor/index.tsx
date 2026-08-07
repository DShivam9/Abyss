import { useRef, useEffect, useState, useCallback } from "react";
import { VesselComponentProps } from "../../engine/types";

// Dedicated Gallery Images from Gallary & Scroll folders (28 unique images)
const GALLERY_IMAGES = [
  "/images/components%20images/Gallary/cosmos_1110264921.webp",
  "/images/components%20images/Gallary/cosmos_1309943729.webp",
  "/images/components%20images/Gallary/cosmos_140351120.webp",
  "/images/components%20images/Gallary/cosmos_1441380570.webp",
  "/images/components%20images/Gallary/cosmos_145253936.webp",
  "/images/components%20images/Gallary/cosmos_1578342658.webp",
  "/images/components%20images/Gallary/cosmos_1724531036.webp",
  "/images/components%20images/Gallary/cosmos_1948095192.webp",
  "/images/components%20images/Gallary/cosmos_2046923474.webp",
  "/images/components%20images/Gallary/cosmos_623139356.webp",
  "/images/components%20images/Gallary/cosmos_842932938.webp",
  "/images/components%20images/Gallary/cosmos_854490082.webp",
  "/images/components%20images/scroll/cosmos_1207399578.webp",
  "/images/components%20images/scroll/cosmos_1309660817.webp",
  "/images/components%20images/scroll/cosmos_1994819013.webp",
  "/images/components%20images/scroll/cosmos_1859262512.webp",
  "/images/components%20images/scroll/cosmos_2063063057.webp",
  "/images/components%20images/scroll/cosmos_1067833670.webp",
  "/images/components%20images/scroll/cosmos_1215932660.webp",
  "/images/components%20images/scroll/cosmos_1292975902.webp",
  "/images/components%20images/scroll/cosmos_1452408749.webp",
  "/images/components%20images/scroll/cosmos_1591705408.webp",
  "/images/components%20images/scroll/cosmos_1244425812.webp",
  "/images/components%20images/scroll/cosmos_2086495860.webp",
  "/images/components%20images/scroll/cosmos_51259133.webp",
  "/images/components%20images/scroll/cosmos_1298955025.webp",
  "/images/components%20images/scroll/cosmos_2093433371.webp",
  "/images/components%20images/scroll/cosmos_520815919.webp",
];

export interface ApparatusGravityCursorProps extends VesselComponentProps {
  gravity?: number; // Gravitational acceleration magnitude (px/frame^2)
  bounceDamping?: number; // Elasticity coefficient (0.1 - 0.95)
  spawnInterval?: number; // Stream spawn throttle in ms (30ms - 150ms)
  imageSize?: number; // Image box width in px (80 - 240)
  maxItems?: number; // Maximum active DOM bodies in memory (10 - 80)
  zeroGravity?: boolean; // Zero-gravity mode flag
  gravityMode?: "normal" | "zero-gravity" | "heavy-gravity" | "magnetic-repulsor"; // Gravity physics variant
  interactionMode?: "hold-drag" | "cursor-trail"; // Mouse interaction mode
  repelRadius?: number; // Magnetic repeller field radius in px (150 - 600)
  repelForce?: number; // Repulsion shockwave power multiplier (1.0 - 25.0)
  friction?: number; // Space friction / slide damping (0.80 - 0.99)
}

interface PhysicsBody {
  id: number;
  src: string;
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
  age: number; // Age in frames
  maxAge: number; // Life duration before dissolve
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
  const bodiesRef = useRef<PhysicsBody[]>([]);
  const [, setRenderTrigger] = useState(0);

  // Active physics mode
  const currentMode = zeroGravity ? "zero-gravity" : gravityMode;

  // Mouse & interaction state
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isMouseDownRef = useRef<boolean>(false);
  const lastSpawnTimeRef = useRef<number>(0);
  const idCounterRef = useRef<number>(0);

  // Direct DOM Refs map for 60FPS GPU transform updates without React re-render overhead
  const domNodesRef = useRef<Map<number, HTMLDivElement>>(new Map());

  // Pick next image in pool
  const imgIndexRef = useRef<number>(0);
  const getNextImage = useCallback(() => {
    const src = GALLERY_IMAGES[imgIndexRef.current % GALLERY_IMAGES.length];
    imgIndexRef.current += 1;
    return src;
  }, []);

  // Spawn single physics body at (x, y)
  const spawnBody = useCallback(
    (x: number, y: number) => {
      const now = performance.now();
      if (now - lastSpawnTimeRef.current < spawnInterval) return;
      lastSpawnTimeRef.current = now;

      // Cap pool size for peak 60FPS performance
      if (bodiesRef.current.length >= maxItems) {
        const oldest = bodiesRef.current.shift();
        if (oldest) {
          domNodesRef.current.delete(oldest.id);
        }
      }

      const id = idCounterRef.current++;
      const src = getNextImage();

      // Velocity Setup per Mode
      let vx = 0;
      let vy = 0;
      let vSpin = 0;

      if (currentMode === "heavy-gravity") {
        // High downward gravity burst (rapid drop)
        vx = (Math.random() - 0.5) * 4.0;
        vy = Math.random() * 2.0 + 1.0;
        vSpin = (Math.random() - 0.5) * 0.8;
      } else if (currentMode === "zero-gravity") {
        // Pure weightless upward float drift
        vx = (Math.random() - 0.5) * 2.8;
        vy = -(Math.random() * 2.0 + 1.2);
        vSpin = (Math.random() - 0.5) * 1.5;
      } else {
        // Normal Earth downward gravity + pop impulse
        vx = (Math.random() - 0.5) * 8.5;
        vy = -(Math.random() * 4.5 + 3.5);
        vSpin = (Math.random() - 0.5) * 1.5;
      }

      const newBody: PhysicsBody = {
        id,
        src,
        x: x - imageSize / 2,
        y: y - imageSize / 2,
        vx,
        vy,
        rotation: (Math.random() - 0.5) * 12,
        vSpin,
        bounces: 0,
        opacity: 1,
        scale: 0.1, // Starts small, pops out quickly
        settled: false,
        age: 0,
        maxAge: currentMode === "heavy-gravity" ? 140 + Math.random() * 30 : 170 + Math.random() * 50,
      };

      bodiesRef.current.push(newBody);
      setRenderTrigger((v) => v + 1);

      if (onLifecycleChange) onLifecycleChange("buildUp");
    },
    [spawnInterval, maxItems, imageSize, currentMode, getNextImage, onLifecycleChange]
  );

  // Pre-populate unique floating images randomly across full canvas for magnetic-repulsor mode
  useEffect(() => {
    // Clear any previous mode bodies on mode switch
    bodiesRef.current = [];
    domNodesRef.current.clear();

    if (currentMode !== "magnetic-repulsor") return;

    const container = containerRef.current;
    const width = container ? container.getBoundingClientRect().width : window.innerWidth;
    const height = container ? container.getBoundingClientRect().height : window.innerHeight;
    const canvasWidth = width > 0 ? width : 1200;
    const canvasHeight = height > 0 ? height : 700;

    const initialBodies: PhysicsBody[] = [];
    const uniqueImages = [...GALLERY_IMAGES];

    // Non-overlapping grid placement across full viewport (7 columns x 4 rows)
    const cols = 7;
    const rows = 4;
    const cellW = Math.max((canvasWidth - 80) / cols, imageSize * 0.9);
    const cellH = Math.max((canvasHeight - 80) / rows, imageSize * 1.1);

    for (let i = 0; i < uniqueImages.length; i++) {
      const id = idCounterRef.current++;
      const src = uniqueImages[i];

      const c = i % cols;
      const r = Math.floor(i / cols);

      const cellX = 40 + c * cellW + cellW * 0.1;
      const cellY = 40 + r * cellH + cellH * 0.1;

      const jitterX = (Math.random() - 0.5) * (cellW * 0.25);
      const jitterY = (Math.random() - 0.5) * (cellH * 0.25);

      const x = Math.max(20, Math.min(canvasWidth - imageSize - 20, cellX + jitterX));
      const y = Math.max(20, Math.min(canvasHeight - imageSize * 1.25 - 20, cellY + jitterY));

      // Initial zero velocity (cards sit still floating in space until repelled)
      const vx = 0;
      const vy = 0;

      initialBodies.push({
        id,
        src,
        x,
        y,
        vx,
        vy,
        rotation: (Math.random() - 0.5) * 16,
        vSpin: 0,
        bounces: 0,
        opacity: 1,
        scale: 1.0,
        settled: true,
        age: 0,
        maxAge: 99999, // Persistent floating images
      });
    }

    bodiesRef.current = initialBodies;
    setRenderTrigger((v) => v + 1);
  }, [currentMode, imageSize]);

  // Mouse Move & Mouse Down Event Handlers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
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
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mousePosRef.current = { x, y };

      if (currentMode !== "magnetic-repulsor") {
        lastSpawnTimeRef.current = 0; // Force immediate spawn on click
        spawnBody(x, y);
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [spawnBody, interactionMode, currentMode]);

  // 60FPS High-Performance Physics Simulation & GPU Transform Loop
  useEffect(() => {
    let animId: number;

    const updatePhysics = () => {
      const container = containerRef.current;
      if (!container) {
        animId = requestAnimationFrame(updatePhysics);
        return;
      }

      const rect = container.getBoundingClientRect();
      const floorY = rect.height - imageSize - 20; // 20px padding above floor
      const rightWallX = rect.width - imageSize - 20;
      const bottomWallY = rect.height - imageSize * 1.25 - 20;

      const activeBodies = bodiesRef.current;
      const bodiesToRemove: number[] = [];

      for (let i = 0; i < activeBodies.length; i++) {
        const body = activeBodies[i];
        body.age += 1;

        // Pop-in scale expansion animation
        if (body.scale < 1.0) {
          body.scale = Math.min(body.scale + 0.18, 1.0);
        }

        if (currentMode === "magnetic-repulsor") {
          // MAGNETIC REPULSOR MODE: Floating images sit still, repelled smoothly when cursor comes near
          const centerBodyX = body.x + imageSize / 2;
          const centerBodyY = body.y + (imageSize * 1.25) / 2;
          const dx = centerBodyX - mousePosRef.current.x;
          const dy = centerBodyY - mousePosRef.current.y;
          const dist = Math.hypot(dx, dy);

          if (dist < repelRadius && dist > 1) {
            const pushFactor = Math.pow((repelRadius - dist) / repelRadius, 1.2) * repelForce;
            const angle = Math.atan2(dy, dx);

            body.vx += Math.cos(angle) * pushFactor;
            body.vy += Math.sin(angle) * pushFactor;
            body.vSpin += (Math.random() - 0.5) * 0.7;
          }

          // Mutual Body-to-Body Anti-Overlap Collision Repulsion
          for (let j = i + 1; j < activeBodies.length; j++) {
            const other = activeBodies[j];
            const otherCenterX = other.x + imageSize / 2;
            const otherCenterY = other.y + (imageSize * 1.25) / 2;
            const bdx = centerBodyX - otherCenterX;
            const bdy = centerBodyY - otherCenterY;
            const bdist = Math.hypot(bdx, bdy);
            const minSep = imageSize * 0.95;

            if (bdist < minSep && bdist > 0.1) {
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

          // Smooth customizable friction so pushed cards glide softly and return to rest
          body.vx *= friction;
          body.vy *= friction;
          body.vSpin *= friction * 0.98;

          // Micro ambient bobbing when nearly still
          if (Math.abs(body.vx) < 0.1 && Math.abs(body.vy) < 0.1) {
            body.vy += Math.sin(body.age * 0.02 + body.id) * 0.008;
          }

          body.x += body.vx;
          body.y += body.vy;
          body.rotation += body.vSpin;

          // Boundary bounce to keep floating images within screen bounds
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
        } else if (currentMode === "heavy-gravity") {
          // HEAVY GRAVITY MODE: High G-force acceleration + low elasticity crash
          if (!body.settled) {
            body.vy += Math.abs(gravity) * 3.4; // 3.4x G-Force acceleration!

            body.x += body.vx;
            body.y += body.vy;
            body.rotation += body.vSpin;

            // Side boundary bounce (left/right walls)
            if (body.x < 10) {
              body.x = 10;
              body.vx = -body.vx * 0.5;
            } else if (body.x > rightWallX) {
              body.x = rightWallX;
              body.vx = -body.vx * 0.5;
            }

            // Heavy Floor Impact Crash (Low elasticity bounce)
            if (body.y >= floorY) {
              body.y = floorY;
              if (Math.abs(body.vy) > 2.0) {
                body.vy = -body.vy * (bounceDamping * 0.35); // Low bounce thud!
                body.vx *= 0.6; // Heavy friction
                body.vSpin *= 0.5;
                body.bounces += 1;
              } else {
                body.vy = 0;
                body.vx = 0;
                body.vSpin = 0;
                body.settled = true;
              }
            }
          }
        } else if (currentMode === "zero-gravity") {
          // ZERO GRAVITY MODE: Pure weightless upward float
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
          // NORMAL GRAVITY MODE: Downward Earth gravity + floor bounce collision
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
                body.vy = 0;
                body.vx = 0;
                body.vSpin = 0;
                body.settled = true;
              }
            }
          }
        }

        // Dissolve phase near end of life
        if (body.age > body.maxAge - 35) {
          const dissolveProgress = (body.age - (body.maxAge - 35)) / 35;
          body.opacity = Math.min(body.opacity, Math.max(1 - dissolveProgress, 0));
          body.scale = Math.max(1 - dissolveProgress * 0.25, 0.7);
        }

        // Flag for removal if fully dissolved
        if (body.age >= body.maxAge) {
          bodiesToRemove.push(body.id);
        }

        // Direct GPU Transform updates to DOM node (zero React render overhead)
        const domNode = domNodesRef.current.get(body.id);
        if (domNode) {
          domNode.style.transform = `translate3d(${body.x}px, ${body.y}px, 0px) rotate(${body.rotation}deg) scale(${body.scale})`;
          domNode.style.opacity = `${body.opacity}`;
        }
      }

      // Garbage collection for dissolved bodies
      if (bodiesToRemove.length > 0) {
        bodiesRef.current = activeBodies.filter((b) => !bodiesToRemove.includes(b.id));
        bodiesToRemove.forEach((id) => domNodesRef.current.delete(id));
        setRenderTrigger((v) => v + 1);
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gravity, bounceDamping, imageSize, currentMode]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen bg-[#060608] overflow-hidden select-none cursor-default ${className}`}
      style={style}
    >
      {/* Floor Indicator Line (Always visible across all gravity modes) */}
      <div className="absolute bottom-5 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      {/* Clean Aesthetic Center Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center font-['Syne',sans-serif] z-0 select-none">
        <h1 className="text-4xl md:text-7xl font-extrabold uppercase tracking-tight text-zinc-700/60 drop-shadow-sm">
          {currentMode === "magnetic-repulsor"
            ? "MAGNETIC REPULSOR"
            : currentMode === "heavy-gravity"
            ? "HEAVY GRAVITY"
            : currentMode === "zero-gravity"
            ? "ZERO GRAVITY"
            : "GRAVITY CURSOR"}
        </h1>
        <p className="mt-3 font-mono text-xs tracking-[0.3em] text-zinc-500 uppercase">
          {currentMode === "magnetic-repulsor"
            ? "MOVE CURSOR TO REPEL & DRIFT FLOATING IMAGES"
            : currentMode === "heavy-gravity"
            ? "CLICK OR HOLD & DRAG TO CRASH IMAGES"
            : currentMode === "zero-gravity"
            ? "CLICK OR HOLD & DRAG TO FLOAT IMAGES"
            : "CLICK OR HOLD & DRAG TO DROP IMAGES"}
        </p>
      </div>

      {/* Render Active Physics Image Bodies (Raw images without card containers) */}
      {bodiesRef.current.map((body) => (
        <img
          key={body.id}
          ref={(el) => {
            if (el) domNodesRef.current.set(body.id, el as unknown as HTMLDivElement);
            else domNodesRef.current.delete(body.id);
          }}
          src={body.src}
          alt="Gravity Item"
          className="absolute top-0 left-0 transform-gpu will-change-transform pointer-events-none rounded-lg drop-shadow-2xl object-cover select-none"
          style={{
            width: `${imageSize}px`,
            height: `${imageSize * 1.25}px`,
            transform: `translate3d(${body.x}px, ${body.y}px, 0px) rotate(${body.rotation}deg) scale(${body.scale})`,
            opacity: body.opacity,
          }}
        />
      ))}
    </div>
  );
}
