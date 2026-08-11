uniform float uHover;
uniform vec2 uMouse;
uniform float uTime;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Improved organic double-octave breathing idle motion
  float breath = (sin(uTime * 1.0) * 0.75 + sin(uTime * 2.2) * 0.25) * 0.007;
  pos.x *= 1.0 + breath;
  pos.y *= 1.0 + breath;

  // Interactive 3D tilt with cursor damping
  float tiltX = (uMouse.x - 0.5) * 0.02 * uHover;
  float tiltY = (uMouse.y - 0.5) * 0.02 * uHover;
  pos.z += (position.x * tiltX + position.y * tiltY);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
