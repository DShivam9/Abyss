import { useEffect, RefObject } from "react";
import { DEFAULT_THEME_TOGGLE_CONFIG } from "./constants";
import { playToggleSfx } from "./audio";
import { useLatestRef } from "../../hooks/use-latest-ref";

interface UseLampCordProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  lampIconStageRef: RefObject<HTMLDivElement | null>;
  variant: "dial" | "lamp";
  theme: "dark" | "light";
  onToggleTheme: () => void;
  enableAudio?: boolean;
  tier?: "low" | "medium" | "high";
  dpr?: number;
  reducedMotion?: boolean;
}

export function useLampCord({
  canvasRef,
  containerRef,
  lampIconStageRef,
  variant,
  theme,
  onToggleTheme,
  enableAudio = true,
  tier = "high",
  dpr = 1,
  reducedMotion = false
}: UseLampCordProps) {
  const themeRef = useLatestRef(theme);
  const onToggleThemeRef = useLatestRef(onToggleTheme);
  const enableAudioRef = useLatestRef(enableAudio);
  const tierRef = useLatestRef(tier);
  const dprRef = useLatestRef(dpr);
  const reducedMotionRef = useLatestRef(reducedMotion);

  useEffect(() => {
    if (variant !== "lamp") return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let isDestroyed = false;
    let w = container.clientWidth || 600;
    let h = container.clientHeight || 480;

    const resize = () => {
      if (!canvas || !container || isDestroyed) return;
      w = container.clientWidth || 600;
      h = container.clientHeight || 480;
      const curDpr = dprRef.current;
      canvas.width = w * curDpr;
      canvas.height = h * curDpr;
      ctx.setTransform(curDpr, 0, 0, curDpr, 0, 0);
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
      pinned: i === 0
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
        if (canvas.setPointerCapture) {
          try {
            canvas.setPointerCapture(e.pointerId);
          } catch {
            // pointer capture fallback
          }
        }
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
          playToggleSfx("engage", enableAudioRef.current);
          if (lampIconStageRef.current) lampIconStageRef.current.style.transform = "scale(1.14)";
          if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
        }
      } else if (isPrimed) {
        isPrimed = false;
        if (lampIconStageRef.current) lampIconStageRef.current.style.transform = "";
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDrag) return;
      isDrag = false;
      if (lampIconStageRef.current) lampIconStageRef.current.style.transform = "";

      if (canvas.releasePointerCapture) {
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }

      if (isPrimed) {
        onToggleThemeRef.current();
        if (lampIconStageRef.current) {
          lampIconStageRef.current.style.transform = "scale(0.9)";
          setTimeout(() => {
            if (lampIconStageRef.current) lampIconStageRef.current.style.transform = "";
          }, 220);
        }
        playToggleSfx("release", enableAudioRef.current);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([8, 12, 10]);
        isPrimed = false;
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    let lastLoopTime = performance.now();
    const loop = () => {
      if (isDestroyed) return;
      const now = performance.now();
      const dt = Math.min((now - lastLoopTime) / 1000, 0.1);
      lastLoopTime = now;
      const dtRatio = dt * 60;
      const isMotionReduced = reducedMotionRef.current;
      const verletDamp = Math.pow(isMotionReduced ? 0.82 : 0.95, dtRatio);
      const gravityStep = 0.45 * dtRatio;

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
        const vx = (p.x - p.oldX) * verletDamp;
        const vy = (p.y - p.oldY) * verletDamp;
        p.oldX = p.x;
        p.oldY = p.y;
        p.x += vx;
        p.y += vy + gravityStep;
      });

      const curTier = tierRef.current;
      const maxIter = curTier === "low" ? 4 : curTier === "medium" ? 8 : 12;
      for (let iter = 0; iter < maxIter; iter++) {
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

      if (spark > 0) spark *= Math.pow(0.88, dtRatio);

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

      const isLowTier = curTier === "low";
      // 2. 3D Metallic Beads
      for (let i = 1; i < pts.length - 1; i++) {
        const p = pts[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
        if (isLowTier) {
          ctx.fillStyle = isL ? "#d4d4d8" : "#484852";
        } else {
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
          ctx.fillStyle = bg;
        }
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
      isDestroyed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [variant, canvasRef, containerRef, lampIconStageRef]);
}
