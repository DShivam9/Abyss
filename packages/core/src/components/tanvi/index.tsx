import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { VesselComponentProps } from "../../engine/types";
import displayFrag from "./shader.frag.glsl";
import passVert from "./shader.vert.glsl";

// Shader to advect velocity and apply cursor force splats into the FBO ping-pong buffer
const SIMULATION_FRAG = `
uniform sampler2D uVelocityTexture;
uniform vec2 uMouse;
uniform vec2 uForce;
uniform float uHover;
uniform float uTime;
varying vec2 vUv;

#define DAMPING 0.982
#define SPLAT_RADIUS 0.08

void main() {
  vec2 uv = vUv;
  
  // 1. Read previous velocity (mapped from [0, 1] back to [-1, 1])
  vec2 prevVelocity = texture2D(uVelocityTexture, uv).rg - 0.5;
  
  // 2. Advect: sample velocity at uv minus velocity displacement
  vec2 advectedUv = uv - prevVelocity * 0.01;
  vec2 velocity = texture2D(uVelocityTexture, advectedUv).rg - 0.5;
  
  // 3. Apply damping (viscous friction decay)
  velocity *= DAMPING;
  
  // 4. Splat: add cursor velocity force within radial proximity
  float dist = distance(uv, uMouse);
  float splat = exp(-pow(dist / SPLAT_RADIUS, 2.0));
  velocity += uForce * splat * uHover * 0.12;
  
  // Map back to [0, 1] for texture storage
  gl_FragColor = vec4(velocity + 0.5, 0.0, 1.0);
}
`;

export const Tanvi: React.FC<VesselComponentProps> = ({
  imageSrc,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgDimensions, setImgDimensions] = useState({ width: 500, height: 500 });

  // Event interaction states
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const lastMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const force = useRef(new THREE.Vector2(0, 0));
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
      targetMouse.current.set(0.5, 0.5);
      if (onLifecycleChange) onLifecycleChange("recovery");
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMouse.current.set(x, y);
    };

    const handleTouchStart = (e: TouchEvent) => {
      targetHover.current = 1.0;
      if (onLifecycleChange) onLifecycleChange("discovery");
      if (e.touches.length === 0) return;
      const rect = container.getBoundingClientRect();
      const x = (e.touches[0].clientX - rect.left) / rect.width;
      const y = 1.0 - (e.touches[0].clientY - rect.top) / rect.height;
      targetMouse.current.set(x, y);
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

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mousemove", handleMouseMove);

      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onLifecycleChange]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Simulation grid size for performance and fluid smoothness
    const simSize = 256;
    let readRT = new THREE.WebGLRenderTarget(simSize, simSize, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
    });
    let writeRT = readRT.clone();

    // 1. Setup Simulation Orthographic Scene
    const simScene = new THREE.Scene();
    const simCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    simCamera.position.z = 1;

    const simGeometry = new THREE.PlaneGeometry(1, 1);
    const simMaterial = new THREE.ShaderMaterial({
      vertexShader: passVert,
      fragmentShader: SIMULATION_FRAG,
      uniforms: {
        uVelocityTexture: { value: readRT.texture },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uForce: { value: new THREE.Vector2(0, 0) },
        uHover: { value: 0.0 },
        uTime: { value: 0.0 },
      },
      depthWrite: false,
      depthTest: false,
    });
    const simMesh = new THREE.Mesh(simGeometry, simMaterial);
    simScene.add(simMesh);

    // 2. Setup Display Scene
    const displayScene = new THREE.Scene();
    const displayCamera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000
    );
    displayCamera.position.z = 100;

    const displayGeometry = new THREE.PlaneGeometry(1, 1);
    const displayMaterial = new THREE.ShaderMaterial({
      vertexShader: passVert,
      fragmentShader: displayFrag,
      uniforms: {
        tMap: { value: null },
        uVelocityTexture: { value: writeRT.texture },
        uHover: { value: 0.0 },
        uTime: { value: 0.0 },
        uAspect: { value: width / height },
      },
      transparent: true,
    });
    const displayMesh = new THREE.Mesh(displayGeometry, displayMaterial);
    displayScene.add(displayMesh);

    // 3. Load Texture
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

      displayCamera.left = newW / -2;
      displayCamera.right = newW / 2;
      displayCamera.top = newH / 2;
      displayCamera.bottom = newH / -2;
      displayCamera.updateProjectionMatrix();

      renderer.setSize(newW, newH);
      displayMaterial.uniforms.uAspect.value = newW / newH;

      const imgAspect = imgH / imgW;
      let finalW = newW;
      let finalH = newW * imgAspect;
      if (finalH > newH) {
        finalH = newH;
        finalW = newH / imgAspect;
      }
      displayMesh.scale.set(finalW, finalH, 1.0);
    });

    const handleResize = () => {
      const newW = container.clientWidth;
      const newH = container.clientHeight;

      displayCamera.left = newW / -2;
      displayCamera.right = newW / 2;
      displayCamera.top = newH / 2;
      displayCamera.bottom = newH / -2;
      displayCamera.updateProjectionMatrix();

      renderer.setSize(newW, newH);
      displayMaterial.uniforms.uAspect.value = newW / newH;

      const imgAspect = imgDimensions.height / imgDimensions.width;
      let finalW = newW;
      let finalH = newW * imgAspect;
      if (finalH > newH) {
        finalH = newH;
        finalW = newH / imgAspect;
      }
      displayMesh.scale.set(finalW, finalH, 1.0);
    };
    window.addEventListener("resize", handleResize);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Lerp mouse and compute drag force vectors
      mouse.current.lerp(targetMouse.current, 0.08);
      force.current.subVectors(mouse.current, lastMouse.current);
      lastMouse.current.copy(mouse.current);

      isHovered.current = THREE.MathUtils.lerp(isHovered.current, targetHover.current, 0.07);

      // A. Update Simulation pass
      simMaterial.uniforms.uVelocityTexture.value = readRT.texture;
      simMaterial.uniforms.uMouse.value.copy(mouse.current);
      simMaterial.uniforms.uForce.value.copy(force.current);
      simMaterial.uniforms.uHover.value = isHovered.current;
      simMaterial.uniforms.uTime.value = elapsed;

      renderer.setRenderTarget(writeRT);
      renderer.render(simScene, simCamera);

      // Ping-pong targets
      const temp = readRT;
      readRT = writeRT;
      writeRT = temp;

      // B. Update Display pass
      displayMaterial.uniforms.uVelocityTexture.value = readRT.texture;
      displayMaterial.uniforms.uHover.value = isHovered.current;
      displayMaterial.uniforms.uTime.value = elapsed;

      renderer.setRenderTarget(null);
      renderer.render(displayScene, displayCamera);

      if (onLifecycleChange && isHovered.current > 0.95 && targetHover.current === 1.0) {
        onLifecycleChange("buildUp");
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);

      // Cleanup WebGL resources
      simGeometry.dispose();
      simMaterial.dispose();
      displayGeometry.dispose();
      displayMaterial.dispose();
      readRT.dispose();
      writeRT.dispose();
      renderer.dispose();
      if (loadedTexture) loadedTexture.dispose();
    };
  }, [imageSrc, imgDimensions.width, imgDimensions.height, onLifecycleChange]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Interactive Molten Pour fluid dynamics paint canvas"
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

export default Tanvi;