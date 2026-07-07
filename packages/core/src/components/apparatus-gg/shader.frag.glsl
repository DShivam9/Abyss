uniform sampler2D tMap;
uniform float uHover;
uniform float uAspect;
uniform float uTime;
uniform vec2 uMouse;
uniform float uIntro;

varying vec2 vUv;
varying vec3 vViewPosition;

void main() {
  // 1. Setup 15x15 mechanical grid
  float gridCount = 15.0;
  vec2 gridSize = vec2(gridCount * uAspect, gridCount);
  vec2 gridPos = vUv * gridSize;
  vec2 cellId = floor(gridPos);
  vec2 cellUv = fract(gridPos);

  vec2 cellCenterUv = (cellId + 0.5) / gridSize;

  // 2. Intro: diagonal sweep builds up from 0→peak→0 over ~2.5s
  //    Each cell has staggered delay based on diagonal position
  float diagPos = (cellCenterUv.x + cellCenterUv.y) * 0.5;
  float cellDelay = diagPos * 1.2;
  float localIntro = uIntro - cellDelay;
  // Bell curve: rises from 0, peaks, falls back to 0
  float introPeak = exp(-pow((localIntro - 0.6) / 0.35, 2.0));
  float introActive = introPeak * step(0.0, localIntro);

  // Combined activation: hover OR intro sweep
  float activeHover = max(uHover, introActive);

  // 3. Cursor distance and rotation calculations
  float aspectMouseX = uMouse.x * uAspect;
  float aspectCellX = cellCenterUv.x * uAspect;
  
  float d = distance(vec2(aspectCellX, cellCenterUv.y), vec2(aspectMouseX, uMouse.y));
  float factor = exp(-pow(d / 0.18, 2.0)) * activeHover;

  // Flip angle theta (from 0 to PI)
  float theta = factor * 3.14159265;

  // High-frequency mechanical flutter/bounce when completing flip
  float flutter = sin(uTime * 20.0 - d * 22.0) * exp(-factor * 3.5) * 0.095 * activeHover;
  theta += flutter;
  theta = clamp(theta, -0.05, 3.20);

  float cosT = cos(theta);
  float sinT = sin(theta);
  float yLocal = cellUv.y - 0.5;

  // Gaps expand from 0 to max based on activeHover — invisible at rest
  float gapSize = 0.062 * activeHover;
  bool inside = (cellUv.x >= gapSize && cellUv.x <= 1.0 - gapSize);

  // When activeHover ~0, skip gap logic entirely — show clean image
  if (activeHover < 0.001) {
    gl_FragColor = vec4(texture2D(tMap, vUv).rgb, 1.0);
    return;
  }

  // 4. Shadows from left neighbor cell
  vec3 lightOffsetVec = vec3(-0.42, 0.45, 0.88);
  vec3 lightDir = normalize(lightOffsetVec);
  
  float leftCenterUv = (cellId.x - 0.5) / gridSize.x;
  float leftD = abs(leftCenterUv - uMouse.x) * uAspect;
  float leftFactor = exp(-pow(leftD / 0.15, 2.0)) * activeHover;
  float leftWave = sin(uTime * 6.5 - leftD * 7.0);
  float leftActive = leftFactor * (1.0 + 0.28 * leftWave);
  float leftHeight = 0.15 * leftActive * sin(vUv.y * 3.14159265);

  float shadowOffset = leftHeight * (-lightDir.x / lightDir.z);
  float shadowCenterLocal = shadowOffset * gridSize.x - 0.5;
  float shadowWeight = smoothstep(0.46, 0.0, abs(cellUv.x - shadowCenterLocal));

  vec3 cardColor = vec3(0.0);
  vec3 normal = vec3(0.0, 0.0, 1.0);

  // Determine if pixel on rotating flap or static halves
  bool onCard = false;
  if (cosT >= 0.0) {
    onCard = (yLocal >= 0.0 && yLocal <= 0.5 * cosT);
  } else {
    onCard = (yLocal <= 0.0 && yLocal >= 0.5 * cosT);
  }

  if (onCard) {
    float unrotatedY = yLocal / cosT;
    
    if (theta < 1.57079632) {
      vec2 sampledCellUv = vec2(cellUv.x, 0.5 + unrotatedY);
      vec2 globalUv = (cellId + sampledCellUv) / gridSize;
      cardColor = texture2D(tMap, globalUv).rgb;
    } else {
      vec2 sampledCellUv = vec2(cellUv.x, 0.5 - unrotatedY);
      vec2 globalUv = (cellId + sampledCellUv) / gridSize;
      cardColor = texture2D(tMap, globalUv).rgb * 0.22 + vec3(0.04, 0.045, 0.06);
    }
    
    normal = normalize(vec3(0.0, -sinT, cosT));
  } else {
    vec2 globalUv = (cellId + cellUv) / gridSize;
    cardColor = texture2D(tMap, globalUv).rgb;
    
    if (yLocal < 0.0 && sinT > 0.01) {
      float shadowDist = abs(yLocal - (-sinT * 0.25));
      float shadow = smoothstep(sinT * 0.25, 0.0, shadowDist);
      cardColor *= mix(1.0, 0.38, shadow * activeHover);
    }
    
    normal = vec3(0.0, 0.0, 1.0);
  }

  // 5. Shading & specular
  float diff = max(dot(normal, lightDir), 0.0);
  float shading = mix(0.78, 1.15, diff);

  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 32.0) * 0.38 * activeHover;

  cardColor = cardColor * shading + vec3(spec);

  // 6. Split lines & gap grooves — fully gated by activeHover
  float vertGap = smoothstep(0.022, 0.0, min(cellUv.x, 1.0 - cellUv.x));
  float horizSplit = smoothstep(0.018, 0.0, abs(cellUv.y - 0.5));
  float lineMask = max(vertGap * 0.9, horizSplit * 0.82) * activeHover;
  
  cardColor = mix(cardColor, vec3(0.02, 0.02, 0.025), lineMask);

  // 7. Composition
  vec3 finalColor = vec3(0.0);
  if (inside) {
    finalColor = cardColor;
  } else {
    finalColor = mix(vec3(0.02), vec3(0.0), shadowWeight * leftActive * 0.82);
  }

  // 8. Border blend to clean image
  float borderDistX = min(vUv.x, 1.0 - vUv.x);
  float borderDistY = min(vUv.y, 1.0 - vUv.y);
  float borderMask = smoothstep(0.0, 0.016, borderDistX) * smoothstep(0.0, 0.016, borderDistY);

  vec3 baseColor = texture2D(tMap, vUv).rgb;

  // Blend between clean image and grid effect based on activeHover
  vec3 gridded = mix(baseColor, finalColor, borderMask);
  gl_FragColor = vec4(mix(baseColor, gridded, activeHover), 1.0);
}