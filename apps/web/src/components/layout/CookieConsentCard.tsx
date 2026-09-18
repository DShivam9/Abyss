"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export function openCookieSettings() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("abyss:open-cookie-settings"));
  }
}

export function CookieConsentCard() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Preference switches
  const [perfEnabled, setPerfEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    try {
      const existingConsent = localStorage.getItem("abyss_cookie_consent");
      if (!existingConsent) {
        setIsOpen(true);
      } else {
        const parsed = JSON.parse(existingConsent);
        if (typeof parsed.perf === "boolean") setPerfEnabled(parsed.perf);
        if (typeof parsed.analytics === "boolean") setAnalyticsEnabled(parsed.analytics);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  // Listen for programmatic re-opening (e.g. from footer link)
  useEffect(() => {
    const handleOpen = () => {
      try {
        const raw = localStorage.getItem("abyss_cookie_consent");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.perf === "boolean") setPerfEnabled(parsed.perf);
          if (typeof parsed.analytics === "boolean") setAnalyticsEnabled(parsed.analytics);
        }
      } catch {
        // ignore
      }
      setIsDismissing(false);
      setIsOpen(true);
      setShowPreferences(true);
    };

    window.addEventListener("abyss:open-cookie-settings", handleOpen);
    return () => window.removeEventListener("abyss:open-cookie-settings", handleOpen);
  }, []);

  const handleDismiss = (choice: "all" | "declined" | "custom" | "dismissed") => {
    if (isDismissing) return;
    setIsDismissing(true);

    try {
      localStorage.setItem(
        "abyss_cookie_consent",
        JSON.stringify({
          choice,
          perf: choice === "all" ? true : choice === "custom" ? perfEnabled : false,
          analytics: choice === "all" ? true : choice === "custom" ? analyticsEnabled : false,
          timestamp: new Date().toISOString(),
        })
      );
    } catch {
      // Ignore in restricted environments
    }

    setTimeout(() => {
      setIsOpen(false);
      setIsDismissing(false);
    }, 460);
  };

  if (!hasMounted || !isOpen) {
    return null;
  }

  return (
    <aside
      aria-label="Privacy & Cookie Preferences"
      className="abyss-cookie-card-fixed"
    >
      <div className={`abyss-cookie-card ${isDismissing ? "dismissed" : ""}`}>
        {/* Header */}
        <div className="cookie-card-header">
          <div className="cookie-brand-cluster">
            <div className="cookie-star-logo" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 100 100" fill="currentColor">
                <path
                  d="m50 7.5234 2.2461 29.645 5.9648-15.68-5.2891 24.566 0.089844 1.0898 37.09-22.633-27.855 22.355 20.266-5.3906-24.645 10.09 42.133 11.113-39.566-5.5469 21.109 12.812-25.188-11.445 15.898 34.777-19.363-30.055 3.1523 22.242-7.2656-24.844-21.031 32.656 14.41-31.531-16.945 14.586 17.043-19.578-42.254 5.9141 36.457-9.6016-24.191-3.6328 29.801 0.89844-32.168-25.82 28.945 17.656-11.887-17.145 19.934 22.055 0.097656 0.066406z"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <div className="cookie-brand-title-wrap">
              <span className="cookie-brand-title">Abyss</span>
              <span className="cookie-badge-pill">Privacy & Cookies</span>
            </div>
          </div>

          <button
            type="button"
            className="cookie-btn-close"
            onClick={() => handleDismiss("dismissed")}
            aria-label="Dismiss cookie notice"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <p className="cookie-card-desc">
          We use local storage to remember your preferences and anonymous analytics to improve the site. Read our{" "}
          <Link href="/privacy" className="cookie-desc-link">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="cookie-desc-link">
            Terms
          </Link>
          . No personal data is collected.
        </p>

        {/* Preferences Tray */}
        <div className={`cookie-pref-wrapper ${showPreferences ? "expanded" : ""}`}>
          <div className="cookie-pref-tray">
            <div className="cookie-pref-item">
              <div className="cookie-pref-info">
                <span className="cookie-pref-label">Necessary</span>
                <span className="cookie-pref-sub">Remembers your preferences like theme, consent, and scroll position</span>
              </div>
              <button
                type="button"
                className="cookie-toggle active locked"
                disabled
                aria-label="Essential cookies always active"
              >
                <div className="cookie-toggle-handle" />
              </button>
            </div>

            <div className="cookie-pref-item">
              <div className="cookie-pref-info">
                <span className="cookie-pref-label">Speed Insights</span>
                <span className="cookie-pref-sub">Anonymous page load timing via Vercel Speed Insights</span>
              </div>
              <button
                type="button"
                className={`cookie-toggle ${perfEnabled ? "active" : ""}`}
                onClick={() => setPerfEnabled(!perfEnabled)}
                aria-label="Toggle performance metrics"
              >
                <div className="cookie-toggle-handle" />
              </button>
            </div>

            <div className="cookie-pref-item">
              <div className="cookie-pref-info">
                <span className="cookie-pref-label">Analytics</span>
                <span className="cookie-pref-sub">Anonymous page view counts via Vercel Analytics</span>
              </div>
              <button
                type="button"
                className={`cookie-toggle ${analyticsEnabled ? "active" : ""}`}
                onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                aria-label="Toggle telemetry and analytics"
              >
                <div className="cookie-toggle-handle" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="cookie-card-actions">
          <button
            type="button"
            className="cookie-btn-primary"
            onClick={() => handleDismiss(showPreferences ? "custom" : "all")}
          >
            {showPreferences ? "Save Preferences" : "Accept All"}
          </button>
          <button
            type="button"
            className="cookie-btn-secondary"
            onClick={() => handleDismiss("declined")}
          >
            Decline
          </button>
          <button
            type="button"
            className="cookie-btn-pref"
            onClick={() => setShowPreferences(!showPreferences)}
          >
            {showPreferences ? "Hide" : "Manage"}
          </button>
        </div>
      </div>
    </aside>
  );
}
