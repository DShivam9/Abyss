uniform float uHover;
uniform float uConcept;
uniform float uAspect;


      uniform sampler2D tMap;
      uniform vec2 uMouse;
      uniform float uTime;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                   mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(0.87758, 0.47942, -0.47942, 0.87758);
        for (int i = 0; i < 3; i++) {
          v += a * noise(p);
          p = rot * p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      float getHeight(vec2 uv) {
        vec2 flow = vec2(0.25, 0.12) * uTime;
        float h1 = fbm(uv * 6.0 - flow);
        float h2 = fbm(uv * 10.0 + flow + vec2(h1, -h1) * 0.4);
        return h2;
      }

      void main_effect() {
        vec2 uv = vUv;

        // 1. Magnetic pull lens warp around the cursor (gravity well in mercury)
        vec2 correctedUv = vec2(uv.x * uAspect, uv.y);
        vec2 correctedMouse = vec2(uMouse.x * uAspect, uMouse.y);
        float dist = distance(correctedUv, correctedMouse);
        float gravity = exp(-dist * 8.0) * 0.08 * uHover;
        vec2 dir = correctedUv - correctedMouse;
        vec2 normalizedDir = vec2(dir.x / uAspect, dir.y);
        vec2 gravityOffset = normalizedDir * gravity;

        vec2 warpedUv = uv - gravityOffset;

        // 2. Normal map estimation from the heightmap
        float eps = 0.005;
        float h = getHeight(warpedUv);
        float hR = getHeight(warpedUv + vec2(eps, 0.0));
        float hU = getHeight(warpedUv + vec2(0.0, eps));

        vec3 normal = normalize(vec3(-(hR - h) / eps, -(hU - h) / eps, 1.0));

        // 3. Chromatic Aberration Refraction based on normals
        vec2 refractOffset = normal.xy * 0.035 * uHover;

        float borderDistX = min(uv.x, 1.0 - uv.x);
        float borderDistY = min(uv.y, 1.0 - uv.y);
        float borderMask = smoothstep(0.0, 0.04, borderDistX) * smoothstep(0.0, 0.04, borderDistY);
        refractOffset *= borderMask;

        float r = texture2D(tMap, clamp(uv + refractOffset * 1.06, vec2(0.0001), vec2(0.9999))).r;
        float g = texture2D(tMap, clamp(uv + refractOffset, vec2(0.0001), vec2(0.9999))).g;
        float b = texture2D(tMap, clamp(uv + refractOffset * 0.94, vec2(0.0001), vec2(0.9999))).b;
        vec3 refractedColor = vec3(r, g, b);

        // 4. Blinn-Phong specular reflections (light source tracks mouse position)
        vec3 lightDir = normalize(vec3(uMouse - 0.5, 1.3));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 halfDir = normalize(lightDir + viewDir);

        float spec1 = pow(max(dot(normal, halfDir), 0.0), 64.0) * 0.75;
        float spec2 = pow(max(dot(normal, halfDir), 0.0), 256.0) * 0.6;
        float totalSpec = (spec1 + spec2) * uHover;

        vec3 finalColor = refractedColor + vec3(totalSpec);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    

void main() {
  main_effect();
  gl_FragColor = mix(texture2D(tMap, vUv), gl_FragColor, uHover);
}