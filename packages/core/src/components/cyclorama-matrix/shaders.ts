export const curveGlsl = `
  vec3 getCurvedPos(vec2 worldPos, float zOffset) {
    float theta = worldPos.x / uRadiusX;
    float phi = worldPos.y / uRadiusY;
    float curvedX = sin(theta) * uRadiusX;
    float curvedY = sin(phi) * uRadiusY;
    float rSq = theta * theta + phi * phi;
    float curvedZ = uRadiusX * (1.0 - cos(theta)) + uRadiusY * (1.0 - cos(phi)) + rSq * 1.1 + zOffset;
    return vec3(curvedX, curvedY, curvedZ);
  }
`;

export const createSharedVertShader = (zOffset: string): string => `
  uniform vec2 uCellCenter;
  uniform float uRadiusX;
  uniform float uRadiusY;
  varying vec2 vUv;
  varying vec3 vCurvedPos;
  ${curveGlsl}
  void main() {
    vUv = uv;
    vec3 p = getCurvedPos(uCellCenter + position.xy, ${zOffset});
    vCurvedPos = p;
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  }
`;

export const cardVert = createSharedVertShader("0.04");
export const bgVert = createSharedVertShader("-0.05");
export const labelVert = createSharedVertShader("0.06");

export const inkGlsl = `
  float inkHash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float inkNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(inkHash(i + vec2(0.0, 0.0)), inkHash(i + vec2(1.0, 0.0)), u.x),
               mix(inkHash(i + vec2(0.0, 1.0)), inkHash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float inkTurbulence(vec2 p) {
    return inkNoise(p) * 0.65 + inkNoise(p * 2.15 + vec2(1.7, 4.3)) * 0.35;
  }

  float getInkBloomFade(vec3 pos, float uIntro, float edgeFade) {
    if (uIntro <= 0.001) return 0.0;
    if (uIntro >= 0.999) return edgeFade;

    vec2 p = pos.xy * vec2(0.85, 1.0);
    float dist = length(p);

    // Continuous 2D noise: organic fluid contour that softens as it opens
    float turb = (inkTurbulence(p * 0.30) - 0.5) * 4.2 * (1.0 - uIntro * 0.6);
    float effDist = dist + turb;

    // Expanding radius: starts negative so zero cards show on start, blooms to 35.0
    float radius = uIntro * 35.0 - 2.5 * (1.0 - uIntro);
    float feather = mix(4.0, 2.2, uIntro);

    float reveal = 1.0 - smoothstep(radius - feather, radius + 1.5, effDist);
    reveal = clamp(reveal, 0.0, 1.0);
    reveal = reveal * reveal * (3.0 - 2.0 * reveal);

    return edgeFade * reveal;
  }
`;

export const cardFrag = `
  uniform sampler2D uTexture;
  uniform float uCamZ;
  uniform float uIntro;
  varying vec2 vUv;
  varying vec3 vCurvedPos;
  ${inkGlsl}
  void main() {
    // Optical Rack-Focus Arrival & Perimeter Depth Blur (Dynamic Zoom-Scaled)
    float holdT = clamp((uCamZ - 12.8) / 4.2, 0.0, 1.0);
    float radX = mix(12.0, 14.8, holdT);
    float radY = mix(6.0, 7.6, holdT);
    float rad = length(vec2(abs(vCurvedPos.x) / radX, abs(vCurvedPos.y) / radY));
    float edgeFade = 1.0 - smoothstep(mix(0.60, 0.62, holdT), mix(1.12, 1.08, holdT), rad);

    float totalFade = getInkBloomFade(vCurvedPos, uIntro, edgeFade);
    if (totalFade <= 0.001) discard;

    float blur = smoothstep(mix(0.50, 0.55, holdT), mix(1.10, 1.08, holdT), rad) * 0.007;

    vec4 col = texture2D(uTexture, vUv) * 0.36;
    col += texture2D(uTexture, vUv + vec2( blur,  0.0)) * 0.16;
    col += texture2D(uTexture, vUv - vec2( blur,  0.0)) * 0.16;
    col += texture2D(uTexture, vUv + vec2( 0.0,  blur)) * 0.16;
    col += texture2D(uTexture, vUv - vec2( 0.0,  blur)) * 0.16;

    // ponytail: screen-space fwidth edge feathering eliminates raw geometric staircase aliasing
    vec2 edge = abs(vUv - 0.5) * 2.0;
    float maxEdge = max(edge.x, edge.y);
    float fw = max(fwidth(maxEdge), 0.0015);
    float imageAlpha = smoothstep(1.0, 1.0 - fw * 1.6, maxEdge);

    gl_FragColor = vec4(col.rgb * totalFade, col.a * totalFade * imageAlpha);
  }
`;

export const bgFrag = `
  uniform sampler2D uTexture;
  uniform float uHover;
  uniform float uAspect;
  uniform float uCamZ;
  uniform float uIntro;
  varying vec2 vUv;
  varying vec3 vCurvedPos;
  ${inkGlsl}
  void main() {
    // Perimeter Optical Fog (Dynamic Zoom-Scaled)
    float holdT = clamp((uCamZ - 12.8) / 4.2, 0.0, 1.0);
    float radX = mix(12.0, 14.8, holdT);
    float radY = mix(6.0, 7.6, holdT);
    float rad = length(vec2(abs(vCurvedPos.x) / radX, abs(vCurvedPos.y) / radY));
    float edgeFade = 1.0 - smoothstep(mix(0.60, 0.62, holdT), mix(1.12, 1.08, holdT), rad);

    float totalFade = getInkBloomFade(vCurvedPos, uIntro, edgeFade);
    if (totalFade <= 0.001) discard;

    vec2 edge = abs(vUv - 0.5) * 2.0;
    float maxEdge = max(edge.x, edge.y);

    // Sub-pixel vector hairline with slight inset to prevent polygon edge clipping
    float hairlineTarget = 0.982;
    float dist = abs(maxEdge - hairlineTarget);
    float fw = max(fwidth(maxEdge), 0.0012);
    float border = 1.0 - smoothstep(0.0, fw * 1.4, dist);

    // Feather outer quad silhouette to eliminate jagged polygon aliasing
    float quadAlpha = smoothstep(1.0, 0.992, maxEdge);

    // Crisp stark white hairline
    vec3 borderCol = vec3(0.96, 0.98, 1.0);

    // Deep optical obsidian interior with contact ambient shadow beneath media
    vec3 glassCol = vec3(0.010, 0.011, 0.014);

    // Physical Contact Shadow grounding the foreground card
    vec2 mHalf = vec2(
      (uAspect >= 1.0 ? 2.55 : 2.55 * uAspect) / 3.22 * 0.5,
      (uAspect >= 1.0 ? 2.55 / uAspect : 2.55) / 3.22 * 0.5
    );
    vec2 dBox = max(abs(vUv - 0.5) - mHalf, 0.0);
    float contactShadow = 1.0 - smoothstep(0.0, 0.09, length(dBox)) * 0.65;
    glassCol *= contactShadow;

    // Ambient Frosted Media on Hover
    float t = clamp(uHover, 0.0, 1.0);
    float fade = pow(t, 1.7);

    vec3 finalCol = glassCol;
    if (fade > 0.005) {
      vec2 uv = vUv - 0.5;
      if (uAspect > 1.0) uv.x /= uAspect; else uv.y *= uAspect;
      vec2 cUv = clamp(uv + 0.5, 0.005, 0.995);

      vec3 col = texture2D(uTexture, cUv).rgb * 0.28;
      const float o = 0.012;
      col += (texture2D(uTexture, cUv + vec2(o, 0.0)).rgb + texture2D(uTexture, cUv - vec2(o, 0.0)).rgb +
              texture2D(uTexture, cUv + vec2(0.0, o)).rgb + texture2D(uTexture, cUv - vec2(0.0, o)).rgb) * 0.12;
      col += (texture2D(uTexture, cUv + vec2(o, o) * 0.707).rgb + texture2D(uTexture, cUv + vec2(-o, o) * 0.707).rgb +
              texture2D(uTexture, cUv + vec2(o, -o) * 0.707).rgb + texture2D(uTexture, cUv - vec2(o, -o) * 0.707).rgb) * 0.06;

      vec3 grad = mix(
        mix(texture2D(uTexture, vec2(0.20, 0.20)).rgb, texture2D(uTexture, vec2(0.80, 0.20)).rgb, vUv.x),
        mix(texture2D(uTexture, vec2(0.20, 0.80)).rgb, texture2D(uTexture, vec2(0.80, 0.80)).rgb, vUv.x),
        vUv.y
      );
      col = mix(col, grad, 0.40);
      float centerDist = length(vUv - 0.5) * 1.414;
      col = mix(col, vec3(0.02, 0.025, 0.04), 0.22) * (1.0 - smoothstep(0.5, 1.15, centerDist) * 0.30);

      // Blend: deep obsidian plate + hover media bloom
      finalCol = mix(glassCol, col, fade * 0.92);
    }

    // Sophisticated dimmed architectural hairline
    float borderAlpha = border * mix(0.35, 0.85, fade);
    finalCol = mix(finalCol, borderCol, borderAlpha);

    // Soft perimeter optical falloff with smooth edge feathering
    finalCol *= totalFade * quadAlpha;

    gl_FragColor = vec4(finalCol, 0.96 * totalFade * quadAlpha);
  }
`;

export const labelFrag = `
  uniform sampler2D uTexture;
  uniform float uHover;
  uniform float uCamZ;
  uniform float uIntro;
  varying vec2 vUv;
  varying vec3 vCurvedPos;
  ${inkGlsl}
  void main() {
    float holdT = clamp((uCamZ - 12.8) / 4.2, 0.0, 1.0);
    float radX = mix(12.0, 14.8, holdT);
    float radY = mix(6.0, 7.6, holdT);
    float rad = length(vec2(abs(vCurvedPos.x) / radX, abs(vCurvedPos.y) / radY));
    float edgeFade = 1.0 - smoothstep(mix(0.60, 0.62, holdT), mix(1.12, 1.08, holdT), rad);

    float totalFade = getInkBloomFade(vCurvedPos, uIntro, edgeFade);
    if (totalFade <= 0.001) discard;

    vec4 col = texture2D(uTexture, vUv);
    if (col.a <= 0.005) discard;
    float alpha = col.a * mix(0.74, 1.0, pow(clamp(uHover, 0.0, 1.0), 1.5)) * totalFade;
    gl_FragColor = vec4(col.rgb * totalFade, alpha);
  }
`;
