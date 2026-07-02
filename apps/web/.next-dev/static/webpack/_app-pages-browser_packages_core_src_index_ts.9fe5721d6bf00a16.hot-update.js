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

/***/ "(app-pages-browser)/../../packages/core/src/components/instagram-overlay/shader.vert.glsl":
/*!*****************************************************************************!*\
  !*** ../../packages/core/src/components/instagram-overlay/shader.vert.glsl ***!
  \*****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = "// ═══════════════════════════════════════════════════════════════════════════\n// Voronoi Glass Shatter — Vertex Shader\n// ═══════════════════════════════════════════════════════════════════════════\n// Snaps mesh vertices to local grid coordinates and shrinks cells to form\n// individual pixel particles that scatter in 3D space on click.\n// ═══════════════════════════════════════════════════════════════════════════\n\nuniform float uTime;\nuniform float uHover;\nuniform vec2  uMouse;\nuniform vec2  uClickPos;\nuniform float uClickTime;\n\nvarying vec2 vUv;\nvarying float vClickAmt;\nvarying float vRebuildProgress;\nvarying float vShattered;\n\n#define GRID_SIZE 72.0\n\n// Procedural Hash Utilities\nfloat hash(vec2 p) {\n  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);\n}\n\nvec2 hash22(vec2 p) {\n  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));\n  return fract(sin(p) * 43758.5453123);\n}\n\nvoid main() {\n  vec2 currentUv = uv;\n  vec3 displacedPos = position;\n\n  // ─── Click Timeline Analysis ─────────────────────────────────────────────\n  float timeSinceClick = uTime - uClickTime;\n  \n  if (timeSinceClick > 0.0 && timeSinceClick < 5.0) {\n    vShattered = 1.0;\n    \n    // Snapping uv to grid cell center\n    vec2 C = (floor(currentUv * GRID_SIZE) + 0.5) / GRID_SIZE;\n    vec2 localPos = currentUv - C;\n    \n    // Calculate timelines\n    float tFall = clamp(timeSinceClick, 0.0, 2.2);\n    float rebuild = smoothstep(2.2, 4.4, timeSinceClick);\n    \n    vClickAmt = 1.0 - rebuild;\n    vRebuildProgress = rebuild;\n\n    // 1. Shrink cells into individual pixel particles\n    float scale = mix(1.0, 0.16, clamp(timeSinceClick * 5.0, 0.0, 1.0));\n    scale = mix(scale, 1.0, rebuild);\n    \n    // 2. Blast & Random Scatter vectors\n    float distToClick = distance(C, uClickPos);\n    vec2 blastDir = normalize(C - uClickPos);\n    float blastForce = exp(-distToClick * 2.8) * 0.18;\n    \n    // Unique trajectory per pixel particle using C as seed\n    vec2 randDir = hash22(C) * 2.0 - 1.0;\n    float randSpeed = hash(C * 1.5) * 0.38 + 0.12;\n    \n    vec2 scatterOffset = (blastDir * blastForce + randDir * randSpeed) * tFall;\n    float scatterZ = (sin(tFall * 4.0 + hash(C) * 6.28) * 0.08 + hash(C) * 0.15) * tFall;\n    \n    // Interpolated particle coordinates\n    vec2 currentOffset = mix(scatterOffset, vec2(0.0), rebuild);\n    float currentZ = mix(scatterZ, 0.0, rebuild);\n    \n    vec2 finalUv = C + localPos * scale + currentOffset;\n    \n    displacedPos.xy = finalUv - 0.5;\n    displacedPos.z += currentZ;\n    \n    vUv = finalUv;\n  } else {\n    vUv = currentUv;\n    vClickAmt = 0.0;\n    vRebuildProgress = 0.0;\n    vShattered = 0.0;\n  }\n\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPos, 1.0);\n}";

/***/ })

});