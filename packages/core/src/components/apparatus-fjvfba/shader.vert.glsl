uniform sampler2D tMap;
uniform float uHoverActive;
uniform vec2 uMouse;
uniform float uAspect;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Sample heightmap from image luminance
  vec4 texel = texture2D(tMap, uv);
  float lum = dot(texel.rgb, vec3(0.299, 0.587, 0.114));

  // Acid-etched groove displacement: dark lines sink, bright copper rises
  float displaceMag = (lum - 0.4) * 0.014 * uHoverActive;

  // Subtle parallax tilt following cursor
  float tiltX = (uMouse.x - 0.5) * 0.018 * uHoverActive;
  float tiltY = (uMouse.y - 0.5) * 0.018 * uHoverActive;
  pos.z += displaceMag + (position.x * tiltX + position.y * tiltY);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
