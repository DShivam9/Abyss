uniform float uHover;
uniform float uConcept;
uniform float uHoverTime;


      uniform sampler2D tMap;
      uniform vec2 uMouse;
      uniform float uTime;
      varying vec2 vUv;

      float getLuminance(vec3 color) {
        return dot(color, vec3(0.299, 0.587, 0.114));
      }

      // Multi-octave organic noise for global fluid flow turbulence
      vec2 flowNoise(vec2 p, float time) {
        float x = sin(p.x * 5.0 + time * 0.8) * cos(p.y * 4.0 - time * 0.6) * 0.5;
        float y = cos(p.x * 3.5 - time * 0.7) * sin(p.y * 5.5 + time * 1.1) * 0.5;
        // Secondary octave for micro-turbulence
        x += sin(p.x * 11.0 - time * 1.8) * 0.15;
        y += cos(p.y * 13.0 + time * 2.2) * 0.15;
        return vec2(x, y);
      }

      // Procedural studio environment map reflection
      vec3 getEnvironment(vec3 r) {
        float softboxA = smoothstep(0.48, 0.82, sin(r.x * 2.5 + r.y * 3.2) * cos(r.z * 1.8) * 0.5 + 0.5);
        float softboxB = smoothstep(0.55, 0.88, cos(r.x * 4.5 - r.y * 2.5) * sin(r.z * 3.2) * 0.5 + 0.5);
        float horizon = smoothstep(0.015, 0.0, abs(r.y)) * 0.22;

        vec3 lightColor = mix(vec3(0.06, 0.06, 0.08), vec3(0.92, 0.95, 1.0), softboxA);
        lightColor = mix(lightColor, vec3(1.0, 0.85, 0.65), softboxB);
        return lightColor + vec3(horizon);
      }

      void main_effect() {
        vec2 uv = vUv;

        // Melting progress starts at 7.0 seconds of hover, fully melted at 12.0 seconds
        float meltProgress = smoothstep(7.0, 12.0, uHoverTime);

        // 1. Global fluid flow noise
        vec2 flow = flowNoise(uv * 3.8, uTime * 0.5);

        // 2. Global mouse wind direction (shifts entire sheet current)
        vec2 wind = (uMouse - 0.5) * 0.032;

        // 3. Gravity melt pull dragging pixels downward (dripping streams)
        float dripFactor = sin(uv.x * 38.0) * 0.12 + 0.88;
        float meltY = meltProgress * 0.42 * (1.0 - uv.y) * dripFactor;

        // Unified global coordinate warp with gravity drip
        vec2 warpedUv = uv;
        warpedUv.x += (flow.x * 0.012 + wind.x) * uHover;
        warpedUv.y += (flow.y * 0.012 + wind.y) * uHover - meltY;

        // Clamp coordinates at boundaries to prevent texture wrapping artifacts
        warpedUv = clamp(warpedUv, vec2(0.0001), vec2(0.9999));

        // Chromatic dispersion (subtle prism split along flow vectors)
        vec2 dispVec = ((flow * 0.005 + wind * 0.15) - vec2(0.0, meltProgress * 0.08)) * uHover;
        vec3 texColor = vec3(0.0);
        texColor.r = texture2D(tMap, clamp(warpedUv + dispVec, vec2(0.0001), vec2(0.9999))).r;
        texColor.g = texture2D(tMap, warpedUv).g;
        texColor.b = texture2D(tMap, clamp(warpedUv - dispVec, vec2(0.0001), vec2(0.9999))).b;

        // 4. Extract chrome metal highlights
        float brightness = getLuminance(texColor);
        float metalMask = smoothstep(0.42, 0.90, brightness);

        // Calculate dynamic surface normals from image gradients
        float hL = getLuminance(texture2D(tMap, clamp(warpedUv - vec2(0.002, 0.0), vec2(0.0001), vec2(0.9999))).rgb);
        float hR = getLuminance(texture2D(tMap, clamp(warpedUv + vec2(0.002, 0.0), vec2(0.0001), vec2(0.9999))).rgb);
        float hB = getLuminance(texture2D(tMap, clamp(warpedUv - vec2(0.0, 0.002), vec2(0.0001), vec2(0.9999))).rgb);
        float hT = getLuminance(texture2D(tMap, clamp(warpedUv + vec2(0.0, 0.002), vec2(0.0001), vec2(0.9999))).rgb);

        float dx = (hR - hL) * 3.5;
        float dy = (hT - hB) * 3.5;

        // Lower normal depth as it melts to make the metal look flat, wet, and highly liquid
        vec3 normal = normalize(vec3(-dx, -dy, mix(0.25, 0.12, meltProgress)));

        // Calculate reflection vector
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 reflectDir = reflect(-viewDir, normal);

        // 5. Sample procedural environment
        vec3 envReflection = getEnvironment(reflectDir);

        // 6. Specular highlight shifting globally
        vec3 lightDir = normalize(vec3((uMouse.x - 0.5) * 2.0, (uMouse.y - 0.5) * 2.0, 0.5));
        vec3 halfDir = normalize(lightDir + viewDir);
        vec3 anisotropicNormal = normalize(normal * vec3(2.5, 1.0, 1.0));
        float spec = pow(max(dot(anisotropicNormal, halfDir), 0.0), 38.0) * 0.45 * uHover;

        // 7. Iridescent sheen on highlights
        vec3 iridescence = vec3(
          0.5 + 0.5 * cos(normal.z * 6.283 + 0.0),
          0.5 + 0.5 * cos(normal.z * 6.283 + 2.0),
          0.5 + 0.5 * cos(normal.z * 6.283 + 4.0)
        );
        vec3 metalHighlight = mix(envReflection, iridescence * 1.1, 0.22) * spec * metalMask;

        // Mercury sheen
        vec3 mercurySheen = envReflection * max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0);

        // Combine colors
        vec3 finalColor = mix(texColor, envReflection * texColor * 1.6, metalMask);
        // Blend liquid sheen globally along flow ridges (and increase with melt progress)
        float flowIntensity = length(flow) * 0.35;
        finalColor = mix(finalColor, mercurySheen, (flowIntensity + meltProgress * 0.5) * uHover);
        finalColor += metalHighlight;

        // 8. Global background crimson starry glow shifting with wind
        float redMask = step(0.18, texColor.r) * step(texColor.g, 0.12) * step(texColor.b, 0.12);
        float globalGlow = exp(-distance(uv, vec2(0.5) + wind * 4.0) * 2.8);
        vec3 redGlow = vec3(0.32, 0.01, 0.03) * globalGlow * redMask * uHover;
        finalColor += redGlow;

        vec3 mixedColor = mix(texColor, finalColor, uHover);

        gl_FragColor = vec4(mixedColor, 1.0);
      }
    

void main() {
  main_effect();
  gl_FragColor = mix(texture2D(tMap, vUv), gl_FragColor, uHover);
}