import { useEffect, useRef } from "react";

// ponytail: centralized ref-counted scroll lock for overlays
export function useScrollLock(locked: boolean) {
  const lockCountRef = useRef(0);

  useEffect(() => {
    const getLenis = () =>
      (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;

    if (locked) {
      lockCountRef.current++;
      if (lockCountRef.current === 1) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        getLenis()?.stop();
      }
    }

    return () => {
      if (locked) {
        lockCountRef.current = Math.max(0, lockCountRef.current - 1);
        if (lockCountRef.current === 0) {
          document.body.style.overflow = "";
          document.documentElement.style.overflow = "";
          requestAnimationFrame(() => {
            getLenis()?.start();
          });
        }
      }
    };
  }, [locked]);
}
