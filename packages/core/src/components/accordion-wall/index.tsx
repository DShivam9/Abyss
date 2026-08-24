import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ApparatusAccordionWallProps, AccordionWallItem } from "./types";
import { DEFAULT_ACCORDION_ITEMS } from "./constants";

export const ApparatusAccordionWall: React.FC<ApparatusAccordionWallProps> = ({
  items,
  images,
  titles,
  watermarkText = "Hover to Unveil • Click to Expand",
  panelCount = 8,
  speed = 1.35,
  onExpand,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ambientEchoRef = useRef<HTMLDivElement>(null);
  const centerCueRef = useRef<HTMLDivElement>(null);
  const expandedMonolithRef = useRef<HTMLDivElement>(null);
  const expandedHeaderBarRef = useRef<HTMLDivElement>(null);
  const expandedTitleRef = useRef<HTMLDivElement>(null);
  const expandedImgRef = useRef<HTMLImageElement>(null);
  const expandedInnerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const pillarWrapsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imgWrapsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imgsRef = useRef<(HTMLImageElement | null)[]>([]);
  const titlesRef = useRef<(HTMLHeadingElement | null)[]>([]);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const activeOriginRectRef = useRef<DOMRect | null>(null);

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

  // 120 FPS GPU-Composited Page-Load Entrance
  useEffect(() => {
    triggerLifecycle("discovery");
    const validWraps = imgWrapsRef.current.filter(Boolean);
    const validTitles = titlesRef.current.filter(Boolean);

    const tl = gsap.timeline({
      delay: 0.2,
      onComplete: () => triggerLifecycle("idle"),
    });

    tl.to(validWraps, {
      clipPath: "inset(0% 0 0 0)",
      duration: 1.35,
      stagger: 0.1,
      ease: "expo.out",
    }, 0)
    .to(validTitles, {
      opacity: 1,
      y: 0,
      duration: 0.95,
      stagger: 0.1,
      ease: "power3.out",
    }, 0.35);

    return () => {
      tl.kill();
    };
  }, [triggerLifecycle]);

  // Collapse Monolith back into starting slot
  const collapseExpanded = useCallback(() => {
    if (expandedIndex === null) return;
    const originIdx = expandedIndex;
    setExpandedIndex(null);
    onExpand?.(null);
    triggerLifecycle("recovery");

    const wrap = imgWrapsRef.current[originIdx];
    const pillar = pillarWrapsRef.current[originIdx];
    const rect = activeOriginRectRef.current || wrap?.getBoundingClientRect();

    if (!rect || !expandedMonolithRef.current) return;

    if (closeBtnRef.current) {
      closeBtnRef.current.style.pointerEvents = "none";
    }

    const tl = gsap.timeline({
      defaults: { ease: "cubic-bezier(0.16, 1, 0.3, 1)" },
      onComplete: () => {
        if (expandedMonolithRef.current) {
          gsap.set(expandedMonolithRef.current, { visibility: "hidden", opacity: 0, pointerEvents: "none" });
        }
        if (pillar && wrap) {
          gsap.set([pillar, wrap], { opacity: 1 });
        }
        activeOriginRectRef.current = null;
        triggerLifecycle("idle");
      },
    });

    tl.to(expandedHeaderBarRef.current, { opacity: 0, y: 10, duration: 0.35 }, 0)
      .to(expandedMonolithRef.current, {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        duration: 0.95,
      }, 0)
      .to(centerCueRef.current, { opacity: 1, duration: 0.6 }, 0.3);

    // Regroup siblings in perfect sync
    pillarWrapsRef.current.forEach((p, i) => {
      if (p && i !== originIdx) {
        const dist = Math.abs(i - originIdx);
        gsap.to(p, {
          x: 0,
          opacity: 1,
          duration: 0.9,
          delay: 0.08 + dist * 0.025,
          ease: "cubic-bezier(0.16, 1, 0.3, 1)",
          overwrite: "auto",
        });
      }
    });

    if (ambientEchoRef.current) {
      gsap.to(ambientEchoRef.current, {
        opacity: 0,
        duration: 1.0,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, [expandedIndex, onExpand, triggerLifecycle]);

  // Precision FLIP Expand Monolith
  const expandPillar = useCallback(
    (idx: number) => {
      if (expandedIndex !== null) return;
      setExpandedIndex(idx);
      onExpand?.(idx);
      triggerLifecycle("peak");

      // Instantly kill in-flight tweens for zero lag
      gsap.killTweensOf(pillarWrapsRef.current.filter(Boolean));
      gsap.killTweensOf(imgWrapsRef.current.filter(Boolean));
      gsap.killTweensOf(imgsRef.current.filter(Boolean));

      const pillar = pillarWrapsRef.current[idx];
      const wrap = imgWrapsRef.current[idx];
      const img = imgsRef.current[idx];
      const item = activeItems[idx];
      if (!pillar || !wrap || !img || !item) return;

      const rect = wrap.getBoundingClientRect();
      activeOriginRectRef.current = rect;

      if (expandedTitleRef.current) expandedTitleRef.current.textContent = item.title;
      if (expandedImgRef.current) expandedImgRef.current.src = img.src;

      const targetWidth = window.innerWidth - 48;
      const targetHeight = window.innerHeight * 0.91;
      const targetLeft = 24;
      const targetTop = window.innerHeight - targetHeight;

      if (expandedMonolithRef.current) {
        gsap.set(expandedMonolithRef.current, {
          visibility: "visible",
          opacity: 1,
          pointerEvents: "auto",
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          transform: "none",
        });
      }

      // Atomically hide origin pillar & wrap
      gsap.set([pillar, wrap], { opacity: 0 });

      // Physics-Coupled Displacement: Direction-aware wave
      pillarWrapsRef.current.forEach((p, i) => {
        if (p && i !== idx) {
          const dist = Math.abs(i - idx);
          const pushDistance = i < idx ? -(window.innerWidth * 1.15) : window.innerWidth * 1.15;
          gsap.to(p, {
            x: pushDistance,
            opacity: 0,
            duration: 1.25,
            delay: 0.08 + dist * 0.065,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)",
            overwrite: "auto",
          });
        }
      });

      // Monolith Unfurl with unified header fade
      const tl = gsap.timeline({ defaults: { ease: "cubic-bezier(0.22, 1, 0.36, 1)" } });

      tl.to(centerCueRef.current, { opacity: 0, duration: 0.5 }, 0)
        .to(expandedMonolithRef.current, {
          left: targetLeft,
          top: targetTop,
          width: targetWidth,
          height: targetHeight,
          duration: speed,
        }, 0)
        .fromTo(expandedHeaderBarRef.current, {
          opacity: 0,
          y: 14,
        }, {
          opacity: 1,
          y: 0,
          duration: 0.75,
        }, 0.35);

      if (closeBtnRef.current) {
        closeBtnRef.current.style.pointerEvents = "auto";
      }

      if (ambientEchoRef.current && item.moodColor) {
        gsap.to(ambientEchoRef.current, {
          backgroundColor: item.moodColor,
          opacity: 0.95,
          duration: 1.2,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    },
    [expandedIndex, onExpand, activeItems, speed, triggerLifecycle]
  );

  // Silky continuous hover
  const handlePillarMouseEnter = (idx: number) => {
    if (expandedIndex !== null) return;
    const item = activeItems[idx];

    if (ambientEchoRef.current && item?.moodColor) {
      gsap.to(ambientEchoRef.current, {
        backgroundColor: item.moodColor,
        opacity: 0.88,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    pillarWrapsRef.current.forEach((p, i) => {
      if (!p) return;
      const isTarget = i === idx;
      const pWrap = imgWrapsRef.current[i];
      const pImg = imgsRef.current[i];

      if (isTarget) {
        p.classList.add("is-active");
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
          gsap.to(pImg, {
            scale: 1.0,
            duration: 0.85,
            ease: "cubic-bezier(0.25, 1, 0.5, 1)",
            overwrite: "auto",
          });
        }
        gsap.to(p, {
          flexGrow: 2.6,
          opacity: 1,
          duration: 0.75,
          ease: "power2.out",
          overwrite: "auto",
        });
      } else {
        p.classList.remove("is-active");
        if (pWrap) {
          gsap.to(pWrap, {
            height: "220px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            duration: 0.75,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
        if (pImg) {
          gsap.to(pImg, {
            scale: 1.04,
            duration: 0.75,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
        gsap.to(p, {
          flexGrow: 0.78,
          opacity: 0.55,
          duration: 0.75,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    });
  };

  const handlePillarMouseLeave = () => {
    if (expandedIndex !== null) return;
    if (ambientEchoRef.current) {
      gsap.to(ambientEchoRef.current, {
        opacity: 0,
        duration: 1.0,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    pillarWrapsRef.current.forEach((p, i) => {
      if (!p) return;
      p.classList.remove("is-active");
      const pWrap = imgWrapsRef.current[i];
      const pImg = imgsRef.current[i];

      gsap.to(p, {
        flexGrow: 1,
        opacity: 1,
        duration: 0.7,
        ease: "cubic-bezier(0.25, 1, 0.5, 1)",
        overwrite: "auto",
      });

      if (pWrap) {
        gsap.to(pWrap, {
          height: "220px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          duration: 0.7,
          ease: "cubic-bezier(0.25, 1, 0.5, 1)",
          overwrite: "auto",
        });
      }

      if (pImg) {
        gsap.to(pImg, {
          transform: "translateY(0%) scale(1.04)",
          duration: 0.7,
          ease: "cubic-bezier(0.25, 1, 0.5, 1)",
          overwrite: "auto",
        });
      }
    });
  };

  // Keyboard dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") collapseExpanded();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [collapseExpanded]);

  return (
    <div
      ref={containerRef}
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

      {/* Dedicated FLIP Monolith Layer */}
      <div
        ref={expandedMonolithRef}
        className="fixed bottom-0 left-6 w-[calc(100vw-48px)] h-[91vh] z-[100] pointer-events-none opacity-0 invisible overflow-visible will-change-[transform,width,height,left,top,opacity] [transform:translate3d(0,0,0)]"
      >
        {/* Minimal Integrated Top Bar (No Numbers, Optical Center Title + Right Close) */}
        <div
          ref={expandedHeaderBarRef}
          className="absolute bottom-[calc(100%+14px)] left-0 w-full flex items-center justify-between pointer-events-none z-[102] px-1"
        >
          {/* Left Balance Spacer */}
          <div className="w-24 h-6 pointer-events-none" />

          {/* Center Title */}
          <div
            ref={expandedTitleRef}
            className="font-serif italic font-normal text-white text-[1.75rem] leading-none tracking-wide text-center pointer-events-none"
            style={{ fontFamily: "'Instrument Serif', 'Italiana', Georgia, serif" }}
          >
            Title
          </div>

          {/* Right Minimal Close Pill */}
          <button
            ref={closeBtnRef}
            onClick={collapseExpanded}
            aria-label="Close Fullscreen"
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-white/75 hover:text-white hover:bg-white/[0.14] hover:border-white/30 transition-all duration-300 font-mono text-[11px] uppercase tracking-wider cursor-pointer"
          >
            <span>Close</span>
            <svg className="w-3 h-3 stroke-current stroke-[1.75]" viewBox="0 0 16 16" fill="none">
              <line x1="3" y1="3" x2="13" y2="13" />
              <line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          </button>
        </div>

        {/* Monolith Body */}
        <div
          ref={expandedInnerRef}
          onClick={collapseExpanded}
          className="w-full h-full rounded-t-3xl overflow-hidden relative bg-[#121214] shadow-[0_0_40px_rgba(0,0,0,0.6)] cursor-pointer"
        >
          <img
            ref={expandedImgRef}
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt="Expanded Artwork"
            className="w-full h-full object-cover object-center block"
          />
        </div>
      </div>

      {/* 8-Pillar Matrix Container */}
      <div className="flex gap-4 w-full max-w-[1640px] h-full items-end justify-center mx-auto z-[3] relative">
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
                className="font-serif italic font-normal text-[1.35rem] tracking-wide text-white/65 whitespace-nowrap pointer-events-none opacity-0 translate-y-4 transition-colors duration-400"
                style={{ fontFamily: "'Instrument Serif', 'Italiana', Georgia, serif" }}
              >
                {item.title}
              </h3>
            </div>

            <div
              ref={(el) => {
                imgWrapsRef.current[idx] = el;
              }}
              onClick={() => expandPillar(idx)}
              onMouseEnter={() => handlePillarMouseEnter(idx)}
              onMouseLeave={handlePillarMouseLeave}
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

export const PillarGallery = ApparatusAccordionWall;
export default ApparatusAccordionWall;
