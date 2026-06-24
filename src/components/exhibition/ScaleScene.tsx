"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { IMAGES } from "@/lib/images";

export default function ScaleScene() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 20 });
  const springY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateY = useTransform(springX, [-1, 1], [-5, 5]);
  const rotateX = useTransform(springY, [-1, 1], [5, -5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normX = (e.clientX - centerX) / (rect.width / 2);
    const normY = (e.clientY - centerY) / (rect.height / 2);
    x.set(normX);
    y.set(normY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      className="relative md:absolute md:inset-0 w-full h-[60vh] md:h-full flex items-center justify-center pointer-events-auto"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h2 className="scale-scene-text font-cormorant text-[15vw] md:text-[12vw] leading-none text-white mix-blend-difference opacity-20 md:opacity-0 translate-y-0 md:translate-y-8">
          PROPORTION
        </h2>
      </div>

      <motion.div 
        className="scale-scene-wrapper relative z-20"
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="scale-scene-img relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-sm w-[80vw] h-[50vh] md:w-[30vw] md:h-[40vh]"
          style={{ rotateX, rotateY }}
        >
          <Image 
            src={IMAGES.avantGardeFashion} 
            alt="Scale Scene" 
            fill 
            sizes="(max-width: 768px) 80vw, 50vw"
            className="object-cover"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
