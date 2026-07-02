uniform float uHover;
uniform float uConcept;
uniform float uAspect;


      uniform sampler2D tMap;
      uniform vec2 uMouse;
      uniform float uTime;
      varying vec2 vUv;

      float getLuminance(vec3 color) {
        return dot(color, vec3(0.299, 0.587, 0.114));
      }

      void main_effect() {
        vec2 uv = vUv;
        vec2 correctedUv = vec2(uv.x * uAspect, uv.y);
        vec2 correctedMouse = vec2(uMouse.x * uAspect, uMouse.y);
        vec2 dir = correctedUv - correctedMouse;
        float dist = length(dir);
        float influence = exp(-dist * 8.0);

        // Leonardo hand-sketched hatching coordinate warp
        float coord = (uv.x + uv.y) * 150.0;
        coord += sin(dist * 12.0 - uTime * 3.0) * 8.0 * influence;

        float pattern = sin(coord);
        vec4 tex = texture2D(tMap, uv);
        float lum = getLuminance(tex.rgb);

        float threshold = (1.0 - lum) * 1.8 - 0.9;
        float line = smoothstep(-0.1, 0.1, pattern - threshold);

        // Multi-layered cross hatching in shadow regions
        if (lum < 0.4) {
          float crossCoord = (uv.x - uv.y) * 150.0;
          crossCoord -= sin(dist * 12.0 - uTime * 3.0) * 8.0 * influence;
          float crossPattern = sin(crossCoord);
          float crossThreshold = (0.4 - lum) * 2.0 - 1.0;
          float crossLine = smoothstep(-0.1, 0.1, crossPattern - crossThreshold);
          line = max(line, crossLine);
        }

        vec3 paperColor = vec3(0.96, 0.95, 0.94);
        vec3 lineColor = vec3(0.12, 0.12, 0.13);
        vec3 engraving = mix(paperColor, lineColor, line);

        // Blend colors based on cursor presence
        vec3 finalColor = mix(engraving, tex.rgb, 0.15 + influence * 0.45);
        gl_FragColor = vec4(finalColor, tex.a);
      }
    

void main() {
  main_effect();
  gl_FragColor = mix(texture2D(tMap, vUv), gl_FragColor, uHover);
}