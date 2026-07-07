// ═══════════════════════════════════════════════════════════════════════════
// Pixel Shatter — Fragment Shader (v6: multi-hit, no crack overlay)
// ═══════════════════════════════════════════════════════════════════════════
// Changes over v5:
//   - Removed the procedural crack overlay (the oval blob on click). Pre-shatter
//     feedback is now purely the raised pixels catching a little extra light.
//   - Shatter/reform look unchanged: tile FX scale by edgeFade so the picture
//     dissolves back together seamlessly.
// ═══════════════════════════════════════════════════════════════════════════

uniform sampler2D tMap;

varying vec2  vUv;
varying float vPhase;
varying vec2  vTileLocal;
varying float vDepth;
varying float vSpeed;
varying vec2  vVelDir;
varying float vWave;
varying float vScatter;
varying float vFloorShade;
varying float vGlow;

void main() {
  vec2 uvc = clamp(vUv, 0.0001, 0.9999);

  float edgeFade = clamp(vScatter * 4.0, 0.0, 1.0);

  // Base colour w/ velocity chromatic aberration (fades to none at home)
  vec3 col;
  float ca = vSpeed * 0.006 * edgeFade;
  if (ca > 0.0005) {
    float r = texture2D(tMap, clamp(vUv + vVelDir * ca, 0.0001, 0.9999)).r;
    float g = texture2D(tMap, uvc).g;
    float b = texture2D(tMap, clamp(vUv - vVelDir * ca, 0.0001, 0.9999)).b;
    col = vec3(r, g, b);
  } else {
    col = texture2D(tMap, uvc).rgb;
  }

  // ─── Pre-shatter: raised pixels get a strong 3D emboss; idle/hover light ──
  if (vPhase < 0.4) {
    float pop = vScatter;                         // carries the raised-tile amount
    if (pop > 0.001) {
      float bw = 0.2;
      float sh = smoothstep(0.0, bw, vTileLocal.x) * smoothstep(0.0, bw, vTileLocal.y);
      float hi = smoothstep(1.0, 1.0 - bw, vTileLocal.x) * smoothstep(1.0, 1.0 - bw, vTileLocal.y);
      float emboss = mix(0.5, 1.0, sh) * mix(1.0, 1.4, 1.0 - hi);   // deep gaps, lit tops
      col = mix(col, col * emboss, clamp(pop, 0.0, 1.0));
    }
    col *= 1.0 + vGlow;                           // idle/hover ambient light
    gl_FragColor = vec4(col, 1.0);
    return;
  }

  // ─── Shattering / reforming ──────────────────────────────────────────────
  float edge = min(min(vTileLocal.x, 1.0 - vTileLocal.x),
                   min(vTileLocal.y, 1.0 - vTileLocal.y));
  float rimMask = smoothstep(0.16, 0.0, edge);

  float borderW = 0.06;
  float shadowMask = smoothstep(0.0, borderW, vTileLocal.x)
                   * smoothstep(0.0, borderW, vTileLocal.y);
  float highlightMask = smoothstep(1.0, 1.0 - borderW, vTileLocal.x)
                      * smoothstep(1.0, 1.0 - borderW, vTileLocal.y);
  float bevel = mix(0.5, 1.0, shadowMask) * mix(1.0, 1.06, 1.0 - highlightMask);
  col *= mix(1.0, bevel, edgeFade);

  float rimIntensity = smoothstep(0.0, 0.4, abs(vDepth)) * 0.2 * edgeFade;
  col += vec3(0.7, 0.85, 1.0) * rimIntensity * rimMask;

  col += vec3(1.0, 0.6, 0.3) * vSpeed * rimMask * 0.22 * edgeFade;

  float desat = vScatter * 0.28;
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(lum), desat);

  col += vec3(1.0, 0.85, 0.6) * vWave * (0.4 + rimMask * 0.8);

  col *= 1.0 + smoothstep(0.0, 0.3, abs(vDepth)) * 0.06 * edgeFade;

  col *= mix(1.0, 0.72, vFloorShade);

  gl_FragColor = vec4(col, 1.0);
}
