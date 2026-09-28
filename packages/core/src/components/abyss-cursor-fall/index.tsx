import React, { useRef, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import { AbyssCursorFallProps } from "./types";
import { DEFAULT_IMAGES } from "./constants";
import { createCursorFallScene } from "./scene";
import styles from "./styles.module.css";

export const AbyssCursorFall: React.FC<AbyssCursorFallProps> = ({
  images = [],
  spawnDistance = 50,
  spawnInterval = 110,
  imageSize = 2.4,
  lifespan = 3.0,
  fallSpeed = 2.4,
  cameraParallax = 2.8,
  spinSpeed = 1.0,
  spawnFilter = "images-only",
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rawPool = useMemo(() => (images.length > 0 ? images : DEFAULT_IMAGES), [images]);
  const activePool = useMemo(() => {
    if (spawnFilter === "images-only") {
      const filtered = rawPool.filter((url) => !url.toLowerCase().endsWith(".svg"));
      return filtered.length > 0 ? filtered : rawPool;
    }
    if (spawnFilter === "shapes-only") {
      const filtered = rawPool.filter((url) => url.toLowerCase().endsWith(".svg"));
      return filtered.length > 0 ? filtered : rawPool;
    }
    return rawPool;
  }, [rawPool, spawnFilter]);

  const activePoolRef = useRef(activePool);
  activePoolRef.current = activePool;

  const propsRef = useRef({
    spawnDistance,
    spawnInterval,
    imageSize,
    lifespan,
    fallSpeed,
    cameraParallax,
    spinSpeed,
    spawnFilter,
  });
  propsRef.current = {
    spawnDistance,
    spawnInterval,
    imageSize,
    lifespan,
    fallSpeed,
    cameraParallax,
    spinSpeed,
    spawnFilter,
  };

  useGSAP(
    () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      return createCursorFallScene(
        container,
        canvas,
        rawPool,
        propsRef,
        activePoolRef,
        onLifecycleChange
      );
    },
    { scope: containerRef, dependencies: [rawPool] }
  );

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={style}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
};

export type { AbyssCursorFallProps };
export default AbyssCursorFall;
