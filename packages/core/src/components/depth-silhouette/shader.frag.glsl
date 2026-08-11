uniform sampler2D tMap;
uniform vec2 uMouse;
uniform float uTime;
uniform float uHover;
uniform vec2 uResolution;
uniform float uAspect;
uniform vec2 uEntryOrigin;
uniform vec2 uSweepDir;
uniform float uMaxDist;
uniform float uRevealProgress;

varying vec2 vUv;

#define DOT_SCALE 65.0
#define PAPER_COLOR vec3(0.95, 0.94, 0.92)  // Warm cream print paper
#define INK_COLOR vec3(0.09, 0.09, 0.11)    // Charcoal black ink

// Hash function
float hash2D(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// 2D Value Noise for organic boundary distortion
float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = hash2D(i);
  float b = hash2D(i + vec2(1.0, 0.0));
  float c = hash2D(i + vec2(0.0, 1.0));
  float d = hash2D(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float getLuminance(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

void main() {
  vec2 uv = vUv;

  // 1. STARK BLACK-AND-WHITE HALFTONE SCREEN
  vec2 grid = vec2(DOT_SCALE * uAspect, DOT_SCALE);
  vec2 cellIndex = floor(uv * grid) / grid;
  vec2 localUv = fract(uv * grid) - 0.5;

  // Sample texture at cell center
  vec3 sampledCellColor = texture2D(tMap, cellIndex).rgb;
  float cellLum = getLuminance(sampledCellColor);

  // Darker areas = larger dots
  float dotRadius = clamp((1.0 - cellLum) * 0.65, 0.0, 0.65);
  float localDist = length(localUv);
  
  float dotEdge = 0.06;
  float dotPattern = smoothstep(dotRadius - dotEdge, dotRadius + dotEdge, localDist);
  vec3 halftoneColor = mix(INK_COLOR, PAPER_COLOR, dotPattern);

  // 2. PEEL REVEAL CALCULATION (Driven by Javascript reveal progress projection)
  // Calculate relative sweep position of current pixel
  float sweepVal = dot(uv - uEntryOrigin, uSweepDir) / uMaxDist;

  // Organic noise for wavy "torn paper" edge displacement
  float n1 = noise2D(uv * 4.5 + vec2(0.0, uTime * 0.25));
  float n2 = noise2D(uv * 9.0 - vec2(uTime * 0.15, 0.0));
  float noiseDisplacement = (n1 * 0.75 + n2 * 0.25 - 0.5) * 0.12 * uRevealProgress;

  // Distort the sweep coordinate with uniform noise
  float distortedSweep = sweepVal + noiseDisplacement;

  // Expanded threshold scale to prevent partial reveal splits at idle initialization
  float threshold = mix(-1.5, 1.5, uRevealProgress);
  float softness = 0.08;
  float revealMask = smoothstep(threshold - softness, threshold + softness, distortedSweep);

  // 3. COLOR PHOTO SAMPLE WITH CHROMATIC SEPARATION
  float boundaryDistance = abs(distortedSweep - threshold);
  float boundaryRing = 1.0 - smoothstep(0.0, 0.08, boundaryDistance);
  float splitStrength = 0.015 * boundaryRing * uRevealProgress;

  vec3 rgbColor;
  rgbColor.r = texture2D(tMap, uv + vec2(splitStrength, 0.0)).r;
  rgbColor.g = texture2D(tMap, uv).g;
  rgbColor.b = texture2D(tMap, uv - vec2(splitStrength, 0.0)).b;

  // Thin dark ink bleed border along the wipe boundary line
  float bleedIntensity = 1.0 - smoothstep(0.0, 0.01, boundaryDistance);
  vec3 bleedColor = vec3(0.04, 0.04, 0.05);
  rgbColor = mix(rgbColor, bleedColor, bleedIntensity * 0.8 * uRevealProgress);

  // 4. COMPOSITE BLEND
  vec3 finalColor = mix(rgbColor, halftoneColor, revealMask);

  gl_FragColor = vec4(finalColor, 1.0);
}
