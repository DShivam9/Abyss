// Tanvi Final Display Shader (Viscous Fluid Flow)
// Uses the advected FBO velocity texture to warp image coordinates and apply anisotropic lighting
uniform sampler2D tMap;            // Base image texture
uniform sampler2D uVelocityTexture; // Fluid velocity FBO texture
uniform float uHover;
uniform float uTime;
varying vec2 vUv;

#define SHIFT_STRENGTH 0.14
#define GLINT_COLOR vec3(0.96, 0.98, 1.0)

void main() {
  vec2 uv = vUv;

  // 1. Read velocity vector from FBO texture (mapped from [-1, 1] to [0, 1])
  vec2 flow = texture2D(uVelocityTexture, uv).rg - 0.5;

  // 2. Warp texture coordinates along the flow vectors
  vec2 warpedUv = uv - flow * SHIFT_STRENGTH * uHover;
  
  // Boundary clamp to prevent coordinate wrapping
  warpedUv = clamp(warpedUv, vec2(0.0001), vec2(0.9999));

  // 3. Render the base image color
  vec4 baseColor = texture2D(tMap, warpedUv);

  // 4. Anisotropic highlight: calculate surface slope based on velocity gradients
  float velocityIntensity = length(flow);
  float specularHighlight = smoothstep(0.08, 0.22, velocityIntensity) * 0.16;
  
  // Combine image colors with viscous highlight reflections
  vec3 finalColor = baseColor.rgb + GLINT_COLOR * specularHighlight * uHover;

  gl_FragColor = vec4(finalColor, baseColor.a);
}