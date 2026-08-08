import React, { useRef, useMemo, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ApparatusArcDriftGalleryProps } from "./types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
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

  const accumValRef = useRef<number>(-1.5);
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

      let scrollOffset = 0;
      let currentDriftSpeed = 95;
      let targetDriftSpeed = 95;
      let lastTime = performance.now();

      const updateMotion = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const currentProps = propsRef.current;

        const globalProgress = (accumValRef.current + scrollOffset * 0.0003) * currentProps.scrollSpeed;

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
            // Default Classic Horizon Arc (100% untouched)
            const startX = -vw * 0.06;
            const endX = vw * 1.06;
            x = startX + normT * (endX - startX) - currentProps.thumbnailWidth / 2;

            const angle = Math.PI * (1 - normT);
            const baseY = vh * 1.0;
            y = baseY - Math.sin(angle) * riseY;
            scale = 1.0;
          }

          let opacity = Math.sin(normT * Math.PI);

          if (!isIntroFinishedRef.current && rawT < 0) {
            opacity = 0;
          } else if (!isIntroFinishedRef.current && rawT >= 0 && rawT < 0.15) {
            const entryProgress = rawT / 0.15;
            scale *= 0.95 + entryProgress * 0.05;
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

        // Active background crossfade
        if (peakImageIdx !== -1 && peakImageIdx !== currentBgIdxRef.current) {
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

      let introTween: gsap.core.Tween | null = null;
      if (!isIntroFinishedRef.current) {
        introTween = gsap.to(accumValRef, {
          current: 0.0,
          duration: 2.0,
          ease: EMIL_EASE,
          onUpdate: () => {
            updateMotion();
          },
          onComplete: () => {
            isIntroFinishedRef.current = true;
          },
        });
      }

      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=500000",
        pin: true,
        scrub: 1.0,
        onUpdate: (self) => {
          scrollOffset = self.scroll();

          if (self.direction === 1) {
            targetDriftSpeed = 95;
          } else if (self.direction === -1) {
            targetDriftSpeed = -95;
          }
        },
      });

      let animId: number;
      const render = (now: number) => {
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        if (isIntroFinishedRef.current) {
          currentDriftSpeed += (targetDriftSpeed - currentDriftSpeed) * 0.05;
          accumValRef.current += dt * currentDriftSpeed * 0.0003;
          updateMotion();
        }

        animId = requestAnimationFrame(render);
      };

      animId = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(animId);
        if (introTween) introTween.kill();
        trigger.kill();
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
