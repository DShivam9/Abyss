import React, { useRef, useEffect, useCallback } from "react";
import {
  ApparatusRippleScrambleProps,
  ApparatusRippleVariant,
  WaveInstance,
  CharNode,
} from "./types";
import {
  CONTINUOUS_TEXT_WALL,
  BAKED_RING_WIDTH,
  BAKED_RIPPLE_POWER,
  BAKED_WAKE_RADIUS,
  ALPHA_STR_TABLE,
} from "./constants";
import { getVariantSpecs, getWaveDistance } from "./helpers";

export const ApparatusRippleScramble: React.FC<ApparatusRippleScrambleProps> = ({
  variant = "classic",
  waveSpeed = 950,
  scrambleDuration = 340,
  fontSize = 20,
  lineHeightScale = 1.65,
  staticOpacity = 0.32,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<CharNode[]>([]);
  const wavesRef = useRef<WaveInstance[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Variant cross-fade transition refs
  const prevVariantRef = useRef<ApparatusRippleVariant>(variant);
  const transitionStartRef = useRef<number>(0);

  // Idle state tracking refs
  const lastInteractionRef = useRef<number>(performance.now() - 4000);
  const lastAmbientPulseRef = useRef<number>(0);

  // Full-screen layout engine filling 100% of viewport from top to bottom
  const layoutTextOnCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = rect.width;
    const height = rect.height;

    if (width <= 0 || height <= 0) return;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    const specs = getVariantSpecs(variant, staticOpacity);
    const activeFontSize = Math.max(10, fontSize);
    const lineHeight = activeFontSize * Math.max(1.1, lineHeightScale);
    ctx.font = `300 ${activeFontSize}px ${specs.fontFamily}`;

    const words = CONTINUOUS_TEXT_WALL.split(" ");
    const bleedX = width < 640 ? -8 : -16;
    const bleedY = width < 640 ? -6 : -12;
    const maxX = width - bleedX;
    const maxY = height - bleedY;

    let currentX = bleedX;
    let currentY = bleedY + activeFontSize;
    const nodes: CharNode[] = [];
    const spaceWidth = ctx.measureText(" ").width;
    let wordIndex = 0;
    const totalWords = words.length;

    while (currentY <= maxY + lineHeight && wordIndex < totalWords * 10) {
      const word = words[wordIndex % totalWords];
      const wordWidth = ctx.measureText(word).width;

      if (currentX + wordWidth > maxX && currentX > bleedX) {
        currentX = bleedX;
        currentY += lineHeight;
      }

      if (currentY > maxY + lineHeight) break;

      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const charW = ctx.measureText(char).width;
        nodes.push({
          char,
          x: currentX + charW / 2,
          y: currentY,
          scrambleUntil: 0,
        });
        currentX += charW;
      }

      currentX += spaceWidth;
      wordIndex++;
    }

    nodesRef.current = nodes;
  }, [variant, fontSize, lineHeightScale, staticOpacity]);

  // Zero-GC 120FPS GPU Canvas render ticker with Inlined O(1) Spatial Bounds Rejection
  const renderCanvas = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      if (width <= 0 || height <= 0) return;

      const specs = getVariantSpecs(variant, staticOpacity);
      const prevSpecs = getVariantSpecs(prevVariantRef.current, staticOpacity);

      // Compute smooth cross-fade transition factor
      let bgStyle = specs.bg;
      const transitionDuration = 260;
      const elapsedTransition = now - transitionStartRef.current;

      if (elapsedTransition > 0 && elapsedTransition < transitionDuration) {
        const t = elapsedTransition / transitionDuration;
        const easeOutQuint = 1.0 - Math.pow(1.0 - t, 5);

        const r = Math.round(prevSpecs.rgbBg[0] + (specs.rgbBg[0] - prevSpecs.rgbBg[0]) * easeOutQuint);
        const g = Math.round(prevSpecs.rgbBg[1] + (specs.rgbBg[1] - prevSpecs.rgbBg[1]) * easeOutQuint);
        const b = Math.round(prevSpecs.rgbBg[2] + (specs.rgbBg[2] - prevSpecs.rgbBg[2]) * easeOutQuint);
        bgStyle = `rgb(${r}, ${g}, ${b})`;
      }

      // Smooth backdrop clear
      ctx.fillStyle = bgStyle;
      ctx.fillRect(0, 0, width, height);

      const activeFontSize = Math.max(10, fontSize);
      ctx.font = `300 ${activeFontSize}px ${specs.fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const maxRadius = Math.hypot(width, height) + 160;
      const halfRing = BAKED_RING_WIDTH / 2;
      const variantChars = specs.chars;
      const alphaLen = variantChars.length;

      // Advance active waves
      if (now > 0) {
        wavesRef.current.forEach((w) => {
          w.radius = ((now - w.startTime) / 1000) * waveSpeed;
        });
        wavesRef.current = wavesRef.current.filter((w) => w.radius < maxRadius);
        if (wavesRef.current.length > 8) {
          wavesRef.current = wavesRef.current.slice(-8);
        }
      }

      const activeWaves = wavesRef.current;
      const nodes = nodesRef.current;

      const staticColor = specs.staticColor;
      let currentStyle = "";

      ctx.fillStyle = staticColor;
      currentStyle = staticColor;

      const safeRipplePower = Math.min(BAKED_RIPPLE_POWER, 20);
      const nowInt = Math.floor(now);

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        let maxRippleIntensity = 0;

        for (let j = 0; j < activeWaves.length; j++) {
          const w = activeWaves[j];
          const outerBound = w.radius + halfRing;

          // Inlined O(1) Spatial Bounding Box Early Rejection (Zero Allocation per frame)
          if (
            node.x < w.cx - outerBound ||
            node.x > w.cx + outerBound ||
            node.y < w.cy - outerBound ||
            node.y > w.cy + outerBound
          ) {
            continue;
          }

          const dx = node.x - w.cx;
          const dy = node.y - w.cy;

          const dist = getWaveDistance(dx, dy, variant);
          const diff = Math.abs(dist - w.radius);

          if (diff < halfRing) {
            const rippleIntensity = Math.sin((1.0 - diff / halfRing) * Math.PI);
            if (rippleIntensity > maxRippleIntensity) {
              maxRippleIntensity = rippleIntensity;
            }
          }
        }

        // Active Wave Front
        if (maxRippleIntensity > 0.02) {
          node.scrambleUntil = now + scrambleDuration;
          const glyphIndex = Math.floor((nowInt * 0.006 + i) % alphaLen);
          const randomChar = variantChars[glyphIndex];
          const drawY = node.y - maxRippleIntensity * safeRipplePower;

          const activeStyle = specs.flareColor(maxRippleIntensity);
          if (currentStyle !== activeStyle) {
            ctx.fillStyle = activeStyle;
            currentStyle = activeStyle;
          }
          ctx.fillText(randomChar, node.x, drawY);
        }
        // Smooth Slow Mechanical Decode & Hover Settlement
        else if (now < node.scrambleUntil) {
          const remaining = node.scrambleUntil - now;
          const rawProgress = 1.0 - Math.max(0, remaining / scrambleDuration);
          const easeOutCubic = 1.0 - Math.pow(1.0 - rawProgress, 3);

          const glyphIndex = Math.floor((nowInt * 0.005 + i) % alphaLen);
          const randomChar = rawProgress > 0.65 ? node.char : variantChars[glyphIndex];

          const alphaVal = staticOpacity + (1.0 - easeOutCubic) * 0.45;
          const aIdx = Math.min(100, Math.max(0, Math.floor(alphaVal * 100)));
          const scrambleStyle = specs.decayColor(ALPHA_STR_TABLE[aIdx]);

          if (currentStyle !== scrambleStyle) {
            ctx.fillStyle = scrambleStyle;
            currentStyle = scrambleStyle;
          }
          ctx.fillText(randomChar, node.x, node.y);
        }
        // Resting Crisp Text
        else {
          if (currentStyle !== staticColor) {
            ctx.fillStyle = staticColor;
            currentStyle = staticColor;
          }
          ctx.fillText(node.char, node.x, node.y);
        }
      }
    },
    [variant, scrambleDuration, waveSpeed, fontSize, staticOpacity]
  );

  // Continuous rAF animation ticker with Automatic 5.5s - 7.5s Idle Pulse Engine
  const tick = useCallback(
    (now: number) => {
      // Trigger variant-specific ambient idle animation when user is idle > 3.5s
      const isIdle = now - lastInteractionRef.current > 3500;
      const activeWaveCount = wavesRef.current.length;

      if (isIdle && activeWaveCount < 2) {
        const interval =
          variant === "matrix" ? 5500 :
          variant === "editorial" ? 7200 : 6500;

        if (now - lastAmbientPulseRef.current > interval) {
          lastAmbientPulseRef.current = now;
          const canvas = canvasRef.current;
          if (canvas) {
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);

            let idleCx = width / 2;
            let idleCy = height / 2;

            if (variant === "matrix") {
              const col1 = Math.random() * (width * 0.45);
              const col2 = width * 0.55 + Math.random() * (width * 0.4);

              wavesRef.current.push({
                cx: col1,
                cy: Math.random() * (height * 0.25),
                radius: 0,
                startTime: now,
              });

              wavesRef.current.push({
                cx: col2,
                cy: Math.random() * (height * 0.25),
                radius: 0,
                startTime: now + 750,
              });
            } else if (variant === "editorial") {
              idleCx = width / 2;
              idleCy = 0;
              wavesRef.current.push({
                cx: idleCx,
                cy: idleCy,
                radius: 0,
                startTime: now,
              });
            } else {
              // Randomly pick 1 of 4 viewport corners (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
              const cornerIdx = Math.floor(Math.random() * 4);
              const cornerX = cornerIdx % 2 === 0 ? 0 : width;
              const cornerY = cornerIdx < 2 ? 0 : height;

              wavesRef.current.push({
                cx: cornerX,
                cy: cornerY,
                radius: 0,
                startTime: now,
              });
            }
          }
        }
      }

      renderCanvas(now);
      animFrameRef.current = requestAnimationFrame(tick);
    },
    [variant, renderCanvas]
  );

  // Continuous rAF loop mount & variant transition handler
  useEffect(() => {
    if (prevVariantRef.current !== variant) {
      transitionStartRef.current = performance.now();
      const now = performance.now();
      nodesRef.current.forEach((n, idx) => {
        n.scrambleUntil = now + 180 + (idx % 12) * 8;
      });

      layoutTextOnCanvas();
      prevVariantRef.current = variant;
    } else {
      layoutTextOnCanvas();
    }

    if (!animFrameRef.current) {
      animFrameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [variant, layoutTextOnCanvas, tick]);

  // Setup resize listeners
  useEffect(() => {
    const handleResize = () => {
      layoutTextOnCanvas();
      renderCanvas(performance.now());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [layoutTextOnCanvas, renderCanvas]);

  // Click handler to launch fluid wave
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    lastInteractionRef.current = performance.now();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    wavesRef.current.push({
      cx: e.clientX - rect.left,
      cy: e.clientY - rect.top,
      radius: 0,
      startTime: performance.now(),
    });
  };

  // Smooth acoustic cursor scramble wake with dedicated 10/10 Matrix Code Rain Curtain Physics
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    lastInteractionRef.current = performance.now();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const now = performance.now();
    const nodes = nodesRef.current;
    const activeWakeRadius = BAKED_WAKE_RADIUS;

    if (variant === "matrix") {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const dx = node.x - cx;
        const dy = node.y - cy;

        if (dy >= -16 && dy < 220) {
          const taperFactor = 1.0 + (dy / 220) * 0.8;
          const dist = Math.hypot(dx * (1.6 / taperFactor), dy < 0 ? Math.abs(dy) * 2.0 : dy * 0.55);

          if (dist < 64) {
            const intensity = 1.0 - dist / 64;
            node.scrambleUntil = now + scrambleDuration + intensity * 240;
          }
        }
      }
    } else if (variant === "editorial") {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const dx = node.x - cx;
        const dy = node.y - cy;

        if (Math.abs(dy) < 24 && Math.abs(dx) < 220) {
          const intensity = 1.0 - Math.abs(dx) / 220;
          node.scrambleUntil = now + scrambleDuration + intensity * 180;
        }
      }
    } else {
      const minX = cx - activeWakeRadius;
      const maxX = cx + activeWakeRadius;
      const minY = cy - activeWakeRadius;
      const maxY = cy + activeWakeRadius;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (node.x < minX || node.x > maxX || node.y < minY || node.y > maxY) continue;

        const dx = node.x - cx;
        const dy = node.y - cy;

        const dist = getWaveDistance(dx, dy, variant);
        if (dist < activeWakeRadius) {
          node.scrambleUntil = now + scrambleDuration;
        }
      }
    }
  };

  const specs = getVariantSpecs(variant, staticOpacity);

  return (
    <div
      ref={containerRef}
      style={{ backgroundColor: specs.bg }}
      className={`relative w-full h-screen select-none cursor-pointer overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        className="absolute inset-0 block w-full h-full transform-gpu will-change-transform translate-z-0 transition-colors duration-300"
      />
      {/* Soft Radial Vignette Mask for Eye-Comfort & Cinematic Depth */}
      <div
        style={{
          background: `radial-gradient(ellipse at center, transparent 35%, ${specs.bg} 95%)`,
        }}
        className="pointer-events-none absolute inset-0 transition-colors duration-300"
      />
    </div>
  );
};

export default ApparatusRippleScramble;
