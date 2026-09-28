"use client";

import React, { useRef, useState, useMemo } from "react";
import { MosaicLoaderProps } from "./types";
import {
  DEFAULT_IMAGES,
  DEFAULT_EDITORIAL_LINES,
  DEFAULT_EDITORIAL_IMAGES,
  POSITIONS,
} from "./constants";
import { useMosaicSequence } from "./use-mosaic-sequence";
import "./mosaic-loader.css";

export type { MosaicLoaderProps };

const STATIC_CARDS = POSITIONS.map((pos, i) => ({
  ...pos,
  id: i,
}));

export default function MosaicLoader({
  images = DEFAULT_IMAGES,
  title,
  lines = DEFAULT_EDITORIAL_LINES,
  editorialImages = DEFAULT_EDITORIAL_IMAGES,
  duration = 6200,
  startDelay = 800,
  onComplete,
  className = "",
  style,
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
  const cardRefs = useRef<(HTMLImageElement | null)[]>([]);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const displayLines = useMemo(
    () => lines || (title ? [title] : DEFAULT_EDITORIAL_LINES),
    [lines, title]
  );

  useMosaicSequence({
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
  });

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
        ...style,
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

        {STATIC_CARDS.map((pos, i) => (
          <img
            key={pos.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="mosaic-card-img"
            decoding="async"
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt="Mosaic photograph"
            style={{
              left: `${pos.xPct}vw`,
              top: `${pos.yPct}vh`,
              width: `${pos.w}px`,
              height: `${pos.h}px`,
              "--depth-speed": (0.75 + pos.depthFactor * 0.45).toFixed(2),
            } as React.CSSProperties}
          />
        ))}
      </section>

      {/* SECTION 2: Main Content Stage */}
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

export { MosaicLoader };
