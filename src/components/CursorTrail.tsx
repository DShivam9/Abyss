"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import Image from "next/image";
import { IMAGES } from "@/lib/images";

// Expanded to 13 varied images for a longer, richer trail
const CURSOR_IMAGES = [
  IMAGES.silverVisorPortrait,
  IMAGES.chunkyBootsFashion,
  IMAGES.baggyDenimFashion,
  IMAGES.chunkyBootsFashion,
  IMAGES.editorialReach,
  IMAGES.skateboardDollarGraphic,
  IMAGES.baggyDenimFashion,
  IMAGES.skateboardDollarGraphic,
  IMAGES.editorialReach,
  IMAGES.avantGardeFashion,
  IMAGES.wetSkinPortrait,
  IMAGES.chromeVisorPortrait,
];

// Increased max images so we don't recycle them while they are still fading out
const MAX_IMAGES = 20;

export default function CursorTrail({ activeRef }: { activeRef: React.RefObject<HTMLElement | null> }) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef<HTMLDivElement[]>([]);
  
  const lastPos = useRef({ x: 0, y: 0 });
  const currentIndex = useRef(0);
  const zIndexCounter = useRef(100);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Hide all initially
    gsap.set(poolRef.current, { autoAlpha: 0, scale: 0.5 });

    const handleMouseMove = (e: MouseEvent) => {
      if (activeRef.current && !activeRef.current.contains(e.target as Node)) {
        return; // Don't drop images if outside the active area
      }

      // Calculate distance from last dropped image
      const dist = Math.hypot(e.clientX - lastPos.current.x, e.clientY - lastPos.current.y);
      
      // If we moved enough distance, drop a new image
      if (dist > 75) {
        lastPos.current = { x: e.clientX, y: e.clientY };
        
        const el = poolRef.current[currentIndex.current];
        if (!el) return;

        // Bring the new image to the front
        zIndexCounter.current += 1;
        
        // Random rotation for a scattered editorial feel
        const rotation = Math.random() * 30 - 15;

        // Stop any active animations on this specific image
        gsap.killTweensOf(el);
        
        // Position it exactly where the mouse is
        gsap.set(el, {
          x: e.clientX - 60, // center horizontally
          y: e.clientY - 80, // center vertically
          zIndex: zIndexCounter.current,
          rotation: rotation,
        });

        // Pop in animation
        gsap.fromTo(el, 
          { scale: 0.2, autoAlpha: 0 }, 
          { scale: 1, autoAlpha: 1, duration: 0.4, ease: "expo.out" }
        );

        // Automatically fade out and scale down after a short delay
        gsap.to(el, {
          scale: 0.4,
          autoAlpha: 0,
          duration: 0.5,
          ease: "power2.inOut",
          delay: 0.6
        });

        // Move to the next image in the pool
        currentIndex.current = (currentIndex.current + 1) % MAX_IMAGES;
      }
    };

    const mediaQuery = window.matchMedia("(min-width: 768px)");

    if (mediaQuery.matches) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    
    const listener = (e: MediaQueryListEvent) => {
      if (e.matches) {
        window.addEventListener("mousemove", handleMouseMove);
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
        gsap.set(poolRef.current, { autoAlpha: 0 }); // Hide immediately on mobile
      }
    };
    mediaQuery.addEventListener("change", listener);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      mediaQuery.removeEventListener("change", listener);
    };
  }, [activeRef, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9999] hidden md:block overflow-hidden">
      {Array.from({ length: MAX_IMAGES }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) poolRef.current[i] = el;
          }}
          className="absolute top-0 left-0 w-[120px] h-[160px] opacity-0 will-change-transform overflow-hidden shadow-2xl border border-white/10"
        >
          <Image src={CURSOR_IMAGES[i % CURSOR_IMAGES.length]} alt="" fill sizes="120px" className="object-cover" />
        </div>
      ))}
    </div>,
    document.body
  );
}
