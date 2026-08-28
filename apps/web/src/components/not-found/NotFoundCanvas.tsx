"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ABYSS_LOGO_REL_COMMANDS } from "@/components/layout/abyssLogoPath";
import {
  FLUID_FRAGMENT_SHADER,
  FLUID_VERTEX_SHADER,
  FluidUniforms,
} from "./shaders/fluidShader";
import {
  CHROME_FRAGMENT_SHADER,
  CHROME_VERTEX_SHADER,
  ChromeUniforms,
} from "./shaders/chromeHybridShader";
import styles from "./not-found.module.css";

interface NotFoundCanvasProps {
  navRef?: React.RefObject<HTMLElement | null>;
  titleRef: React.RefObject<HTMLElement | null>;
  descRef: React.RefObject<HTMLElement | null>;
  actionsRef: React.RefObject<HTMLElement | null>;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export function NotFoundCanvas({
  navRef,
  titleRef,
  descRef,
  actionsRef,
  anchorRef,
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

    // 1. Unified WebGL Renderer
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

    // 2. Background Scene (Fluid Shader Quad)
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const fluidUniforms: FluidUniforms = {
      uTime: { value: 0.0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uExposure: { value: prefersReducedMotion ? 1.0 : 0.0 },
      uShockwavePos: { value: new THREE.Vector2(0.5, 0.35) },
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

    // 3. 3D Floating Celestial Star Scene (Perspective Camera)
    const mainScene = new THREE.Scene();
    const mainCamera = new THREE.PerspectiveCamera(
      34,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    mainCamera.position.set(0, 0, 9.5);

    const dpr = Math.min(window.devicePixelRatio, 2);
    const renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth * dpr,
      window.innerHeight * dpr,
      {
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      }
    );

    // Build Shape from shared coordinate path
    const scale = 0.024;
    const logoShape = new THREE.Shape();
    let curX = ABYSS_LOGO_REL_COMMANDS[0][0];
    let curY = ABYSS_LOGO_REL_COMMANDS[0][1];

    logoShape.moveTo((curX - 50) * scale, -(curY - 50) * scale);
    for (let i = 1; i < ABYSS_LOGO_REL_COMMANDS.length; i++) {
      curX += ABYSS_LOGO_REL_COMMANDS[i][0];
      curY += ABYSS_LOGO_REL_COMMANDS[i][1];
      logoShape.lineTo((curX - 50) * scale, -(curY - 50) * scale);
    }
    logoShape.closePath();

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: 0.18,
      bevelEnabled: true,
      bevelThickness: 0.18,
      bevelSize: 0.12,
      bevelSegments: 16,
      curveSegments: 32,
    };

    const logoGeometry = new THREE.ExtrudeGeometry(logoShape, extrudeSettings);
    logoGeometry.center();
    logoGeometry.computeVertexNormals();

    const logoGroup = new THREE.Group();
    mainScene.add(logoGroup);

    const chromeUniforms: ChromeUniforms = {
      uSceneTexture: { value: renderTarget.texture },
      uResolution: fluidUniforms.uResolution,
      uRefractPower: { value: prefersReducedMotion ? 0.12 : 0.85 },
      uIceColor: { value: new THREE.Color(0x9be5fb) },
      uExposure: fluidUniforms.uExposure,
      uClipActive: { value: prefersReducedMotion ? 0.0 : 1.0 },
      uWaterLevel: { value: 0.0 },
    };

    const chromeHybridMaterial = new THREE.ShaderMaterial({
      uniforms: chromeUniforms as unknown as Record<string, THREE.IUniform>,
      vertexShader: CHROME_VERTEX_SHADER,
      fragmentShader: CHROME_FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const logoMesh = new THREE.Mesh(logoGeometry, chromeHybridMaterial);
    logoGroup.add(logoMesh);

    // Mouse tracking & Spatial anchor positioning
    const mouseTarget = { x: 0.5, y: 0.5 };
    const mouseSmooth = { x: 0.0, y: 0.0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouseTarget.x = e.clientX / window.innerWidth;
      mouseTarget.y = 1.0 - e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const clock = new THREE.Clock();
    const cachedWorldPos = new THREE.Vector3(0, 0, 0);
    const tempV = new THREE.Vector3();

    const updateLogoPosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      fluidUniforms.uShockwavePos.value.set(
        cx / window.innerWidth,
        1.0 - cy / window.innerHeight
      );

      const ndcX = (cx / window.innerWidth) * 2 - 1;
      const ndcY = -(cy / window.innerHeight) * 2 + 1;

      tempV.set(ndcX, ndcY, 0.5).unproject(mainCamera);
      tempV.sub(mainCamera.position).normalize();
      const distance = -mainCamera.position.z / tempV.z;
      cachedWorldPos.copy(mainCamera.position).addScaledVector(tempV, distance);
      logoGroup.position.x = cachedWorldPos.x;
      logoGroup.position.y = cachedWorldPos.y - 0.65;
    };

    updateLogoPosition();
    if (document.fonts) {
      document.fonts.ready.then(() => updateLogoPosition());
    }

    // Stepped Trailing Depth Shadow Function
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

    // Pre-warm WebGL pipelines
    renderer.compile(bgScene, bgCamera);
    renderer.compile(mainScene, mainCamera);

    // Dynamic animation parameters
    const starZ = { value: prefersReducedMotion ? 0.0 : -0.9 };
    const shadowAnim = { progress: prefersReducedMotion ? 1.0 : 0.0 };
    const spinWeight = { value: prefersReducedMotion ? 1.0 : 0.0 };

    let tl: gsap.core.Timeline | null = null;

    if (prefersReducedMotion) {
      canvas.style.opacity = "1";
      updateSteppedShadow(1.0, 0, 0);
      if (navRef?.current) {
        navRef.current.style.opacity = "1";
        navRef.current.style.transform = "none";
      }
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

      // Step 1: Caustic Atmosphere Blooms (Slow, majestic exposure)
      tl.to(
        fluidUniforms.uExposure,
        {
          value: 1.0,
          duration: 2.2,
          ease: "power2.inOut",
        },
        0.05
      );

      // Nav unfolds gracefully
      if (navRef?.current) {
        tl.to(
          navRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power2.out",
          },
          0.15
        );
      }

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
      )
        // Step 3: 3D Star Progressively Pierces & Rises from Liquid
        .to(
          starZ,
          {
            value: 0.0,
            duration: 1.8,
            ease: "power2.out",
          },
          0.4
        )
        // Step 4: Fluid Caustic Shockwave Fires as Spikes Penetrate Surface (t = 1.0s)
        .to(
          fluidUniforms.uShockwaveAmp,
          {
            value: 0.5,
            duration: 0.15,
            ease: "power1.out",
          },
          1.0
        )
        .to(
          fluidUniforms.uShockwaveProgress,
          {
            value: 2.8,
            duration: 2.6,
            ease: "power2.out",
          },
          1.0
        )
        .to(
          fluidUniforms.uShockwaveAmp,
          {
            value: 0.0,
            duration: 2.0,
            ease: "sine.inOut",
          },
          1.2
        )
        .to(
          chromeUniforms.uRefractPower,
          {
            value: 0.12,
            duration: 1.4,
            ease: "power2.out",
          },
          1.0
        )
        .to(
          chromeUniforms.uClipActive,
          {
            value: 0.0,
            duration: 0.1,
          },
          2.2
        );

      // Step 5: Editorial Copy & Links Unfold
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
          0.9
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
          1.05
        );
      }

      // Step 6: Delayed Turntable Spin Begins Smoothly after Full Arrival
      tl.to(
        spinWeight,
        {
          value: 1.0,
          duration: 1.8,
          ease: "sine.inOut",
        },
        2.4
      );
    }

    // 4. Render Loop
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

      // Update 3D star position
      logoGroup.position.x = cachedWorldPos.x;
      logoGroup.position.y = cachedWorldPos.y - 0.65;
      logoGroup.position.z = starZ.value;
      logoGroup.scale.set(1.0, 1.0, 1.0);

      // Pure turntable spin
      logoGroup.rotation.x = 0.0;
      logoGroup.rotation.z = 0.0;
      logoGroup.rotation.y = elapsed * 0.35 * spinWeight.value;

      // PASS 1: Render background fluid into RenderTarget texture
      renderer.setRenderTarget(renderTarget);
      renderer.render(bgScene, bgCamera);

      // PASS 2: Render background fluid to screen
      renderer.setRenderTarget(null);
      renderer.render(bgScene, bgCamera);

      // PASS 3: Render 3D Liquid Chrome Hybrid logo refracting the live background
      renderer.autoClear = false;
      renderer.clearDepth();
      renderer.render(mainScene, mainCamera);
      renderer.autoClear = true;
    };

    renderLoop();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mainCamera.aspect = w / h;
      mainCamera.updateProjectionMatrix();
      renderer.setSize(w, h);
      const currentDpr = Math.min(window.devicePixelRatio, 2);
      renderTarget.setSize(w * currentDpr, h * currentDpr);
      fluidUniforms.uResolution.value.set(w, h);
      updateLogoPosition();
    };

    window.addEventListener("resize", handleResize);

    // 5. Complete Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (tl) tl.kill();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      bgPlaneGeom.dispose();
      bgMaterial.dispose();
      logoGeometry.dispose();
      chromeHybridMaterial.dispose();
      renderTarget.dispose();
      renderer.dispose();
    };
  }, [navRef, titleRef, descRef, actionsRef, anchorRef]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
