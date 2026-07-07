import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface VesselMouseState {
  position: THREE.Vector2;
  velocity: THREE.Vector2;
  isHovering: boolean;
  hoverDuration: number;
  entryPoint: THREE.Vector2;
}

export function useVesselMouse(containerRef: React.RefObject<HTMLElement | null>) {
  const stateRef = useRef<VesselMouseState>({
    position: new THREE.Vector2(0.5, 0.5),
    velocity: new THREE.Vector2(0, 0),
    isHovering: false,
    hoverDuration: 0,
    entryPoint: new THREE.Vector2(0.5, 0.5),
  });

  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const currentMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const lastTarget = useRef(new THREE.Vector2(0.5, 0.5));
  const entryTime = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMouse.current.set(x, y);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      stateRef.current.isHovering = true;
      entryTime.current = performance.now();
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      stateRef.current.entryPoint.set(x, y);
    };

    const handleMouseLeave = () => {
      stateRef.current.isHovering = false;
      entryTime.current = null;
      stateRef.current.hoverDuration = 0;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [containerRef]);

  const updateMouse = (_deltaTime: number) => {
    // Lerp mouse coordinates
    currentMouse.current.x = THREE.MathUtils.lerp(currentMouse.current.x, targetMouse.current.x, 0.1);
    currentMouse.current.y = THREE.MathUtils.lerp(currentMouse.current.y, targetMouse.current.y, 0.1);

    // Compute raw velocity from target mouse (as specified in Issue 11 fix)
    const rawVx = targetMouse.current.x - lastTarget.current.x;
    const rawVy = targetMouse.current.y - lastTarget.current.y;
    stateRef.current.velocity.set(rawVx, rawVy);

    lastTarget.current.copy(targetMouse.current);
    stateRef.current.position.copy(currentMouse.current);

    if (stateRef.current.isHovering && entryTime.current !== null) {
      stateRef.current.hoverDuration = (performance.now() - entryTime.current) / 1000;
    } else {
      stateRef.current.hoverDuration = 0;
    }
  };

  return {
    stateRef,
    updateMouse,
  };
}
