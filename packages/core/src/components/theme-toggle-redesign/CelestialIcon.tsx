import styles from "./styles.module.css";

interface CelestialIconProps {
  theme: "dark" | "light";
}

export function CelestialIcon({ theme }: CelestialIconProps) {
  const isLight = theme === "light";

  return (
    <div className={styles.celestialIconWrapper}>
      {/* Solar Rays */}
      <svg
        className={`${styles.solarRays} ${isLight ? styles.solarRaysLight : styles.solarRaysDark}`}
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <line x1="12" y1="1" x2="12" y2="3.5" />
        <line x1="12" y1="20.5" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.99" y2="5.99" />
        <line x1="18.01" y1="18.01" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3.5" y2="12" />
        <line x1="20.5" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.99" y2="18.01" />
        <line x1="18.01" y1="5.99" x2="19.78" y2="4.22" />
      </svg>

      {/* Celestial Core + Lunar Shadow */}
      <div
        className={`${styles.celestialCore} ${isLight ? styles.celestialCoreLight : styles.celestialCoreDark}`}
      >
        <div
          className={`${styles.lunarShadow} ${isLight ? styles.lunarShadowLight : styles.lunarShadowDark}`}
        />
      </div>
    </div>
  );
}
