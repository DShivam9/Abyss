// Tanvi Ferrofluid Topography — Display Vertex Shader
// Reads the height field packed into the simulation FBO (.b channel) and
// physically displaces the subdivided plane along Z, so the surface catches
// directional light as real terrain rather than a flat luminance boost.
uniform sampler2D uVelocityTexture; // Fluid + height FBO (rg = velocity, b = height, a = dh/dt)
uniform float uDisplacementScale;   // Terrain exaggeration
uniform float uHover;
uniform float uTime;

varying vec2 vUv;
varying float vHeight;   // Signed height at this vertex (for fragment shading)

void main() {
  vUv = uv;

  // Vertex texture fetch: height stored in the blue channel, already signed
  // (HalfFloat target). Positive = dome/ridge, negative = carved channel.
  float height = texture2D(uVelocityTexture, uv).b;

  // Idle undulation so a resting surface breathes like liquid metal instead of
  // reading as a static image. Fades out while actively hovered so the cursor
  // sculpting dominates. Feeds the height field, so it also lights up via normals.
  float idle = sin(uv.x * 5.0 + uTime * 0.7) * cos(uv.y * 5.0 - uTime * 0.5);
  idle += 0.5 * sin(uv.y * 9.0 - uTime * 0.9);
  height += idle * 0.18 * (1.0 - uHover);

  vHeight = height;

  vec3 displaced = position;
  displaced.z += height * uDisplacementScale;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
