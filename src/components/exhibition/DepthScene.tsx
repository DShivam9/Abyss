"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";

export default function DepthScene() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 100, damping: 30 });
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  const bgX = useTransform(springX, [-1, 1], [-10, 10]);
  const bgY = useTransform(springY, [-1, 1], [-10, 10]);
  
  const midX = useTransform(springX, [-1, 1], [-25, 25]);
  const midY = useTransform(springY, [-1, 1], [-25, 25]);

  const fgX = useTransform(springX, [-1, 1], [-45, 45]);
  const fgY = useTransform(springY, [-1, 1], [-45, 45]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) return;
    const normX = (e.clientX / window.innerWidth - 0.5) * 2;
    const normY = (e.clientY / window.innerHeight - 0.5) * 2;
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
      style={{ perspective: 1500 }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h2 className="depth-scene-text font-cormorant text-[15vw] md:text-[12vw] leading-none text-white mix-blend-difference opacity-20 md:opacity-0 translate-y-0 md:translate-y-8">
          DIMENSION
        </h2>
      </div>

      <div className="relative w-[80vw] h-[50vh] md:w-[35vw] md:h-[60vh] z-20">
        {/* Background Layer (Static/Base) */}
        <motion.div 
          className="depth-layer-bg absolute inset-0 rounded-sm overflow-hidden shadow-2xl"
          style={{ x: bgX, y: bgY }}
        >
          <Image src="/images/wet-skin-portrait.jpg" alt="Base" fill className="object-cover opacity-50 blur-[2px]" sizes="(max-width: 768px) 80vw, 50vw" />
        </motion.div>

        {/* Midground Layer (Masked middle) */}
        <motion.div 
          className="depth-layer-mid absolute inset-0 rounded-sm overflow-hidden shadow-2xl [clip-path:inset(5%)] md:[clip-path:none]"
          style={{ x: midX, y: midY }}
        >
          <Image src="/images/wet-skin-portrait.jpg" alt="Mid" fill className="object-cover" sizes="(max-width: 768px) 80vw, 50vw" />
        </motion.div>

        {/* Foreground Layer (Masked center focus) */}
        <motion.div 
          className="depth-layer-fg absolute inset-0 rounded-sm overflow-hidden shadow-xl [clip-path:inset(15%)] md:[clip-path:none]"
          style={{ x: fgX, y: fgY }}
        >
          <Image src="/images/wet-skin-portrait.jpg" alt="Foreground" fill className="object-cover" sizes="(max-width: 768px) 80vw, 50vw" />
        </motion.div>
      </div>
    </div>
  );
}
