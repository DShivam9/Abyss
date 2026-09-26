import React, { useMemo, useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { TracklistGalleryProps, ExtendedTrackItem } from "./types";
import { DEFAULT_TRACKS } from "./constants";
import { usePerformance } from "../../engine/PerformanceProvider";
import { useLatestRef } from "../../hooks/use-latest-ref";
import {
  BAKED_VOLUME,
  playHapticTick,
  getGlobalAudio,
  playGlobalAudio,
  destroyGlobalAudio,
  unlockAndPlayAudio,
  crossFadeTrackAudio,
} from "./audio";
import styles from "./styles.module.css";

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

  const perf = usePerformance();
  const perfRef = useLatestRef(perf);
  const titleSizeRef = useLatestRef(titleSize);
  const onLifecycleChangeRef = useLatestRef(onLifecycleChange);

  const baseTracks = useMemo(() => {
    return tracks.length > 0 ? (tracks as ExtendedTrackItem[]) : DEFAULT_TRACKS;
  }, [tracks]);

  // 5x set buffer guarantees zero empty gaps on any screen size while minimizing DOM overhead
  const activeTracks = useMemo(() => {
    return [
      ...baseTracks,
      ...baseTracks,
      ...baseTracks,
      ...baseTracks,
      ...baseTracks,
    ];
  }, [baseTracks]);

  const initialCenterIndex = baseTracks.length * 2;
  const [activeCenterIndex, setActiveCenterIndex] = useState<number>(initialCenterIndex);
  const [settledCenterIndex, setSettledCenterIndex] = useState<number>(initialCenterIndex);
  const [audioProgress, setAudioProgress] = useState<number>(0);

  const targetYRef = useRef<number | null>(null);

  // Debounce active track selection during continuous scroll
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
      duration: perfRef.current.reducedMotion ? 0 : 0.8,
      ease: "power2.out",
    });
  }, [activeTrackRealIndex, currentTrack, perfRef]);

  // Audio Lifecycle, Tab Visibility, and Smooth Cross-fade Engine
  useEffect(() => {
    const track = baseTracks[activeTrackRealIndex];
    if (!track?.audioSrc) return;

    const audio = getGlobalAudio();
    const targetVol = BAKED_VOLUME;
    const isSameTrack = audio.src && (audio.src.endsWith(track.audioSrc) || audio.src.includes(encodeURIComponent(track.audioSrc)));
    let isCancelled = false;

    if (!audio.src) {
      audio.src = track.audioSrc || "";
      audio.currentTime = track.audioStartTime || 0;
      audio.volume = targetVol;
      if (!document.hidden) {
        audio.play().catch(() => {});
      }
    } else if (!isSameTrack) {
      crossFadeTrackAudio(audio, track, targetVol, () => isCancelled);
    } else {
      audio.volume = targetVol;
    }

    audio.ontimeupdate = () => {
      if (audio.duration > 0) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      let itemStep = titleSizeRef.current + 40;
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

    const handleUnlock = () => unlockAndPlayAudio(audio, targetVol);

    audio.play().then(() => {
      audio.muted = false;
      audio.volume = targetVol;
    }).catch(() => {
      audio.muted = true;
      audio.play().catch(() => {});
    });

    const handleVisibilityChange = () => {
      const activeAudio = getGlobalAudio();
      if (document.hidden) {
        gsap.to(activeAudio, {
          volume: 0,
          duration: 0.2,
          ease: "power1.in",
          onComplete: () => {
            if (document.hidden) activeAudio.pause();
          },
        });
      } else {
        activeAudio.play().then(() => {
          activeAudio.muted = false;
          gsap.to(activeAudio, {
            volume: targetVol,
            duration: 0.3,
            ease: "power1.out",
          });
        }).catch(() => {});
      }
    };

    const unlockEvents = [
      "pointerdown", "mousedown", "pointermove", "mousemove",
      "wheel", "keydown", "touchstart", "scroll", "click",
    ];

    document.addEventListener("visibilitychange", handleVisibilityChange);
    unlockEvents.forEach((evt) => {
      window.addEventListener(evt, handleUnlock, { passive: true, capture: true });
    });

    return () => {
      isCancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unlockEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUnlock, { capture: true } as unknown as EventListenerOptions);
      });
    };
  }, [activeTrackRealIndex, baseTracks, titleSizeRef]);

  // Component Unmount Cleanup
  useEffect(() => {
    return () => {
      destroyGlobalAudio();
    };
  }, []);

  // Direct Click-to-Jump Handler (Smoothly glides scroll queue to target track)
  const jumpToTrack = (index: number) => {
    playHapticTick();
    playGlobalAudio();
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
    if (onLifecycleChangeRef.current) onLifecycleChangeRef.current("peak");
  };

  // Smooth Snap-to-Track Scroll Loop
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
      playGlobalAudio();
      const normalizedDelta = Math.sign(e.deltaY) * Math.min(80, Math.abs(e.deltaY));
      if (targetYRef.current !== null) {
        targetYRef.current -= normalizedDelta * 0.7;
        scheduleSnap();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      hasInteractedRef.current = true;
      playGlobalAudio();
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

    let lastLoopTime = performance.now();
    const updateLoop = () => {
      const now = performance.now();
      const dt = Math.min((now - lastLoopTime) / 1000, 0.1);
      lastLoopTime = now;

      if (targetYRef.current !== null && singleSetHeight > 0) {
        const damp = 1 - Math.pow(1 - (perfRef.current.reducedMotion ? 0.35 : 0.08), dt * 60);
        yPos += (targetYRef.current - yPos) * damp;

        if (yPos > centerLineY - 2 * singleSetHeight) {
          yPos -= singleSetHeight;
          targetYRef.current -= singleSetHeight;
        } else if (yPos < centerLineY - 4 * singleSetHeight) {
          yPos += singleSetHeight;
          targetYRef.current += singleSetHeight;
        }

        gsap.set(tracklist, { y: Math.round(yPos), force3D: false });

        const centerIdx = Math.round((centerLineY - yPos) / itemStep);
        if (centerIdx !== lastCenterIdx) {
          lastCenterIdx = centerIdx;
          setActiveCenterIndex(centerIdx);
          playHapticTick();
          if (onLifecycleChangeRef.current) onLifecycleChangeRef.current("peak");
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
    const audio = getGlobalAudio();
    if (!audio || !audio.duration) return;
    playGlobalAudio();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    audio.currentTime = newProgress * audio.duration;
    setAudioProgress(newProgress * 100);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={() => {
        playGlobalAudio();
      }}
      className={`${styles.container} ${className}`}
      style={style}
    >
      {/* Left Column: Rounded Artwork + Audio Progress Line */}
      <div className={styles.artworkColumn}>
        <div className={styles.artworkCover}>
          <img
            key={currentTrack.imageSrc}
            src={currentTrack.imageSrc}
            alt={currentTrack.title}
            className={styles.artworkImage}
          />
        </div>

        <div
          onClick={handleScrub}
          className={styles.progressTrack}
          title="Click to seek audio"
        >
          <div
            className={styles.progressBar}
            style={{ width: `${audioProgress}%` }}
          />
        </div>
      </div>

      {/* Right Column: Track Titles Queue */}
      <div
        ref={tracklistRef}
        className={`${styles.tracklist} ${styles.razorText}`}
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
              className={`${styles.trackRow} ${isActive ? styles.trackRowActive : ""}`}
            >
              <h2
                className={styles.trackTitle}
                style={{
                  fontSize: `${titleSize}px`,
                  fontWeight: isActive ? 500 : 400,
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

export default TracklistGallery;
