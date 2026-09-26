/**
 * Frame-rate independent exponential smoothing.
 * Ensures consistent damping across varying display refresh rates (60Hz, 120Hz, 144Hz).
 *
 * @param current Current value
 * @param target Destination value
 * @param rate Damping factor (higher = faster convergence)
 * @param dt Delta time in seconds
 */
export function expDamp(current: number, target: number, rate: number, dt: number): number {
  return current + (target - current) * (1.0 - Math.exp(-rate * dt));
}
