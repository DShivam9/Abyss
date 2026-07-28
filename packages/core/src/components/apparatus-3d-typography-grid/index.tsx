import { useRef, useEffect } from "react";
import * as THREE from "three";
import { VesselComponentProps } from "../../engine/types";

// Vector THREE.Shape definitions for Swiss International Geometric Sans Typography (All A-Z)
function createSwissSansShape(char: string): THREE.Shape {
  const shape = new THREE.Shape();
  const c = char.toUpperCase();

  if (c === "A") {
    shape.moveTo(-16, -25); shape.lineTo(-7, 25); shape.lineTo(7, 25); shape.lineTo(16, -25); shape.lineTo(8, -25); shape.lineTo(5, -10); shape.lineTo(-5, -10); shape.lineTo(-8, -25); shape.closePath();
    const hole = new THREE.Path(); hole.moveTo(-3, -2); hole.lineTo(0, 16); hole.lineTo(3, -2); hole.closePath();
    shape.holes.push(hole);
  } else if (c === "B") {
    shape.moveTo(-14, -25); shape.lineTo(4, -25);
    shape.quadraticCurveTo(14, -25, 14, -13); shape.quadraticCurveTo(14, -2, 4, -2);
    shape.quadraticCurveTo(15, -2, 15, 12); shape.quadraticCurveTo(15, 25, 2, 25);
    shape.lineTo(-14, 25); shape.closePath();
    const hole1 = new THREE.Path(); hole1.moveTo(-6, 4); hole1.lineTo(3, 4); hole1.quadraticCurveTo(8, 4, 8, 13); hole1.quadraticCurveTo(8, 19, 3, 19); hole1.lineTo(-6, 19); hole1.closePath();
    const hole2 = new THREE.Path(); hole2.moveTo(-6, -19); hole2.lineTo(2, -19); hole2.quadraticCurveTo(7, -19, 7, -12); hole2.quadraticCurveTo(7, -7, 2, -7); hole2.lineTo(-6, -7); hole2.closePath();
    shape.holes.push(hole1, hole2);
  } else if (c === "C") {
    shape.moveTo(14, 15); shape.lineTo(7, 22); shape.quadraticCurveTo(-14, 28, -14, 0);
    shape.quadraticCurveTo(-14, -28, 7, -22); shape.lineTo(14, -15); shape.lineTo(8, -10);
    shape.quadraticCurveTo(-6, -18, -6, 0); shape.quadraticCurveTo(-6, 18, 8, 10); shape.closePath();
  } else if (c === "D") {
    shape.moveTo(-14, -25); shape.lineTo(2, -25); shape.quadraticCurveTo(16, -25, 16, 0); shape.quadraticCurveTo(16, 25, 2, 25); shape.lineTo(-14, 25); shape.closePath();
    const hole = new THREE.Path(); hole.moveTo(-6, -17); hole.lineTo(1, -17); hole.quadraticCurveTo(8, -17, 8, 0); hole.quadraticCurveTo(8, 17, 1, 17); hole.lineTo(-6, 17); hole.closePath();
    shape.holes.push(hole);
  } else if (c === "E") {
    shape.moveTo(-14, -25); shape.lineTo(14, -25); shape.lineTo(14, -17); shape.lineTo(-6, -17); shape.lineTo(-6, -4); shape.lineTo(12, -4); shape.lineTo(12, 4); shape.lineTo(-6, 4); shape.lineTo(-6, 17); shape.lineTo(14, 17); shape.lineTo(14, 25); shape.lineTo(-14, 25); shape.closePath();
  } else if (c === "F") {
    shape.moveTo(-14, -25); shape.lineTo(-6, -25); shape.lineTo(-6, -3); shape.lineTo(8, -3); shape.lineTo(8, 4); shape.lineTo(-6, 4); shape.lineTo(-6, 17); shape.lineTo(12, 17); shape.lineTo(12, 25); shape.lineTo(-14, 25); shape.closePath();
  } else if (c === "G") {
    shape.moveTo(14, 15); shape.lineTo(7, 22); shape.quadraticCurveTo(-14, 28, -14, 0); shape.quadraticCurveTo(-14, -28, 7, -22); shape.lineTo(14, -15); shape.lineTo(14, 0); shape.lineTo(4, 0); shape.lineTo(4, 7); shape.lineTo(21, 7); shape.lineTo(21, -17); shape.lineTo(14, -17); shape.quadraticCurveTo(8, -20, 0, -20); shape.quadraticCurveTo(-6, -18, -6, 0); shape.quadraticCurveTo(-6, 18, 8, 10); shape.closePath();
  } else if (c === "H") {
    shape.moveTo(-16, -25); shape.lineTo(-8, -25); shape.lineTo(-8, -4); shape.lineTo(8, -4); shape.lineTo(8, -25); shape.lineTo(16, -25); shape.lineTo(16, 25); shape.lineTo(8, 25); shape.lineTo(8, 4); shape.lineTo(-8, 4); shape.lineTo(-8, 25); shape.lineTo(-16, 25); shape.closePath();
  } else if (c === "I") {
    shape.moveTo(-5, -25); shape.lineTo(5, -25); shape.lineTo(5, 25); shape.lineTo(-5, 25); shape.closePath();
  } else if (c === "J") {
    shape.moveTo(14, 25); shape.lineTo(14, -10); shape.quadraticCurveTo(14, -25, -2, -25); shape.quadraticCurveTo(-14, -25, -14, -12); shape.lineTo(-6, -12); shape.quadraticCurveTo(-6, -17, -2, -17); shape.quadraticCurveTo(6, -17, 6, -10); shape.lineTo(6, 25); shape.closePath();
  } else if (c === "K") {
    shape.moveTo(-14, -25); shape.lineTo(-6, -25); shape.lineTo(-6, -3); shape.lineTo(6, -25); shape.lineTo(16, -25); shape.lineTo(2, -4); shape.lineTo(16, 25); shape.lineTo(6, 25); shape.lineTo(-6, 4); shape.lineTo(-6, 25); shape.lineTo(-14, 25); shape.closePath();
  } else if (c === "L") {
    shape.moveTo(-14, -25); shape.lineTo(-6, -25); shape.lineTo(-6, 17); shape.lineTo(12, 17); shape.lineTo(12, 25); shape.lineTo(-14, 25); shape.closePath();
  } else if (c === "M") {
    shape.moveTo(-18, -25); shape.lineTo(-10, -25); shape.lineTo(0, 5); shape.lineTo(10, -25); shape.lineTo(18, -25); shape.lineTo(18, 25); shape.lineTo(11, 25); shape.lineTo(11, -8); shape.lineTo(2, 18); shape.lineTo(-2, 18); shape.lineTo(-11, -8); shape.lineTo(-11, 25); shape.lineTo(-18, 25); shape.closePath();
  } else if (c === "N") {
    shape.moveTo(-16, -25); shape.lineTo(-8, -25); shape.lineTo(6, 10); shape.lineTo(6, -25); shape.lineTo(14, -25); shape.lineTo(14, 25); shape.lineTo(6, 25); shape.lineTo(-8, -10); shape.lineTo(-8, 25); shape.lineTo(-16, 25); shape.closePath();
  } else if (c === "O") {
    shape.moveTo(0, -25); shape.quadraticCurveTo(-16, -25, -16, 0); shape.quadraticCurveTo(-16, 25, 0, 25); shape.quadraticCurveTo(16, 25, 16, 0); shape.quadraticCurveTo(16, -25, 0, -25); shape.closePath();
    const hole = new THREE.Path(); hole.moveTo(0, -17); hole.quadraticCurveTo(-8, -17, -8, 0); hole.quadraticCurveTo(-8, 17, 0, 17); hole.quadraticCurveTo(8, 17, 8, 0); hole.quadraticCurveTo(8, -17, 0, -17); hole.closePath();
    shape.holes.push(hole);
  } else if (c === "P") {
    shape.moveTo(-14, -25); shape.lineTo(-6, -25); shape.lineTo(-6, 2); shape.lineTo(4, 2); shape.quadraticCurveTo(14, 2, 14, 13); shape.quadraticCurveTo(14, 25, 4, 25); shape.lineTo(-14, 25); shape.closePath();
    const hole = new THREE.Path(); hole.moveTo(-6, 9); hole.lineTo(3, 9); hole.quadraticCurveTo(7, 9, 7, 13.5); hole.quadraticCurveTo(7, 18, 3, 18); hole.lineTo(-6, 18); hole.closePath();
    shape.holes.push(hole);
  } else if (c === "Q") {
    shape.moveTo(0, -25); shape.quadraticCurveTo(-16, -25, -16, 0); shape.quadraticCurveTo(-16, 25, 0, 25); shape.quadraticCurveTo(16, 25, 16, 0); shape.quadraticCurveTo(16, -25, 0, -25); shape.closePath();
    const hole = new THREE.Path(); hole.moveTo(0, -17); hole.quadraticCurveTo(-8, -17, -8, 0); hole.quadraticCurveTo(-8, 17, 0, 17); hole.quadraticCurveTo(8, 17, 8, 0); hole.quadraticCurveTo(8, -17, 0, -17); hole.closePath();
    shape.holes.push(hole);
  } else if (c === "R") {
    shape.moveTo(-14, -25); shape.lineTo(-6, -25); shape.lineTo(-6, 0); shape.lineTo(3, -25); shape.lineTo(12, -25); shape.lineTo(2, -2); shape.quadraticCurveTo(13, 2, 13, 13); shape.quadraticCurveTo(13, 25, 2, 25); shape.lineTo(-14, 25); shape.closePath();
    const hole = new THREE.Path(); hole.moveTo(-6, 7); hole.lineTo(2, 7); hole.quadraticCurveTo(6, 7, 6, 13); hole.quadraticCurveTo(6, 18, 2, 18); hole.lineTo(-6, 18); hole.closePath();
    shape.holes.push(hole);
  } else if (c === "S") {
    shape.moveTo(-12, -18); shape.quadraticCurveTo(12, -28, 12, -13); shape.quadraticCurveTo(12, -2, -2, 2); shape.quadraticCurveTo(-14, 6, -14, 14); shape.quadraticCurveTo(-14, 28, 12, 18); shape.lineTo(10, 11); shape.quadraticCurveTo(-6, 20, -6, 13); shape.quadraticCurveTo(-6, 7, 3, 4); shape.quadraticCurveTo(20, 0, 20, -13); shape.quadraticCurveTo(20, -28, -10, -25); shape.closePath();
  } else if (c === "T") {
    shape.moveTo(-18, 17); shape.lineTo(-18, 25); shape.lineTo(18, 25); shape.lineTo(18, 17); shape.lineTo(4, 17); shape.lineTo(4, -25); shape.lineTo(-4, -25); shape.lineTo(-4, 17); shape.closePath();
  } else if (c === "U") {
    shape.moveTo(-16, 25); shape.lineTo(-8, 25); shape.lineTo(-8, -10); shape.quadraticCurveTo(-8, -18, 0, -18); shape.quadraticCurveTo(8, -18, 8, -10); shape.lineTo(8, 25); shape.lineTo(16, 25); shape.lineTo(16, -10); shape.quadraticCurveTo(16, -25, 0, -25); shape.quadraticCurveTo(-16, -25, -16, -10); shape.closePath();
  } else if (c === "V") {
    shape.moveTo(-16, 25); shape.lineTo(-8, 25); shape.lineTo(0, -17); shape.lineTo(8, 25); shape.lineTo(16, 25); shape.lineTo(4, -25); shape.lineTo(-4, -25); shape.closePath();
  } else if (c === "W") {
    shape.moveTo(-20, 25); shape.lineTo(-13, 25); shape.lineTo(-7, -10); shape.lineTo(-1, 25); shape.lineTo(6, 25); shape.lineTo(12, -10); shape.lineTo(17, 25); shape.lineTo(24, 25); shape.lineTo(16, -25); shape.lineTo(9, -25); shape.lineTo(3, 8); shape.lineTo(-3, -25); shape.lineTo(-10, -25); shape.closePath();
  } else if (c === "X") {
    shape.moveTo(-16, 25); shape.lineTo(-7, 25); shape.lineTo(0, 10); shape.lineTo(7, 25); shape.lineTo(16, 25); shape.lineTo(6, 0); shape.lineTo(16, -25); shape.lineTo(7, -25); shape.lineTo(0, -10); shape.lineTo(-7, -25); shape.lineTo(-16, -25); shape.lineTo(-6, 0); shape.closePath();
  } else if (c === "Y") {
    shape.moveTo(-16, 25); shape.lineTo(-8, 25); shape.lineTo(0, 6); shape.lineTo(8, 25); shape.lineTo(16, 25); shape.lineTo(5, 0); shape.lineTo(5, -25); shape.lineTo(-5, -25); shape.lineTo(-5, 0); shape.closePath();
  } else if (c === "Z") {
    shape.moveTo(-14, 25); shape.lineTo(14, 25); shape.lineTo(14, 18); shape.lineTo(-4, -17); shape.lineTo(14, -17); shape.lineTo(14, -25); shape.lineTo(-14, -25); shape.lineTo(-14, -18); shape.lineTo(4, 17); shape.lineTo(-14, 17); shape.closePath();
  } else {
    shape.moveTo(-12, -25); shape.lineTo(12, -25); shape.lineTo(12, 25); shape.lineTo(-12, 25); shape.closePath();
  }

  return shape;
}

export default function Apparatus3DTypographyGrid({
  letter = "A",
  presetLetter = "A",
  presetWord = "",
  customWord = "",
  word = "",
  motionMode = "wave",
  rotationSpeed = 1.0,
  wireframeDepth = 7,
  className = "",
  style,
}: VesselComponentProps & {
  letter?: string;
  presetLetter?: string;
  presetWord?: string;
  customWord?: string;
  word?: string;
  motionMode?: "orbit" | "wave" | "drift" | "vortex";
  rotationSpeed?: number;
  wireframeDepth?: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Active word or letter selection, clamped to max 10 characters limit
  const activeInput = (presetWord || customWord || word || presetLetter || letter || "A")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 10);

  const cleanChars = activeInput.length > 0 ? activeInput.split("") : ["A"];

  // Three.js 3D WebGL Scene Initialization & Render Loop
  useEffect(() => {
    if (!mountRef.current) return;

    // Camera Z distance auto-scales with word length (1 letter = 220, 10 letters = ~550)
    const baseCamDist = cleanChars.length <= 1 ? 220 : Math.max(220, cleanChars.length * 52);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
    camera.position.set(0, 0, baseCamDist);
    camera.lookAt(0, 0, 0);

    // WebGL Renderer with absolute CSS pinning
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.pointerEvents = "none";
    mountRef.current.appendChild(renderer.domElement);

    // Sync camera & renderer size to mount element bounds
    const updateSize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth || window.innerWidth;
      const height = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, true);
    };

    updateSize();

    // Native ResizeObserver guarantees centering on layout changes
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(mountRef.current);

    // Common materials
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
    });
    const solidMaterial = new THREE.MeshBasicMaterial({
      color: 0x050508,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });

    // Unified 3D Word Group centered at (0, 0, 0)
    const wordGroup = new THREE.Group();
    const charGroups: THREE.Group[] = [];
    const letterSpacing = 36;

    cleanChars.forEach((char, idx) => {
      const shape = createSwissSansShape(char);
      const extrudeSettings = {
        depth: wireframeDepth,
        bevelEnabled: false,
        steps: 1,
      };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.computeBoundingBox();
      geometry.center();

      const edgesGeo = new THREE.EdgesGeometry(geometry, 45);
      const wireframeMesh = new THREE.LineSegments(edgesGeo, lineMaterial);
      const solidMesh = new THREE.Mesh(geometry, solidMaterial);

      const charGroup = new THREE.Group();
      charGroup.add(solidMesh);
      charGroup.add(wireframeMesh);

      // Position characters evenly along X-axis centered at origin
      const xPos = (idx - (cleanChars.length - 1) / 2) * letterSpacing;
      charGroup.position.set(xPos, 0, 0);

      wordGroup.add(charGroup);
      charGroups.push(charGroup);
    });

    wordGroup.position.set(0, 0, 0);
    scene.add(wordGroup);

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    let animId: number;
    let targetRotY = 0;

    const renderLoop = () => {
      const time = Date.now() * 0.002;

      if (motionMode === "orbit") {
        // Continuous 360° Y-axis spin strictly in ORBIT mode
        targetRotY += 0.035 * rotationSpeed;
        wordGroup.rotation.y = targetRotY;
        wordGroup.rotation.x = 0;
        wordGroup.rotation.z = 0;
      } else {
        // Front-facing orientation for focused 3D motion modes
        wordGroup.rotation.y = 0;
        wordGroup.rotation.x = 0;
        wordGroup.rotation.z = 0;
      }

      // Distinct 3D Motion Modes
      charGroups.forEach((charGroup, idx) => {
        const offset = idx - (cleanChars.length - 1) / 2;
        const baseX = offset * letterSpacing;

        let yPos = 0;
        let zPos = 0;
        let rotYOffset = 0;
        let rotZOffset = 0;

        if (motionMode === "wave") {
          // Front-facing 3D vertical sine wave floating
          yPos = Math.sin(time * 3.0 + idx * 0.7) * 16.0;
          rotZOffset = Math.sin(time * 2.5 + idx * 0.5) * 0.12;
        } else if (motionMode === "drift") {
          // Front-facing 3D Z-depth pulse (drifting in & out toward viewer)
          zPos = Math.sin(time * 2.5 + idx * 0.6) * 55.0;
          yPos = Math.sin(time * 1.8 + idx * 0.4) * 4.0;
        } else if (motionMode === "vortex") {
          // Kinetic helical spiral twist
          rotYOffset = time * 1.5 * rotationSpeed + offset * 0.35;
          zPos = Math.cos(time * 2.5 + idx * 0.7) * 25.0;
          yPos = Math.sin(time * 2.5 + idx * 0.7) * 12.0;
        }

        charGroup.position.set(baseX, yPos, zPos);
        charGroup.rotation.y = rotYOffset;
        charGroup.rotation.z = rotZOffset;
      });

      renderer.render(scene, camera);
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      lineMaterial.dispose();
      solidMaterial.dispose();
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [activeInput, wireframeDepth, rotationSpeed, motionMode]);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 w-full h-full bg-[#060608] text-white flex items-center justify-center select-none overflow-hidden ${className}`}
      style={style}
    />
  );
}
