import React, { useMemo, useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ApparatusTracklistGalleryProps, TrackItem } from "./types";

interface ExtendedTrackItem extends TrackItem {
  accentBg: string;
  titleColor: string;
  audioStartTime?: number;
}

const DEFAULT_TRACKS: ExtendedTrackItem[] = [
  {
    id: "t1",
    title: "SILENT HORIZON",
    artist: "C418",
    album: "MINECRAFT",
    duration: "04:12",
    year: "2025",
    imageSrc: "/images/apparatus-tracklist-gallery/aria-math.webp",
    audioSrc: "/audio/apparatus-tracklist-gallery/aria-math.mp3",
    accentBg: "#1C2B14",
    titleColor: "#D1CBB3",
  },
  {
    id: "t2",
    title: "EPHEMERAL SUN",
    artist: "TITE KUBO",
    album: "BLEACH",
    duration: "03:48",
    year: "2024",
    imageSrc: "/images/apparatus-tracklist-gallery/clavar-la-espada.webp",
    audioSrc: "/audio/apparatus-tracklist-gallery/clavar-la-espada.mp3",
    accentBg: "#4B150F",
    titleColor: "#EFB1AA",
  },
  {
    id: "t3",
    title: "OBSIDIAN ECHO",
    artist: "DORIAN CONCEPT",
    album: "HIDE CS01",
    duration: "05:04",
    year: "2025",
    imageSrc: "/images/apparatus-tracklist-gallery/hide.webp",
    audioSrc: "/audio/apparatus-tracklist-gallery/hide.mp3",
    accentBg: "#0C6BA0",
    titleColor: "#E0F7FF",
  },
  {
    id: "t4",
    title: "SOLITUDE IN WHITE",
    artist: "GIBRAN ALCOCER",
    album: "IDEA 10",
    duration: "04:30",
    year: "2024",
    imageSrc: "/images/apparatus-tracklist-gallery/idea-10.webp",
    audioSrc: "/audio/apparatus-tracklist-gallery/idea-10.mp3",
    accentBg: "#2F343E",
    titleColor: "#CFD5E0",
  },
  {
    id: "t5",
    title: "ENDLESS TIDE",
    artist: "HANS ZIMMER",
    album: "INTERSTELLAR",
    duration: "06:15",
    year: "2025",
    imageSrc: "/images/apparatus-tracklist-gallery/cornfield-chase.webp",
    audioSrc: "/audio/apparatus-tracklist-gallery/cornfield-chase.mp3",
    accentBg: "#211E19",
    titleColor: "#F4EBD9",
  },
  {
    id: "t6",
    title: "VELVET RESONANCE",
    artist: "JAMIE DUFFY",
    album: "SOLAS",
    duration: "03:55",
    year: "2024",
    imageSrc: "/images/apparatus-tracklist-gallery/solas.webp",
    audioSrc: "/audio/apparatus-tracklist-gallery/solas.mp3",
    accentBg: "#1A1612",
    titleColor: "#D8C3AD",
  },
  {
    id: "t7",
    title: "CHRONO EMBOSS",
    artist: "LUDOVICO EINAUDI",
    album: "EXPERIENCE",
    duration: "04:45",
    year: "2025",
    imageSrc: "/images/apparatus-tracklist-gallery/experience.webp",
    audioSrc: "/audio/apparatus-tracklist-gallery/experience.mp3",
    accentBg: "#083B1E",
    titleColor: "#9ECFB3",
    audioStartTime: 3.5,
  },
  {
    id: "t8",
    title: "BASALT VOID",
    artist: "STRUCT",
    album: "SLOWED",
    duration: "05:22",
    year: "2024",
    imageSrc: "/images/apparatus-tracklist-gallery/struct.webp",
    audioSrc: "/audio/apparatus-tracklist-gallery/struct.mp3",
    accentBg: "#040405",
    titleColor: "#E6F8FF",
  },
];

let globalAudioInstance: HTMLAudioElement | null = null;

export const ApparatusTracklistGallery: React.FC<ApparatusTracklistGalleryProps> = ({
  tracks = [],
  titleSize = 48,
  className = "",
  style,
  onLifecycleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tracklistRef = useRef<HTMLDivElement>(null);

  const baseTracks = useMemo(() => {
    return tracks.length > 0 ? (tracks as ExtendedTrackItem[]) : DEFAULT_TRACKS;
  }, [tracks]);

  // 3x set buffer is mathematically optimal for 100% gapless infinite modulo wrap
  const activeTracks = useMemo(() => {
    return [...baseTracks, ...baseTracks, ...baseTracks];
  }, [baseTracks]);

  const initialCenterIndex = baseTracks.length;
  const [activeCenterIndex, setActiveCenterIndex] = useState<number>(initialCenterIndex);
  const [volume, setVolume] = useState<number>(0.2);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);

  const targetYRef = useRef<number | null>(null);

  const activeTrackRealIndex = ((activeCenterIndex % baseTracks.length) + baseTracks.length) % baseTracks.length;
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

  // Indicator Line Driven Track Audio Trigger
  useEffect(() => {
    const track = baseTracks[activeTrackRealIndex];
    if (!track?.audioSrc) return;

    if (!globalAudioInstance) {
      globalAudioInstance = new Audio();
    }

    const audio = globalAudioInstance;

    // Check if the target track audio is ALREADY active (Prevents audio restart!)
    const isSameTrack = audio.src && (audio.src.endsWith(track.audioSrc) || audio.src.includes(encodeURIComponent(track.audioSrc)));

    if (!isSameTrack) {
      audio.pause();
      audio.src = track.audioSrc;
      audio.currentTime = track.audioStartTime || 0;
    }

    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;

    audio.ontimeupdate = () => {
      if (audio.duration > 0) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      const itemStep = titleSize + 40;
      if (targetYRef.current !== null) {
        targetYRef.current -= itemStep;
      }
    };

    const attemptPlay = () => {
      if (audio.paused) {
        audio.play().catch(() => {});
      }
    };

    attemptPlay();

    // Attach Chrome-valid activation gesture listeners (wheel, mousedown, pointerdown, touchstart, keydown)
    window.addEventListener("wheel", attemptPlay, { passive: true });
    window.addEventListener("mousedown", attemptPlay, { passive: true });
    window.addEventListener("pointerdown", attemptPlay, { passive: true });
    window.addEventListener("touchstart", attemptPlay, { passive: true });
    window.addEventListener("keydown", attemptPlay, { passive: true });

    return () => {
      window.removeEventListener("wheel", attemptPlay);
      window.removeEventListener("mousedown", attemptPlay);
      window.removeEventListener("pointerdown", attemptPlay);
      window.removeEventListener("touchstart", attemptPlay);
      window.removeEventListener("keydown", attemptPlay);
    };
  }, [activeTrackRealIndex, baseTracks, titleSize, volume, isMuted]);

  // Dedicated Volume & Mute Controller (Does NOT restart song)
  useEffect(() => {
    if (globalAudioInstance) {
      globalAudioInstance.volume = isMuted ? 0 : volume;
      globalAudioInstance.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Smooth Lenis Scroll & Exact Focal Indicator Line Alignment Loop
  useEffect(() => {
    const container = containerRef.current;
    const tracklist = tracklistRef.current;
    if (!container || !tracklist) return;

    const itemStep = titleSize + 40;
    const singleSetHeight = baseTracks.length * itemStep;
    const containerHeight = container.clientHeight || window.innerHeight;
    const centerLineY = containerHeight / 2;

    if (targetYRef.current === null) {
      targetYRef.current = centerLineY - activeCenterIndex * itemStep - titleSize / 2;
    }

    let yPos = targetYRef.current;
    let animId: number;
    let lastCenterIdx = activeCenterIndex;

    gsap.set(tracklist, { y: Math.round(yPos), force3D: false });

    const handleWheel = (e: WheelEvent) => {
      const normalizedDelta = Math.sign(e.deltaY) * Math.min(60, Math.abs(e.deltaY));
      if (targetYRef.current !== null) {
        targetYRef.current -= normalizedDelta * 0.45;
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      if (targetYRef.current !== null) {
        targetYRef.current -= deltaY * 1.1;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });

    const updateLoop = () => {
      if (targetYRef.current !== null) {
        yPos += (targetYRef.current - yPos) * 0.08;
      }

      if (singleSetHeight > 0) {
        const baseSetOffset = centerLineY - titleSize / 2;
        const offsetFromBase = yPos - baseSetOffset;

        let modOffset = offsetFromBase % singleSetHeight;
        if (modOffset > 0) modOffset -= singleSetHeight;

        const wrappedY = baseSetOffset + modOffset - singleSetHeight;
        gsap.set(tracklist, { y: Math.round(wrappedY), force3D: false });

        // Calculate exact title index intersecting screen center focal indicator line
        const centerIdx = Math.round((centerLineY - wrappedY - titleSize / 2) / itemStep);

        if (centerIdx !== lastCenterIdx) {
          lastCenterIdx = centerIdx;
          setActiveCenterIndex(centerIdx);
          if (onLifecycleChange) onLifecycleChange("peak");
        }
      }

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(animId);
    };
  }, [baseTracks, titleSize]);

  // Audio Progress Line Scrubbing
  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!globalAudioInstance || !globalAudioInstance.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    globalAudioInstance.currentTime = newProgress * globalAudioInstance.duration;
    setAudioProgress(newProgress * 100);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen bg-[#1E3810] text-white overflow-hidden px-8 md:px-14 lg:px-16 flex items-center justify-start transition-colors duration-700 ${className}`}
      style={style}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500&family=Outfit:wght@300;400;500&display=swap');
        
        .razor-text-render {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: geometricPrecision;
          isolation: isolate;
          contain: layout style paint;
        }
      `}</style>

      {/* Single Fixed Focal Indicator Line at Screen Center Left */}
      <div className="fixed left-8 md:left-14 lg:left-16 top-1/2 -translate-y-1/2 w-6 md:w-8 h-0.5 bg-white z-30 pointer-events-none" />

      {/* Left Column: Track Titles Queue */}
      <div
        ref={tracklistRef}
        className="w-full max-w-3xl flex flex-col gap-10 select-none cursor-grab active:cursor-grabbing razor-text-render pl-10 md:pl-14 relative z-10"
      >
        {activeTracks.map((track, idx) => {
          const isActive = idx === activeCenterIndex;
          const realIdx = ((idx % baseTracks.length) + baseTracks.length) % baseTracks.length;
          const itemTrack = baseTracks[realIdx] || DEFAULT_TRACKS[0];

          return (
            <div
              key={`${track.id}-${idx}`}
              className={`w-full razor-text-render transition-all duration-300 flex items-center ${
                isActive ? "opacity-100 translate-x-2" : "opacity-35 hover:opacity-60 translate-x-0"
              }`}
            >
              <h2
                className={`uppercase tracking-tight leading-none razor-text-render transition-all duration-500 ${
                  isActive ? "font-medium scale-100" : "font-normal"
                }`}
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
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

      {/* Right Column: Thumbnail Box + Integrated Audio Progress Line & Controls */}
      <div className="hidden lg:flex flex-col fixed right-24 md:right-32 lg:right-40 top-1/2 -translate-y-1/2 items-start pointer-events-auto z-30">
        {/* Cover Image Box */}
        <div className="w-[320px] h-[320px] xl:w-[350px] xl:h-[350px] rounded-none border border-white/10 shadow-2xl bg-neutral-900 relative group overflow-hidden transition-all duration-300">
          <img
            src={currentTrack.imageSrc}
            alt={currentTrack.title}
            className="w-full h-full object-cover rounded-none transition-all duration-500 group-hover:scale-105"
          />
        </div>

        {/* Audio Progress Line (Start to End) */}
        <div
          onClick={handleScrub}
          className="w-full h-[2px] bg-white/20 cursor-pointer mt-3 relative overflow-hidden group"
          title="Click to seek audio"
        >
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${audioProgress}%` }}
          />
        </div>

        {/* Minimal Volume Control Bar under progress line */}
        <div className="w-full mt-2 flex items-center justify-end text-neutral-400 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-neutral-400 hover:text-white transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 accent-white bg-neutral-800 h-0.5 rounded-none cursor-pointer"
              title="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApparatusTracklistGallery;
