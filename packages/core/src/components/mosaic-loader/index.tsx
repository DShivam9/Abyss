"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MosaicLoaderProps } from "./types";
import { DEFAULT_IMAGES, DEFAULT_EDITORIAL_LINES, DEFAULT_EDITORIAL_IMAGES, POSITIONS } from "./constants";
import "./mosaic-loader.css";

export type { MosaicLoaderProps };

export default function MosaicLoader({
  images = DEFAULT_IMAGES,
  title,
  lines = DEFAULT_EDITORIAL_LINES,
  editorialImages = DEFAULT_EDITORIAL_IMAGES,
  duration = 6200,
  startDelay = 800,
  onComplete,
  className = "",
  style
}: MosaicLoaderProps) {
  const preloaderStageRef = useRef<HTMLDivElement>(null);
  const contentStageRef = useRef<HTMLDivElement>(null);
  const centerHudRef = useRef<HTMLDivElement>(null);
  const odometerWrapRef = useRef<HTMLDivElement>(null);
  const trackHundredsRef = useRef<HTMLDivElement>(null);
  const trackTensRef = useRef<HTMLDivElement>(null);
  const trackOnesRef = useRef<HTMLDivElement>(null);
  const colHundredsRef = useRef<HTMLDivElement>(null);
  const colTensRef = useRef<HTMLDivElement>(null);

  const imagesRef = useRef<string[]>(images);
  imagesRef.current = images;

  const [cards] = useState(() =>
    POSITIONS.map((pos, i) => ({
      ...pos,
      id: i
    }))
  );

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const displayLines = lines || (title ? [title] : DEFAULT_EDITORIAL_LINES);
  const cardRefs = useRef<(HTMLImageElement | null)[]>([]);
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
  }, []);

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
        baseSpeed: 50 + (i % 5) * 15
      };
    });

    const startTime = performance.now() + startDelay;

    const getContinuousPercentage = (elapsed: number): number => {
      const p = Math.min(Math.max(elapsed / duration, 0), 1);
      // Smooth continuous count: linear acceleration to 80%, gentle Swiss deceleration to 100%
      if (p < 0.72) {
        return (p / 0.72) * 80;
      } else {
        const sub = (p - 0.72) / 0.28;
        const easeOut = 1 - Math.pow(1 - sub, 2.8);
        return 80 + easeOut * 20;
      }
    };

    const tick = (now: number) => {
      mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.08;
      mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.08;

      if (now < startTime) {
        animIdRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - startTime;

      if (isSequenceActiveRef.current) {
        slotStates.forEach((slot, i) => {
          const el = cardRefs.current[i];
          if (elapsed >= slot.spawnDelay && !slot.isSpawned && el) {
            slot.isSpawned = true;
            el.classList.add("is-entered");
            slot.lastSwapTime = now;
          }

          if (slot.isSpawned && !isImplodingTriggeredRef.current && el) {
            const px = mouseCurrentRef.current.x * 14 * slot.depthFactor;
            const py = mouseCurrentRef.current.y * 14 * slot.depthFactor;
            el.style.transform = `translate3d(calc(-50% + ${px.toFixed(1)}px), calc(-50% + ${py.toFixed(1)}px), 0) rotate(${slot.pos.rot}deg)`;
          }
        });

        if (!isImplodingTriggeredRef.current && hud) {
          const hudPx = mouseCurrentRef.current.x * 7;
          const hudPy = mouseCurrentRef.current.y * 7;
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

            // Trigger physical curtain slide: Section 1 pulls up, Section 2 slides into view
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
  }, [setOdometer, startDelay, duration]);

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

  return (
    <div
      className={`mosaic-loader-root ${className}`}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 20,
        background: "#fafaf9",
        overflow: "hidden",
        userSelect: "none",
        fontFamily: "'Saint Regus', -apple-system, sans-serif",
        ...style
      }}
    >
      {/* SECTION 1: Preloader Stage (18 Cards + Odometer HUD) */}
      <section ref={preloaderStageRef} className="mosaic-preloader-stage">
        <div ref={centerHudRef} className="mosaic-hud">
          <div ref={odometerWrapRef} className="mosaic-odometer-wrap">
            <div ref={colHundredsRef} className="mosaic-digit-col" style={{ display: "none" }}>
              <div ref={trackHundredsRef} className="mosaic-digit-track">
                <span>0</span><span>1</span>
              </div>
            </div>
            <div ref={colTensRef} className="mosaic-digit-col" style={{ display: "none" }}>
              <div ref={trackTensRef} className="mosaic-digit-track">
                <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
              </div>
            </div>
            <div className="mosaic-digit-col">
              <div ref={trackOnesRef} className="mosaic-digit-track">
                <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
              </div>
            </div>
          </div>
        </div>

        {cards.map((pos, i) => (
          <img
            key={pos.id}
            ref={(el) => { cardRefs.current[i] = el; }}
            className="mosaic-card-img"
            decoding="async"
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt="Mosaic photograph"
            style={{
              left: `${pos.xPct}vw`,
              top: `${pos.yPct}vh`,
              width: `${pos.w}px`,
              height: `${pos.h}px`,
              "--depth-speed": (0.75 + pos.depthFactor * 0.45).toFixed(2)
            } as React.CSSProperties}
          />
        ))}
      </section>

      {/* SECTION 2: Main Content Stage (Sticky Footer / Centered Editorial Rows with Inline Square Images) */}
      <section ref={contentStageRef} className="mosaic-content-stage">
        <main className={`mosaic-arrival-wrap ${hoveredIdx !== null ? "has-hovered-row" : ""}`}>
          {displayLines.map((line, rowIdx) => {
            const imgSrc = editorialImages[rowIdx % editorialImages.length];
            const isHovered = hoveredIdx === rowIdx;
            const words = line.trim().split(/\s+/);
            const splitPoint = Math.max(1, Math.ceil(words.length / 2));
            const firstPart = words.slice(0, splitPoint).join(" ");
            const secondPart = words.slice(splitPoint).join(" ");

            return (
              <div
                key={rowIdx}
                className="mosaic-manifesto-row-mask"
                onMouseEnter={() => setHoveredIdx(rowIdx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <span
                  className={`mosaic-manifesto-row ${isHovered ? "is-active-row" : ""}`}
                  style={{ "--row-idx": rowIdx } as React.CSSProperties}
                >
                  <sup className="mosaic-row-index">[{String(rowIdx + 1).padStart(2, "0")}]</sup>
                  <span className="mosaic-row-text">{firstPart}</span>
                  <span className={`mosaic-inline-thumb-wrap ${isHovered ? "is-expanded" : ""}`}>
                    <img
                      src={imgSrc}
                      alt={line}
                      className="mosaic-inline-thumb-img"
                      loading="eager"
                    />
                  </span>
                  {secondPart && <span className="mosaic-row-text"> {secondPart}</span>}
                </span>
              </div>
            );
          })}
        </main>
      </section>
    </div>
  );
}
