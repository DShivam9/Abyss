import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ApparatusFocusRingProps, FocusRingItem } from "./types";

gsap.registerPlugin(CustomEase);

try {
  CustomEase.create("vessel", "M0,0 C0.16,1 0.3,1 1,1");
} catch (e) {
  // Already registered
}

const DEFAULT_ITEMS: FocusRingItem[] = [
  { id: "01", name: "AÉTHYR • 1", imageSrc: "/images/components images/scroll/cosmos_1309660817.jpeg" },
  { id: "02", name: "MÉLANCØLIE", imageSrc: "/images/components images/scroll/cosmos_1859262512.jpeg" },
  { id: "03", name: "BASALT DUST", imageSrc: "/images/components images/scroll/cosmos_2063063057.jpeg" },
  { id: "04", name: "COPPER SHARD", imageSrc: "/images/components images/scroll/cosmos_679994644.jpeg" },
  { id: "05", name: "HÉLIØS • †", imageSrc: "/images/components images/scroll/cosmos_1244425812.jpeg" },
  { id: "06", name: "ÉPHÉMÈRE", imageSrc: "/images/components images/scroll/cosmos_1994819013.jpeg" },
  { id: "07", name: "AMPHORA", imageSrc: "/images/components images/scroll/cosmos_2086495860.jpeg" },
  { id: "08", name: "VELOCITY", imageSrc: "/images/components images/scroll/cosmos_51259133.jpeg" },
];

const OdometerDigit: React.FC<{ digit: string }> = ({ digit }) => {
  const num = parseInt(digit, 10) || 0;
  return (
    <div 
      className="relative h-[12px] overflow-hidden inline-block select-none pointer-events-none"
      style={{ width: "7px" }}
    >
      <div
        className="absolute top-0 left-0 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu"
        style={{
          transform: `translate3d(0, -${num * 12}px, 0)`,
          height: `${10 * 12}px`,
        }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span 
            key={i} 
            className="text-[10px] font-mono text-neutral-500 font-bold leading-[12px] block"
          >
            {i}
          </span>
        ))}
      </div>
    </div>
  );
};

export const ApparatusFocusRing: React.FC<ApparatusFocusRingProps & {
  rxFactor?: number;
  ryFactor?: number;
  baseItemScale?: number;
  activeBlur?: number;
  ambientSpinSpeed?: number;
}> = ({
  items = DEFAULT_ITEMS,
  className = "",
  style,
  onLifecycleChange,
  sensitivity = 0.005,
  friction = 0.95,
  focusPosition = "bottom",
  rxFactor: propRxFactor = 0.35,
  ryFactor: propRyFactor = 0.12,
  baseItemScale: propBaseItemScale = 1.0,
  activeBlur: propActiveBlur = 4.0,
  ambientSpinSpeed: propAmbientSpinSpeed = 0.02,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Size tracking
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const dimensionsRef = useRef(dimensions);
  
  // Config derived from props
  const rxFactor = propRxFactor;
  const ryFactor = propRyFactor;
  const baseItemScale = propBaseItemScale;
  const activeBlur = propActiveBlur;
  const ambientSpinSpeed = propAmbientSpinSpeed;

  const tiltIntensity = 8.0;
  const skewIntensity = 2.5;
  const frictionValue = friction;

  const rxFactorRef = useRef(rxFactor);
  const ryFactorRef = useRef(ryFactor);
  const baseItemScaleRef = useRef(baseItemScale);
  const activeBlurRef = useRef(activeBlur);
  const ambientSpinSpeedRef = useRef(ambientSpinSpeed);

  const tiltIntensityRef = useRef(tiltIntensity);
  const skewIntensityRef = useRef(skewIntensity);

  useEffect(() => {
    tiltIntensityRef.current = tiltIntensity;
    skewIntensityRef.current = skewIntensity;
  }, [tiltIntensity, skewIntensity]);

  useEffect(() => {
    dimensionsRef.current = dimensions;
  }, [dimensions]);

  useEffect(() => {
    rxFactorRef.current = rxFactor;
    ryFactorRef.current = ryFactor;
    baseItemScaleRef.current = baseItemScale;
    activeBlurRef.current = activeBlur;
    ambientSpinSpeedRef.current = ambientSpinSpeed;
  }, [rxFactor, ryFactor, baseItemScale, activeBlur, ambientSpinSpeed]);

  // Math references for frame loops
  const angleStep = (2 * Math.PI) / items.length;
  const targetAngleRef = useRef(0);
  const currentAngleRef = useRef(0);
  const velocityRef = useRef(0);
  const isInteractingRef = useRef(false);
  
  // Interactive states
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  
  // Animation frame reference
  const presetAnimRef = useRef<number | null>(null);

  const isPointerDownRef = useRef(false);
  const tiltAngleRef = useRef(0);
  const focusSweepRef = useRef({ current: 0.0 });
  const skewAngleRef = useRef(0);

  // Dimensions measurement
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width || 800,
          height: entry.contentRect.height || 600,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Set initial lifecycle
  useEffect(() => {
    onLifecycleChange?.("idle");
  }, [onLifecycleChange]);

  // Pointer drag and touch interactions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    isPointerDownRef.current = false;
    let startX = 0;
    let startAngle = 0;
    let lastTime = 0;
    let lastX = 0;
    let dragDistance = 0;

    const handlePointerDown = (e: PointerEvent) => {
      // Allow controls panel and controls trigger to handle pointer events normally
      if (
        (e.target as HTMLElement).closest(".abyss-controls-panel") || 
        (e.target as HTMLElement).closest(".abyss-controls-trigger")
      ) {
        return;
      }

      isPointerDownRef.current = true;
      startX = e.clientX;
      lastX = e.clientX;
      startAngle = targetAngleRef.current;
      lastTime = performance.now();
      dragDistance = 0;
      isInteractingRef.current = true;
      velocityRef.current = 0; // Stop ongoing velocity glide

      onLifecycleChange?.("discovery");
      container.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current) return;

      const now = performance.now();
      const currentX = e.clientX;
      const dt = Math.max(1, now - lastTime) / 1000; // in seconds
      const deltaX = currentX - startX;
      dragDistance += Math.abs(currentX - lastX);

      // Map horizontal drag delta to angular rotation
      targetAngleRef.current = startAngle - deltaX * sensitivity;

      // Track instantaneous velocity
      const instantVelocity = -(currentX - lastX) * sensitivity / dt;
      // Filter velocity with low-pass to smooth out noise
      velocityRef.current = velocityRef.current * 0.4 + instantVelocity * 0.6;

      lastX = currentX;
      lastTime = now;

      onLifecycleChange?.("buildUp");
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;
      isInteractingRef.current = false;
      container.releasePointerCapture(e.pointerId);

      onLifecycleChange?.("recovery");

      // Click detection: if user barely moved pointer, treat as click-to-focus trigger
      if (dragDistance < 5) {
        const clickedItem = (e.target as HTMLElement).closest("[data-focus-index]") as HTMLElement;
        if (clickedItem) {
          const clickedIdx = parseInt(clickedItem.getAttribute("data-focus-index") || "0", 10);
          navigateToIndex(clickedIdx);
        }
      }
    };

    // Wheel support (Revolving via mouse wheel scroll)
    const handleWheel = (e: WheelEvent) => {
      if (
        (e.target as HTMLElement).closest(".abyss-controls-panel") ||
        (e.target as HTMLElement).closest(".abyss-controls-trigger")
      ) {
        return;
      }
      e.preventDefault();
      
      isInteractingRef.current = true;
      targetAngleRef.current += e.deltaY * 0.0006;
      velocityRef.current = Math.max(-3.0, Math.min(3.0, velocityRef.current + e.deltaY * 0.002));
      
      onLifecycleChange?.("buildUp");

      // Auto clear interaction after quiet period
      const timer = setTimeout(() => {
        isInteractingRef.current = false;
        onLifecycleChange?.("idle");
      }, 150);
      return () => clearTimeout(timer);
    };

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointercancel", handlePointerUp);
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerUp);
      container.removeEventListener("wheel", handleWheel);
    };
  }, [items.length, sensitivity, onLifecycleChange]);

  // Navigate to specific item index
  const navigateToIndex = (idx: number) => {
    isInteractingRef.current = true;
    onLifecycleChange?.("buildUp");
    
    // Find closest path (wrap angles to -PI to PI difference)
    const currentAngle = targetAngleRef.current;
    const targetItemAngle = idx * angleStep;
    
    // Calculate difference wrapping around 2*PI circle
    const diff = ((targetItemAngle - currentAngle + Math.PI) % (2 * Math.PI)) - Math.PI;
    const finalTargetAngle = currentAngle + diff;
    
    // Trigger autofocus sweep on click
    gsap.killTweensOf(focusSweepRef.current);
    gsap.fromTo(focusSweepRef.current,
      { current: 1.0 },
      { current: 0.0, duration: 0.5, ease: "power2.out" }
    );

    gsap.to(targetAngleRef, {
      current: finalTargetAngle,
      duration: 0.8,
      ease: "vessel",
      onUpdate: () => {
        // keep refs aligned
        targetAngleRef.current = (targetAngleRef as any).current;
      },
      onComplete: () => {
        isInteractingRef.current = false;
        onLifecycleChange?.("peak");
      }
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        navigateToIndex(activeIdxRef.current - 1);
      } else if (e.key === "ArrowRight") {
        navigateToIndex(activeIdxRef.current + 1);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items.length]);

  // Render loop animation ticker
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      // 1. Ambient rotation when not interacting
      if (!isInteractingRef.current && Math.abs(velocityRef.current) < 0.05) {
        targetAngleRef.current += ambientSpinSpeedRef.current * dt;
      }

      // 2. Momentum physics deceleration
      if (!isInteractingRef.current) {
        velocityRef.current *= Math.pow(frictionValue, dt * 60);
        if (Math.abs(velocityRef.current) < 0.05) {
          velocityRef.current = 0;
          
          // Auto snap to closest item angle when momentum is lost
          const snapAngle = Math.round(targetAngleRef.current / angleStep) * angleStep;
          
          const snapDiff = snapAngle - targetAngleRef.current;
          if (Math.abs(snapDiff) > 0.001) {
            targetAngleRef.current += snapDiff * 0.15; // smooth snap chase
          }
        }
        targetAngleRef.current += velocityRef.current * dt;
      }

      // 3. Smooth angle chase (Lerping actual current angle to target angle)
      const angleDiff = targetAngleRef.current - currentAngleRef.current;
      if (Math.abs(angleDiff) < 0.0001) {
        currentAngleRef.current = targetAngleRef.current;
      } else {
        currentAngleRef.current += angleDiff * (1 - Math.pow(1 - 0.16, dt * 60));
      }

      // Gyroscopic Gimbal Tilt Calculation
      // Velocity controls the tilt angle of cards.
      const targetTilt = velocityRef.current * tiltIntensityRef.current;
      const cappedTargetTilt = Math.max(-15, Math.min(15, targetTilt));
      tiltAngleRef.current += (cappedTargetTilt - tiltAngleRef.current) * 0.1;

      // Velocity Card Shear Skew Physics
      // Cards lean horizontally into the direction of the spin
      const targetSkew = velocityRef.current * -skewIntensityRef.current; 
      const cappedTargetSkew = Math.max(-12, Math.min(12, targetSkew));
      skewAngleRef.current += (cappedTargetSkew - skewAngleRef.current) * 0.12;

      // 4. Compute and apply elliptical transformations
      const W = dimensionsRef.current.width;
      const H = dimensionsRef.current.height;
      const rx = W * rxFactorRef.current;
      const ry = H * ryFactorRef.current;
      const centerX = W / 2;
      const centerY = H / 2;

      // Target focus angle (bottom center is Math.PI / 2)
      const focusAngleTarget = focusPosition === "bottom" ? Math.PI / 2 : -Math.PI / 2;

      let closestIdx = 0;
      let minFocusDist = Infinity;

      for (let i = 0; i < items.length; i++) {
        const el = itemsRef.current[i];
        if (!el) continue;

        // Base angle of the item, revolved by the current scrolling angle
        const baseAngle = i * angleStep;
        const currentAngle = baseAngle - currentAngleRef.current;

        // Elliptical coordinate calculation
        const x = centerX + rx * Math.cos(currentAngle);
        const y = centerY + ry * Math.sin(currentAngle);

        // Sinusoidal focus weight based on angle distance from focus position
        const angleDiffFromFocus = ((currentAngle - focusAngleTarget + Math.PI) % (2 * Math.PI)) - Math.PI;
        const normalizedDiff = Math.abs(angleDiffFromFocus); // 0 to PI
        
        // 1.0 = in full focus, 0.0 = opposite side of the ring
        const focusWeight = (Math.cos(angleDiffFromFocus) + 1) / 2;

        if (normalizedDiff < minFocusDist) {
          minFocusDist = normalizedDiff;
          closestIdx = i;
        }

        // Layout mapping variables
        const scale = (0.4 + focusWeight * 0.6) * baseItemScaleRef.current;
        const opacity = 0.2 + focusWeight * 0.8;
        
        // Camera Autofocus Sweep: Transient extra blur on the active focused card
        const transientBlur = (i === activeIdxRef.current) ? (focusSweepRef.current.current * 6.0) : 0;
        const blurAmount = (1.0 - focusWeight) * activeBlurRef.current + transientBlur;
        
        const zIndex = Math.round(focusWeight * 100);

        // Apply styles directly to the DOM nodes with dynamic tilt and shear skew
        el.style.transform = `translate3d(${x - 120}px, ${y - 80}px, 0) scale(${scale}) rotate(${tiltAngleRef.current.toFixed(1)}deg) skewX(${skewAngleRef.current.toFixed(1)}deg)`;
        el.style.opacity = String(opacity);
        el.style.filter = blurAmount > 0.1 ? `blur(${blurAmount.toFixed(2)}px)` : "none";
        el.style.zIndex = String(zIndex);
      }

      // Check boundary crossings
      const activeWrappedIdx = ((closestIdx % items.length) + items.length) % items.length;
      if (activeWrappedIdx !== activeIdxRef.current) {
        activeIdxRef.current = activeWrappedIdx;
        setActiveIdx(activeWrappedIdx);

        // Trigger autofocus sweep on boundary crossing if not actively dragging
        if (!isPointerDownRef.current) {
          gsap.killTweensOf(focusSweepRef.current);
          gsap.fromTo(focusSweepRef.current,
            { current: 1.0 },
            { current: 0.0, duration: 0.4, ease: "power2.out" }
          );
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      if (presetAnimRef.current !== null) {
        cancelAnimationFrame(presetAnimRef.current);
      }
    };
  }, [items.length, focusPosition, frictionValue]);

  const activeItem = items[activeIdx];

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 select-none overflow-hidden touch-none ${className}`}
      style={{
        backgroundColor: "#000000",
        ...style,
      }}
    >

      {/* ─── ELLIPTICAL IMAGES RING ─── */}
      <div className="absolute inset-0 pointer-events-none">
        {items.map((item, idx) => (
          <div
            key={item.id}
            ref={(ref) => {
              itemsRef.current[idx] = ref;
            }}
            data-focus-index={idx}
            className="absolute cursor-pointer pointer-events-auto rounded-lg overflow-hidden bg-neutral-950 will-change-transform transform-gpu select-none"
            style={{
              width: "240px",
              height: "160px",
              transition: "box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              if (idx === activeIdxRef.current) {
                el.style.boxShadow = "0 0 25px rgba(255, 255, 255, 0.12)";
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.boxShadow = "none";
            }}
          >
            {/* Image element with lazy optimization */}
            <img
              src={item.imageSrc}
              alt={item.name}
              draggable={false}
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* ─── METADATA DISPLAY PANEL ─── */}
      <div 
        className="absolute left-1/2 bottom-12 -translate-x-1/2 pointer-events-none flex flex-col items-center select-none"
        style={{ zIndex: 150 }}
      >
        {/* Persistent Index display to allow smooth odometer transitions */}
        <div className="flex items-center gap-[1px] h-[12px] mb-2 font-mono tracking-widest text-neutral-500 uppercase select-none">
          <OdometerDigit digit={activeItem ? activeItem.id[0] : "0"} />
          <OdometerDigit digit={activeItem ? activeItem.id[1] : "0"} />
          <span className="text-[10px] font-mono text-neutral-500 font-bold ml-1">/</span>
          <span className="text-[10px] font-mono text-neutral-500 font-bold ml-1">
            {items.length.toString().padStart(2, "0")}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {activeItem && (
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              {/* Satoshi styled active specimen title */}
              <h2 
                className="text-lg font-medium tracking-[0.2em] text-white uppercase select-none"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                {activeItem.name}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


    </div>
  );
};

export default ApparatusFocusRing;
