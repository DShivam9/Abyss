"use client";

import { FC, useId, useRef } from "react";
import type { GooeyLoopProps } from "./types";
import { DEFAULT_PLATES } from "./constants";
import { CardPlate } from "./card-plate";
import { useGooeyLoopEngine } from "./use-gooey-loop-engine";
import styles from "./styles.module.css";

export const GooeyLoop: FC<GooeyLoopProps> = ({
  title = "GOOEY LOOP",
  caption = "SCROLL & DRAG",
  plates = DEFAULT_PLATES,
  scrollSpeed = 1.0,
  parallaxIntensity = 120,
  autoDrift = true,
  autoDriftSpeed = 55,
  className = "",
  style,
  onLifecycleChange
}) => {
  const instanceRawId = useId();
  const instanceId = instanceRawId.replace(/[^a-zA-Z0-9_-]/g, "_");

  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const uiTopRef = useRef<HTMLElement>(null);
  const uiBottomRef = useRef<HTMLElement>(null);

  useGooeyLoopEngine({
    wrapperRef,
    containerRef,
    trackRef,
    uiTopRef,
    uiBottomRef,
    plates,
    scrollSpeed,
    parallaxIntensity,
    autoDrift,
    autoDriftSpeed,
    onLifecycleChange
  });

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${className}`}
      style={style}
      data-testid="gooey-loop"
    >
      <header ref={uiTopRef} className={`${styles.uiChrome} ${styles.uiTop}`} id="uiTop">
        <h1 className={styles.uiTitle}>{title}</h1>
      </header>

      <div ref={containerRef} className={styles.carouselContainer} id="container">
        <div ref={trackRef} className={styles.track} id="track">
          {[0, 1, 2].flatMap((setIdx) =>
            plates.map((item) => (
              <CardPlate
                key={`${setIdx}-${item.id}`}
                item={item}
                setIndex={setIdx}
                instanceId={instanceId}
              />
            ))
          )}
        </div>
      </div>

      <footer
        ref={uiBottomRef}
        className={`${styles.uiChrome} ${styles.uiBottom}`}
        id="uiBottom"
      >
        <p className={styles.uiCaption}>{caption}</p>
      </footer>
    </div>
  );
};

export default GooeyLoop;
