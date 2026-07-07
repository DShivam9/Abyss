// Medieval Gilded Tapestry Fragment Shader
// Features: swallow-tail cutout, frayed tattered edges, desaturated worn tapestry colors,
// and a global alchemical gold leaf embroidery morph on hover with anisotropic thread specular glints.
// NO cursor spotlights or candlelights.
uniform sampler2D tMap;          // Original oil painting
uniform float uHover;
uniform float uTime;
uniform float uAspect;

uniform vec3 uAmbientColor;      // Cool room ambient shadow fill

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying float vWindDisplacement;  // X-displacement from vertex shader for tassel sway

#define PAPER_COLOR vec3(0.92, 0.89, 0.82)
#define GOLD_COLOR vec3(0.86, 0.68, 0.22)    // Rich alchemical gold leaf
#define INK_COLOR vec3(0.24, 0.20, 0.17)

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

// 2-octave fBm
float fbm(vec2 p) {
  return noise(p) * 0.6 + noise(p * 2.5) * 0.4;
}

void main() {
  vec2 uv = vUv;
  vec2 correctedUv = vec2(uv.x * uAspect, uv.y);

  // High-frequency tattered edge noise
  float edgeNoise = fbm(correctedUv * 80.0) * 0.015;

  // --- 1. Swallow-Tail Pointed Bottom Cutout ---
  float cutHeight = 0.14;
  float xOffset = abs(uv.x - 0.5);
  float swallowTailY = cutHeight - xOffset * 0.28;

  // Discard empty area below swallow-tail and along tattered sides
  if (uv.y < swallowTailY + edgeNoise) discard;
  if (uv.x < 0.015 + edgeNoise || uv.x > 0.985 - edgeNoise) discard;
  if (uv.y > 0.99 - edgeNoise) discard;

  // Sample original painting color and calculate luminance
  vec4 imgColor = texture2D(tMap, uv);
  float luminance = dot(imgColor.rgb, vec3(0.299, 0.587, 0.114));

  // --- 2. Tapestry Thread Bump-Mapping (Perturbed Normal) ---
  vec3 N = normalize(vNormal);
  // Threads on fold crests catch more light than threads in valleys
  float crestBoost = smoothstep(0.0, 1.0, N.z) * 1.4 + 0.6;
  float threadBumpX = cos(correctedUv.x * 1250.0) * 0.08 * crestBoost;
  float threadBumpY = cos(correctedUv.y * 1250.0) * 0.08 * crestBoost;
  vec3 perturbedNormal = normalize(N + vec3(threadBumpX, threadBumpY, 0.0));

  // --- 3. Global Static Light Source (Simulating Grand Window Light) ---
  vec3 L = normalize(vec3(-0.4, 0.6, 0.8));
  vec3 V = normalize(vViewPosition);

  float ndl = max(dot(perturbedNormal, L), 0.0);
  vec3 diffuseLight = ndl * vec3(1.1, 1.05, 0.95);
  vec3 ambientLight = (perturbedNormal.z * 0.5 + 0.5) * uAmbientColor;

  // Fold occlusion: deep valleys between wind folds get less light
  float foldOcclusion = smoothstep(-0.3, 0.2, N.z);
  vec3 clothLighting = diffuseLight * foldOcclusion + ambientLight;

  // --- 4. Thread Weave & Weathering Stains ---
  float threadX = sin(correctedUv.x * 850.0) * 0.14 + 0.86;
  float threadY = sin(correctedUv.y * 850.0) * 0.14 + 0.86;
  float weave = threadX * threadY;
  float stainPattern = fbm(correctedUv * 4.5) * 0.28 + 0.72; // Weathered dirt/wear

  // --- 5. Hemmed Stitching Lines ---
  float distToLeft = uv.x - 0.015;
  float distToRight = 0.985 - uv.x;
  float distToBottom = uv.y - swallowTailY;
  float minEdgeDist = min(min(distToLeft, distToRight), distToBottom);
  
  bool isFringe = uv.y < swallowTailY + 0.035;
  bool isStitched = minEdgeDist > 0.015 && minEdgeDist < 0.024 && !isFringe;
  float stitchPattern = step(0.6, sin(correctedUv.y * 320.0 + correctedUv.x * 320.0)) * 0.55;

  // --- 6. Base Tapestry Colors (Desaturated Battle-Worn Dye) ---
  vec3 desaturatedColor = mix(vec3(luminance), imgColor.rgb, 0.60);
  vec3 colorTapestry = desaturatedColor * clothLighting * weave * stainPattern;

  if (isStitched) {
    colorTapestry = mix(colorTapestry, INK_COLOR * 0.35 * clothLighting, stitchPattern);
  }

  // --- 7. Alchemical Gilded Tapestry (Global Hover Morph) ---
  // Isolate high-contrast details and plates of armor for gold inlay embroidery
  float goldMask = smoothstep(0.48, 0.82, luminance);

  // Anisotropic gold leaf reflection glinting as fabric waves in wind
  vec3 H = normalize(L + V);
  float specular = pow(max(dot(perturbedNormal, H), 0.0), 32.0);
  vec3 goldSpecular = GOLD_COLOR * specular * 2.8;

  // Textured gold thread base
  vec3 goldBase = mix(GOLD_COLOR, GOLD_COLOR * 0.5, sin(correctedUv.x * 1000.0) * 0.2 + 0.8);
  vec3 goldTapestry = (goldBase * clothLighting + goldSpecular) * weave * stainPattern;

  // Mix desaturated tapestry colors with gold leaf embroidery based on detail mask
  vec3 gildedTapestry = mix(colorTapestry, goldTapestry, goldMask * 0.85);

  // --- 8. Final Color Blending ---
  vec3 finalColor = mix(colorTapestry, gildedTapestry, uHover);

  // Render bottom tassels/fringe in gold thread
  if (isFringe) {
    // Tassels sway in the wind — angle the stripe pattern by vertex X-displacement
    float tasselAngle = vWindDisplacement * 6.0;
    float tasselStripe = step(0.5, sin((uv.x + uv.y * tasselAngle) * 650.0)) * 0.25 + 0.75;
    
    float fringeSpec = pow(max(dot(perturbedNormal, H), 0.0), 16.0);
    vec3 goldTassel = (GOLD_COLOR * tasselStripe * clothLighting) + (GOLD_COLOR * fringeSpec * 1.5);
    finalColor = mix(finalColor, goldTassel, 0.95);
  }

  gl_FragColor = vec4(finalColor, 1.0);
}
