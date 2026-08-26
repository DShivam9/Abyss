export const GLASS_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const GLASS_FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform float uBlur;
  uniform float uAspect;
  uniform float uDepthAlpha;
  uniform float uIntroFade;
  uniform float uThermalNeg;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  float roundedBoxSDF(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    vec2 size = vec2(uAspect * 0.5, 0.5);
    float radius = 0.0;

    float dist = roundedBoxSDF(p, size, radius);
    float edgeAlpha = smoothstep(0.0015, -0.0015, dist);
    if (edgeAlpha <= 0.0) discard;

    vec2 uv = vUv;
    float blur = uBlur * 0.0012;
    vec4 col = texture2D(uTexture, uv);
    if (blur > 0.0001) {
      col = texture2D(uTexture, uv) * 0.40
          + texture2D(uTexture, uv + vec2(blur, blur)) * 0.15
          + texture2D(uTexture, uv + vec2(-blur, blur)) * 0.15
          + texture2D(uTexture, uv + vec2(blur, -blur)) * 0.15
          + texture2D(uTexture, uv + vec2(-blur, -blur)) * 0.15;
    }

    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0) * 0.06;

    vec3 finalColor = col.rgb;

    if (uThermalNeg > 0.001) {
      vec3 inverted = vec3(1.0) - finalColor;
      vec3 thermal = vec3(inverted.r * 0.2, inverted.g * 0.8, inverted.b * 1.2);
      finalColor = mix(finalColor, thermal, uThermalNeg);
    }

    finalColor += vec3(fresnel);
    float alpha = edgeAlpha * 0.98 * uDepthAlpha * uIntroFade;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;
