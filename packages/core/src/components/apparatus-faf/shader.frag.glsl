// FAF Medieval Alchemical Gilding Transmutation (Illuminated Manuscript) Fragment Shader
// Features: egg-tempera paint rendering (fully visible idle state), fractal gold leaf
// crystallization wave front, 3D embossed gold specular shading, multi-tone gold palette,
// cursor-reactive light, metallic Fresnel rim, and organic noise-driven shimmer.
// Banned effects: no glassmorphism, no neon glows, no cursor spotlight radial gradients.

uniform sampler2D tMap;          // Knight image
uniform float uTime;
uniform vec2 uResolution;
uniform float uAspect;
uniform float uHover;
uniform vec2 uMouse;
uniform float uHoverActive;
uniform float uClickWave;

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

// 3-octave fBm for fine organic textures
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

  // Sample original image and calculate luminance
  vec4 imgColor = texture2D(tMap, uv);
  float lum = dot(imgColor.rgb, vec3(0.299, 0.587, 0.114));

  // Organic gold leaf boundary edge noise
  float goldNoise = fbm(correctedUv * 160.0);

  // --- 1. Height-Map Normal Generation (Sobel/Normal Mapping) ---
  float d = 1.5 / uResolution.x;
  float lumLeft = dot(texture2D(tMap, uv + vec2(-d, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
  float lumRight = dot(texture2D(tMap, uv + vec2(d, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
  float lumUp = dot(texture2D(tMap, uv + vec2(0.0, d)).rgb, vec3(0.299, 0.587, 0.114));
  float lumDown = dot(texture2D(tMap, uv + vec2(0.0, -d)).rgb, vec3(0.299, 0.587, 0.114));
  
  // Normal perturbation based on image luminance height map
  vec3 N = normalize(vec3((lumLeft - lumRight) * 5.0, (lumDown - lumUp) * 5.0, 1.0));

  // Add paint brush canvas texture to the normal mapping
  float canvasGrain = fbm(correctedUv * 320.0) * 0.12;
  N = normalize(N + vec3(canvasGrain, canvasGrain, 0.0));

  // --- 2. Cursor-Reactive Light Direction ---
  // Blend static candlelit key toward cursor position on hover
  vec3 staticLight = normalize(vec3(-0.35, 0.45, 0.8));
  vec3 cursorLight = normalize(vec3((uMouse - 0.5) * 1.2, 0.65));
  vec3 L = normalize(mix(staticLight, cursorLight, uHoverActive * 0.55));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  
  float ndl = max(dot(N, L), 0.0);
  float spec = pow(max(dot(N, H), 0.0), 32.0);
  
  // Pristine, full-color original image when idle, gaining rich normal-mapped specularity as the hover wave approaches
  vec3 paintColor = mix(imgColor.rgb, imgColor.rgb * (ndl * 0.9 + 0.25) + vec3(0.9, 0.95, 1.0) * spec * 0.38, uHoverActive * 0.65);

  // --- 3. Dynamic Crystallization Wave Front Calculation ---
  vec2 correctedMouse = vec2(uMouse.x * uAspect, uMouse.y);
  float cursorDist = distance(correctedUv, correctedMouse);
  
  // Gilding wave front propagates outwards from the cursor
  // Boosted by the click surge (uClickWave) for full screen alchemical reaction shockwaves
  float waveFront = (uHoverActive * 1.55 + uClickWave * 0.7) - cursorDist * 1.35;
  
  // Incorporate fractal noise to generate jagged, organic tearing boundaries
  float crystallizationProgress = waveFront + (goldNoise - 0.5) * 0.38;
  
  // Wave mask defining the active gold leaf regions
  float goldMask = smoothstep(0.0, 0.18, crystallizationProgress);

  // --- 4. Multi-Tone Alchemical Gold Leaf Material ---
  // Three-stop luminance-mapped gold palette instead of flat color
  vec3 goldDark = vec3(0.62, 0.45, 0.12);   // Recesses: antique bronze
  vec3 goldMid  = vec3(0.88, 0.72, 0.22);   // Mid-tone: classic gold
  vec3 goldHi   = vec3(0.98, 0.92, 0.55);   // Highlights: white-gold flash
  vec3 GOLD_COLOR = mix(goldDark, mix(goldMid, goldHi, smoothstep(0.5, 0.9, lum)), smoothstep(0.2, 0.5, lum));
  
  // Add drifting gold leaf crinkle noise — enhanced micro-normal perturbation
  float crinkle = fbm(correctedUv * 240.0 + vec2(uTime * 0.03, uTime * 0.015)) * 0.35;
  float crinkleFine = fbm(correctedUv * 480.0 - uTime * 0.02) * 0.15;
  vec3 goldN = normalize(N + vec3(crinkle + crinkleFine, crinkle - crinkleFine, 0.0));
  
  float goldNdl = max(dot(goldN, L), 0.0);
  float goldSpec = pow(max(dot(goldN, H), 0.0), 55.0);
  vec3 goldSpecular = GOLD_COLOR * goldSpec * 4.2;
  vec3 goldDiffuse = GOLD_COLOR * max(goldNdl, 0.35);

  // --- 5. Metallic Fresnel Rim ---
  // Gold reflects more light at glancing angles
  float fresnel = pow(1.0 - max(dot(goldN, V), 0.0), 3.5);
  vec3 fresnelFlash = vec3(0.95, 0.88, 0.5) * fresnel * 0.4;
  
  // Organic noise-driven shimmer (replaces mechanical sine wave)
  float shimmer = fbm(correctedUv * 80.0 + uTime * 0.15) * 0.18 + 0.88;
  
  // Highlight the raised plates and details of the armor with specular gold
  float armorPlates = smoothstep(0.42, 0.82, lum);
  vec3 goldLeafColor = mix(goldDiffuse * 0.6 + goldSpecular * 0.15, (goldDiffuse + goldSpecular) * shimmer, armorPlates);
  
  // Add Fresnel rim to gold leaf
  goldLeafColor += fresnelFlash * goldMask;

  // --- 6. Blending & Outputs ---
  // Blend the colored painting with the shiny gold leaf
  vec3 finalColor = mix(paintColor, goldLeafColor, goldMask);
  
  // Crease shadow at the crystallization boundary edge to give gold foil 3D height
  float borderShadow = smoothstep(-0.06, 0.0, crystallizationProgress) * (1.0 - goldMask);
  finalColor = mix(finalColor, finalColor * 0.32, borderShadow * 0.78);

  gl_FragColor = vec4(finalColor, 1.0);
}