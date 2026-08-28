import * as THREE from "three";

export interface FluidUniforms {
  uTime: { value: number };
  uResolution: { value: THREE.Vector2 };
  uMouse: { value: THREE.Vector2 };
  uExposure: { value: number };
  uShockwavePos: { value: THREE.Vector2 };
  uShockwaveProgress: { value: number };
  uShockwaveAmp: { value: number };
}

export const FLUID_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const FLUID_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uExposure;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform vec2 uShockwavePos;
  uniform float uShockwaveProgress;
  uniform float uShockwaveAmp;
  varying vec2 vUv;

  const vec3 uBgDark       = vec3(0.006, 0.008, 0.014);
  const vec3 uBgMid        = vec3(0.035, 0.082, 0.145);
  const vec3 uCausticColor = vec3(0.361, 0.722, 0.973);
  const vec3 uWireGlow     = vec3(0.608, 0.898, 0.984);

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

  float getSurfaceHeight(vec2 uv, float t, vec2 rawUV, float aspect) {
    vec2 p = uv * 3.2;
    float w1 = sin(p.x * 2.8 + t * 0.95 + sin(p.y * 2.2));
    float w2 = cos(p.y * 3.2 - t * 0.85 + cos(p.x * 2.4));
    float n = noise3D(vec3(p * 1.6, t * 0.40));
    float baseH = smoothstep(-0.12, 0.58, (w1 + w2) * 0.38 + n * 0.42);

    // Dynamic fluid shockwave when 3D star breaches forward
    float distToStar = length((rawUV - uShockwavePos) * vec2(aspect, 1.0));
    float ring = sin(distToStar * 28.0 - uShockwaveProgress * 12.0);
    float falloff = exp(-pow(distToStar - uShockwaveProgress * 0.38, 2.0) * 35.0);
    baseH += ring * falloff * uShockwaveAmp;

    return baseH;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 1.35;

    float h = getSurfaceHeight(p, t, uv, aspect);

    float eps = 0.015;
    float hX = getSurfaceHeight(p + vec2(eps, 0.0), t, uv + vec2(eps / aspect, 0.0), aspect);
    float hY = getSurfaceHeight(p + vec2(0.0, eps), t, uv + vec2(0.0, eps), aspect);

    vec3 geomNormal = vec3(0.0, 0.0, 1.0);
    vec3 surfNormal = normalize(geomNormal + vec3((h - hX), (h - hY), 0.0) * 2.8);

    vec3 keyLightDir = normalize(vec3(0.18, 0.55, 0.82));
    float diffuse = pow(max(dot(surfNormal, keyLightDir), 0.0), 1.4);
    float fresnel = pow(1.0 - max(dot(surfNormal, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);

    vec2 gridUV = uv * vec2(aspect * 24.0, 24.0);
    float microGrain = hash(vec3(gl_FragCoord.xy * 0.12, t * 0.05)) * 0.024;
    float microWeave = (sin(gridUV.x * 32.0 + gridUV.y * 16.0) * 0.5 + 0.5) * 0.016;
    vec3 luxuryGrain = vec3(0.04, 0.07, 0.12) * (microGrain + microWeave) * (1.0 - h * 0.5);

    vec3 chamberSurface = mix(uBgDark, uBgMid, smoothstep(0.05, 0.85, h)) + luxuryGrain;
    chamberSurface += uCausticColor * pow(h, 2.4) * (diffuse * 0.95 + 0.20) * 0.58;
    chamberSurface += uWireGlow * fresnel * 0.22;

    float centerVignette = smoothstep(0.08, 0.85, length(p * vec2(0.9, 1.5)));
    vec3 finalColor = mix(uBgDark + chamberSurface * 0.45, chamberSurface, centerVignette);

    float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.003;
    finalColor += vec3(dither);
    finalColor *= uExposure;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
