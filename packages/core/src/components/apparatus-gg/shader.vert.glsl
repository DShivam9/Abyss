uniform float uHover;
uniform float uConcept;
uniform float uAspect;


      uniform vec2 uMouse;
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vViewPosition;

      void main_effect() {
        vUv = uv;
        vec3 pos = position;

        vec2 correctedUv = vec2(uv.x * uAspect, uv.y);
        vec2 correctedMouse = vec2(uMouse.x * uAspect, uMouse.y);
        float dist = distance(correctedUv, correctedMouse);
        float pull = exp(-dist * 5.8) * uHover;
        float wave = sin(dist * 35.0 - uTime * 6.5) * 0.015 * pull;
        
        pos.z += (pull * 0.32 + wave);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    

void main() {
  main_effect();
  gl_Position = mix(projectionMatrix * modelViewMatrix * vec4(position, 1.0), gl_Position, uHover);
}