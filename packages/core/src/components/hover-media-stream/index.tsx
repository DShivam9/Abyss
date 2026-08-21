import React, { useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import { HoverMediaStreamProps, StreamMediaItem } from "./types";

const DEFAULT_ITEMS: StreamMediaItem[] = [
  {
    id: "item-0",
    title: "Tribunes of Copenhagen",
    mediaType: "video",
    src: "/videos/components/hover-media-stream/cosmos_1039988699.mp4",
  },
  {
    id: "item-1",
    title: "Hangar Nocturne",
    mediaType: "video",
    src: "/videos/components/hover-media-stream/cosmos_1880828127.mp4",
  },
  {
    id: "item-2",
    title: "It Takes Time",
    mediaType: "video",
    src: "/videos/components/hover-media-stream/cosmos_1982547553.mp4",
  },
  {
    id: "item-3",
    title: "Midnight Commute",
    mediaType: "video",
    src: "/videos/components/hover-media-stream/cosmos_282803736.mp4",
  },
  {
    id: "item-4",
    title: "Apex Velocity",
    mediaType: "image",
    src: "/videos/components/hover-media-stream/cosmos_517993684.gif",
  },
  {
    id: "item-5",
    title: "Glacial Fracture",
    mediaType: "video",
    src: "/videos/components/hover-media-stream/cosmos_616389415.mp4",
  },
];

let sharedAudioContext: AudioContext | null = null;

function unlockAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) sharedAudioContext = new AudioCtx();
  }
  if (sharedAudioContext && sharedAudioContext.state === "suspended") {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

if (typeof window !== "undefined") {
  const unlock = () => {
    unlockAudioContext();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
}

function playTactileHoverSound() {
  const ctx = unlockAudioContext();
  if (!ctx || ctx.state !== "running") return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Winning Nylon Detent Notch [05] (800Hz bandpassed leaf tick)
  osc.type = "triangle";
  osc.frequency.setValueAtTime(800, now);

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(850, now);
  filter.Q.value = 2.0;

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.06, now + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.0065);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.0075);
}

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
  const lineDurationRef = useRef(lineDuration);
  lineDurationRef.current = lineDuration;

  const enableAudioRef = useRef(enableAudio);
  enableAudioRef.current = enableAudio;

  const streamItems = useMemo(() => {
    return items && items.length > 0 ? items : DEFAULT_ITEMS;
  }, [items]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rowElements = container.querySelectorAll<HTMLElement>(".menu-row");
    const ambientBackdrops = container.querySelectorAll<HTMLElement>(".ambient-media");

    let currentlyHoveredRow: HTMLElement | null = null;
    let exitTimeout: ReturnType<typeof setTimeout> | null = null;

    // Upfront DOM caching
    const cachedRows = Array.from(rowElements).map((row, index) => ({
      row,
      index,
      titleText: row.querySelector<HTMLElement>(".title-text"),
      indexBadge: row.querySelector<HTMLElement>(".title-index-badge"),
      lineLeft: row.querySelector<HTMLElement>(".line-half-left"),
      lineRight: row.querySelector<HTMLElement>(".line-half-right"),
      moireLeft: row.querySelector<HTMLElement>(".moire-half-left"),
      moireRight: row.querySelector<HTMLElement>(".moire-half-right"),
      weaves: row.querySelectorAll<HTMLElement>(".flank-weave"),
      stage: row.querySelector<HTMLElement>(".row-image-stage"),
      media: row.querySelector<HTMLVideoElement | HTMLImageElement>(".stage-media"),
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
            { y: 0, letterSpacing: "-0.025em", color: "rgba(255, 255, 255, 0.35)" },
            {
              y: -3,
              letterSpacing: "0.015em",
              color: "#ffffff",
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
      className={`relative w-full h-screen bg-[#060608] text-white overflow-hidden flex justify-center items-center select-none ${className}`}
      style={dynamicCSSVars}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .hms-wrapper {
          font-family: 'Syne', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .hms-backdrop {
          position: fixed;
          top: -30px;
          left: -30px;
          right: -30px;
          bottom: -30px;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }

        .hms-ambient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          filter: blur(var(--hms-blur, 80px)) brightness(var(--hms-brightness, 0.24)) saturate(1.4);
          transform: translate3d(0, 0, 0) scale(1.1);
          will-change: opacity, transform;
          backface-visibility: hidden;
        }

        .hms-menu {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100vw;
          height: 100vh;
          z-index: 10;
          gap: 1.4rem;
          padding: 4rem 0;
          transform: translate3d(0, 0, 0);
        }

        .hms-menu .menu-row {
          position: relative;
          width: 100vw;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          font-size: var(--hms-font-size, clamp(2.25rem, 4.2vw, 3.75rem));
          line-height: 1;
          transform: translate3d(0, 0, 0) scale(1);
          filter: blur(0px);
          will-change: opacity, filter, transform;
          backface-visibility: hidden;
          transition: 
            opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
            filter 0.7s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hms-menu.has-active .menu-row {
          opacity: 0.12;
          filter: blur(3px);
          transform: translate3d(0, 0, 0) scale(0.985);
        }

        .hms-menu.has-active .menu-row.active {
          opacity: 1;
          filter: blur(0px);
          transform: translate3d(0, 0, 0) scale(1);
        }

        .title-container {
          position: relative;
          height: 1.18em;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 4;
          padding: 0 1.5rem;
        }

        .title-text {
          font-family: 'Syne', sans-serif;
          font-size: 1em;
          font-weight: 600;
          line-height: 1.18;
          letter-spacing: -0.025em;
          white-space: nowrap;
          pointer-events: none;
          color: rgba(255, 255, 255, 0.35);
          will-change: transform, letter-spacing, color;
          backface-visibility: hidden;
        }

        /* Absolute Out-of-Flow Flank Badge (Zero Layout Shift) */
        .title-index-badge {
          position: absolute;
          top: 50%;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.26em;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.6);
          opacity: 0;
          pointer-events: none;
          white-space: nowrap;
          will-change: opacity, transform;
          backface-visibility: hidden;
        }

        .badge-right {
          left: calc(100% + 0.75rem);
          transform: translate3d(0, -50%, 0);
        }

        .badge-left {
          right: calc(100% + 0.75rem);
          transform: translate3d(0, -50%, 0);
        }

        /* 100vw Primary Baseline */
        .connected-baseline {
          position: absolute;
          top: calc(50% + 0.37em);
          left: 0;
          width: 100vw;
          height: 1px;
          pointer-events: none;
          display: flex;
          overflow: visible;
          font-size: inherit;
          z-index: 1;
          transform: translate3d(0, 0, 0);
        }

        .line-half {
          flex: 1;
          height: 100%;
          will-change: transform, opacity;
          backface-visibility: hidden;
          transform: scaleX(0);
          opacity: 0;
        }

        .line-half-left {
          transform-origin: left center;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.35) 25%, rgba(255, 255, 255, 0.95) 100%);
        }

        .line-half-right {
          transform-origin: right center;
          background: linear-gradient(270deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.35) 25%, rgba(255, 255, 255, 0.95) 100%);
        }

        /* Secondary Moiré Interference Strand (Top Row Boundary) */
        .moire-strand {
          position: absolute;
          top: -1px;
          left: 0;
          width: 100vw;
          height: 1px;
          display: flex;
          pointer-events: none;
          z-index: 2;
          transform: translate3d(0, 0, 0);
        }

        .moire-half {
          flex: 1;
          height: 100%;
          will-change: transform, opacity;
          backface-visibility: hidden;
          transform: scaleX(0);
          opacity: 0;
        }

        .moire-half-left {
          transform-origin: left center;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 30%, rgba(255, 255, 255, 0.6) 85%, transparent 100%);
        }

        .moire-half-right {
          transform-origin: right center;
          background: linear-gradient(270deg, transparent 0%, rgba(255, 255, 255, 0.2) 30%, rgba(255, 255, 255, 0.6) 85%, transparent 100%);
        }

        .flank-weave {
          position: absolute;
          width: 48px;
          height: 16px;
          top: -7px;
          pointer-events: none;
          z-index: 3;
          overflow: visible;
          opacity: 0;
          will-change: transform, opacity;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }

        .flank-weave-left {
          left: clamp(1.5rem, 4vw, 4rem);
        }

        .flank-weave-right {
          right: clamp(1.5rem, 4vw, 4rem);
        }

        .weave-line {
          position: absolute;
          background: rgba(255, 255, 255, 0.7);
          transform-origin: center center;
          backface-visibility: hidden;
        }

        .weave-line-h {
          top: 7px;
          left: 0;
          width: 100%;
          height: 1px;
          opacity: 0.8;
        }

        .weave-line-v1 {
          top: 0;
          left: 12px;
          width: 1px;
          height: 15px;
          opacity: 0.5;
        }

        .weave-line-v2 {
          top: 2px;
          right: 12px;
          width: 1px;
          height: 11px;
          opacity: 0.7;
        }

        .weave-line-diag {
          top: 1px;
          left: 20px;
          width: 1px;
          height: 13px;
          opacity: 0.35;
          transform: rotate(35deg);
        }

        .row-image-stage {
          position: absolute;
          bottom: calc(50% - 0.37em + 8px);
          width: 356px;
          height: 200px;
          pointer-events: none;
          z-index: 5;
          overflow: hidden;
          clip-path: inset(100% 0 0 0);
          background: #000;
          will-change: clip-path, transform;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }

        .row-image-stage.flank-left {
          left: clamp(2rem, 6vw, 6rem);
        }

        .row-image-stage.flank-right {
          right: clamp(2rem, 6vw, 6rem);
        }

        .stage-media {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: translate3d(0, 0, 0) scale(1.12);
          will-change: transform;
          backface-visibility: hidden;
          filter: contrast(1.08) brightness(0.98);
        }
      `}</style>

      {/* Full-Screen Ambient Video Backdrop */}
      <div className="hms-backdrop">
        {streamItems.map((item, idx) => (
          <div key={`ambient-${item.id}-${idx}`}>
            {item.mediaType === "video" ? (
              <video
                src={item.src}
                loop
                muted
                playsInline
                preload="auto"
                className="ambient-media hms-ambient"
              />
            ) : (
              <img
                src={item.src}
                alt={item.title}
                className="ambient-media hms-ambient"
              />
            )}
          </div>
        ))}
      </div>

      {/* Menu Rows */}
      <nav className="hms-menu">
        {streamItems.map((item, idx) => {
          const isEven = idx % 2 === 0;
          const indexFormatted = String(idx + 1).padStart(2, "0");

          return (
            <div key={item.id} className="menu-row" data-index={idx}>
              {/* Media Stage */}
              <div className={`row-image-stage ${isEven ? "flank-left" : "flank-right"}`}>
                {item.mediaType === "video" ? (
                  <video
                    src={item.src}
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="stage-media"
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.title}
                    className="stage-media"
                  />
                )}
              </div>

              {/* Spatial Continuity Typography Title with Out-of-Flow Alternating Monospace Index */}
              <div className="title-container">
                <span className="title-text">{item.title}</span>
                <span className={`title-index-badge ${isEven ? "badge-right" : "badge-left"}`}>
                  [{indexFormatted}]
                </span>
              </div>

              {/* 100vw Primary Baseline & Kinetic Flank Weaves */}
              <div className="connected-baseline">
                <div className="line-half line-half-left" />
                <div className="line-half line-half-right" />
                <div className="flank-weave flank-weave-left">
                  <div className="weave-line weave-line-h" />
                  <div className="weave-line weave-line-v1" />
                  <div className="weave-line weave-line-v2" />
                  <div className="weave-line weave-line-diag" />
                </div>
                <div className="flank-weave flank-weave-right">
                  <div className="weave-line weave-line-h" />
                  <div className="weave-line weave-line-v1" />
                  <div className="weave-line weave-line-v2" />
                  <div className="weave-line weave-line-diag" />
                </div>
              </div>

              {/* Moiré Secondary Interference Strand (Top Row Boundary) */}
              <div className="moire-strand">
                <div className="moire-half moire-half-left" />
                <div className="moire-half moire-half-right" />
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export const ApparatusHoverMediaStream = HoverMediaStream;
export default HoverMediaStream;
