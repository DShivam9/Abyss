import * as THREE from "three";

export const CURVED_WALL_VERTEX_SHADER = /* glsl */ `
  uniform float isLeft;
  uniform float uCurvePower;
  varying vec2 vUv;
  varying float vFogDepth;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    float t = clamp((worldPos.z + 7.5) / 14.5, 0.0, 1.0);
    float flare = pow(t, 2.1) * uCurvePower;
    worldPos.x += (isLeft > 0.5) ? -flare : flare;
    vec4 viewPos = viewMatrix * worldPos;
    vFogDepth = -viewPos.z;
    gl_Position = projectionMatrix * viewPos;
  }
`;

export const CURVED_WALL_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D map;
  uniform float uFocus;
  uniform vec3 fogColor;
  uniform float fogDensity;
  varying vec2 vUv;
  varying float vFogDepth;

  void main() {
    vec4 texColor = texture2D(map, vUv);
    texColor.rgb *= uFocus;
    float fogFactor = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
    fogFactor = clamp(fogFactor, 0.0, 1.0);
    gl_FragColor = vec4(mix(texColor.rgb, fogColor, fogFactor), texColor.a);
  }
`;

export const REFLECTED_FLOOR_VERTEX_SHADER = /* glsl */ `
  uniform float isLeft;
  uniform float uCurvePower;
  varying vec2 vUv;
  varying float vFogDepth;
  varying float vWorldY;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    float t = clamp((worldPos.z + 7.5) / 14.5, 0.0, 1.0);
    float flare = pow(t, 2.1) * uCurvePower;
    worldPos.x += (isLeft > 0.5) ? -flare : flare;
    vWorldY = worldPos.y;
    vec4 viewPos = viewMatrix * worldPos;
    vFogDepth = -viewPos.z;
    gl_Position = projectionMatrix * viewPos;
  }
`;

export const REFLECTED_FLOOR_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D map;
  uniform float uFocus;
  uniform float uSheen;
  uniform vec3 fogColor;
  uniform float fogDensity;
  varying vec2 vUv;
  varying float vFogDepth;
  varying float vWorldY;

  void main() {
    vec2 reflUv = vec2(vUv.x, 1.0 - vUv.y);

    float bx = 0.0055;
    float by = 0.0022;
    vec4 col = texture2D(map, reflUv) * 0.36;
    col += texture2D(map, reflUv + vec2(-bx, -by)) * 0.16;
    col += texture2D(map, reflUv + vec2( bx, -by)) * 0.16;
    col += texture2D(map, reflUv + vec2(-bx * 1.4, by)) * 0.16;
    col += texture2D(map, reflUv + vec2( bx * 1.4, by)) * 0.16;

    float floorLevel = -2.60;
    float distBelow = max(0.0, floorLevel - vWorldY);
    float verticalFalloff = 1.0 - clamp(distBelow / 3.4, 0.0, 1.0);
    verticalFalloff = pow(verticalFalloff, 1.2);

    float reflFogDensity = fogDensity * 0.52;
    float fogFactor = 1.0 - exp(-reflFogDensity * reflFogDensity * vFogDepth * vFogDepth);
    fogFactor = clamp(fogFactor, 0.0, 1.0);

    float reflMultiplier = max(1.0, uFocus);
    vec3 reflectedRgb = mix(col.rgb * uSheen * reflMultiplier, fogColor, fogFactor);
    float alpha = verticalFalloff * 0.72 * (1.0 - fogFactor * 0.6);

    gl_FragColor = vec4(reflectedRgb, alpha);
  }
`;

export const OBSIDIAN_FLOOR_VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldPos;
  varying float vFogDepth;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vec4 viewPos = viewMatrix * worldPos;
    vFogDepth = -viewPos.z;
    gl_Position = projectionMatrix * viewPos;
  }
`;

export const OBSIDIAN_FLOOR_FRAGMENT_SHADER = /* glsl */ `
  uniform float uScroll;
  uniform float uIntroEase;
  uniform vec3 fogColor;
  uniform float fogDensity;
  varying vec3 vWorldPos;
  varying float vFogDepth;

  void main() {
    float x = vWorldPos.x;
    float z = vWorldPos.z;

    float dashPeriod = 2.4;
    float dashLength = 1.0;
    float dashCycle = mod(z - uScroll, dashPeriod);
    float dashCap = smoothstep(0.0, 0.08, dashCycle) * smoothstep(dashLength, dashLength - 0.08, dashCycle);
    float dashWidth = smoothstep(0.016, 0.0, abs(x));
    
    float lineEmergence = smoothstep(0.08, 0.72, uIntroEase);
    float centerDashes = dashWidth * dashCap * 0.45 * lineEmergence;

    float distNorm = clamp(-z / 48.0, 0.0, 1.0);
    float horizonSheen = pow(distNorm, 2.2) * 0.06;

    vec3 surfaceColor = vec3(centerDashes * 0.92) + vec3(horizonSheen * 0.8);

    float fogFactor = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
    fogFactor = clamp(fogFactor, 0.0, 1.0);

    vec3 finalRgb = mix(surfaceColor, fogColor, fogFactor);
    gl_FragColor = vec4(finalRgb, 0.30);
  }
`;

export function createCurvedMaterial(
  tex: THREE.VideoTexture,
  isLeft: boolean,
  curvePower: number,
  fogDensity: number
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: tex },
      isLeft: { value: isLeft ? 1.0 : 0.0 },
      uCurvePower: { value: curvePower },
      uFocus: { value: 1.0 },
      fogColor: { value: new THREE.Color(0x000000) },
      fogDensity: { value: fogDensity },
    },
    vertexShader: CURVED_WALL_VERTEX_SHADER,
    fragmentShader: CURVED_WALL_FRAGMENT_SHADER,
    side: THREE.DoubleSide,
  });
}

export function createReflectedVideoMaterial(
  tex: THREE.VideoTexture,
  isLeft: boolean,
  curvePower: number,
  sheen: number,
  fogDensity: number
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: tex },
      isLeft: { value: isLeft ? 1.0 : 0.0 },
      uCurvePower: { value: curvePower },
      uSheen: { value: sheen },
      uFocus: { value: 1.0 },
      fogColor: { value: new THREE.Color(0x000000) },
      fogDensity: { value: fogDensity },
    },
    vertexShader: REFLECTED_FLOOR_VERTEX_SHADER,
    fragmentShader: REFLECTED_FLOOR_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

export function createFloorGlassMaterial(fogDensity: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uScroll: { value: 0.0 },
      uIntroEase: { value: 0.0 },
      fogColor: { value: new THREE.Color(0x000000) },
      fogDensity: { value: fogDensity },
    },
    vertexShader: OBSIDIAN_FLOOR_VERTEX_SHADER,
    fragmentShader: OBSIDIAN_FLOOR_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}
