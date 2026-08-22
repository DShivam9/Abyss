"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { COMPONENT_DETAILS } from "@/lib/registry";
import { useSmoothScroll } from "@/lib/useSmoothScroll";

interface RulerDrawerProps {
  currentSlug: string;
  onClose: () => void;
}

const ALL_COMPONENTS = Object.values(COMPONENT_DETAILS).sort((a, b) =>
  a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" })
);

export function RulerDrawer({ currentSlug, onClose }: RulerDrawerProps) {
  const router = useRouter();
  const listRef = useSmoothScroll<HTMLDivElement>();
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  // Auto-center active specimen row when drawer is opened or slug changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeItemRef.current) {
        activeItemRef.current.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [currentSlug]);

  const handleSelect = (slug: string) => {
    onClose();
    if (slug !== currentSlug) {
      router.push(`/showcase/${slug}`);
    }
  };

  const handleGoCollection = () => {
    onClose();
    router.push("/collection");
  };

  return (
    <aside
      className="ruler-drawer"
      aria-label="Component Navigator"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div ref={listRef} className="ruler-list-wrap">
        {/* Brand Logo with Celestial Refraction (Decorative Ambient) */}
        <div style={{ paddingLeft: "4px", marginBottom: "28px" }}>
          <div
            className="abyss-celestial-logo"
            aria-hidden="true"
            style={{ cursor: "default" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path
                d="m50 7.5234 2.2461 29.645 5.9648-15.68-5.2891 24.566 0.089844 1.0898 37.09-22.633-27.855 22.355 20.266-5.3906-24.645 10.09 42.133 11.113-39.566-5.5469 21.109 12.812-25.188-11.445 15.898 34.777-19.363-30.055 3.1523 22.242-7.2656-24.844-21.031 32.656 14.41-31.531-16.945 14.586 17.043-19.578-42.254 5.9141 36.457-9.6016-24.191-3.6328 29.801 0.89844-32.168-25.82 28.945 17.656-11.887-17.145 19.934 22.055 0.097656 0.066406z"
                fillRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Top Collection Link */}
        <button
          type="button"
          className="ruler-row interactive collection-header"
          onClick={handleGoCollection}
        >
          <div className="line-wrapper">
            <div className="ruler-line" />
          </div>
          <span className="ruler-text">
            Collection
          </span>
        </button>

        {/* Separator placeholder */}
        <div className="ruler-row placeholder">
          <div className="line-wrapper">
            <div className="ruler-line" />
          </div>
        </div>

        {/* Numbered Components List */}
        {ALL_COMPONENTS.map((comp, idx) => {
          const isActive = comp.slug === currentSlug;
          const formattedIdx = String(idx + 1).padStart(2, "0");

          return (
            <React.Fragment key={comp.slug}>
              <button
                ref={isActive ? activeItemRef : null}
                type="button"
                className={`ruler-row interactive ${isActive ? "active" : ""}`}
                onClick={() => handleSelect(comp.slug)}
              >
                <div className="line-wrapper">
                  <div className="ruler-line" />
                </div>
                <span className="ruler-text">
                  {formattedIdx} {comp.label}
                </span>
              </button>

              {/* Placeholder row for spacing rhythm */}
              <div className="ruler-row placeholder">
                <div className="line-wrapper">
                  <div className="ruler-line" />
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </aside>
  );
}
