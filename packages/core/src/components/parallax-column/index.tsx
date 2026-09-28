import React, { useEffect, useRef } from "react";
import { ParallaxColumnProps } from "./types";
import {
  DEFAULT_LEFT_IMAGES,
  DEFAULT_RIGHT_IMAGES,
  BAKED_SPLIT_RATIO,
  BAKED_BG_SCALE,
} from "./constants";
import { useViewportHeight, useParallaxMotion } from "./motion";
import styles from "./styles.module.css";

export const ParallaxColumn: React.FC<ParallaxColumnProps> = ({
  leftImages,
  rightImages,
  imageSrc,
  className = "",
  style,
  onLifecycleChange,
  scrollProgress = 0,
  columnGap = 4,
  imageGap = 4,
  motionVariant = "classic",
  borderRadius = 8,
  parallaxIntensity = 60,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const leftItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leftImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightImageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const viewportHeight = useViewportHeight(containerRef);

  // Lifecycle signaling
  useEffect(() => {
    onLifecycleChange?.("discovery");
    const timer = setTimeout(() => {
      onLifecycleChange?.("idle");
    }, 1000);
    return () => clearTimeout(timer);
  }, [onLifecycleChange]);

  // Image fallbacks
  const displayLeft =
    leftImages && leftImages.length > 0
      ? leftImages
      : [imageSrc || DEFAULT_LEFT_IMAGES[0], ...DEFAULT_LEFT_IMAGES.slice(1)];
  const displayRight =
    rightImages && rightImages.length > 0 ? rightImages : DEFAULT_RIGHT_IMAGES;

  // Duplicate arrays twice to create a lightweight, seamless infinite loop rendering layout
  const infiniteLeft = [...displayLeft, ...displayLeft];
  const infiniteRight = [...displayRight, ...displayRight];

  // Compute card and item dimensions dynamically based on height, scale, and splitRatio
  const baseCardHeight = viewportHeight * (BAKED_BG_SCALE / 100) * 0.7;
  const baseCardWidth = baseCardHeight * 0.75; // 3:4 portrait card aspect ratio
  const itemHeight = baseCardHeight + imageGap;

  const leftCardWidth = baseCardWidth * (BAKED_SPLIT_RATIO / 50);
  const rightCardWidth = baseCardWidth * ((100 - BAKED_SPLIT_RATIO) / 50);

  useParallaxMotion({
    containerRef,
    leftColRef,
    rightColRef,
    leftItemRefs,
    rightItemRefs,
    leftImageRefs,
    rightImageRefs,
    displayLeftCount: displayLeft.length,
    displayRightCount: displayRight.length,
    itemHeight,
    baseCardHeight,
    viewportHeight,
    scrollProgress,
    motionVariant,
    parallaxIntensity,
  });

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={style}
    >
      <div
        className={styles.columnsWrapper}
        style={{ gap: `${columnGap}px` }}
      >
        {/* LEFT COLUMN (Downwards runway) */}
        <div
          ref={leftColRef}
          className={styles.columnRunner}
          style={{ width: `${leftCardWidth}px` }}
        >
          {infiniteLeft.map((img, idx) => (
            <div
              key={idx}
              className={styles.cardSlot}
              style={{ height: `${itemHeight}px` }}
            >
              <div
                ref={(el) => {
                  leftItemRefs.current[idx] = el;
                }}
                className={styles.cardWindow}
                style={{
                  width: `${leftCardWidth}px`,
                  height: `${baseCardHeight}px`,
                  borderRadius: `${borderRadius}px`,
                }}
              >
                <div
                  ref={(el) => {
                    leftImageRefs.current[idx] = el;
                  }}
                  className={styles.cardImage}
                  style={{
                    backgroundImage: `url("${img}")`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN (Upwards counter-runway) */}
        <div
          ref={rightColRef}
          className={styles.columnRunner}
          style={{ width: `${rightCardWidth}px` }}
        >
          {infiniteRight.map((img, idx) => (
            <div
              key={idx}
              className={styles.cardSlot}
              style={{ height: `${itemHeight}px` }}
            >
              <div
                ref={(el) => {
                  rightItemRefs.current[idx] = el;
                }}
                className={styles.cardWindow}
                style={{
                  width: `${rightCardWidth}px`,
                  height: `${baseCardHeight}px`,
                  borderRadius: `${borderRadius}px`,
                }}
              >
                <div
                  ref={(el) => {
                    rightImageRefs.current[idx] = el;
                  }}
                  className={styles.cardImage}
                  style={{
                    backgroundImage: `url("${img}")`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParallaxColumn;
