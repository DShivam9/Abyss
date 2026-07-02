"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("_app-pages-browser_packages_core_src_index_ts",{

/***/ "(app-pages-browser)/../../packages/core/src/components/instagram-overlay/shader.frag.glsl":
/*!*****************************************************************************!*\
  !*** ../../packages/core/src/components/instagram-overlay/shader.frag.glsl ***!
  \*****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = "// ═══════════════════════════════════════════════════════════════════════════\n// Voronoi Glass Shatter — Fragment Shader\n// ═══════════════════════════════════════════════════════════════════════════\n// Renders pixel particle borders, dynamic blocky pixelation during reassembly,\n// and background image. All hover effects (grid, glare) removed.\n// ═══════════════════════════════════════════════════════════════════════════\n\nuniform sampler2D tMap;\nuniform float uTime;\nuniform float uHover;\nuniform float uAspect;\nuniform vec2  uMouse;\nuniform float uClickTime;\n\nvarying vec2 vUv;\nvarying float vClickAmt;\nvarying float vRebuildProgress;\nvarying float vShattered;\n\n#define GRID_SIZE 72.0\n\nvoid main() {\n  vec2 uv = vUv;\n  vec3 col;\n\n  // ─── 1. Pixel Particle Rendering (Active Shatter) ──────────────────────\n  if (vShattered > 0.001) {\n    // Dynamic pixelation resolution resolving during reassembly\n    float pixelResolution = mix(16.0, GRID_SIZE, vRebuildProgress);\n    vec2 pixelUv = (floor(uv * pixelResolution) + 0.5) / pixelResolution;\n    \n    col = texture2D(tMap, pixelUv).rgb;\n\n    // Draw dark borders around each pixel block to make them distinct 3D squares\n    vec2 localCoord = fract(uv * GRID_SIZE);\n    float borderMask = smoothstep(0.0, 0.08, localCoord.x) * smoothstep(1.0, 0.92, localCoord.x) *\n                       smoothstep(0.0, 0.08, localCoord.y) * smoothstep(1.0, 0.92, localCoord.y);\n                       \n    // Border fades as particles snap back to solid sheet\n    col *= mix(0.55, 1.0, mix(borderMask, 1.0, vRebuildProgress));\n  } else {\n    // ─── 2. Clean Surface Rendering (Idle / Hover) ────────────────────────\n    col = texture2D(tMap, uv).rgb;\n  }\n\n  // ─── 3. Assembly Snap Flash ─────────────────────────────────────────────\n  float timeSinceClick = uTime - uClickTime;\n  if (timeSinceClick > 3.25 && timeSinceClick < 3.55) {\n    float flash = smoothstep(3.25, 3.38, timeSinceClick) * smoothstep(3.55, 3.38, timeSinceClick) * 0.45;\n    col += vec3(0.96, 0.98, 1.0) * flash;\n  }\n\n  // ─── 4. Subtle Edge Vignette ────────────────────────────────────────────\n  vec2 vignetteCoord = uv * 2.0 - 1.0;\n  float vignette = 1.0 - dot(vignetteCoord * 0.40, vignetteCoord * 0.40);\n  vignette = clamp(vignette, 0.0, 1.0);\n  vignette = smoothstep(0.0, 0.55, vignette);\n  col *= vignette;\n\n  gl_FragColor = vec4(col, 1.0);\n}";

/***/ })

});