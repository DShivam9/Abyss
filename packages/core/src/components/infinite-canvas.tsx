import React, { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export interface InfiniteCanvasProps {
  children?: React.ReactNode;
  gridColor?: string;
  gridSize?: number;
  className?: string;
  onCoordinatesChange?: (x: number, y: number) => void;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  children,
  gridColor = "#1f2937",
  gridSize = 32,
  className = "",
  onCoordinatesChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Motion values to hold the canvas center coordinates
  const boardX = useMotionValue(0);
  const boardY = useMotionValue(0);

  // Smooth springs to interpolate coordinates
  const springX = useSpring(boardX, { stiffness: 120, damping: 22, mass: 0.8 });
  const springY = useSpring(boardY, { stiffness: 120, damping: 22, mass: 0.8 });

  // Expose coordinate changes via callback if provided
  useEffect(() => {
    if (!onCoordinatesChange) return;

    // Use onChange to subscribe to motion updates
    const unsubscribeX = boardX.onChange((x) => onCoordinatesChange(x, boardY.get()));
    const unsubscribeY = boardY.onChange((y) => onCoordinatesChange(boardX.get(), y));

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [boardX, boardY, onCoordinatesChange]);

  // Hook mouse-wheel / trackpad two-way scroll panning
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent default page scrolling or backward/forward navigation swipes
      e.preventDefault();

      // Adjust coordinate target based on delta ticks
      // Scroll down pushes content up (-delta), scroll right pushes content left (-delta)
      boardX.set(boardX.get() - e.deltaX);
      boardY.set(boardY.get() - e.deltaY);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [boardX, boardY]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing bg-[#050505] ${className}`}
    >
      {/* Draggable coordinate board */}
      <motion.div
        ref={boardRef}
        drag
        dragElastic={0.08}
        dragMomentum={true}
        dragTransition={{ power: 0.15, timeConstant: 300 }}
        style={{
          x: springX,
          y: springY,
        }}
        className="absolute w-[4000px] h-[3000px] left-1/2 top-1/2 -ml-[2000px] -mt-[1500px] flex items-center justify-center transform-gpu"
      >
        {/* SVG background grid pattern */}
        <div 
          style={{
            backgroundImage: `radial-gradient(circle, ${gridColor} 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
          className="absolute inset-0 pointer-events-none opacity-40" 
        />

        {/* Origin grid lines */}
        <div className="absolute w-[2px] h-full bg-neutral-900/30 left-1/2 -ml-[1px] pointer-events-none" />
        <div className="absolute h-[2px] w-full bg-neutral-900/30 top-1/2 -mt-[1px] pointer-events-none" />

        {/* Coordinate space container for absolute-positioned children */}
        <div className="relative w-full h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default InfiniteCanvas;
