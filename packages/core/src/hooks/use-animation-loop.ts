import { useEffect, useRef } from "react";
import { useLatestRef } from "./use-latest-ref";

export interface AnimationFrameState {
  time: number;
  delta: number;
}

export interface AnimationLoopOptions {
  enabled?: boolean;
  fpsCap?: number;
}

/**
 * Encapsulates requestAnimationFrame management with delta-time calculation,
 * optional frame-rate capping, and robust unmount cleanup.
 */
export function useAnimationLoop(
  callback: (state: AnimationFrameState) => void,
  options: AnimationLoopOptions = {}
) {
  const { enabled = true, fpsCap } = options;
  const callbackRef = useLatestRef(callback);
  const frameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const minInterval = fpsCap && fpsCap > 0 ? 1000 / fpsCap : 0;
    let lastFrameTime = performance.now();

    const loop = (now: number) => {
      frameIdRef.current = requestAnimationFrame(loop);

      const deltaMs = now - lastFrameTime;
      if (minInterval > 0 && deltaMs < minInterval) {
        return;
      }

      // Clamp max delta to 100ms to avoid huge physics leaps on tab switch
      const deltaSec = Math.min((now - (lastTimeRef.current ?? now)) / 1000, 0.1);
      lastTimeRef.current = now;
      lastFrameTime = now;

      callbackRef.current({
        time: now,
        delta: deltaSec,
      });
    };

    lastTimeRef.current = performance.now();
    frameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [enabled, fpsCap, callbackRef]);
}
