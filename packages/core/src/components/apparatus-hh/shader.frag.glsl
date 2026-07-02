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
        float radius = 0.16;

        if (dist < radius) {
          // Double-inversion magnifying glass refraction
          vec2 rel = correctedUv - correctedMouse;
          vec2 dir = normalize(rel);
          float ratio = dist / radius;
          float refraction = sin(ratio * 1.57) * 0.6;
          vec2 normalizedDir = vec2(dir.x / uAspect, dir.y);
          vec2 targetUv = uMouse + normalizedDir * (1.0 - refraction) * radius;

          // Droplet shadow border
          float borderShadow = smoothstep(radius - 0.03, radius, dist) * 0.45;
          vec3 col = texture2D(tMap, targetUv).rgb - vec3(borderShadow);

          gl_FragColor = vec4(col, 1.0);
        } else {
          // Realistic water drop shadow offset
          vec2 shadowMouse = uMouse + vec2(0.012, -0.012);
          vec2 correctedShadowMouse = vec2(shadowMouse.x * uAspect, shadowMouse.y);
          float shadowDist = distance(correctedUv, correctedShadowMouse);
          float shadowFactor = (1.0 - smoothstep(radius, radius + 0.04, shadowDist)) * 0.35;

          vec3 col = texture2D(tMap, uv).rgb * (1.0 - shadowFactor);
          gl_FragColor = vec4(col, 1.0);
        }
      }
    

void main() {
  main_effect();
  gl_FragColor = mix(texture2D(tMap, vUv), gl_FragColor, uHover);
}