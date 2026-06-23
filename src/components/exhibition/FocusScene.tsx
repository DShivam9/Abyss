"use client";

import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function FocusScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  const maskX = useSpring(useMotionValue(50), { stiffness: 200, damping: 25 });
  const maskY = useSpring(useMotionValue(50), { stiffness: 200, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (window.innerWidth < 768 || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;
    maskX.set(normX * 100);
    maskY.set(normY * 100);
  };

  const handleMouseLeave = () => {
    maskX.set(50);
    maskY.set(50);
  };

  const maskImage = useMotionTemplate`radial-gradient(circle at ${maskX}% ${maskY}%, black 0%, transparent var(--focus-radius, 25%))`;

  return (
    <div 
      ref={containerRef}
      className="relative md:absolute md:inset-0 w-full h-[60vh] md:h-full flex items-center justify-center pointer-events-auto"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h2 className="focus-scene-text font-cormorant text-[15vw] md:text-[12vw] leading-none text-white mix-blend-difference opacity-20 md:opacity-0 translate-y-0 md:translate-y-8">
          CLARITY
        </h2>
      </div>

      <div 
        className="relative w-[80vw] h-[50vh] md:w-[45vw] md:h-[75vh] focus-scene-container z-20" 
        style={{ "--focus-radius": "35%" } as React.CSSProperties}
      >
        {/* Out of focus background */}
        <div className="absolute inset-0 overflow-hidden rounded-sm">
          <Image 
            src="/images/chrome-visor-portrait.jpg" 
            alt="Out of focus" 
            fill 
            className="object-cover blur-md opacity-40 grayscale" 
            sizes="(max-width: 768px) 80vw, 50vw" 
          />
        </div>

        {/* In focus foreground (masked) */}
        <motion.div 
          className="absolute inset-0 overflow-hidden rounded-sm focus-lens-layer"
          style={{
            WebkitMaskImage: maskImage,
            maskImage: maskImage,
          }}
        >
          <Image 
            src="/images/chrome-visor-portrait.jpg" 
            alt="In focus" 
            fill 
            className="object-cover focus-sharp-image scale-110 md:scale-125" 
            sizes="(max-width: 768px) 80vw, 50vw" 
          />
        </motion.div>
      </div>
    </div>
  );
}
