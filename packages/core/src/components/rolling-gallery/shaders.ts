/**
 * GLSL Shaders for Rolling Gallery Post-Processing FBO Curvature Pass
 */

export const POST_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const POST_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D tDiffuse;
  uniform float uStrength;
  uniform float uDistance;
  uniform float uSpanCamber;
  uniform float uExitArc;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Span [-1, 1] relative to horizontal center
    float span = uv.x * 2.0 - 1.0;

    // Hero Base Curl: Dominant cylindrical anchor entering at bottom
    float bottomCurl = pow(clamp(1.0 - uv.y, 0.0, 1.0), uDistance);

    // Subtle Top Exit: High exponent (uDistance * 1.45) confines it strictly to the top edge release
    // Keeps active reading zone completely clean with zero card collision
    float topExit = pow(clamp(uv.y, 0.0, 1.0), uDistance * 1.45);

    // Base hero stays primary (1.0x weight); exit acts as graceful secondary roll
    float airfoilChord = bottomCurl + topExit * uExitArc;

    // Aerodynamic span camber: outer wingtips flex smoothly
    float spanFlex = 1.0 + uSpanCamber * (span * span);

    // Horizontal displacement (pure cylindrical curvature: zero vertical distortion)
    float str = uStrength * -0.05;
    uv.x += span * str * airfoilChord * spanFlex;

    // Discard border pixels to prevent texture edge-clamping smear
    if (uv.x <= 0.002 || uv.x >= 0.998 || uv.y <= 0.002 || uv.y >= 0.998) {
      discard;
    }

    // Pure photographic transmission
    gl_FragColor = texture2D(tDiffuse, uv);
  }
`;
