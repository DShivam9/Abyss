import React, { useRef, useState, useEffect, useCallback, RefObject, MutableRefObject } from "react";
import gsap from "gsap";
import { AccordionWallItem } from "./types";
import { AbyssComponentProps } from "../../engine/types";

export interface UseAccordionMotionParams {
  activeItems: AccordionWallItem[];
  ambientEchoRef: RefObject<HTMLDivElement | null>;
  centerCueRef: RefObject<HTMLDivElement | null>;
  pillarWrapsRef: MutableRefObject<(HTMLDivElement | null)[]>;
  imgWrapsRef: MutableRefObject<(HTMLDivElement | null)[]>;
  imgsRef: MutableRefObject<(HTMLImageElement | null)[]>;
  titlesRef: MutableRefObject<(HTMLHeadingElement | null)[]>;
  onExpand?: (index: number | null) => void;
  onLifecycleChange?: AbyssComponentProps["onLifecycleChange"];
}

export function useAccordionMotion({
  activeItems,
  ambientEchoRef,
  centerCueRef,
  pillarWrapsRef,
  imgWrapsRef,
  imgsRef,
  titlesRef,
  onExpand,
  onLifecycleChange,
}: UseAccordionMotionParams) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedIndexRef = useRef<number | null>(null);
  selectedIndexRef.current = selectedIndex;

  const triggerLifecycle = useCallback(
    (state: "idle" | "discovery" | "buildUp" | "peak" | "recovery") => {
      onLifecycleChange?.(state);
    },
    [onLifecycleChange]
  );

  // Entrance animation
  useEffect(() => {
    triggerLifecycle("discovery");
    const validWraps = imgWrapsRef.current.filter(Boolean);

    const tl = gsap.timeline({
      delay: 0.15,
      onComplete: () => triggerLifecycle("idle"),
    });

    tl.to(
      validWraps,
      {
        clipPath: "inset(0% 0 0 0)",
        duration: 1.2,
        stagger: 0.08,
        ease: "expo.out",
      },
      0
    );

    return () => {
      tl.kill();
    };
  }, [triggerLifecycle]);

  // Apply visual state transitions (towering selected vs gentle hover vs baseline)
  const applyVisualState = useCallback(
    (targetIdx: number | null, _isHoverOnly = false) => {
      const selected = selectedIndexRef.current;

      // If nothing selected and no hover: return everything to baseline
      if (targetIdx === null && selected === null) {
        if (ambientEchoRef.current) {
          gsap.to(ambientEchoRef.current, { opacity: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" });
        }
        if (centerCueRef.current) {
          gsap.to(centerCueRef.current, { opacity: 1, duration: 0.5, ease: "power2.out", overwrite: "auto" });
        }

        pillarWrapsRef.current.forEach((p, i) => {
          if (!p) return;
          p.classList.remove("is-active", "is-hovered");
          const pWrap = imgWrapsRef.current[i];
          const pImg = imgsRef.current[i];
          const pTitle = titlesRef.current[i];

          gsap.to(p, { flexGrow: 1, opacity: 1, duration: 0.6, ease: "cubic-bezier(0.25, 1, 0.5, 1)", overwrite: "auto" });
          if (pWrap) {
            gsap.to(pWrap, {
              height: "220px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              duration: 0.6,
              ease: "cubic-bezier(0.25, 1, 0.5, 1)",
              overwrite: "auto",
            });
          }
          if (pImg) {
            gsap.to(pImg, { scale: 1.04, duration: 0.6, ease: "cubic-bezier(0.25, 1, 0.5, 1)", overwrite: "auto" });
          }
          if (pTitle) {
            gsap.to(pTitle, { opacity: 0, y: 4, duration: 0.35, ease: "power2.out", overwrite: "auto" });
          }
        });
        return;
      }

      // Determine hero index
      const heroIdx = selected !== null ? selected : targetIdx;
      const isHeroPermanent = selected !== null;

      if (heroIdx !== null && activeItems[heroIdx]) {
        const heroItem = activeItems[heroIdx];

        if (ambientEchoRef.current && heroItem.moodColor) {
          gsap.to(ambientEchoRef.current, {
            backgroundColor: heroItem.moodColor,
            opacity: isHeroPermanent ? 0.92 : 0.45,
            duration: 0.8,
            ease: "power2.out",
            overwrite: "auto",
          });
        }

        if (centerCueRef.current) {
          gsap.to(centerCueRef.current, {
            opacity: isHeroPermanent ? 0 : 0.4,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        }

        pillarWrapsRef.current.forEach((p, i) => {
          if (!p) return;
          const pWrap = imgWrapsRef.current[i];
          const pImg = imgsRef.current[i];
          const pTitle = titlesRef.current[i];

          if (i === heroIdx) {
            p.classList.add("is-active");
            p.classList.remove("is-hovered");

            if (isHeroPermanent) {
              gsap.to(p, { flexGrow: 2.6, opacity: 1, duration: 0.85, ease: "cubic-bezier(0.25, 1, 0.5, 1)", overwrite: "auto" });
              if (pWrap) {
                gsap.to(pWrap, {
                  height: "82vh",
                  boxShadow: "0 -28px 70px -10px rgba(0, 0, 0, 0.95)",
                  duration: 0.85,
                  ease: "cubic-bezier(0.25, 1, 0.5, 1)",
                  overwrite: "auto",
                });
              }
              if (pImg) {
                gsap.to(pImg, { scale: 1.0, duration: 0.85, ease: "cubic-bezier(0.25, 1, 0.5, 1)", overwrite: "auto" });
              }
              if (pTitle) {
                gsap.to(pTitle, { opacity: 1, y: 0, duration: 0.5, delay: 0.1, ease: "power2.out", overwrite: "auto" });
              }
            } else {
              gsap.to(p, { flexGrow: 1.15, opacity: 1, duration: 0.45, ease: "power2.out", overwrite: "auto" });
              if (pWrap) {
                gsap.to(pWrap, {
                  height: "280px",
                  boxShadow: "0 -12px 40px -6px rgba(0, 0, 0, 0.85)",
                  duration: 0.45,
                  ease: "power2.out",
                  overwrite: "auto",
                });
              }
              if (pImg) {
                gsap.to(pImg, { scale: 1.08, duration: 0.45, ease: "power2.out", overwrite: "auto" });
              }
              if (pTitle) {
                gsap.to(pTitle, { opacity: 0.85, y: 0, duration: 0.35, ease: "power2.out", overwrite: "auto" });
              }
            }
          } else {
            p.classList.remove("is-active", "is-hovered");
            const siblingFlex = isHeroPermanent ? 0.76 : 0.98;
            const siblingOpacity = isHeroPermanent ? 0.45 : 0.9;
            const siblingHeight = "220px";

            gsap.to(p, { flexGrow: siblingFlex, opacity: siblingOpacity, duration: 0.65, ease: "power2.out", overwrite: "auto" });
            if (pWrap) {
              gsap.to(pWrap, {
                height: siblingHeight,
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                duration: 0.65,
                ease: "power2.out",
                overwrite: "auto",
              });
            }
            if (pImg) {
              gsap.to(pImg, { scale: 1.04, duration: 0.65, ease: "power2.out", overwrite: "auto" });
            }
            if (pTitle) {
              gsap.to(pTitle, { opacity: 0, y: 4, duration: 0.3, ease: "power2.out", overwrite: "auto" });
            }
          }
        });
      }
    },
    [activeItems, ambientEchoRef, centerCueRef, pillarWrapsRef, imgWrapsRef, imgsRef, titlesRef]
  );

  const handlePillarMouseEnter = useCallback(
    (idx: number) => {
      if (selectedIndexRef.current !== null) {
        if (selectedIndexRef.current === idx) return;
        const p = pillarWrapsRef.current[idx];
        const pWrap = imgWrapsRef.current[idx];
        const pTitle = titlesRef.current[idx];
        if (p) gsap.to(p, { opacity: 0.75, duration: 0.3, overwrite: "auto" });
        if (pWrap) gsap.to(pWrap, { height: "245px", duration: 0.35, ease: "power2.out", overwrite: "auto" });
        if (pTitle) gsap.to(pTitle, { opacity: 0.5, y: 0, duration: 0.25, overwrite: "auto" });
        return;
      }
      applyVisualState(idx, true);
    },
    [applyVisualState, pillarWrapsRef, imgWrapsRef, titlesRef]
  );

  const handlePillarMouseLeave = useCallback(
    (idx: number) => {
      if (selectedIndexRef.current !== null) {
        if (selectedIndexRef.current === idx) return;
        const p = pillarWrapsRef.current[idx];
        const pWrap = imgWrapsRef.current[idx];
        const pTitle = titlesRef.current[idx];
        if (p) gsap.to(p, { opacity: 0.45, duration: 0.3, overwrite: "auto" });
        if (pWrap) gsap.to(pWrap, { height: "220px", duration: 0.35, ease: "power2.out", overwrite: "auto" });
        if (pTitle) gsap.to(pTitle, { opacity: 0, y: 4, duration: 0.25, overwrite: "auto" });
        return;
      }
      applyVisualState(null, false);
    },
    [applyVisualState, pillarWrapsRef, imgWrapsRef, titlesRef]
  );

  const handlePillarClick = useCallback(
    (idx: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (selectedIndexRef.current === idx) {
        setSelectedIndex(null);
        selectedIndexRef.current = null;
        onExpand?.(null);
        triggerLifecycle("idle");
        applyVisualState(null, false);
      } else {
        setSelectedIndex(idx);
        selectedIndexRef.current = idx;
        onExpand?.(idx);
        triggerLifecycle("peak");
        applyVisualState(idx, false);
      }
    },
    [onExpand, triggerLifecycle, applyVisualState]
  );

  const handleContainerClick = useCallback(() => {
    if (selectedIndexRef.current !== null) {
      setSelectedIndex(null);
      selectedIndexRef.current = null;
      onExpand?.(null);
      triggerLifecycle("idle");
      applyVisualState(null, false);
    }
  }, [onExpand, triggerLifecycle, applyVisualState]);

  // Keyboard dismiss on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedIndexRef.current !== null) {
        setSelectedIndex(null);
        selectedIndexRef.current = null;
        onExpand?.(null);
        triggerLifecycle("idle");
        applyVisualState(null, false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExpand, triggerLifecycle, applyVisualState]);

  return {
    selectedIndex,
    handlePillarMouseEnter,
    handlePillarMouseLeave,
    handlePillarClick,
    handleContainerClick,
  };
}
