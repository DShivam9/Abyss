import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { VesselComponentProps } from "../../engine/types";
import displayFrag from "./shader.frag.glsl";
import displayVert from "./shader.display.vert.glsl";
import passVert from "./shader.vert.glsl";

// Simulation pass: advects the velocity field AND integrates a signed height
// field with spring dynamics, packing both into a single HalfFloat FBO.
//   rg = velocity (viscous flow, stored biased into [0,1])
//   b  = height        (signed: +dome / -carved channel)
//   a  = height velocity dh/dt (drives spring-damped overshoot on recovery)
const SIMULATION_FRAG = `
uniform sampler2D uVelocityTexture;
uniform vec2 uMouse;
uniform vec2 uForce;
uniform float uHover;
uniform float uTime;
varying vec2 vUv;

#define DAMPING 0.982
#define SPLAT_RADIUS 0.11
// Height field spring: pulls terrain back toward flat with a slight overshoot.
// Steady-state height under a resting cursor = forcing / SPRING_K, so keep K low
// enough that the dome reaches a genuinely visible amplitude (~0.6+).
#define SPRING_K 4.0
#define HEIGHT_DAMP 0.90
#define DT 0.016

void main() {
  vec2 uv = vUv;

  // --- Velocity field (viscous pour) ---
  vec2 prevVelocity = texture2D(uVelocityTexture, uv).rg - 0.5;
  vec2 advectedUv = uv - prevVelocity * 0.01;
  vec4 advected = texture2D(uVelocityTexture, advectedUv);
  vec2 velocity = advected.rg - 0.5;
  velocity *= DAMPING;

  // Read the (advected) height + its velocity so terrain flows with the fluid.
  float height = advected.b;
  float heightVel = advected.a;

  // Cursor proximity: soft radial force field (not a visible disc mask).
  float dist = distance(uv, uMouse);
  float splat = exp(-pow(dist / SPLAT_RADIUS, 2.0));

  velocity += uForce * splat * uHover * 0.12;

  // --- Height field forcing ---
  // Hovering still swells a dome; fast motion carves channels (signed by speed).
  float speed = length(uForce);
  float dome = splat * uHover * 2.6;                  // raise under a resting cursor
  float carve = splat * uHover * speed * 30.0;        // sink along fast strokes
  float forcing = dome - carve;

  // Spring integrator with overshoot: h'' = -k*h + forcing, damped velocity.
  heightVel += (-SPRING_K * height + forcing) * DT;
  heightVel *= HEIGHT_DAMP;
  height += heightVel * DT;
  height = clamp(height, -1.0, 1.0);

  gl_FragColor = vec4(velocity + 0.5, height, heightVel);
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
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mediaQuery.matches;
    const listener = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

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

    // Subdivided plane so the height field can physically displace vertices.
    // 128x128 ~= 16.6k verts: fine on desktop; lower for weaker GPUs if needed.
    const DISPLAY_SEGMENTS = 128;
    const displayGeometry = new THREE.PlaneGeometry(
      1,
      1,
      DISPLAY_SEGMENTS,
      DISPLAY_SEGMENTS
    );
    const displayMaterial = new THREE.ShaderMaterial({
      vertexShader: displayVert,
      fragmentShader: displayFrag,
      uniforms: {
        tMap: { value: null },
        uVelocityTexture: { value: writeRT.texture },
        uHover: { value: 0.0 },
        uTime: { value: 0.0 },
        uAspect: { value: width / height },
        uDisplacementScale: { value: 0.35 },
        uLightDir: { value: new THREE.Vector3(0.5, 0.7, 0.5).normalize() },
        uNormalStrength: { value: 12.0 },
        uSimTexel: { value: new THREE.Vector2(1 / simSize, 1 / simSize) },
      },
      transparent: true,
      // Enable screen-space derivatives (fwidth) for specular anti-aliasing.
      extensions: { derivatives: true },
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

      const activeTargetHover = prefersReducedMotion.current ? 0.0 : targetHover.current;
      isHovered.current = THREE.MathUtils.lerp(isHovered.current, activeTargetHover, 0.07);

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
      aria-label="Interactive ferrofluid topography canvas that sculpts terrain from cursor motion"
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