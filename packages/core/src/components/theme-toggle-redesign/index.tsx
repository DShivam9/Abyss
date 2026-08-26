"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ThemeToggleRedesignProps } from "./types";
import { DEFAULT_THEME_TOGGLE_CONFIG } from "./constants";

export function ThemeToggleRedesign({
  variant = DEFAULT_THEME_TOGGLE_CONFIG.variant,
  enableAudio = DEFAULT_THEME_TOGGLE_CONFIG.enableAudio,
  className = "",
  style = {},
}: ThemeToggleRedesignProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const themeRef = useRef<"dark" | "light">("dark");
  themeRef.current = theme;

  const containerRef = useRef<HTMLDivElement>(null);
  const waveLayerRef = useRef<HTMLDivElement>(null);
  const dialBtnRef = useRef<HTMLButtonElement>(null);
  const lampIconStageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeAnimRef = useRef<Animation | null>(null);

  // Audio files with graceful fallback
  const playSfx = useCallback((type: "engage" | "release") => {
    if (!enableAudio) return;
    try {
      const src = type === "engage" ? "/htmltesting/theme_switch/lamp_engage.wav" : "/htmltesting/theme_switch/lamp_release.wav";
      const audio = new Audio(src);
      audio.volume = type === "engage" ? 0.65 : 0.85;
      audio.play().catch(() => {});
    } catch {
      // Audio autoplay blocked or file missing
    }
  }, [enableAudio]);

  // 1400ms Circular Expanding Screen Wave (Dial Variant) strictly clipped inside container
  const handleDialClick = useCallback(() => {
    const next = themeRef.current === "dark" ? "light" : "dark";
    const btn = dialBtnRef.current;
    const wave = waveLayerRef.current;
    const container = containerRef.current;

    if (btn && wave && container) {
      const cRect = container.getBoundingClientRect();
      const bRect = btn.getBoundingClientRect();
      const ox = (bRect.left - cRect.left) + bRect.width / 2;
      const oy = (bRect.top - cRect.top) + bRect.height / 2;
      const maxR = Math.hypot(
        Math.max(ox, cRect.width - ox),
        Math.max(oy, cRect.height - oy)
      );

      if (activeAnimRef.current) activeAnimRef.current.cancel();

      wave.style.background = next === "light" ? "#f4f4f7" : "#131316";
      wave.style.opacity = "1";

      const anim = wave.animate([
        { clipPath: `circle(0px at ${ox}px ${oy}px)` },
        { clipPath: `circle(${maxR}px at ${ox}px ${oy}px)` }
      ], {
        duration: DEFAULT_THEME_TOGGLE_CONFIG.waveDuration,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards"
      });

      activeAnimRef.current = anim;
      anim.onfinish = () => {
        wave.style.opacity = "0";
        activeAnimRef.current = null;
      };
    }

    setTheme(next);
    playSfx("release");
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(14);
    }
  }, [playSfx]);

  // Lamp Cord Physics Simulation (Persistent Loop decoupled from React re-renders)
  useEffect(() => {
    if (variant !== "lamp") return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = container.clientWidth || 600;
    let h = container.clientHeight || 480;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas || !container) return;
      w = container.clientWidth || 600;
      h = container.clientHeight || 480;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const segs = DEFAULT_THEME_TOGGLE_CONFIG.chainSegments;
    const segLen = DEFAULT_THEME_TOGGLE_CONFIG.segmentLength;
    const restL = segs * segLen;
    const anchorX = Math.max(40, w - 60);

    const pts = Array.from({ length: segs + 1 }, (_, i) => ({
      x: anchorX,
      y: (i / segs) * restL,
      oldX: anchorX,
      oldY: (i / segs) * restL,
      pinned: i === 0,
    }));

    let isDrag = false;
    let tx = anchorX;
    let ty = restL;
    let isPrimed = false;
    let spark = 0;

    const onPointerDown = (e: PointerEvent) => {
      const tip = pts[pts.length - 1];
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      if (Math.hypot(cx - tip.x, cy - tip.y) < 70) {
        isDrag = true;
        isPrimed = false;
        tx = cx;
        ty = cy;
        if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDrag) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const curAnchorX = Math.max(40, w - 60);

      tx = curAnchorX + (cx - curAnchorX) * 0.85;
      const dy = cy - restL;
      ty = dy > 0 ? restL + 190 * Math.tanh(dy / 240) : restL;

      if (ty - restL >= 45) {
        if (!isPrimed) {
          isPrimed = true;
          spark = 1;
          playSfx("engage");
          if (lampIconStageRef.current) lampIconStageRef.current.style.transform = "scale(1.14)";
          if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
        }
      } else if (isPrimed) {
        isPrimed = false;
        if (lampIconStageRef.current) lampIconStageRef.current.style.transform = "";
      }
    };

    const onPointerUp = () => {
      if (!isDrag) return;
      isDrag = false;
      if (lampIconStageRef.current) lampIconStageRef.current.style.transform = "";

      if (isPrimed) {
        const next = themeRef.current === "dark" ? "light" : "dark";
        setTheme(next);
        if (lampIconStageRef.current) {
          lampIconStageRef.current.style.transform = "scale(0.9)";
          setTimeout(() => {
            if (lampIconStageRef.current) lampIconStageRef.current.style.transform = "";
          }, 220);
        }
        playSfx("release");
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([8, 12, 10]);
        isPrimed = false;
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const loop = () => {
      const curAnchorX = Math.max(40, w - 60);
      pts[0].x = curAnchorX;
      pts[0].y = 0;

      pts.forEach((p, i) => {
        if (p.pinned) return;
        if (i === pts.length - 1 && isDrag) {
          p.x = tx;
          p.y = ty;
          p.oldX = tx;
          p.oldY = ty;
          return;
        }
        const vx = (p.x - p.oldX) * 0.95;
        const vy = (p.y - p.oldY) * 0.95;
        p.oldX = p.x;
        p.oldY = p.y;
        p.x += vx;
        p.y += vy + 0.45;
      });

      for (let iter = 0; iter < 12; iter++) {
        for (let i = 0; i < pts.length - 1; i++) {
          const p1 = pts[i];
          const p2 = pts[i + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);
          const diff = (dist - segLen) / (dist || 1);
          if (!p1.pinned) {
            p1.x += dx * 0.5 * diff;
            p1.y += dy * 0.5 * diff;
          }
          if (!p2.pinned && !(i + 1 === pts.length - 1 && isDrag)) {
            p2.x -= dx * 0.5 * diff;
            p2.y -= dy * 0.5 * diff;
          }
        }
      }

      if (spark > 0) spark *= 0.88;

      ctx.clearRect(0, 0, w, h);
      const isL = themeRef.current === "light";

      // 1. Wire Core
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2);
      }
      ctx.strokeStyle = isL ? "#71717a" : "#444450";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 2. 3D Metallic Beads
      for (let i = 1; i < pts.length - 1; i++) {
        const p = pts[i];
        const bg = ctx.createRadialGradient(p.x - 0.7, p.y - 0.7, 0.4, p.x, p.y, 2.4);
        if (isL) {
          bg.addColorStop(0, "#ffffff");
          bg.addColorStop(0.5, "#d4d4d8");
          bg.addColorStop(1, "#8e8e98");
        } else {
          bg.addColorStop(0, "#a1a1aa");
          bg.addColorStop(0.5, "#484852");
          bg.addColorStop(1, "#18181c");
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x - 0.8, p.y - 0.8, 0.7, 0, Math.PI * 2);
        ctx.fillStyle = isL ? "#ffffff" : "rgba(255,255,255,0.6)";
        ctx.fill();
      }

      // 3. Machined Bell Fob
      const tip = pts[pts.length - 1];
      const prev = pts[pts.length - 2];
      const angle = Math.atan2(tip.y - prev.y, tip.x - prev.x) - Math.PI / 2;

      ctx.save();
      ctx.translate(tip.x, tip.y);
      ctx.rotate(angle);

      const topW = 4.5;
      const baseW = 12;
      const fobH = 38;

      ctx.shadowColor = isL ? "rgba(0, 0, 0, 0.18)" : "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;

      ctx.beginPath();
      ctx.roundRect(-topW - 1, -4, (topW + 1) * 2, 4.5, 2);
      ctx.fillStyle = isL ? "#d4d4d8" : "#27272a";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-topW, 0);
      ctx.bezierCurveTo(-topW - 1, 10, -baseW - 1.5, 26, -baseW, fobH - 4);
      ctx.quadraticCurveTo(-baseW, fobH, 0, fobH);
      ctx.quadraticCurveTo(baseW, fobH, baseW, fobH - 4);
      ctx.bezierCurveTo(baseW + 1.5, 26, topW + 1, 10, topW, 0);
      ctx.closePath();

      const grad = ctx.createLinearGradient(-baseW, 0, baseW, 0);
      if (isL) {
        grad.addColorStop(0, "#9e9ea8");
        grad.addColorStop(0.2, "#dedee6");
        grad.addColorStop(0.5, "#ffffff");
        grad.addColorStop(0.8, "#d4d4dc");
        grad.addColorStop(1, "#92929e");
      } else {
        grad.addColorStop(0, "#141418");
        grad.addColorStop(0.25, "#32323e");
        grad.addColorStop(0.5, "#4a4a58");
        grad.addColorStop(0.75, "#22222a");
        grad.addColorStop(1, "#0c0c0f");
      }
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.shadowColor = "transparent";

      ctx.strokeStyle = isL ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-topW - 1, 9);
      ctx.lineTo(topW + 1, 9);
      ctx.moveTo(-topW - 2, 14);
      ctx.lineTo(topW + 2, 14);
      ctx.moveTo(-baseW + 2, fobH - 9);
      ctx.lineTo(baseW - 2, fobH - 9);
      ctx.stroke();

      ctx.strokeStyle = isL ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.moveTo(-0.5, 1);
      ctx.lineTo(-1.5, fobH - 4);
      ctx.stroke();

      if (spark > 0.05) {
        ctx.beginPath();
        ctx.arc(0, fobH / 2, baseW * 1.4 * spark, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 240, 138, ${spark * 0.55})`;
        ctx.fill();
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [variant, playSfx]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[480px] max-h-[85vh] rounded-[32px] flex items-center justify-center overflow-hidden select-none transition-colors duration-500 ${
        theme === "dark"
          ? "bg-[#131316] border border-white/[0.06] text-[#f4f4f5]"
          : "bg-[#f4f4f7] border border-black/[0.06] text-[#09090b]"
      } ${className}`}
      style={style}
    >
      {/* Expanding Wave Layer strictly clipped inside rounded container */}
      <div ref={waveLayerRef} className="absolute inset-0 pointer-events-none z-20 opacity-0 rounded-[32px]" />

      {/* Volumetric Lamp Glow */}
      <div
        className="absolute inset-0 pointer-events-none z-10 rounded-[32px] transition-opacity duration-700"
        style={{
          opacity: variant === "lamp" && theme === "light" ? 1 : 0,
          background: "radial-gradient(circle 800px at calc(100% - 60px) 0px, rgba(255,235,185,0.32) 0%, rgba(255,215,150,0.14) 50%, transparent 85%)"
        }}
      />

      {/* VARIANT A: 3D Dial (Locked to Dead Center) */}
      {variant === "dial" && (
        <div
          className={`relative z-30 w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-400 ${
            theme === "dark"
              ? "bg-[#0d0d10] border border-white/10 [box-shadow:inset_0_4px_10px_rgba(0,0,0,0.95),inset_0_-1.5px_2px_rgba(255,255,255,0.08)]"
              : "bg-[#e2e2ea] border border-black/10 [box-shadow:inset_0_4px_8px_rgba(0,0,0,0.18),inset_0_-2px_2px_#fff]"
          }`}
        >
          <button
            ref={dialBtnRef}
            type="button"
            onClick={handleDialClick}
            aria-label="Toggle theme"
            className={`relative w-[56px] h-[56px] rounded-full cursor-pointer flex items-center justify-center outline-none border-0 -translate-y-[2.5px] active:translate-y-[2.5px] transition-all duration-120 ${
              theme === "dark"
                ? "bg-gradient-to-b from-[#24242d] via-[#15151a] to-[#0e0e12] [box-shadow:inset_0_1.5px_1px_rgba(255,255,255,0.35),0_1px_0_#181820,0_2px_0_#14141a,0_3px_0_#101015,0_4.5px_0_#0b0b0e,0_8px_18px_rgba(0,0,0,0.85)] active:[box-shadow:inset_0_2px_4px_rgba(0,0,0,0.4)]"
                : "bg-gradient-to-b from-[#ffffff] via-[#ececf2] to-[#dedee6] [box-shadow:inset_0_1.5px_1.5px_#fff,0_1px_0_#d8d8e2,0_2px_0_#cfcfe0,0_3px_0_#c8c8d8,0_4.5px_0_#bebec8,0_8px_16px_rgba(0,0,0,0.12)] active:[box-shadow:inset_0_2px_4px_rgba(0,0,0,0.4)]"
            }`}
          >
            <div className="relative w-8 h-8 flex items-center justify-center pointer-events-none">
              {/* Solar Rays */}
              <svg
                className={`absolute w-[30px] h-[30px] transition-all duration-850 stroke-current ${
                  theme === "light"
                    ? "scale-100 rotate-0 opacity-100 text-[#09090b]"
                    : "scale-20 rotate-75 opacity-0 text-white"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <line x1="12" y1="1" x2="12" y2="3.5" />
                <line x1="12" y1="20.5" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.99" y2="5.99" />
                <line x1="18.01" y1="18.01" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3.5" y2="12" />
                <line x1="20.5" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.99" y2="18.01" />
                <line x1="18.01" y1="5.99" x2="19.78" y2="4.22" />
              </svg>

              {/* Celestial Core + Lunar Shadow */}
              <div
                className={`relative w-[18px] h-[18px] rounded-full overflow-hidden transition-all duration-850 ${
                  theme === "light"
                    ? "bg-[#09090b] scale-100 rotate-0"
                    : "bg-white scale-105 -rotate-22 [box-shadow:0_0_6px_rgba(255,255,255,0.5)]"
                }`}
              >
                <div
                  className={`absolute inset-[-1px] rounded-full transition-all duration-850 ${
                    theme === "dark"
                      ? "bg-[#141418] translate-x-[5.8px] -translate-y-[4px]"
                      : "bg-[#f4f4f6] -translate-x-[160%] -translate-y-[160%]"
                  }`}
                />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* VARIANT B: Lamp Floating Icon + Physics Cord */}
      {variant === "lamp" && (
        <>
          <div ref={lampIconStageRef} className="relative z-30 pointer-events-none transition-transform duration-220">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg
                className={`absolute w-[30px] h-[30px] transition-all duration-850 stroke-current ${
                  theme === "light"
                    ? "scale-100 rotate-0 opacity-100 text-[#09090b]"
                    : "scale-20 rotate-75 opacity-0 text-white"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <line x1="12" y1="1" x2="12" y2="3.5" />
                <line x1="12" y1="20.5" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.99" y2="5.99" />
                <line x1="18.01" y1="18.01" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3.5" y2="12" />
                <line x1="20.5" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.99" y2="18.01" />
                <line x1="18.01" y1="5.99" x2="19.78" y2="4.22" />
              </svg>
              <div
                className={`relative w-[18px] h-[18px] rounded-full overflow-hidden transition-all duration-850 ${
                  theme === "light"
                    ? "bg-[#09090b] scale-100 rotate-0"
                    : "bg-white scale-105 -rotate-22 [box-shadow:0_0_6px_rgba(255,255,255,0.5)]"
                }`}
              >
                <div
                  className={`absolute inset-[-1px] rounded-full transition-all duration-850 ${
                    theme === "dark"
                      ? "bg-[#141418] translate-x-[5.8px] -translate-y-[4px]"
                      : "bg-[#f4f4f6] -translate-x-[160%] -translate-y-[160%]"
                  }`}
                />
              </div>
            </div>
          </div>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-40 touch-none rounded-[32px]" />
        </>
      )}
    </div>
  );
}

export default ThemeToggleRedesign;
