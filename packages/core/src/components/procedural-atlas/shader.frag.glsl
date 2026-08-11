uniform sampler2D tMap;
uniform sampler2D tAtlas;
uniform vec2 uMouse;
uniform float uHover;
uniform float uTime;
uniform vec2 uResolution;
uniform float uAspect;
varying vec2 vUv;

// Fast pseudo-random
float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

// Better distributed hash (avoids clustering artifacts)
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 uv = vUv;
  vec2 mouse = uMouse;

  // ──────────────────────────────────────────────
  // Character grid setup
  // ──────────────────────────────────────────────
  float cols = 96.0;
  float rows = cols / uAspect;
  vec2 grid = vec2(cols, rows);

  vec2 cellId = floor(uv * grid);
  vec2 cellUv = cellId / grid;
  vec2 localUv = fract(uv * grid);

  float cellNoise = rand(cellUv);
  float cellHash = hash(cellId);

  // Sample source image at cell center
  vec3 imgColor = texture2D(tMap, cellUv + 0.5 / grid).rgb;
  float lum = dot(imgColor, vec3(0.299, 0.587, 0.114));

  // Base character slot from luminance (8 chars: space . - + = * # @)
  float slot = floor(lum * 7.99);

  // ──────────────────────────────────────────────
  // IDLE: Slow stochastic character mutation
  // Each cell drifts its glyph independently, driven by position-seeded phase offsets.
  // This avoids the synchronized sine-wave look.
  // ──────────────────────────────────────────────
  float phase = cellHash * 6.2831 + cellId.x * 0.73 + cellId.y * 1.17;
  float drift = sin(uTime * 1.4 + phase) * cos(uTime * 0.9 + phase * 1.6);
  // Only mutate when drift crosses a threshold → sporadic flicker, not continuous wave
  float mutationChance = step(0.6, abs(drift));
  float mutatedSlot = floor(hash(cellId + floor(uTime * 2.0)) * 7.99);
  slot = mix(slot, mutatedSlot, mutationChance * 0.5);
  slot = floor(clamp(slot, 0.0, 7.0));

  // ──────────────────────────────────────────────
  // HOVER: Digital corruption propagation
  // No circles, no lines. Each cell individually decides
  // whether it's corrupted based on cursor proximity + its own noise threshold.
  // Result: jagged, blocky, per-cell disruption boundary.
  // ──────────────────────────────────────────────
  float corruptionIntensity = 0.0;

  if (uHover > 0.01) {
    // Aspect-corrected distance from cursor to this cell's center
    vec2 cellCenter = (cellId + 0.5) / grid;
    vec2 diff = (cellCenter - mouse) * vec2(uAspect, 1.0);
    float dist = length(diff);

    // Per-cell noise offset on the radius → jagged digital boundary
    float cellRadiusOffset = cellHash * 0.10;
    // Time-varying flicker on the boundary (cells near the edge blink in/out)
    float flickerOffset = hash(cellId + floor(uTime * 7.0)) * 0.06;

    float outerRadius = 0.20;
    float innerRadius = 0.04;

    // Corruption falloff: strong near cursor, dies off with noise-modulated edge
    float adjustedDist = dist - cellRadiusOffset - flickerOffset;
    corruptionIntensity = (1.0 - smoothstep(innerRadius, outerRadius, adjustedDist)) * uHover;

    // ── Character scramble ──
    // Corrupted cells rapidly cycle through random glyphs
    if (corruptionIntensity > 0.05) {
      float scrambleSpeed = 6.0 + corruptionIntensity * 30.0;
      float scrambledSlot = floor(hash(cellId + floor(uTime * scrambleSpeed)) * 7.99);

      // Blend: partial corruption shows original glyph flickering to random ones
      slot = mix(slot, scrambledSlot, smoothstep(0.05, 0.5, corruptionIntensity));
      slot = floor(clamp(slot, 0.0, 7.0));
    }

    // ── UV warp within cells → glyphs look stretched, skewed, torn ──
    if (corruptionIntensity > 0.1) {
      float warpAmount = corruptionIntensity * 0.45;
      localUv.x += (hash(cellId + uTime * 3.1) - 0.5) * warpAmount;
      localUv.y += (hash(cellId * 1.7 - uTime * 4.3) - 0.5) * warpAmount * 0.7;
    }

    // ── Buffer underflow: some cells blank out entirely ──
    float blankThreshold = 1.0 - corruptionIntensity * 0.35;
    if (hash(cellId + floor(uTime * 12.0)) > blankThreshold) {
      slot = 0.0; // space character
    }

    // ── Data displacement: some cells steal a neighbor's character ──
    if (corruptionIntensity > 0.3) {
      float displaceSeed = hash(cellId * 5.0 + floor(uTime * 4.0));
      if (displaceSeed > 0.72) {
        // Pick a random neighbor direction
        vec2 offset = vec2(
          floor(hash(cellId + 1.0) * 3.0) - 1.0,
          floor(hash(cellId + 2.0) * 3.0) - 1.0
        );
        vec2 neighborCellUv = (cellId + offset) / grid;
        neighborCellUv = clamp(neighborCellUv, vec2(0.0), vec2(1.0));
        float neighborLum = dot(texture2D(tMap, neighborCellUv + 0.5 / grid).rgb, vec3(0.299, 0.587, 0.114));
        slot = floor(neighborLum * 7.99);
      }
    }
  }

  // Clamp UVs to prevent atlas bleed
  localUv = clamp(localUv, 0.005, 0.995);

  // ──────────────────────────────────────────────
  // Sample character atlas
  // ──────────────────────────────────────────────
  vec2 atlasUv = vec2((localUv.x + slot) / 8.0, localUv.y);
  vec3 charMask = texture2D(tAtlas, atlasUv).rgb;

  // ──────────────────────────────────────────────
  // Color composition
  // ──────────────────────────────────────────────
  vec3 paper = vec3(0.035, 0.035, 0.04);
  vec3 ink = vec3(0.90, 0.90, 0.92);

  // Corrupted cells bleed the raw image color through
  if (corruptionIntensity > 0.05) {
    // Image color contaminates the ink, overriding monochrome
    vec3 bleedColor = imgColor * 1.5;
    ink = mix(ink, bleedColor, corruptionIntensity * 0.65);

    // Paper darkens or tints toward image shadow color
    paper = mix(paper, imgColor * 0.12, corruptionIntensity * 0.4);
  }

  vec3 finalColor = mix(paper, ink, charMask.r);

  // ──────────────────────────────────────────────
  // Post-processing
  // ──────────────────────────────────────────────
  // Faint CRT scanline overlay
  float scanline = sin(uv.y * uResolution.y * 1.5 + uTime * 3.0) * 0.010;
  finalColor += vec3(scanline);

  // Minimal analog noise grain
  finalColor += (vec3(rand(uv + uTime)) - 0.5) * 0.008;

  gl_FragColor = vec4(finalColor, 1.0);
}
