"use client";

import { FC, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { PolyptychFormationProps } from "./types";
import {
  DEFAULT_POLYPTYCH_ITEMS,
  DEFAULT_INTRO_LINES,
  DEFAULT_OUTRO_LINES,
} from "./constants";
import styles from "./styles.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const PolyptychFormation: FC<PolyptychFormationProps> = ({
  items = DEFAULT_POLYPTYCH_ITEMS,
  introLines = DEFAULT_INTRO_LINES,
  outroLines = DEFAULT_OUTRO_LINES,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const introSectionRef = useRef<HTMLElement>(null);
  const dialogueTextRef = useRef<HTMLDivElement>(null);
  const stageMosaicRef = useRef<HTMLElement>(null);
  const rowMidRef = useRef<HTMLDivElement>(null);
  const itemHeroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const itemMidLeftRef = useRef<HTMLDivElement>(null);
  const itemMidRightRef = useRef<HTMLDivElement>(null);
  const midLeftImgRef = useRef<HTMLImageElement>(null);
  const midRightImgRef = useRef<HTMLImageElement>(null);
  const rowTopRef = useRef<HTMLDivElement>(null);
  const rowBotRef = useRef<HTMLDivElement>(null);
  const section2OutroRef = useRef<HTMLDivElement>(null);

  // Map items by role with safe fallbacks
  const heroItem = items.find((i) => i.role === "hero") || items[3] || items[0];
  const midLeftItem = items.find((i) => i.role === "midLeft") || items[2] || items[0];
  const midRightItem = items.find((i) => i.role === "midRight") || items[4] || items[0];
  const topLeftItem = items.find((i) => i.role === "topLeft") || items[0];
  const topRightItem = items.find((i) => i.role === "topRight") || items[1] || items[0];
  const bottomLeftItem = items.find((i) => i.role === "bottomLeft") || items[5] || items[0];
  const bottomRightItem = items.find((i) => i.role === "bottomRight") || items[6] || items[0];

  useEffect(() => {
    if (typeof window === "undefined" || !rootRef.current || !contentRef.current) return;

    onLifecycleChange?.("discovery");

    const root = rootRef.current;
    const content = contentRef.current;

    // ─── Lenis Smooth Scroll on internal container ───
    const lenis = new Lenis({
      wrapper: root,
      content,
      lerp: 0.055,
      wheelMultiplier: 0.8,
      smoothWheel: true,
      touchMultiplier: 1.2,
      autoRaf: false,
    });

    lenis.scrollTo(0, { immediate: true, force: true });
    lenis.on("scroll", ScrollTrigger.update);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);

    const ctx = gsap.context(() => {
      const tops = root.querySelectorAll<HTMLElement>(`.${styles.segmentTop}`);
      const bots = root.querySelectorAll<HTMLElement>(`.${styles.segmentBot}`);
      const lineTexts = root.querySelectorAll<HTMLElement>(`.${styles.lineText}`);
      const stripBgs = root.querySelectorAll<HTMLElement>(`.${styles.stripBg}`);

      // ─── 1. Section 1: Tactile Vertical Shutter Convergence (Outside-to-In) ───
      if (tops.length >= 5 && bots.length >= 5) {
        const introTl = gsap.timeline({ delay: 0.15 });

        // Outer lines (0 & 4) glide smoothly from top and bottom
        introTl.to([tops[0], bots[0], tops[4], bots[4]], {
          scaleY: 1,
          duration: 1.15,
          ease: "power3.out",
        }, 0);

        // Inner lines (1 & 3) glide with graceful staircase offset
        introTl.to([tops[1], bots[1], tops[3], bots[3]], {
          scaleY: 1,
          duration: 1.15,
          ease: "power3.out",
        }, 0.25);

        // Center spine line (2) completes the convergence
        introTl.to([tops[2], bots[2]], {
          scaleY: 1,
          duration: 1.15,
          ease: "power3.out",
        }, 0.5);

        // Text lifts gracefully while lines are converging (y: 7px -> 0, opacity: 0 -> 1)
        introTl.fromTo(lineTexts, {
          opacity: 0,
          y: 7,
          color: "#dedcd6",
        }, {
          opacity: 1,
          y: 0,
          color: "#dedcd6",
          stagger: 0.18,
          duration: 1.0,
          ease: "power2.out",
        }, 0.45);

        // Strips glide out smoothly just as center line lands
        introTl.to(stripBgs, {
          scaleX: 1,
          stagger: 0.18,
          duration: 1.1,
          ease: "power3.out",
        }, 1.15);

        // Tactile ink soak as strip glides underneath -> text turns to jet black #060608
        introTl.to(lineTexts, {
          color: "#060608",
          stagger: 0.18,
          duration: 0.55,
          ease: "power2.inOut",
        }, "<+=0.1");
      }

      // ─── 2. Section 1: Dialogue softly yields upward on scroll ───
      if (dialogueTextRef.current && introSectionRef.current) {
        gsap.to(dialogueTextRef.current, {
          opacity: 0.05,
          y: -80,
          ease: "none",
          scrollTrigger: {
            scroller: root,
            trigger: introSectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // ─── 3. Section 2: Master Pinned Matrix Stage Hydraulic Scrub ───
      if (stageMosaicRef.current) {
        const topImgs = rowTopRef.current?.querySelectorAll<HTMLImageElement>(`.${styles.parallaxImg}`) || [];
        const botImgs = rowBotRef.current?.querySelectorAll<HTMLImageElement>(`.${styles.parallaxImg}`) || [];

        const masterTl = gsap.timeline({
          scrollTrigger: {
            scroller: root,
            trigger: stageMosaicRef.current,
            start: "top top",
            end: "+=2800",
            pin: true,
            pinSpacing: true,
            scrub: true,
            onUpdate: (self) => {
              if (self.progress > 0.05 && self.progress < 0.95) {
                onLifecycleChange?.("buildUp");
              } else if (self.progress >= 0.95) {
                onLifecycleChange?.("peak");
              } else {
                onLifecycleChange?.("idle");
              }
            },
          },
        });

        // 1. Center Hero width compresses 100vw -> 50vw and corners round to 5px
        if (itemHeroRef.current) {
          masterTl.to(itemHeroRef.current, {
            width: "50vw",
            borderRadius: "5px",
            ease: "sine.inOut",
            duration: 3.0,
          }, 0.3);
        }

        // 2. Middle Row height compresses 100vh -> 58vh
        if (rowMidRef.current) {
          masterTl.to(rowMidRef.current, {
            height: "58vh",
            ease: "sine.inOut",
            duration: 3.0,
          }, 0.3);
        }

        // 3. Side images expand from 0vw -> 32vw
        if (itemMidLeftRef.current && itemMidRightRef.current) {
          masterTl.to([itemMidLeftRef.current, itemMidRightRef.current], {
            width: "32vw",
            ease: "sine.inOut",
            duration: 3.0,
          }, 0.3);
        }

        // 4. Opposing Internal Counter-Parallax during hydraulic squeeze
        if (heroImgRef.current) {
          masterTl.fromTo(heroImgRef.current,
            { scale: 1.25, yPercent: -6 },
            { scale: 1.05, yPercent: 4, ease: "sine.inOut", duration: 3.0 },
            0.3
          );
        }

        if (topImgs.length > 0) {
          masterTl.fromTo(topImgs,
            { yPercent: 12, scale: 1.2 },
            { yPercent: -8, scale: 1.1, ease: "sine.inOut", duration: 3.0 },
            0.3
          );
        }

        if (botImgs.length > 0) {
          masterTl.fromTo(botImgs,
            { yPercent: -12, scale: 1.2 },
            { yPercent: 8, scale: 1.1, ease: "sine.inOut", duration: 3.0 },
            0.3
          );
        }

        if (midLeftImgRef.current) {
          masterTl.fromTo(midLeftImgRef.current,
            { xPercent: 8, scale: 1.25 },
            { xPercent: -6, scale: 1.15, ease: "sine.inOut", duration: 3.0 },
            0.3
          );
        }

        if (midRightImgRef.current) {
          masterTl.fromTo(midRightImgRef.current,
            { xPercent: -8, scale: 1.25 },
            { xPercent: 6, scale: 1.15, ease: "sine.inOut", duration: 3.0 },
            0.3
          );
        }

        // 5. Fade in outro statement at bottom when matrix settles
        if (section2OutroRef.current) {
          masterTl.to(section2OutroRef.current, {
            opacity: 1,
            ease: "sine.out",
            duration: 0.8,
          }, 2.4);
        }
      }

      ScrollTrigger.refresh();
    }, root);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      ctx.revert();
    };
  }, [onLifecycleChange]);

  return (
    <div ref={rootRef} className={`${styles.root} ${className}`} style={style} data-lenis-prevent>
      <div ref={contentRef} className={styles.scrollContent}>
        {/* Architectural Reticle Lines (z-index: 1, behind media) */}
        <div className={styles.reticleGrid} aria-hidden="true">
          <div className={styles.reticleLine}><div className={styles.segmentTop} /><div className={styles.segmentBot} /></div>
          <div className={styles.reticleLine}><div className={styles.segmentTop} /><div className={styles.segmentBot} /></div>
          <div className={styles.reticleLine}><div className={styles.segmentTop} /><div className={styles.segmentBot} /></div>
          <div className={styles.reticleLine}><div className={styles.segmentTop} /><div className={styles.segmentBot} /></div>
          <div className={styles.reticleLine}><div className={styles.segmentTop} /><div className={styles.segmentBot} /></div>
        </div>

        {/* SECTION 1: Intro Dialogue Stage */}
        <section ref={introSectionRef} className={styles.stageIntro}>
          <div ref={dialogueTextRef} className={styles.dialogueWrap}>
            {introLines.map((line) => (
              <div key={line} className={styles.dialogueLine}>
                <div className={styles.stripBg} />
                <span className={styles.lineText}>
                  <span className={styles.asterisk}>✽</span>
                  {line}
                  <span className={styles.asterisk}>✽</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: Pinned Matrix Stage */}
        <section ref={stageMosaicRef} className={styles.stageMosaic}>
          <div className={styles.scrubWrapLayout}>
            {/* Top Row */}
            <div ref={rowTopRef} className={`${styles.scrubRow} ${styles.rowTop}`}>
              <div className={styles.scrubItem}>
                <img src={topLeftItem.src} alt={topLeftItem.alt || ""} className={styles.parallaxImg} />
              </div>
              <div className={styles.scrubItem}>
                <img src={topRightItem.src} alt={topRightItem.alt || ""} className={styles.parallaxImg} />
              </div>
            </div>

            {/* Middle Row */}
            <div ref={rowMidRef} className={`${styles.scrubRow} ${styles.rowMid}`}>
              <div ref={itemMidLeftRef} className={`${styles.scrubItem} ${styles.itemMidLeft}`}>
                <img ref={midLeftImgRef} src={midLeftItem.src} alt={midLeftItem.alt || ""} className={styles.parallaxImg} />
              </div>
              <div ref={itemHeroRef} className={`${styles.scrubItem} ${styles.itemHero}`}>
                <img ref={heroImgRef} src={heroItem.src} alt={heroItem.alt || ""} className={styles.parallaxImg} />
              </div>
              <div ref={itemMidRightRef} className={`${styles.scrubItem} ${styles.itemMidRight}`}>
                <img ref={midRightImgRef} src={midRightItem.src} alt={midRightItem.alt || ""} className={styles.parallaxImg} />
              </div>
            </div>

            {/* Bottom Row */}
            <div ref={rowBotRef} className={`${styles.scrubRow} ${styles.rowBot}`}>
              <div className={styles.scrubItem}>
                <img src={bottomLeftItem.src} alt={bottomLeftItem.alt || ""} className={styles.parallaxImg} />
              </div>
              <div className={styles.scrubItem}>
                <img src={bottomRightItem.src} alt={bottomRightItem.alt || ""} className={styles.parallaxImg} />
              </div>
            </div>
          </div>

          {/* Bottom Outro Statement inside Section 2 */}
          <div ref={section2OutroRef} className={`${styles.dialogueWrap} ${styles.section2Outro}`}>
            {outroLines.map((line) => (
              <span key={line} className={styles.outroSpan}>
                <span className={styles.asterisk}>✽</span>
                {line}
                <span className={styles.asterisk}>✽</span>
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PolyptychFormation;
