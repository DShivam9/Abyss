import { useRef } from "react";

/**
 * Returns a ref object whose `.current` property is always synchronized
 * with the latest value passed to the hook. Prevents stale closures in
 * callbacks and animation loops without re-subscribing effects.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
}
