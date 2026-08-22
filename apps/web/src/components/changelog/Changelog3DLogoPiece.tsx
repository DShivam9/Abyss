"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface Changelog3DLogoPieceProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Changelog3DLogoPiece({
  size = 200,
  className = "",
  style = {},
}: Changelog3DLogoPieceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = size;
    const height = size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8.2);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- Dynamic Key Lights ---
    const camKey = new THREE.DirectionalLight(0xffffff, 2.2);
    camKey.position.set(0, 4, 7);
    camera.add(camKey);

    const camRim = new THREE.DirectionalLight(0xffffff, 1.5);
    camRim.position.set(0, -4, 5);
    camera.add(camRim);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambLight);

    // Studio HDRI reflection dome
    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(90, 32, 16);
    const envMat = new THREE.MeshBasicMaterial({ color: 0x050508, side: THREE.BackSide });
    envScene.add(new THREE.Mesh(envGeo, envMat));

    const topSoftbox = new THREE.Mesh(
      new THREE.CircleGeometry(50, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    topSoftbox.position.set(0, 60, 0);
    topSoftbox.rotation.x = Math.PI / 2;
    envScene.add(topSoftbox);

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const bar = new THREE.Mesh(
        new THREE.PlaneGeometry(28, 95),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      bar.position.set(Math.cos(angle) * 55, i % 2 === 0 ? 15 : -15, Math.sin(angle) * 55);
      bar.lookAt(0, 0, 0);
      envScene.add(bar);
    }

    const horizStrip = new THREE.Mesh(
      new THREE.RingGeometry(45, 52, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    horizStrip.position.set(0, 0, 0);
    horizStrip.rotation.x = Math.PI / 2;
    envScene.add(horizStrip);

    const pmremGen = new THREE.PMREMGenerator(renderer);
    const studioEnvMap = pmremGen.fromScene(envScene, 0.04).texture;
    pmremGen.dispose();
    scene.environment = studioEnvMap;

    // 1:1 SVG Shape Extrusion
    const relCommands = [
      [50, 7.5234],
      [2.2461, 29.645],
      [5.9648, -15.68],
      [-5.2891, 24.566],
      [0.089844, 1.0898],
      [37.09, -22.633],
      [-27.855, 22.355],
      [20.266, -5.3906],
      [-24.645, 10.09],
      [42.133, 11.113],
      [-39.566, -5.5469],
      [21.109, 12.812],
      [-25.188, -11.445],
      [15.898, 34.777],
      [-19.363, -30.055],
      [3.1523, 22.242],
      [-7.2656, -24.844],
      [-21.031, 32.656],
      [14.41, -31.531],
      [-16.945, 14.586],
      [17.043, -19.578],
      [-42.254, 5.9141],
      [36.457, -9.6016],
      [-24.191, -3.6328],
      [29.801, 0.89844],
      [-32.168, -25.82],
      [28.945, 17.656],
      [-11.887, -17.145],
      [19.934, 22.055],
      [0.097656, 0.066406],
    ];

    const scale = 0.046;
    const shape = new THREE.Shape();
    let curX = relCommands[0][0];
    let curY = relCommands[0][1];

    shape.moveTo((curX - 50) * scale, -(curY - 50) * scale);

    for (let i = 1; i < relCommands.length; i++) {
      curX += relCommands[i][0];
      curY += relCommands[i][1];
      shape.lineTo((curX - 50) * scale, -(curY - 50) * scale);
    }
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.18,
      bevelSize: 0.1,
      bevelSegments: 12,
      curveSegments: 24,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    geometry.computeVertexNormals();

    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    const customUniforms = {
      uTime: { value: 0.0 },
    };

    const liquidMercuryMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.0,
      envMap: studioEnvMap,
      envMapIntensity: 2.8,
    });

    liquidMercuryMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = customUniforms.uTime;
      shader.vertexShader = `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;
        ${shader.vertexShader}
      `;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        `
        #include <worldpos_vertex>
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `
      );

      shader.fragmentShader = `
        uniform float uTime;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;

        vec3 fastCelestialRainbow(float t) {
          return vec3(0.65) + vec3(0.35) * cos(6.28318 * (vec3(1.0) * t + vec3(0.00, 0.33, 0.67)));
        }
        ${shader.fragmentShader}
      `;

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `
        #include <dithering_fragment>
        vec2 waveCoord = vWorldPos.xy * 0.85 + vec2(uTime * 0.50, -uTime * 0.40);
        float fluidField = (sin(waveCoord.x) + cos(waveCoord.y) + sin(dot(vWorldPos.xy, vec2(0.6)) + uTime * 0.30)) * 0.333;
        vec3 iridColor = fastCelestialRainbow(fluidField * 2.0 + uTime * 0.12);
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float fresnel = 1.0 - max(0.0, dot(viewDir, vWorldNormal));
        float iridBlend = (smoothstep(-0.2, 0.7, fluidField) * 0.16 + pow(fresnel, 1.6) * 0.24) * 0.55;
        gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * iridColor * 1.5, iridBlend);
        `
      );
    };

    const solidMesh = new THREE.Mesh(geometry, liquidMercuryMat);
    logoGroup.add(solidMesh);

    let animationFrameId: number;
    let lastT = performance.now();

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = (now - lastT) * 0.001;
      lastT = now;
      const t = now * 0.001;

      // Pure continuous 360-degree rotational loop
      logoGroup.rotation.y += delta * 0.85;
      logoGroup.rotation.x = Math.sin(t * 0.75) * 0.22;
      logoGroup.rotation.z = Math.cos(t * 0.55) * 0.16;

      customUniforms.uTime.value = t;
      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      liquidMercuryMat.dispose();
      geometry.dispose();
      studioEnvMap.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    />
  );
}
