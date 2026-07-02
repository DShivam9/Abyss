// ═══════════════════════════════════════════════════════════════════════════
// Voronoi Glass Shatter — Vertex Shader
// ═══════════════════════════════════════════════════════════════════════════
// Simulates realistic gravity acceleration, floor bounce/pile-up, and spring
// reassembly for pixel particles.
// ═══════════════════════════════════════════════════════════════════════════

uniform float uTime;
uniform float uHover;
uniform vec2  uMouse;
uniform vec2  uClickPos;
uniform float uClickTime;

varying vec2 vUv;
varying float vClickAmt;
varying float vRebuildProgress;
varying float vShattered;

#define GRID_SIZE 72.0
#define GRAVITY -3.6
#define DRAG 1.3
#define SPRING_FREQ 8.0
#define SPRING_DAMP 2.4

// Procedural Hash Utilities
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

void main() {
  vec2 currentUv = uv;
  vec3 displacedPos = position;

  // ─── Click Timeline Analysis ─────────────────────────────────────────────
  float timeSinceClick = uTime - uClickTime;
  
  // Only trigger if click actually happened (uClickTime is set to a valid positive time)
  if (uClickTime > 0.0 && timeSinceClick > 0.0 && timeSinceClick < 4.5) {
    vShattered = 1.0;
    
    // Snap uv to cell center grid coordinate
    vec2 C = (floor(currentUv * GRID_SIZE) + 0.5) / GRID_SIZE;
    vec2 localPos = currentUv - C;
    
    // ─── 1. Calculate Initial Blast Velocity ──────────────────────────────
    float distToClick = distance(C, uClickPos);
    vec2 blastDir = normalize(C - uClickPos);
    float force = exp(-distToClick * 3.0) * 1.5;
    
    // Upward blast pop in Y, outward push in X
    vec2 V_0;
    V_0.x = blastDir.x * force * 0.8 + (hash(C) - 0.5) * 0.3;
    V_0.y = (blastDir.y * 0.4 + 0.6) * force * 1.4 + hash(C * 2.0) * 0.4;
    
    float V_z = (hash(C * 3.0) * 0.6 + 0.4) * force * 1.0;
    
    // ─── 2. Gravity Fall Phase (t = 0.0 to 2.2s) ───────────────────────────
    float tFall = clamp(timeSinceClick, 0.0, 2.2);
    float dragFactor = (1.0 - exp(-DRAG * tFall)) / DRAG;
    
    vec2 fallPos = C + V_0 * dragFactor;
    // Add physical gravity acceleration downwards (Y direction)
    fallPos.y += 0.5 * GRAVITY * tFall * tFall;
    
    // Pile up slightly at the floor (bottom edge of the image = 0.0 in UV space)
    float floorHeight = 0.01 + hash(C * 4.0) * 0.025;
    fallPos.y = max(fallPos.y, floorHeight);
    
    float fallZ = max(V_z * dragFactor - 0.3 * tFall * tFall, 0.0);
    
    // ─── 3. Reassembly Phase with Damped Spring Overshoot (t > 2.2s) ────────
    float tRebuild = timeSinceClick - 2.2;
    vec2 currentOffset = fallPos;
    float currentZ = fallZ;
    float rebuildProgress = 0.0;
    
    if (tRebuild > 0.0) {
      float springOscillation = cos(SPRING_FREQ * tRebuild) * exp(-SPRING_DAMP * tRebuild);
      // Interpolate back to C using spring physics
      currentOffset = C + (fallPos - C) * springOscillation;
      currentZ = fallZ * springOscillation;
      rebuildProgress = smoothstep(0.0, 1.4, tRebuild);
    }
    
    vClickAmt = 1.0 - rebuildProgress;
    vRebuildProgress = rebuildProgress;

    // ─── 4. Particle Shrink and Growth scale ───────────────────────────────
    float scale = mix(1.0, 0.16, smoothstep(0.0, 0.4, timeSinceClick));
    if (tRebuild > 0.0) {
      scale = mix(0.16, 1.0, smoothstep(0.0, 1.1, tRebuild));
    }
    
    // ─── 5. Final Coordinates ──────────────────────────────────────────────
    vec2 finalUv = mix(currentOffset, C, rebuildProgress) + localPos * scale;
    
    displacedPos.xy = finalUv - 0.5;
    displacedPos.z += currentZ;
    
    vUv = finalUv;
  } else {
    // Idle / Hover
    vUv = currentUv;
    vClickAmt = 0.0;
    vRebuildProgress = 0.0;
    vShattered = 0.0;
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPos, 1.0);
}