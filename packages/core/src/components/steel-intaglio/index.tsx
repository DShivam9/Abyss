import React, { useRef } from "react";
import * as THREE from "three";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { ApparatusLlProps } from "./types";

const VERTEX_SHADER = `
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uTime;
  uniform float uClickTime;
  uniform vec2 uClickPos;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // 1. Hydraulic Press Shudder & Stamp Squash (Click Impact Bounce)
    if (uClickTime < 1.2) {
      float t = uClickTime;
      float decay = exp(-t * 6.5);
      
      // High-frequency violent plate vibration / shudder
      float jitterX = sin(t * 130.0) * 0.038 * decay;
      float jitterY = cos(t * 110.0) * 0.038 * decay;
      pos.x += jitterX;
      pos.y += jitterY;

      // Mechanical stamp vertical compression (squash bounce)
      float squash = sin(t * 24.0) * 0.08 * decay;
      pos.y *= (1.0 - squash);
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D tMap;
  uniform vec2 uMouse;
  uniform vec2 uVelocity;
  uniform float uHover;
  uniform float uTime;
  uniform float uClickTime;
  uniform vec2 uClickPos;
  uniform float uAspect;

  varying vec2 vUv;

  // Pseudo-random noise generator
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // 1D noise for fibrous ink bleed trails
  float noise1d(float x) {
    float i = floor(x);
    float f = fract(x);
    return mix(hash(vec2(i, 0.0)), hash(vec2(i + 1.0, 0.0)), smoothstep(0.0, 1.0, f));
  }

  void main() {
    // Double-differential texture lookup to calculate local image gradients
    vec2 texel = vec2(0.0025, 0.0025 * uAspect);
    vec4 c0 = texture2D(tMap, vUv);
    vec4 c1 = texture2D(tMap, vUv + vec2(texel.x, 0.0));
    vec4 c2 = texture2D(tMap, vUv - vec2(texel.x, 0.0));
    vec4 c3 = texture2D(tMap, vUv + vec2(0.0, texel.y));
    vec4 c4 = texture2D(tMap, vUv - vec2(0.0, texel.y));

    float l0 = (c0.r + c0.g + c0.b) / 3.0;
    float l1 = (c1.r + c1.g + c1.b) / 3.0;
    float l2 = (c2.r + c2.g + c2.b) / 3.0;
    float l3 = (c3.r + c3.g + c3.b) / 3.0;
    float l4 = (c4.r + c4.g + c4.b) / 3.0;

    // Local image gradient vectors (high values denote edges/lines)
    vec2 grad = vec2(l1 - l2, l3 - l4);
    float edge = length(grad);

    // 1. Dynamic Squeegee Ink Bleed (Hover) & Continuous Capillary Wicking (Idle)
    float dist = distance(vUv, uMouse);
    float pressRadius = 0.32;
    float press = smoothstep(pressRadius, 0.0, dist);

    // Constant slow capillary bleed wicking (Idle Distress)
    float idleBleed = (0.25 + 0.75 * sin(uTime * 0.8) * cos(vUv.y * 14.0)) * 0.016;
    
    // Active cursor pressure smudges ink further
    float activeWick = idleBleed + press * 0.046 * uHover;

    // Smudge direction blends horizontal grain, cursor velocity, and local image contours
    vec2 grainDir = vec2(1.0, 0.0);
    vec2 velDir = length(uVelocity) > 0.001 ? normalize(uVelocity) : vec2(0.0);
    vec2 edgeDir = edge > 0.01 ? normalize(vec2(-grad.y, grad.x)) : vec2(0.0);

    // Blended smudging direction
    vec2 smudgeDir = normalize(grainDir * 0.5 + velDir * 0.3 + edgeDir * 0.2);

    // Fibrous, streaky noise
    float fibrousNoise = noise1d(vUv.y * 420.0 + uTime * 6.0);
    vec2 smudgeOffset = smudgeDir * (fibrousNoise - 0.5) * activeWick;
    
    // Capillary bleed wiggling jitter
    smudgeOffset.y += sin(uTime * 1.5 + vUv.x * 20.0) * 0.002 * (1.0 - uHover);

    // 2. High-Pressure Hydraulic Click Splatter & Gravity Drips (Drawn Ink)
    float splatMask = 0.0;
    if (uClickTime < 1.4) {
      // Splatter UV coordinates drift upward to simulate droplets sliding downward under gravity
      vec2 splatterUv = vUv + vec2(0.0, uClickTime * 0.16);
      float clickDist = distance(splatterUv, uClickPos);
      float waveSpeed = 1.5;
      float waveFront = uClickTime * waveSpeed;
      float distFromFront = abs(clickDist - waveFront);

      if (clickDist < waveFront && clickDist < 0.42) {
        float decay = max(0.0, 1.0 - uClickTime / 1.4);
        float angle = atan(splatterUv.y - uClickPos.y, splatterUv.x - uClickPos.x);
        
        // Detailed radial streak noise
        float radialNoise = noise1d(angle * 26.0 + uClickTime * 3.0);
        
        // Keep ink along radial splash streaks
        float streak = step(0.42, radialNoise) * smoothstep(0.12, 0.0, distFromFront);
        
        // Dense splash core at center of impact
        float core = smoothstep(0.08, 0.0, clickDist) * (0.65 + 0.35 * noise1d(angle * 45.0));
        
        splatMask = max(streak, core) * decay;
      }
    }

    // Combine offsets and sample original texture
    vec2 finalUv = clamp(vUv + smudgeOffset, 0.0, 1.0);
    vec4 texColor = texture2D(tMap, finalUv);

    // 3. Flat, High-Contrast Brushed Metal / Concrete Print (No reflections, no specular)
    float luminance = (texColor.r + texColor.g + texColor.b) / 3.0;
    
    // Map dark details as ink channels
    float inkChannel = smoothstep(0.48, 0.18, luminance);

    // Merge drawn splatMask directly into ink density
    float finalInk = max(inkChannel, splatMask * 0.95);

    // Raw, distressed metal sheet background texture (Procedural brushed grain)
    float grainVal = sin(vUv.y * 3800.0) * cos(vUv.x * 28.0);
    vec3 baseMetal = vec3(0.35, 0.35, 0.38) + vec3(grainVal * 0.05);

    // Blend base image with the raw metal background
    vec3 basePlate = mix(baseMetal, texColor.rgb, 0.3 + 0.7 * (1.0 - finalInk));

    // Thick carbon printer's grease ink in grooves (absorbs light, flat matte)
    vec3 greaseInk = vec3(0.015, 0.015, 0.025) * (0.8 + 0.2 * sin(vUv.y * 500.0));
    vec3 finalColor = mix(basePlate, greaseInk, finalInk * 0.9);

    // Overlay fine blueprint grid lines
    vec2 gridUv = vUv + smudgeOffset;
    float gridX = step(0.985, fract(gridUv.x * 16.0));
    float gridY = step(0.985, fract(gridUv.y * 16.0 * uAspect));
    float grid = max(gridX, gridY);
    finalColor += vec3(0.01, 0.04, 0.02) * grid; // very subtle dark grid lines

    gl_FragColor = vec4(finalColor, texColor.a);
  }
`;

export const ApparatusLl: React.FC<ApparatusLlProps> = (props) => {
  const clickRef = useRef({ time: 99.0, x: 0.5, y: 0.5 });
  const tiltRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  // Update press coordinates and inject physical tilt impulse on click
  const onClickCanvas = (uv: THREE.Vector2) => {
    clickRef.current = {
      time: 0.0, // trigger hydraulic press
      x: uv.x,
      y: uv.y,
    };

    // Calculate angular tilt impulse proportional to the distance from center
    const cx = uv.x - 0.5;
    const cy = uv.y - 0.5;
    tiltRef.current.vx = cx * 0.38;
    tiltRef.current.vy = -cy * 0.38;
  };

  // Custom frame animation loop to tick timers and solve physics
  const onAnimate = (material: THREE.ShaderMaterial, _clock: THREE.Clock) => {
    // 1. Tick click timer
    if (clickRef.current.time < 99.0) {
      const lastTime = material.uniforms.uClickTime.value;
      if (lastTime > 98.0) {
        clickRef.current.time = 0.0;
      } else {
        clickRef.current.time += 0.016;
      }
    }

    material.uniforms.uClickTime.value = clickRef.current.time;
    material.uniforms.uClickPos.value.copy(clickRef.current);

    // 2. Solve physical spring-inertia tilt for the plate impact wobble
    const springK = 0.085; // restoring spring stiffness
    const damping = 0.86; // air friction damping

    const tilt = tiltRef.current;
    const ax = -tilt.x * springK;
    const ay = -tilt.y * springK;

    tilt.vx = (tilt.vx + ax) * damping;
    tilt.vy = (tilt.vy + ay) * damping;
    
    tilt.x += tilt.vx;
    tilt.y += tilt.vy;

    // Pass the calculated physical tilt angles to the vertex shader
    if (material.uniforms.uTilt) {
      material.uniforms.uTilt.value.set(tilt.x, tilt.y);
    } else {
      material.uniforms.uTilt = { value: new THREE.Vector2(tilt.x, tilt.y) };
    }
  };

  return (
    <VesselCanvas
      {...props}
      vertexShader={VERTEX_SHADER}
      fragmentShader={FRAGMENT_SHADER}
      subdivisions={{ x: 32, y: 32 }}
      uniforms={{
        uClickTime: 99.0,
        uClickPos: new THREE.Vector2(0.5, 0.5),
        uTilt: new THREE.Vector2(0, 0),
      }}
      onClickCanvas={onClickCanvas}
      onAnimate={onAnimate}
      ariaLabel="Industrial steel intaglio printing plate. Hovering behaves like a squeegee, smudging and bleeding the carbon ink channels horizontally along the brushed steel grain. Clicking triggers a hydraulic press stroke, splattering ink and wiggling the plate."
    />
  );
};

export default ApparatusLl;
