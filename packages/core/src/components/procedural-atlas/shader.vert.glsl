varying vec2 vUv;

void main() {
  vUv = uv;
  // standard geometry transformation (using mesh coordinates from VesselCanvas)
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
