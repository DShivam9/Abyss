import { useRef, useEffect } from "react";
import * as THREE from "three";
import { CinemaAisleProps } from "./types";
import { DEFAULT_VIDEOS, BASE_PROPORTIONS, CORRIDOR_CONFIG } from "./constants";

export default function CinemaAisle({
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

  const flareRef = useRef(curveFlare);
  flareRef.current = curveFlare;

  const speedRef = useRef(scrollSpeed);
  speedRef.current = scrollSpeed;

  const sheenRef = useRef(reflectionSheen);
  sheenRef.current = reflectionSheen;

  const widthRef = useRef(corridorWidth);
  widthRef.current = corridorWidth;

  const driftRef = useRef(driftSpeed);
  driftRef.current = driftSpeed;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const FOG_DENSITY = CORRIDOR_CONFIG.FOG_DENSITY;
    scene.fog = new THREE.FogExp2(0x000000, FOG_DENSITY);

    // Camera completely anchored at center
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 4);
    camera.lookAt(0, 0, -12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- 16 VIDEO TEXTURE STREAM ENGINE ---
    const activeVideoSources = videos && videos.length > 0 ? videos : DEFAULT_VIDEOS;
    const TOTAL_VIDEOS = activeVideoSources.length;

    const videoElements: HTMLVideoElement[] = [];
    const videoTextures: THREE.VideoTexture[] = [];

    activeVideoSources.forEach((src) => {
      const vid = document.createElement("video");
      vid.src = src;
      vid.crossOrigin = "anonymous";
      vid.loop = true;
      vid.muted = true;
      vid.playsInline = true;
      vid.setAttribute("playsinline", "");
      vid.setAttribute("webkit-playsinline", "");
      vid.autoplay = true;

      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          const resume = () => {
            vid.play();
            window.removeEventListener("pointerdown", resume);
            window.removeEventListener("wheel", resume);
          };
          window.addEventListener("pointerdown", resume, { once: true });
          window.addEventListener("wheel", resume, { once: true });
        });
      }

      const tex = new THREE.VideoTexture(vid);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.generateMipmaps = false;

      videoElements.push(vid);
      videoTextures.push(tex);
    });

    // --- CORRIDOR CONFIG ---
    const BASE_WALL_X = CORRIDOR_CONFIG.BASE_WALL_X;
    const TOTAL_COLUMNS = CORRIDOR_CONFIG.TOTAL_COLUMNS;
    const Z_STEP = CORRIDOR_CONFIG.Z_STEP;
    const TOTAL_DEPTH = TOTAL_COLUMNS * Z_STEP;
    const FRONT_WRAP = CORRIDOR_CONFIG.FRONT_WRAP;
    const BACK_WRAP = FRONT_WRAP - TOTAL_DEPTH;
    const WRAP_RANGE = FRONT_WRAP - BACK_WRAP;
    const FLOOR_Y = CORRIDOR_CONFIG.FLOOR_Y;

    // 1. Primary Wall Video Shader
    function createCurvedMaterial(tex: THREE.VideoTexture, isLeft: boolean) {
      return new THREE.ShaderMaterial({
        uniforms: {
          map: { value: tex },
          isLeft: { value: isLeft ? 1.0 : 0.0 },
          uCurvePower: { value: flareRef.current },
          uFocus: { value: 1.0 },
          fogColor: { value: new THREE.Color(0x000000) },
          fogDensity: { value: FOG_DENSITY },
        },
        vertexShader: `
          uniform float isLeft;
          uniform float uCurvePower;
          varying vec2 vUv;
          varying float vFogDepth;

          void main() {
            vUv = uv;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            float t = clamp((worldPos.z + 7.5) / 14.5, 0.0, 1.0);
            float flare = pow(t, 2.1) * uCurvePower;
            worldPos.x += (isLeft > 0.5) ? -flare : flare;
            vec4 viewPos = viewMatrix * worldPos;
            vFogDepth = -viewPos.z;
            gl_Position = projectionMatrix * viewPos;
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform float uFocus;
          uniform vec3 fogColor;
          uniform float fogDensity;
          varying vec2 vUv;
          varying float vFogDepth;

          void main() {
            vec4 texColor = texture2D(map, vUv);
            texColor.rgb *= uFocus;
            float fogFactor = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
            fogFactor = clamp(fogFactor, 0.0, 1.0);
            gl_FragColor = vec4(mix(texColor.rgb, fogColor, fogFactor), texColor.a);
          }
        `,
        side: THREE.DoubleSide,
      });
    }

    // 2. Anisotropic Satin Floor Reflection Shader
    function createReflectedVideoMaterial(tex: THREE.VideoTexture, isLeft: boolean) {
      return new THREE.ShaderMaterial({
        uniforms: {
          map: { value: tex },
          isLeft: { value: isLeft ? 1.0 : 0.0 },
          uCurvePower: { value: flareRef.current },
          uSheen: { value: sheenRef.current },
          uFocus: { value: 1.0 },
          fogColor: { value: new THREE.Color(0x000000) },
          fogDensity: { value: FOG_DENSITY },
        },
        vertexShader: `
          uniform float isLeft;
          uniform float uCurvePower;
          varying vec2 vUv;
          varying float vFogDepth;
          varying float vWorldY;

          void main() {
            vUv = uv;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            float t = clamp((worldPos.z + 7.5) / 14.5, 0.0, 1.0);
            float flare = pow(t, 2.1) * uCurvePower;
            worldPos.x += (isLeft > 0.5) ? -flare : flare;
            vWorldY = worldPos.y;
            vec4 viewPos = viewMatrix * worldPos;
            vFogDepth = -viewPos.z;
            gl_Position = projectionMatrix * viewPos;
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform float uFocus;
          uniform float uSheen;
          uniform vec3 fogColor;
          uniform float fogDensity;
          varying vec2 vUv;
          varying float vFogDepth;
          varying float vWorldY;

          void main() {
            vec2 reflUv = vec2(vUv.x, 1.0 - vUv.y);

            float bx = 0.0055;
            float by = 0.0022;
            vec4 col = texture2D(map, reflUv) * 0.36;
            col += texture2D(map, reflUv + vec2(-bx, -by)) * 0.16;
            col += texture2D(map, reflUv + vec2( bx, -by)) * 0.16;
            col += texture2D(map, reflUv + vec2(-bx * 1.4, by)) * 0.16;
            col += texture2D(map, reflUv + vec2( bx * 1.4, by)) * 0.16;

            float floorLevel = -2.60;
            float distBelow = max(0.0, floorLevel - vWorldY);
            float verticalFalloff = 1.0 - clamp(distBelow / 3.4, 0.0, 1.0);
            verticalFalloff = pow(verticalFalloff, 1.2);

            float reflFogDensity = fogDensity * 0.52;
            float fogFactor = 1.0 - exp(-reflFogDensity * reflFogDensity * vFogDepth * vFogDepth);
            fogFactor = clamp(fogFactor, 0.0, 1.0);

            float reflMultiplier = max(1.0, uFocus);
            vec3 reflectedRgb = mix(col.rgb * uSheen * reflMultiplier, fogColor, fogFactor);
            float alpha = verticalFalloff * 0.72 * (1.0 - fogFactor * 0.6);

            gl_FragColor = vec4(reflectedRgb, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
    }

    const baseProportions = BASE_PROPORTIONS;

    interface Item {
      meshL: THREE.Mesh;
      meshL_hit: THREE.Mesh;
      meshL_refl: THREE.Mesh;
      meshR: THREE.Mesh;
      meshR_hit: THREE.Mesh;
      meshR_refl: THREE.Mesh;
      restingZ: number;
      initialZ: number;
      idxL: number;
      idxR: number;
      lY: number;
      rY: number;
      lOffset: number;
      rOffset: number;
      baseScaleL: number;
      baseScaleR: number;
      focusL: number;
      focusR: number;
      hoverPopL: number;
      hoverPopR: number;
      lastWrapCount: number;
    }

    const items: Item[] = [];

    function pickDistinctVideo(colIndex: number, isLeft: boolean): number {
      const forbidden = new Set<number>();
      for (let offset = -3; offset <= 3; offset++) {
        if (offset === 0 && !isLeft && items[colIndex]) {
          forbidden.add(items[colIndex].idxL);
        }
        const neighborIdx = (colIndex + offset + TOTAL_COLUMNS) % TOTAL_COLUMNS;
        const neighbor = items[neighborIdx];
        if (neighbor) {
          if (neighbor.idxL !== undefined) forbidden.add(neighbor.idxL);
          if (neighbor.idxR !== undefined) forbidden.add(neighbor.idxR);
        }
      }

      const available: number[] = [];
      for (let i = 0; i < TOTAL_VIDEOS; i++) {
        if (!forbidden.has(i)) available.push(i);
      }

      const pool = available.length > 0 ? available : [Math.floor(Math.random() * TOTAL_VIDEOS)];
      return pool[Math.floor(Math.random() * pool.length)];
    }

    const SURGE_START_Z = CORRIDOR_CONFIG.SURGE_START_Z;
    const hitMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const primaryPickMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < TOTAL_COLUMNS; i++) {
      const restingZ = -i * Z_STEP;
      const initialZ = SURGE_START_Z - i * Z_STEP;

      const propL = baseProportions[Math.floor(Math.random() * baseProportions.length)];
      const propR = baseProportions[Math.floor(Math.random() * baseProportions.length)];

      // Left Primary
      const idxL = pickDistinctVideo(i, true);
      const geomL = new THREE.PlaneGeometry(propL.w, propL.h, 28, 1);
      const matL = createCurvedMaterial(videoTextures[idxL], true);
      const meshL = new THREE.Mesh(geomL, matL);
      meshL.rotation.y = Math.PI / 2;
      meshL.position.set(-BASE_WALL_X, 0, initialZ);
      scene.add(meshL);

      // Left Hitbox Proxy
      const meshL_hit = new THREE.Mesh(geomL, hitMaterial);
      meshL_hit.userData = { colIndex: i, isLeft: true };
      scene.add(meshL_hit);
      primaryPickMeshes.push(meshL_hit);

      // Left Inverted Real-Time Floor Mirror
      const matL_refl = createReflectedVideoMaterial(videoTextures[idxL], true);
      const meshL_refl = new THREE.Mesh(geomL, matL_refl);
      meshL_refl.rotation.y = Math.PI / 2;
      meshL_refl.position.set(-BASE_WALL_X, FLOOR_Y - 0.8, initialZ);
      scene.add(meshL_refl);

      // Right Primary
      const idxR = pickDistinctVideo(i, false);
      const geomR = new THREE.PlaneGeometry(propR.w, propR.h, 28, 1);
      const matR = createCurvedMaterial(videoTextures[idxR], false);
      const meshR = new THREE.Mesh(geomR, matR);
      meshR.rotation.y = -Math.PI / 2;
      meshR.position.set(+BASE_WALL_X, 0, initialZ);
      scene.add(meshR);

      // Right Hitbox Proxy
      const meshR_hit = new THREE.Mesh(geomR, hitMaterial);
      meshR_hit.userData = { colIndex: i, isLeft: false };
      scene.add(meshR_hit);
      primaryPickMeshes.push(meshR_hit);

      // Right Inverted Real-Time Floor Mirror
      const matR_refl = createReflectedVideoMaterial(videoTextures[idxR], false);
      const meshR_refl = new THREE.Mesh(geomR, matR_refl);
      meshR_refl.rotation.y = -Math.PI / 2;
      meshR_refl.position.set(+BASE_WALL_X, FLOOR_Y - 0.8, initialZ);
      scene.add(meshR_refl);

      const lY = -0.55 + Math.random() * 1.4;
      const rY = -0.55 + Math.random() * 1.4;
      const lOffset = (Math.random() - 0.5) * 0.16;
      const rOffset = (Math.random() - 0.5) * 0.16;

      const baseScaleL = 0.88 + Math.random() * 0.28;
      const baseScaleR = 0.88 + Math.random() * 0.28;
      meshL.scale.set(baseScaleL, baseScaleL, 1);
      meshL_refl.scale.set(baseScaleL, baseScaleL, 1);
      meshL_hit.scale.set(baseScaleL, baseScaleL, 1);
      meshR.scale.set(baseScaleR, baseScaleR, 1);
      meshR_refl.scale.set(baseScaleR, baseScaleR, 1);
      meshR_hit.scale.set(baseScaleR, baseScaleR, 1);

      const initialWrapCount = Math.floor((restingZ - BACK_WRAP) / WRAP_RANGE);

      items[i] = {
        meshL,
        meshL_hit,
        meshL_refl,
        meshR,
        meshR_hit,
        meshR_refl,
        restingZ,
        initialZ,
        idxL,
        idxR,
        lY,
        rY,
        lOffset,
        rOffset,
        baseScaleL,
        baseScaleR,
        focusL: 1.0,
        focusR: 1.0,
        hoverPopL: 0.0,
        hoverPopR: 0.0,
        lastWrapCount: initialWrapCount,
      };
    }

    // --- PURE DARK GLASS OBSIDIAN FLOOR ---
    const floorGlassMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uScroll: { value: 0.0 },
        uIntroEase: { value: 0.0 },
        fogColor: { value: new THREE.Color(0x000000) },
        fogDensity: { value: FOG_DENSITY },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        varying float vFogDepth;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          vec4 viewPos = viewMatrix * worldPos;
          vFogDepth = -viewPos.z;
          gl_Position = projectionMatrix * viewPos;
        }
      `,
      fragmentShader: `
        uniform float uScroll;
        uniform float uIntroEase;
        uniform vec3 fogColor;
        uniform float fogDensity;
        varying vec3 vWorldPos;
        varying float vFogDepth;

        void main() {
          float x = vWorldPos.x;
          float z = vWorldPos.z;

          float dashPeriod = 2.4;
          float dashLength = 1.0;
          float dashCycle = mod(z - uScroll, dashPeriod);
          float dashCap = smoothstep(0.0, 0.08, dashCycle) * smoothstep(dashLength, dashLength - 0.08, dashCycle);
          float dashWidth = smoothstep(0.016, 0.0, abs(x));
          
          float lineEmergence = smoothstep(0.08, 0.72, uIntroEase);
          float centerDashes = dashWidth * dashCap * 0.45 * lineEmergence;

          float distNorm = clamp(-z / 48.0, 0.0, 1.0);
          float horizonSheen = pow(distNorm, 2.2) * 0.06;

          vec3 surfaceColor = vec3(centerDashes * 0.92) + vec3(horizonSheen * 0.8);

          float fogFactor = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
          fogFactor = clamp(fogFactor, 0.0, 1.0);

          vec3 finalRgb = mix(surfaceColor, fogColor, fogFactor);
          gl_FragColor = vec4(finalRgb, 0.30);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const floorGlassGeom = new THREE.PlaneGeometry(32, 100);
    const floorGlassMesh = new THREE.Mesh(floorGlassGeom, floorGlassMaterial);
    floorGlassMesh.rotation.x = -Math.PI / 2;
    floorGlassMesh.position.set(0, FLOOR_Y, -26.0);
    scene.add(floorGlassMesh);

    // Title entrance at second 2.1 (synchronized after fonts are loaded)
    let isMounted = true;
    let titleTimer: any = null;
    async function initExperience() {
      try {
        await document.fonts.load("120px 'Allura'");
        await document.fonts.ready;
      } catch (_) {}
      titleTimer = setTimeout(() => {
        if (isMounted && headerRef.current) {
          headerRef.current.classList.add("visible");
        }
      }, 2100);
    }
    initExperience();

    // --- DIRECT MOUSE TRACKING & GALLERY GLANCE RAYCASTER ---
    const raycaster = new THREE.Raycaster();
    const mousePointer = new THREE.Vector2(-999, -999);

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let pointerDirty = true;

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

    // --- SCROLL / DRAG ---
    let targetScroll = 0;
    let currentScroll = 0;
    let isDown = false;
    let startY = 0;
    let wheelVelocity = 0;

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

    function wrap(val: number, min: number, max: number) {
      const range = max - min;
      return ((((val - min) % range) + range) % range) + min;
    }

    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // --- DEEP-ABYSS FLIGHT ENGINE (3.8s) ---
    let introActive = true;
    const INTRO_DURATION = CORRIDOR_CONFIG.INTRO_DURATION;
    let appStartTime: number | null = null;

    let hoveredIndex = -1;
    let hoveredIsLeft = false;

    // Adaptive 60 / 120 FPS Lock
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

      // Ambient Auto-Drift after intro completes
      if (!introActive && !isDown) {
        const driftMultiplier = hoveredIndex !== -1 ? 0.30 : 1.0;
        targetScroll += 0.0035 * speedRef.current * driftMultiplier * driftRef.current;
      }

      targetScroll += wheelVelocity;
      wheelVelocity *= 0.84;

      currentScroll += (targetScroll - currentScroll) * 0.07;
      currentMouseX += (targetMouseX - currentMouseX) * 0.055;
      currentMouseY += (targetMouseY - currentMouseY) * 0.055;

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

            item.idxL = pickDistinctVideo(i, true);
            const texL = videoTextures[item.idxL];
            (item.meshL.material as THREE.ShaderMaterial).uniforms.map.value = texL;
            (item.meshL_refl.material as THREE.ShaderMaterial).uniforms.map.value = texL;

            item.idxR = pickDistinctVideo(i, false);
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
        const curveFlare = Math.pow(flareT, 2.1) * activeFlare;

        // 1. Primary Left Video
        const primaryX_L = -(baseWallX + item.lOffset) - slideX + item.hoverPopL * 0.15;
        const primaryY_L = item.lY + slideY + item.hoverPopL * 0.09;
        item.meshL.position.set(primaryX_L, primaryY_L, z);
        item.meshL.rotation.z = 0;

        item.meshL_hit.position.set(primaryX_L - curveFlare, primaryY_L, z);
        item.meshL_hit.rotation.y = Math.PI / 2;
        item.meshL_hit.rotation.z = 0;

        // 2. Mirrored Left Video (Physical reflection plane at FLOOR_Y = -2.60)
        const reflY_L = 2.0 * FLOOR_Y - primaryY_L;
        item.meshL_refl.position.set(primaryX_L, reflY_L, z);
        item.meshL_refl.rotation.z = 0;

        // 3. Primary Right Video
        const primaryX_R = +(baseWallX - item.rOffset) + slideX - item.hoverPopR * 0.15;
        const primaryY_R = item.rY + slideY + item.hoverPopR * 0.09;
        item.meshR.position.set(primaryX_R, primaryY_R, z);
        item.meshR.rotation.z = 0;

        item.meshR_hit.position.set(primaryX_R + curveFlare, primaryY_R, z);
        item.meshR_hit.rotation.y = -Math.PI / 2;
        item.meshR_hit.rotation.z = 0;

        // 4. Mirrored Right Video (Physical reflection plane at FLOOR_Y = -2.60)
        const reflY_R = 2.0 * FLOOR_Y - primaryY_R;
        item.meshR_refl.position.set(primaryX_R, reflY_R, z);
        item.meshR_refl.rotation.z = 0;
      }

      renderer.render(scene, camera);
    }

    animId = requestAnimationFrame(animate);

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(titleTimer);

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);

      document.body.style.cursor = "default";

      videoElements.forEach((vid) => {
        vid.pause();
        vid.removeAttribute("src");
        vid.load();
      });

      videoTextures.forEach((tex) => tex.dispose());

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [videos]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 w-screen h-screen overflow-hidden bg-black select-none z-0 ${className}`}
      style={{ ...style }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Allura&display=swap');
        .cinema-aisle-brand-header {
          position: fixed;
          top: 36px;
          left: 50%;
          transform: translate(-50%, -8px);
          font-family: 'Allura', cursive;
          font-size: 40px;
          color: rgba(255, 255, 255, 0.94);
          letter-spacing: 0.18em;
          filter: blur(14px);
          z-index: 100;
          pointer-events: none;
          user-select: none;
          opacity: 0;
          transition: 
            opacity 2.4s cubic-bezier(0.16, 1, 0.3, 1),
            filter 2.4s cubic-bezier(0.16, 1, 0.3, 1),
            letter-spacing 2.6s cubic-bezier(0.16, 1, 0.3, 1),
            transform 2.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cinema-aisle-brand-header.visible {
          opacity: 0.94;
          filter: blur(0px);
          letter-spacing: 0.04em;
          transform: translate(-50%, 0);
        }
      `}</style>
      {title && (
        <h1
          ref={headerRef}
          className="cinema-aisle-brand-header"
        >
          {title}
        </h1>
      )}
    </div>
  );
}
