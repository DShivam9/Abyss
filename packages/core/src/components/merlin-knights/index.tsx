import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { VesselComponentProps } from "../../engine/types";
import displayFrag from "./shader.frag.glsl";
import passVert from "./shader.vert.glsl";

export const MerlinKnights: React.FC<VesselComponentProps> = ({
  imageSrc,
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

    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    
    // Orthographic Camera keeps the banner perfectly flat and crisp
    const aspect = width / height;
    const camera = new THREE.OrthographicCamera(
      -aspect,
      aspect,
      1.0,
      -1.0,
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
    const planeGeo = new THREE.PlaneGeometry(aspect * 2.0, 2.0, 96, 96);
    
    const displayMaterial = new THREE.ShaderMaterial({
      vertexShader: passVert,
      fragmentShader: displayFrag,
      uniforms: {
        tMap: { value: null },
        uHover: { value: 0.0 },
        uTime: { value: 0.0 },
        uAspect: { value: width / height },
        uAmbientColor: { value: new THREE.Vector3(0.25, 0.28, 0.38) }, // Cool room ambient shadow fill
      },
      transparent: true,
      depthWrite: true,
      depthTest: true,
    });
    const displayMesh = new THREE.Mesh(planeGeo, displayMaterial);
    scene.add(displayMesh);

    // 3. Load Image Texture
    const textureLoader = new THREE.TextureLoader();
    let loadedTexture: THREE.Texture | null = null;

    textureLoader.load(imageSrc, (texture) => {
      loadedTexture = texture;
      displayMaterial.uniforms.tMap.value = texture;

      const imgW = texture.image.width;
      const imgH = texture.image.height;
      setImgDimensions({ width: imgW, height: imgH });

      container.style.aspectRatio = `${imgW} / ${imgH}`;
      const newW = container.clientWidth;
      const newH = container.clientHeight;

      const newAspect = newW / newH;
      camera.left = -newAspect;
      camera.right = newAspect;
      camera.top = 1.0;
      camera.bottom = -1.0;
      camera.updateProjectionMatrix();
      
      renderer.setSize(newW, newH);
      displayMaterial.uniforms.uAspect.value = newAspect;

      // Fit the plane mesh to canvas aspect
      displayMesh.geometry.dispose();
      displayMesh.geometry = new THREE.PlaneGeometry(newAspect * 2.0, 2.0, 96, 96);
    });

    const handleResize = () => {
      const newW = container.clientWidth;
      const newH = container.clientHeight;

      const newAspect = newW / newH;
      camera.left = -newAspect;
      camera.right = newAspect;
      camera.top = 1.0;
      camera.bottom = -1.0;
      camera.updateProjectionMatrix();

      renderer.setSize(newW, newH);
      displayMaterial.uniforms.uAspect.value = newAspect;

      displayMesh.geometry.dispose();
      displayMesh.geometry = new THREE.PlaneGeometry(newAspect * 2.0, 2.0, 96, 96);
    };
    window.addEventListener("resize", handleResize);

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
      window.removeEventListener("resize", handleResize);

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
        aspectRatio: `${imgDimensions.width} / ${imgDimensions.height}`,
        ...style,
      }}
      className={`w-full relative overflow-hidden select-none pointer-events-auto cursor-pointer ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};

export default MerlinKnights;
