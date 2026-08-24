import * as THREE from "three";
import { VesselComponentProps } from "../../engine/types";

export interface Apparatus3DShatterSphereProps extends VesselComponentProps {
  /**
   * 3D Sphere/Cuboid radius (200 - 650).
   * @default 420
   */
  sphereRadius?: number;
  /**
   * Radial explosion magnitude (0.5 - 3.5).
   * @default 1.8
   */
  shatterForce?: number;
  /**
   * Tile scale multiplier (0.5 - 2.0).
   * @default 1.05
   */
  cardScale?: number;
  /**
   * Idle 3D spin speed (0 - 2.5).
   * @default 0.18
   */
  autoRotateSpeed?: number;
  /**
   * Number of cards on 3D sphere (20 - 60).
   * @default 42
   */
  itemCount?: number;
  /**
   * 3D Geometry variant.
   * @default "sphere"
   */
  shapeMode?: "sphere" | "cuboid" | "cuboid-grid";
  /**
   * Control visibility of center text overlay.
   * @default true
   */
  showCenterText?: boolean;
  /**
   * Delay in ms to automatically shatter on mount.
   * @default 0
   */
  autoShatterDelay?: number;
  /**
   * Prevent clicking from re-assembling once shattered.
   * @default false
   */
  disableRebuildOnClick?: boolean;
}

export interface MeshData {
  mesh: THREE.Mesh;
  unitPos: THREE.Vector3; // Position normalized at unit radius 1.0
  baseRot: THREE.Euler;
  material: THREE.MeshBasicMaterial;
  currentProx?: number;
}
