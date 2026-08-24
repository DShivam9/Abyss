let sharedAudioContext: AudioContext | null = null;

export function unlockAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioContext) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) sharedAudioContext = new AudioCtx();
  }
  if (sharedAudioContext && sharedAudioContext.state === "suspended") {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

if (typeof window !== "undefined") {
  const unlock = () => {
    unlockAudioContext();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
}

export function playTactileHoverSound() {
  const ctx = unlockAudioContext();
  if (!ctx || ctx.state !== "running") return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Winning Nylon Detent Notch [05] (800Hz bandpassed leaf tick)
  osc.type = "triangle";
  osc.frequency.setValueAtTime(800, now);

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(850, now);
  filter.Q.value = 2.0;

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.06, now + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.0065);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.0075);
}
