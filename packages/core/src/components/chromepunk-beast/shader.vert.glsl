uniform float uHover;
uniform float uConcept;


      varying vec2 vUv;
      varying vec3 vViewPosition;
      void main_effect() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    

void main() {
  main_effect();
  gl_Position = mix(projectionMatrix * modelViewMatrix * vec4(position, 1.0), gl_Position, uHover);
}