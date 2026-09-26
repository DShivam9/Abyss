import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { PillarGalleryProps, AccordionWallItem } from "./types";
import { DEFAULT_ACCORDION_ITEMS } from "./constants";

export const PillarGallery: React.FC<PillarGalleryProps> = ({
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

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedIndexRef = useRef<number | null>(null);
  selectedIndexRef.current = selectedIndex;

  // Normalize curated items list
  const activeItems: AccordionWallItem[] = useMemo(() => {
    if (items && items.length > 0) return items.slice(0, panelCount);
    if (images && images.length > 0) {
      return images.slice(0, panelCount).map((img, idx) => ({
        id: `0${idx + 1}`,
        title: titles?.[idx] || `Exhibition 0${idx + 1}`,
        image: img,
        moodColor: DEFAULT_ACCORDION_ITEMS[idx % DEFAULT_ACCORDION_ITEMS.length]?.moodColor || "#16171b",
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

  // Lifecycle callback
  const triggerLifecycle = useCallback(
    (state: "idle" | "discovery" | "buildUp" | "peak" | "recovery") => {
      onLifecycleChange?.(state);
    },
    [onLifecycleChange]
  );

  // Entrance
  useEffect(() => {
    triggerLifecycle("discovery");
    const validWraps = imgWrapsRef.current.filter(Boolean);

    const tl = gsap.timeline({
      delay: 0.15,
      onComplete: () => triggerLifecycle("idle"),
    });

    tl.to(validWraps, {
      clipPath: "inset(0% 0 0 0)",
      duration: 1.2,
      stagger: 0.08,
      ease: "expo.out",
    }, 0);

    return () => {
      tl.kill();
    };
  }, [triggerLifecycle]);

  // Apply state transitions (towering selected vs gentle hover vs baseline)
  const applyVisualState = useCallback((targetIdx: number | null, _isHoverOnly = false) => {
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
          gsap.to(pWrap, { height: "220px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", duration: 0.6, ease: "cubic-bezier(0.25, 1, 0.5, 1)", overwrite: "auto" });
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

    // Determine the hero index: if someone clicked, it's `selected`; else if hovering, it's `targetIdx`
    const heroIdx = selected !== null ? selected : targetIdx;
    const isHeroPermanent = selected !== null;

    if (heroIdx !== null && activeItems[heroIdx]) {
      const heroItem = activeItems[heroIdx];

      // Ambient echo
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
        gsap.to(centerCueRef.current, { opacity: isHeroPermanent ? 0 : 0.4, duration: 0.4, ease: "power2.out", overwrite: "auto" });
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
            // Full towering click state
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
            // Subtle hover preview: rise up and scale up
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
          // Sibling pillars
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
  }, [activeItems]);

  const handlePillarMouseEnter = (idx: number) => {
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
  };

  const handlePillarMouseLeave = (idx: number) => {
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
  };

  const handlePillarClick = (idx: number, e: React.MouseEvent) => {
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
  };

  const handleContainerClick = () => {
    if (selectedIndexRef.current !== null) {
      setSelectedIndex(null);
      selectedIndexRef.current = null;
      onExpand?.(null);
      triggerLifecycle("idle");
      applyVisualState(null, false);
    }
  };

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

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={`relative w-full h-screen overflow-hidden select-none flex items-end justify-center px-6 bg-[#0c0c0e] font-sans ${className}`}
      style={style}
    >
      {/* Ambient Void Echo Layer */}
      <div
        ref={ambientEchoRef}
        className="absolute inset-0 pointer-events-none z-[1] will-change-[opacity,background-color] [transform:translate3d(0,0,0)]"
        style={{ opacity: 0, backgroundColor: "transparent" }}
      />

      {/* Permanent Editorial Watermark */}
      <div
        ref={centerCueRef}
        className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[2] whitespace-nowrap transition-opacity duration-500 font-serif italic text-white/10 text-4xl sm:text-5xl"
        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
      >
        {watermarkText}
      </div>

      {/* 8-Pillar Matrix Container */}
      <div className="flex gap-4 w-full max-w-[1640px] h-full items-end justify-center mx-auto z-[3] relative pointer-events-auto">
        {activeItems.map((item, idx) => (
          <div
            key={item.id || idx}
            ref={(el) => {
              pillarWrapsRef.current[idx] = el;
            }}
            className="pillar-wrap flex-1 h-full flex flex-col items-center justify-end relative pointer-events-none origin-bottom will-change-[flex-grow,transform,opacity] [transform:translate3d(0,0,0)]"
            style={{ flexGrow: 1 }}
          >
            <div className="mb-3.5 text-center pointer-events-none relative z-10">
              <h3
                ref={(el) => {
                  titlesRef.current[idx] = el;
                }}
                className="font-serif italic font-normal text-[1.35rem] tracking-wide text-white/75 whitespace-nowrap pointer-events-none opacity-0 translate-y-4 transition-colors duration-400"
                style={{ fontFamily: "'Instrument Serif', 'Italiana', Georgia, serif" }}
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
              className="w-full h-[220px] rounded-t-2xl overflow-hidden relative pointer-events-auto cursor-pointer bg-[#16161a] shadow-[0_10px_30px_rgba(0,0,0,0.5)] [clip-path:inset(100%_0_0_0)] will-change-[height,box-shadow,clip-path] [transform:translate3d(0,0,0)]"
            >
              <img
                ref={(el) => {
                  imgsRef.current[idx] = el;
                }}
                src={item.image}
                alt={item.title}
                className="w-full h-[91vh] object-cover object-center block pointer-events-none origin-top scale-[1.04] will-change-transform [transform:translate3d(0,0,0)]"
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AccordionWall = PillarGallery;
export default AccordionWall;
