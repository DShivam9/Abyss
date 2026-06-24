"use client";

import { useMotionValue, useSpring, MotionValue } from "framer-motion";
import { useCallback } from "react";

interface NormalizedMouseOptions {
  stiffness?: number;
  damping?: number;
  mode?: "viewport" | "element";
}

interface NormalizedMouseResult {
  x: MotionValue<number>;
  y: MotionValue<number>;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
}

export function useNormalizedMouse({
  stiffness = 150,
  damping = 20,
  mode = "element",
}: NormalizedMouseOptions = {}): NormalizedMouseResult {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness, damping });
  const springY = useSpring(y, { stiffness, damping });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (window.innerWidth < 768) return;

      if (mode === "element") {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) / (rect.width / 2));
        y.set((e.clientY - centerY) / (rect.height / 2));
      } else {
        x.set((e.clientX / window.innerWidth - 0.5) * 2);
        y.set((e.clientY / window.innerHeight - 0.5) * 2);
      }
    },
    [x, y, mode]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { x, y, springX, springY, handleMouseMove, handleMouseLeave };
}
