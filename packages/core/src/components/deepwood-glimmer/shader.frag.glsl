// Deepwood Glimmer — Scribe's Vellum Crease Fragment Shader
// Renders hand-torn paper borders, high-fidelity aged parchment texture,
// crease fiber stress, and static 2D embossing fold shadow/highlight shading.
// Banned effects: no glassmorphism, no neon glows, no directional cursor light sweep.
// 100% loop-free to guarantee WebGL compilation.

uniform sampler2D tMap;          // Source portrait image
uniform float uTime;
uniform float uAspect;
uniform vec2 uMouse;
uniform float uHover;

// Drag fold uniforms
uniform float uDragActive;
uniform vec2 uDragStart;
uniform vec2 uDragEnd;
uniform float uDragStrength;

// Static crease segments uniforms (Crease History)
uniform vec2 uCreaseAStart;
uniform vec2 uCreaseAEnd;
uniform float uCreaseAStrength;

uniform vec2 uCreaseBStart;
uniform vec2 uCreaseBEnd;
uniform float uCreaseBStrength;

uniform vec2 uCreaseCStart;
uniform vec2 uCreaseCEnd;
uniform float uCreaseCStrength;

uniform vec2 uCreaseDStart;
uniform vec2 uCreaseDEnd;
uniform float uCreaseDStrength;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vModelPosition;

// 2D Hash
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// 2D Value Noise
float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i + vec2(0.0, 0.0));
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fbm for organic edge tearing & splotches
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0, 100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 3; ++i) {
    v += a * noise2D(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

// Distance to line segment
float distToSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// Get fiber stress mask along crease segments
float getStress(vec2 uv, vec2 start, vec2 end, float strength) {
  if (strength <= 0.001) return 0.0;
  float d = distToSegment(uv, start, end);
  // Extremely thin highlighted stress line right along the ridge
  float width = 0.008;
  return (1.0 - d / width) * step(d, width) * strength;
}

// Calculate distance to hand-torn paper borders
float getTornBound(vec2 uv) {
  // Use FBM noise to create a highly organic, natural paper tear outline
  float borderNoise = fbm(uv * 14.0) * 0.015 + fbm(uv * 35.0) * 0.004;
  
  float distToEdgeX = min(uv.x, 1.0 - uv.x);
  float distToEdgeY = min(uv.y, 1.0 - uv.y);
  float distToEdge = min(distToEdgeX, distToEdgeY);
  
  return distToEdge - (0.016 + borderNoise);
}

void main() {
  // --- 1. Hand-Torn Paper Borders ---
  float bound = getTornBound(vUv);
  
  if (bound < 0.0) {
    discard; // Cut out everything outside the torn parchment sheet
  }

  // Raw fibrous frayed edge highlight (lighter cream fibers at the border)
  if (bound < 0.004) {
    float fiberNoise = noise2D(vUv * 650.0);
    vec3 fiberColor = vec3(0.95, 0.90, 0.82) * (1.08 + fiberNoise * 0.14);
    gl_FragColor = vec4(fiberColor, 1.0);
    return;
  }

  // --- 2. High-Fidelity Parchment Material Texture ---
  // High frequency tooth grain (cellulose fibers)
  float paperGrain = noise2D(vUv * 450.0) * 0.045;
  // Low frequency aged brown splotching
  float aging = fbm(vUv * 6.0) * 0.20 + fbm(vUv * 2.0) * 0.18;
  vec3 parchmentBaseColor = vec3(0.94, 0.88, 0.78) - vec3(0.14, 0.22, 0.32) * aging + vec3(paperGrain);

  // Sample portrait texture
  vec2 uvMin = vec2(0.001, 0.001);
  vec2 uvMax = vec2(0.999, 0.999);
  vec2 sampleUv = clamp(vUv, uvMin, uvMax);
  vec4 imgColor = texture2D(tMap, sampleUv);

  // Blend portrait into parchment (multiply blend like real ink printing)
  vec3 baseVellumColor = imgColor.rgb * parchmentBaseColor * 1.22;

  // --- 3. Crease Fiber Stress Highlights ---
  // Paper cellulose fibers turn white/lighter along sharp folds
  float totalStress = 0.0;
  totalStress += getStress(vUv, uDragStart, uDragEnd, uDragStrength);
  totalStress += getStress(vUv, uCreaseAStart, uCreaseAEnd, uCreaseAStrength);
  totalStress += getStress(vUv, uCreaseBStart, uCreaseBEnd, uCreaseBStrength);
  totalStress += getStress(vUv, uCreaseCStart, uCreaseCEnd, uCreaseCStrength);
  totalStress += getStress(vUv, uCreaseDStart, uCreaseDEnd, uCreaseDStrength);
  totalStress = clamp(totalStress, 0.0, 1.0);

  // --- 4. 2D Embossing Fold Shading (Static ambient shadows/highlights) ---
  // Calculates shadows and highlights locally based on the crease gradient,
  // creating a tactile paper fold effect without any artificial cursor light sweep.
  vec2 creaseGrad = vec2(dFdx(totalStress), dFdy(totalStress));
  float emboss = dot(creaseGrad, normalize(vec2(-1.0, 1.0))) * 0.65;
  
  vec3 litColor = mix(baseVellumColor, vec3(0.98, 0.96, 0.92), clamp(emboss, 0.0, 1.0) * 0.40); // slope highlight
  litColor = mix(litColor, vec3(0.12, 0.08, 0.05), clamp(-emboss, 0.0, 1.0) * 0.35);          // slope shadow

  // Fiber stress highlights run down the middle of the ridge
  vec3 finalColor = mix(litColor, vec3(0.98, 0.97, 0.93), totalStress * 0.28);

  gl_FragColor = vec4(finalColor, imgColor.a);
}
