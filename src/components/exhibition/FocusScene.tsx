"use client";

import { motion, useTransform, useMotionTemplate } from "framer-motion";
import Image from "next/image";
import { IMAGES } from "@/lib/images";
import { useNormalizedMouse } from "@/hooks/useNormalizedMouse";

export default function FocusScene() {
  const { springX, springY, handleMouseMove, handleMouseLeave } = useNormalizedMouse({
    stiffness: 200,
    damping: 25,
    mode: "element",
  });

  const maskX = useTransform(springX, [-1, 1], [0, 100]);
  const maskY = useTransform(springY, [-1, 1], [0, 100]);

  const maskImage = useMotionTemplate`radial-gradient(circle at ${maskX}% ${maskY}%, black 0%, transparent var(--focus-radius, 25%))`;

  return (
    <div 
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
            src={IMAGES.chromeVisorPortrait} 
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
            src={IMAGES.chromeVisorPortrait} 
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
