import * as THREE from "three";
import { MeshData } from "./types";

export const CUBE_FACES = [
  { normal: new THREE.Vector3(0, 0, 1), rotY: 0, rotX: 0 }, // Front (+Z)
  { normal: new THREE.Vector3(0, 0, -1), rotY: Math.PI, rotX: 0 }, // Back (-Z)
  { normal: new THREE.Vector3(1, 0, 0), rotY: Math.PI / 2, rotX: 0 }, // Right (+X)
  { normal: new THREE.Vector3(-1, 0, 0), rotY: -Math.PI / 2, rotX: 0 }, // Left (-X)
  { normal: new THREE.Vector3(0, 1, 0), rotY: 0, rotX: -Math.PI / 2 }, // Top (+Y)
  { normal: new THREE.Vector3(0, -1, 0), rotY: 0, rotX: Math.PI / 2 }, // Bottom (-Y)
];

/**
 * Curves plane geometry vertices along a spherical arc of the given radius.
 */
export function createSphericalCurvedPlaneGeo(
  width: number,
  height: number,
  radius: number,
  isLowTier: boolean
): THREE.PlaneGeometry {
  const segs = isLowTier ? 6 : 16;
  const geo = new THREE.PlaneGeometry(width, height, segs, segs);
  const posAttr = geo.attributes.position;

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const distSq = x * x + y * y;
    const maxRadiusSq = radius * radius;

    if (distSq < maxRadiusSq) {
      const zOffset = radius - Math.sqrt(maxRadiusSq - distSq);
      posAttr.setZ(i, -zOffset * 0.95);
    }
  }

  posAttr.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export interface CenterTextController {
  textMesh: THREE.Mesh;
  textTexture: THREE.CanvasTexture;
  textGeo: THREE.PlaneGeometry;
  textMat: THREE.MeshBasicMaterial;
  updateCenterText: (title: string, subtext: string) => void;
}

/**
 * Creates the 3D core center typography canvas texture and billboard plane.
 */
export function createCenterText(
  structureGroup: THREE.Group,
  showCenterText: boolean
): CenterTextController {
  const textCanvas = document.createElement("canvas");
  textCanvas.width = 1024;
  textCanvas.height = 512;
  const textCtx = textCanvas.getContext("2d");

  const drawText = (title: string, subtext: string) => {
    if (!textCtx) return;
    textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);

    textCtx.fillStyle = "rgba(240, 240, 245, 0.95)";
    textCtx.font = "900 80px sans-serif";
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";
    textCtx.fillText(title, 512, 220);

    textCtx.fillStyle = "rgba(160, 160, 175, 0.75)";
    textCtx.font = "600 22px monospace";
    textCtx.fillText(subtext, 512, 310);
  };

  const textTexture = new THREE.CanvasTexture(textCanvas);
  textTexture.colorSpace = THREE.SRGBColorSpace;

  const textGeo = new THREE.PlaneGeometry(540, 270);
  const textMat = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const textMesh = new THREE.Mesh(textGeo, textMat);
  textMesh.position.set(0, 0, 0);
  textMesh.visible = showCenterText;
  structureGroup.add(textMesh);

  return {
    textMesh,
    textTexture,
    textGeo,
    textMat,
    updateCenterText: (title: string, subtext: string) => {
      drawText(title, subtext);
      textTexture.needsUpdate = true;
    },
  };
}

/**
 * Preloads image textures with adaptive cover repeat/offset to prevent aspect ratio distortion.
 */
export function loadCoverTextures(sources: string[]): THREE.Texture[] {
  const textureLoader = new THREE.TextureLoader();
  const planeAspect = 120 / 155;

  return sources.map((src) => {
    const tex = textureLoader.load(src, (loadedTex) => {
      const img = loadedTex.image as HTMLImageElement | undefined;
      if (img?.width && img?.height) {
        const imgAspect = img.width / img.height;
        if (imgAspect > planeAspect) {
          loadedTex.repeat.set(planeAspect / imgAspect, 1);
          loadedTex.offset.set((1 - loadedTex.repeat.x) / 2, 0);
        } else {
          loadedTex.repeat.set(1, imgAspect / planeAspect);
          loadedTex.offset.set(0, (1 - loadedTex.repeat.y) / 2);
        }
        loadedTex.needsUpdate = true;
      }
    });
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  });
}

export interface BuildStructureOptions {
  mode: "sphere" | "cuboid" | "cuboid-grid";
  count: number;
  radius: number;
  textures: THREE.Texture[];
  structureGroup: THREE.Group;
  isLowTier: boolean;
  defaultPlaneGeo: THREE.PlaneGeometry;
}

/**
 * Constructs 3D panels for sphere, monolith cube, or cuboid grid arrangements.
 */
export function buildStructureMeshes(options: BuildStructureOptions): MeshData[] {
  const { mode, count, radius, textures, structureGroup, isLowTier, defaultPlaneGeo } = options;
  const meshesData: MeshData[] = [];

  if (mode === "cuboid") {
    const monolithGeo = new THREE.PlaneGeometry(330, 420);

    CUBE_FACES.forEach((face, idx) => {
      const unitPos = face.normal.clone().multiplyScalar(0.75);
      const texture = textures[idx % textures.length];
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1.0,
      });

      const mesh = new THREE.Mesh(monolithGeo, material);
      mesh.rotation.set(face.rotX, face.rotY, 0);
      const baseRot = mesh.rotation.clone();

      structureGroup.add(mesh);
      meshesData.push({ mesh, unitPos, baseRot, material });
    });
  } else if (mode === "cuboid-grid") {
    let imgIdx = 0;
    CUBE_FACES.forEach((face) => {
      const offsets = [-0.38, 0.38];
      offsets.forEach((ox) => {
        offsets.forEach((oy) => {
          const unitPos = new THREE.Vector3();
          if (face.normal.z !== 0) {
            unitPos.set(ox, oy, face.normal.z * 0.85);
          } else if (face.normal.x !== 0) {
            unitPos.set(face.normal.x * 0.85, oy, ox);
          } else {
            unitPos.set(ox, face.normal.y * 0.85, oy);
          }

          const texture = textures[imgIdx % textures.length];
          imgIdx++;

          const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1.0,
          });

          const mesh = new THREE.Mesh(defaultPlaneGeo.clone(), material);
          mesh.rotation.set(face.rotX, face.rotY, 0);
          const baseRot = mesh.rotation.clone();

          structureGroup.add(mesh);
          meshesData.push({ mesh, unitPos, baseRot, material });
        });
      });
    });
  } else {
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const curvedGeo = createSphericalCurvedPlaneGeo(120, 155, radius, isLowTier);

    for (let i = 0; i < count; i++) {
      const theta = Math.acos(1 - (2 * (i + 0.5)) / count);
      const phi = (2 * Math.PI * i) / goldenRatio;

      const nx = Math.sin(theta) * Math.cos(phi);
      const ny = Math.sin(theta) * Math.sin(phi);
      const nz = Math.cos(theta);

      const unitPos = new THREE.Vector3(nx, ny, nz).normalize();

      const texture = textures[i % textures.length];
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1.0,
      });

      const mesh = new THREE.Mesh(curvedGeo.clone(), material);
      mesh.lookAt(unitPos.clone().multiplyScalar(2));
      const baseRot = mesh.rotation.clone();

      structureGroup.add(mesh);
      meshesData.push({ mesh, unitPos, baseRot, material });
    }
    curvedGeo.dispose();
  }

  return meshesData;
}
