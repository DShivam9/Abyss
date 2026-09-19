import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from "react";
import { getGPUTier } from "detect-gpu";
import { GpuTier, QualityTier, PerformanceProfile } from "./types";

const STORAGE_KEY = "abyss-gpu-tier";

export const DEFAULT_PERFORMANCE_PROFILE: PerformanceProfile = {
  gpuTier: 3,
  tier: "high",
  dpr: typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1,
  reducedMotion: false,
  shaderComplexity: "full",
  maxParticleCount: 1000,
  enablePostProcessing: true,
  enableShadows: true,
  enableReflections: true,
  currentFps: 60,
  isUnderPerforming: false,
};

const PerformanceContext = createContext<PerformanceProfile>(DEFAULT_PERFORMANCE_PROFILE);

export const usePerformance = (): PerformanceProfile => useContext(PerformanceContext);

function mapTierToQuality(gpuTier: GpuTier): QualityTier {
  if (gpuTier >= 3) return "high";
  if (gpuTier === 2) return "medium";
  return "low";
}

function computeProfile(
  gpuTier: GpuTier,
  qualityTier: QualityTier,
  reducedMotion: boolean,
  currentFps: number,
  isUnderPerforming: boolean
): PerformanceProfile {
  const isHigh = qualityTier === "high";
  const isMed = qualityTier === "medium";

  const nativeDpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const dpr = isHigh ? nativeDpr : isMed ? Math.min(1.5, nativeDpr) : 1.0;

  return {
    gpuTier,
    tier: qualityTier,
    dpr,
    reducedMotion,
    shaderComplexity: isHigh ? "full" : "simplified",
    maxParticleCount: isHigh ? 1000 : isMed ? 500 : 200,
    enablePostProcessing: isHigh,
    enableShadows: isHigh || isMed,
    enableReflections: isHigh,
    currentFps,
    isUnderPerforming,
  };
}

interface PerformanceProviderProps {
  children: React.ReactNode;
  initialTier?: GpuTier;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
  initialTier,
}) => {
  const [gpuTier, setGpuTier] = useState<GpuTier>(() => {
    if (initialTier !== undefined) return initialTier;
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(STORAGE_KEY);
        if (cached !== null) {
          const parsed = parseInt(cached, 10);
          if (parsed >= 0 && parsed <= 3) return parsed as GpuTier;
        }
      } catch {
        // Ignore sessionStorage restrictions
      }
    }
    return 3;
  });

  const [qualityTier, setQualityTier] = useState<QualityTier>(() => mapTierToQuality(gpuTier));
  const [currentFps, setCurrentFps] = useState<number>(60);
  const [isUnderPerforming, setIsUnderPerforming] = useState<boolean>(false);

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  // Watch prefers-reduced-motion OS changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Run GPU detection once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;

    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached !== null) {
        const parsed = parseInt(cached, 10);
        if (parsed >= 0 && parsed <= 3) {
          const cachedTier = parsed as GpuTier;
          setGpuTier(cachedTier);
          setQualityTier(mapTierToQuality(cachedTier));
          return;
        }
      }
    } catch {
      // Storage access failed, proceed to detect
    }

    getGPUTier()
      .then((report) => {
        if (!mounted) return;
        const tier = (Math.max(0, Math.min(3, report.tier)) as GpuTier) ?? 2;
        setGpuTier(tier);
        setQualityTier(mapTierToQuality(tier));
        try {
          sessionStorage.setItem(STORAGE_KEY, String(tier));
        } catch {
          // Ignore storage write failure
        }
      })
      .catch(() => {
        if (mounted) {
          setGpuTier(2);
          setQualityTier("medium");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Phase 2: Frame Rate Monitor (continuous rolling FPS + adaptive downgrade/recovery)
  const frameTimestampsRef = useRef<number[]>([]);
  const lastCheckTimeRef = useRef<number>(0);
  const consecutiveLowRef = useRef<number>(0);
  const consecutiveHighRef = useRef<number>(0);
  const targetHzRef = useRef<number>(60);
  const hasEstimatedHzRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number;
    let lastTimestamp = performance.now();
    lastCheckTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = now - lastTimestamp;
      lastTimestamp = now;

      // Discard anomalies from background tab throttle or thread locks
      if (!document.hidden && delta < 500) {
        const timestamps = frameTimestampsRef.current;
        timestamps.push(now);
        if (timestamps.length > 120) {
          timestamps.shift();
        }

        // Evaluate every 2 seconds
        if (now - lastCheckTimeRef.current >= 2000 && timestamps.length >= 30) {
          lastCheckTimeRef.current = now;
          const duration = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000;
          const measuredFps = duration > 0 ? Math.round((timestamps.length - 1) / duration) : 60;

          // Estimate display refresh rate in first sample cycle
          if (!hasEstimatedHzRef.current && duration >= 1.5) {
            if (measuredFps > 130) targetHzRef.current = 144;
            else if (measuredFps > 105) targetHzRef.current = 120;
            else if (measuredFps > 80) targetHzRef.current = 90;
            else if (measuredFps > 68) targetHzRef.current = 75;
            else targetHzRef.current = 60;
            hasEstimatedHzRef.current = true;
          }

          const targetHz = targetHzRef.current;
          const downgradeThreshold = targetHz * 0.8;
          const upgradeThreshold = targetHz * 0.9;

          setCurrentFps(measuredFps);

          const maxQuality = mapTierToQuality(gpuTier);

          // Downgrade check: < 80% refresh rate for 3+ consecutive checks
          if (measuredFps < downgradeThreshold) {
            consecutiveLowRef.current += 1;
            consecutiveHighRef.current = 0;

            if (consecutiveLowRef.current >= 3) {
              consecutiveLowRef.current = 0;
              setIsUnderPerforming(true);
              setQualityTier((prev) => {
                if (prev === "high") return "medium";
                if (prev === "medium") return "low";
                return "low";
              });
            }
          }
          // Upgrade check: >= 90% refresh rate for 5+ consecutive checks
          else if (measuredFps >= upgradeThreshold) {
            consecutiveHighRef.current += 1;
            consecutiveLowRef.current = 0;

            if (consecutiveHighRef.current >= 5) {
              consecutiveHighRef.current = 0;
              setQualityTier((prev) => {
                if (prev === "low" && (maxQuality === "medium" || maxQuality === "high")) {
                  if (maxQuality === "medium") setIsUnderPerforming(false);
                  return "medium";
                }
                if (prev === "medium" && maxQuality === "high") {
                  setIsUnderPerforming(false);
                  return "high";
                }
                setIsUnderPerforming(false);
                return prev;
              });
            }
          } else {
            consecutiveLowRef.current = 0;
            consecutiveHighRef.current = 0;
          }
        }
      } else {
        frameTimestampsRef.current = [];
        lastCheckTimeRef.current = now;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [gpuTier]);

  const profile = useMemo(() => {
    return computeProfile(gpuTier, qualityTier, reducedMotion, currentFps, isUnderPerforming);
  }, [gpuTier, qualityTier, reducedMotion, currentFps, isUnderPerforming]);

  return (
    <PerformanceContext.Provider value={profile}>
      {children}
    </PerformanceContext.Provider>
  );
};
