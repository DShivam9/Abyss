"use client";

import { useRef, useEffect } from "react";
import { CycloramaMatrixProps } from "./types";
import { usePerformance } from "../../engine/PerformanceProvider";
import { useLatestRef } from "../../hooks/use-latest-ref";
import {
  DEFAULT_RADIUS_X,
  DEFAULT_RADIUS_Y,
  DEFAULT_BASE_CAM_Z,
  DEFAULT_ZOOM_OUT_CAM_Z,
  DEFAULT_FRICTION_PER_SEC,
  DEFAULT_MEDIA_DEF,
  DEFAULT_ASSET_META
} from "./constants";
import { createCycloramaMatrixScene, CycloramaMatrixSceneHandle } from "./scene";
import styles from "./styles.module.css";

export type { CycloramaMatrixProps };

export default function CycloramaMatrix({
  media = DEFAULT_MEDIA_DEF,
  metadata = DEFAULT_ASSET_META,
  radiusX = DEFAULT_RADIUS_X,
  radiusY = DEFAULT_RADIUS_Y,
  baseCamZ = DEFAULT_BASE_CAM_Z,
  zoomCamZ = DEFAULT_ZOOM_OUT_CAM_Z,
  friction = DEFAULT_FRICTION_PER_SEC,
  className = "",
  style,
  onCardClick
}: CycloramaMatrixProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fogVeilRef = useRef<HTMLDivElement>(null);
  const sceneHandleRef = useRef<CycloramaMatrixSceneHandle | null>(null);

  const perf = usePerformance();
  const perfRef = useLatestRef(perf);
  const onCardClickRef = useLatestRef(onCardClick);

  useEffect(() => {
    if (sceneHandleRef.current) {
      sceneHandleRef.current.updateDpr(perf.dpr);
    }
  }, [perf.dpr]);

  useEffect(() => {
    if (sceneHandleRef.current) {
      sceneHandleRef.current.updateProps({
        radiusX,
        radiusY,
        baseCamZ,
        zoomCamZ,
        friction,
        onCardClick: onCardClickRef.current,
        reducedMotion: perfRef.current.reducedMotion
      });
    }
  }, [radiusX, radiusY, baseCamZ, zoomCamZ, friction, onCardClickRef, perfRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handle = createCycloramaMatrixScene({
      canvas,
      container,
      fogVeil: fogVeilRef.current,
      media,
      metadata,
      radiusX,
      radiusY,
      baseCamZ,
      zoomCamZ,
      friction,
      onCardClick: (index, meta) => onCardClickRef.current?.(index, meta),
      tier: perfRef.current.tier,
      dpr: perfRef.current.dpr,
      reducedMotion: perfRef.current.reducedMotion
    });

    sceneHandleRef.current = handle;

    return () => {
      handle.dispose();
      sceneHandleRef.current = null;
    };
  }, [media, metadata]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`.trim()}
      style={style}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={fogVeilRef} className={styles.fogVeil} />
    </div>
  );
}
