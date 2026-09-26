/**
 * 2D Value Noise generator with octaves and stretching for organic patterns.
 */
export class ValueNoise2D {
  private grid: number[];

  constructor(seed: number = Math.random()) {
    this.grid = new Array(256 * 256);
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < 256 * 256; i++) {
      this.grid[i] = rand();
    }
  }

  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

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

export function generateNoiseMap(
  generator: ValueNoise2D,
  windPattern: "linear" | "vortex" | "wave" | "turbulent",
  windAngle: number,
  windStretch: number,
  grainScale: number,
  octaves: number
): Float32Array {
  const noiseData = new Float32Array(256 * 256);

  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      let nx = x;
      let ny = y;

      if (windPattern === "vortex") {
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
      } else {
        const rad = (windAngle * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const rx = x - 128;
        const ry = y - 128;

        let rotX = rx * cos - ry * sin;
        const rotY = rx * sin + ry * cos;

        rotX *= 1.0 / (1.0 + windStretch);

        nx = rotX + 128;
        ny = rotY + 128;
      }

      noiseData[y * 256 + x] = generator.fbm(nx * grainScale, ny * grainScale, octaves);
    }
  }

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

  return noiseData;
}

export function generateDitherMask(
  noiseData: Float32Array,
  localProg: number,
  edgeWidth: number,
  edgeColor: { r: number; g: number; b: number },
  maskData32: Uint32Array
): void {
  if (localProg >= 0.98) {
    maskData32.fill(0);
  } else if (localProg <= 0.01) {
    maskData32.fill(0xff000000);
  } else {
    const edgeColorVal = (edgeColor.b << 16) | (edgeColor.g << 8) | edgeColor.r;
    const dissolveFactor = Math.max(0, 1.0 - Math.pow(localProg, 3));
    for (let i = 0; i < 256 * 256; i++) {
      const noiseVal = noiseData[i];

      if (noiseVal < localProg) {
        maskData32[i] = 0;
      } else if (edgeWidth > 0 && noiseVal < localProg + edgeWidth) {
        const edgeAlpha = Math.floor(255 * (1.0 - (noiseVal - localProg) / edgeWidth) * dissolveFactor);
        maskData32[i] = (edgeAlpha << 24) | edgeColorVal;
      } else {
        maskData32[i] = 0xff000000;
      }
    }
  }
}

export interface ErosionSceneConfig {
  grainScale: number;
  octaves: number;
  windPattern: "linear" | "vortex" | "wave" | "turbulent";
  windAngle: number;
  windStretch: number;
  edgeWidth: number;
  edgeColor: { r: number; g: number; b: number };
  curvePower: number;
  erosionDamper: number;
  scrollProgress: number;
  dpr: number;
  reducedMotion: boolean;
}

export interface ErosionSceneHandle {
  updateConfig: (newConfig: Partial<ErosionSceneConfig>) => void;
  setImages: (images: HTMLImageElement[]) => void;
  wakeUp: () => void;
  dispose: () => void;
}

export function createErosionScene(
  visibleCanvas: HTMLCanvasElement,
  _container: HTMLElement,
  initialConfig: ErosionSceneConfig,
  initialImages: HTMLImageElement[]
): ErosionSceneHandle {
  const ctx = visibleCanvas.getContext("2d");
  if (!ctx) {
    return {
      updateConfig: () => {},
      setImages: () => {},
      wakeUp: () => {},
      dispose: () => {}
    };
  }

  let config = { ...initialConfig };
  let images = [...initialImages];

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = 256;
  maskCanvas.height = 256;
  const maskCtx = maskCanvas.getContext("2d");

  const bufferCanvas = document.createElement("canvas");
  const bufferCtx = bufferCanvas.getContext("2d");

  const generator = new ValueNoise2D();
  let noiseData = generateNoiseMap(
    generator,
    config.windPattern,
    config.windAngle,
    config.windStretch,
    config.grainScale,
    config.octaves
  );

  const maskImgData = maskCtx ? maskCtx.createImageData(256, 256) : null;
  const maskData32 = maskImgData ? new Uint32Array(maskImgData.data.buffer) : null;

  let lerpedProgress = config.scrollProgress;
  let lastTime = performance.now();
  let animFrameId: number | null = null;
  let isAnimating = false;
  let isDestroyed = false;

  const drawImageCover = (
    img: HTMLImageElement,
    targetCtx: CanvasRenderingContext2D,
    dx: number,
    dy: number,
    drawW: number,
    drawH: number
  ) => {
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

  const drawFrame = (timestamp?: number) => {
    if (isDestroyed || !maskCtx || !maskImgData || !maskData32 || !bufferCtx) return;

    const now = timestamp || performance.now();
    const delta = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;

    const totalImages = images.length;
    if (totalImages < 2) return;

    const targetProgress = config.scrollProgress;
    const diff = targetProgress - lerpedProgress;
    if (Math.abs(diff) < 0.00008) {
      lerpedProgress = targetProgress;
      isAnimating = false;
    } else {
      const isMotionReduced = config.reducedMotion;
      const baseFactor = isMotionReduced ? 0.95 : Math.min(0.35, 0.095 * (config.erosionDamper || 1.0));
      const step = diff * (1 - Math.pow(1 - baseFactor, delta * 60));
      lerpedProgress += step;
    }
    const progress = lerpedProgress;

    const dpr = config.dpr;
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

    ctx.fillStyle = "#070708";
    ctx.fillRect(0, 0, width, height);

    const side = Math.min(width * 0.72, height * 0.72);
    const drawW = side;
    const drawH = side;
    const dx = (width - drawW) / 2;
    const dy = (height - drawH) / 2;

    if (progress < 0.15) {
      const localProg = progress / 0.15;

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
      ctx.shadowColor = "transparent";

      const imgNext = images[0];
      if (imgNext && imgNext.complete) {
        drawImageCover(imgNext, ctx, dx, dy, drawW, drawH);
      }
      ctx.restore();

      generateDitherMask(noiseData, localProg, config.edgeWidth, config.edgeColor, maskData32);
      maskCtx.putImageData(maskImgData, 0, 0);

      if (bufferCanvas.width !== visibleCanvas.width || bufferCanvas.height !== visibleCanvas.height) {
        bufferCanvas.width = visibleCanvas.width;
        bufferCanvas.height = visibleCanvas.height;
      }

      bufferCtx.save();
      bufferCtx.resetTransform();
      bufferCtx.scale(dpr, dpr);
      bufferCtx.clearRect(0, 0, width, height);

      bufferCtx.fillStyle = "#070708";
      bufferCtx.fillRect(0, 0, width, height);

      const textScale = 1.0 + 0.05 * localProg;
      bufferCtx.save();
      bufferCtx.translate(width / 2, height / 2);
      bufferCtx.scale(textScale, textScale);
      bufferCtx.translate(-width / 2, -height / 2);

      bufferCtx.fillStyle = `rgba(255, 255, 255, ${0.95 * (1.0 - localProg)})`;
      bufferCtx.font = "900 135px 'Geist', 'Inter', system-ui, -apple-system, sans-serif";
      bufferCtx.textAlign = "center";
      bufferCtx.textBaseline = "middle";
      bufferCtx.fillText("EROSION", width / 2, height / 2);
      bufferCtx.restore();
      bufferCtx.restore();

      bufferCtx.save();
      bufferCtx.globalCompositeOperation = "destination-in";
      bufferCtx.imageSmoothingEnabled = true;
      bufferCtx.drawImage(maskCanvas, 0, 0, visibleCanvas.width, visibleCanvas.height);
      bufferCtx.restore();

      ctx.save();
      ctx.drawImage(bufferCanvas, 0, 0, width, height);
      ctx.restore();
    } else {
      const pRemaining = (progress - 0.15) / 0.85;
      const totalTransitions = totalImages - 1;
      const floatIdx = Math.max(0, Math.min(totalTransitions - 0.0001, pRemaining * totalTransitions));
      const activeIdx = Math.min(totalImages - 2, Math.floor(floatIdx));
      const nextIdx = activeIdx + 1;

      const rawStepProg = floatIdx - activeIdx;
      const holdThreshold = 0.08;
      let localProg = 0;
      if (rawStepProg > holdThreshold) {
        localProg = (rawStepProg - holdThreshold) / (1.0 - holdThreshold);
      }
      localProg = Math.pow(localProg, config.curvePower);

      const imgNext = images[nextIdx];
      const imgCurrent = images[activeIdx];

      ctx.fillStyle = "#0c0c0d";
      ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
      ctx.shadowBlur = 56;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 24;
      ctx.fillRect(dx, dy, drawW, drawH);
      ctx.shadowColor = "transparent";

      if (imgNext && imgNext.complete) {
        drawImageCover(imgNext, ctx, dx, dy, drawW, drawH);
      }

      generateDitherMask(noiseData, localProg, config.edgeWidth, config.edgeColor, maskData32);
      maskCtx.putImageData(maskImgData, 0, 0);

      if (bufferCanvas.width !== visibleCanvas.width || bufferCanvas.height !== visibleCanvas.height) {
        bufferCanvas.width = visibleCanvas.width;
        bufferCanvas.height = visibleCanvas.height;
      }

      bufferCtx.save();
      bufferCtx.resetTransform();
      bufferCtx.scale(dpr, dpr);
      bufferCtx.clearRect(0, 0, width, height);

      if (imgCurrent && imgCurrent.complete) {
        drawImageCover(imgCurrent, bufferCtx, dx, dy, drawW, drawH);
      }

      bufferCtx.globalCompositeOperation = "destination-in";
      bufferCtx.imageSmoothingEnabled = true;
      bufferCtx.drawImage(maskCanvas, dx, dy, drawW, drawH);
      bufferCtx.restore();

      ctx.save();
      ctx.drawImage(bufferCanvas, 0, 0, width, height);
      ctx.restore();
    }

    if (isAnimating) {
      animFrameId = requestAnimationFrame(drawFrame);
    }
  };

  const wakeUp = () => {
    if (!isAnimating && !isDestroyed) {
      isAnimating = true;
      lastTime = performance.now();
      animFrameId = requestAnimationFrame(drawFrame);
    }
  };

  wakeUp();

  return {
    updateConfig: (newConfig: Partial<ErosionSceneConfig>) => {
      const prevNoiseKey = `${config.windPattern}-${config.windAngle}-${config.windStretch}-${config.grainScale}-${config.octaves}`;
      config = { ...config, ...newConfig };
      const nextNoiseKey = `${config.windPattern}-${config.windAngle}-${config.windStretch}-${config.grainScale}-${config.octaves}`;

      if (prevNoiseKey !== nextNoiseKey) {
        noiseData = generateNoiseMap(
          generator,
          config.windPattern,
          config.windAngle,
          config.windStretch,
          config.grainScale,
          config.octaves
        );
      }
      wakeUp();
    },
    setImages: (newImages: HTMLImageElement[]) => {
      images = [...newImages];
      wakeUp();
    },
    wakeUp,
    dispose: () => {
      isDestroyed = true;
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
      isAnimating = false;
    }
  };
}
