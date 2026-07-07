// ═══════════════════════════════════════════════════════════════════════════
// Pixel Shatter — Vertex Shader (v5: multi-hit glass)
// ═══════════════════════════════════════════════════════════════════════════
// Changes over v4:
//   - Image no longer breaks on one click. It takes SHATTER_AT_CLICK hits.
//   - Clicks 1..N-1 crack the glass: a shudder radiates from each impact and
//     nearby tiles loosen slightly, but the image stays intact.
//   - The final hit (uShatterTime) triggers the full shatter + vortex reform.
//   - Crack impact points (uCrackPos/uCrackTime) drive the pre-break tremor
//     here and the crack-line rendering in the fragment shader.
// ═══════════════════════════════════════════════════════════════════════════

attribute vec2 aTileCenter;
attribute vec4 aTileRand;     // (randAngle, randSpin, randStagger, randFloor)

uniform float uTime;
uniform float uShatterTime;   // moment the image gave way (-999 until final hit)
uniform vec2  uClickPos;      // last impact point (origin of the shatter)
uniform float uClickTime;     // last impact time (for pre-break tremor)
uniform float uClickCount;    // hits landed so far
uniform vec2  uCrackPos[3];   // accumulated crack impact points
uniform float uCrackTime[3];  // when each crack formed
uniform vec2  uMouse;         // engine-provided, 0..1 (y up)
uniform float uHover;         // engine-provided, 0..1 eased

varying vec2  vUv;
varying float vPhase;         // 0 idle/cracking, 0.5 pre-wave, 1.0 shattering
varying vec2  vTileLocal;
varying float vDepth;
varying float vSpeed;
varying vec2  vVelDir;
varying float vWave;
varying float vScatter;
varying float vFloorShade;
varying float vGlow;          // idle/hover sheen (pre-shatter only)

#define GRID_COLS 96.0
#define GRID_ROWS 96.0
#define TILE_W (1.0 / GRID_COLS)
#define TILE_H (1.0 / GRID_ROWS)

// ─── Shatter Phase ──────────────────────────────────────────────────────────
#define SHATTER_WAVE_SPEED 3.2
#define GRAVITY -5.0
#define BLAST_FORCE 2.6
#define BLAST_UPWARD_BIAS 0.9
#define DRAG 1.1
#define RESTITUTION 0.32
#define SPIN_INTENSITY 11.0
#define WOBBLE_FREQ 12.0

// ─── Rebuild Phase (vortex convergence) ─────────────────────────────────────
#define REBUILD_START 2.8
#define VORTEX_CENTER vec2(0.5, 0.5)
#define VORTEX_STAGGER 0.9
#define SPIRAL_DUR 1.7
#define SWIRL_AMP 2.6
#define SWIRL_DIR 1.0
#define Z_FUNNEL 0.13

// ─── Timeline ───────────────────────────────────────────────────────────────
#define TOTAL_DURATION 6.0

// ─── Analytic damped bounce ─────────────────────────────────────────────────
float bounceHeight(float t, float v, float g) {
  float tPrev = 0.0;
  for (int i = 0; i < 5; i++) {
    float tAir = 2.0 * v / g;
    if (t <= tPrev + tAir) {
      float lt = t - tPrev;
      return max(v * lt - 0.5 * g * lt * lt, 0.0);
    }
    tPrev += tAir;
    v *= RESTITUTION;
    if (v < 0.02) break;
  }
  return 0.0;
}

// ─── Tile-center world position (translation only) at a given time ──────────
vec3 computeCenter(float tsc, vec2 tileC, vec4 rnd, vec2 clickP) {
  float distToClick = distance(tileC, clickP);
  float waveDelay = distToClick / SHATTER_WAVE_SPEED;
  float lt = tsc - waveDelay;
  if (lt <= 0.0) return vec3(tileC, 0.0);

  vec2 toC = tileC - clickP;
  vec2 bdir = length(toC) > 0.001 ? normalize(toC) : vec2(0.0, 1.0);
  float ra = (rnd.x - 0.5) * 1.4;
  float ca = cos(ra), sa = sin(ra);
  bdir = vec2(bdir.x * ca - bdir.y * sa, bdir.x * sa + bdir.y * ca);

  float baseF = exp(-distToClick * 3.0) * BLAST_FORCE;
  float fMag = baseF * (0.6 + rnd.y * 0.8);
  vec2 V0;
  V0.x = bdir.x * fMag;
  V0.y = (bdir.y * 0.3 + BLAST_UPWARD_BIAS) * fMag;

  float xPos = tileC.x + V0.x * (1.0 - exp(-DRAG * lt)) / DRAG;

  float floorLine = TILE_H * 0.5 + rnd.w * 0.02;
  float g = GRAVITY;
  float a = 0.5 * g, b = V0.y, c = tileC.y - floorLine;
  float disc = b * b - 4.0 * a * c;
  float sq = sqrt(max(disc, 0.0));
  float t0 = max((-b + sq) / (2.0 * a), (-b - sq) / (2.0 * a));
  float yPos;
  if (lt <= t0) {
    yPos = tileC.y + V0.y * lt + 0.5 * g * lt * lt;
  } else {
    float vImp = abs(V0.y + g * t0);
    yPos = floorLine + bounceHeight(lt - t0, vImp * RESTITUTION, -g);
  }

  vec2 sPos = vec2(xPos, yPos);

  vec2 toM = tileC - uMouse;
  float md = length(toM);
  sPos += (md > 1e-4 ? toM / md : vec2(0.0)) * exp(-md * 7.0) * 0.04 * uHover;

  float zPop = fMag * 0.7 * exp(-lt * 1.4);
  float zWob = sin(lt * WOBBLE_FREQ + rnd.x * 6.28) * 0.09 * exp(-lt * 2.0) * fMag;
  float zS = zPop + zWob;

  // ─── Rebuild: coherent vortex convergence ────────────────────────────────
  float tReb = tsc - REBUILD_START;
  if (tReb > 0.0) {
    vec2  homeRel = tileC - VORTEX_CENTER;
    float rHome   = length(homeRel);
    float thHome  = atan(homeRel.y, homeRel.x);

    float rlt = tReb - (rHome * VORTEX_STAGGER + rnd.z * 0.12);
    if (rlt > 0.0) {
      float p  = clamp(rlt / SPIRAL_DUR, 0.0, 1.0);
      float pe = 1.0 - pow(1.0 - p, 3.0);

      vec2  scatRel = sPos - VORTEX_CENTER;
      float rScat   = length(scatRel);
      float thScat  = atan(scatRel.y, scatRel.x);
      float dth     = atan(sin(thScat - thHome), cos(thScat - thHome));

      float overshoot = sin(p * 3.14159) * (1.0 - p) * 0.05;
      float r  = mix(rScat, rHome, pe) - overshoot;
      float th = thHome + dth * (1.0 - pe) + SWIRL_DIR * SWIRL_AMP * sin(3.14159 * p);

      sPos = VORTEX_CENTER + r * vec2(cos(th), sin(th));
      zS = sin(3.14159 * p) * Z_FUNNEL;

      float endSnap = smoothstep(TOTAL_DURATION - 0.4, TOTAL_DURATION - 0.08, tsc);
      sPos = mix(sPos, tileC, endSnap);
      zS   = mix(zS, 0.0, endSnap);
    }
  }

  return vec3(sPos, zS);
}

void main() {
  vec3 pos = position;
  vec2 currentUv = uv;
  vec2 localOffset = currentUv - aTileCenter;

  float tsc = uTime - uShatterTime;
  bool animActive = uShatterTime > 0.0 && tsc > 0.0 && tsc < TOTAL_DURATION;

  vTileLocal = (localOffset / vec2(TILE_W, TILE_H)) + 0.5;
  vUv = currentUv;
  vPhase = 0.0;
  vDepth = 0.0;
  vSpeed = 0.0;
  vVelDir = vec2(0.0);
  vWave = 0.0;
  vScatter = 0.0;
  vFloorShade = 0.0;
  vGlow = 0.0;

  // ─── Not shattering: idle light + hover light + raised "armed" pixels ─────
  if (!animActive) {
    // Idle: a soft ambient light slowly rotates across the surface with a
    // barely-there luminance breathing. No moving bands, no distortion.
    float ang = uTime * 0.15;
    vec2 lightDir = vec2(cos(ang), sin(ang));
    float idleGlow = dot(aTileCenter - 0.5, lightDir) * 0.03 + sin(uTime * 0.5) * 0.012;

    // Hover: the light swings toward the cursor as a broad soft sheen (not a
    // spotlight) and the whole image gently swells.
    vec2 hoverDir = normalize(uMouse - 0.5 + vec2(1e-4));
    idleGlow = mix(idleGlow, dot(aTileCenter - 0.5, hoverDir) * 0.09 + 0.02, uHover);
    float swell = 1.0 + uHover * 0.015;

    // Click: pixels around the hit shake, then STAY disturbed & embossed for
    // ~2s (held frozen offset — this is what actually makes them stay up),
    // then settle by 2.5s to match the JS heal window so the image won't break.
    vec2 disp = vec2(0.0);
    float pop = 0.0;
    for (int i = 0; i < 3; i++) {
      if (uCrackTime[i] <= 0.0) continue;
      float age = uTime - uCrackTime[i];
      if (age < 0.0) continue;
      float d  = distance(aTileCenter, uCrackPos[i]);
      float rj = (aTileRand.z - 0.5) * 0.05;                 // irregular boundary
      float reach = smoothstep(0.26, 0.0, d + rj);
      float shake = exp(-age * 12.0);                        // transient impact jitter
      float hold  = smoothstep(0.0, 0.05, age) * (1.0 - smoothstep(1.9, 2.5, age));
      // transient jitter + a SUSTAINED frozen per-tile offset that holds
      disp += (aTileRand.xy - 0.5) * reach * (shake * 0.018 + hold * 0.014);
      pop = max(pop, reach * hold * (0.7 + 0.3 * aTileRand.z));
    }

    vec2 so = localOffset * (swell + pop * 0.12);
    vec2 fp = aTileCenter + so + disp;
    pos.xy = fp - 0.5;
    vUv = fp;
    vTileLocal = (localOffset / vec2(TILE_W, TILE_H)) + 0.5;
    vPhase = 0.0;
    vScatter = pop;          // → raised-tile emboss in fragment
    vGlow = idleGlow;        // → idle/hover light in fragment
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    return;
  }

  vPhase = 1.0;

  float distToClick = distance(aTileCenter, uClickPos);
  float waveDelay = distToClick / SHATTER_WAVE_SPEED;
  float localTime = tsc - waveDelay;

  // Pre-wave: intact tile, faint incoming shimmer
  if (localTime <= 0.0) {
    vUv = currentUv;
    vPhase = 0.5;
    vTileLocal = vec2(0.5);
    vWave = smoothstep(0.12, 0.0, -localTime) * 0.6;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    return;
  }

  // ─── Position + finite-difference velocity ──────────────────────────────
  vec3 cNow = computeCenter(tsc, aTileCenter, aTileRand, uClickPos);
  float dt = 0.016;
  vec3 cPrev = computeCenter(max(tsc - dt, 0.0), aTileCenter, aTileRand, uClickPos);
  vec2 vel = (cNow.xy - cPrev.xy) / dt;
  float speed = length(vel);
  vec2 vdir = speed > 1e-4 ? vel / speed : vec2(0.0);

  vec2 finalPos = cNow.xy;
  float finalZ = cNow.z;

  // ─── Impact jolt — the "give way" shudder as it breaks ──────────────────
  float jolt = exp(-localTime * 16.0) * 0.02;
  vec2 joltDir = vec2(
    sin(localTime * 120.0 + aTileRand.x * 40.0),
    cos(localTime * 130.0 + aTileRand.y * 40.0)
  );
  finalPos += joltDir * jolt;

  // ─── Spin & scale ───────────────────────────────────────────────────────
  float spinBase = (aTileRand.y - 0.5) * 2.0 * SPIN_INTENSITY * localTime;
  float spinDamp = exp(-localTime * 1.4);
  float shrinkTarget = 0.42 + aTileRand.z * 0.22;
  float tileScale = mix(1.0, shrinkTarget, smoothstep(0.0, 0.06, localTime));
  float finalSpin = spinBase * spinDamp;
  float finalScale = tileScale;

  float tReb = tsc - REBUILD_START;
  if (tReb > 0.0) {
    float rHome = length(aTileCenter - VORTEX_CENTER);
    float rlt = tReb - (rHome * VORTEX_STAGGER + aTileRand.z * 0.12);
    if (rlt > 0.0) {
      float p  = clamp(rlt / SPIRAL_DUR, 0.0, 1.0);
      float pe = 1.0 - pow(1.0 - p, 3.0);
      finalSpin = spinBase * spinDamp * (1.0 - pe);
      float pop = 1.0 + sin(p * 3.14159) * 0.10 * smoothstep(0.55, 1.0, p);
      finalScale = clamp(mix(shrinkTarget, 1.0, pe) * pop, shrinkTarget, 1.12);
      float endSnap = smoothstep(TOTAL_DURATION - 0.4, TOTAL_DURATION - 0.08, tsc);
      finalSpin  = mix(finalSpin, 0.0, endSnap);
      finalScale = mix(finalScale, 1.0, endSnap);
    }
  }

  // ─── Local offset: scale, rotate, motion-blur stretch ───────────────────
  vec2 scaledOffset = localOffset * finalScale;
  float cs = cos(finalSpin), sn = sin(finalSpin);
  vec2 rotated = vec2(
    scaledOffset.x * cs - scaledOffset.y * sn,
    scaledOffset.x * sn + scaledOffset.y * cs
  );
  float stretch = clamp(speed * 0.12, 0.0, 0.5);
  rotated += vdir * dot(rotated, vdir) * stretch;

  vec2 finalUv = finalPos + rotated;
  pos.xy = finalUv - 0.5;
  pos.z += finalZ;

  vUv = finalUv;
  vDepth = finalZ;
  vSpeed = clamp(speed * 0.15, 0.0, 1.0);
  vVelDir = vdir;
  vScatter = clamp(length(finalPos - aTileCenter) * 3.0, 0.0, 1.0);
  vWave = smoothstep(0.0, 0.05, localTime) * (1.0 - smoothstep(0.05, 0.2, localTime)) * 0.8;
  float floorLine = TILE_H * 0.5;
  vFloorShade = smoothstep(floorLine + 0.18, floorLine, finalPos.y) * vScatter;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
