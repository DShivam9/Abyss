import * as THREE from "three";

export const CHAMBER_VERTEX_SHADER = `
  varying vec3 vLocalPos;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;
  void main() {
    vLocalPos = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const CHAMBER_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uScrollY;
  uniform float uChamberAwake;
  uniform vec3 uMorphWeights;
  uniform float uWaveBrightness;
  uniform float uCellSize;
  uniform float uCylinderRadius;
  uniform vec3 uBgDark;
  uniform vec3 uBgMid;
  uniform vec3 uCausticColor;
  uniform vec3 uWireColor;
  uniform vec3 uWireGlow;

  varying vec3 vLocalPos;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  const float PI = 3.14159265359;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise3D(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    vec3 u = f;
    return mix(
      mix(mix(hash(p + vec3(0,0,0)), hash(p + vec3(1,0,0)), u.x),
          mix(hash(p + vec3(0,1,0)), hash(p + vec3(1,1,0)), u.x), u.y),
      mix(mix(hash(p + vec3(0,0,1)), hash(p + vec3(1,0,1)), u.x),
          mix(hash(p + vec3(0,1,1)), hash(p + vec3(1,1,1)), u.x), u.y), u.z
    );
  }

  float getSurfaceHeight(vec3 normPos, float scrollY, float t) {
    vec3 p = vec3(normPos.x * 2.2, normPos.y * 2.2 + scrollY * 0.20, normPos.z * 2.2);
    float w1 = sin(p.x * 2.5 + t * 0.85 + sin(p.y * 2.0));
    float w2 = cos(p.y * 3.0 - t * 0.75 + cos(p.z * 2.2));
    float n = noise3D(p * 1.5 + vec3(0.0, 0.0, t * 0.32));
    return smoothstep(-0.25, 0.65, (w1 + w2) * 0.35 + n * 0.4);
  }

  float hexDist(vec2 p) {
    p = abs(p);
    float c = dot(p, normalize(vec2(1.0, 1.7320508)));
    return max(c, p.x);
  }

  void main() {
    vec3 normPos = normalize(vLocalPos);

    float lon = atan(vLocalPos.x, -vLocalPos.z);
    float arcLength = (lon / (2.0 * PI) + 0.5) * (2.0 * PI * uCylinderRadius);
    float yPos = vLocalPos.y + uScrollY * 120.0;
    
    vec2 gridUV = vec2(arcLength / uCellSize, yPos / uCellSize);

    float h = getSurfaceHeight(normPos, uScrollY, uTime);

    float eps = 0.02;
    float hX = getSurfaceHeight(normalize(vLocalPos + vec3(eps, 0.0, 0.0)), uScrollY, uTime);
    float hY = getSurfaceHeight(normalize(vLocalPos + vec3(0.0, eps, 0.0)), uScrollY, uTime);
    
    vec3 geomNormal = -normPos;
    vec3 surfNormal = normalize(geomNormal + vec3((h - hX), (h - hY), 0.0) * 1.8);

    vec3 keyLightDir = normalize(vec3(0.1, 0.6, 0.8));
    float diffuse = max(dot(surfNormal, keyLightDir), 0.0);
    float fresnel = pow(1.0 - max(dot(geomNormal, vViewDir), 0.0), 3.0);

    // A. Swiss Precision Plus (+)
    vec2 cellFract = abs(fract(gridUV) - 0.5);
    vec2 fw = fwidth(gridUV);
    float hArm = step(cellFract.y, fw.y * 1.1) * (1.0 - step(0.14, cellFract.x));
    float vArm = step(cellFract.x, fw.x * 1.1) * (1.0 - step(0.14, cellFract.y));
    float alphaPlus = max(hArm, vArm) * 0.35;

    // B. Ghost Stippled Grid
    vec2 grid = abs(fract(gridUV - 0.5) - 0.5) / fwidth(gridUV);
    float dotCadenceX = step(0.40, fract(gridUV.x * 5.0));
    float dotCadenceY = step(0.40, fract(gridUV.y * 5.0));
    float hLine = (1.0 - clamp(grid.y, 0.0, 1.0)) * dotCadenceX;
    float vLine = (1.0 - clamp(grid.x, 0.0, 1.0)) * dotCadenceY;
    float alphaGhost = max(hLine, vLine) * (0.08 + pow(h, 2.0) * 0.40);

    // C. Hexagonal Honeycomb Lattice with 3D Normal Bulge
    vec2 hexUV = vec2(arcLength / (uCellSize * 1.4), yPos / (uCellSize * 1.4)) + (surfNormal.xy - geomNormal.xy) * 0.28;
    vec2 r = vec2(1.0, 1.7320508);
    vec2 hR = r * 0.5;
    vec2 a = mod(hexUV, r) - hR;
    vec2 b = mod(hexUV - hR, r) - hR;
    vec2 gv = dot(a, a) < dot(b, b) ? a : b;
    float d = hexDist(gv);
    float hexEdge = abs(d - 0.5);
    float alphaHex = (1.0 - clamp(hexEdge / (fwidth(d) * 1.3), 0.0, 1.0)) * (0.18 + fresnel * 0.25);

    float patternAlpha = (alphaPlus * uMorphWeights.x + alphaGhost * uMorphWeights.y + alphaHex * uMorphWeights.z) * (0.25 + uChamberAwake * 0.75);

    float microGrain = hash(vLocalPos * 0.12) * 0.024;
    float microWeave = (sin(gridUV.x * 32.0 + gridUV.y * 16.0) * 0.5 + 0.5) * 0.018;
    vec3 luxuryGrain = vec3(0.04, 0.07, 0.12) * (microGrain + microWeave) * (1.0 - h * 0.5);

    vec3 chamberSurface = mix(uBgDark, uBgMid, h) + luxuryGrain;
    chamberSurface += uCausticColor * pow(h, 2.2) * (diffuse * 0.7 + 0.3) * (0.15 + uChamberAwake * 0.30) * uWaveBrightness;
    chamberSurface += uCausticColor * fresnel * (0.10 + uChamberAwake * 0.15) * uWaveBrightness;

    vec3 wireCol = mix(uWireColor, uWireGlow * 0.85, h * 0.7 + diffuse * 0.3);
    vec3 finalColor = mix(chamberSurface, wireCol, patternAlpha);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function injectCurvatureShader(
  shader: { uniforms: Record<string, THREE.IUniform>; vertexShader: string },
  cardBendUniform: { uCardBend: { value: number } }
) {
  shader.uniforms.uCardBend = cardBendUniform.uCardBend;
  shader.vertexShader = `
    uniform float uCardBend;
    ${shader.vertexShader}
  `;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `
    #include <begin_vertex>
    float normY = position.y / 16.72;
    float normX = position.x / 12.32;
    float curveFactor = (1.0 - (normY * normY * 1.6 + normX * normX * 2.8));
    transformed.z += curveFactor * uCardBend * 6.5;
    `
  );
}

export function injectMercuryShader(
  shader: { uniforms: Record<string, THREE.IUniform>; vertexShader: string; fragmentShader: string },
  customUniforms: { uTime: { value: number } }
) {
  shader.uniforms.uTime = customUniforms.uTime;

  shader.vertexShader = `
    varying vec3 vWorldNormal;
    varying vec3 vWorldPos;
    ${shader.vertexShader}
  `;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <worldpos_vertex>",
    `
    #include <worldpos_vertex>
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
    `
  );

  shader.fragmentShader = `
    uniform float uTime;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPos;
    ${shader.fragmentShader}
  `;

  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <dithering_fragment>",
    `
    #include <dithering_fragment>

    vec2 waveCoord = vWorldPos.xy * 0.04 + vec2(uTime * 0.40, -uTime * 0.32);
    float fluidField = (sin(waveCoord.x) + cos(waveCoord.y) + sin(dot(vWorldPos.xy, vec2(0.03)) + uTime * 0.25)) * 0.333;
    
    vec3 iridA = vec3(0.5, 0.5, 0.5);
    vec3 iridB = vec3(0.5, 0.5, 0.5);
    vec3 iridC = vec3(1.0, 1.0, 1.0);
    vec3 iridD = vec3(0.00, 0.33, 0.67);
    vec3 iridColor = iridA + iridB * cos(6.28318 * (iridC * (fluidField * 2.0 + uTime * 0.12) + iridD));

    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = 1.0 - max(0.0, dot(viewDir, vWorldNormal));

    float iridBlend = (smoothstep(-0.2, 0.7, fluidField) * 0.16 + pow(fresnel, 1.6) * 0.24) * 0.55;
    gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * iridColor * 1.5, iridBlend);
    `
  );
}
