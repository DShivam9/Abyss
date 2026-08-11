// FJVFBA Medieval Acid Etching & Verdigris Copper Patina Fragment Shader
// Features: normal-mapped engraved copperplate base, cursor-reactive raking light,
// chemical ink line bleed (dissolving portrait details), visible candle-flicker highlight,
// line-recess based verdigris tarnish growth, velocity-biased directional oxidation,
// angle-dependent thin-film iridescent tarnish margins, soft colored crystalline sparkles,
// acid depth warp, and specular masking.
// Banned effects: no glassmorphism, no neon glows, no cursor spotlight radial gradients.

uniform sampler2D tMap;          // Source image
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

// 3-octave fBm for metal tarnish and paper grain
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

  // --- 1. Copperplate Normal Mapping & Specular Sheen ---
  float d = 1.2 / uResolution.x;
  float lumLeft = dot(texture2D(tMap, clamp(uv + vec2(-d, 0.0), 0.001, 0.999)).rgb, vec3(0.299, 0.587, 0.114));
  float lumRight = dot(texture2D(tMap, clamp(uv + vec2(d, 0.0), 0.001, 0.999)).rgb, vec3(0.299, 0.587, 0.114));
  float lumUp = dot(texture2D(tMap, clamp(uv + vec2(0.0, d), 0.001, 0.999)).rgb, vec3(0.299, 0.587, 0.114));
  float lumDown = dot(texture2D(tMap, clamp(uv + vec2(0.0, -d), 0.001, 0.999)).rgb, vec3(0.299, 0.587, 0.114));
  
  vec3 N = normalize(vec3((lumLeft - lumRight) * 3.8, (lumDown - lumUp) * 3.8, 1.0));

  // --- Cursor-Reactive Raking Light ---
  vec3 staticLight = normalize(vec3(-0.3, 0.42, 0.85));
  vec3 cursorLight = normalize(vec3((uMouse - 0.5) * 1.1, 0.7));
  vec3 L = normalize(mix(staticLight, cursorLight, uHoverActive * 0.5));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  
  // High specular exponent for polished metal gloss with Fresnel
  float spec = pow(max(dot(N, H), 0.0), 36.0);
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  spec = spec + fresnel * 0.15; // Metals reflect more at glancing angles
  
  // Visible candle flame flicker (additive, not multiplied into invisibility)
  float flicker = 1.0 + sin(uTime * 10.0) * 0.06 + cos(uTime * 3.7) * 0.04;

  // Base luminance before coordinate warp for growth mask
  float baseLum = dot(texture2D(tMap, uv).rgb, vec3(0.299, 0.587, 0.114));
  float lineFactor = 1.0 - baseLum;

  // --- 2. Velocity-Biased Verdigris Tarnish Growth ---
  float growthThreshold = uHoverActive * 0.88 + uClickWave * 0.52;
  float crystalNoise = fbm(correctedUv * 18.0 + uTime * 0.03);
  
  // Velocity biases oxidation spread direction (acid drips where cursor drags)
  float velocityMag = length(uVelocity);
  vec2 biasDir = normalize(uVelocity + vec2(0.001));
  float directionalBias = dot(normalize(correctedUv - correctedMouse + 0.001), biasDir) * 0.12 * smoothstep(0.02, 0.4, velocityMag);
  
  float oxidationMask = smoothstep(0.92 - growthThreshold * 0.78, 0.60 - growthThreshold * 0.78, crystalNoise * 0.45 + lineFactor * 0.55 + directionalBias);
  oxidationMask *= uHoverActive; // Plate stays pristine when idle

  // --- 3. Chemical Ink Line Bleed & Dissolution ---
  vec2 bleedOffset = vec2(
    fbm(correctedUv * 16.0 + uTime * 0.1) - 0.5,
    fbm(correctedUv * 16.0 + vec2(9.4, 11.2) + uTime * 0.1) - 0.5
  ) * 0.022 * oxidationMask;

  // Acid depth offset deforms coordinates along normal vectors
  vec2 acidDepthOffset = N.xy * 0.0082 * oxidationMask;
  
  vec2 displacedUv = clamp(uv + bleedOffset + acidDepthOffset, 0.001, 0.999);
  vec4 imgColor = texture2D(tMap, displacedUv);
  float lum = dot(imgColor.rgb, vec3(0.299, 0.587, 0.114));

  // --- 4. Angle-Dependent Thin-Film Iridescent Fringe ---
  // Real thin-film interference cycles through full rainbow based on viewing angle + patina depth
  float fringe = smoothstep(0.03, 0.25, oxidationMask) * (1.0 - smoothstep(0.25, 0.62, oxidationMask));
  float viewAngle = max(dot(N, V), 0.0);
  float thinFilm = fract(viewAngle * 2.5 + oxidationMask * 1.2);
  vec3 iridescentColor = 0.5 + 0.5 * cos(6.28318 * (thinFilm + vec3(0.0, 0.33, 0.67)));
  vec3 fringeGlow = iridescentColor * fringe * 0.55;

  // --- 5. Soft Colored Crystalline Sparkles ---
  vec2 sparkleUv = floor(correctedUv * 780.0);
  float randSparkle = hash(sparkleUv);
  float twinkle = sin(uTime * 14.0 + randSparkle * 6.28) * 0.5 + 0.5;
  float sparkleBrightness = smoothstep(0.985, 0.998, randSparkle) * oxidationMask * twinkle;
  // Tinted sparkles: mix verdigris-cyan and warm crystal white
  vec3 sparkleColor = mix(vec3(0.7, 0.92, 0.82), vec3(0.96, 0.98, 0.90), hash(sparkleUv + 17.3));
  vec3 sparkleGlow = sparkleColor * sparkleBrightness * 0.75;

  // --- 6. Multi-Tone Copper Base ---
  // Patina variation in base copper instead of flat color
  float copperGrain = fbm(correctedUv * 45.0 + 33.0);
  vec3 copperWarm = vec3(0.88, 0.52, 0.30);
  vec3 copperCool = vec3(0.78, 0.44, 0.32);
  vec3 copperBase = mix(copperWarm, copperCool, copperGrain);

  // Dark charcoal carbon ink inside the engraved grooves
  vec3 dryPlate = mix(copperBase * 0.22, copperBase * 1.15, smoothstep(0.36, 0.55, lum));

  // --- 7. Verdigris Patina Texturing ---
  float tarnishTexture = fbm(correctedUv * 260.0) * 0.12;
  vec3 verdigrisColor = vec3(0.25, 0.62, 0.50) + vec3(tarnishTexture * 0.4);

  // --- 8. Composition & Light Masking ---
  // Polished copper plate with specular sheen
  float specularMask = 1.0 - oxidationMask;
  vec3 finalColor = mix(dryPlate + vec3(0.92, 0.86, 0.78) * spec * specularMask * 0.36 * flicker, verdigrisColor, oxidationMask * 0.8);
  
  // Layer heavier tarnish crust in deep oxidation channels
  finalColor = mix(finalColor, verdigrisColor, smoothstep(0.46, 0.78, oxidationMask) * 0.95);

  // Inject iridescent boundary fringe
  finalColor += fringeGlow * (1.0 - smoothstep(0.78, 0.95, oxidationMask));

  // Inject crystalline sparkles
  finalColor += sparkleGlow;

  gl_FragColor = vec4(finalColor, 1.0);
}
