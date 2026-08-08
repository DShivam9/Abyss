import React, { useRef, useMemo, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ApparatusArcDriftGalleryProps } from "./types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const A_IMAGES: string[] = [
  "/images/components images/scroll/a1.webp",
  "/images/components images/scroll/a2.webp",
  "/images/components images/scroll/a3.webp",
  "/images/components images/scroll/a4.webp",
  "/images/components images/scroll/a5.webp",
  "/images/components images/scroll/a6.webp",
  "/images/components images/scroll/a7.webp",
];

const EMIL_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

export const ApparatusArcDriftGallery: React.FC<ApparatusArcDriftGalleryProps> = ({
  images = [],
  thumbnailWidth = 180,
  scrollSpeed = 0.5,
  arcHeight = 45,
  bgOpacity = 0.80,
  crossfadeDuration = 1.4,
  motionVariant = "classic-arc",
  className = "",
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLImageElement | null)[]>([]);
  const bgImgARef = useRef<HTMLImageElement>(null);
  const bgImgBRef = useRef<HTMLImageElement>(null);

  const activeBgRef = useRef<"A" | "B">("A");
  const currentBgIdxRef = useRef<number>(-1);

  const accumValRef = useRef<number>(-0.15);
  const isIntroFinishedRef = useRef<boolean>(false);

  const propsRef = useRef({ thumbnailWidth, scrollSpeed, arcHeight, bgOpacity, crossfadeDuration, motionVariant });
  useEffect(() => {
    propsRef.current = { thumbnailWidth, scrollSpeed, arcHeight, bgOpacity, crossfadeDuration, motionVariant };
  }, [thumbnailWidth, scrollSpeed, arcHeight, bgOpacity, crossfadeDuration, motionVariant]);

  const galleryImages = useMemo(() => {
    return images.length === 7 ? images : A_IMAGES;
  }, [images]);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const count = galleryImages.length;
      if (count === 0) return;

      if (!isIntroFinishedRef.current) {
        slotRefs.current.forEach((imgEl) => {
          if (imgEl) gsap.set(imgEl, { opacity: 0, force3D: true });
        });

        if (bgImgARef.current) {
          bgImgARef.current.src = galleryImages[0];
          gsap.set(bgImgARef.current, { opacity: 0 });
        }
        if (bgImgBRef.current) {
          gsap.set(bgImgBRef.current, { opacity: 0 });
        }
      }

      let lastTime = performance.now();

      const updateMotion = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const currentProps = propsRef.current;

        const globalProgress = accumValRef.current * currentProps.scrollSpeed;

        let closestCenterDist = Infinity;
        let peakImageIdx = -1;

        for (let i = 0; i < count; i++) {
          const imgEl = slotRefs.current[i];
          if (!imgEl) continue;

          const rawT = i / count + globalProgress;
          const normT = ((rawT % 1) + 1) % 1;

          let x = 0;
          let y = 0;
          let scale = 1.0;

          const riseY = vh * (currentProps.arcHeight / 100);

          if (currentProps.motionVariant === "panoramic-ribbon") {
            // Panoramic Film Ribbon: Horizontal film strip across mid-screen with center-focus expansion
            const startX = -vw * 0.1;
            const endX = vw * 1.1;
            x = startX + normT * (endX - startX) - currentProps.thumbnailWidth / 2;
            y = vh * 0.48 - currentProps.thumbnailWidth * 0.5;

            const distFromCenter = Math.abs(normT - 0.5);
            const focusFactor = Math.max(0, 1 - distFromCenter * 3.2);
            scale = 0.85 + focusFactor * 0.5; // Expands to 1.35x at center peak
          } else {
            // Default Classic Horizon Arc (smooth off-screen entry & exit)
            const startX = -vw * 0.15;
            const endX = vw * 1.15;
            x = startX + normT * (endX - startX) - currentProps.thumbnailWidth / 2;

            const angle = Math.PI * (1 - normT);
            const baseY = vh * 1.0;
            y = baseY - Math.sin(angle) * riseY;
            scale = 1.0;
          }

          let opacity = Math.sin(normT * Math.PI);

          // Feather opacity smoothly to zero as images reach far viewport bounds (normT < 0.08 and normT > 0.92)
          if (normT < 0.08) {
            opacity *= Math.max(0, normT / 0.08);
          } else if (normT > 0.92) {
            opacity *= Math.max(0, (1 - normT) / 0.92);
          }

          if (opacity > 0.05) {
            const distToPeak = Math.abs(normT - 0.5);
            if (distToPeak < closestCenterDist) {
              closestCenterDist = distToPeak;
              peakImageIdx = i;
            }
          }

          gsap.set(imgEl, {
            x: x,
            y: y,
            opacity: opacity,
            scale: scale,
            force3D: true,
          });
        }

        // Active background crossfade — ONLY after intro animation has fully completed
        if (isIntroFinishedRef.current && peakImageIdx !== -1 && peakImageIdx !== currentBgIdxRef.current) {
          const newSrc = galleryImages[peakImageIdx];
          currentBgIdxRef.current = peakImageIdx;

          if (bgImgARef.current) gsap.killTweensOf(bgImgARef.current);
          if (bgImgBRef.current) gsap.killTweensOf(bgImgBRef.current);

          const targetImg = activeBgRef.current === "A" ? bgImgBRef.current : bgImgARef.current;
          const currentImg = activeBgRef.current === "A" ? bgImgARef.current : bgImgBRef.current;

          if (targetImg && currentImg) {
            targetImg.src = newSrc;

            gsap.to(currentImg, {
              opacity: 0,
              duration: currentProps.crossfadeDuration * 0.8,
              ease: "power1.inOut",
              overwrite: true,
            });

            gsap.to(targetImg, {
              opacity: currentProps.bgOpacity,
              duration: currentProps.crossfadeDuration,
              ease: "power1.inOut",
              overwrite: true,
            });

            activeBgRef.current = activeBgRef.current === "A" ? "B" : "A";
          }
        }
      };

      let introProgress = 0;
      let targetVelocity = 0;
      let currentVelocity = 0;

      const handleWheel = (e: WheelEvent) => {
        targetVelocity += e.deltaY * 0.008 * (propsRef.current.scrollSpeed || 1);
      };
      window.addEventListener("wheel", handleWheel, { passive: true });

      let animId: number;
      const render = (now: number) => {
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        if (!isIntroFinishedRef.current) {
          introProgress += dt / 2.4;
          if (introProgress >= 1.0) {
            introProgress = 1.0;
            isIntroFinishedRef.current = true;
          }
          // Smooth 120 FPS cubic ease-out
          const easedT = 1 - Math.pow(1 - introProgress, 3);
          accumValRef.current = -0.15 + easedT * (0.95 - (-0.15));
          updateMotion();
        } else {
          // Frame-rate independent spring interpolation (GEMINI 6.1 rule)
          const smooth = 1 - Math.pow(1 - 0.22, dt * 60);
          currentVelocity += (targetVelocity - currentVelocity) * smooth;

          const ambientDrift = dt * 0.02 * (propsRef.current.scrollSpeed || 1);
          accumValRef.current += ambientDrift + currentVelocity * dt;

          // Exponential friction decay for natural physical coast and settle
          targetVelocity *= Math.pow(0.93, dt * 60);
          if (Math.abs(targetVelocity) < 0.00001) targetVelocity = 0;

          updateMotion();
        }

        animId = requestAnimationFrame(render);
      };

      animId = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("wheel", handleWheel);
      };
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden bg-[#0A0A0A] select-none ${className}`}
      style={style}
    >
      {/* Background crossfade layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          ref={bgImgARef}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: 0 }}
        />
        <img
          ref={bgImgBRef}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: 0 }}
        />
      </div>

      {/* 7 unique thumbnails moving on path */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {galleryImages.map((src, i) => (
          <img
            key={i}
            ref={(el) => { slotRefs.current[i] = el; }}
            src={src}
            alt=""
            className="absolute top-0 left-0 block will-change-transform"
            style={{
              width: `${thumbnailWidth}px`,
              opacity: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ApparatusArcDriftGallery;
