import * as THREE from "three";
import { BASE_PROPORTIONS, CORRIDOR_CONFIG } from "./constants";
import {
  createCurvedMaterial,
  createReflectedVideoMaterial,
  createFloorGlassMaterial,
} from "./shaders";

export interface CorridorItem {
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

export function wrap(val: number, min: number, max: number): number {
  const range = max - min;
  return ((((val - min) % range) + range) % range) + min;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function setupVideoStreams(
  sources: string[],
  renderer: THREE.WebGLRenderer
): { videoElements: HTMLVideoElement[]; videoTextures: THREE.VideoTexture[] } {
  const videoElements: HTMLVideoElement[] = [];
  const videoTextures: THREE.VideoTexture[] = [];

  sources.forEach((src) => {
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

  return { videoElements, videoTextures };
}

export function pickDistinctVideo(
  colIndex: number,
  isLeft: boolean,
  items: CorridorItem[],
  totalColumns: number,
  totalVideos: number
): number {
  const forbidden = new Set<number>();
  for (let offset = -3; offset <= 3; offset++) {
    if (offset === 0 && !isLeft && items[colIndex]) {
      forbidden.add(items[colIndex].idxL);
    }
    const neighborIdx = (colIndex + offset + totalColumns) % totalColumns;
    const neighbor = items[neighborIdx];
    if (neighbor) {
      if (neighbor.idxL !== undefined) forbidden.add(neighbor.idxL);
      if (neighbor.idxR !== undefined) forbidden.add(neighbor.idxR);
    }
  }

  const available: number[] = [];
  for (let i = 0; i < totalVideos; i++) {
    if (!forbidden.has(i)) available.push(i);
  }

  const pool = available.length > 0 ? available : [Math.floor(Math.random() * totalVideos)];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function buildCorridor(
  scene: THREE.Scene,
  videoTextures: THREE.VideoTexture[],
  initialFlare: number,
  initialSheen: number
): {
  items: CorridorItem[];
  primaryPickMeshes: THREE.Mesh[];
  floorGlassMaterial: THREE.ShaderMaterial;
} {
  const items: CorridorItem[] = [];
  const primaryPickMeshes: THREE.Mesh[] = [];

  const {
    BASE_WALL_X,
    TOTAL_COLUMNS,
    Z_STEP,
    FRONT_WRAP,
    FLOOR_Y,
    FOG_DENSITY,
    SURGE_START_Z,
  } = CORRIDOR_CONFIG;

  const TOTAL_DEPTH = TOTAL_COLUMNS * Z_STEP;
  const BACK_WRAP = FRONT_WRAP - TOTAL_DEPTH;
  const WRAP_RANGE = FRONT_WRAP - BACK_WRAP;

  const hitMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
  const totalVideos = videoTextures.length;

  for (let i = 0; i < TOTAL_COLUMNS; i++) {
    const restingZ = -i * Z_STEP;
    const initialZ = SURGE_START_Z - i * Z_STEP;

    const propL = BASE_PROPORTIONS[Math.floor(Math.random() * BASE_PROPORTIONS.length)];
    const propR = BASE_PROPORTIONS[Math.floor(Math.random() * BASE_PROPORTIONS.length)];

    // Left Primary
    const idxL = pickDistinctVideo(i, true, items, TOTAL_COLUMNS, totalVideos);
    const geomL = new THREE.PlaneGeometry(propL.w, propL.h, 28, 1);
    const matL = createCurvedMaterial(videoTextures[idxL], true, initialFlare, FOG_DENSITY);
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
    const matL_refl = createReflectedVideoMaterial(videoTextures[idxL], true, initialFlare, initialSheen, FOG_DENSITY);
    const meshL_refl = new THREE.Mesh(geomL, matL_refl);
    meshL_refl.rotation.y = Math.PI / 2;
    meshL_refl.position.set(-BASE_WALL_X, FLOOR_Y - 0.8, initialZ);
    scene.add(meshL_refl);

    // Right Primary
    const idxR = pickDistinctVideo(i, false, items, TOTAL_COLUMNS, totalVideos);
    const geomR = new THREE.PlaneGeometry(propR.w, propR.h, 28, 1);
    const matR = createCurvedMaterial(videoTextures[idxR], false, initialFlare, FOG_DENSITY);
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
    const matR_refl = createReflectedVideoMaterial(videoTextures[idxR], false, initialFlare, initialSheen, FOG_DENSITY);
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

  // Pure dark glass obsidian floor
  const floorGlassMaterial = createFloorGlassMaterial(FOG_DENSITY);
  const floorGlassGeom = new THREE.PlaneGeometry(32, 100);
  const floorGlassMesh = new THREE.Mesh(floorGlassGeom, floorGlassMaterial);
  floorGlassMesh.rotation.x = -Math.PI / 2;
  floorGlassMesh.position.set(0, FLOOR_Y, -26.0);
  scene.add(floorGlassMesh);

  return { items, primaryPickMeshes, floorGlassMaterial };
}

export function disposeCorridor(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  videoElements: HTMLVideoElement[],
  videoTextures: THREE.VideoTexture[],
  container: HTMLDivElement
): void {
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
}
