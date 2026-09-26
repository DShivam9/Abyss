import { SOUND_ENGAGE, SOUND_RELEASE } from "./sounds";

let sharedAudioCtx: AudioContext | null = null;
let engageBuffer: AudioBuffer | null = null;
let releaseBuffer: AudioBuffer | null = null;
let isDecoding = false;

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64.replace(/^data:audio\/\w+;base64,/, ""));
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const initAudio = async (): Promise<AudioContext | null> => {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  if (!engageBuffer && !isDecoding) {
    isDecoding = true;
    try {
      const [eBuf, rBuf] = await Promise.all([
        sharedAudioCtx.decodeAudioData(base64ToArrayBuffer(SOUND_ENGAGE)),
        sharedAudioCtx.decodeAudioData(base64ToArrayBuffer(SOUND_RELEASE))
      ]);
      engageBuffer = eBuf;
      releaseBuffer = rBuf;
    } catch {
      // Decode fallback
    } finally {
      isDecoding = false;
    }
  }
  return sharedAudioCtx;
};

export function playToggleSfx(type: "engage" | "release", enableAudio = true): void {
  if (!enableAudio) return;
  try {
    const AudioCtx =
      typeof window !== "undefined"
        ? window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        : null;

    if (AudioCtx) {
      if (!sharedAudioCtx) {
        sharedAudioCtx = new AudioCtx();
      }
      const ctx = sharedAudioCtx;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      const targetBuffer = type === "engage" ? engageBuffer : releaseBuffer;
      if (targetBuffer) {
        const source = ctx.createBufferSource();
        source.buffer = targetBuffer;
        const gain = ctx.createGain();
        gain.gain.value = type === "engage" ? 0.65 : 0.85;
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
        return;
      } else {
        initAudio()
          .then(() => {
            const buf = type === "engage" ? engageBuffer : releaseBuffer;
            if (buf && ctx) {
              const src = ctx.createBufferSource();
              src.buffer = buf;
              const g = ctx.createGain();
              g.gain.value = type === "engage" ? 0.65 : 0.85;
              src.connect(g);
              g.connect(ctx.destination);
              src.start(0);
            }
          })
          .catch(() => {});
      }
    }

    // Fallback: static public route audio element
    const audio = new Audio(
      type === "engage"
        ? "/components/theme-toggle-redesign/lamp_engage.wav"
        : "/components/theme-toggle-redesign/lamp_release.wav"
    );
    audio.volume = type === "engage" ? 0.65 : 0.85;
    audio.play().catch(() => {});
  } catch {
    // Audio autoplay blocked
  }
}
