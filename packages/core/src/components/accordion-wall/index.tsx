import React, { useMemo, useRef, useEffect } from "react";
import { AccordionWallProps, AccordionWallItem } from "./types";
import { DEFAULT_ACCORDION_ITEMS } from "./constants";
import { useAccordionMotion } from "./use-accordion-motion";
import styles from "./styles.module.css";

export const AccordionWall: React.FC<AccordionWallProps> = ({
  items,
  images,
  titles,
  watermarkText = "Hover to Preview • Click to Select",
  panelCount = 8,
  speed: _speed = 1.35,
  onExpand,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ambientEchoRef = useRef<HTMLDivElement>(null);
  const centerCueRef = useRef<HTMLDivElement>(null);

  const pillarWrapsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imgWrapsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imgsRef = useRef<(HTMLImageElement | null)[]>([]);
  const titlesRef = useRef<(HTMLHeadingElement | null)[]>([]);

  // Normalize curated items list
  const activeItems: AccordionWallItem[] = useMemo(() => {
    if (items && items.length > 0) return items.slice(0, panelCount);
    if (images && images.length > 0) {
      return images.slice(0, panelCount).map((img, idx) => ({
        id: `0${idx + 1}`,
        title: titles?.[idx] || `Exhibition 0${idx + 1}`,
        image: img,
        moodColor:
          DEFAULT_ACCORDION_ITEMS[idx % DEFAULT_ACCORDION_ITEMS.length]?.moodColor ||
          "#16171b",
      }));
    }
    return DEFAULT_ACCORDION_ITEMS.slice(0, panelCount);
  }, [items, images, titles, panelCount]);

  // Trim refs array
  useEffect(() => {
    pillarWrapsRef.current = pillarWrapsRef.current.slice(0, activeItems.length);
    imgWrapsRef.current = imgWrapsRef.current.slice(0, activeItems.length);
    imgsRef.current = imgsRef.current.slice(0, activeItems.length);
    titlesRef.current = titlesRef.current.slice(0, activeItems.length);
  }, [activeItems.length]);

  const {
    handlePillarMouseEnter,
    handlePillarMouseLeave,
    handlePillarClick,
    handleContainerClick,
  } = useAccordionMotion({
    activeItems,
    ambientEchoRef,
    centerCueRef,
    pillarWrapsRef,
    imgWrapsRef,
    imgsRef,
    titlesRef,
    onExpand,
    onLifecycleChange,
  });

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={`${styles.container} ${className}`}
      style={style}
    >
      {/* Ambient Void Echo Layer */}
      <div ref={ambientEchoRef} className={styles.ambientEcho} />

      {/* Permanent Editorial Watermark */}
      <div ref={centerCueRef} className={styles.watermark}>
        {watermarkText}
      </div>

      {/* 8-Pillar Matrix Container */}
      <div className={styles.matrixContainer}>
        {activeItems.map((item, idx) => (
          <div
            key={item.id || idx}
            ref={(el) => {
              pillarWrapsRef.current[idx] = el;
            }}
            className={styles.pillarWrap}
          >
            <div className={styles.titleWrap}>
              <h3
                ref={(el) => {
                  titlesRef.current[idx] = el;
                }}
                className={styles.pillarTitle}
              >
                {item.title}
              </h3>
            </div>

            <div
              ref={(el) => {
                imgWrapsRef.current[idx] = el;
              }}
              onClick={(e) => handlePillarClick(idx, e)}
              onMouseEnter={() => handlePillarMouseEnter(idx)}
              onMouseLeave={() => handlePillarMouseLeave(idx)}
              className={styles.cardWrap}
            >
              <img
                ref={(el) => {
                  imgsRef.current[idx] = el;
                }}
                src={item.image}
                alt={item.title}
                className={styles.cardImage}
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PillarGallery = AccordionWall;
export default AccordionWall;
