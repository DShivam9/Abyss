// IALFA Medieval Bas-Relief Stone Carving Fragment Shader
// Features: organic sandstone/limestone vellum texture, 3D surface normal reconstruction,
// real-time 8-step ray-marched heightmap shadow casting (self-shadowing), raking torchlight diffuse,
// distance-adaptive shadow stretching, dynamic candle flame flicker/jitter,
// subtle stone specular, screen-space ambient occlusion in carved recesses,
// multi-tone stone with mineral veins, visible ambient-shaded relief idle state,
// and velocity-driven stone dust weathering.
// Banned effects: no glassmorphism, no neon glows, no cursor spotlight radial gradients.

uniform sampler2D tMap;          // Source portrait image
uniform float uTime;
uniform vec2 uResolution;
uniform float uAspect;
uniform float uHoverActive;
uniform float uClickWave;
uniform vec2 uMouse;
uniform vec2 uVelocity;

varying vec2 vUv;

// 2D Hash
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// 2D Value Noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i + vec2(0.0, 0.0));
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// 3-octave fBm for stone grain and surface wear
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 3; ++i) {
    v += a * noise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 correctedUv = vec2(uv.x * uAspect, uv.y);
  vec2 correctedMouse = vec2(uMouse.x * uAspect, uMouse.y);

  // Sample portrait image and calculate height details
  vec4 imgColor = texture2D(tMap, uv);
  float baseLum = dot(imgColor.rgb, vec3(0.299, 0.587, 0.114));

  // --- 1. 3D Bas-Relief Normal Mapping ---
  float d = 1.4 / uResolution.x;
  float lumLeft = dot(texture2D(tMap, clamp(uv + vec2(-d, 0.0), 0.001, 0.999)).rgb, vec3(0.299, 0.587, 0.114));
  float lumRight = dot(texture2D(tMap, clamp(uv + vec2(d, 0.0), 0.001, 0.999)).rgb, vec3(0.299, 0.587, 0.114));
  float lumUp = dot(texture2D(tMap, clamp(uv + vec2(0.0, d), 0.001, 0.999)).rgb, vec3(0.299, 0.587, 0.114));
  float lumDown = dot(texture2D(tMap, clamp(uv + vec2(0.0, -d), 0.001, 0.999)).rgb, vec3(0.299, 0.587, 0.114));
  
  vec3 N = normalize(vec3((lumLeft - lumRight) * 4.2, (lumDown - lumUp) * 4.2, 1.0));

  // --- 2. Screen-Space Ambient Occlusion (Carved Recesses) ---
  // Deep grooves trap light: compare local luminance to neighborhood average
  float localAvg = (lumLeft + lumRight + lumUp + lumDown) * 0.25;
  float ao = smoothstep(-0.08, 0.06, baseLum - localAvg);
  float aoFactor = 0.6 + ao * 0.4;

  // --- 3. Dynamic Torchlight & Flame Jitter ---
  float flickerTime = uTime * 8.5;
  vec2 flameJitter = vec2(
    sin(flickerTime) * 0.008 * cos(flickerTime * 0.45),
    cos(flickerTime) * 0.008 * sin(flickerTime * 0.55)
  ) * uHoverActive;

  vec2 activeLightPos = correctedMouse + flameJitter;
  vec2 lightVec = activeLightPos - correctedUv;
  float lightDist = length(lightVec) + 0.0001;
  vec3 L = normalize(vec3(lightVec, 0.45));

  // Diffuse + Specular
  float diffuse = max(dot(N, L), 0.0);
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  float stoneSpec = pow(max(dot(N, H), 0.0), 18.0) * 0.22;

  // --- 4. 8-Step Ray-Marched Heightmap Shadows (Soft Accumulation) ---
  float stepSize = mix(0.006, 0.016, clamp(lightDist * 1.1, 0.0, 1.0));
  
  float shadow = 1.0;
  vec2 rayDir = normalize(lightVec);
  float currentHeight = baseLum * 0.45;
  
  for (int i = 1; i <= 8; ++i) {
    vec2 sampleUv = uv + rayDir * float(i) * stepSize;
    float sampleHeight = dot(texture2D(tMap, clamp(sampleUv, 0.001, 0.999)).rgb, vec3(0.299, 0.587, 0.114)) * 0.45;
    
    float rayHeight = currentHeight + float(i) * 0.042;
    // Distance-weighted occlusion: far steps contribute less
    float occlusionWeight = 1.0 - float(i) * 0.08;
    if (sampleHeight > rayHeight) {
      shadow -= 0.16 * occlusionWeight;
    }
  }
  shadow = clamp(shadow, 0.18, 1.0);

  // --- 5. Multi-Tone Stone Substrate with Mineral Veins ---
  float stoneGrain = fbm(correctedUv * 240.0) * 0.08;
  float vein = fbm(correctedUv * 8.0 + 42.0);
  vec3 warmStone = vec3(0.88, 0.82, 0.72);
  vec3 coolStone = vec3(0.78, 0.80, 0.82);
  vec3 stoneColor = mix(warmStone, coolStone, vein) - vec3(stoneGrain);

  // --- 6. Weathering Stone Dust Particles ---
  float dust = hash(floor(correctedUv * 900.0 + uTime * 0.6));
  float velocityMag = length(uVelocity);
  float dustMask = step(0.984, dust) * uHoverActive * smoothstep(0.05, 0.65, velocityMag) * 0.42;

  // --- 7. Composition ---
  vec3 lightColor = vec3(0.98, 0.88, 0.70);
  
  // AO-modulated ambient
  vec3 ambient = stoneColor * 0.26 * aoFactor;
  
  // Flame brightness pulse
  float flamePulse = 1.0 + sin(uTime * 12.0) * 0.04 * cos(uTime * 4.3) * 0.03;
  
  // Torchlight: diffuse + specular, shadowed, AO-masked
  vec3 rakingLight = stoneColor * lightColor * diffuse * shadow * 1.25 * flamePulse * aoFactor;
  rakingLight += stoneColor * lightColor * stoneSpec * shadow;

  // --- 8. Idle State: Oblique Ambient Relief ---
  // More oblique angle than before to reveal relief depth even at rest
  vec3 L_ambient = normalize(vec3(-0.3, 0.42, 0.65));
  float diffuse_ambient = max(dot(N, L_ambient), 0.0);
  // Subtle idle specular sheen
  vec3 H_ambient = normalize(L_ambient + V);
  float idleSpec = pow(max(dot(N, H_ambient), 0.0), 22.0) * 0.1;
  vec3 ambientShaded = stoneColor * (0.35 + diffuse_ambient * 0.75 * baseLum) * aoFactor + stoneColor * idleSpec;

  // Transition from ambient shaded relief (idle) to dynamic torchlit relief (hover)
  vec3 finalColor = mix(ambientShaded, ambient + rakingLight, uHoverActive);

  // Inject weathered stone dust particles
  finalColor += vec3(0.96, 0.94, 0.88) * dustMask;

  gl_FragColor = vec4(finalColor, 1.0);
}
