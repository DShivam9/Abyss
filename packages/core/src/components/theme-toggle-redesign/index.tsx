"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ThemeToggleRedesignProps } from "./types";
import { DEFAULT_THEME_TOGGLE_CONFIG } from "./constants";
import { usePerformance } from "../../engine/PerformanceProvider";
import { useLatestRef } from "../../hooks/use-latest-ref";
import { initAudio, playToggleSfx } from "./audio";
import { useLampCord } from "./use-lamp-cord";
import { CelestialIcon } from "./CelestialIcon";
import styles from "./styles.module.css";

export function ThemeToggleRedesign({
  variant = DEFAULT_THEME_TOGGLE_CONFIG.variant,
  enableAudio = DEFAULT_THEME_TOGGLE_CONFIG.enableAudio,
  className = "",
  style = {}
}: ThemeToggleRedesignProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const themeRef = useLatestRef(theme);

  const perf = usePerformance();
  const perfRef = useLatestRef(perf);

  const containerRef = useRef<HTMLDivElement>(null);
  const waveLayerRef = useRef<HTMLDivElement>(null);
  const dialBtnRef = useRef<HTMLButtonElement>(null);
  const lampIconStageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeAnimRef = useRef<Animation | null>(null);

  // Pre-warm audio buffers on mount or when audio is enabled
  useEffect(() => {
    if (enableAudio) {
      initAudio().catch(() => {});
    }
  }, [enableAudio]);

  const handleDialClick = useCallback(() => {
    const next = themeRef.current === "dark" ? "light" : "dark";
    const btn = dialBtnRef.current;
    const wave = waveLayerRef.current;
    const container = containerRef.current;

    if (btn && wave && container) {
      const cRect = container.getBoundingClientRect();
      const bRect = btn.getBoundingClientRect();
      const ox = bRect.left - cRect.left + bRect.width / 2;
      const oy = bRect.top - cRect.top + bRect.height / 2;
      const maxR = Math.hypot(Math.max(ox, cRect.width - ox), Math.max(oy, cRect.height - oy));

      if (activeAnimRef.current) activeAnimRef.current.cancel();

      wave.style.background = next === "light" ? "#f4f4f7" : "#131316";
      wave.style.opacity = "1";

      const anim = wave.animate(
        [
          { clipPath: `circle(0px at ${ox}px ${oy}px)` },
          { clipPath: `circle(${maxR}px at ${ox}px ${oy}px)` }
        ],
        {
          duration: perfRef.current.reducedMotion ? 0 : DEFAULT_THEME_TOGGLE_CONFIG.waveDuration,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards"
        }
      );

      activeAnimRef.current = anim;
      anim.onfinish = () => {
        wave.style.opacity = "0";
        activeAnimRef.current = null;
      };
    }

    setTheme(next);
    playToggleSfx("release", enableAudio);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(14);
    }
  }, [enableAudio, perfRef, themeRef]);

  const handleLampToggle = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  useLampCord({
    canvasRef,
    containerRef,
    lampIconStageRef,
    variant,
    theme,
    onToggleTheme: handleLampToggle,
    enableAudio,
    tier: perf.tier,
    dpr: perf.dpr,
    reducedMotion: perf.reducedMotion
  });

  const isDark = theme === "dark";

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${isDark ? styles.containerDark : styles.containerLight} ${className}`.trim()}
      style={style}
    >
      {/* Expanding Wave Layer strictly clipped inside rounded container */}
      <div ref={waveLayerRef} className={styles.waveLayer} />

      {/* Volumetric Lamp Glow */}
      <div
        className={styles.lampGlow}
        style={{
          opacity: variant === "lamp" && theme === "light" ? 1 : 0
        }}
      />

      {/* VARIANT A: 3D Dial (Locked to Dead Center) */}
      {variant === "dial" && (
        <div className={`${styles.dialWell} ${isDark ? styles.dialWellDark : styles.dialWellLight}`}>
          <button
            ref={dialBtnRef}
            type="button"
            onClick={handleDialClick}
            aria-label="Toggle theme"
            className={`${styles.dialButton} ${isDark ? styles.dialButtonDark : styles.dialButtonLight}`}
          >
            <CelestialIcon theme={theme} />
          </button>
        </div>
      )}

      {/* VARIANT B: Lamp Floating Icon + Physics Cord */}
      {variant === "lamp" && (
        <>
          <div ref={lampIconStageRef} className={styles.lampStage}>
            <CelestialIcon theme={theme} />
          </div>
          <canvas ref={canvasRef} className={styles.lampCanvas} />
        </>
      )}
    </div>
  );
}

export default ThemeToggleRedesign;
