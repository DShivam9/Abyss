uniform float uHover;
uniform float uConcept;


      uniform sampler2D tMap;
      uniform vec2 uMouse;
      varying vec2 vUv;
      varying vec3 vViewPosition;

      void main_effect() {
        vec3 normal = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition)));
        
        vec2 lightOffset = (uMouse - vec2(0.5, 0.5)) * 2.0;
        vec3 lightDir = normalize(vec3(lightOffset.x, lightOffset.y, 0.75));
        vec3 viewDir = normalize(vViewPosition);
        vec3 halfDir = normalize(lightDir + viewDir);

        float spec = pow(max(dot(normal, halfDir), 0.0), 45.0) * 0.65 * uHover;

        vec2 refractOffset = normal.xy * 0.055 * uHover;
        vec2 warpedUv = clamp(vUv + refractOffset, vec2(0.0001, 0.0001), vec2(0.9999, 0.9999));
        
        vec3 texColor = vec3(0.0);
        texColor.r = texture2D(tMap, clamp(vUv + refractOffset * 1.15, vec2(0.0001, 0.0001), vec2(0.9999, 0.9999))).r;
        texColor.g = texture2D(tMap, warpedUv).g;
        texColor.b = texture2D(tMap, clamp(vUv + refractOffset * 0.85, vec2(0.0001, 0.0001), vec2(0.9999, 0.9999))).b;

        float fresnel = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 3.5);
        vec3 sheenColor = vec3(0.88, 0.92, 1.0) * fresnel * 0.45 * uHover;

        float stress = length(normal.xy) * uHover;
        float gridFreq = 160.0;
        float gridPattern = smoothstep(0.94, 0.98, sin(vUv.x * gridFreq)) + smoothstep(0.94, 0.98, sin(vUv.y * gridFreq));
        vec3 stressGlow = vec3(1.0, 0.18, 0.42) * gridPattern * stress * 0.85;

        vec3 finalColor = texColor + sheenColor + vec3(spec) + stressGlow;

        float borderDistX = min(vUv.x, 1.0 - vUv.x);
        float borderDistY = min(vUv.y, 1.0 - vUv.y);
        float borderMask = smoothstep(0.0, 0.03, borderDistX) * smoothstep(0.0, 0.03, borderDistY);

        vec3 baseColor = texture2D(tMap, vUv).rgb;
        gl_FragColor = vec4(mix(baseColor, finalColor, borderMask), 1.0);
      }
    

void main() {
  main_effect();
  gl_FragColor = mix(texture2D(tMap, vUv), gl_FragColor, uHover);
}