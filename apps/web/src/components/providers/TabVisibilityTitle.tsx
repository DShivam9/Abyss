"use client";

import { useEffect, useRef } from "react";

const AWAY_TITLE = "🫠 Hey, where'd you go?";
const DELAY_MS = 3000;

export function TabVisibilityTitle() {
  const originalTitleRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // ponytail: stash active title and delay swap by 3s to ignore rapid tab switches
        originalTitleRef.current = document.title;
        timerRef.current = setTimeout(() => {
          document.title = AWAY_TITLE;
        }, DELAY_MS);
      } else {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        if (originalTitleRef.current) {
          document.title = originalTitleRef.current;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
