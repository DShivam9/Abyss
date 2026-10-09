"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import {
  FLUID_FRAGMENT_SHADER,
  FLUID_VERTEX_SHADER,
  FluidUniforms,
} from "./shaders/fluidShader";
import styles from "./not-found.module.css";

interface NotFoundCanvasProps {
  titleRef: React.RefObject<HTMLElement | null>;
  descRef: React.RefObject<HTMLElement | null>;
  actionsRef: React.RefObject<HTMLElement | null>;
}

export function NotFoundCanvas({
  titleRef,
  descRef,
  actionsRef,
}: NotFoundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl) return;

    // 1. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
      precision: "highp",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 2. Background Scene (Ambient Fluid Shader Quad)
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const fluidUniforms: FluidUniforms = {
      uTime: { value: 0.0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uExposure: { value: prefersReducedMotion ? 1.0 : 0.0 },
      uShockwavePos: { value: new THREE.Vector2(0.5, 0.5) },
      uShockwaveProgress: { value: 0.0 },
      uShockwaveAmp: { value: 0.0 },
    };

    const bgMaterial = new THREE.ShaderMaterial({
      uniforms: fluidUniforms as unknown as Record<string, THREE.IUniform>,
      vertexShader: FLUID_VERTEX_SHADER,
      fragmentShader: FLUID_FRAGMENT_SHADER,
      depthWrite: false,
      depthTest: false,
    });

    const bgPlaneGeom = new THREE.PlaneGeometry(2, 2);
    const bgMesh = new THREE.Mesh(bgPlaneGeom, bgMaterial);
    bgScene.add(bgMesh);

    // Mouse tracking
    const mouseTarget = { x: 0.5, y: 0.5 };
    const mouseSmooth = { x: 0.0, y: 0.0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouseTarget.x = e.clientX / window.innerWidth;
      mouseTarget.y = 1.0 - e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const clock = new THREE.Clock();

    // Stepped Trailing Depth Shadow Function for "404"
    const updateSteppedShadow = (p: number, mx = 0.0, my = 0.0) => {
      const titleEl = titleRef.current;
      if (!titleEl) return;
      const dx = mx * 1.6;
      const dy = my * 1.2;
      titleEl.style.textShadow = `
        ${-1 * dx * p}px ${(3 - 1 * dy) * p}px 0 #c2d3dd,
        ${-2 * dx * p}px ${(6 - 2 * dy) * p}px 0 #9cb4c2,
        ${-3 * dx * p}px ${(9 - 3 * dy) * p}px 0 #7895a6,
        ${-4 * dx * p}px ${(12 - 4 * dy) * p}px 0 #58778b,
        ${-5 * dx * p}px ${(15 - 5 * dy) * p}px 0 #3e5c70,
        ${-6 * dx * p}px ${(18 - 6 * dy) * p}px 0 #2a4456,
        ${-7 * dx * p}px ${(21 - 7 * dy) * p}px 0 #1b303f,
        ${-8 * dx * p}px ${(24 - 8 * dy) * p}px 0 #10202c,
        ${-9 * dx * p}px ${(27 - 9 * dy) * p}px 0 #09131c,
        ${-10 * dx * p}px ${(30 - 10 * dy) * p}px 0 #04090e,
        ${-14 * dx * p}px ${(42 - 14 * dy) * p}px 35px rgba(0, 0, 0, ${0.95 * p})
      `;
    };

    // Pre-warm WebGL pipeline
    renderer.compile(bgScene, bgCamera);

    // Animation progress
    const shadowAnim = { progress: prefersReducedMotion ? 1.0 : 0.0 };

    let tl: gsap.core.Timeline | null = null;

    if (prefersReducedMotion) {
      canvas.style.opacity = "1";
      updateSteppedShadow(1.0, 0, 0);
      if (titleRef.current) {
        titleRef.current.style.opacity = "1";
        titleRef.current.style.filter = "none";
        titleRef.current.style.transform = "none";
      }
      if (descRef.current) {
        descRef.current.style.opacity = "1";
        descRef.current.style.filter = "none";
        descRef.current.style.transform = "none";
      }
      if (actionsRef.current) {
        Array.from(actionsRef.current.children).forEach((child) => {
          (child as HTMLElement).style.opacity = "1";
          (child as HTMLElement).style.transform = "none";
        });
      }
    } else {
      gsap.set(canvas, { opacity: 1 });
      updateSteppedShadow(0, 0, 0);

      tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Step 1: Caustic Atmosphere Blooms (Smooth exposure)
      tl.to(
        fluidUniforms.uExposure,
        {
          value: 1.0,
          duration: 2.2,
          ease: "power2.inOut",
        },
        0.05
      );

      // Step 2: 404 Monolith Lands & Stepped Layers Smoothly Unfurl
      if (titleRef.current) {
        tl.to(
          titleRef.current,
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.0,
            ease: "power3.out",
          },
          0.25
        );
      }

      tl.to(
        shadowAnim,
        {
          progress: 1.0,
          duration: 2.4,
          ease: "elastic.out(1, 0.85)",
          onUpdate: () => updateSteppedShadow(shadowAnim.progress),
        },
        0.45
      );

      // Step 3: Editorial Copy & Links Unfold
      if (descRef.current) {
        tl.to(
          descRef.current,
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.0,
            ease: "power3.out",
          },
          0.7
        );
      }

      if (actionsRef.current) {
        tl.to(
          actionsRef.current.children,
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: "power2.out",
          },
          0.85
        );
      }
    }

    // 3. Render Loop
    let animationFrameId: number;

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);
      const elapsed = clock.getElapsedTime();

      // Smooth cursor interpolation
      fluidUniforms.uMouse.value.x +=
        (mouseTarget.x - fluidUniforms.uMouse.value.x) * 0.04;
      fluidUniforms.uMouse.value.y +=
        (mouseTarget.y - fluidUniforms.uMouse.value.y) * 0.04;

      mouseSmooth.x +=
        ((mouseTarget.x - 0.5) * 2.0 - mouseSmooth.x) * 0.04;
      mouseSmooth.y +=
        ((mouseTarget.y - 0.5) * 2.0 - mouseSmooth.y) * 0.04;

      // Dynamic reactive 404 extrusion plates
      updateSteppedShadow(shadowAnim.progress, mouseSmooth.x, mouseSmooth.y);

      // Background Fluid Shader
      fluidUniforms.uTime.value = elapsed;

      // Render ambient fluid directly to screen
      renderer.render(bgScene, bgCamera);
    };

    renderLoop();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      fluidUniforms.uResolution.value.set(w, h);
    };

    window.addEventListener("resize", handleResize);

    // 4. Complete Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (tl) tl.kill();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      bgPlaneGeom.dispose();
      bgMaterial.dispose();
      renderer.dispose();
    };
  }, [titleRef, descRef, actionsRef]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
