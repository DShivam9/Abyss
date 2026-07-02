uniform float uHover;
uniform float uConcept;


      varying vec2 vUv;
      void main_effect() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    

void main() {
  main_effect();
  gl_Position = mix(projectionMatrix * modelViewMatrix * vec4(position, 1.0), gl_Position, uHover);
}