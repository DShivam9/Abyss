import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useAbyssMouse } from "./useAbyssMouse";
import { useAbyssScroll } from "./useAbyssScroll";
import { AbyssComponentProps, PerformanceProfile } from "./types";
import { usePerformance } from "./PerformanceProvider";

export interface AbyssCanvasProps extends AbyssComponentProps {
  vertexShader: string;
  fragmentShader: string;
  uniforms?: Record<string, any>;
  subdivisions?: { x: number; y: number };
  customGeometry?: THREE.BufferGeometry;
  onClickCanvas?: (uv: THREE.Vector2, clock: THREE.Clock) => void;
  onAnimate?: (material: THREE.ShaderMaterial, clock: THREE.Clock, delta: number, perf?: PerformanceProfile) => void;
  ariaLabel?: string;
  fit?: "contain" | "cover";
}

export const AbyssCanvas: React.FC<AbyssCanvasProps> = ({
  imageSrc,
  vertexShader,
  fragmentShader,
  uniforms = {},
  subdivisions = { x: 1, y: 1 },
  customGeometry,
  className = "",
  style,
  onLifecycleChange,
  onClickCanvas,
  onAnimate,
  ariaLabel,
  fit = "contain",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const [imgDimensions, setImgDimensions] = useState({ width: 500, height: 500 });
  const imgDimensionsRef = useRef({ width: 500, height: 500 });
  const perf = usePerformance();
  const perfRef = useRef(perf);
  perfRef.current = perf;

  const { stateRef: mouseStateRef, updateMouse } = useAbyssMouse(containerRef);
  const { updateScroll } = useAbyssScroll(containerRef);

  // Use refs for animation variables to prevent closure capture issues
  const targetHover = useRef(0.0);
  const currentHover = useRef(0.0);
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const isIntersecting = useRef(true);

  // Setup event signals for hover
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseEnter = () => {
      targetHover.current = 1.0;
      onLifecycleChange?.("discovery");
    };

    const handleMouseLeave = () => {
      targetHover.current = 0.0;
      onLifecycleChange?.("recovery");
    };

    const handleClick = (e: MouseEvent) => {
      if (!onClickCanvas || !container) return;
      const rect = container.getBoundingClientRect();
      const uv = new THREE.Vector2(
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height
      );
      // We pass a dummy or clock reference if accessible, or instanced clock
      onClickCanvas(uv, new THREE.Clock());
      onLifecycleChange?.("peak");
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("click", handleClick);

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("click", handleClick);
    };
  }, [onClickCanvas, onLifecycleChange]);

  // Main Three.js lifecycle setup
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    camera.position.z = 1;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: perf.gpuTier > 1,
        powerPreference: "high-performance",
      });
    } catch (e) {
      console.warn("AbyssCanvas: WebGL context creation failed", e);
      return;
    }

    renderer.setPixelRatio(perf.dpr);
    rendererRef.current = renderer;

    // 2. Geometry & Material
    const geometry = customGeometry || new THREE.PlaneGeometry(1, 1, subdivisions.x, subdivisions.y);

    const baseUniforms = {
      uTexture: { value: null },
      uTime: { value: 0.0 },
      uHover: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uAspect: { value: 1.0 },
      uQuality: { value: perf.tier === "high" ? 1.0 : perf.tier === "medium" ? 0.5 : 0.0 },
      ...uniforms,
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: baseUniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 3. Texture Loading
    const textureLoader = new THREE.TextureLoader();
    let isDisposed = false;

    const activeImage = imageSrc || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200";

    textureLoader.load(
      activeImage,
      (texture) => {
        if (isDisposed) {
          texture.dispose();
          return;
        }
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        material.uniforms.uTexture.value = texture;

        const imgW = texture.image.naturalWidth || texture.image.width || 500;
        const imgH = texture.image.naturalHeight || texture.image.height || 500;

        setImgDimensions({ width: imgW, height: imgH });
        imgDimensionsRef.current = { width: imgW, height: imgH };

        const rect = container.getBoundingClientRect();
        const newW = Math.max(rect.width, 1);
        const newH = Math.max(rect.height, 1);
        material.uniforms.uResolution.value.set(newW, newH);
        material.uniforms.uAspect.value = newW / newH;

        adjustMeshScale(newW, newH, imgW, imgH);
      },
      undefined,
      (err) => {
        console.error("AbyssCanvas: Failed to load texture", imageSrc, err);
      }
    );

    const adjustMeshScale = (w: number, h: number, imgW: number, imgH: number) => {
      const imgAspect = imgH / imgW;
      let finalW = w;
      let finalH = w * imgAspect;

      if (fit === "contain") {
        if (finalH > h) {
          finalH = h;
          finalW = h / imgAspect;
        }
      } else {
        // cover
        if (finalH < h) {
          finalH = h;
          finalW = h / imgAspect;
        }
      }

      mesh.scale.set(finalW / w, finalH / h, 1.0);
    };

    // 4. Sizing logic
    const handleResize = () => {
      if (!container || !renderer) return;
      const rect = container.getBoundingClientRect();
      const w = Math.max(rect.width, 1);
      const h = Math.max(rect.height, 1);

      renderer.setSize(w, h, false);
      material.uniforms.uResolution.value.set(w, h);
      material.uniforms.uAspect.value = w / h;

      const { width: imgW, height: imgH } = imgDimensionsRef.current;
      adjustMeshScale(w, h, imgW, imgH);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    handleResize();

    // IntersectionObserver to pause rendering when canvas is out of view
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isIntersecting.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // 5. Animation loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      // Skip render if offscreen to save battery & GPU
      if (!isIntersecting.current) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // Update pointer physics and damping
      updateMouse();
      updateScroll();

      // Read current mouse from hook
      const mState = mouseStateRef.current;
      targetMouse.current.copy(mState.position);

      // Lerp uniform hover & mouse coordinates
      currentHover.current = THREE.MathUtils.lerp(currentHover.current, targetHover.current, 0.08);

      material.uniforms.uTime.value = elapsedTime;
      material.uniforms.uHover.value = currentHover.current;
      material.uniforms.uMouse.value.lerp(targetMouse.current, 0.08);

      // Trigger user-provided tick Hook
      if (onAnimate) {
        onAnimate(material, clock, delta, perfRef.current);
      }

      renderer.render(scene, camera);
    };

    render();

    // 6. Cleanup
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      if (material.uniforms.uTexture.value) {
        material.uniforms.uTexture.value.dispose();
      }

      material.dispose();
      geometry.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      rendererRef.current = null;
    };
  }, [vertexShader, fragmentShader, imageSrc, fit]);

  // Dynamically update DPR when performance tier shifts
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setPixelRatio(perf.dpr);
    }
    if (materialRef.current && materialRef.current.uniforms.uQuality) {
      const q = perf.tier === "high" ? 1.0 : perf.tier === "medium" ? 0.5 : 0.0;
      materialRef.current.uniforms.uQuality.value = q;
    }
  }, [perf.dpr, perf.tier]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel || "Interactive Abyss visual canvas"}
      style={{
        ...(fit !== "cover" ? { aspectRatio: `${imgDimensions.width} / ${imgDimensions.height}` } : {}),
        ...style,
      }}
      className={`${fit === "cover" ? "w-full h-full max-w-none max-h-none" : "max-h-[68vh] max-w-[440px] w-full"} relative overflow-visible select-none pointer-events-auto group cursor-pointer ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};

export default AbyssCanvas;
