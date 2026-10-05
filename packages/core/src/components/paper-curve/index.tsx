"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import Lenis from "lenis";
import { PaperCurveProps } from "./types";
import {
  DEFAULT_SPREADS,
  DEFAULT_CURVATURE,
  DEFAULT_MOMENTUM_FLEX,
  DEFAULT_DEPTH_PARALLAX,
  DEFAULT_EXIT_CURL,
  BAKED_CURVE_DEPTH,
  BAKED_SPAN_CAMBER,
} from "./constants";
import { POST_VERTEX_SHADER, POST_FRAGMENT_SHADER } from "./shaders";
import { useLatestRef } from "../../hooks";
import styles from "./styles.module.css";

interface CardMeshItem {
  element: HTMLElement;
  mediaElement: HTMLElement;
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  texture: THREE.Texture;
  aspectRatio: number;
  top: number;
  left: number;
  width: number;
  height: number;
  parallaxFactor: number;
  videoElement?: HTMLVideoElement;
  videoPlaying: boolean;
  loadOpacity: number;
  loaded: boolean;
}

export function PaperCurve({
  curvature,
  momentumFlex,
  depthParallax,
  exitCurl,
  baseCurve,
  distance,
  velocityBoost,
  spanCamber,
  exitArc,
  blurIntensity = 0.0,
  parallaxScale,
  title = "PAPER CURVE",
  spreads = DEFAULT_SPREADS,
  className = "",
  style,
  onLifecycleChange,
}: PaperCurveProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const introLockupRef = useRef<HTMLDivElement>(null);

  const activeCurvature = curvature ?? baseCurve ?? DEFAULT_CURVATURE;
  const activeDistance = distance ?? BAKED_CURVE_DEPTH;
  const activeMomentumFlex = momentumFlex ?? velocityBoost ?? DEFAULT_MOMENTUM_FLEX;
  const activeSpanCamber = spanCamber ?? BAKED_SPAN_CAMBER;
  const activeExitCurl = exitCurl ?? exitArc ?? DEFAULT_EXIT_CURL;
  const activeDepthParallax = depthParallax ?? parallaxScale ?? DEFAULT_DEPTH_PARALLAX;

  const baseCurveRef = useLatestRef(activeCurvature);
  const distanceRef = useLatestRef(activeDistance);
  const velocityBoostRef = useLatestRef(activeMomentumFlex);
  const spanCamberRef = useLatestRef(activeSpanCamber);
  const exitArcRef = useLatestRef(activeExitCurl);
  const blurIntensityRef = useLatestRef(blurIntensity);
  const parallaxScaleRef = useLatestRef(activeDepthParallax);

  useEffect(() => {
    if (typeof window === "undefined" || !rootRef.current || !contentRef.current) {
      return;
    }

    onLifecycleChange?.("discovery");

    const root = rootRef.current;
    const content = contentRef.current;
    const canvas = document.createElement("canvas");
    canvas.className = styles.canvas;
    root.insertBefore(canvas, content);

    // ─── 1. Lenis Smooth Scroll Inertia ───
    const lenis = new Lenis({
      wrapper: root,
      content,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      autoRaf: false,
    });

    // ─── 2. WebGL Renderer & Scene Setup ───
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0.0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const cameraDistance = 800;
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = cameraDistance;

    const updateCameraFov = () => {
      camera.fov = 2 * Math.atan(window.innerHeight / 2 / cameraDistance) * (180 / Math.PI);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    updateCameraFov();

    // ─── 3. FBO Post-Processing Curvature Pipeline ───
    const renderTarget = new THREE.WebGLRenderTarget(
      Math.floor(window.innerWidth * dpr),
      Math.floor(window.innerHeight * dpr),
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
      }
    );

    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: renderTarget.texture },
        uStrength: { value: baseCurveRef.current },
        uDistance: { value: distanceRef.current },
        uSpanCamber: { value: spanCamberRef.current },
        uExitArc: { value: exitArcRef.current },
        uBlurStrength: { value: 0.0 },
      },
      vertexShader: POST_VERTEX_SHADER,
      fragmentShader: POST_FRAGMENT_SHADER,
      transparent: true,
    });

    const postQuadGeometry = new THREE.PlaneGeometry(2, 2);
    const postQuad = new THREE.Mesh(postQuadGeometry, postMaterial);
    postScene.add(postQuad);

    // ─── 4. Mapped Card Meshes ───
    const cardElements = Array.from(content.querySelectorAll<HTMLElement>(`.${styles.card}`));
    const textureLoader = new THREE.TextureLoader();
    const sharedPlaneGeometry = new THREE.PlaneGeometry(1, 1);
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const createdVideos: HTMLVideoElement[] = [];

    const cardItems: CardMeshItem[] = cardElements.map((el, index) => {
      const src = el.getAttribute("data-src") || "";
      const isVideo = el.getAttribute("data-type") === "video";
      const aspectAttr = parseFloat(el.getAttribute("data-aspect") || "0");
      const mediaElement = el.querySelector<HTMLElement>("img, video") || el;

      let texture: THREE.Texture;
      let activeVideo: HTMLVideoElement | undefined;

      if (isVideo) {
        const domVideo = el.querySelector<HTMLVideoElement>("video");
        if (domVideo) {
          activeVideo = domVideo;
          texture = new THREE.VideoTexture(domVideo);
          domVideo.play().catch(() => {});
        } else {
          const vid = document.createElement("video");
          vid.src = src;
          vid.muted = true;
          vid.loop = true;
          vid.playsInline = true;
          vid.autoplay = true;
          vid.play().catch(() => {});
          activeVideo = vid;
          createdVideos.push(vid);
          texture = new THREE.VideoTexture(vid);
        }
      } else {
        texture = textureLoader.load(src);
      }

      texture.anisotropy = Math.min(maxAnisotropy, 4);
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
      });

      const mesh = new THREE.Mesh(sharedPlaneGeometry, material);
      scene.add(mesh);

      const rawParallax = el.getAttribute("data-parallax");
      let parallaxFactor = 0;
      if (rawParallax !== null && rawParallax !== "") {
        parallaxFactor = parseFloat(rawParallax) || 0;
      } else {
        const alternation = (index % 3 === 0 ? 0.28 : index % 2 === 0 ? -0.28 : 0.15);
        parallaxFactor = alternation;
      }

      return {
        element: el,
        mediaElement,
        mesh,
        material,
        texture,
        aspectRatio: aspectAttr,
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        parallaxFactor,
        videoElement: activeVideo,
        videoPlaying: false,
        loadOpacity: 0,
        loaded: false,
      };
    });

    // ─── 5. Cache Layout Bounds (0 Reflows in rAF) ───
    const updateCardBounds = () => {
      // Dynamic corner-to-corner nexus: align left card top edge to right card bottom edge
      const cornerTouchContainers = content.querySelectorAll<HTMLElement>(`.${styles.cornerTouch}`);
      cornerTouchContainers.forEach((container) => {
        const cards = container.querySelectorAll<HTMLElement>(`.${styles.card}`);
        if (cards.length >= 2) {
          const leftCard = cards[0];
          const rightCard = cards[1];
          const rightMedia = rightCard.querySelector("img, video") || rightCard;
          const rightRect = rightMedia.getBoundingClientRect();
          if (rightRect.height > 0) {
            leftCard.style.marginTop = `${Math.round(rightRect.height)}px`;
          }
        }
      });

      const scrollY = lenis.scroll || 0;
      for (let i = 0; i < cardItems.length; i++) {
        const item = cardItems[i];
        const rect = item.mediaElement.getBoundingClientRect();
        item.top = rect.top + scrollY;
        item.left = rect.left;
        item.width = rect.width;
        item.height = rect.height;
      }
    };

    updateCardBounds();
    window.addEventListener("load", updateCardBounds);

    // Listen for image/video metadata loads to re-sync exact aspect ratios
    content.querySelectorAll("img, video").forEach((media) => {
      media.addEventListener("load", updateCardBounds);
      media.addEventListener("loadedmetadata", updateCardBounds);
    });

    // ─── 6. Fluid Aerodynamic Render Loop ───
    let fluidVelocity = 0;
    let lastTime = 0;
    let animationFrameId = 0;
    let isVisible = true;
    let isDisposed = false;

    const renderLoop = (time: number) => {
      if (isDisposed || !isVisible) return;
      animationFrameId = requestAnimationFrame(renderLoop);

      lenis.raf(time);

      const dt = lastTime === 0 ? 0.016 : Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const rawVelocity = lenis.velocity || 0;
      const scrollY = lenis.scroll || 0;

      // DeltaTime-normalized velocity flex: identical damping across 60Hz/120Hz/144Hz
      const velDiff = rawVelocity - fluidVelocity;
      const dampRate = 1 - Math.pow(1 - 0.085, dt * 60);
      fluidVelocity += velDiff * dampRate;

      const dynamicStrength =
        baseCurveRef.current + Math.abs(fluidVelocity) * velocityBoostRef.current;

      const vh = window.innerHeight;
      const vw = window.innerWidth;

      for (let i = 0; i < cardItems.length; i++) {
        const item = cardItems[i];
        const currentTop = item.top - scrollY;
        const currentBottom = currentTop + item.height;

        // Viewport frustum culling + state-guarded offscreen video pause
        if (currentBottom < -120 || currentTop > vh + 120) {
          item.mesh.visible = false;
          if (item.videoElement && item.videoPlaying) {
            item.videoElement.pause();
            item.videoPlaying = false;
          }
          continue;
        }
        item.mesh.visible = true;
        if (item.videoElement && !item.videoPlaying) {
          item.videoElement.play().catch(() => {});
          item.videoPlaying = true;
        }

        // Texture readiness tracking: 0 until loaded, smoothly ramps up to 1
        if (!item.loaded) {
          const isReady = item.videoElement
            ? item.videoElement.readyState >= 2
            : item.texture.image && (item.texture.image as HTMLImageElement).complete !== false;
          if (isReady) {
            item.loadOpacity = Math.min(item.loadOpacity + dt * 2.8, 1.0);
            if (item.loadOpacity >= 1.0) {
              item.loaded = true;
            }
          }
        }

        // Continuous viewport scroll fade-in (from bottom) & fade-out (at top exit)
        // Hermite smoothstep (3t^2 - 2t^3) for organic feathering without linear seams
        const rawEnter = Math.min(Math.max((vh - currentTop) / (vh * 0.22), 0), 1);
        const enterProgress = rawEnter * rawEnter * (3 - 2 * rawEnter);
        const rawExit = Math.min(Math.max(currentBottom / (vh * 0.22), 0), 1);
        const exitProgress = rawExit * rawExit * (3 - 2 * rawExit);
        const viewportScrollFade = enterProgress * exitProgress;

        item.material.opacity = item.loadOpacity * viewportScrollFade;

        // Aspect-ratio preservation: prevent squishing / stretching
        let renderWidth = item.width;
        let renderHeight = item.height;
        if (item.aspectRatio > 0 && renderHeight > 0) {
          const naturalWidth = renderHeight * item.aspectRatio;
          if (Math.abs(renderWidth - naturalWidth) > 1.5) {
            renderWidth = naturalWidth;
          }
        }

        // Viewport-relative progress (-1 at top, 0 at center, +1 at bottom)
        const viewportCenterProgress = ((currentTop + item.height / 2) - vh / 2) / (vh / 2);
        
        // Dynamic multi-layer parallax offset (harmonized cohesive travel across all assets)
        const BASE_PARALLAX_TRAVEL = 110;
        const parallaxOffsetY = viewportCenterProgress * item.parallaxFactor * BASE_PARALLAX_TRAVEL * parallaxScaleRef.current;

        item.mesh.position.x = item.left + item.width / 2 - vw / 2;
        item.mesh.position.y = -((currentTop + parallaxOffsetY) + item.height / 2 - vh / 2);
        item.mesh.position.z = item.parallaxFactor * 40;
        item.mesh.scale.x = renderWidth;
        item.mesh.scale.y = renderHeight;
      }

      // Pass 1: Render plane meshes into FBO
      renderer.setRenderTarget(renderTarget);
      renderer.clear();
      renderer.render(scene, camera);

      // Pass 2: Render cylindrical post-processing curvature to screen
      renderer.setRenderTarget(null);
      postMaterial.uniforms.uStrength.value = dynamicStrength;
      postMaterial.uniforms.uDistance.value = distanceRef.current;
      postMaterial.uniforms.uSpanCamber.value = spanCamberRef.current;
      postMaterial.uniforms.uExitArc.value = exitArcRef.current;
      const rawBlur = fluidVelocity * blurIntensityRef.current;
      const clampedBlur = Math.sign(rawBlur) * Math.min(Math.abs(rawBlur), 0.025);
      postMaterial.uniforms.uBlurStrength.value = clampedBlur;
      renderer.render(postScene, postCamera);
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const visible = entry ? entry.isIntersecting : true;
          if (visible !== isVisible) {
            isVisible = visible;
            if (isVisible && !isDisposed) {
              lastTime = performance.now();
              if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(renderLoop);
              }
            } else if (!isVisible && animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = 0;
            }
          }
        },
        { threshold: 0 }
      );
      observer.observe(root);
    }

    animationFrameId = requestAnimationFrame(renderLoop);

    // ─── 7. Resize Handling ───
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const currentDpr = Math.min(window.devicePixelRatio || 1, 1.5);

      renderer.setSize(w, h);
      renderer.setPixelRatio(currentDpr);
      renderTarget.setSize(Math.floor(w * currentDpr), Math.floor(h * currentDpr));

      updateCameraFov();
      updateCardBounds();
    };

    window.addEventListener("resize", handleResize);

    // ─── 8. Lifecycle & Memory Cleanup ───
    return () => {
      isDisposed = true;
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("load", updateCardBounds);

      content.querySelectorAll("img, video").forEach((media) => {
        media.removeEventListener("load", updateCardBounds);
        media.removeEventListener("loadedmetadata", updateCardBounds);
      });

      // Pause and release detached video elements
      createdVideos.forEach((vid) => {
        vid.pause();
        vid.removeAttribute("src");
        vid.load();
      });

      lenis.destroy();

      cardItems.forEach((item) => {
        scene.remove(item.mesh);
        item.material.dispose();
        item.texture.dispose();
      });

      sharedPlaneGeometry.dispose();
      postQuadGeometry.dispose();
      postMaterial.dispose();
      renderTarget.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (root.contains(canvas)) {
        root.removeChild(canvas);
      }
    };
  }, []);

  const getSpreadClass = (variant?: string) => {
    switch (variant) {
      case "hero":
        return styles.hero;
      case "wide":
        return styles.wide;
      case "intimate":
        return styles.intimate;
      case "align-right":
        return styles.alignRight;
      case "align-left":
        return styles.alignLeft;
      case "asymmetric-left":
        return styles.asymmetricLeft;
      case "asymmetric-right":
        return styles.asymmetricRight;
      case "chasm-dialogue":
        return styles.chasmDialogue;
      case "corner-touch":
        return styles.cornerTouch;
      case "tight-diptych":
        return styles.tightDiptych;
      case "triptych-stagger":
        return styles.triptychStagger;
      default:
        return "";
    }
  };

  const getOffsetClass = (offset?: string) => {
    switch (offset) {
      case "offset-down-sm":
        return styles.offsetDownSm;
      case "offset-down-md":
        return styles.offsetDownMd;
      case "offset-down-lg":
        return styles.offsetDownLg;
      case "offset-up-sm":
        return styles.offsetUpSm;
      case "offset-up-md":
        return styles.offsetUpMd;
      default:
        return "";
    }
  };

  return (
    <div
      ref={rootRef}
      data-lenis-prevent
      className={`${styles.root} ${className}`}
      style={style}
    >
      {/* Editorial Content Runway */}
      <main ref={contentRef} className={styles.streamContainer}>
        {/* Entrance Stage (Editorial Landing Section) */}
        {title && (
          <section className={styles.introStage}>
            <div ref={introLockupRef} className={styles.introLockup}>
              <h1 className={styles.introHeading}>{title}</h1>
            </div>
          </section>
        )}

        {/* Media Runway */}
        <div className={styles.cardsRunway}>
          {spreads.map((spread) => (
            <div
              key={spread.id}
              className={`${
                spread.type === "single"
                  ? styles.spreadSingle
                  : spread.type === "triptych"
                  ? styles.spreadTriptych
                  : styles.spreadDuo
              } ${getSpreadClass(spread.variant)}`}
            >
              {spread.items.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.card} ${getOffsetClass(item.offsetClass)}`}
                  data-src={item.src || ""}
                  data-type={item.type}
                  data-aspect={item.aspectRatio}
                  data-parallax={item.parallax ?? ""}
                  style={item.maxWidth ? { maxWidth: `${item.maxWidth}px` } : undefined}
                >
                  {item.type === "video" ? (
                    <video
                      src={item.src}
                      muted
                      loop
                      playsInline
                      autoPlay
                      className={styles.media}
                      style={{ aspectRatio: item.aspectRatio }}
                    />
                  ) : (
                    <img
                      src={item.src}
                      alt={item.alt}
                      className={styles.media}
                      style={{ aspectRatio: item.aspectRatio }}
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default PaperCurve;
