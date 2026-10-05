import { useEffect, useRef } from "react";
import { useLatestRef } from "./use-latest-ref";

export interface AnimationFrameState {
  time: number;
  delta: number;
}

export interface AnimationLoopOptions {
  enabled?: boolean;
}

/**
 * Encapsulates requestAnimationFrame management with delta-time calculation
 * and robust unmount cleanup.
 */
export function useAnimationLoop(
  callback: (state: AnimationFrameState) => void,
  options: AnimationLoopOptions = {}
) {
  const { enabled = true } = options;
  const callbackRef = useLatestRef(callback);
  const frameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const loop = (now: number) => {
      frameIdRef.current = requestAnimationFrame(loop);

      // Clamp max delta to 100ms to avoid huge physics leaps on tab switch
      const deltaSec = Math.min((now - (lastTimeRef.current ?? now)) / 1000, 0.1);
      lastTimeRef.current = now;

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
  }, [enabled, callbackRef]);
}
