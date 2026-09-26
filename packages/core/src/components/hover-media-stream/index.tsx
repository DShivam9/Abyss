import React, { useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import { HoverMediaStreamProps } from "./types";
import { DEFAULT_ITEMS } from "./constants";
import { playTactileHoverSound } from "./audio";
import { useLatestRef } from "../../hooks";
import styles from "./styles.module.css";

export const HoverMediaStream: React.FC<HoverMediaStreamProps> = ({
  items = DEFAULT_ITEMS,
  backdropBlur = 80,
  ambientBrightness = 0.40,
  lineDuration = 1.25,
  fontSize = 62,
  enableAudio = true,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineDurationRef = useLatestRef(lineDuration);
  const enableAudioRef = useLatestRef(enableAudio);

  const streamItems = useMemo(() => {
    return items && items.length > 0 ? items : DEFAULT_ITEMS;
  }, [items]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rowElements = container.querySelectorAll<HTMLElement>(`.${styles.menuRow}`);
    const ambientBackdrops = container.querySelectorAll<HTMLElement>(`.${styles.ambientMedia}`);

    let currentlyHoveredRow: HTMLElement | null = null;
    let exitTimeout: ReturnType<typeof setTimeout> | null = null;

    // Upfront DOM caching
    const cachedRows = Array.from(rowElements).map((row, index) => ({
      row,
      index,
      titleText: row.querySelector<HTMLElement>(`.${styles.titleText}`),
      indexBadge: row.querySelector<HTMLElement>(`.${styles.titleIndexBadge}`),
      lineLeft: row.querySelector<HTMLElement>(`.${styles.lineHalfLeft}`),
      lineRight: row.querySelector<HTMLElement>(`.${styles.lineHalfRight}`),
      moireLeft: row.querySelector<HTMLElement>(`.${styles.moireHalfLeft}`),
      moireRight: row.querySelector<HTMLElement>(`.${styles.moireHalfRight}`),
      weaves: row.querySelectorAll<HTMLElement>(`.${styles.flankWeave}`),
      stage: row.querySelector<HTMLElement>(`.${styles.rowImageStage}`),
      media: row.querySelector<HTMLVideoElement | HTMLImageElement>(`.${styles.stageMedia}`),
      bgMedia: ambientBackdrops[index] as (HTMLVideoElement | HTMLImageElement | undefined),
    }));

    function dismissAll() {
      currentlyHoveredRow = null;
      container?.classList.remove("has-active");

      cachedRows.forEach((item) => {
        item.row.classList.remove("active");

        if (item.titleText) {
          gsap.to(item.titleText, {
            y: 0,
            letterSpacing: "-0.025em",
            color: "rgba(255, 255, 255, 0.35)",
            duration: 0.35,
            ease: "cubic-bezier(0.23, 1, 0.32, 1)",
            overwrite: "auto",
          });
        }

        if (item.indexBadge) {
          gsap.to(item.indexBadge, {
            opacity: 0,
            y: 4,
            duration: 0.25,
            ease: "power2.out",
            overwrite: "auto",
          });
        }

        if (item.bgMedia) {
          gsap.to(item.bgMedia, {
            opacity: 0,
            scale: 1.1,
            duration: 0.8,
            ease: "power2.out",
            overwrite: "auto",
            onComplete: () => {
              if (!currentlyHoveredRow && item.bgMedia instanceof HTMLVideoElement && item.bgMedia.pause) {
                item.bgMedia.classList.remove("active");
                item.bgMedia.pause();
              }
            },
          });
        }

        if (item.media instanceof HTMLVideoElement && item.media.pause) {
          item.media.pause();
        }

        if (item.lineLeft && item.lineRight) {
          gsap.to([item.lineLeft, item.lineRight], {
            scaleX: 0,
            opacity: 0,
            duration: 0.35,
            ease: "cubic-bezier(0.12, 1, 0.2, 1)",
            overwrite: "auto",
          });
        }

        if (item.moireLeft && item.moireRight) {
          gsap.to([item.moireLeft, item.moireRight], {
            scaleX: 0,
            opacity: 0,
            duration: 0.3,
            ease: "cubic-bezier(0.12, 1, 0.2, 1)",
            overwrite: "auto",
          });
        }

        if (item.weaves && item.weaves.length > 0) {
          gsap.to(item.weaves, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        }

        if (item.stage) {
          gsap.to(item.stage, {
            clipPath: "inset(100% 0% 0% 0%)",
            duration: 0.45,
            ease: "cubic-bezier(0.12, 1, 0.2, 1)",
            overwrite: "auto",
          });
        }

        if (item.media) {
          gsap.to(item.media, {
            scale: 1.12,
            duration: 0.45,
            ease: "cubic-bezier(0.12, 1, 0.2, 1)",
            overwrite: "auto",
          });
        }
      });
    }

    cachedRows.forEach((item) => {
      item.row.addEventListener("mouseenter", () => {
        if (exitTimeout) {
          clearTimeout(exitTimeout);
          exitTimeout = null;
        }

        currentlyHoveredRow = item.row;
        container?.classList.add("has-active");
        if (onLifecycleChange) onLifecycleChange("peak");

        // Synthesize tactile hover sound
        if (enableAudioRef.current) {
          playTactileHoverSound();
        }

        // Hardware Playhead sync
        if (
          item.media instanceof HTMLVideoElement &&
          item.bgMedia instanceof HTMLVideoElement &&
          item.media.currentTime !== undefined &&
          item.bgMedia.currentTime !== undefined
        ) {
          item.bgMedia.currentTime = item.media.currentTime;
        }

        if (item.media instanceof HTMLVideoElement && item.media.play) item.media.play().catch(() => {});
        if (item.bgMedia) {
          item.bgMedia.classList.add("active");
          if (item.bgMedia instanceof HTMLVideoElement && item.bgMedia.play) item.bgMedia.play().catch(() => {});
        }

        // Velvet GSAP Cross-fade for active ambient backdrop
        cachedRows.forEach((other) => {
          if (other.index === item.index) {
            if (other.bgMedia) {
              gsap.to(other.bgMedia, {
                opacity: 1,
                scale: 1.18,
                duration: 1.4,
                ease: "power2.out",
                overwrite: "auto",
              });
            }
          } else {
            if (other.bgMedia) {
              gsap.to(other.bgMedia, {
                opacity: 0,
                scale: 1.1,
                duration: 1.1,
                ease: "power2.out",
                overwrite: "auto",
                onComplete: () => {
                  if (currentlyHoveredRow !== other.row && other.bgMedia instanceof HTMLVideoElement && other.bgMedia.pause) {
                    other.bgMedia.classList.remove("active");
                    other.bgMedia.pause();
                  }
                },
              });
            }
          }
        });

        // Dismiss other rows
        cachedRows.forEach((other) => {
          if (other.index !== item.index) {
            other.row.classList.remove("active");
            if (other.media instanceof HTMLVideoElement && other.media.pause) other.media.pause();

            if (other.titleText) {
              gsap.to(other.titleText, { y: 0, letterSpacing: "-0.025em", color: "rgba(255, 255, 255, 0.35)", duration: 0.3, overwrite: true });
            }
            if (other.indexBadge) {
              gsap.to(other.indexBadge, { opacity: 0, y: 4, duration: 0.2, overwrite: true });
            }
            if (other.lineLeft && other.lineRight) {
              gsap.to([other.lineLeft, other.lineRight], { scaleX: 0, opacity: 0, duration: 0.35, ease: "power2.out", overwrite: true });
            }
            if (other.moireLeft && other.moireRight) {
              gsap.to([other.moireLeft, other.moireRight], { scaleX: 0, opacity: 0, duration: 0.3, ease: "power2.out", overwrite: true });
            }
            if (other.weaves && other.weaves.length > 0) {
              gsap.to(other.weaves, { opacity: 0, duration: 0.3, overwrite: true });
            }
            if (other.stage) {
              gsap.to(other.stage, { clipPath: "inset(100% 0% 0% 0%)", duration: 0.4, ease: "power2.out", overwrite: true });
            }
            if (other.media) {
              gsap.to(other.media, { scale: 1.12, duration: 0.4, overwrite: true });
            }
          }
        });

        item.row.classList.add("active");

        const dur = lineDurationRef.current;

        // 1. Spatial Continuity & Optical Lift
        if (item.titleText) {
          gsap.fromTo(item.titleText,
            { y: 0, letterSpacing: "-0.025em" },
            {
              y: -3,
              letterSpacing: "0.015em",
              duration: 0.85,
              ease: "cubic-bezier(0.16, 1, 0.3, 1)",
              overwrite: "auto",
            }
          );
        }

        // 2. Monospace Micro Index Badge Reveal
        if (item.indexBadge) {
          gsap.fromTo(item.indexBadge,
            { opacity: 0, y: 5 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              delay: 0.08,
              ease: "cubic-bezier(0.16, 1, 0.3, 1)",
              overwrite: "auto",
            }
          );
        }

        // 3. Primary Line converges in sync
        if (item.lineLeft && item.lineRight) {
          gsap.fromTo([item.lineLeft, item.lineRight], 
            { scaleX: 0, opacity: 0 },
            {
              scaleX: 1,
              opacity: 1,
              duration: dur,
              delay: 0.06,
              ease: "cubic-bezier(0.16, 1, 0.3, 1)",
              overwrite: "auto",
            }
          );
        }

        // 4. Moiré Secondary Interference Strand
        if (item.moireLeft && item.moireRight) {
          gsap.fromTo([item.moireLeft, item.moireRight],
            { scaleX: 0, opacity: 0 },
            {
              scaleX: 1,
              opacity: 0.85,
              duration: dur * 1.16,
              delay: 0.12,
              ease: "cubic-bezier(0.16, 1, 0.3, 1)",
              overwrite: "auto",
            }
          );
        }

        // 5. Kinetic Flank Weaves bloom
        if (item.weaves && item.weaves.length > 0) {
          gsap.fromTo(item.weaves,
            { opacity: 0, scale: 0.7 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.9,
              delay: 0.22,
              ease: "back.out(1.4)",
              overwrite: "auto",
            }
          );
        }

        // 6. Row's own video/GIF unrolls in place
        if (item.stage) {
          gsap.fromTo(item.stage, 
            { clipPath: "inset(100% 0% 0% 0%)" },
            { 
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.95,
              delay: 0.10,
              ease: "cubic-bezier(0.16, 1, 0.3, 1)",
              overwrite: "auto",
            }
          );
        }

        if (item.media) {
          gsap.fromTo(item.media, 
            { scale: 1.14 },
            { 
              scale: 1,
              duration: 1.25,
              delay: 0.10,
              ease: "cubic-bezier(0.16, 1, 0.3, 1)",
              overwrite: "auto",
            }
          );
        }
      });

      item.row.addEventListener("mouseleave", () => {
        exitTimeout = setTimeout(() => {
          dismissAll();
        }, 40);
      });
    });

    container.addEventListener("mouseleave", () => {
      dismissAll();
    });

    return () => {
      if (exitTimeout) clearTimeout(exitTimeout);
    };
  }, [streamItems, onLifecycleChange]);

  const dynamicCSSVars = {
    "--hms-blur": `${backdropBlur}px`,
    "--hms-brightness": ambientBrightness,
    "--hms-font-size": `${fontSize}px`,
    ...style,
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      className={`${styles.wrapper} ${className}`}
      style={dynamicCSSVars}
    >
      {/* Full-Screen Ambient Video Backdrop */}
      <div className={styles.backdrop}>
        {streamItems.map((item, idx) => (
          <div key={`ambient-${item.id}-${idx}`}>
            {item.mediaType === "video" ? (
              <video
                src={item.src}
                loop
                muted
                playsInline
                preload="auto"
                className={styles.ambientMedia}
              />
            ) : (
              <img
                src={item.src}
                alt={item.title}
                className={styles.ambientMedia}
              />
            )}
          </div>
        ))}
      </div>

      {/* Menu Rows */}
      <nav className={styles.menu}>
        {streamItems.map((item, idx) => {
          const isEven = idx % 2 === 0;
          const indexFormatted = String(idx + 1).padStart(2, "0");

          return (
            <div
              key={item.id}
              className={styles.menuRow}
              data-index={idx}
              style={{
                "--c1": item.palette?.[0] || "#ffffff",
                "--c2": item.palette?.[1] || "#ffffff",
                "--c3": item.palette?.[2] || item.palette?.[0] || "#ffffff",
                "--c4": item.palette?.[3] || item.palette?.[1] || "#ffffff",
              } as React.CSSProperties}
            >
              {/* Media Stage */}
              <div className={`${styles.rowImageStage} ${isEven ? styles.flankLeft : styles.flankRight}`}>
                {item.mediaType === "video" ? (
                  <video
                    src={item.src}
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className={styles.stageMedia}
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.title}
                    className={styles.stageMedia}
                  />
                )}
              </div>

              {/* Spatial Continuity Typography Title */}
              <div className={styles.titleContainer}>
                <span className={styles.titleText}>
                  {item.title.split("").map((char, cIdx) => (
                    <span
                      key={cIdx}
                      className={styles.titleChar}
                      style={{ "--char-i": cIdx } as React.CSSProperties}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>
                <span className={`${styles.titleIndexBadge} ${isEven ? styles.badgeRight : styles.badgeLeft}`}>
                  [{indexFormatted}]
                </span>
              </div>

              {/* 100vw Primary Baseline & Kinetic Flank Weaves */}
              <div className={styles.connectedBaseline}>
                <div className={`${styles.lineHalf} ${styles.lineHalfLeft}`} />
                <div className={`${styles.lineHalf} ${styles.lineHalfRight}`} />
                <div className={`${styles.flankWeave} ${styles.flankWeaveLeft}`}>
                  <div className={`${styles.weaveLine} ${styles.weaveLineH}`} />
                  <div className={`${styles.weaveLine} ${styles.weaveLineV1}`} />
                  <div className={`${styles.weaveLine} ${styles.weaveLineV2}`} />
                  <div className={`${styles.weaveLine} ${styles.weaveLineDiag}`} />
                </div>
                <div className={`${styles.flankWeave} ${styles.flankWeaveRight}`}>
                  <div className={`${styles.weaveLine} ${styles.weaveLineH}`} />
                  <div className={`${styles.weaveLine} ${styles.weaveLineV1}`} />
                  <div className={`${styles.weaveLine} ${styles.weaveLineV2}`} />
                  <div className={`${styles.weaveLine} ${styles.weaveLineDiag}`} />
                </div>
              </div>

              {/* Moiré Secondary Interference Strand (Top Row Boundary) */}
              <div className={styles.moireStrand}>
                <div className={`${styles.moireHalf} ${styles.moireHalfLeft}`} />
                <div className={`${styles.moireHalf} ${styles.moireHalfRight}`} />
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default HoverMediaStream;
