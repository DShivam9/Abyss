import { useState, useRef } from "react";

export type VesselLifecycleState = "idle" | "discovery" | "buildUp" | "peak" | "recovery";

export function useVesselLifecycle(
  onStateChange?: (state: VesselLifecycleState) => void
) {
  const [state, setState] = useState<VesselLifecycleState>("idle");
  const stateRef = useRef<VesselLifecycleState>("idle");

  const transitionTo = (newState: VesselLifecycleState) => {
    if (stateRef.current === newState) return;
    stateRef.current = newState;
    setState(newState);
    if (onStateChange) {
      onStateChange(newState);
    }
  };

  return {
    state,
    stateRef,
    transitionTo,
  };
}
