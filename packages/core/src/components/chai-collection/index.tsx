import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { VesselComponentProps } from "../../engine/types";

export const ChaiCollection: React.FC<VesselComponentProps> = ({
  imageSrc,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgDimensions, setImgDimensions] = useState({ width: 500, height: 500 });

  // Interaction vectors
  const targetRotation = useRef(new THREE.Vector2(0, 0));
  const currentRotation = useRef(new THREE.Vector2(0, 0));
  const lastMousePos = useRef(new THREE.Vector2(0, 0));
  const isDragging = useRef(false);
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
      if (!isDragging.current) {
        targetRotation.current.set(0, 0); // Return to front
      }
      if (onLifecycleChange) onLifecycleChange("recovery");
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMousePos.current.set(e.clientX, e.clientY);
      if (onLifecycleChange) onLifecycleChange("buildUp");
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        lastMousePos.current.set(e.clientX, e.clientY);

        // Apply torque forces directly to target rotation
        targetRotation.current.x += deltaY * 0.01;
        targetRotation.current.y += deltaX * 0.01;
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Touch support
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      isDragging.current = true;
      targetHover.current = 1.0;
      lastMousePos.current.set(e.touches[0].clientX, e.touches[0].clientY);
      if (onLifecycleChange) onLifecycleChange("discovery");
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging.current && e.touches.length > 0) {
        const deltaX = e.touches[0].clientX - lastMousePos.current.x;
        const deltaY = e.touches[0].clientY - lastMousePos.current.y;
        lastMousePos.current.set(e.touches[0].clientX, e.touches[0].clientY);

        targetRotation.current.x += deltaY * 0.01;
        targetRotation.current.y += deltaX * 0.01;
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleMouseUp);

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleMouseUp);
    };
  }, [onLifecycleChange]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    
    // Perspective camera gives realistic depth to the crystal geometry
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // 2. Setup Lighting for transmission reflections
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xaaccff, 1.2);
    rimLight.position.set(-5, -3, -2);
    scene.add(rimLight);

    // 3. Create background quad to display image
    const bgGeometry = new THREE.PlaneGeometry(1, 1);
    const bgMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
    });
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    // Position slightly behind the crystal
    bgMesh.position.z = -1.5;
    scene.add(bgMesh);

    // 4. Create Refractive 3D Triangle Prism Crystal
    // An Icosahedron with detail 0 has 20 triangular faces
    const crystalGeometry = new THREE.IcosahedronGeometry(1.2, 0);
    
    // Premium physical material simulates refractive glass / diamond
    const crystalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.02,
      ior: 2.42, // Diamond-like refractive index
      transmission: 1.0, // Fully glass transmissive
      thickness: 1.6, // Refractive optical thickness
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      specularIntensity: 1.0,
      transparent: true,
    });

    const crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial);
    scene.add(crystalMesh);

    // 5. Load Image Texture
    const textureLoader = new THREE.TextureLoader();
    let loadedTexture: THREE.Texture | null = null;

    textureLoader.load(imageSrc, (texture) => {
      loadedTexture = texture;
      bgMaterial.map = texture;
      bgMaterial.needsUpdate = true;

      const imgW = texture.image.width;
      const imgH = texture.image.height;
      setImgDimensions({ width: imgW, height: imgH });

      container.style.aspectRatio = `${imgW} / ${imgH}`;
      const newW = container.clientWidth;
      const newH = container.clientHeight;

      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);

      // Fit background quad to viewport bounds
      const fitPlaneToView = () => {
        const aspect = newW / newH;
        // Compute frustum height at bgMesh depth
        const dist = camera.position.z - bgMesh.position.z;
        const vFOV = (camera.fov * Math.PI) / 180;
        const frustumH = 2 * Math.tan(vFOV / 2) * dist;
        const frustumW = frustumH * aspect;

        // Scale background plane to fill scene frustum
        bgMesh.scale.set(frustumW, frustumH, 1.0);
      };

      fitPlaneToView();
    });

    const handleResize = () => {
      const newW = container.clientWidth;
      const newH = container.clientHeight;

      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);

      const dist = camera.position.z - bgMesh.position.z;
      const vFOV = (camera.fov * Math.PI) / 180;
      const frustumH = 2 * Math.tan(vFOV / 2) * dist;
      const frustumW = frustumH * (newW / newH);
      bgMesh.scale.set(frustumW, frustumH, 1.0);
    };
    window.addEventListener("resize", handleResize);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      isHovered.current = THREE.MathUtils.lerp(isHovered.current, targetHover.current, 0.08);

      // Smoothly update crystal rotations with spring torque
      if (!isDragging.current) {
        // Slow ambient spin when idle
        const time = clock.getElapsedTime();
        targetRotation.current.x = Math.sin(time * 0.4) * 0.25;
        targetRotation.current.y = time * 0.15;
      }

      // Dynamic interpolation for springy rotation feel
      const rx = THREE.MathUtils.lerp(currentRotation.current.x, targetRotation.current.x, 0.08);
      const ry = THREE.MathUtils.lerp(currentRotation.current.y, targetRotation.current.y, 0.08);

      currentRotation.current.set(rx, ry);
      crystalMesh.rotation.set(rx, ry, 0);

      // Modulate crystal roughness dynamically based on drag velocity
      if (isDragging.current) {
        crystalMaterial.roughness = THREE.MathUtils.lerp(crystalMaterial.roughness, 0.15, 0.1);
      } else {
        crystalMaterial.roughness = THREE.MathUtils.lerp(crystalMaterial.roughness, 0.02, 0.1);
      }

      renderer.render(scene, camera);

      if (onLifecycleChange && isHovered.current > 0.95 && targetHover.current === 1.0) {
        onLifecycleChange("buildUp");
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);

      // Clean up resources
      bgGeometry.dispose();
      bgMaterial.dispose();
      crystalGeometry.dispose();
      crystalMaterial.dispose();
      renderer.dispose();
      if (loadedTexture) loadedTexture.dispose();
    };
  }, [imageSrc, imgDimensions.width, imgDimensions.height, onLifecycleChange]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="3D Icosahedron refractive crystal prism lens showcase"
      style={{
        aspectRatio: `${imgDimensions.width} / ${imgDimensions.height}`,
        ...style,
      }}
      className={`w-full relative overflow-hidden select-none pointer-events-auto cursor-grab active:cursor-grabbing ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};

export default ChaiCollection;