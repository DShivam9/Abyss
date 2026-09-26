import gsap from "gsap";
import { ExtendedTrackItem } from "./types";

export const BAKED_VOLUME = 0.15;

let globalAudioInstance: HTMLAudioElement | null = null;
let sharedAudioCtx: AudioContext | null = null;

/**
 * Synthesizes a realistic dry acoustic mechanical notch click with bandpass filtering.
 */
export const playHapticTick = () => {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }
    const ctx = sharedAudioCtx;
    const now = ctx.currentTime;

    const bufferSize = Math.floor(ctx.sampleRate * 0.008);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.18));
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(3600, now);
    filter.Q.setValueAtTime(4.0, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start(now);
  } catch {}
};

export function getGlobalAudio(): HTMLAudioElement {
  if (!globalAudioInstance) {
    globalAudioInstance = new Audio();
  }
  return globalAudioInstance;
}

export function playGlobalAudio(): void {
  if (globalAudioInstance && globalAudioInstance.paused) {
    globalAudioInstance.play().catch(() => {});
  }
}

export function destroyGlobalAudio(): void {
  if (globalAudioInstance) {
    globalAudioInstance.pause();
    globalAudioInstance.src = "";
    globalAudioInstance.ontimeupdate = null;
    globalAudioInstance.onended = null;
    globalAudioInstance = null;
  }
}

export function resumeSharedAudioContext(): void {
  if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
}

export function unlockAndPlayAudio(audio: HTMLAudioElement, targetVol: number): void {
  resumeSharedAudioContext();
  if (document.hidden) return;
  if (audio.muted) {
    audio.muted = false;
    gsap.to(audio, {
      volume: targetVol,
      duration: 0.3,
      ease: "power1.out",
    });
  }
  if (audio.paused) {
    audio.play().then(() => {
      audio.muted = false;
      gsap.to(audio, {
        volume: targetVol,
        duration: 0.3,
        ease: "power1.out",
      });
    }).catch(() => {});
  }
}

export function crossFadeTrackAudio(
  audio: HTMLAudioElement,
  track: ExtendedTrackItem,
  targetVol: number,
  isCancelled: () => boolean
): void {
  const currentVol = audio.volume;
  const fadeObj = { vol: currentVol };

  gsap.to(fadeObj, {
    vol: 0,
    duration: 0.3,
    ease: "power1.in",
    onUpdate: () => {
      if (audio) audio.volume = fadeObj.vol;
    },
    onComplete: () => {
      if (isCancelled()) return;
      audio.pause();
      audio.src = track.audioSrc || "";
      audio.currentTime = track.audioStartTime || 0;
      audio.volume = 0;

      setTimeout(() => {
        if (isCancelled()) return;
        if (!document.hidden) {
          audio.play().then(() => {
            if (isCancelled()) return;
            gsap.to(audio, {
              volume: targetVol,
              duration: 0.4,
              ease: "power1.out",
            });
          }).catch(() => {});
        }
      }, 100);
    },
  });
}
