uniform float uHover;
uniform float uConcept;


      uniform sampler2D tMap;
      uniform vec2 uMouse;
      varying vec2 vUv;
      varying vec3 vViewPosition;

      float getLuminance(vec3 color) {
        return dot(color, vec3(0.299, 0.587, 0.114));
      }

      void main_effect() {
        vec2 uv = vUv;
        vec2 texel = vec2(1.0 / 512.0);

        float hL = getLuminance(texture2D(tMap, uv - vec2(texel.x, 0.0)).rgb);
        float hR = getLuminance(texture2D(tMap, uv + vec2(texel.x, 0.0)).rgb);
        float hB = getLuminance(texture2D(tMap, uv - vec2(0.0, texel.y)).rgb);
        float hT = getLuminance(texture2D(tMap, uv + vec2(0.0, texel.y)).rgb);

        float dx = (hR - hL) * 2.5;
        float dy = (hT - hB) * 2.5;

        vec3 normal = normalize(vec3(-dx, -dy, 0.15));

        vec3 lightPos = vec3(uMouse.x, uMouse.y, 0.35);
        vec3 pixelPos = vec3(uv.x, uv.y, 0.0);
        vec3 lightDir = normalize(lightPos - pixelPos);

        float dist = distance(uv, uMouse);
        float attenuation = exp(-dist * 2.5);

        float diff = max(dot(normal, lightDir), 0.0) * 0.75 + 0.25;

        vec3 viewDir = normalize(vViewPosition);
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(normal, halfDir), 0.0), 64.0) * 0.9 * attenuation;

        vec4 tex = texture2D(tMap, uv);
        vec3 finalColor = tex.rgb * diff + vec3(spec);
        gl_FragColor = vec4(finalColor, tex.a);
      }
    

void main() {
  main_effect();
  gl_FragColor = mix(texture2D(tMap, vUv), gl_FragColor, uHover);
}