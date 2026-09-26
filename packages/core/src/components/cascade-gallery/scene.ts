import * as THREE from "three";
import gsap from "gsap";
import { GLASS_VERTEX_SHADER, GLASS_FRAGMENT_SHADER } from "./shaders";

export interface CardObject {
  group: THREE.Group;
  mesh: THREE.Mesh;
  mat: THREE.ShaderMaterial;
  index: number;
  localPitch: number;
  hoverLift: number;
  introPitch: number;
  introFade: number;
  introThermal: number;
  introOffset?: number;
}

export const CASCADE_CONSTANTS = {
  cardWidth: 3.0,
  cardHeight: 1.6875,
  dirX: 1.62,
  dirY: 0.90,
  dirZ: -0.05,
  totalCards: 120,
};

export function createCard(
  tex: THREE.Texture,
  cardGeo: THREE.PlaneGeometry,
  scene: THREE.Scene
): { group: THREE.Group; mesh: THREE.Mesh; mat: THREE.ShaderMaterial } {
  const { cardWidth, cardHeight } = CASCADE_CONSTANTS;
  const mat = new THREE.ShaderMaterial({
    vertexShader: GLASS_VERTEX_SHADER,
    fragmentShader: GLASS_FRAGMENT_SHADER,
    uniforms: {
      uTexture: { value: tex },
      uBlur: { value: 2.8 },
      uAspect: { value: cardWidth / cardHeight },
      uDepthAlpha: { value: 1.0 },
      uIntroFade: { value: 0.0 },
      uThermalNeg: { value: 0.0 },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthTest: true,
    depthWrite: true,
  });

  const mesh = new THREE.Mesh(cardGeo, mat);
  const group = new THREE.Group();
  group.rotation.set(0.14, -0.84, -0.15);
  group.add(mesh);
  scene.add(group);
  return { group, mesh, mat };
}

export function loadCardsAndTextures(
  images: string[],
  cardGeo: THREE.PlaneGeometry,
  proxyGeo: THREE.PlaneGeometry,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  hitProxies: THREE.Mesh[],
  cards: CardObject[],
  introBloom: { fade: number; blur: number },
  onReady: () => void
): () => void {
  let isDisposed = false;
  const textureLoader = new THREE.TextureLoader();
  const loadPromises = images.map((src) => {
    return new Promise<THREE.Texture>((resolve) => {
      textureLoader.load(src, (tex) => {
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        resolve(tex);
      });
    });
  });

  Promise.all(loadPromises).then((loadedTextures) => {
    if (isDisposed) return;
    const { totalCards } = CASCADE_CONSTANTS;

    for (let i = 0; i < totalCards; i++) {
      const tex = loadedTextures[i % loadedTextures.length];
      const cardObj = createCard(tex, cardGeo, scene);

      const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
      const proxyMesh = new THREE.Mesh(proxyGeo, proxyMat);
      proxyMesh.userData = { cardIndex: i };
      cardObj.group.add(proxyMesh);
      hitProxies.push(proxyMesh);

      cards.push({
        ...cardObj,
        index: i,
        localPitch: 0,
        hoverLift: 0,
        introPitch: 0.15,
        introFade: 0.0,
        introThermal: 1.0,
        introOffset: 0,
      });
    }

    cards.forEach((card, idx) => {
      const cardOrder = idx % 24;
      const delay = 0.06 + cardOrder * 0.045;

      gsap.to(card, {
        introThermal: 0.0,
        introPitch: 0.0,
        introFade: 1.0,
        duration: 1.85,
        delay: delay,
        ease: "power2.inOut",
      });
    });

    gsap.to(introBloom, {
      fade: 1.0,
      blur: 0.0,
      duration: 2.4,
      ease: "power3.out",
    });

    gsap.fromTo(
      camera.position,
      { z: 47, y: -0.8 },
      { z: 42, y: 0.0, duration: 2.4, ease: "power3.out" }
    );

    gsap.fromTo(
      ".cascade-hud",
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 1.4, delay: 0.6, ease: "power2.out" }
    );

    onReady();
  });

  return () => {
    isDisposed = true;
  };
}

export function disposeCascadeScene(
  cardGeo: THREE.PlaneGeometry,
  proxyGeo: THREE.PlaneGeometry,
  cards: CardObject[],
  renderer: THREE.WebGLRenderer
): void {
  cardGeo.dispose();
  proxyGeo.dispose();
  cards.forEach((c) => {
    if (c.mat) c.mat.dispose();
  });
  renderer.dispose();
}
