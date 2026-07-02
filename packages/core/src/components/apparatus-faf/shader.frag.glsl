uniform float uHover;
uniform float uConcept;
uniform float uAspect;


      uniform sampler2D tMap;
      uniform vec2 uMouse;
      varying vec2 vUv;

      float getLuminance(vec3 color) {
        return dot(color, vec3(0.299, 0.587, 0.114));
      }

      void main_effect() {
        vec2 uv = vUv;
        vec4 tex = texture2D(tMap, uv);
        float lum = getLuminance(tex.rgb);

        // CMYK dots grid
        vec2 gridUv = fract(uv * 110.0);
        float distToCenter = length(gridUv - 0.5);

        float dotRadius = (1.0 - lum) * 0.48;
        float dotMask = smoothstep(dotRadius, dotRadius - 0.05, distToCenter);

        vec2 correctedUv = vec2(uv.x * uAspect, uv.y);
        vec2 correctedMouse = vec2(uMouse.x * uAspect, uMouse.y);
        float cursorDist = distance(correctedUv, correctedMouse);
        float influence = exp(-cursorDist * 5.0);

        // Transition from clean image to halftone dots on cursor proximity
        vec3 printColor = mix(vec3(1.0), vec3(0.08, 0.08, 0.1), dotMask);
        vec3 finalColor = mix(tex.rgb, printColor, influence);

        gl_FragColor = vec4(finalColor, tex.a);
      }
    

void main() {
  main_effect();
  gl_FragColor = mix(texture2D(tMap, vUv), gl_FragColor, uHover);
}