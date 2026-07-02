uniform float uHover;
uniform float uConcept;
uniform float uAspect;


      uniform sampler2D tMap;
      uniform vec2 uMouse;
      uniform vec2 uVelocity;
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

      void main_effect() {
        vec2 uv = vUv;

        // 1. Continuous dusty wind flow field (horizontally-dominant red storm)
        vec2 windDir = vec2(1.0, 0.35);
        vec2 windOffset = vec2(
          fbm(uv * 5.0 - windDir * uTime * 0.4),
          fbm(uv * 5.0 - windDir * uTime * 0.4 + vec2(1.2, 3.4))
        ) - 0.5;

        vec2 totalOffset = windOffset * 0.02 * uHover;

        // 2. Mouse drag smudge & chromatic channel splitting
        vec2 correctedUv = vec2(uv.x * uAspect, uv.y);
        vec2 correctedMouse = vec2(uMouse.x * uAspect, uMouse.y);
        float dist = distance(correctedUv, correctedMouse);
        float localForce = exp(-dist * 16.0);
        vec2 dragOffset = uVelocity * localForce * 6.0 * uHover;
        totalOffset += dragOffset;

        // Keep borders stiff and stable (no wavy edges on the card frame)
        float borderDistX = min(uv.x, 1.0 - uv.x);
        float borderDistY = min(uv.y, 1.0 - uv.y);
        float borderMask = smoothstep(0.0, 0.04, borderDistX) * smoothstep(0.0, 0.04, borderDistY);

        vec2 finalOffset = totalOffset * borderMask;

        // Chromatic Aberration in the drag trail (splits red/black channels)
        float r = texture2D(tMap, clamp(uv - finalOffset * 1.08, vec2(0.0001), vec2(0.9999))).r;
        float g = texture2D(tMap, clamp(uv - finalOffset, vec2(0.0001), vec2(0.9999))).g;
        float b = texture2D(tMap, clamp(uv - finalOffset * 0.92, vec2(0.0001), vec2(0.9999))).b;
        vec4 texColor = vec4(r, g, b, 1.0);

        // 3. Thermal burn dissolve field directly under cursor
        float burnNoise = fbm(uv * 20.0 + uTime * 4.0);
        float burnRadius = 0.07;
        float burnDist = dist - burnNoise * 0.04;
        float burnEdge = smoothstep(burnRadius, 0.0, burnDist);
        vec3 burnGlow = vec3(1.6, 0.35, 0.06) * burnEdge * localForce * uHover;

        // 4. Procedural floating spark embers trailing from the cursor
        vec2 emberCoord = uv * vec2(30.0, 15.0);
        emberCoord.y -= uTime * 4.0;
        emberCoord.x -= uTime * 1.2;
        float sparkNoise = noise(floor(emberCoord));
        float sparkIntensity = smoothstep(0.97, 1.0, sparkNoise);
        float sparkDist = distance(fract(emberCoord), vec2(0.5));
        float spark = smoothstep(0.18, 0.0, sparkDist) * sparkIntensity;

        float wakeField = exp(-distance(correctedUv, correctedMouse) * 12.0);
        vec3 sparks = vec3(1.8, 0.55, 0.08) * spark * wakeField * uHover;

        vec3 finalColor = texColor.rgb + burnGlow + sparks;
        gl_FragColor = vec4(finalColor, 1.0);
      }
    

void main() {
  main_effect();
  gl_FragColor = mix(texture2D(tMap, vUv), gl_FragColor, uHover);
}