import * as THREE from "three";
import { TierConfig } from "./types";
import {
  IMAGE_LIST,
  TIER_CONFIGS,
  TIER_IMAGE_INDICES,
  GIMBAL_LAYOUT,
} from "./constants";
import {
  CHAMBER_VERTEX_SHADER,
  CHAMBER_FRAGMENT_SHADER,
  injectCurvatureShader,
  injectMercuryShader,
} from "./shaders";
import {
  createCleanAbyssLogoShape,
  createLiquidMercuryStudioEnvironment,
} from "./geometries";

export interface TierData {
  config: TierConfig;
  axis: THREE.Group;
  cards: THREE.Mesh[];
}

export interface GimbalSceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  backGlow: THREE.PointLight;
  logoMount: THREE.Group;
  logoSpinner: THREE.Group;
  chamberMat: THREE.ShaderMaterial;
  customUniforms: { uTime: { value: number } };
  voyageRoot: THREE.Group;
  tiers: TierData[];
  allCardMeshes: THREE.Mesh[];
  sharedMaterials: THREE.MeshBasicMaterial[];
}

export function setupGimbalScene(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  tier: "low" | "medium" | "high",
  dpr: number,
  onLoaded: () => void
): GimbalSceneContext {
  const isLow = tier === "low";
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 6000);
  camera.position.set(0, 0, 0);
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isLow,
    powerPreference: "high-performance",
    precision: isLow ? "mediump" : "highp",
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  // Studio Lighting & Environment
  const camKey = new THREE.DirectionalLight(0xffffff, 2.5);
  camKey.position.set(0, 4, 7);
  camera.add(camKey);

  const camRim = new THREE.DirectionalLight(0xffffff, 1.8);
  camRim.position.set(0, -4, 5);
  camera.add(camRim);

  const backGlow = new THREE.PointLight(0x7ec8f8, 1.8, 700);
  backGlow.position.set(0, 0, -260);
  scene.add(backGlow);

  const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambLight);

  const studioEnvMap = createLiquidMercuryStudioEnvironment(renderer);
  scene.environment = studioEnvMap;

  // 3D Logo Starburst Centerpiece
  const logoShape = createCleanAbyssLogoShape();
  const logoGeo = new THREE.ExtrudeGeometry(logoShape, {
    steps: 1,
    depth: 0.24,
    bevelEnabled: true,
    bevelThickness: 0.22,
    bevelSize: 0.12,
    bevelSegments: isLow ? 4 : 14,
    curveSegments: isLow ? 8 : 24,
  });
  logoGeo.center();
  logoGeo.computeVertexNormals();

  const logoMount = new THREE.Group();
  logoMount.position.set(0, 0, -180);
  logoMount.scale.set(8, 8, 8);
  scene.add(logoMount);

  const logoSpinner = new THREE.Group();
  logoMount.add(logoSpinner);

  const customUniforms = { uTime: { value: 0.0 } };
  const liquidMercuryMat = new THREE.MeshStandardMaterial({
    color: 0xf5f8fc,
    metalness: 0.88,
    roughness: 0.12,
    envMap: studioEnvMap,
    envMapIntensity: 2.5,
  });
  liquidMercuryMat.onBeforeCompile = (shader) => injectMercuryShader(shader, customUniforms);
  logoSpinner.add(new THREE.Mesh(logoGeo, liquidMercuryMat));

  // Cylindrical Raymarched Chamber
  const cylinderGeo = new THREE.CylinderGeometry(
    GIMBAL_LAYOUT.cylinderRadius,
    GIMBAL_LAYOUT.cylinderRadius,
    GIMBAL_LAYOUT.cylinderHeight,
    96,
    64,
    true
  );
  const chamberMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    fog: false,
    uniforms: {
      uTime: { value: 0 },
      uScrollY: { value: 0 },
      uScrollEnergy: { value: 0 },
      uChamberAwake: { value: 0.20 },
      uMorphWeights: { value: new THREE.Vector3(1.0, 0.0, 0.0) },
      uWaveBrightness: { value: 1.0 },
      uCellSize: { value: 68.0 },
      uCylinderRadius: { value: 1050.0 },
      uBgDark: { value: new THREE.Color(0x020305) },
      uBgMid: { value: new THREE.Color(0x0c1e30) },
      uCausticColor: { value: new THREE.Color(0x7ec8f8) },
      uWireColor: { value: new THREE.Color(0x101522) },
      uWireGlow: { value: new THREE.Color(0x9be5fb) },
    },
    vertexShader: CHAMBER_VERTEX_SHADER,
    fragmentShader: CHAMBER_FRAGMENT_SHADER,
  });
  const chamberMesh = new THREE.Mesh(cylinderGeo, chamberMat);
  chamberMesh.position.set(0, 0, -420);
  scene.add(chamberMesh);

  // Eager In-Memory Preload & Tourbillon Gimbal Rings
  const loadingManager = new THREE.LoadingManager();
  loadingManager.onLoad = onLoaded;

  const textureLoader = new THREE.TextureLoader(loadingManager);
  const cardBendUniform = { uCardBend: { value: 0.0 } };
  const sharedMaterials = IMAGE_LIST.map((url) => {
    const tex = textureLoader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;

    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1.0,
      toneMapped: false,
    });
    mat.onBeforeCompile = (shader) => injectCurvatureShader(shader, cardBendUniform);
    return mat;
  });

  const voyageRoot = new THREE.Group();
  voyageRoot.position.set(0, 0, -180);
  scene.add(voyageRoot);

  const cardGeo = new THREE.PlaneGeometry(GIMBAL_LAYOUT.cardWidth, GIMBAL_LAYOUT.cardHeight, 18, 18);
  const allCardMeshes: THREE.Mesh[] = [];

  const tiers: TierData[] = TIER_CONFIGS.map((cfg, tierIdx) => {
    const gimbalAxis = new THREE.Group();
    voyageRoot.add(gimbalAxis);
    const ringRotator = new THREE.Group();
    gimbalAxis.add(ringRotator);

    const cardMeshes: THREE.Mesh[] = [];
    const tierIndices = TIER_IMAGE_INDICES[tierIdx % TIER_IMAGE_INDICES.length];

    for (let i = 0; i < GIMBAL_LAYOUT.uniformCards; i++) {
      const imgIdx = tierIndices[i % tierIndices.length];
      const mesh = new THREE.Mesh(cardGeo, sharedMaterials[imgIdx]);
      mesh.userData = {
        baseAngle: (i / GIMBAL_LAYOUT.uniformCards) * Math.PI * 2 + cfg.phaseOffset,
        imageIdx: imgIdx,
        hoverScale: 1.0,
      };
      ringRotator.add(mesh);
      cardMeshes.push(mesh);
      allCardMeshes.push(mesh);
    }
    return { config: cfg, axis: gimbalAxis, cards: cardMeshes };
  });

  return {
    scene,
    camera,
    renderer,
    backGlow,
    logoMount,
    logoSpinner,
    chamberMat,
    customUniforms,
    voyageRoot,
    tiers,
    allCardMeshes,
    sharedMaterials,
  };
}

export function disposeGimbalScene(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  sharedMaterials: THREE.MeshBasicMaterial[]
): void {
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

  sharedMaterials.forEach((mat) => {
    if (mat.map) mat.map.dispose();
    mat.dispose();
  });

  renderer.dispose();
}
