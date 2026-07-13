// Deepwood Glimmer — Scribe's Vellum Crease Vertex Shader
// Calculates 3D folding ridges along crease segments and page curl sags.
// Uses finite difference normal computation to ensure correct lighting.
// 100% loop-free to guarantee WebGL compilation.

uniform float uTime;
uniform float uHover;
uniform float uScrollVelocity;
uniform float uAspect;
uniform vec2 uMouse;

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

// Fbm for organic paper sags
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

// Calculate ridge displacement for a crease segment
float getFold(vec2 uv, vec2 start, vec2 end, float strength) {
  if (strength <= 0.001) return 0.0;
  float d = distToSegment(uv, start, end);
  // Ridge displacement (V-fold / crease shape)
  float width = 0.08;
  return (1.0 - d / width) * step(d, width) * strength * 0.07;
}

// Heightmap calculation function
float getHeight(vec2 uv) {
  float h = 0.0;
  
  // 1. Accumulate active fold & crease history
  h += getFold(uv, uDragStart, uDragEnd, uDragStrength);
  h += getFold(uv, uCreaseAStart, uCreaseAEnd, uCreaseAStrength);
  h += getFold(uv, uCreaseBStart, uCreaseBEnd, uCreaseBStrength);
  h += getFold(uv, uCreaseCStart, uCreaseCEnd, uCreaseCStrength);
  h += getFold(uv, uCreaseDStart, uCreaseDEnd, uCreaseDStrength);
  
  // 2. Add page curl / corner sag (feels organic)
  float cornerX = abs(uv.x - 0.5) * 2.0;
  float cornerY = abs(uv.y - 0.5) * 2.0;
  float cornerWeight = cornerX * cornerY;
  
  h += sin(uTime * 1.5 + uv.x * 3.5 + uv.y * 3.5) * 0.015 * cornerWeight * uHover;
  
  // 3. Scroll drag flutter
  if (abs(uScrollVelocity) > 0.001) {
    h += sin(uv.y * 10.0 - uTime * 6.0) * uScrollVelocity * 0.02 * cornerWeight;
  }
  
  return h;
}

void main() {
  vUv = uv;
  vec3 pos = position;

  // 3D Page Tilt (smooth parallax rotation towards the cursor)
  vec2 aspectMouse = vec2(uMouse.x * uAspect, uMouse.y);
  vec2 tilt = (aspectMouse - vec2(0.5 * uAspect, 0.5)) * uHover * 0.12;
  pos.z += tilt.x * (uv.x - 0.5) + tilt.y * (uv.y - 0.5);

  // Compute displacement
  float h = getHeight(uv);
  pos.z += h;

  // Finite difference normal calculation for high-fidelity lighting
  float eps = 0.006;
  float h_x = getHeight(uv + vec2(eps, 0.0));
  float h_y = getHeight(uv + vec2(0.0, eps));
  
  vec3 tangent = vec3(eps, 0.0, h_x - h);
  vec3 bitangent = vec3(0.0, eps, h_y - h);
  vec3 paperNormal = normalize(cross(tangent, bitangent));

  vNormal = normalize(normalMatrix * paperNormal);
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vViewPosition = -mvPosition.xyz;
  vModelPosition = pos;

  gl_Position = projectionMatrix * mvPosition;
}
