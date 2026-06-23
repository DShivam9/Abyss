"use client";

import { motion } from "framer-motion";

interface BrandLogoProps {
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const PATH = "M 4 36 L 16 4 L 24 4 L 36 36 L 26 36 L 23 26 L 17 26 L 14 36 Z M 20 12 L 18 20 L 22 20 Z";

export default function BrandLogo({ onClick }: BrandLogoProps) {
  const springConfig = { type: "spring", stiffness: 400, damping: 25 };

  return (
    <a
      href="#arrival"
      onClick={onClick}
      className="flex items-center gap-4 md:gap-5 group pointer-events-auto cursor-pointer"
    >
      {/* The Fractured 'A' */}
      <motion.div 
        className="relative w-8 h-8 md:w-10 md:h-10 shrink-0"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        {/* Top Slice */}
        <motion.svg
          viewBox="0 0 40 40"
          className="absolute inset-0 w-full h-full text-current"
          style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 35.5%, 0% 50.5%)" }}
          variants={{
            rest: { x: 0, y: 0 },
            hover: { x: -3, y: -2, transition: springConfig }
          }}
        >
          <path d={PATH} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
        </motion.svg>

        {/* Middle Slice */}
        <motion.svg
          viewBox="0 0 40 40"
          className="absolute inset-0 w-full h-full text-current"
          style={{ clipPath: "polygon(0% 50%, 100% 35%, 100% 65.5%, 0% 80.5%)" }}
          variants={{
            rest: { x: 0, y: 0 },
            hover: { x: 3, y: 0, transition: { ...springConfig, delay: 0.02 } }
          }}
        >
          <path d={PATH} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
        </motion.svg>

        {/* Bottom Slice */}
        <motion.svg
          viewBox="0 0 40 40"
          className="absolute inset-0 w-full h-full text-current"
          style={{ clipPath: "polygon(0% 80%, 100% 65%, 100% 100%, 0% 100%)" }}
          variants={{
            rest: { x: 0, y: 0 },
            hover: { x: -2, y: 2, transition: { ...springConfig, delay: 0.04 } }
          }}
        >
          <path d={PATH} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
        </motion.svg>
      </motion.div>

      {/* 1px Vertical Divider */}
      <div className="w-[1px] h-8 bg-current opacity-20 group-hover:opacity-40 transition-all duration-700 shrink-0 hidden sm:block origin-top"></div>

      {/* Premium Typography Lockup */}
      <div className="flex flex-col justify-center">
        <span className="font-sans text-[11px] md:text-xs tracking-[0.3em] uppercase text-current flex items-center gap-1.5 transition-colors duration-500">
          <span className="font-black">ABSOLUTE</span>
          <span className="font-light opacity-60 group-hover:opacity-100 transition-opacity duration-500">UI</span>
        </span>
      </div>
    </a>
  );
}
