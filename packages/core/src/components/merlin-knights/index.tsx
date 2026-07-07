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
  const [windSpeed, setWindSpeed] = useState(0.8);

  // Interaction variables
  const isHovered = useRef(0.0);
  const targetHover = useRef(0.0);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  // Sync windSpeed state with shader uniform
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
        uWindSpeed: { value: windSpeed }, // Dynamic wind speed uniform
      },
      transparent: true,
      depthWrite: true,
      depthTest: true,
    });
    materialRef.current = displayMaterial;
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
      materialRef.current = null;

      // Free all WebGL context memories
      displayMesh.geometry.dispose();
      displayMaterial.dispose();
      renderer.dispose();
      if (loadedTexture) loadedTexture.dispose();
    };
  }, [imageSrc, imgDimensions.width, imgDimensions.height, onLifecycleChange]);

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      {/* 3D Canvas Viewport Container */}
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
      
      {/* Dynamic Wind Simulation Control Panel below the image */}
      <div 
        className="w-full max-w-[420px] flex flex-col gap-3 font-mono text-[9px] pointer-events-auto border border-neutral-200/50 bg-[#fafaf9] p-3.5 rounded-[4px]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
      >
        <style>{`
          .wind-slider-control::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 8px;
            height: 12px;
            background: #111113;
            cursor: pointer;
            border-radius: 0px;
          }
          .wind-slider-control::-moz-range-thumb {
            width: 8px;
            height: 12px;
            background: #111113;
            cursor: pointer;
            border: none;
            border-radius: 0px;
          }
        `}</style>
        
        <div className="flex justify-between items-center tracking-wider text-neutral-500 uppercase text-[8px] font-bold">
          <span>Wind Simulation</span>
          <span className="text-[#111113] font-bold">{windSpeed.toFixed(1)} m/s</span>
        </div>
        
        {/* Preset Buttons */}
        <div className="flex gap-2">
          {[
            { label: "Calm", value: 0.3 },
            { label: "Breeze", value: 0.8 },
            { label: "Gusty", value: 1.5 },
            { label: "Storm", value: 2.6 }
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setWindSpeed(preset.value)}
              className={`flex-1 py-1 px-2 border border-neutral-200 uppercase tracking-wider text-[8px] font-semibold transition-all duration-200 rounded-[2px] cursor-pointer ${
                Math.abs(windSpeed - preset.value) < 0.05
                  ? "bg-[#111113] text-white border-[#111113]"
                  : "bg-white text-neutral-500 hover:text-black hover:border-neutral-400"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Range Slider */}
        <div className="flex items-center mt-1">
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={windSpeed}
            onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
            className="wind-slider-control w-full h-[3px] bg-neutral-200 appearance-none cursor-pointer rounded-none outline-none"
            style={{
              WebkitAppearance: "none",
              background: `linear-gradient(to right, #111113 0%, #111113 ${(windSpeed - 0.2) / 2.8 * 100}%, #e5e5e5 ${(windSpeed - 0.2) / 2.8 * 100}%, #e5e5e5 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MerlinKnights;
