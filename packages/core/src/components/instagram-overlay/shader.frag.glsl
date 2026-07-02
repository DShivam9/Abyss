// ═══════════════════════════════════════════════════════════════════════════
// Voronoi Glass Shatter — Fragment Shader
// ═══════════════════════════════════════════════════════════════════════════
// Renders pixel particle borders, dynamic blocky pixelation during reassembly,
// and background image. All hover effects (grid, glare) removed.
// ═══════════════════════════════════════════════════════════════════════════

uniform sampler2D tMap;
uniform float uTime;
uniform float uHover;
uniform float uAspect;
uniform vec2  uMouse;
uniform float uClickTime;

varying vec2 vUv;
varying float vClickAmt;
varying float vRebuildProgress;
varying float vShattered;

#define GRID_SIZE 72.0

void main() {
  vec2 uv = vUv;
  vec3 col;

  // ─── 1. Pixel Particle Rendering (Active Shatter) ──────────────────────
  if (vShattered > 0.001) {
    // Dynamic pixelation resolution resolving during reassembly
    float pixelResolution = mix(16.0, GRID_SIZE, vRebuildProgress);
    vec2 pixelUv = (floor(uv * pixelResolution) + 0.5) / pixelResolution;
    
    col = texture2D(tMap, pixelUv).rgb;

    // Draw dark borders around each pixel block to make them distinct 3D squares
    vec2 localCoord = fract(uv * GRID_SIZE);
    float borderMask = smoothstep(0.0, 0.08, localCoord.x) * smoothstep(1.0, 0.92, localCoord.x) *
                       smoothstep(0.0, 0.08, localCoord.y) * smoothstep(1.0, 0.92, localCoord.y);
                       
    // Border fades as particles snap back to solid sheet
    col *= mix(0.55, 1.0, mix(borderMask, 1.0, vRebuildProgress));
  } else {
    // ─── 2. Clean Surface Rendering (Idle / Hover) ────────────────────────
    col = texture2D(tMap, uv).rgb;
  }

  // ─── 3. Assembly Snap Flash ─────────────────────────────────────────────
  float timeSinceClick = uTime - uClickTime;
  if (timeSinceClick > 3.25 && timeSinceClick < 3.55) {
    float flash = smoothstep(3.25, 3.38, timeSinceClick) * smoothstep(3.55, 3.38, timeSinceClick) * 0.45;
    col += vec3(0.96, 0.98, 1.0) * flash;
  }

  // ─── 4. Subtle Edge Vignette ────────────────────────────────────────────
  vec2 vignetteCoord = uv * 2.0 - 1.0;
  float vignette = 1.0 - dot(vignetteCoord * 0.40, vignetteCoord * 0.40);
  vignette = clamp(vignette, 0.0, 1.0);
  vignette = smoothstep(0.0, 0.55, vignette);
  col *= vignette;

  gl_FragColor = vec4(col, 1.0);
}