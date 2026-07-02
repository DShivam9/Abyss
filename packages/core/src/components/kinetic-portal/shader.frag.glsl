uniform float uHover;
uniform float uConcept;


      uniform sampler2D tMap;
      uniform vec2 uMouse;
      varying vec2 vUv;

      float getLuminance(vec3 color) {
        return dot(color, vec3(0.299, 0.587, 0.114));
      }

      void main_effect() {
        vec2 uv = vUv;
        float dist = distance(uv, uMouse);
        float influence = exp(-dist * 5.0);

        vec4 tex = texture2D(tMap, uv);
        float lum = getLuminance(tex.rgb);

        // Map luminance spectrum to infrared thermal range
        vec3 thermic = mix(vec3(0.0, 0.0, 0.55), vec3(1.0, 0.0, 0.0), lum);
        thermic = mix(thermic, vec3(1.0, 1.0, 0.0), smoothstep(0.5, 0.8, lum));
        thermic = mix(thermic, vec3(1.0, 1.0, 1.0), smoothstep(0.8, 1.0, lum));

        vec3 finalColor = mix(tex.rgb, thermic, influence);
        gl_FragColor = vec4(finalColor, tex.a);
      }
    

void main() {
  main_effect();
  gl_FragColor = mix(texture2D(tMap, vUv), gl_FragColor, uHover);
}