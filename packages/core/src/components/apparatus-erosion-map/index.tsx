import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ApparatusErosionMapProps } from "./types";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// 2D Value Noise generator with octaves and stretching for organic patterns
class ValueNoise2D {
  private grid: number[];

  constructor(seed: number = Math.random()) {
    this.grid = new Array(256 * 256);
    // Simple LCG pseudo-random generator based on seed
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < 256 * 256; i++) {
      this.grid[i] = rand();
    }
  }

  // Base value noise at (x, y)
  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    // Smoothstep interpolation
    const u = xf * xf * (3.0 - 2.0 * xf);
    const v = yf * yf * (3.0 - 2.0 * yf);

    const n00 = this.grid[Y * 256 + X];
    const n10 = this.grid[Y * 256 + ((X + 1) & 255)];
    const n01 = this.grid[((Y + 1) & 255) * 256 + X];
    const n11 = this.grid[((Y + 1) & 255) * 256 + ((X + 1) & 255)];

    const x1 = n00 + u * (n10 - n00);
    const x2 = n01 + u * (n11 - n01);

    return x1 + v * (x2 - x1);
  }

  // Fractal Brownian Motion (FBM) combining multiple octaves
  fbm(x: number, y: number, octaves: number = 3): number {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1.0;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.noise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2.0;
    }

    return value / maxValue;
  }
}

const DEFAULT_IMAGES = [
  "/images/components%20images/scroll/cosmos_1207399578.jpeg",
  "/images/components%20images/scroll/cosmos_1067833670.jpeg",
  "/images/components%20images/scroll/cosmos_1215932660.jpeg",
  "/images/components%20images/scroll/cosmos_1225764898.jpeg",
  "/images/components%20images/scroll/cosmos_1244425812.jpeg",
  "/images/components%20images/scroll/cosmos_1292975902.jpeg",
  "/images/components%20images/scroll/cosmos_1298955025.jpeg",
  "/images/components%20images/scroll/cosmos_1309660817.jpeg",
  "/images/components%20images/scroll/cosmos_1452408749.jpeg",
  "/images/components%20images/scroll/cosmos_1556080729.jpeg",
  "/images/components%20images/scroll/cosmos_1591705408.jpeg",
  "/images/components%20images/scroll/cosmos_1633231397.jpeg",
  "/images/components%20images/scroll/cosmos_169178344.jpeg",
  "/images/components%20images/scroll/cosmos_1859262512.jpeg",
  "/images/components%20images/scroll/cosmos_1994819013.jpeg",
  "/images/components%20images/scroll/cosmos_496247602.jpeg"
];

export const ApparatusErosionMap: React.FC<ApparatusErosionMapProps & {
  noiseScale?: number;
  edgeGlow?: number;
  octaves?: number;
  windPattern?: "linear" | "radial" | "vortex" | "wave" | "turbulent" | "implosion";
  windAngle?: number;
  windStretch?: number;
  curvePower?: number;
  erosionDamper?: number;
}> = ({
  images: propImages,
  imageSrc,
  noiseScale,
  edgeGlow,
  octaves: propOctaves = 3,
  windPattern: propWindPattern = "linear",
  windAngle: propWindAngle = 180,
  windStretch: propWindStretch = 2.5,
  curvePower: propCurvePower = 2.0,
  erosionDamper = 3.0,
  className = "",
  style,
  onLifecycleChange,
  scrollProgress: propScrollProgress
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleCanvasRef = useRef<HTMLCanvasElement>(null);

  // Custom sandbox controls state derived from props
  const grainScale = noiseScale !== undefined ? noiseScale : 0.005; 
  const octaves = propOctaves;
  const windPattern = propWindPattern;
  const windAngle = propWindAngle;
  const windStretch = propWindStretch;
  const edgeWidth = edgeGlow !== undefined ? edgeGlow * 0.03 : 0.04;
  const edgeColor = { r: 223, g: 177, b: 91, name: "GOLD" };
  const curvePower = propCurvePower;

  // Dynamic progress value driven by ScrollTrigger or Prop
  const [localScrollProgress, setLocalScrollProgress] = useState(0);
  const scrollProgress = propScrollProgress !== undefined ? propScrollProgress : localScrollProgress;

  // Refs for delta-corrected smooth interpolation (ref-rate independent)
  const lerpedProgressRef = useRef(0);
  const lastTimeRef = useRef(typeof performance !== "undefined" ? performance.now() : 0);
  const animFrameIdRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  const wakeUpRef = useRef<() => void>(() => {});

  // Deduplicated image list
  const displayImages = React.useMemo(() => {
    if (propImages && propImages.length > 1) return propImages;
    const base = imageSrc ? [imageSrc] : [];
    const combined = [...base];
    for (const img of DEFAULT_IMAGES) {
      if (combined.length >= 16) break;
      if (!combined.includes(img)) combined.push(img);
    }
    return combined;
  }, [propImages, imageSrc]);

  // Keep references to preloaded Image elements
  const loadedImagesRef = useRef<HTMLImageElement[]>([]);
  const noiseGeneratorRef = useRef(new ValueNoise2D());

  // Config ref for scroll ticks to access latest parameters without triggering component re-renders
  const configRef = useRef<{
    grainScale: number;
    octaves: number;
    windPattern: "linear" | "radial" | "vortex" | "wave" | "turbulent" | "implosion";
    windAngle: number;
    windStretch: number;
    edgeWidth: number;
    edgeColor: { r: number; g: number; b: number };
    curvePower: number;
    erosionDamper: number;
    scrollProgress: number;
  }>({
    grainScale,
    octaves,
    windPattern,
    windAngle,
    windStretch,
    edgeWidth,
    edgeColor,
    curvePower,
    erosionDamper,
    scrollProgress
  });

  useEffect(() => {
    configRef.current = {
      grainScale,
      octaves,
      windPattern,
      windAngle,
      windStretch,
      edgeWidth,
      edgeColor,
      curvePower,
      erosionDamper,
      scrollProgress
    };
    wakeUpRef.current();
  }, [grainScale, octaves, windPattern, windAngle, windStretch, edgeWidth, edgeColor, curvePower, erosionDamper, scrollProgress]);

  // Lifecycle monitoring
  useEffect(() => {
    onLifecycleChange?.("discovery");
    const timer = setTimeout(() => onLifecycleChange?.("idle"), 1000);
    return () => clearTimeout(timer);
  }, [onLifecycleChange]);

  // Preload images once
  useEffect(() => {
    loadedImagesRef.current = displayImages.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
  }, [displayImages]);

  // Pinned container scrolling runway timeline using useGSAP
  useGSAP(() => {
    if (propScrollProgress !== undefined) return;

    const el = containerRef.current;
    if (!el) return;

    ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "+=1500%",
      pin: true,
      scrub: 1.5,
      onUpdate: (self) => {
        setLocalScrollProgress(self.progress);
        onLifecycleChange?.(self.progress > 0 && self.progress < 1 ? "buildUp" : "idle");
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === el) trigger.kill();
      });
    };
  }, [propScrollProgress, onLifecycleChange]);

  // Fallback wheel scroll listener if scroll height is limited
  useEffect(() => {
    if (propScrollProgress !== undefined) return;
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 10) {
        e.preventDefault();
        setLocalScrollProgress((prev) => {
          const step = 0.0008;
          const next = Math.max(0, Math.min(1, prev + (e.deltaY > 0 ? step : -step)));
          onLifecycleChange?.(next > 0 && next < 1 ? "buildUp" : "idle");
          return next;
        });
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [propScrollProgress, onLifecycleChange]);

  // Core canvas drawing loop
  useEffect(() => {
    const visibleCanvas = visibleCanvasRef.current;
    if (!visibleCanvas) return;

    const ctx = visibleCanvas.getContext("2d");
    if (!ctx) return;

    // Offscreen 256x256 canvases for threshold masking
    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = 256;
    noiseCanvas.height = 256;
    const noiseCtx = noiseCanvas.getContext("2d");

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = 256;
    maskCanvas.height = 256;
    const maskCtx = maskCanvas.getContext("2d");

    // Full-size double-buffer canvas for text-erosion overlay compositing
    const bufferCanvas = document.createElement("canvas");
    const bufferCtx = bufferCanvas.getContext("2d");

    if (!noiseCtx || !maskCtx || !bufferCtx) return;

    // Generate Perlin noise layout once on parameter changes
    const noiseData = new Float32Array(256 * 256);
    const generator = noiseGeneratorRef.current;

    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        let nx = x;
        let ny = y;

        if (windPattern === "radial") {
          const dx = x - 128;
          const dy = y - 128;
          const r = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          nx = r * 1.5;
          ny = Math.sin(angle * 2) * 35.0 + r * 0.8;
        } else if (windPattern === "vortex") {
          const dx = x - 128;
          const dy = y - 128;
          const r = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) + r * 0.05;
          nx = Math.cos(angle) * r * (1.0 / (1.0 + windStretch * 0.5)) + 128;
          ny = Math.sin(angle) * r + 128;
        } else if (windPattern === "wave") {
          const rx = x - 128;
          const ry = y - 128;
          const rad = (windAngle * Math.PI) / 180;
          const rotX = rx * Math.cos(rad) - ry * Math.sin(rad);
          const rotY = rx * Math.sin(rad) + ry * Math.cos(rad);
          nx = (rotX + Math.sin(rotY * 0.08) * 40.0) * (1.0 / (1.0 + windStretch)) + 128;
          ny = rotY + 128;
        } else if (windPattern === "turbulent") {
          const rx = x - 128;
          const ry = y - 128;
          const shearX = Math.sin(ry * 0.05) * 30.0 + Math.cos(rx * 0.03) * 20.0;
          const shearY = Math.cos(rx * 0.05) * 30.0 + Math.sin(ry * 0.03) * 20.0;
          nx = (rx + shearX) * (1.0 / (1.0 + windStretch)) + 128;
          ny = (ry + shearY) + 128;
        } else if (windPattern === "implosion") {
          const dx = x - 128;
          const dy = y - 128;
          const r = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          const funnelR = 256.0 - r;
          nx = Math.cos(angle) * funnelR * 0.8 + 128;
          ny = Math.sin(angle) * funnelR * 0.8 + 128;
        } else {
          // General linear wind pattern
          const rad = (windAngle * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          
          const rx = x - 128;
          const ry = y - 128;
          
          let rotX = rx * cos - ry * sin;
          let rotY = rx * sin + ry * cos;
          
          // Stretch scaling along wind vector
          rotX *= (1.0 / (1.0 + windStretch));
          
          nx = rotX + 128;
          ny = rotY + 128;
        }

        // Multi-octave Fractal noise sum
        noiseData[y * 256 + x] = generator.fbm(nx * grainScale, ny * grainScale, octaves);
      }
    }

    // Re-normalize noiseData to full 0.0..1.0 range so erosion progresses linearly with scroll
    let minN = 1.0;
    let maxN = 0.0;
    for (let i = 0; i < 256 * 256; i++) {
      const v = noiseData[i];
      if (v < minN) minN = v;
      if (v > maxN) maxN = v;
    }
    const rangeN = maxN - minN || 1;
    for (let i = 0; i < 256 * 256; i++) {
      noiseData[i] = (noiseData[i] - minN) / rangeN;
    }

    // Mask image data template
    const maskImgData = maskCtx.createImageData(256, 256);
    const maskData32 = new Uint32Array(maskImgData.data.buffer);

    const drawFrame = (timestamp?: number) => {
      const now = timestamp || performance.now();
      const delta = Math.min(0.1, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const { curvePower, edgeWidth, edgeColor, erosionDamper, scrollProgress: targetProgress } = configRef.current;
      const totalImages = displayImages.length;
      if (totalImages < 2) return;

      // Heavy fluid lerp damping to slow down erosion progression
      const diff = targetProgress - lerpedProgressRef.current;
      if (Math.abs(diff) < 0.0001) {
        lerpedProgressRef.current = targetProgress;
        isAnimatingRef.current = false;
      } else {
        const dampFactor = Math.max(0.2, erosionDamper); 
        lerpedProgressRef.current += diff * (1.0 - Math.exp(-dampFactor * delta));
      }
      const progress = lerpedProgressRef.current;

      // Scale screen sizes
      const dpr = window.devicePixelRatio || 1;
      const rect = visibleCanvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width <= 0 || height <= 0) return;

      if (visibleCanvas.width !== width * dpr || visibleCanvas.height !== height * dpr) {
        visibleCanvas.width = width * dpr;
        visibleCanvas.height = height * dpr;
        bufferCanvas.width = width * dpr;
        bufferCanvas.height = height * dpr;
      }
      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      // Clear main canvas with solid dark background color to prevent leftover frames
      ctx.fillStyle = "#070708";
      ctx.fillRect(0, 0, width, height);

      // Enforce a perfect square aspect ratio (1:1) to lock the layout size across all images
      const side = Math.min(width * 0.72, height * 0.72);
      const drawW = side;
      const drawH = side;

      const dx = (width - drawW) / 2;
      const dy = (height - drawH) / 2;

      // DrawImageCover helper to crop and center image inside the square bounds without stretching
      const drawImageCover = (img: HTMLImageElement, targetCtx: CanvasRenderingContext2D) => {
        const imgW = img.naturalWidth || img.width || 800;
        const imgH = img.naturalHeight || img.height || 600;
        
        const imgRatio = imgW / imgH;
        const targetRatio = drawW / drawH;
        
        let sx = 0;
        let sy = 0;
        let sw = imgW;
        let sh = imgH;
        
        if (imgRatio > targetRatio) {
          sw = imgH * targetRatio;
          sx = (imgW - sw) / 2;
        } else {
          sh = imgW / targetRatio;
          sy = (imgH - sh) / 2;
        }
        
        targetCtx.drawImage(img, sx, sy, sw, sh, dx, dy, drawW, drawH);
      };

      if (progress < 0.15) {
        // Phase 0: Text "SCROLL" on black background erodes to reveal Image 0
        const localProg = progress / 0.15;

        // Base layer: centered card with Image 0 (drawn directly onto the main canvas)
        // Card scales up from 0.94 -> 1.0 and fades in from 0 -> 1 alpha
        ctx.save();
        ctx.translate(width / 2, height / 2);
        const cardScale = 0.94 + 0.06 * localProg;
        ctx.scale(cardScale, cardScale);
        ctx.translate(-width / 2, -height / 2);
        
        ctx.globalAlpha = localProg;

        ctx.fillStyle = "#0c0c0d";
        ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
        ctx.shadowBlur = 56;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 24;
        ctx.fillRect(dx, dy, drawW, drawH);
        ctx.shadowColor = "transparent"; // Reset shadow

        const imgNext = loadedImagesRef.current[0];
        if (imgNext && imgNext.complete) {
          drawImageCover(imgNext, ctx);
        }
        ctx.restore();

        // Generate threshold dither mask for this localProg
        const edgeColorVal = (edgeColor.b << 16) | (edgeColor.g << 8) | edgeColor.r;
        for (let i = 0; i < 256 * 256; i++) {
          const noiseVal = noiseData[i];

          if (noiseVal < localProg) {
            maskData32[i] = 0;
          } else if (edgeWidth > 0 && noiseVal < localProg + edgeWidth) {
            const edgeAlpha = Math.floor(
              255 * (1.0 - (noiseVal - localProg) / edgeWidth)
            );
            maskData32[i] = (edgeAlpha << 24) | edgeColorVal;
          } else {
            maskData32[i] = 0xFF000000;
          }
        }

        maskCtx.putImageData(maskImgData, 0, 0);

        // Ensure bufferCanvas dimensions match visible canvas
        if (bufferCanvas.width !== visibleCanvas.width || bufferCanvas.height !== visibleCanvas.height) {
          bufferCanvas.width = visibleCanvas.width;
          bufferCanvas.height = visibleCanvas.height;
        }

        // Draw top layer (full-screen black with big text) ON the buffer canvas
        bufferCtx.save();
        bufferCtx.resetTransform();
        bufferCtx.scale(dpr, dpr);
        bufferCtx.clearRect(0, 0, width, height);

        bufferCtx.fillStyle = "#070708";
        bufferCtx.fillRect(0, 0, width, height);

        // Large clean sans-serif text in the center - significantly larger
        // Resolved with standard browser fallback fonts instead of CSS variable names
        const textScale = 1.0 + 0.04 * localProg;
        bufferCtx.save();
        bufferCtx.translate(width / 2, height / 2);
        bufferCtx.scale(textScale, textScale);
        bufferCtx.translate(-width / 2, -height / 2);

        bufferCtx.fillStyle = `rgba(255, 255, 255, ${0.95 * (1.0 - localProg)})`;
        bufferCtx.font = "900 135px 'Geist', 'Inter', system-ui, -apple-system, sans-serif";
        bufferCtx.textAlign = "center";
        bufferCtx.textBaseline = "middle";
        bufferCtx.fillText("EROSION", width / 2, height / 2);

        // Subtext labeling device
        bufferCtx.fillStyle = `rgba(255, 255, 255, ${0.35 * (1.0 - localProg)})`;
        bufferCtx.font = "bold 11px 'Geist Mono', 'Fira Code', monospace";
        bufferCtx.fillText("THRESHOLD WEATHERING SYSTEM", width / 2, height / 2 + 105);
        bufferCtx.restore(); // Restore text scale
        bufferCtx.restore(); // Restore bufferCtx main state

        // Apply dither mask stretched to full screen size ON the buffer canvas
        bufferCtx.save();
        bufferCtx.globalCompositeOperation = "destination-in";
        bufferCtx.imageSmoothingEnabled = true;
        bufferCtx.drawImage(maskCanvas, 0, 0, visibleCanvas.width, visibleCanvas.height);
        bufferCtx.restore();

        // Draw the masked buffer canvas over the main canvas (revealing the base layer)
        ctx.save();
        ctx.drawImage(bufferCanvas, 0, 0, width, height);
        ctx.restore();

      } else {
        // Phase 1 to N: Image-to-Image transitions
        const pRemaining = (progress - 0.15) / 0.85;
        const floatIdx = pRemaining * (totalImages - 1);
        const activeIdx = Math.min(totalImages - 2, Math.floor(floatIdx));
        const nextIdx = activeIdx + 1;

        // Apply ease-in curve power transition profile
        let localProg = floatIdx - activeIdx;
        localProg = Math.pow(localProg, curvePower);

        const imgNext = loadedImagesRef.current[nextIdx];
        const imgCurrent = loadedImagesRef.current[activeIdx];

        // Draw backing card shadow behind the frame
        ctx.fillStyle = "#0c0c0d";
        ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
        ctx.shadowBlur = 56;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 24;
        ctx.fillRect(dx, dy, drawW, drawH);
        ctx.shadowColor = "transparent"; // Reset shadow

        if (imgNext && imgNext.complete) {
          drawImageCover(imgNext, ctx);
        }

        const edgeColorVal = (edgeColor.b << 16) | (edgeColor.g << 8) | edgeColor.r;
        for (let i = 0; i < 256 * 256; i++) {
          const noiseVal = noiseData[i];

          if (noiseVal < localProg) {
            maskData32[i] = 0;
          } else if (edgeWidth > 0 && noiseVal < localProg + edgeWidth) {
            const edgeAlpha = Math.floor(
              255 * (1.0 - (noiseVal - localProg) / edgeWidth)
            );
            maskData32[i] = (edgeAlpha << 24) | edgeColorVal;
          } else {
            maskData32[i] = 0xFF000000;
          }
        }

        maskCtx.putImageData(maskImgData, 0, 0);

        // Ensure bufferCanvas dimensions match visible canvas
        if (bufferCanvas.width !== visibleCanvas.width || bufferCanvas.height !== visibleCanvas.height) {
          bufferCanvas.width = visibleCanvas.width;
          bufferCanvas.height = visibleCanvas.height;
        }

        bufferCtx.save();
        bufferCtx.resetTransform();
        bufferCtx.scale(dpr, dpr);
        bufferCtx.clearRect(0, 0, width, height);

        if (imgCurrent && imgCurrent.complete) {
          drawImageCover(imgCurrent, bufferCtx);
        }

        // Apply dither mask stretched to card frame ON the buffer canvas
        bufferCtx.globalCompositeOperation = "destination-in";
        bufferCtx.imageSmoothingEnabled = true;
        bufferCtx.drawImage(maskCanvas, dx, dy, drawW, drawH);
        bufferCtx.restore();

        // Draw the masked buffer canvas over the main canvas (revealing the base layer)
        ctx.save();
        ctx.drawImage(bufferCanvas, 0, 0, width, height);
        ctx.restore();
      }

      if (isAnimatingRef.current) {
        animFrameIdRef.current = requestAnimationFrame(drawFrame);
      }
    };

    const wakeUp = () => {
      if (!isAnimatingRef.current) {
        isAnimatingRef.current = true;
        lastTimeRef.current = performance.now();
        animFrameIdRef.current = requestAnimationFrame(drawFrame);
      }
    };
    wakeUpRef.current = wakeUp;

    // Start initial animation
    wakeUp();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      isAnimatingRef.current = false;
    };
  }, [grainScale, octaves, windPattern, windAngle, windStretch, displayImages]);



  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden bg-[#070708] ${className}`}
      style={style}
    >
      {/* Background fabric dust texture */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay z-10" />

      {/* Main High-Performance Visible Canvas */}
      <canvas
        ref={visibleCanvasRef}
        className="w-full h-full object-cover block"
      />

    </div>
  );
};

export default ApparatusErosionMap;
