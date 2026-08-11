uniform sampler2D tMap;
uniform float uHoverActive;
uniform float uClickWave;
uniform vec2 uMouse;
uniform float uAspect;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Sample heightmap from image luminance at this vertex
  vec4 texel = texture2D(tMap, uv);
  float lum = dot(texel.rgb, vec3(0.299, 0.587, 0.114));

  // Displacement: raised gold leaf effect on hover
  // Bright features (armor, crown, sword) push forward, dark recesses stay flat
  float displaceMag = lum * 0.018 * uHoverActive;

  // Subtle parallax tilt based on cursor offset
  float tiltX = (uMouse.x - 0.5) * 0.02 * uHoverActive;
  float tiltY = (uMouse.y - 0.5) * 0.02 * uHoverActive;
  pos.z += displaceMag + (position.x * tiltX + position.y * tiltY);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}