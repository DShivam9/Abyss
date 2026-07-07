import React, { useRef, useMemo, useCallback } from "react";
import * as THREE from "three";
import { VesselCanvas } from "../../engine/VesselCanvas";
import { VesselComponentProps } from "../../engine/types";
import vert from "./shader.vert.glsl";
import frag from "./shader.frag.glsl";

// ─── Constants ──────────────────────────────────────────────────────────────
const GRID_COLS = 96;
const GRID_ROWS = 96;
const TOTAL_DURATION = 6.0; // Must match shader TOTAL_DURATION
const SHATTER_AT_CLICK = 3; // Clicks needed before the image gives way
const CRACK_RESET = 2.5;    // Seconds of no follow-up → cracks heal back to clean
const MAX_CRACKS = 3;       // Crack impact points retained for rendering

// ─── Seeded PRNG (deterministic per-tile) ───────────────────────────────────
function seededRandom(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 43758.5453123);
  return n - Math.floor(n);
}

// ─── Geometry Builder ───────────────────────────────────────────────────────
// Builds a non-indexed PlaneGeometry where each tile has 6 vertices (2 tris).
// Custom attributes: aTileCenter (vec2), aTileRand (vec4).
function buildTileGeometry(cols: number, rows: number): THREE.BufferGeometry {
  const totalTiles = cols * rows;
  const vertsPerTile = 6; // 2 triangles
  const totalVerts = totalTiles * vertsPerTile;

  const positions = new Float32Array(totalVerts * 3);
  const uvs = new Float32Array(totalVerts * 2);
  const tileCenters = new Float32Array(totalVerts * 2);
  const tileRands = new Float32Array(totalVerts * 4);

  const tileW = 1.0 / cols;
  const tileH = 1.0 / rows;

  let vi = 0; // vertex index

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // UV-space bounds of this tile
      const u0 = col * tileW;
      const v0 = row * tileH;
      const u1 = u0 + tileW;
      const v1 = v0 + tileH;

      // Center in UV space
      const cx = u0 + tileW * 0.5;
      const cy = v0 + tileH * 0.5;

      // Position in mesh space (-0.5 to 0.5)
      const px0 = u0 - 0.5;
      const py0 = v0 - 0.5;
      const px1 = u1 - 0.5;
      const py1 = v1 - 0.5;

      // Per-tile random values (deterministic)
      const r0 = seededRandom(col, row, 1.0);  // blast angle offset
      const r1 = seededRandom(col, row, 2.0);  // spin direction/speed
      const r2 = seededRandom(col, row, 3.0);  // rebuild stagger noise
      const r3 = seededRandom(col, row, 4.0);  // floor pile-up offset

      // 6 vertices: tri1 (0,1,2) + tri2 (2,1,3) where:
      //   0=BL, 1=BR, 2=TL, 3=TR
      const corners = [
        // Triangle 1: BL, BR, TL
        { px: px0, py: py0, u: u0, v: v0 },
        { px: px1, py: py0, u: u1, v: v0 },
        { px: px0, py: py1, u: u0, v: v1 },
        // Triangle 2: TL, BR, TR
        { px: px0, py: py1, u: u0, v: v1 },
        { px: px1, py: py0, u: u1, v: v0 },
        { px: px1, py: py1, u: u1, v: v1 },
      ];

      for (const corner of corners) {
        // Position (z=0)
        positions[vi * 3 + 0] = corner.px;
        positions[vi * 3 + 1] = corner.py;
        positions[vi * 3 + 2] = 0;

        // UV
        uvs[vi * 2 + 0] = corner.u;
        uvs[vi * 2 + 1] = corner.v;

        // Tile center (same for all 6 verts of this tile)
        tileCenters[vi * 2 + 0] = cx;
        tileCenters[vi * 2 + 1] = cy;

        // Tile rand (same for all 6 verts of this tile)
        tileRands[vi * 4 + 0] = r0;
        tileRands[vi * 4 + 1] = r1;
        tileRands[vi * 4 + 2] = r2;
        tileRands[vi * 4 + 3] = r3;

        vi++;
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute("aTileCenter", new THREE.BufferAttribute(tileCenters, 2));
  geometry.setAttribute("aTileRand", new THREE.BufferAttribute(tileRands, 4));

  return geometry;
}

// ─── Component ──────────────────────────────────────────────────────────────
export const InstagramOverlay: React.FC<VesselComponentProps> = (props) => {
  const clickPosRef = useRef(new THREE.Vector2(0.5, 0.5));
  const clickTimeRef = useRef(-999.0);
  const shatterTimeRef = useRef(-999.0);
  const clickCountRef = useRef(0);

  // Accumulated crack impact points (shared refs → uploaded as array uniforms)
  const crackPosRef = useRef(
    Array.from({ length: MAX_CRACKS }, () => new THREE.Vector2(0.5, 0.5))
  );
  const crackTimeRef = useRef<number[]>(Array(MAX_CRACKS).fill(-999.0));

  // Build geometry once (memoized, never changes)
  const tileGeometry = useMemo(() => buildTileGeometry(GRID_COLS, GRID_ROWS), []);

  const resetDamage = () => {
    clickCountRef.current = 0;
    clickTimeRef.current = -999.0;
    shatterTimeRef.current = -999.0;
    for (let i = 0; i < MAX_CRACKS; i++) crackTimeRef.current[i] = -999.0;
  };

  const handleClickCanvas = useCallback((uv: THREE.Vector2, clock: THREE.Clock) => {
    const t = clock.getElapsedTime();

    // Ignore clicks while a shatter is already playing out
    if (shatterTimeRef.current > 0 && t - shatterTimeRef.current < TOTAL_DURATION) {
      return;
    }

    clickCountRef.current += 1;
    clickPosRef.current.copy(uv);
    clickTimeRef.current = t;

    // Record this impact as a crack point
    const idx = Math.min(clickCountRef.current - 1, MAX_CRACKS - 1);
    crackPosRef.current[idx].copy(uv);
    crackTimeRef.current[idx] = t;

    // The image gives way on the final hit
    if (clickCountRef.current >= SHATTER_AT_CLICK) {
      shatterTimeRef.current = t;
    }
  }, []);

  const handleAnimate = useCallback((material: THREE.ShaderMaterial, clock: THREE.Clock) => {
    const t = clock.getElapsedTime();
    const u = material.uniforms;

    if (u.uClickPos) u.uClickPos.value.copy(clickPosRef.current);
    if (u.uClickTime) u.uClickTime.value = clickTimeRef.current;
    if (u.uShatterTime) u.uShatterTime.value = shatterTimeRef.current;
    if (u.uClickCount) u.uClickCount.value = clickCountRef.current;
    if (u.uCrackTime) u.uCrackTime.value = crackTimeRef.current;

    // Reset once the shatter has fully settled…
    if (shatterTimeRef.current > 0 && t - shatterTimeRef.current > TOTAL_DURATION) {
      resetDamage();
    }
    // …or heal the cracks if the user never followed through
    else if (
      shatterTimeRef.current <= 0 &&
      clickCountRef.current > 0 &&
      t - clickTimeRef.current > CRACK_RESET
    ) {
      resetDamage();
    }
  }, []);

  return (
    <VesselCanvas
      {...props}
      vertexShader={vert}
      fragmentShader={frag}
      customGeometry={tileGeometry}
      uniforms={{
        uClickPos: new THREE.Vector2(0.5, 0.5),
        uClickTime: -999.0,
        uShatterTime: -999.0,
        uClickCount: 0.0,
        uCrackPos: crackPosRef.current,
        uCrackTime: crackTimeRef.current,
      }}
      onClickCanvas={handleClickCanvas}
      onAnimate={handleAnimate}
      ariaLabel="Multi-hit glass shatter and vortex rebuild interaction"
    />
  );
};

export default InstagramOverlay;