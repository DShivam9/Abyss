// Merlin Knights — Directional Wind Cloth Vertex Shader
// Physics: traveling waves with dominant wind direction, gusting, gravity sag,
// edge flutter, inertial lag. Top-pinned banner anchoring.
uniform float uTime;
uniform float uWindSpeed; // Base wind velocity from UI controller
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying float vWindDisplacement; // Pass X-displacement to frag for tassel sway

// --- Noise ---
float hash2D(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

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

float fbm2D(vec2 p) {
  return noise2D(p) * 0.55 + noise2D(p * 2.2) * 0.30 + noise2D(p * 4.5) * 0.15;
}

// --- Wind Constants (ponytail: hardcoded, no uniforms needed) ---
const vec2 WIND_DIR = vec2(1.0, -0.15);          // Blows left-to-right, slightly down
const float GRAVITY_SAG = 0.08;                   // Gravity pull on bottom

vec3 getClothPos(vec3 pos, vec2 uv, float t) {
  // Slow down time factor globally (ponytail: single scale factor for natural flow)
  float slowTime = t * 0.38;

  // --- Anchoring ---
  // Top ~10% is nearly rigid (nailed to rod), freedom increases steeply below
  float waveFactor = smoothstep(0.0, 0.35, 1.0 - uv.y) * (1.0 - uv.y);

  // --- Gusting ---
  // Three incommensurate sines = irregular gust cycle, never feels periodic
  float gustCycle = sin(slowTime * 0.3) * 0.5 + sin(slowTime * 0.73) * 0.3 + sin(slowTime * 1.7) * 0.2;
  float windStrength = uWindSpeed * (0.6 + 0.4 * gustCycle);

  // --- Inertial Lag ---
  // Bottom lags behind top — wind hits top first, cascades down (the "whip" effect)
  float laggedTime = slowTime - (1.0 - uv.y) * 0.8;

  // --- Wind propagation coordinate ---
  // Waves travel ALONG wind direction, not randomly
  float windPhase = dot(uv, normalize(WIND_DIR));

  // === Layer 1: Primary Billow ===
  // Large slow undulation of the whole cloth body
  float billowCoord = windPhase * 2.0 - laggedTime * windStrength * 0.7;
  float billow = (fbm2D(vec2(billowCoord, uv.y * 1.5 + slowTime * 0.1)) - 0.5);

  // === Layer 2: Secondary Ripple ===
  // Medium traveling waves across the surface
  float rippleCoord = windPhase * 5.0 - laggedTime * windStrength * 1.4;
  float ripple = (fbm2D(vec2(rippleCoord, uv.y * 3.0 - slowTime * 0.15)) - 0.5);

  // === Layer 3: Edge Flutter ===
  // High-frequency flapping at free edges (sides + bottom + swallow-tail points)
  float edgeProximity = 1.0 - smoothstep(0.0, 0.12, min(uv.x, 1.0 - uv.x));
  float bottomProximity = 1.0 - smoothstep(0.0, 0.25, uv.y);
  float flutterZone = max(edgeProximity, bottomProximity);
  float flutter = sin(uv.x * 40.0 + laggedTime * 8.0) * sin(uv.y * 25.0 - laggedTime * 6.0);

  // --- Combine X displacement (horizontal wave) ---
  float waveX = (billow * 0.20 + ripple * 0.08 + flutter * 0.025 * flutterZone) * waveFactor * windStrength;

  // --- Combine Z displacement (depth ripples for lighting) ---
  float waveZ = (billow * 0.15 + ripple * 0.10 + flutter * 0.02 * flutterZone) * waveFactor * windStrength;

  // --- Y displacement (gravity + length preservation) ---
  float gravitySag = -GRAVITY_SAG * pow(1.0 - uv.y, 2.0);
  float liftFromWind = abs(waveZ) * 0.3;  // Wind lifts the bottom slightly
  float lengthLift = (waveX * waveX + waveZ * waveZ) * 0.2; // Fabric can't stretch
  float waveY = gravitySag + liftFromWind + lengthLift * waveFactor;

  vWindDisplacement = waveX; // Pass to fragment shader for tassel sway

  return pos + vec3(waveX, waveY, waveZ);
}

void main() {
  vUv = uv;

  vec3 displacedPosition = getClothPos(position, uv, uTime);

  // Analytical normal via finite differences
  float eps = 0.01;
  vec3 dp_right = getClothPos(position + vec3(eps, 0.0, 0.0), uv + vec2(eps, 0.0), uTime);
  vec3 dp_up = getClothPos(position + vec3(0.0, eps, 0.0), uv + vec2(0.0, eps), uTime);

  vec3 tangent = dp_right - displacedPosition;
  vec3 bitangent = dp_up - displacedPosition;
  vec3 calculatedNormal = normalize(cross(tangent, bitangent));

  vNormal = normalize(normalMatrix * calculatedNormal);
  vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
  vViewPosition = -mvPosition.xyz;
  vWorldPosition = (modelMatrix * vec4(displacedPosition, 1.0)).xyz;

  gl_Position = projectionMatrix * mvPosition;
}
