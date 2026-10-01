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
  uniform float uBlurStrength;
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

    vec4 col;
    if (abs(uBlurStrength) > 0.0012) {
      // Step direction follows trail behind moving pixels
      float stepDir = -sign(uBlurStrength);
      float blurStep = abs(uBlurStrength) * stepDir * (0.2 + 0.8 * airfoilChord);

      vec2 uv0 = uv;
      vec2 uv1 = vec2(uv.x, uv.y + blurStep * 1.0);
      vec2 uv2 = vec2(uv.x, uv.y + blurStep * 2.2);
      vec2 uv3 = vec2(uv.x, uv.y + blurStep * 3.6);

      vec4 s0 = texture2D(tDiffuse, uv0);
      vec4 s1 = (uv1.y >= 0.0 && uv1.y <= 1.0) ? texture2D(tDiffuse, uv1) : vec4(0.0);
      vec4 s2 = (uv2.y >= 0.0 && uv2.y <= 1.0) ? texture2D(tDiffuse, uv2) : vec4(0.0);
      vec4 s3 = (uv3.y >= 0.0 && uv3.y <= 1.0) ? texture2D(tDiffuse, uv3) : vec4(0.0);

      // Premultiplied alpha weighting prevents transparent card boundaries from smearing opaque halos
      float w0 = 0.44 * s0.a;
      float w1 = 0.28 * s1.a;
      float w2 = 0.18 * s2.a;
      float w3 = 0.10 * s3.a;
      float totalW = w0 + w1 + w2 + w3;

      if (totalW > 0.001) {
        vec3 rgb = (s0.rgb * w0 + s1.rgb * w1 + s2.rgb * w2 + s3.rgb * w3) / totalW;
        float a = s0.a * 0.44 + s1.a * 0.28 + s2.a * 0.18 + s3.a * 0.10;
        col = vec4(rgb, a);
      } else {
        col = vec4(0.0);
      }
    } else {
      col = texture2D(tDiffuse, uv);
    }

    if (col.a <= 0.005) {
      discard;
    }

    gl_FragColor = col;
  }
`;
