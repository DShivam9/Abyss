uniform float uHover;
uniform float uConcept;


      uniform vec2 uMouse;
      varying vec2 vUv;

      void main_effect() {
        vUv = uv;
        vec3 pos = position;

        // Global 3D card tilt parallax based on cursor offset from center
        float tiltX = (uMouse.x - 0.5) * 0.035 * uHover;
        float tiltY = (uMouse.y - 0.5) * 0.035 * uHover;
        pos.z += (position.x * tiltX + position.y * tiltY);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    

void main() {
  main_effect();
  gl_Position = mix(projectionMatrix * modelViewMatrix * vec4(position, 1.0), gl_Position, uHover);
}