import { useRef, useEffect } from "react";
import { ParallaxBleedProps } from "./types";
import { DEFAULT_BLEED_SECTIONS } from "./constants";
import { BlurOverlay } from "./blur-overlay";
import { useParallaxBleed } from "./use-parallax-bleed";
import styles from "./styles.module.css";

export function ParallaxBleed({
  sections = DEFAULT_BLEED_SECTIONS,
  parallaxIntensity = 100,
  blurDepth = 280,
  blurVariant = "pure",
  indicatorStyle = "dots",
  imageBrightness = 90,
  className = "",
  style = {},
  onLifecycleChange,
  scrollProgress: externalProgress = 0,
}: ParallaxBleedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dashRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Inject High-Contrast Editorial Google Fonts (Syne 800)
  useEffect(() => {
    const fontId = "editorial-title-font";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useParallaxBleed({
    containerRef,
    sectionRefs,
    imageRefs,
    textRefs,
    dashRefs,
    sections,
    parallaxIntensity,
    indicatorStyle,
    externalProgress,
    onLifecycleChange,
  });

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      className={`${styles.container} ${className}`}
      style={style}
    >
      <BlurOverlay blurDepth={blurDepth} blurVariant={blurVariant} />

      {/* Dynamic Indicator (Dashes / Dots / Hidden) */}
      {indicatorStyle !== "hidden" && (
        <div className={styles.indicatorsWrapper}>
          {sections.map((sec, idx) => (
            <div
              key={`dash-${sec.id}`}
              ref={(el) => {
                dashRefs.current[idx] = el;
              }}
              className={styles.indicatorItem}
            />
          ))}
        </div>
      )}

      {/* Continuous Upward Full-Bleed Parallax Container */}
      <div className={styles.parallaxTrack}>
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            ref={(el) => {
              sectionRefs.current[idx] = el;
            }}
            className={styles.sectionFrame}
          >
            {/* Expanded Inner Image Container */}
            <div className={styles.imageFrame}>
              <img
                ref={(el) => {
                  imageRefs.current[idx] = el;
                }}
                src={sec.image}
                alt={`Bleed Scene ${sec.id}`}
                className={styles.image}
                style={{ filter: `brightness(${imageBrightness}%) contrast(105%)` }}
              />
            </div>

            {/* Asymmetrical Editorial Display Title & Subtitle */}
            <div
              ref={(el) => {
                textRefs.current[idx] = el;
              }}
              className={`absolute z-30 pointer-events-none transform-gpu will-change-transform ${sec.alignClass}`}
            >
              <h2 className={styles.titleText}>{sec.title}</h2>
              {sec.subtitle && <p className={styles.subtitleText}>{sec.subtitle}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ParallaxBleed;
