uniform sampler2D tMap;
uniform vec2 uMouse;
uniform float uTime;
uniform float uHover;
uniform vec2 uResolution;
uniform float uAspect;
uniform vec2 uVelocity;
uniform float uHoverActive;

varying vec2 vUv;

// Base paper board colors
#define PAPER_COLOR vec3(0.91, 0.90, 0.86)
#define CARBON_INK vec3(0.06, 0.06, 0.08)

// Subtractive primary pigment inks for chromatography separation
#define PIGMENT_CYAN vec3(0.05, 0.58, 0.82)
#define PIGMENT_MAGENTA vec3(0.88, 0.08, 0.52)
#define PIGMENT_YELLOW vec3(0.96, 0.88, 0.10)

// Hash function
float hash2D(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// 2D Value Noise for organic bleeding
float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = hash2D(i);
  float b = hash2D(i + vec2(1.0, 0.0));
  float c = hash2D(i + vec2(0.0, 1.0));
  float d = hash2D(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Get brightness
float getLuminance(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

void main() {
  vec2 uv = vUv;

  // Correct aspect ratio for circular distance calculations
  vec2 correctedUv = vec2(uv.x * uAspect, uv.y);
  vec2 correctedMouse = vec2(uMouse.x * uAspect, uMouse.y);
  float rawDist = distance(correctedUv, correctedMouse);

  // Original texture sampling
  vec4 tex = texture2D(tMap, uv);
  float lum = getLuminance(tex.rgb);

  // 1. PAPER BOARD STRUCTURE
  // Long fibrous paper pulp noise (asymmetric scale for fiber vectors)
  float fiber1 = noise2D(uv * vec2(160.0, 8.0) + uv.y * 20.0);
  float fiber2 = noise2D(uv * vec2(8.0, 120.0) - uv.x * 15.0);
  float paperFibers = (smoothstep(0.42, 0.58, fiber1) * 0.03) + (smoothstep(0.45, 0.55, fiber2) * 0.02);
  vec3 basePaper = PAPER_COLOR - vec3(paperFibers);

  // Base printed carbon black ink on paper
  vec3 printedInk = mix(CARBON_INK, basePaper, lum);

  // 2. SOLVENT PROPAGATION
  // Solvent crawls along paper fiber grain vector fields
  float bleedNoise = noise2D(uv * 12.0 + vec2(uTime * 0.1, -uTime * 0.08));
  float velocityFactor = length(uVelocity) * 0.15;
  
  // Total reaction distance distorted by fibers and velocity momentum
  float reactionDist = rawDist + (bleedNoise - 0.5) * 0.06 * uHoverActive - velocityFactor * uHoverActive;

  // 3. CHROMATOGRAPHIC SEPARATION (Rf factor band splitting)
  // Yellow moves fastest (highest Rf), Magenta is medium, Cyan is slowest (lowest Rf)
  float frontYellow = smoothstep(0.36, 0.06, reactionDist) * uHoverActive;
  float frontMagenta = smoothstep(0.26, 0.06, reactionDist) * uHoverActive;
  float frontCyan = smoothstep(0.16, 0.06, reactionDist) * uHoverActive;

  // Compute subtractive ink intensity (darker regions hold more ink to bleed)
  float inkDensity = 1.0 - lum;

  // Build the color bands of the chromatograph (subtractive pigment subtraction)
  vec3 chromatograph = basePaper;

  // Subtractive cyan layer
  float cyanAmount = frontCyan * inkDensity;
  chromatograph -= (vec3(1.0) - PIGMENT_CYAN) * cyanAmount * 0.9;

  // Subtractive magenta layer (isolated band)
  float magentaAmount = frontMagenta * (1.0 - frontCyan) * inkDensity;
  chromatograph -= (vec3(1.0) - PIGMENT_MAGENTA) * magentaAmount * 0.95;

  // Subtractive yellow layer (outer edge front band)
  float yellowAmount = frontYellow * (1.0 - frontMagenta) * inkDensity;
  chromatograph -= (vec3(1.0) - PIGMENT_YELLOW) * yellowAmount * 0.9;

  // 4. CENTRAL WASHOUT
  // Direct solvent under the cursor washes ink away entirely, leaving bleached paper
  float washOut = smoothstep(0.08, 0.0, reactionDist) * uHoverActive;
  chromatograph = mix(chromatograph, basePaper, washOut * 0.88);

  // Blend base printed ink with chromatographic bleed
  // We transition from printed carbon ink to chromatograph where the solvent has reached (frontYellow > 0)
  vec3 finalColor = mix(printedInk, chromatograph, frontYellow);

  // 5. AMBIENT HUMIDITY BLEED (Idle State)
  // Slow micro-bleeding of ink edges at rest over time
  float ambientFront = sin(uv.y * 300.0) * cos(uv.x * 280.0) * 0.003;
  float edgeBleed = smoothstep(0.48 + ambientFront, 0.52 + ambientFront, lum);
  // Add a very subtle cyan fringe around dry ink boundaries to look organic
  vec3 idleColor = mix(CARBON_INK + vec3(0.0, 0.04, 0.08) * (1.0 - edgeBleed), basePaper, edgeBleed);

  finalColor = mix(idleColor, finalColor, uHoverActive);

  gl_FragColor = vec4(finalColor, 1.0);
}
