// Tanvi Ferrofluid Topography — Display Fragment Shader
// Reconstructs surface normals from the height field via finite differences and
// lights the terrain with a fixed directional source, so specular glints ride the
// ridgelines of the displacement instead of being a flat additive tint.
uniform sampler2D tMap;             // Base image texture
uniform sampler2D uVelocityTexture; // FBO: rg = velocity, b = height, a = dh/dt
uniform vec3 uLightDir;             // Directional light vector (view/plane space)
uniform float uNormalStrength;     // Finite-difference normal intensity
uniform vec2 uSimTexel;            // 1.0 / simSize, for neighbor sampling
uniform float uHover;
uniform float uTime;

varying vec2 vUv;
varying float vHeight;

#define SHIFT_STRENGTH 0.14
#define PARALLAX_STRENGTH 0.12
#define GLINT_COLOR vec3(0.96, 0.98, 1.0)

// Idle undulation — MUST match the vertex shader so the reconstructed normals
// (and thus the lighting) breathe in lockstep with the displaced geometry.
float idleHeight(vec2 uv) {
  float idle = sin(uv.x * 5.0 + uTime * 0.7) * cos(uv.y * 5.0 - uTime * 0.5);
  idle += 0.5 * sin(uv.y * 9.0 - uTime * 0.9);
  return idle * 0.18 * (1.0 - uHover);
}

// Sample the signed height field at an arbitrary UV (FBO relief + idle breathing).
float sampleHeight(vec2 uv) {
  return texture2D(uVelocityTexture, uv).b + idleHeight(uv);
}

void main() {
  vec2 uv = vUv;

  // 1. Read fluid velocity (mapped from [0,1] back to [-1,1]) and height.
  vec2 flow = texture2D(uVelocityTexture, uv).rg - 0.5;
  float height = sampleHeight(uv);

  // 2. Reconstruct the surface normal from height gradients (finite differences).
  //    This is what makes displaced terrain catch light in real time.
  float hL = sampleHeight(uv - vec2(uSimTexel.x, 0.0));
  float hR = sampleHeight(uv + vec2(uSimTexel.x, 0.0));
  float hD = sampleHeight(uv - vec2(0.0, uSimTexel.y));
  float hU = sampleHeight(uv + vec2(0.0, uSimTexel.y));
  vec3 normal = normalize(vec3((hL - hR) * uNormalStrength,
                               (hD - hU) * uNormalStrength,
                               1.0));

  // 3. Warp texture coordinates along the flow (viscous pour) plus a height
  //    parallax nudge so raised terrain appears to shift under the eye.
  vec3 lightDir = normalize(uLightDir);
  vec2 parallax = normal.xy * height * PARALLAX_STRENGTH;
  vec2 warpedUv = uv - flow * SHIFT_STRENGTH * uHover - parallax * uHover;
  warpedUv = clamp(warpedUv, vec2(0.0001), vec2(0.9999));

  vec4 baseColor = texture2D(tMap, warpedUv);

  // 4. Directional lighting on the reconstructed normals. Signed dot so faces
  //    tilted toward the light brighten and faces tilted away darken — this is
  //    what actually reads as 3D relief under the flat orthographic camera.
  float ndl = dot(normal, lightDir);

  // Emboss term: strong bright/dark swing driven by how the surface faces the
  //    light. Ridges catch highlight, valleys fall into shadow.
  float emboss = ndl * 0.9;

  // Anisotropic specular: Blinn-style halfway vector, sharpened so the highlight
  // concentrates along ridgelines where the normal tilts toward the light.
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfVec = normalize(lightDir + viewDir);
  float nDotH = clamp(dot(normal, halfVec), 0.0, 1.0);

  // Specular anti-aliasing: where the normal changes faster than a pixel (fast
  // idle ripples, sharp ridges), widen the highlight lobe so it can't resolve to
  // a shimmering sub-pixel glint. fwidth() needs the derivatives extension.
  float normalVariance = fwidth(nDotH);
  float shininess = mix(40.0, 12.0, clamp(normalVariance * 6.0, 0.0, 1.0));
  float specular = pow(nDotH, shininess);
  // Ridge emphasis: positive relief facing the light sparks hardest.
  specular *= smoothstep(0.02, 0.4, height);

  // Ambient-occlusion-ish darkening in the carved channels for extra depth.
  float valley = smoothstep(0.0, -0.4, height);

  // 5. Compose. Emboss shading gives the sculptural read; specular is the
  //    liquid-metal glint. Scales with hover so idle stays near-photographic.
  vec3 lit = baseColor.rgb;
  lit *= 1.0 + emboss * uHover;          // brighten lit faces / darken shadowed
  lit *= 1.0 - valley * 0.45 * uHover;   // sink the channels
  lit += GLINT_COLOR * specular * 1.1 * uHover;

  gl_FragColor = vec4(lit, baseColor.a);
}
