uniform float uHover;
uniform float uConcept;
uniform float uAspect;


      uniform sampler2D tMap;
      uniform vec2 uMouse;
      varying vec2 vUv;

      void main_effect() {
        vec2 uv = vUv;
        vec2 correctedUv = vec2(uv.x * uAspect, uv.y);
        vec2 correctedMouse = vec2(uMouse.x * uAspect, uMouse.y);
        float dist = distance(correctedUv, correctedMouse);
        float radius = 0.18;

        if (dist < radius) {
          // Pixelate texture coordinates within lens
          vec2 pixelatedUv = floor(uv * 40.0) / 40.0;
          gl_FragColor = texture2D(tMap, pixelatedUv);
        } else {
          gl_FragColor = texture2D(tMap, uv);
        }
      }
    

void main() {
  main_effect();
  gl_FragColor = mix(texture2D(tMap, vUv), gl_FragColor, uHover);
}