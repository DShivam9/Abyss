import * as THREE from "three";

export interface ChromeUniforms {
  uSceneTexture: { value: THREE.Texture | null };
  uResolution: { value: THREE.Vector2 };
  uRefractPower: { value: number };
  uIceColor: { value: THREE.Color };
  uExposure: { value: number };
  uClipActive: { value: number };
  uWaterLevel: { value: number };
}

export const CHROME_VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDirection = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const CHROME_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uSceneTexture;
  uniform vec2 uResolution;
  uniform float uRefractPower;
  uniform vec3 uIceColor;
  uniform float uExposure;
  uniform float uClipActive;
  uniform float uWaterLevel;

  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;
  varying vec3 vWorldPosition;

  void main() {
    // Strict zero-dot surface clipping - completely discards submerged subpixels
    if (uClipActive > 0.5 && vWorldPosition.z <= uWaterLevel + 0.005) discard;

    // Luminous liquid meniscus where model slices through the surface
    float meniscus = 0.0;
    if (uClipActive > 0.5) {
      meniscus = smoothstep(uWaterLevel + 0.12, uWaterLevel + 0.005, vWorldPosition.z);
    }

    vec2 screenUV = gl_FragCoord.xy / uResolution;
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDir = normalize(vViewDirection);

    float NdotV = max(dot(normal, viewDir), 0.0);
    float fresnel = pow(1.0 - NdotV, 2.2);

    vec2 refractOffset = normal.xy * (uRefractPower * 1.4);
    vec3 refractedColor = texture2D(uSceneTexture, screenUV + refractOffset).rgb;

    vec3 chromeReflection = vec3(fresnel * 1.5) + uIceColor * (fresnel * 0.4);
    vec3 finalColor = mix(refractedColor, chromeReflection, smoothstep(0.25, 0.85, fresnel));
    finalColor += vec3(fresnel * 0.35);
    finalColor += uIceColor * (meniscus * 1.5);
    finalColor *= uExposure;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
