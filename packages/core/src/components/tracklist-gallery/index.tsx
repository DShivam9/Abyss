import React, { useMemo, useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { TracklistGalleryProps, TrackItem } from "./types";

interface ExtendedTrackItem extends TrackItem {
  accentBg: string;
  titleColor: string;
  audioStartTime?: number;
}

const DEFAULT_TRACKS: ExtendedTrackItem[] = [
  {
    id: "t1",
    title: "Horizon",
    artist: "C418",
    album: "MINECRAFT",
    duration: "04:12",
    year: "2025",
    imageSrc: "/images/components/tracklist-gallery/aria-math.webp",
    audioSrc: "/audio/components/tracklist-gallery/aria-math.mp3",
    accentBg: "#172314",
    titleColor: "#DCE8CD",
    audioStartTime: 13.5,
  },
  {
    id: "t2",
    title: "Sunken Echo",
    artist: "TITE KUBO",
    album: "BLEACH",
    duration: "03:48",
    year: "2024",
    imageSrc: "/images/components/tracklist-gallery/clavar-la-espada.webp",
    audioSrc: "/audio/components/tracklist-gallery/clavar-la-espada.mp3",
    accentBg: "#2C1411",
    titleColor: "#F4C9BE",
  },
  {
    id: "t3",
    title: "Afterglow",
    artist: "DORIAN CONCEPT",
    album: "HIDE CS01",
    duration: "05:04",
    year: "2025",
    imageSrc: "/images/components/tracklist-gallery/hide.webp",
    audioSrc: "/audio/components/tracklist-gallery/hide.mp3",
    accentBg: "#0E1E28",
    titleColor: "#BFE6FA",
  },
  {
    id: "t4",
    title: "Paper Cranes",
    artist: "GIBRAN ALCOCER",
    album: "IDEA 10",
    duration: "04:30",
    year: "2024",
    imageSrc: "/images/components/tracklist-gallery/idea-10.webp",
    audioSrc: "/audio/components/tracklist-gallery/idea-10.mp3",
    accentBg: "#1C1E24",
    titleColor: "#E5E7EB",
  },
  {
    id: "t5",
    title: "Dust & Gold",
    artist: "HANS ZIMMER",
    album: "INTERSTELLAR",
    duration: "06:15",
    year: "2025",
    imageSrc: "/images/components/tracklist-gallery/cornfield-chase.webp",
    audioSrc: "/audio/components/tracklist-gallery/cornfield-chase.mp3",
    accentBg: "#251B12",
    titleColor: "#FCE8C9",
    audioStartTime: 4.0,
  },
  {
    id: "t6",
    title: "Solitude",
    artist: "JAMIE DUFFY",
    album: "SOLAS",
    duration: "03:55",
    year: "2024",
    imageSrc: "/images/components/tracklist-gallery/solas.webp",
    audioSrc: "/audio/components/tracklist-gallery/solas.mp3",
    accentBg: "#1F1713",
    titleColor: "#EBD3BF",
  },
  {
    id: "t7",
    title: "Before The Rain",
    artist: "LUDOVICO EINAUDI",
    album: "EXPERIENCE",
    duration: "04:45",
    year: "2025",
    imageSrc: "/images/components/tracklist-gallery/experience.webp",
    audioSrc: "/audio/components/tracklist-gallery/experience.mp3",
    accentBg: "#0F2218",
    titleColor: "#C3E8D2",
    audioStartTime: 3.5,
  },
  {
    id: "t8",
    title: "Nocturne",
    artist: "STRUCT",
    album: "SLOWED",
    duration: "05:22",
    year: "2024",
    imageSrc: "/images/components/tracklist-gallery/struct.webp",
    audioSrc: "/audio/components/tracklist-gallery/struct.mp3",
    accentBg: "#111217",
    titleColor: "#DCE4F5",
  },
];

let globalAudioInstance: HTMLAudioElement | null = null;
let sharedAudioCtx: AudioContext | null = null;

const playHapticTick = () => {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }
    const ctx = sharedAudioCtx;
    const now = ctx.currentTime;

    // Realistic dry acoustic mechanical notch click (noise transient + bandpass)
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

export const TracklistGallery: React.FC<TracklistGalleryProps> = ({
  tracks = [],
  titleSize = 72,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tracklistRef = useRef<HTMLDivElement>(null);
  const hasInteractedRef = useRef(false);

  const baseTracks = useMemo(() => {
    return tracks.length > 0 ? (tracks as ExtendedTrackItem[]) : DEFAULT_TRACKS;
  }, [tracks]);

  // 7x set buffer guarantees zero empty gaps on any screen size / resolution
  const activeTracks = useMemo(() => {
    return [
      ...baseTracks,
      ...baseTracks,
      ...baseTracks,
      ...baseTracks,
      ...baseTracks,
      ...baseTracks,
      ...baseTracks,
    ];
  }, [baseTracks]);

  const initialCenterIndex = baseTracks.length * 3;
  const [activeCenterIndex, setActiveCenterIndex] = useState<number>(initialCenterIndex);
  const [settledCenterIndex, setSettledCenterIndex] = useState<number>(initialCenterIndex);
  const [audioProgress, setAudioProgress] = useState<number>(0);

  const BAKED_VOLUME = 0.15;
  const targetYRef = useRef<number | null>(null);

  // Debounce active track selection during continuous scroll (avoids rapid image flashing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSettledCenterIndex(activeCenterIndex);
    }, 220);
    return () => clearTimeout(timer);
  }, [activeCenterIndex]);

  const activeTrackRealIndex = ((settledCenterIndex % baseTracks.length) + baseTracks.length) % baseTracks.length;
  const currentTrack = baseTracks[activeTrackRealIndex] || baseTracks[0];

  // Full-Screen Background Color Transition
  useEffect(() => {
    if (!containerRef.current) return;
    gsap.to(containerRef.current, {
      backgroundColor: currentTrack.accentBg || "#1E3810",
      duration: 0.8,
      ease: "power2.out",
    });
  }, [activeTrackRealIndex, currentTrack]);

  // Audio Lifecycle, Tab Visibility, and Smooth Cross-fade Engine
  useEffect(() => {
    const track = baseTracks[activeTrackRealIndex];
    if (!track?.audioSrc) return;

    if (!globalAudioInstance) {
      globalAudioInstance = new Audio();
    }

    const audio = globalAudioInstance;
    const targetVol = BAKED_VOLUME;

    // Check if the target track audio is ALREADY active (Prevents audio restart!)
    const isSameTrack = audio.src && (audio.src.endsWith(track.audioSrc) || audio.src.includes(encodeURIComponent(track.audioSrc)));

    let isCancelled = false;

    if (!audio.src) {
      // Synchronous immediate assignment on first mount (enables instant autoplay on user gesture)
      audio.src = track.audioSrc || "";
      audio.currentTime = track.audioStartTime || 0;
      audio.volume = targetVol;
      if (!document.hidden) {
        audio.play().catch(() => {});
      }
    } else if (!isSameTrack) {
      // Fade out old track (300ms)
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
          if (isCancelled || !audio) return;
          audio.pause();
          audio.src = track.audioSrc || "";
          audio.currentTime = track.audioStartTime || 0;
          audio.volume = 0;

          // 100ms silence gap before fade-in
          setTimeout(() => {
            if (isCancelled || !audio) return;
            if (!document.hidden) {
              audio.play().then(() => {
                if (isCancelled || !audio) return;
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
    } else {
      audio.volume = targetVol;
    }

    audio.ontimeupdate = () => {
      if (audio.duration > 0) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      let itemStep = titleSize + 40;
      const tracklist = tracklistRef.current;
      if (tracklist && tracklist.children.length >= 2) {
        const first = tracklist.children[0] as HTMLElement;
        const second = tracklist.children[1] as HTMLElement;
        const measured = second.offsetTop - first.offsetTop;
        if (measured > 0) itemStep = measured;
      }
      if (targetYRef.current !== null) {
        targetYRef.current -= itemStep;
      }
    };

    const unlockAndPlay = () => {
      if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
        sharedAudioCtx.resume().catch(() => {});
      }
      if (!audio || document.hidden) return;
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
    };

    // Direct immediate play attempt with muted fallback for browser autoplay policy
    audio.play().then(() => {
      audio.muted = false;
      audio.volume = targetVol;
    }).catch(() => {
      audio.muted = true;
      audio.play().catch(() => {});
    });

    // Tab visibility handling: smooth fade to 0 before pause, smooth fade in on resume
    const handleVisibilityChange = () => {
      if (!globalAudioInstance) return;
      if (document.hidden) {
        gsap.to(globalAudioInstance, {
          volume: 0,
          duration: 0.2,
          ease: "power1.in",
          onComplete: () => {
            if (document.hidden && globalAudioInstance) {
              globalAudioInstance.pause();
            }
          },
        });
      } else {
        globalAudioInstance.play().then(() => {
          if (!globalAudioInstance) return;
          globalAudioInstance.muted = false;
          gsap.to(globalAudioInstance, {
            volume: targetVol,
            duration: 0.3,
            ease: "power1.out",
          });
        }).catch(() => {});
      }
    };

    const unlockEvents = [
      "pointerdown",
      "mousedown",
      "pointermove",
      "mousemove",
      "wheel",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    document.addEventListener("visibilitychange", handleVisibilityChange);
    unlockEvents.forEach((evt) => {
      window.addEventListener(evt, unlockAndPlay, { passive: true, capture: true });
    });

    return () => {
      isCancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unlockEvents.forEach((evt) => {
        window.removeEventListener(evt, unlockAndPlay, { capture: true } as any);
      });
    };
  }, [activeTrackRealIndex, baseTracks, titleSize]);

  // Component Unmount Cleanup: Stop, purge source, and destroy global audio instance
  useEffect(() => {
    return () => {
      if (globalAudioInstance) {
        globalAudioInstance.pause();
        globalAudioInstance.src = "";
        globalAudioInstance.ontimeupdate = null;
        globalAudioInstance.onended = null;
        globalAudioInstance = null;
      }
    };
  }, []);

  // Direct Click-to-Jump Handler (Immediately settles on target track & unlocks audio)
  const jumpToTrack = (index: number) => {
    playHapticTick();
    if (globalAudioInstance && globalAudioInstance.paused) {
      globalAudioInstance.play().catch(() => {});
    }
    const tracklist = tracklistRef.current;
    const container = containerRef.current;
    let itemStep = titleSize + 40;
    let itemH = titleSize;
    if (tracklist && tracklist.children.length >= 2) {
      const first = tracklist.children[0] as HTMLElement;
      const second = tracklist.children[1] as HTMLElement;
      const measured = second.offsetTop - first.offsetTop;
      if (measured > 0) itemStep = measured;
      if (first.offsetHeight > 0) itemH = first.offsetHeight;
    }
    const containerHeight = container?.clientHeight || window.innerHeight;
    const centerLineY = containerHeight / 2 - itemH / 2;
    targetYRef.current = centerLineY - index * itemStep;
    setActiveCenterIndex(index);
    setSettledCenterIndex(index);
    if (onLifecycleChange) onLifecycleChange("peak");
  };

  // Smooth Snap-to-Track Scroll & Exact Focal Alignment Loop
  useEffect(() => {
    const container = containerRef.current;
    const tracklist = tracklistRef.current;
    if (!container || !tracklist) return;

    const getItemMetrics = () => {
      let step = titleSize + 40;
      let h = titleSize;
      if (tracklist.children.length >= 2) {
        const first = tracklist.children[0] as HTMLElement;
        const second = tracklist.children[1] as HTMLElement;
        const measured = second.offsetTop - first.offsetTop;
        if (measured > 0) step = measured;
        if (first.offsetHeight > 0) h = first.offsetHeight;
      }
      return { step, h };
    };

    const { step: itemStep, h: itemH } = getItemMetrics();
    const singleSetHeight = baseTracks.length * itemStep;
    const containerHeight = container.clientHeight || window.innerHeight;
    const centerLineY = containerHeight / 2 - itemH / 2;

    if (targetYRef.current === null) {
      targetYRef.current = centerLineY - activeCenterIndex * itemStep;
    }

    let yPos = targetYRef.current;
    let animId: number;
    let lastCenterIdx = activeCenterIndex;
    let snapTimeout: ReturnType<typeof setTimeout> | null = null;

    gsap.set(tracklist, { y: Math.round(yPos), force3D: false });

    const scheduleSnap = () => {
      if (snapTimeout) clearTimeout(snapTimeout);
      snapTimeout = setTimeout(() => {
        if (targetYRef.current === null) return;
        const currentTarget = targetYRef.current;
        const nearestTrackIndex = Math.round((centerLineY - currentTarget) / itemStep);
        targetYRef.current = centerLineY - nearestTrackIndex * itemStep;
      }, 250);
    };

    const handleWheel = (e: WheelEvent) => {
      hasInteractedRef.current = true;
      if (globalAudioInstance && globalAudioInstance.paused) {
        globalAudioInstance.play().catch(() => {});
      }
      const normalizedDelta = Math.sign(e.deltaY) * Math.min(80, Math.abs(e.deltaY));
      if (targetYRef.current !== null) {
        targetYRef.current -= normalizedDelta * 0.7;
        scheduleSnap();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      hasInteractedRef.current = true;
      if (globalAudioInstance && globalAudioInstance.paused) {
        globalAudioInstance.play().catch(() => {});
      }
      touchStartY = e.touches[0].clientY;
      if (snapTimeout) clearTimeout(snapTimeout);
    };
    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      if (targetYRef.current !== null) {
        targetYRef.current -= deltaY * 1.1;
      }
    };
    const handleTouchEnd = () => {
      scheduleSnap();
    };

    container.addEventListener("wheel", handleWheel, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    const updateLoop = () => {
      if (targetYRef.current !== null && singleSetHeight > 0) {
        yPos += (targetYRef.current - yPos) * 0.08;

        // Continuous seamless boundary shift without 1-frame position tears
        if (yPos > centerLineY - 2 * singleSetHeight) {
          yPos -= singleSetHeight;
          targetYRef.current -= singleSetHeight;
        } else if (yPos < centerLineY - 4 * singleSetHeight) {
          yPos += singleSetHeight;
          targetYRef.current += singleSetHeight;
        }

        gsap.set(tracklist, { y: Math.round(yPos), force3D: false });

        // Calculate exact title index intersecting screen center
        const centerIdx = Math.round((centerLineY - yPos) / itemStep);

        if (centerIdx !== lastCenterIdx) {
          lastCenterIdx = centerIdx;
          setActiveCenterIndex(centerIdx);
          playHapticTick();
          if (onLifecycleChange) onLifecycleChange("peak");
        }
      }

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);

    return () => {
      if (snapTimeout) clearTimeout(snapTimeout);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      cancelAnimationFrame(animId);
    };
  }, [baseTracks, titleSize]);

  // Audio Progress Line Scrubbing
  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!globalAudioInstance || !globalAudioInstance.duration) return;
    if (globalAudioInstance.paused) {
      globalAudioInstance.play().catch(() => {});
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    globalAudioInstance.currentTime = newProgress * globalAudioInstance.duration;
    setAudioProgress(newProgress * 100);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={() => {
        if (globalAudioInstance && globalAudioInstance.paused) {
          globalAudioInstance.play().catch(() => {});
        }
      }}
      className={`relative w-full h-screen bg-[#1E3810] text-white overflow-hidden px-8 md:px-14 lg:px-16 transition-colors duration-700 ${className}`}
      style={style}
    >
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=ranade@400,500,600,700,900&display=swap');
        
        .razor-text-render {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: geometricPrecision;
          isolation: isolate;
        }
      `}</style>

      {/* Left Column: Raw Large Rounded Artwork + Audio Progress Line */}
      <div className="hidden lg:flex flex-col fixed left-16 md:left-24 lg:left-32 top-1/2 -translate-y-1/2 items-start pointer-events-auto z-30">
        {/* Cover Image */}
        <div className="w-[380px] h-[380px] xl:w-[440px] xl:h-[440px] 2xl:w-[480px] 2xl:h-[480px] rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-500">
          <img
            key={currentTrack.imageSrc}
            src={currentTrack.imageSrc}
            alt={currentTrack.title}
            className="w-full h-full object-cover rounded-3xl transition-all duration-700 animate-in fade-in"
          />
        </div>

        {/* Audio Progress Line (Start to End) */}
        <div
          onClick={handleScrub}
          className="w-full h-[3px] bg-white/20 rounded-full cursor-pointer mt-4 relative overflow-hidden group"
          title="Click to seek audio"
        >
          <div
            className="h-full bg-white rounded-full transition-all duration-100"
            style={{ width: `${audioProgress}%` }}
          />
        </div>
      </div>

      {/* Right Column: Track Titles Queue */}
      <div
        ref={tracklistRef}
        className="absolute top-0 right-8 md:right-14 lg:right-16 w-full max-w-3xl flex flex-col gap-10 select-none cursor-grab active:cursor-grabbing razor-text-render pr-10 md:pr-14 items-end z-10"
      >
        {activeTracks.map((track, idx) => {
          const isActive = idx === activeCenterIndex;
          const realIdx = ((idx % baseTracks.length) + baseTracks.length) % baseTracks.length;
          const itemTrack = baseTracks[realIdx] || DEFAULT_TRACKS[0];

          return (
            <div
              key={`${track.id}-${idx}`}
              onClick={() => {
                hasInteractedRef.current = true;
                jumpToTrack(idx);
              }}
              className={`w-full razor-text-render transition-opacity duration-300 flex items-center justify-end cursor-pointer ${
                isActive ? "opacity-100" : "opacity-35 hover:opacity-70"
              }`}
            >
              <h2
                className={`tracking-tight leading-[1.15] py-1 text-right razor-text-render transition-colors duration-500 ${
                  isActive ? "font-medium" : "font-normal"
                }`}
                style={{
                  fontFamily: "'Ranade', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: `${titleSize}px`,
                  letterSpacing: "-0.015em",
                  color: isActive ? itemTrack.titleColor : "#FFFFFF",
                }}
              >
                {track.title}
              </h2>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ApparatusTracklistGallery = TracklistGallery;
export default TracklistGallery;
