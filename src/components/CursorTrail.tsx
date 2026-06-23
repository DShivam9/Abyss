"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";

const IMAGES = [
  "/images/editorial-reach.jpg",
  "/images/avant-garde-fashion.jpg",
  "/images/wet-skin-portrait.jpg",
  "/images/chrome-visor-portrait.jpg",
  "/images/particle-ascension.jpg",
  "/images/analogue-light-abstraction.jpg"
];
const MAX_IMAGES = 6;

export default function CursorTrail({ activeRef }: { activeRef: React.RefObject<HTMLElement | null> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef<HTMLDivElement[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const points = useRef(Array.from({ length: MAX_IMAGES }).map(() => ({ x: 0, y: 0 })));
  const isActive = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial hidden state
    gsap.set(poolRef.current, { autoAlpha: 0, scale: 0.8 });

    let isFirstMove = true;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (activeRef.current && !activeRef.current.contains(e.target as Node)) {
        if (isActive.current) {
          isActive.current = false;
          isFirstMove = true; // reset so they snap next time
          gsap.to(poolRef.current, { autoAlpha: 0, scale: 0.8, duration: 0.3, stagger: 0.02, ease: "power2.out", overwrite: "auto" });
        }
        return;
      }

      if (!isActive.current) {
        isActive.current = true;
        if (isFirstMove) {
          // Snap all points to initial mouse pos
          points.current.forEach(pt => {
            pt.x = mousePos.current.x;
            pt.y = mousePos.current.y;
          });
          isFirstMove = false;
        }
        gsap.to(poolRef.current, { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.02, ease: "power2.out", overwrite: "auto" });
      }

      // Reset the stop timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (isActive.current) {
          isActive.current = false;
          // Fade out snappier and smoother when mouse stops
          gsap.to(poolRef.current, { autoAlpha: 0, scale: 0.8, duration: 0.15, stagger: 0.015, ease: "power2.out", overwrite: "auto" });
        }
      }, 10);
    };

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    
    let rafId: number;
    
    const render = () => {
      // Unconditionally run physics so the chain keeps settling smoothly even while fading out
      
      // Leader follows mouse
      points.current[0].x = gsap.utils.interpolate(points.current[0].x, mousePos.current.x, 0.15);
      points.current[0].y = gsap.utils.interpolate(points.current[0].y, mousePos.current.y, 0.15);
      
      // Others follow the leader in a chain
      for (let i = 1; i < MAX_IMAGES; i++) {
        points.current[i].x = gsap.utils.interpolate(points.current[i].x, points.current[i - 1].x, 0.35);
        points.current[i].y = gsap.utils.interpolate(points.current[i].y, points.current[i - 1].y, 0.35);
      }
      
      // Apply positions
      poolRef.current.forEach((el, i) => {
        if (!el) return;
        
        // Add a slight rotation based on horizontal movement difference
        let dx = 0;
        if (i === 0) {
          dx = mousePos.current.x - points.current[0].x;
        } else {
          dx = points.current[i-1].x - points.current[i].x;
        }
        const rotation = gsap.utils.clamp(-15, 15, dx * 0.1);

        gsap.set(el, {
          x: points.current[i].x - 60, // center horizontally (120/2)
          y: points.current[i].y - 80, // center vertically (160/2)
          rotation: rotation
        });
      });
      
      rafId = requestAnimationFrame(render);
    };

    if (mediaQuery.matches) {
      window.addEventListener("mousemove", handleMouseMove);
      rafId = requestAnimationFrame(render);
    }
    
    const listener = (e: MediaQueryListEvent) => {
      if (e.matches) {
        window.addEventListener("mousemove", handleMouseMove);
        rafId = requestAnimationFrame(render);
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
        cancelAnimationFrame(rafId);
        gsap.set(poolRef.current, { autoAlpha: 0 });
      }
    };
    mediaQuery.addEventListener("change", listener);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      mediaQuery.removeEventListener("change", listener);
      cancelAnimationFrame(rafId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeRef]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50 hidden md:block overflow-hidden">
      {Array.from({ length: MAX_IMAGES }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) poolRef.current[i] = el;
          }}
          className="absolute top-0 left-0 w-[120px] h-[160px] opacity-0 will-change-transform overflow-hidden shadow-2xl border border-white/10"
          style={{ zIndex: MAX_IMAGES - i }}
        >
          <Image src={IMAGES[i % IMAGES.length]} alt="" fill sizes="120px" className="object-cover" />
        </div>
      ))}
    </div>
  );
}
