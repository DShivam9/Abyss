uniform float uHover;
uniform vec2 uMouse;
uniform float uTime;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Organic slow breathing scale (idle movement)
  float breath = (sin(uTime * 0.8) * 0.7 + sin(uTime * 1.8) * 0.3) * 0.004;
  pos.x *= 1.0 + breath;
  pos.y *= 1.0 + breath;

  // Interactive 3D tilt
  float tiltX = (uMouse.x - 0.5) * 0.02 * uHover;
  float tiltY = (uMouse.y - 0.5) * 0.02 * uHover;
  pos.z += (position.x * tiltX + position.y * tiltY);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
