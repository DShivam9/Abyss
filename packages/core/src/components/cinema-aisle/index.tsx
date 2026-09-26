import { useRef, useEffect } from "react";
import * as THREE from "three";
import { CinemaAisleProps } from "./types";
import { DEFAULT_VIDEOS, CORRIDOR_CONFIG } from "./constants";
import { usePerformance } from "../../engine/PerformanceProvider";
import { useLatestRef } from "../../hooks";
import {
  setupVideoStreams,
  buildCorridor,
  disposeCorridor,
  wrap,
  easeInOutCubic,
  pickDistinctVideo,
} from "./scene";
import styles from "./styles.module.css";

export function CinemaAisle({
  videos = DEFAULT_VIDEOS,
  curveFlare = 6.2,
  scrollSpeed = 1.0,
  reflectionSheen = 0.88,
  corridorWidth = 3.5,
  driftSpeed = 2.0,
  title = "Cinema Aisle",
  className = "",
  style = {},
}: CinemaAisleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const perf = usePerformance();
  const perfRef = useLatestRef(perf);
  const flareRef = useLatestRef(curveFlare);
  const speedRef = useLatestRef(scrollSpeed);
  const sheenRef = useLatestRef(reflectionSheen);
  const widthRef = useLatestRef(corridorWidth);
  const driftRef = useLatestRef(driftSpeed);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setPixelRatio(perf.dpr);
    }
  }, [perf.dpr]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const FOG_DENSITY = CORRIDOR_CONFIG.FOG_DENSITY;
    scene.fog = new THREE.FogExp2(0x000000, FOG_DENSITY);

    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 4);
    camera.lookAt(0, 0, -12);

    const isLow = perfRef.current.tier === "low";
    const renderer = new THREE.WebGLRenderer({
      antialias: !isLow,
      powerPreference: "high-performance",
      precision: isLow ? "mediump" : "highp",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(perfRef.current.dpr);
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // --- VIDEO ENGINE ---
    const activeVideoSources = videos && videos.length > 0 ? videos : DEFAULT_VIDEOS;
    const { videoElements, videoTextures } = setupVideoStreams(activeVideoSources, renderer);

    // --- CORRIDOR GENERATION ---
    const { items, primaryPickMeshes, floorGlassMaterial } = buildCorridor(
      scene,
      videoTextures,
      flareRef.current,
      sheenRef.current
    );

    const { TOTAL_COLUMNS, Z_STEP, FRONT_WRAP } = CORRIDOR_CONFIG;
    const TOTAL_DEPTH = TOTAL_COLUMNS * Z_STEP;
    const BACK_WRAP = FRONT_WRAP - TOTAL_DEPTH;
    const WRAP_RANGE = FRONT_WRAP - BACK_WRAP;

    // --- TITLE REVEAL ---
    let isMounted = true;
    let titleTimer: ReturnType<typeof setTimeout> | null = null;
    async function initExperience() {
      try {
        await document.fonts.load("120px 'Allura'");
        await document.fonts.ready;
      } catch (_) {}
      titleTimer = setTimeout(() => {
        if (isMounted && headerRef.current) {
          headerRef.current.classList.add(styles.brandHeaderVisible);
        }
      }, 2100);
    }
    initExperience();

    // --- INTERACTION & RAYCASTING ---
    const raycaster = new THREE.Raycaster();
    const mousePointer = new THREE.Vector2(-999, -999);

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let pointerDirty = true;

    let targetScroll = 0;
    let currentScroll = 0;
    let isDown = false;
    let startY = 0;
    let wheelVelocity = 0;

    const onPointerMove = (e: PointerEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePointer.x = targetMouseX;
      mousePointer.y = targetMouseY;
      pointerDirty = true;

      if (isDown && !introActive) {
        const delta = e.clientY - startY;
        targetScroll -= delta * 0.024 * speedRef.current;
        startY = e.clientY;
      }
    };

    const onPointerLeave = () => {
      mousePointer.set(-999, -999);
      pointerDirty = true;
    };

    const onWheel = (e: WheelEvent) => {
      if (introActive) return;
      wheelVelocity += e.deltaY * 0.0025 * speedRef.current;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (introActive) return;
      isDown = true;
      startY = e.clientY;
    };

    const onPointerUp = () => {
      isDown = false;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("resize", onResize);

    // --- ANIMATION LOOP ---
    let introActive = true;
    const INTRO_DURATION = CORRIDOR_CONFIG.INTRO_DURATION;
    let appStartTime: number | null = null;
    let hoveredIndex = -1;
    let hoveredIsLeft = false;

    const MAX_FPS = 120;
    const MIN_FRAME_MS = 1000 / MAX_FPS;
    let lastRenderTimestamp = 0;
    let animId: number;

    function animate(timestamp: number) {
      animId = requestAnimationFrame(animate);

      if (!lastRenderTimestamp) lastRenderTimestamp = timestamp;
      const timeSinceLast = timestamp - lastRenderTimestamp;
      if (timeSinceLast < MIN_FRAME_MS - 0.8) return;
      lastRenderTimestamp = timestamp;

      if (!appStartTime) appStartTime = timestamp;
      const totalElapsed = timestamp - appStartTime;

      let surgeProgress = 1.0;
      if (introActive) {
        surgeProgress = Math.min(1.0, totalElapsed / INTRO_DURATION);
        if (surgeProgress >= 1.0) {
          introActive = false;
          targetScroll = 0;
          currentScroll = 0;
          wheelVelocity = 0;
        }
      }

      const surgeEase = easeInOutCubic(surgeProgress);
      const dtSec = Math.min(0.1, timeSinceLast / 1000);
      const dtRatio = dtSec * 60;

      // Ambient Auto-Drift after intro completes
      if (!introActive && !isDown && !perfRef.current.reducedMotion) {
        const driftMultiplier = hoveredIndex !== -1 ? 0.30 : 1.0;
        targetScroll += 0.0035 * speedRef.current * driftMultiplier * driftRef.current * dtRatio;
      }

      targetScroll += wheelVelocity;
      wheelVelocity *= Math.pow(0.84, dtRatio);

      currentScroll += (targetScroll - currentScroll) * (1 - Math.pow(1 - 0.07, dtRatio));
      currentMouseX += (targetMouseX - currentMouseX) * (1 - Math.pow(1 - 0.055, dtRatio));
      currentMouseY += (targetMouseY - currentMouseY) * (1 - Math.pow(1 - 0.055, dtRatio));

      const introDashOffset = introActive ? (surgeEase - 1.0) * 58.0 : 0.0;
      floorGlassMaterial.uniforms.uScroll.value = currentScroll + introDashOffset;
      floorGlassMaterial.uniforms.uIntroEase.value = introActive ? surgeEase : 1.0;

      const isMotionActive = Math.abs(wheelVelocity) > 0.0005 || Math.abs(targetScroll - currentScroll) > 0.001;
      if (pointerDirty || isMotionActive) {
        if (!isDown && mousePointer.x > -900) {
          raycaster.setFromCamera(mousePointer, camera);
          const hits = raycaster.intersectObjects(primaryPickMeshes);
          if (hits.length > 0) {
            hoveredIndex = hits[0].object.userData.colIndex;
            hoveredIsLeft = hits[0].object.userData.isLeft;
            document.body.style.cursor = "pointer";
          } else {
            hoveredIndex = -1;
            document.body.style.cursor = "default";
          }
        } else {
          hoveredIndex = -1;
          document.body.style.cursor = isDown ? "grabbing" : "default";
        }
        pointerDirty = false;
      }

      const hasHover = hoveredIndex !== -1;
      const totalVideos = videoTextures.length;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const isHoverL = hasHover && hoveredIndex === i && hoveredIsLeft;
        const isHoverR = hasHover && hoveredIndex === i && !hoveredIsLeft;

        const targetFocusL = isHoverL ? 1.10 : hasHover ? 0.94 : 1.0;
        const targetFocusR = isHoverR ? 1.10 : hasHover ? 0.94 : 1.0;
        const targetPopL = isHoverL ? 1.0 : 0.0;
        const targetPopR = isHoverR ? 1.0 : 0.0;

        item.focusL += (targetFocusL - item.focusL) * 0.09;
        item.focusR += (targetFocusR - item.focusR) * 0.09;
        item.hoverPopL += (targetPopL - item.hoverPopL) * 0.10;
        item.hoverPopR += (targetPopR - item.hoverPopR) * 0.10;

        (item.meshL.material as THREE.ShaderMaterial).uniforms.uFocus.value = item.focusL;
        (item.meshL_refl.material as THREE.ShaderMaterial).uniforms.uFocus.value = item.focusL;
        (item.meshR.material as THREE.ShaderMaterial).uniforms.uFocus.value = item.focusR;
        (item.meshR_refl.material as THREE.ShaderMaterial).uniforms.uFocus.value = item.focusR;

        let z: number;
        if (introActive) {
          const targetZ = item.restingZ + currentScroll;
          z = item.initialZ + (targetZ - item.initialZ) * surgeEase;
        } else {
          const rawZ = item.restingZ + currentScroll;
          z = wrap(rawZ, BACK_WRAP, FRONT_WRAP);

          const currentWrap = Math.floor((rawZ - BACK_WRAP) / WRAP_RANGE);
          if (item.lastWrapCount !== currentWrap) {
            item.lastWrapCount = currentWrap;

            item.idxL = pickDistinctVideo(i, true, items, TOTAL_COLUMNS, totalVideos);
            const texL = videoTextures[item.idxL];
            (item.meshL.material as THREE.ShaderMaterial).uniforms.map.value = texL;
            (item.meshL_refl.material as THREE.ShaderMaterial).uniforms.map.value = texL;

            item.idxR = pickDistinctVideo(i, false, items, TOTAL_COLUMNS, totalVideos);
            const texR = videoTextures[item.idxR];
            (item.meshR.material as THREE.ShaderMaterial).uniforms.map.value = texR;
            (item.meshR_refl.material as THREE.ShaderMaterial).uniforms.map.value = texR;

            item.lY = -0.55 + Math.random() * 1.4;
            item.rY = -0.55 + Math.random() * 1.4;
            item.lOffset = (Math.random() - 0.5) * 0.16;
            item.rOffset = (Math.random() - 0.5) * 0.16;

            item.baseScaleL = 0.88 + Math.random() * 0.28;
            item.baseScaleR = 0.88 + Math.random() * 0.28;
          }
        }

        const isVisible = z >= -44.0 && z <= 4.5;
        item.meshL.visible = isVisible;
        item.meshL_refl.visible = isVisible;
        item.meshR.visible = isVisible;
        item.meshR_refl.visible = isVisible;
        item.meshL_hit.visible = isVisible;
        item.meshR_hit.visible = isVisible;

        if (!isVisible) continue;

        const curScaleL = item.baseScaleL * (1.0 + item.hoverPopL * 0.03);
        item.meshL.scale.set(curScaleL, curScaleL, 1);
        item.meshL_refl.scale.set(curScaleL, curScaleL, 1);
        item.meshL_hit.scale.set(curScaleL, curScaleL, 1);

        const curScaleR = item.baseScaleR * (1.0 + item.hoverPopR * 0.03);
        item.meshR.scale.set(curScaleR, curScaleR, 1);
        item.meshR_refl.scale.set(curScaleR, curScaleR, 1);
        item.meshR_hit.scale.set(curScaleR, curScaleR, 1);

        const depthWeight = Math.max(0.12, 1.0 - Math.min(1.0, Math.abs(z - 1.5) / 18.0));
        const slideX = currentMouseX * 0.12 * depthWeight;
        const slideY = currentMouseY * 0.10 * depthWeight;

        const activeFlare = flareRef.current;
        const activeSheen = sheenRef.current;
        const baseWallX = widthRef.current;

        (item.meshL.material as THREE.ShaderMaterial).uniforms.uCurvePower.value = activeFlare;
        (item.meshL_refl.material as THREE.ShaderMaterial).uniforms.uCurvePower.value = activeFlare;
        (item.meshR.material as THREE.ShaderMaterial).uniforms.uCurvePower.value = activeFlare;
        (item.meshR_refl.material as THREE.ShaderMaterial).uniforms.uCurvePower.value = activeFlare;

        (item.meshL_refl.material as THREE.ShaderMaterial).uniforms.uSheen.value = activeSheen;
        (item.meshR_refl.material as THREE.ShaderMaterial).uniforms.uSheen.value = activeSheen;

        const flareT = Math.max(0.0, Math.min(1.0, (z + 7.5) / 14.5));
        const curveFlareVal = Math.pow(flareT, 2.1) * activeFlare;

        // 1. Primary Left Video
        const primaryX_L = -(baseWallX + item.lOffset) - slideX + item.hoverPopL * 0.15;
        const primaryY_L = item.lY + slideY + item.hoverPopL * 0.09;
        item.meshL.position.set(primaryX_L, primaryY_L, z);
        item.meshL.rotation.z = 0;

        item.meshL_hit.position.set(primaryX_L - curveFlareVal, primaryY_L, z);
        item.meshL_hit.rotation.y = Math.PI / 2;
        item.meshL_hit.rotation.z = 0;

        // 2. Mirrored Left Video (Physical reflection plane at FLOOR_Y = -2.60)
        const reflY_L = 2.0 * CORRIDOR_CONFIG.FLOOR_Y - primaryY_L;
        item.meshL_refl.position.set(primaryX_L, reflY_L, z);
        item.meshL_refl.rotation.z = 0;

        // 3. Primary Right Video
        const primaryX_R = +(baseWallX - item.rOffset) + slideX - item.hoverPopR * 0.15;
        const primaryY_R = item.rY + slideY + item.hoverPopR * 0.09;
        item.meshR.position.set(primaryX_R, primaryY_R, z);
        item.meshR.rotation.z = 0;

        item.meshR_hit.position.set(primaryX_R + curveFlareVal, primaryY_R, z);
        item.meshR_hit.rotation.y = -Math.PI / 2;
        item.meshR_hit.rotation.z = 0;

        // 4. Mirrored Right Video (Physical reflection plane at FLOOR_Y = -2.60)
        const reflY_R = 2.0 * CORRIDOR_CONFIG.FLOOR_Y - primaryY_R;
        item.meshR_refl.position.set(primaryX_R, reflY_R, z);
        item.meshR_refl.rotation.z = 0;
      }

      renderer.render(scene, camera);
    }

    animId = requestAnimationFrame(animate);

    // --- CLEANUP ---
    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      if (titleTimer) clearTimeout(titleTimer);

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);

      disposeCorridor(scene, renderer, videoElements, videoTextures, container);
      rendererRef.current = null;
    };
  }, [videos]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={{ ...style }}
    >
      {title && (
        <h1
          ref={headerRef}
          className={styles.brandHeader}
        >
          {title}
        </h1>
      )}
    </div>
  );
}

export default CinemaAisle;
