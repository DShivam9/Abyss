export const VERTEX_SHADER = `
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

export const FRAGMENT_SHADER = `
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

    // Displace UVs in smudge direction for ink streaking
    vec2 smudgeOffset = smudgeDir * activeWick;
    vec2 smudgedUv = vUv + smudgeOffset;

    // Sample distorted texture at smudged coordinate
    vec4 texColor = texture2D(tMap, smudgedUv);
    float lum = (texColor.r + texColor.g + texColor.b) / 3.0;

    // 2. Hydraulic Press Splatter Burst (Click Impact)
    float splatter = 0.0;
    if (uClickTime < 1.0) {
      float ct = uClickTime;
      float clickDist = distance(vUv, uClickPos);
      float shockRadius = ct * 0.65;
      float shockFront = smoothstep(shockRadius - 0.08, shockRadius, clickDist) *
                         smoothstep(shockRadius + 0.08, shockRadius, clickDist);
      
      // Starburst ray angle modulation
      float angle = atan(vUv.y - uClickPos.y, vUv.x - uClickPos.x);
      float rays = abs(sin(angle * 12.0 + noise1d(angle * 4.0) * 3.0));
      splatter = shockFront * rays * exp(-ct * 4.0);
    }

    // 3. Intaglio Grooves / Etch Lines
    // High-contrast ink density thresholding with edge extraction
    float inkChannels = smoothstep(0.72, 0.22, lum);
    float etchedLines = smoothstep(0.02, 0.14, edge);
    float finalInk = max(inkChannels, etchedLines * 0.8) + splatter * 0.9;

    // 4. Brushed Steel Metal Surface Tone
    // Fine horizontal anisotropic grain texture lines
    float grainVal = hash(vec2(vUv.y * 600.0, floor(vUv.x * 2.0)));
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
