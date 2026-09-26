"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
import { OpticGridProps, OpticGridMode, OpticGridFx, OpticGridScale } from "./types";
import {
  SCALE_LEVELS,
  LAYOUT_MODES,
  FX_OPTIONS,
  FX_PROFILES,
  NEUTRAL_FILTER,
  DEFAULT_OPTIC_IMAGES,
} from "./constants";
import styles from "./styles.module.css";

export * from "./types";
export * from "./constants";
export * from "./meta";

// ponytail: register gsap plugins safely once in client runtime
if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip, CustomEase);
}

export const OpticGrid: React.FC<OpticGridProps> = ({
  defaultMode = "contact",
  defaultFx = "none",
  defaultScale = "75",
  showControls = true,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const [mode, setMode] = useState<OpticGridMode>(defaultMode);
  const [fx, setFx] = useState<OpticGridFx>(defaultFx);
  const [scale, setScale] = useState<OpticGridScale>(defaultScale);
  const [layoutDropdownOpen, setLayoutDropdownOpen] = useState(false);
  const [fxDropdownOpen, setFxDropdownOpen] = useState(false);
  const [isIntroRunning, setIsIntroRunning] = useState(true);

  const rootRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const introTlRef = useRef<gsap.core.Timeline | null>(null);
  const fxRef = useRef<OpticGridFx>(fx);
  fxRef.current = fx;

  // Synchronous prototype transition executor: captures state, mutates DOM, runs Flip
  const applyTransition = useCallback(
    (changeFn: () => void, isStagger: boolean) => {
      if (introTlRef.current && introTlRef.current.isActive()) {
        introTlRef.current.progress(1);
      }

      const grid = gridRef.current;
      if (!grid) return;
      const imgs = Array.from(grid.querySelectorAll<HTMLImageElement>(`.${styles.latticeImg}`));
      if (imgs.length === 0) {
        changeFn();
        return;
      }

      // 1. Capture instantaneous positions and dimensions before DOM reflow
      const state = Flip.getState(imgs);

      // 2. Instantaneous DOM layout update
      changeFn();

      // 3. Stagger config
      const staggerConfig = isStagger
        ? { amount: 0.22, from: "center" as const, grid: "auto" as const, ease: "power1.inOut" }
        : { amount: 0.14, from: "center" as const, grid: "auto" as const, ease: "power1.inOut" };

      // 4. Optical in-flight fluid filter
      gsap.killTweensOf(imgs, "filter");
      const profile = FX_PROFILES[fxRef.current];
      if (profile) {
        gsap
          .timeline({ overwrite: "auto" })
          .fromTo(
            imgs,
            { filter: NEUTRAL_FILTER },
            {
              filter: profile.mid,
              duration: profile.durMid,
              ease: "sine.out",
              stagger: staggerConfig,
            }
          )
          .to(imgs, {
            filter: NEUTRAL_FILTER,
            duration: profile.durEnd,
            ease: "sine.inOut",
            stagger: staggerConfig,
          });
      } else {
        gsap
          .timeline({ overwrite: "auto" })
          .fromTo(
            imgs,
            { filter: NEUTRAL_FILTER },
            {
              filter: "contrast(1) grayscale(0) brightness(1.02) invert(0) sepia(0) hue-rotate(0deg) blur(0.5px)",
              duration: 0.50,
              ease: "sine.out",
              stagger: staggerConfig,
            }
          )
          .to(imgs, {
            filter: NEUTRAL_FILTER,
            duration: 0.70,
            ease: "sine.inOut",
            stagger: staggerConfig,
          });
      }

      // 5. Subliminal Parabolic Z-Depth (+6px fg / -6px bg)
      gsap.killTweensOf(imgs, "z");
      const fgImgs = imgs.filter((_, i) => i % 2 === 0);
      const bgImgs = imgs.filter((_, i) => i % 2 !== 0);

      gsap
        .timeline({ overwrite: "auto" })
        .to(fgImgs, { z: 6, duration: 0.50, ease: "sine.out", stagger: staggerConfig }, 0)
        .to(fgImgs, { z: 0, duration: 0.70, ease: "sine.inOut", stagger: staggerConfig }, 0.50);

      gsap
        .timeline({ overwrite: "auto" })
        .to(bgImgs, { z: -6, duration: 0.50, ease: "sine.out", stagger: staggerConfig }, 0)
        .to(bgImgs, { z: 0, duration: 0.70, ease: "sine.inOut", stagger: staggerConfig }, 0.50);

      // Fluid liquid silk morph without non-uniform scale distortion
      Flip.from(state, {
        duration: 1.20,
        ease: "liquidSilk",
        stagger: staggerConfig,
        absolute: true,
        overwrite: "auto",
        onComplete: () => {
          gsap.set(imgs, { clearProps: "transform,scale,scaleX,scaleY,width,height" });
        },
      });
    },
    []
  );

  // Set Layout Mode with Flip
  const handleSelectMode = useCallback(
    (newMode: OpticGridMode) => {
      if (newMode === mode) {
        setLayoutDropdownOpen(false);
        return;
      }
      applyTransition(() => {
        if (gridRef.current) gridRef.current.dataset.mode = newMode;
        setMode(newMode);
      }, newMode !== "contact");
      setLayoutDropdownOpen(false);
    },
    [mode, applyTransition]
  );

  // Set Scale with Flip
  const handleSelectScale = useCallback(
    (newScale: OpticGridScale) => {
      if (newScale === scale) return;
      applyTransition(() => {
        if (gridRef.current) gridRef.current.dataset.scale = newScale;
        setScale(newScale);
      }, mode !== "contact");
    },
    [scale, mode, applyTransition]
  );

  const handleStepScale = useCallback(
    (delta: -1 | 1) => {
      const idx = SCALE_LEVELS.indexOf(scale);
      const nextIdx = idx + delta;
      if (nextIdx >= 0 && nextIdx < SCALE_LEVELS.length) {
        handleSelectScale(SCALE_LEVELS[nextIdx]);
      }
    },
    [scale, handleSelectScale]
  );

  const handleCycleScale = useCallback(() => {
    const idx = SCALE_LEVELS.indexOf(scale);
    const nextIdx = (idx + 1) % SCALE_LEVELS.length;
    handleSelectScale(SCALE_LEVELS[nextIdx]);
  }, [scale, handleSelectScale]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setLayoutDropdownOpen(false);
        setFxDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Intro Ingress Animation on Mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    onLifecycleChange?.("discovery");

    CustomEase.create("liquidSilk", "0.68, 0, 0.25, 1");
    CustomEase.create("ultraSilky", "0.16, 1, 0.28, 1");

    const imgs = imgRefs.current.filter(Boolean) as HTMLImageElement[];
    if (imgs.length === 0) return;

    if (topBarRef.current) {
      gsap.set(topBarRef.current, { opacity: 0, y: -18 });
    }

    const introTl = gsap.timeline({
      delay: 0.04,
      onComplete: () => {
        setIsIntroRunning(false);
        gsap.set(imgs, { clearProps: "y,z,rotateX,rotateY,scale,filter,opacity" });
        if (topBarRef.current) {
          gsap.set(topBarRef.current, { clearProps: "y,opacity" });
        }
        onLifecycleChange?.("idle");
      },
    });
    introTlRef.current = introTl;

    // Radial sorting from center (col 4.5, row 1.0)
    const sortedIndices = Array.from({ length: imgs.length }, (_, i) => {
      const row = Math.floor(i / 10);
      const col = i % 10;
      const dx = (col - 4.5) / 4.5;
      const dy = (row - 1.0) / 1.0;
      const dist = Math.sqrt(dx * dx * 0.75 + dy * dy * 0.55);
      return { index: i, dist, dx, dy };
    }).sort((a, b) => a.dist - b.dist);

    // Intentional, cinematic one-by-one sequential ripple
    sortedIndices.forEach((item, seqIdx) => {
      const img = imgs[item.index];
      if (!img) return;

      const launchDelay = 0.04 + seqIdx * 0.036;
      const flightDuration = 0.90;

      gsap.set(img, {
        opacity: 0,
        y: 40,
        z: -60,
        scale: 0.94,
        filter: "contrast(1) grayscale(0) brightness(1.04) blur(6px)",
      });

      introTl.to(
        img,
        {
          y: 0,
          z: 0,
          scale: 1,
          opacity: 1,
          filter: NEUTRAL_FILTER,
          duration: flightDuration,
          ease: "ultraSilky",
        },
        launchDelay
      );
    });

    if (topBarRef.current) {
      introTl.to(
        topBarRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: "ultraSilky",
        },
        0.20
      );
    }

    return () => {
      introTl.kill();
      gsap.killTweensOf(imgs);
      if (topBarRef.current) gsap.killTweensOf(topBarRef.current);
    };
  }, [onLifecycleChange]);

  const currentScaleIdx = SCALE_LEVELS.indexOf(scale);
  const currentModeLabel = LAYOUT_MODES.find((m) => m.id === mode)?.label || "Contact";
  const currentFxLabel = FX_OPTIONS.find((f) => f.id === fx)?.label || "Clean";

  return (
    <div ref={rootRef} data-lenis-prevent className={`${styles.root} ${className}`} style={style}>
      {showControls && (
        <header ref={topBarRef} className={styles.topBar}>
          {/* Left: Layout Dropdown */}
          <div className={styles.modeControls} aria-label="Layout Modes">
            <div className={`${styles.fxDropdown} ${layoutDropdownOpen ? styles.fxDropdownOpen : ""}`}>
              <button
                className={`${styles.pillBtn} ${styles.dropdownTrigger}`}
                type="button"
                aria-haspopup="true"
                aria-expanded={layoutDropdownOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setFxDropdownOpen(false);
                  setLayoutDropdownOpen((prev) => !prev);
                }}
              >
                <span className={styles.dropdownLabel}>LAYOUT</span>
                <span className={styles.dropdownSelected}>{currentModeLabel}</span>
                <svg className={styles.dropdownChevron} width="8" height="5" viewBox="0 0 8 5" fill="none">
                  <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className={`${styles.dropdownMenu} ${styles.dropdownMenuLeft}`} role="menu">
                {LAYOUT_MODES.map((item) => (
                  <button
                    key={item.id}
                    className={`${styles.dropdownItem} ${mode === item.id ? styles.dropdownItemActive : ""}`}
                    role="menuitem"
                    onClick={() => handleSelectMode(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Brand Title */}
          <div className={styles.brandTitle}>OPTIC GRID</div>

          {/* Right: Optics Dropdown & Scale Stepper */}
          <div className={styles.rightControls}>
            <div className={`${styles.fxDropdown} ${fxDropdownOpen ? styles.fxDropdownOpen : ""}`}>
              <button
                className={`${styles.pillBtn} ${styles.dropdownTrigger}`}
                type="button"
                aria-haspopup="true"
                aria-expanded={fxDropdownOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setLayoutDropdownOpen(false);
                  setFxDropdownOpen((prev) => !prev);
                }}
              >
                <span className={styles.dropdownLabel}>OPTICS</span>
                <span className={styles.dropdownSelected}>{currentFxLabel}</span>
                <svg className={styles.dropdownChevron} width="8" height="5" viewBox="0 0 8 5" fill="none">
                  <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className={styles.dropdownMenu} role="menu">
                {FX_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    className={`${styles.dropdownItem} ${fx === item.id ? styles.dropdownItemActive : ""}`}
                    role="menuitem"
                    onClick={() => {
                      setFx(item.id);
                      setFxDropdownOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale Stepper Gauge */}
            <div className={styles.scaleStepper} aria-label="Scale Stepper">
              <button
                className={styles.stepperBtn}
                aria-label="Decrease Scale"
                title="Decrease scale"
                disabled={currentScaleIdx <= 0}
                onClick={() => handleStepScale(-1)}
              >
                <svg width="7" height="2" viewBox="0 0 7 2" fill="none">
                  <path d="M0.5 1H6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
              <div className={styles.stepperGauge} title="Click to cycle scale" onClick={handleCycleScale}>
                <span className={styles.stepperValue}>{scale}%</span>
                <div className={styles.stepperPips} aria-hidden="true">
                  {SCALE_LEVELS.map((step) => (
                    <span
                      key={step}
                      className={`${styles.pip} ${step === scale ? styles.pipActive : ""}`}
                      title={`${step}%`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectScale(step);
                      }}
                    />
                  ))}
                </div>
              </div>
              <button
                className={styles.stepperBtn}
                aria-label="Increase Scale"
                title="Increase scale"
                disabled={currentScaleIdx >= SCALE_LEVELS.length - 1}
                onClick={() => handleStepScale(1)}
              >
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                  <path d="M3.5 0.5V6.5M0.5 3.5H6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Stage */}
      <main className={styles.stage}>
        <div ref={gridRef} className={styles.latticeGrid} data-scale={scale} data-mode={mode} data-intro={isIntroRunning ? "active" : undefined}>
          {DEFAULT_OPTIC_IMAGES.map((img, i) => (
            <img
              key={img.src}
              ref={(el) => {
                imgRefs.current[i] = el;
              }}
              className={styles.latticeImg}
              src={img.src}
              alt=""
              style={{ aspectRatio: img.aspectRatio }}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default OpticGrid;
