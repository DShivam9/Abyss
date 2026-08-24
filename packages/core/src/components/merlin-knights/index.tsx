import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { MerlinKnightsProps } from "./types";
import displayFrag from "./shader.frag.glsl";
import passVert from "./shader.vert.glsl";

export const MerlinKnights: React.FC<MerlinKnightsProps> = ({
  imageSrc,
  windSpeed = 0.8,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgDimensions, setImgDimensions] = useState({ width: 500, height: 500 });

  // Interaction variables
  const isHovered = useRef(0.0);
  const targetHover = useRef(0.0);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  // Sync windSpeed prop with shader uniform
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uWindSpeed.value = windSpeed;
    }
  }, [windSpeed]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseEnter = () => {
      targetHover.current = 1.0;
      if (onLifecycleChange) onLifecycleChange("discovery");
    };

    const handleMouseLeave = () => {
      targetHover.current = 0.0;
      if (onLifecycleChange) onLifecycleChange("recovery");
    };

    const handleTouchStart = () => {
      targetHover.current = 1.0;
      if (onLifecycleChange) onLifecycleChange("discovery");
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleMouseLeave);

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleMouseLeave);
    };
  }, [onLifecycleChange]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || 500;
    let height = container.clientHeight || 500;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    
    // Orthographic Camera with 15% padding so banner bottom tip and wind waves never get frustum-clipped
    const aspect = height > 0 ? width / height : 1.0;
    const padding = 1.15;
    const camera = new THREE.OrthographicCamera(
      -aspect * padding,
      aspect * padding,
      padding,
      -padding,
      0.1,
      100
    );
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Waving Mesh Plane Setup
    const safeAspect = isNaN(aspect) || aspect <= 0 ? 1.0 : aspect;
    const planeGeo = new THREE.PlaneGeometry(safeAspect * 2.0, 2.0, 96, 96);
    
    const safeWind = typeof windSpeed === "number" && !isNaN(windSpeed) ? windSpeed : 0.8;
    const displayMaterial = new THREE.ShaderMaterial({
      vertexShader: passVert,
      fragmentShader: displayFrag,
      uniforms: {
        tMap: { value: null },
        uHover: { value: 0.0 },
        uTime: { value: 0.0 },
        uAspect: { value: safeAspect },
        uAmbientColor: { value: new THREE.Vector3(0.25, 0.28, 0.38) }, // Cool room ambient shadow fill
        uWindSpeed: { value: safeWind }, // Dynamic wind speed uniform
      },
      transparent: true,
      depthWrite: true,
      depthTest: true,
    });
    materialRef.current = displayMaterial;
    const displayMesh = new THREE.Mesh(planeGeo, displayMaterial);
    scene.add(displayMesh);

    const updateCanvasSize = (w: number, h: number) => {
      if (w <= 0 || h <= 0) return;
      const calcAspect = w / h;
      const newAspect = isNaN(calcAspect) || calcAspect <= 0 ? 1.0 : calcAspect;

      camera.left = -newAspect * padding;
      camera.right = newAspect * padding;
      camera.top = padding;
      camera.bottom = -padding;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      displayMaterial.uniforms.uAspect.value = newAspect;

      displayMesh.geometry.dispose();
      displayMesh.geometry = new THREE.PlaneGeometry(newAspect * 2.0, 2.0, 96, 96);
    };

    // 3. Load Image Texture
    const textureLoader = new THREE.TextureLoader();
    let loadedTexture: THREE.Texture | null = null;

    textureLoader.load(imageSrc || "", (texture) => {
      loadedTexture = texture;
      displayMaterial.uniforms.tMap.value = texture;

      const imgW = texture.image.width || 500;
      const imgH = texture.image.height || 500;
      setImgDimensions({ width: imgW, height: imgH });

      container.style.aspectRatio = `${imgW} / ${imgH}`;
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: rw, height: rh } = entry.contentRect;
        if (rw > 0 && rh > 0) {
          updateCanvasSize(rw, rh);
        }
      }
    });
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Smoothly interpolate hover state
      isHovered.current = THREE.MathUtils.lerp(isHovered.current, targetHover.current, 0.065);

      // Render Final Display Pass
      displayMaterial.uniforms.uHover.value = isHovered.current;
      displayMaterial.uniforms.uTime.value = elapsed;

      renderer.render(scene, camera);

      if (onLifecycleChange && isHovered.current > 0.95 && targetHover.current === 1.0) {
        onLifecycleChange("buildUp");
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      materialRef.current = null;

      // Free all WebGL context memories
      displayMesh.geometry.dispose();
      displayMaterial.dispose();
      renderer.dispose();
      if (loadedTexture) loadedTexture.dispose();
    };
  }, [imageSrc, imgDimensions.width, imgDimensions.height, onLifecycleChange]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="3D medieval wall banner tapestry painting. Hovering transforms it into an alchemical gold-embroidered tapestry."
      style={{
        width: "340px",
        maxWidth: "85vw",
        maxHeight: "54vh",
        aspectRatio: `${imgDimensions.width} / ${imgDimensions.height}`,
        ...style,
      }}
      className={`relative overflow-visible select-none pointer-events-auto cursor-pointer ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};

export default MerlinKnights;
