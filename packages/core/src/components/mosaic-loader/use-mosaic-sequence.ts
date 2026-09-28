import { useEffect, useRef, useCallback, RefObject, MutableRefObject } from "react";
import { POSITIONS } from "./constants";
import { usePerformance } from "../../engine/PerformanceProvider";

export interface UseMosaicSequenceParams {
  images: string[];
  editorialImages: string[];
  duration: number;
  startDelay: number;
  onComplete?: () => void;
  preloaderStageRef: RefObject<HTMLDivElement | null>;
  contentStageRef: RefObject<HTMLDivElement | null>;
  centerHudRef: RefObject<HTMLDivElement | null>;
  odometerWrapRef: RefObject<HTMLDivElement | null>;
  trackHundredsRef: RefObject<HTMLDivElement | null>;
  trackTensRef: RefObject<HTMLDivElement | null>;
  trackOnesRef: RefObject<HTMLDivElement | null>;
  colHundredsRef: RefObject<HTMLDivElement | null>;
  colTensRef: RefObject<HTMLDivElement | null>;
  cardRefs: MutableRefObject<(HTMLImageElement | null)[]>;
}

export function useMosaicSequence({
  images,
  editorialImages,
  duration,
  startDelay,
  onComplete,
  preloaderStageRef,
  contentStageRef,
  centerHudRef,
  odometerWrapRef,
  trackHundredsRef,
  trackTensRef,
  trackOnesRef,
  colHundredsRef,
  colTensRef,
  cardRefs,
}: UseMosaicSequenceParams) {
  const perf = usePerformance();
  const perfRef = useRef(perf);
  perfRef.current = perf;

  const imagesRef = useRef<string[]>(images);
  imagesRef.current = images;

  const animIdRef = useRef<number | null>(null);
  const isSequenceActiveRef = useRef<boolean>(true);
  const isImplodingTriggeredRef = useRef<boolean>(false);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });
  const lastOdometerValRef = useRef<number>(-1);

  const setOdometer = useCallback((val: number) => {
    const v = Math.min(Math.max(val, 0), 100);
    if (v === lastOdometerValRef.current) return;
    lastOdometerValRef.current = v;

    const hundreds = Math.floor(v / 100);
    const tens = Math.floor((v % 100) / 10);
    const ones = v % 10;

    if (trackHundredsRef.current) trackHundredsRef.current.style.transform = `translateY(-${hundreds * 50}%)`;
    if (trackTensRef.current) trackTensRef.current.style.transform = `translateY(-${tens * 10}%)`;
    if (trackOnesRef.current) trackOnesRef.current.style.transform = `translateY(-${ones * 10}%)`;

    if (colHundredsRef.current) {
      colHundredsRef.current.style.display = v >= 100 ? "inline-block" : "none";
    }
    if (colTensRef.current) {
      colTensRef.current.style.display = v >= 10 ? "inline-block" : "none";
    }
  }, [trackHundredsRef, trackTensRef, trackOnesRef, colHundredsRef, colTensRef]);

  const runSequence = useCallback(() => {
    if (animIdRef.current) cancelAnimationFrame(animIdRef.current);

    const hud = centerHudRef.current;
    const odo = odometerWrapRef.current;
    const preloaderStage = preloaderStageRef.current;
    const contentStage = contentStageRef.current;
    const pool = imagesRef.current;

    if (preloaderStage) {
      preloaderStage.classList.remove("is-sliding-up");
      preloaderStage.style.display = "";
      preloaderStage.style.transform = "";
    }
    if (contentStage) {
      contentStage.classList.remove("is-revealed", "is-settled");
      contentStage.style.transform = "";
    }
    if (hud) {
      hud.style.opacity = "";
      hud.style.filter = "";
      hud.style.display = "";
      hud.style.transform = "";
    }
    if (odo) {
      odo.classList.remove("is-faded-out");
      odo.style.opacity = "";
      odo.style.filter = "";
      odo.style.display = "";
    }
    if (trackHundredsRef.current) trackHundredsRef.current.style.transform = "translateY(0%)";
    if (trackTensRef.current) trackTensRef.current.style.transform = "translateY(0%)";
    if (trackOnesRef.current) trackOnesRef.current.style.transform = "translateY(0%)";
    if (colHundredsRef.current) colHundredsRef.current.style.display = "none";
    if (colTensRef.current) colTensRef.current.style.display = "none";

    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];

    isSequenceActiveRef.current = true;
    isImplodingTriggeredRef.current = false;
    lastOdometerValRef.current = -1;
    let hasLockedFinalUnique = false;

    const safeTimeout = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      timeoutIdsRef.current.push(id);
      return id;
    };

    setOdometer(0);

    const slotStates = POSITIONS.map((pos, i) => {
      const el = cardRefs.current[i];
      if (el) {
        el.className = "mosaic-card-img";
        el.style.display = "";
        el.style.opacity = "";
        el.style.filter = "";
        el.style.transform = "translate3d(-50%, -50%, 0)";
        el.src = pool[pos.initialIdx % pool.length] || pool[0] || "";
      }
      return {
        pos,
        spawnDelay: pos.spawnDelay,
        depthFactor: pos.depthFactor,
        isSpawned: false,
        currentIndex: pos.initialIdx % pool.length,
        lastSwapTime: 0,
        baseSpeed: 50 + (i % 5) * 15,
      };
    });

    const startTime = performance.now() + startDelay;

    const getContinuousPercentage = (elapsed: number): number => {
      const p = Math.min(Math.max(elapsed / duration, 0), 1);
      if (p < 0.72) {
        return (p / 0.72) * 80;
      } else {
        const sub = (p - 0.72) / 0.28;
        const easeOut = 1 - Math.pow(1 - sub, 2.8);
        return 80 + easeOut * 20;
      }
    };

    let lastTickTime = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - lastTickTime) / 1000, 0.1);
      lastTickTime = now;
      const mouseDamp = 1 - Math.pow(1 - 0.08, dt * 60);

      mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * mouseDamp;
      mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * mouseDamp;

      if (now < startTime) {
        animIdRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - startTime;

      if (isSequenceActiveRef.current) {
        const isMotionReduced = perfRef.current.reducedMotion;
        const isLowTier = perfRef.current.tier === "low";

        slotStates.forEach((slot, i) => {
          const el = cardRefs.current[i];
          if (elapsed >= slot.spawnDelay && !slot.isSpawned && el) {
            slot.isSpawned = true;
            el.classList.add("is-entered");
            slot.lastSwapTime = now;
          }

          if (slot.isSpawned && !isImplodingTriggeredRef.current && el) {
            const px = isMotionReduced ? 0 : mouseCurrentRef.current.x * 14 * slot.depthFactor;
            const py = isMotionReduced ? 0 : mouseCurrentRef.current.y * 14 * slot.depthFactor;
            const rot = isMotionReduced ? 0 : slot.pos.rot;
            el.style.transform = `translate3d(calc(-50% + ${px.toFixed(1)}px), calc(-50% + ${py.toFixed(1)}px), 0) rotate(${rot}deg)`;
          }
        });

        if (!isImplodingTriggeredRef.current && hud) {
          const hudPx = isMotionReduced ? 0 : mouseCurrentRef.current.x * 7;
          const hudPy = isMotionReduced ? 0 : mouseCurrentRef.current.y * 7;
          hud.style.transform = `translate3d(calc(-50% + ${hudPx.toFixed(1)}px), calc(-50% + ${hudPy.toFixed(1)}px), 0)`;
        }

        const exactPct = Math.min(getContinuousPercentage(elapsed), 100);
        const intPct = Math.floor(exactPct);
        setOdometer(intPct);

        let currentInterval: number;
        if (intPct < 40) currentInterval = 110;
        else if (intPct < 60) currentInterval = 110 + ((intPct - 40) / 20) * 75;
        else if (intPct < 80) currentInterval = 185 + ((intPct - 60) / 20) * 115;
        else currentInterval = 300 + ((intPct - 80) / 20) * 180;

        if (isLowTier) currentInterval *= 1.8;

        if (intPct < 96) {
          slotStates.forEach((slot, i) => {
            const el = cardRefs.current[i];
            if (slot.isSpawned && el && (now - slot.lastSwapTime >= (currentInterval + (slot.baseSpeed % 25)))) {
              slot.lastSwapTime = now;
              let nextIdx = Math.floor(Math.random() * pool.length);
              if (nextIdx === slot.currentIndex) nextIdx = (nextIdx + 1) % pool.length;
              slot.currentIndex = nextIdx;
              el.src = pool[slot.currentIndex] || "";
            }
          });
        } else if (!hasLockedFinalUnique) {
          hasLockedFinalUnique = true;
          const poolIndices = Array.from({ length: pool.length }, (_, k) => k);
          for (let k = poolIndices.length - 1; k > 0; k--) {
            const j = Math.floor(Math.random() * (k + 1));
            [poolIndices[k], poolIndices[j]] = [poolIndices[j], poolIndices[k]];
          }
          slotStates.forEach((slot, idx) => {
            const el = cardRefs.current[idx];
            slot.currentIndex = poolIndices[idx % poolIndices.length];
            if (el) el.src = pool[slot.currentIndex] || "";
          });
        }

        if (intPct >= 100 && !isImplodingTriggeredRef.current) {
          isSequenceActiveRef.current = false;
          setOdometer(100);

          safeTimeout(() => {
            isImplodingTriggeredRef.current = true;
            if (hud) {
              hud.style.transform = "";
            }

            if (preloaderStage) {
              preloaderStage.classList.add("is-sliding-up");
            }
            if (contentStage) {
              contentStage.classList.add("is-revealed");
            }

            if (onCompleteRef.current) {
              onCompleteRef.current();
            }

            safeTimeout(() => {
              if (contentStage) {
                contentStage.classList.add("is-settled");
              }
            }, 1600);

            safeTimeout(() => {
              if (preloaderStage) preloaderStage.style.display = "none";
            }, 1400);
          }, 140);
        }
      } else {
        animIdRef.current = null;
        return;
      }

      animIdRef.current = requestAnimationFrame(tick);
    };

    animIdRef.current = requestAnimationFrame(tick);
  }, [
    setOdometer,
    startDelay,
    duration,
    centerHudRef,
    odometerWrapRef,
    preloaderStageRef,
    contentStageRef,
    trackHundredsRef,
    trackTensRef,
    trackOnesRef,
    colHundredsRef,
    colTensRef,
    cardRefs,
  ]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      mouseTargetRef.current.x = (e.clientX / w - 0.5) * 2;
      mouseTargetRef.current.y = (e.clientY / h - 0.5) * 2;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let isCancelled = false;
    const allUrls = [...images, ...editorialImages];
    Promise.all(
      allUrls.map(
        (url) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.src = url;
            if (img.decode) {
              img.decode().then(resolve).catch(resolve);
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          })
      )
    ).then(() => {
      if (!isCancelled) {
        runSequence();
      }
    });

    return () => {
      isCancelled = true;
      window.removeEventListener("mousemove", onMouseMove);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      timeoutIdsRef.current.forEach(clearTimeout);
      timeoutIdsRef.current = [];
    };
  }, [images, editorialImages, runSequence]);
}
