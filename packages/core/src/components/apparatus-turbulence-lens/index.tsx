import React, { useEffect, useRef, useId } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { VesselComponentProps } from "../../engine/types";

gsap.registerPlugin(ScrollTrigger);

export interface ApparatusTurbulenceLensProps extends VesselComponentProps {
  title?: string;
  subtitle?: string;
  bodyText?: string;
  layoutMode?: "split" | "overlay" | "full-bleed";
  ambientDisplacement?: number;
  lensDisplacement?: number;
  lensRadius?: number;
  noiseFrequency?: number;
  noiseOctaves?: number;
  lensFollowSpeed?: number;
  scrollVelocityEffect?: number;
  enableCursorLens?: boolean;
}

const DEFAULT_IMAGE = "/images/components%20images/SVG/rajudin-hax-7bN-W2xONP4-unsplash.webp";

export default function ApparatusTurbulenceLens({
  imageSrc = DEFAULT_IMAGE,
  title = "TURBULENCE",
  subtitle = "FLUID SVG DISPLACEMENT",
  bodyText = "Organic noise displacement driven by cursor proximity and scroll velocity. Both typography and image composite warp under a unified fluid lens filter.",
  layoutMode = "split",
  ambientDisplacement = 5,
  lensDisplacement = 25,
  lensRadius = 160,
  noiseFrequency = 0.012,
  noiseOctaves = 3,
  lensFollowSpeed = 0.3,
  scrollVelocityEffect = 0.5,
  enableCursorLens = true,
  className = "",
  style = {},
  onLifecycleChange,
}: ApparatusTurbulenceLensProps) {
  const uniqueId = useId().replace(/:/g, "_");
  const filterId = `vessel_turbulence_lens_${uniqueId}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const displacementMapRef = useRef<SVGFEDisplacementMapElement>(null);
  const feTurbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const lensMaskRef = useRef<HTMLDivElement>(null);

  // Position & Velocity Refs for Delta-Corrected RAF Loop
  const targetXRef = useRef(0.5);
  const targetYRef = useRef(0.5);
  const currentXRef = useRef(0.5);
  const currentYRef = useRef(0.5);

  const isHoveredRef = useRef(false);
  const scrollVelocityRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const elapsedTimeRef = useRef(0);

  const currentDisplacementRef = useRef(ambientDisplacement);

  // Sync lifecycle state with parent
  const notifyLifecycle = (state: "idle" | "discovery" | "buildUp" | "peak" | "recovery") => {
    onLifecycleChange?.(state);
  };

  // Mouse Interactivity
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    isHoveredRef.current = true;
    notifyLifecycle("discovery");
    updateCursorTarget(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateCursorTarget(e);
    if (isHoveredRef.current) {
      notifyLifecycle("peak");
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    notifyLifecycle("recovery");
    targetXRef.current = 0.5;
    targetYRef.current = 0.5;
    setTimeout(() => {
      if (!isHoveredRef.current) {
        notifyLifecycle("idle");
      }
    }, 400);
  };

  const updateCursorTarget = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      targetXRef.current = (e.clientX - rect.left) / rect.width;
      targetYRef.current = (e.clientY - rect.top) / rect.height;
    }
  };

  // GSAP ScrollTrigger Integration for Scroll Velocity Tracking
  useGSAP(
    () => {
      if (!containerRef.current) return;

      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const vel = Math.abs(self.getVelocity() || 0);
          scrollVelocityRef.current = Math.min(vel / 400, 10);
        },
      });

      return () => {
        trigger.kill();
      };
    },
    { scope: containerRef }
  );

  // Wheel listener as secondary velocity input for standalone showcase view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let wheelTimeout: ReturnType<typeof setTimeout>;
    const handleWheel = (e: WheelEvent) => {
      const delta = Math.min(Math.abs(e.deltaY) * 0.05, 8);
      scrollVelocityRef.current = Math.max(scrollVelocityRef.current, delta);
      notifyLifecycle("buildUp");

      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        notifyLifecycle(isHoveredRef.current ? "peak" : "idle");
      }, 300);
    };

    el.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      clearTimeout(wheelTimeout);
    };
  }, []);

  // Main Delta-Corrected RAF Loop for Smooth Damped Motion & SVG Filter Animation
  useEffect(() => {
    let animId: number;

    const renderLoop = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const deltaTime = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;
      elapsedTimeRef.current += deltaTime;

      // 1. Delta-corrected exponential damping factor
      const dampRatio = Math.max(0.01, 1 - Math.pow(1 - 0.08, deltaTime * 60));
      const followDamp = Math.max(0.01, 1 - Math.pow(1 - (1 / (lensFollowSpeed * 20)), deltaTime * 60));

      // 2. Interpolate cursor position with inertia
      currentXRef.current += (targetXRef.current - currentXRef.current) * followDamp;
      currentYRef.current += (targetYRef.current - currentYRef.current) * followDamp;

      // 3. Update radial lens mask position in DOM
      if (lensMaskRef.current && containerRef.current) {
        const pxX = currentXRef.current * 100;
        const pxY = currentYRef.current * 100;
        lensMaskRef.current.style.background = `radial-gradient(circle ${lensRadius}px at ${pxX}% ${pxY}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0) 100%)`;
      }

      // 4. Cursor proximity calculation (distance from center as 0..1 ratio factor)
      const distX = currentXRef.current - 0.5;
      const distY = currentYRef.current - 0.5;
      const distFromCenter = Math.sqrt(distX * distX + distY * distY) * 2; // 0 at center, ~1 at edges
      const proximityFactor = isHoveredRef.current ? Math.max(0.4, 1.2 - distFromCenter * 0.8) : 0;

      // 5. Calculate target displacement with scroll velocity boost
      const targetDisplacement =
        ambientDisplacement +
        (enableCursorLens ? lensDisplacement * proximityFactor : 0) +
        scrollVelocityRef.current * scrollVelocityEffect * 5;

      // Decay scroll velocity smoothly
      scrollVelocityRef.current *= Math.pow(0.92, deltaTime * 60);

      // Lerp displacement intensity
      currentDisplacementRef.current += (targetDisplacement - currentDisplacementRef.current) * dampRatio;

      // 6. Apply displacement scale to SVG filter node
      if (displacementMapRef.current) {
        displacementMapRef.current.setAttribute("scale", currentDisplacementRef.current.toFixed(2));
      }

      // 7. Smooth organic breathing by modulating baseFrequency continuously with sine waves
      if (feTurbulenceRef.current) {
        const osc1 = Math.sin(elapsedTimeRef.current * 1.5) * 0.003;
        const osc2 = Math.cos(elapsedTimeRef.current * 0.8) * 0.002;
        const freqX = Math.max(0.002, noiseFrequency + osc1);
        const freqY = Math.max(0.002, noiseFrequency + osc2);
        feTurbulenceRef.current.setAttribute("baseFrequency", `${freqX.toFixed(4)} ${freqY.toFixed(4)}`);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      lastTimeRef.current = null;
    };
  }, [
    ambientDisplacement,
    lensDisplacement,
    lensRadius,
    lensFollowSpeed,
    scrollVelocityEffect,
    enableCursorLens,
    noiseFrequency,
  ]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full overflow-hidden bg-[#0A0A0A] text-white select-none flex items-center justify-center p-4 md:p-8 ${className}`}
      style={style}
    >
      {/* Hidden SVG Filter Definition */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter
            id={filterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            filterUnits="objectBoundingBox"
            primitiveUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              ref={feTurbulenceRef}
              type="fractalNoise"
              baseFrequency={noiseFrequency}
              numOctaves={noiseOctaves}
              seed="1"
              result="noise"
            />
            <feDisplacementMap
              ref={displacementMapRef}
              in="SourceGraphic"
              in2="noise"
              scale={ambientDisplacement}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
          </filter>
        </defs>
      </svg>

      {/* Main Filtered Composition Container */}
      <div
        className="relative w-full max-w-6xl h-full flex flex-col justify-center overflow-hidden"
        style={{
          filter: `url(#${filterId})`,
          willChange: "filter",
        }}
      >
        {layoutMode === "split" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center h-full max-h-[80vh]">
            {/* Left Image Column */}
            <div className="md:col-span-6 relative h-[280px] md:h-full max-h-[440px] rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl">
              <img
                src={encodeURI(imageSrc)}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Right Editorial Text Column */}
            <div className="md:col-span-6 flex flex-col justify-center space-y-4 md:space-y-6">
              <div>
                <span className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-white/50 mb-2 border-b border-white/20 pb-1">
                  {subtitle}
                </span>
                <h2 className="font-sans text-5xl md:text-7xl font-black tracking-tighter uppercase text-white leading-none">
                  {title}
                </h2>
              </div>
              <p className="font-sans text-sm md:text-base text-neutral-300 font-light leading-relaxed max-w-md">
                {bodyText}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div className="h-[1px] w-12 bg-white/30" />
                <span className="font-mono text-[11px] text-white/70 uppercase tracking-widest">
                  Distortion Active
                </span>
              </div>
            </div>
          </div>
        )}

        {layoutMode === "overlay" && (
          <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900 flex items-center justify-center">
            <img
              src={encodeURI(imageSrc)}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div className="relative z-10 text-center px-8 max-w-3xl">
              <span className="block font-mono text-xs uppercase tracking-[0.3em] text-white/70 mb-4">
                {subtitle}
              </span>
              <h2 className="font-sans text-6xl md:text-[8vw] font-black uppercase tracking-tighter text-white mb-6 leading-none">
                {title}
              </h2>
              <p className="font-sans text-sm md:text-lg text-neutral-200 font-light leading-relaxed max-w-xl mx-auto">
                {bodyText}
              </p>
            </div>
          </div>
        )}

        {layoutMode === "full-bleed" && (
          <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-white/10">
            <img
              src={encodeURI(imageSrc)}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Radial Lens Highlight Overlay */}
      {enableCursorLens && (
        <div
          ref={lensMaskRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-soft-light transition-opacity duration-300"
        />
      )}

      {/* Interactive Cue Badge */}
      <div className="absolute bottom-6 right-6 z-20 pointer-events-none hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md font-mono text-[10px] text-white/60 tracking-widest uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Move cursor / scroll to distort
      </div>
    </div>
  );
}
