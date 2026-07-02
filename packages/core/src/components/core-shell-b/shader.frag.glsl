uniform float uHover;
uniform float uConcept;


      uniform sampler2D tMap;
      uniform vec2 uMouse;
      uniform float uTime;

      uniform vec2 uRippleCenters[6];
      uniform float uRippleTimes[6];
      uniform float uRippleIntensities[6];

      varying vec2 vUv;

      // 2D Hash function for value noise
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      // 2D Value Noise
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                   mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
      }

      // Fractional Brownian Motion (3 Octaves)
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
        vec2 totalOffset = vec2(0.0);
        vec3 glowColor = vec3(0.0);

        // 1. Upward-flowing continuous heat convection field on hover
        vec2 shimmerOffset = vec2(
          fbm(uv * 7.0 - vec2(0.0, uTime * 1.4)),
          fbm(uv * 7.0 + vec2(uTime * 0.8, -uTime * 1.6))
        ) - 0.5;

        totalOffset += shimmerOffset * 0.025 * uHover;

        // 2. Loop over the active click combustion shockwaves
        for (int i = 0; i < 6; i++) {
          float intensity = uRippleIntensities[i];
          if (intensity > 0.001) {
            float age = uTime - uRippleTimes[i];

            // Warp the coordinate grid to make the wave boundaries jagged and flickering
            vec2 noiseWarp = vec2(
              fbm(uv * 9.0 + age * 1.8),
              fbm(uv * 9.0 - age * 1.8 + 1.5)
            ) - 0.5;

            // Distorted distance from point to ripple center
            vec2 distortedPoint = uv + noiseWarp * 0.08 * (1.0 + age * 0.4);
            float dist = distance(distortedPoint, uRippleCenters[i]);

            // Expansion of the combustion wavefront
            float speed = 1.35;
            float radius = age * speed;

            // Distance of pixel from the expanding combustion front
            float delta = dist - radius;

            // Narrow energy envelope mask around wavefront
            float falloff = exp(-abs(delta) * 16.0);

            // Shockwave refraction offset
            float freq = 45.0;
            float slope = cos(delta * freq) * freq * 0.003 * intensity * falloff;
            vec2 dir = uv - uRippleCenters[i];
            float len = length(dir);
            vec2 normDir = (len > 0.0001) ? dir / len : vec2(0.0);
            totalOffset += normDir * slope;

            // High-temperature plasma flame glow front (neon orange/gold)
            vec3 firePlasma = vec3(1.5, 0.45, 0.08) * falloff * intensity;

            // Cool electric blue trailing edge in the wake of combustion front
            vec3 electricWake = vec3(0.08, 0.32, 1.4) * smoothstep(0.04, 0.0, delta) * smoothstep(-0.16, -0.06, delta) * intensity;

            glowColor += firePlasma + electricWake;
          }
        }

        // Border stiffness mask to keep the outer edges perfectly stable
        float borderDistX = min(uv.x, 1.0 - uv.x);
        float borderDistY = min(uv.y, 1.0 - uv.y);
        float borderMask = smoothstep(0.0, 0.04, borderDistX) * smoothstep(0.0, 0.04, borderDistY);

        // Sample texture using total displacement vector scaled by the border mask
        vec2 warpedUv = clamp(uv + totalOffset * borderMask, vec2(0.0001), vec2(0.9999));
        vec4 texColor = texture2D(tMap, warpedUv);

        // Add fire glows and spark edges
        vec3 finalColor = texColor.rgb + glowColor * uHover;

        gl_FragColor = vec4(finalColor, texColor.a);
      }
    

void main() {
  main_effect();
  gl_FragColor = mix(texture2D(tMap, vUv), gl_FragColor, uHover);
}