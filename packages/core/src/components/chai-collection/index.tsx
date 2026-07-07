import React from "react";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { VesselComponentProps } from "../../engine/types";

// Custom Exploded 3D Glass Panels shaders
const vert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const frag = `
  uniform sampler2D tMap;
  uniform float uHover;
  uniform float uAspect;
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  void main() {
    // 1. Setup clean square grid matching container aspect ratio
    float gridCount = 6.0;
    vec2 gridSize = vec2(gridCount * uAspect, gridCount);
    vec2 gridPos = vUv * gridSize;
    vec2 cellId = floor(gridPos);
    vec2 cellUv = fract(gridPos);

    // 2. Interactive 3D glass panel tilt calculations
    vec2 normMouse = uMouse * gridSize;
    vec2 cellCenter = cellId + 0.5;
    vec2 toMouse = normMouse - cellCenter;
    float d = length(toMouse);

    // Gaussian tilt strength with decay based on distance to cursor
    float tiltStrength = exp(-pow(d / 2.0, 2.0)) * uHover;
    
    // Wave propagation for organic spring bounce oscillations
    float wave = sin(uTime * 6.0 - d * 1.5);
    float activeTilt = tiltStrength * (1.0 + 0.35 * wave);
    
    vec2 tiltDir = vec2(0.0);
    if (d > 0.001) {
      tiltDir = normalize(toMouse) * activeTilt;
    }

    // 3. 3D Perspective Projection of Cell coordinates
    vec2 localPos = cellUv - 0.5;
    
    // Distort coordinates along convergence axis to shrink footprint under tilt
    float zWarp = 1.0 + dot(localPos, tiltDir) * 0.45;
    vec2 localWarped = localPos * zWarp;
    vec2 finalCellUv = localWarped + 0.5;

    // Exploded gap: check if coordinates warp outside local cell bounds
    bool inside = (finalCellUv.x >= 0.0 && finalCellUv.x <= 1.0 && 
                   finalCellUv.y >= 0.0 && finalCellUv.y <= 1.0);

    // 4. Refraction & Chromatic Aberration near edges
    vec2 refractDisp = -tiltDir * 0.055;
    
    // Compute local R, G, B coordinates inside the cell
    vec2 localR = finalCellUv + refractDisp * 1.15;
    vec2 localG = finalCellUv + refractDisp;
    vec2 localB = finalCellUv + refractDisp * 0.85;

    // Clamp coordinates to prevent wrap sampling from neighboring tiles
    localR = clamp(localR, 0.001, 0.999);
    localG = clamp(localG, 0.001, 0.999);
    localB = clamp(localB, 0.001, 0.999);

    // Reconstruct global UVs for texture sampling
    vec2 uvR = (cellId + localR) / gridSize;
    vec2 uvG = (cellId + localG) / gridSize;
    vec2 uvB = (cellId + localB) / gridSize;

    vec3 texColor = vec3(
      texture2D(tMap, uvR).r,
      texture2D(tMap, uvG).g,
      texture2D(tMap, uvB).b
    );

    // 5. Specular highlights and beveled glass borders
    vec2 borderDist = min(finalCellUv, 1.0 - finalCellUv);
    float edge = min(borderDist.x, borderDist.y);
    float edgeShadow = smoothstep(0.0, 0.15, edge);

    // Tilted surface normal
    vec3 normal = normalize(vec3(-tiltDir * 0.75, 1.0));

    // Bend normals sharply near borders to simulate glass bevels
    float bevelWidth = 0.095;
    if (edge < bevelWidth) {
      float factor = (bevelWidth - edge) / bevelWidth;
      vec2 borderDir = normalize(finalCellUv - 0.5);
      normal = normalize(normal + vec3(borderDir * factor * 1.5, 0.0));
    }

    // Shading calculations matching glossy glass surfaces
    vec3 lightDir = normalize(vec3(-0.45, 0.5, 1.25));
    float diff = max(dot(normal, lightDir), 0.0);
    float shading = mix(0.78, 1.15, diff);

    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 38.0);

    // Combine lit color with specular light and dark boundary shadows
    vec3 tileColor = texColor * shading * mix(0.4, 1.0, edgeShadow) + vec3(spec * 0.38 * uHover);

    // 6. Draw exploded panels or dark background void with soft shadow
    vec3 finalColor = vec3(0.0);
    if (inside) {
      finalColor = tileColor;
    } else {
      // Calculate soft shadow cast in the dark gaps between panels
      float shadowDist = max(max(-finalCellUv.x, finalCellUv.x - 1.0), max(-finalCellUv.y, finalCellUv.y - 1.0));
      float shadow = smoothstep(0.08, 0.0, shadowDist);
      finalColor = mix(vec3(0.015), vec3(0.0), shadow * 0.75);
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const ChaiCollection: React.FC<VesselComponentProps> = (props) => {
  return (
    <VesselCanvas
      {...props}
      vertexShader={vert}
      fragmentShader={frag}
      className={props.className}
      ariaLabel="Interactive exploded 3D glass panels visual effect view"
    />
  );
};

export default ChaiCollection;