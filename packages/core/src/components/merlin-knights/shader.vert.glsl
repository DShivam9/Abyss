// High-Fidelity Waving Fabric Vertex Shader (Orthographic-Optimized)
// Displaces vertices in X and Y (screen space) so the banner shape and borders physically wave on screen.
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

// 2D Hash
float hash2D(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// 2D Value Noise
float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash2D(i + vec2(0.0, 0.0));
  float b = hash2D(i + vec2(1.0, 0.0));
  float c = hash2D(i + vec2(0.0, 1.0));
  float d = hash2D(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// 3-octave Fbm Noise for organic, non-looping waves
float fbm2D(vec2 p) {
  return noise2D(p) * 0.55 + noise2D(p * 2.2) * 0.30 + noise2D(p * 4.5) * 0.15;
}

// Cloth displacement function deforming coordinates in X, Y, and Z
vec3 getClothPos(vec3 pos, vec2 uv, float t) {
  // Pinned top edge (no waving at y = 1.0)
  float waveFactor = pow(1.0 - uv.y, 1.35);

  float slowTime = t * 0.80;

  // Diagonal coordinates for wind flow direction
  vec2 waveCoord1 = vec2(pos.y * 1.1 - slowTime, pos.x * 0.5 + sin(t * 0.15) * 0.1);
  vec2 waveCoord2 = vec2(pos.x * 1.5 + slowTime * 0.4, pos.y * 0.8 - slowTime * 0.2);

  // 1. Primary horizontal screen-space wave (displaces X, making borders wave left/right)
  float waveX = (fbm2D(waveCoord1) - 0.5) * 0.18 * waveFactor;

  // 2. Primary depth wave (displaces Z, creating ripples that catch lighting/shadows)
  float waveZ = (fbm2D(waveCoord2) - 0.5) * 0.22 * waveFactor;

  // 3. Length-preservation lift contraction (pulls up as X and Z displacements increase)
  float lift = (waveX * waveX + waveZ * waveZ) * 0.26 * waveFactor;
  float waveY = -0.03 * waveFactor + lift;

  return pos + vec3(waveX, waveY, waveZ);
}

void main() {
  vUv = uv;

  vec3 displacedPosition = getClothPos(position, uv, uTime);

  // Compute exact analytical normal vectors via finite differences for lighting
  float eps = 0.01;
  vec3 dp = getClothPos(position, uv, uTime);
  vec3 dp_right = getClothPos(position + vec3(eps, 0.0, 0.0), uv + vec2(eps, 0.0), uTime);
  vec3 dp_up = getClothPos(position + vec3(0.0, eps, 0.0), uv + vec2(0.0, eps), uTime);

  vec3 tangent = dp_right - dp;
  vec3 bitangent = dp_up - dp;
  vec3 calculatedNormal = normalize(cross(tangent, bitangent));

  // Transform vectors
  vNormal = normalize(normalMatrix * calculatedNormal);
  vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
  vViewPosition = -mvPosition.xyz;
  vWorldPosition = (modelMatrix * vec4(displacedPosition, 1.0)).xyz;

  gl_Position = projectionMatrix * mvPosition;
}
