import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useVesselMouse } from "./useVesselMouse";
import { useVesselScroll } from "./useVesselScroll";
import { VesselComponentProps } from "./types";

export interface VesselCanvasProps extends VesselComponentProps {
  vertexShader: string;
  fragmentShader: string;
  uniforms?: Record<string, any>;
  subdivisions?: { x: number; y: number };
  onClickCanvas?: (uv: THREE.Vector2, clock: THREE.Clock) => void;
  onAnimate?: (material: THREE.ShaderMaterial, clock: THREE.Clock) => void;
  ariaLabel?: string;
}

export const VesselCanvas: React.FC<VesselCanvasProps> = ({
  imageSrc,
  vertexShader,
  fragmentShader,
  uniforms = {},
  subdivisions = { x: 1, y: 1 },
  className = "",
  style,
  onLifecycleChange,
  onClickCanvas,
  onAnimate,
  ariaLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgDimensions, setImgDimensions] = useState({ width: 500, height: 500 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  const { stateRef: mouseStateRef, updateMouse } = useVesselMouse(containerRef);
  const { updateScroll } = useVesselScroll(containerRef);

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
      if (onLifecycleChange) onLifecycleChange("discovery");
    };

    const handleMouseLeave = () => {
      targetHover.current = 0.0;
      targetMouse.current.set(0.5, 0.5);
      if (onLifecycleChange) onLifecycleChange("recovery");
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMouse.current.set(x, y);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (onClickCanvas) {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1.0 - (e.clientY - rect.top) / rect.height;
        onClickCanvas(new THREE.Vector2(x, y), clock.current);
      }
    };

    // Touch support (Issue 15)
    const handleTouchStart = (e: TouchEvent) => {
      targetHover.current = 1.0;
      if (onLifecycleChange) onLifecycleChange("discovery");
      if (e.touches.length === 0) return;
      const rect = container.getBoundingClientRect();
      const x = (e.touches[0].clientX - rect.left) / rect.width;
      const y = 1.0 - (e.touches[0].clientY - rect.top) / rect.height;
      targetMouse.current.set(x, y);

      if (onClickCanvas) {
        onClickCanvas(new THREE.Vector2(x, y), clock.current);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const rect = container.getBoundingClientRect();
      const x = (e.touches[0].clientX - rect.left) / rect.width;
      const y = 1.0 - (e.touches[0].clientY - rect.top) / rect.height;
      targetMouse.current.set(x, y);
    };

    const handleTouchEnd = () => {
      targetHover.current = 0.0;
      targetMouse.current.set(0.5, 0.5);
      if (onLifecycleChange) onLifecycleChange("recovery");
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mousedown", handleMouseDown);

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mousedown", handleMouseDown);

      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onClickCanvas, onLifecycleChange]);

  const clock = useRef(new THREE.Clock());

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000
    );
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const textureLoader = new THREE.TextureLoader();

    let planeGeometry: THREE.BufferGeometry = new THREE.PlaneGeometry(1, 1, subdivisions.x, subdivisions.y);
    planeGeometry = planeGeometry.toNonIndexed();

    // Explicitly merge user-provided uniforms with standard engine uniforms
    const materialUniforms: Record<string, THREE.IUniform> = {
      tMap: { value: null },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0.0 },
      uHover: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uAspect: { value: width / height },
    };

    // Add extra uniforms passed from component
    Object.keys(uniforms).forEach((key) => {
      materialUniforms[key] = { value: uniforms[key] };
    });

    const material = new THREE.ShaderMaterial({
      uniforms: materialUniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const mesh = new THREE.Mesh(planeGeometry, material);
    scene.add(mesh);

    let loadedTexture: THREE.Texture | null = null;

    textureLoader.load(
      imageSrc,
      (texture) => {
        loadedTexture = texture;
        material.uniforms.tMap.value = texture;
        const imgW = texture.image.width;
        const imgH = texture.image.height;
        setImgDimensions({ width: imgW, height: imgH });

        // Update DOM aspect ratio directly and sync Three.js renderer size
        container.style.aspectRatio = `${imgW} / ${imgH}`;
        const newW = container.clientWidth;
        const newH = container.clientHeight;

        camera.left = newW / -2;
        camera.right = newW / 2;
        camera.top = newH / 2;
        camera.bottom = newH / -2;
        camera.updateProjectionMatrix();

        renderer.setSize(newW, newH);
        material.uniforms.uResolution.value.set(newW, newH);
        material.uniforms.uAspect.value = newW / newH;

        adjustMeshScale(newW, newH, imgW, imgH);
      },
      undefined,
      (err) => {
        console.error("VesselCanvas: Failed to load texture", imageSrc, err);
      }
    );

    const adjustMeshScale = (w: number, h: number, imgW: number, imgH: number) => {
      const imgAspect = imgH / imgW;
      let finalW = w;
      let finalH = w * imgAspect;

      if (finalH > h) {
        finalH = h;
        finalW = h / imgAspect;
      }
      mesh.scale.set(finalW, finalH, 1.0);
    };

    const handleResize = () => {
      const newW = container.clientWidth;
      const newH = container.clientHeight;

      camera.left = newW / -2;
      camera.right = newW / 2;
      camera.top = newH / 2;
      camera.bottom = newH / -2;
      camera.updateProjectionMatrix();

      renderer.setSize(newW, newH);
      material.uniforms.uResolution.value.set(newW, newH);
      material.uniforms.uAspect.value = newW / newH;

      adjustMeshScale(newW, newH, imgDimensions.width, imgDimensions.height);
    };
    window.addEventListener("resize", handleResize);

    // IntersectionObserver to pause/resume rendering (Issue 7)
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(container);

    let animationId: number;
    clock.current.start();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (!isIntersecting.current) return;

      const delta = clock.current.getDelta();
      const elapsed = clock.current.getElapsedTime();

      // Update input states
      updateMouse(delta);
      updateScroll();

      // Smoothly update hover value (override to 0.0 if prefersReducedMotion is active)
      const activeTargetHover = prefersReducedMotion ? 0.0 : targetHover.current;
      currentHover.current = THREE.MathUtils.lerp(
        currentHover.current,
        activeTargetHover,
        0.08
      );

      // Sync uniforms
      material.uniforms.uMouse.value.copy(mouseStateRef.current.position);
      material.uniforms.uVelocity.value.copy(mouseStateRef.current.velocity);
      material.uniforms.uHover.value = currentHover.current;
      material.uniforms.uTime.value = elapsed;

      // Lifecycle detection
      if (onLifecycleChange) {
        if (currentHover.current > 0.95 && targetHover.current === 1.0) {
          onLifecycleChange("buildUp");
        }
      }

      // Allow component-specific updates in animation ticker
      if (onAnimate) {
        onAnimate(material, clock.current);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();

      // Proper resource cleanup (Issue 6)
      planeGeometry.dispose();
      material.dispose();
      renderer.dispose();
      if (loadedTexture) loadedTexture.dispose();
    };
  }, [vertexShader, fragmentShader, subdivisions.x, subdivisions.y, imageSrc]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel || "Interactive Vessel visual shader canvas"}
      style={{
        aspectRatio: `${imgDimensions.width} / ${imgDimensions.height}`,
        ...style,
      }}
      className={`w-full relative overflow-hidden select-none pointer-events-auto ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};

export default VesselCanvas;
