uniform float uHover;
uniform float uConcept;
uniform float uAspect;
uniform vec2 uResolution;


      uniform sampler2D tMap;
      uniform vec2 uMouse;
      varying vec2 vUv;

      float getLuminance(vec3 color) {
        return dot(color, vec3(0.299, 0.587, 0.114));
      }

      void main_effect() {
        vec2 uv = vUv;
        vec4 tex = texture2D(tMap, uv);

        // Sobel edge filter to generate x-ray wireframes
        vec2 texel = 1.0 / uResolution;
        float hL = getLuminance(texture2D(tMap, uv - vec2(texel.x, 0.0)).rgb);
        float hR = getLuminance(texture2D(tMap, uv + vec2(texel.x, 0.0)).rgb);
        float hB = getLuminance(texture2D(tMap, uv - vec2(0.0, texel.y)).rgb);
        float hT = getLuminance(texture2D(tMap, uv + vec2(0.0, texel.y)).rgb);

        float edge = sqrt((hR - hL) * (hR - hL) + (hT - hB) * (hT - hB)) * 4.0;
        vec3 wireframe = vec3(1.0, 0.0, 0.45) * edge;

        vec2 correctedUv = vec2(uv.x * uAspect, uv.y);
        vec2 correctedMouse = vec2(uMouse.x * uAspect, uMouse.y);
        float dist = distance(correctedUv, correctedMouse);
        float mask = smoothstep(0.18, 0.20, dist);

        // Focus lens revealing neon outlines underneath
        vec3 finalColor = mix(wireframe, tex.rgb, mask);
        gl_FragColor = vec4(finalColor, tex.a);
      }
    

void main() {
  main_effect();
  gl_FragColor = mix(texture2D(tMap, vUv), gl_FragColor, uHover);
}