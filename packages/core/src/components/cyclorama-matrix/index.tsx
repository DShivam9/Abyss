"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { CycloramaMatrixProps, CardObject, MediaPoolItem } from "./types";
import { usePerformance } from "../../engine/PerformanceProvider";
import {
  CELL_SIZE,
  CARD_SIZE,
  FRAME_SIZE,
  COLS,
  ROWS,
  TOTAL_W,
  TOTAL_H,
  DEFAULT_RADIUS_X,
  DEFAULT_RADIUS_Y,
  DEFAULT_BASE_CAM_Z,
  DEFAULT_ZOOM_OUT_CAM_Z,
  SPRING_K,
  SPRING_D,
  DEFAULT_FRICTION_PER_SEC,
  DEFAULT_MEDIA_DEF,
  DEFAULT_ASSET_META,
  SEED_ORDER
} from "./constants";
import { cardVert, bgVert, labelVert, cardFrag, bgFrag, labelFrag } from "./shaders";

export type { CycloramaMatrixProps };

export default function CycloramaMatrix({
  media: mediaProp = DEFAULT_MEDIA_DEF,
  metadata: metadataProp = DEFAULT_ASSET_META,
  radiusX = DEFAULT_RADIUS_X,
  radiusY = DEFAULT_RADIUS_Y,
  baseCamZ = DEFAULT_BASE_CAM_Z,
  zoomCamZ = DEFAULT_ZOOM_OUT_CAM_Z,
  friction = DEFAULT_FRICTION_PER_SEC,
  className = "",
  style,
  onCardClick
}: CycloramaMatrixProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fogVeilRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const perf = usePerformance();
  const perfRef = useRef(perf);
  perfRef.current = perf;

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setPixelRatio(perf.dpr);
    }
  }, [perf.dpr]);

  const radiusXRef = useRef(radiusX);
  const radiusYRef = useRef(radiusY);
  const baseCamZRef = useRef(baseCamZ);
  const zoomCamZRef = useRef(zoomCamZ);
  const frictionRef = useRef(friction);
  const onCardClickRef = useRef(onCardClick);
  const cardsRef = useRef<CardObject[]>([]);

  useEffect(() => {
    radiusXRef.current = radiusX;
    radiusYRef.current = radiusY;
    baseCamZRef.current = baseCamZ;
    zoomCamZRef.current = zoomCamZ;
    frictionRef.current = friction;
    onCardClickRef.current = onCardClick;

    // Hot-update uniforms when sliders move without re-mounting Three.js
    cardsRef.current.forEach((card) => {
      card.mat.uniforms.uRadiusX.value = radiusX;
      card.mat.uniforms.uRadiusY.value = radiusY;
      card.bgMat.uniforms.uRadiusX.value = radiusX;
      card.bgMat.uniforms.uRadiusY.value = radiusY;
      card.labelMat.uniforms.uRadiusX.value = radiusX;
      card.labelMat.uniforms.uRadiusY.value = radiusY;
    });
  }, [radiusX, radiusY, baseCamZ, zoomCamZ, friction, onCardClick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animId: number;
    let isDestroyed = false;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const isLow = perfRef.current.tier === "low";
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isLow,
      powerPreference: "high-performance",
      precision: isLow ? "mediump" : "highp"
    });
    renderer.setPixelRatio(perfRef.current.dpr);
    renderer.setSize(width, height);
    renderer.setClearColor(0x030305, 1);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 100);
    camera.position.set(0, 0, baseCamZRef.current);
    camera.lookAt(0, 0, 0);

    const textureLoader = new THREE.TextureLoader();

    const mediaPool: MediaPoolItem[] = mediaProp.map((item) => {
      const cardW = item.aspect >= 1.0 ? CARD_SIZE : CARD_SIZE * item.aspect;
      const cardH = item.aspect >= 1.0 ? CARD_SIZE / item.aspect : CARD_SIZE;
      // ponytail: 32x32 subdivisions ensure smooth vertex curvature without cardboard creasing
      const geom = new THREE.PlaneGeometry(cardW, cardH, isLow ? 16 : 32, isLow ? 16 : 32);
      const path = `/images/components/cyclorama-matrix/${item.file}`;

      let texture: THREE.Texture;
      let vid: HTMLVideoElement | null = null;

      if (item.type === "video") {
        vid = document.createElement("video");
        vid.src = path;
        vid.crossOrigin = "anonymous";
        vid.loop = true;
        vid.muted = true;
        vid.playsInline = true;
        vid.autoplay = true;
        vid.preload = "auto";
        vid.setAttribute("playsinline", "");
        vid.setAttribute("webkit-playsinline", "");
        vid.setAttribute("muted", "");
        vid.play().catch(() => {});

        const videoTex = new THREE.VideoTexture(vid);
        videoTex.minFilter = THREE.LinearFilter;
        videoTex.magFilter = THREE.LinearFilter;
        videoTex.generateMipmaps = false;

        texture = videoTex;
      } else {
        texture = textureLoader.load(path);
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
      }
      return { geom, texture, vid, aspect: item.aspect, path, type: item.type };
    });

    // Resume videos on first user interaction (Chrome autoplay policy fallback)
    const resumeVideos = () => mediaPool.forEach((m) => m.vid && m.vid.paused && m.vid.play().catch(() => {}));
    container.addEventListener("pointerdown", resumeVideos, { once: true });
    container.addEventListener("touchstart", resumeVideos, { once: true });

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const labelTextures = metadataProp.map((meta) => {
      // ponytail: 1024x1024 canvas texture with 2x metrics eliminates pixelated blur
      const c = document.createElement("canvas");
      c.width = c.height = 1024;
      const ctx = c.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(c);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, 1024, 1024);
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      const titleY = 76;
      ctx.font = '600 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.fillText(meta.title, 68, titleY);

      const pillText = meta.pill;
      ctx.font = '700 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const pW = ctx.measureText(pillText).width + 32;
      const pH = 44;
      const pX = 1024 - 68 - pW;
      const pY = 948 - pH / 2;

      ctx.beginPath();
      ctx.roundRect(pX, pY, pW, pH, 22);
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.fill();
      ctx.lineWidth = 2.0;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.textAlign = "center";
      ctx.fillText(pillText, pX + pW / 2, 948);

      const tex = new THREE.CanvasTexture(c);
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = maxAniso;
      tex.needsUpdate = true;
      return tex;
    });

    const bgGeom = new THREE.PlaneGeometry(FRAME_SIZE, FRAME_SIZE, isLow ? 16 : 32, isLow ? 16 : 32);
    const bgGroup = new THREE.Group(),
      cardGroup = new THREE.Group(),
      labelGroup = new THREE.Group();
    scene.add(bgGroup, cardGroup, labelGroup);

    const cards: CardObject[] = [];
    cardsRef.current = cards;
    let cardLagX = 0,
      cardLagY = 0;

    const camZUniform = { value: baseCamZRef.current };
    const introUniform = { value: 0.0 };

    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const rowTier = ((r % 3) + 3) % 3;
        const colShift = (c + Math.floor(r / 3) * 3) % 8;
        const mediaIndex = SEED_ORDER[rowTier * 8 + colShift];
        const media = mediaPool[mediaIndex];

        const bgMat = new THREE.ShaderMaterial({
          vertexShader: bgVert,
          fragmentShader: bgFrag,
          uniforms: {
            uTexture: { value: media.texture },
            uCellCenter: { value: new THREE.Vector2() },
            uRadiusX: { value: radiusXRef.current },
            uRadiusY: { value: radiusYRef.current },
            uHover: { value: 0.0 },
            uAspect: { value: media.aspect },
            uCamZ: camZUniform,
            uIntro: introUniform
          },
          transparent: true,
          depthWrite: false,
          side: THREE.FrontSide
        });
        const bgMesh = new THREE.Mesh(bgGeom, bgMat);
        bgMesh.renderOrder = 1;
        bgGroup.add(bgMesh);

        const mat = new THREE.ShaderMaterial({
          vertexShader: cardVert,
          fragmentShader: cardFrag,
          uniforms: {
            uTexture: { value: media.texture },
            uCellCenter: { value: new THREE.Vector2() },
            uRadiusX: { value: radiusXRef.current },
            uRadiusY: { value: radiusYRef.current },
            uHover: { value: 0.0 },
            uCamZ: camZUniform,
            uIntro: introUniform
          },
          transparent: true,
          depthWrite: false,
          side: THREE.FrontSide
        });
        const mesh = new THREE.Mesh(media.geom, mat);
        mesh.renderOrder = 2;
        cardGroup.add(mesh);

        const labelMat = new THREE.ShaderMaterial({
          vertexShader: labelVert,
          fragmentShader: labelFrag,
          uniforms: {
            uTexture: { value: labelTextures[mediaIndex] },
            uCellCenter: { value: new THREE.Vector2() },
            uRadiusX: { value: radiusXRef.current },
            uRadiusY: { value: radiusYRef.current },
            uHover: { value: 0.0 },
            uCamZ: camZUniform,
            uIntro: introUniform
          },
          transparent: true,
          depthWrite: false,
          side: THREE.FrontSide
        });
        const labelMesh = new THREE.Mesh(bgGeom, labelMat);
        labelMesh.renderOrder = 4;
        labelGroup.add(labelMesh);

        cards.push({
          mat,
          bgMat,
          labelMat,
          mesh,
          bgMesh,
          labelMesh,
          mediaIndex,
          baseX: (c - COLS / 2) * CELL_SIZE,
          baseY: (r - ROWS / 2) * CELL_SIZE,
          currentHover: 0.0
        });
      }
    }

    // Frame-Rate Independent Drag & Wheel Physics
    let targetPanX = 0,
      targetPanY = 0,
      panX = 0,
      panY = 0.9;
    let velX = 0,
      velY = 0;
    let isDragging = false,
      lastClientX = 0,
      lastClientY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (introActive) return;
      isDragging = true;
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      container.style.cursor = "grabbing";
    };

    let mouseX = -9999,
      mouseY = -9999,
      hasMouse = false;

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      hasMouse = true;

      if (introActive) return;

      if (isDragging) {
        const moveX = e.clientX - lastClientX;
        const moveY = e.clientY - lastClientY;
        lastClientX = e.clientX;
        lastClientY = e.clientY;

        targetPanX += moveX * 0.0078;
        targetPanY -= moveY * 0.0078;
      }
    };

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false;
        container.style.cursor = introActive ? "default" : "grab";
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (introActive) return;
      let dx = e.deltaX,
        dy = e.deltaY;
      if (e.deltaMode === 1) {
        dx *= 18;
        dy *= 18;
      } else if (e.deltaMode === 2) {
        dx *= 80;
        dy *= 80;
      }

      const wheelSens = 0.0032;
      targetPanX -= dx * wheelSens;
      targetPanY += dy * wheelSens;

      // Frame-rate neutral velocity impulse
      velX = velX * 0.5 - dx * wheelSens * 33.0;
      velY = velY * 0.5 + dy * wheelSens * 33.0;
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    const handleResize = () => {
      cachedW = container.clientWidth || window.innerWidth;
      cachedH = container.clientHeight || window.innerHeight;
      camera.aspect = cachedW / cachedH;
      camera.updateProjectionMatrix();
      renderer.setSize(cachedW, cachedH);
    };

    let cachedW = container.clientWidth || window.innerWidth;
    let cachedH = container.clientHeight || window.innerHeight;

    window.addEventListener("resize", handleResize);

    let currentCamZ = baseCamZRef.current + 3.8,
      camZVel = 0;
    let hoveredCard: CardObject | null = null;

    function projectPoint(x: number, y: number): [number, number, number] {
      const rx = radiusXRef.current;
      const ry = radiusYRef.current;
      const theta = x / rx,
        phi = y / ry;
      return [
        Math.sin(theta) * rx,
        Math.sin(phi) * ry,
        rx * (1.0 - Math.cos(theta)) + ry * (1.0 - Math.cos(phi)) + (theta * theta + phi * phi) * 1.1
      ];
    }

    const projVec = new THREE.Vector3();
    let lastFrame = performance.now();
    let introElapsed = 0.0;
    const INTRO_DELAY = 0.45;
    const INTRO_DURATION = 2.8;
    let introActive = true;
    if (container) container.style.cursor = "default";

    function animate() {
      if (isDestroyed) return;
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const dtSec = Math.min(0.033, Math.max(0.001, (now - lastFrame) / 1000));
      lastFrame = now;

      // Curated 3D Cinematic Arrival & Ink-Bloom Experience
      if (introActive) {
        introElapsed += dtSec;
        if (introElapsed > INTRO_DELAY) {
          const t = Math.min(1.0, (introElapsed - INTRO_DELAY) / INTRO_DURATION);
          // Silky smooth easeInOutCubic S-curve
          const ease = t < 0.5 ? 4.0 * t * t * t : 1.0 - Math.pow(-2.0 * t + 2.0, 3.0) / 2.0;

          introUniform.value = ease;

          // Camera glide forward in unison with ink bloom
          currentCamZ = THREE.MathUtils.lerp(baseCamZRef.current + 4.2, baseCamZRef.current, ease);
          camera.position.z = currentCamZ;
          camZUniform.value = currentCamZ;

          // Amphitheater vertical settling in unison
          panY = THREE.MathUtils.lerp(0.95, 0.0, ease);

          // Fast fade of solid DOM veil so the organic WebGL ink boundary displays seamlessly
          if (fogVeilRef.current) {
            const veilOpacity = Math.max(0, 1.0 - ease * 2.2);
            fogVeilRef.current.style.opacity = veilOpacity.toString();
          }

          if (t >= 1.0) {
            introActive = false;
            introUniform.value = 1.0;
            currentCamZ = baseCamZRef.current;
            panY = 0.0;
            targetPanY = 0.0;
            if (container) container.style.cursor = "grab";
            if (fogVeilRef.current) {
              fogVeilRef.current.style.display = "none";
            }
          }
        } else {
          // Atmospheric void stillness
          currentCamZ = baseCamZRef.current + 4.2;
          camera.position.z = currentCamZ;
          camZUniform.value = currentCamZ;
          panY = 0.95;
          introUniform.value = 0.0;
          if (fogVeilRef.current) {
            fogVeilRef.current.style.opacity = "1";
          }
        }
      } else {
        // Standard interactive spring zoom on drag
        const targetCamZ = isDragging ? zoomCamZRef.current : baseCamZRef.current;
        const springAcc = (targetCamZ - currentCamZ) * SPRING_K - camZVel * SPRING_D;
        camZVel += springAcc * dtSec;
        currentCamZ += camZVel * dtSec;
        camera.position.z = currentCamZ;
        camZUniform.value = currentCamZ;
      }

      // Frame-Rate Independent Liquid Drag & Momentum
      if (isDragging) {
        const followRate = 1.0 - Math.exp(-22.0 * dtSec);
        const prevPanX = panX,
          prevPanY = panY;
        panX += (targetPanX - panX) * followRate;
        panY += (targetPanY - panY) * followRate;

        const instVelX = (panX - prevPanX) / dtSec;
        const instVelY = (panY - prevPanY) / dtSec;
        const velBlend = 1.0 - Math.exp(-18.0 * dtSec);
        velX += (instVelX - velX) * velBlend;
        velY += (instVelY - velY) * velBlend;
      } else {
        if (!introActive) {
          targetPanX += velX * dtSec;
          targetPanY += velY * dtSec;
          const followRate = 1.0 - Math.exp(-24.0 * dtSec);
          panX += (targetPanX - panX) * followRate;
          panY += (targetPanY - panY) * followRate;

          const decay = Math.exp(-frictionRef.current * dtSec);
          velX *= decay;
          velY *= decay;
          if (Math.abs(velX) < 0.001) velX = 0;
          if (Math.abs(velY) < 0.001) velY = 0;
        }
      }

      // Parallax Lag (Frame-rate corrected)
      let hoverCardX = 0,
        hoverCardY = 0;
      const curW = cachedW;
      const curH = cachedH;

      if (hasMouse && !isDragging && !perfRef.current.reducedMotion) {
        const nx = (mouseX / curW - 0.5) * 2.0;
        const ny = (mouseY / curH - 0.5) * 2.0;
        hoverCardX = -nx * 0.08;
        hoverCardY = ny * 0.08;
      }
      const targetLagX = Math.max(-0.24, Math.min(0.24, -velX * 0.026 + hoverCardX));
      const targetLagY = Math.max(-0.24, Math.min(0.24, -velY * 0.026 + hoverCardY));
      const lagBlend = 1.0 - Math.exp(-9.0 * dtSec);
      cardLagX += (targetLagX - cardLagX) * lagBlend;
      cardLagY += (targetLagY - cardLagY) * lagBlend;

      // Screen-Space Hit Detection
      hoveredCard = null;
      if (!introActive && hasMouse && !isDragging) {
        const tanHalfFov = Math.tan((camera.fov * Math.PI) / 360);
        let closestDist = Infinity;

        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const x = ((card.baseX + panX) % TOTAL_W + TOTAL_W) % TOTAL_W - TOTAL_W / 2;
          const y = ((card.baseY + panY) % TOTAL_H + TOTAL_H) % TOTAL_H - TOTAL_H / 2;

          if (Math.abs(x) > 13.0 || Math.abs(y) > 9.0) continue;

          const p = projectPoint(x + cardLagX, y + cardLagY);
          projVec.set(p[0], p[1], p[2]).project(camera);
          if (projVec.z < -1.0 || projVec.z > 1.0) continue;

          const screenX = (projVec.x * 0.5 + 0.5) * curW;
          const screenY = (-projVec.y * 0.5 + 0.5) * curH;
          const dX = Math.abs(mouseX - screenX),
            dY = Math.abs(mouseY - screenY);

          const depthDist = Math.max(0.1, currentCamZ - p[2]);
          const cellScreen = ((curH * 0.5) / (tanHalfFov * depthDist)) * CELL_SIZE;

          if (dX <= cellScreen * 0.5 && dY <= cellScreen * 0.5) {
            const d = dX * dX + dY * dY;
            if (d < closestDist) {
              closestDist = d;
              hoveredCard = card;
            }
          }
        }
      }

      // Visibility Culling & Active Video Tracking
      const activeVideoSet = new Set<number>();

      const zoomScale = Math.max(1.0, currentCamZ / baseCamZRef.current);
      const limitX = 19.5 * zoomScale;
      const limitY = 12.5 * zoomScale;

      cards.forEach((card) => {
        const x = ((card.baseX + panX) % TOTAL_W + TOTAL_W) % TOTAL_W - TOTAL_W / 2;
        const y = ((card.baseY + panY) % TOTAL_H + TOTAL_H) % TOTAL_H - TOTAL_H / 2;

        const isVisible = Math.abs(x) <= limitX && Math.abs(y) <= limitY;
        card.mesh.visible = isVisible;
        card.bgMesh.visible = isVisible;
        card.labelMesh.visible = isVisible;

        if (isVisible) {
          const targetHover = card === hoveredCard ? 1.0 : 0.0;
          const rate = targetHover > card.currentHover ? 2.4 : 5.0;
          card.currentHover += (targetHover - card.currentHover) * (1.0 - Math.exp(-rate * dtSec));
          if (card.currentHover < 0.0005) card.currentHover = 0.0;

          card.mat.uniforms.uCellCenter.value.set(x + cardLagX, y + cardLagY);
          card.mat.uniforms.uHover.value = card.currentHover;

          card.bgMat.uniforms.uCellCenter.value.set(x + cardLagX * 0.35, y + cardLagY * 0.35);
          card.bgMat.uniforms.uHover.value = card.currentHover;

          card.labelMat.uniforms.uCellCenter.value.set(x, y);
          card.labelMat.uniforms.uHover.value = card.currentHover;
        }

        // Hysteresis buffer zone: wake video BEFORE entering screen
        if (Math.abs(x) < limitX + 4.0 && Math.abs(y) < limitY + 3.0) {
          activeVideoSet.add(card.mediaIndex);
        }
      });

      // Synchronize video playback states:
      // If ANY card using video X is on screen or in buffer zone -> play
      // Only if ZERO cards using video X are anywhere near screen -> pause
      for (let i = 0; i < mediaPool.length; i++) {
        const m = mediaPool[i];
        if (m.vid) {
          const shouldPlay = activeVideoSet.has(i);
          if (shouldPlay && m.vid.paused) {
            m.vid.play().catch(() => {});
          } else if (!shouldPlay && !m.vid.paused) {
            m.vid.pause();
          }
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animId);

      container.removeEventListener("pointerdown", resumeVideos);
      container.removeEventListener("touchstart", resumeVideos);

      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", handleResize);

      mediaPool.forEach((m) => {
        if (m.vid) {
          m.vid.pause();
          m.vid.removeAttribute("src");
          m.vid.load();
        }
        m.geom.dispose();
        m.texture.dispose();
      });

      labelTextures.forEach((t) => t.dispose());
      bgGeom.dispose();

      cards.forEach((c) => {
        c.mat.dispose();
        c.bgMat.dispose();
        c.labelMat.dispose();
      });

      rendererRef.current = null;
      renderer.dispose();
    };
  }, [mediaProp, metadataProp]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-screen overflow-hidden select-none bg-[#030305] ${className}`}
      style={{ cursor: "default", ...style }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      <div
        ref={fogVeilRef}
        className="absolute inset-0 pointer-events-none bg-[#030305] z-20 transition-opacity duration-300 ease-out"
        style={{ opacity: 1 }}
      />
    </div>
  );
}
