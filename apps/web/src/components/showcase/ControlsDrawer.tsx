"use client";

import React, { useRef, useState } from "react";
import { ControlConfig } from "@/lib/registry";
import { useSmoothScroll } from "@/lib/useSmoothScroll";

interface ControlsDrawerProps {
  controls?: ControlConfig[];
  values: Record<string, number | boolean | string>;
  onChange: (key: string, value: number | boolean | string) => void;
  onReset?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ControlsDrawer({
  controls = [],
  values,
  onChange,
  onReset,
  isOpen,
  onClose,
}: ControlsDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useSmoothScroll<HTMLDivElement>();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  if (!controls || controls.length === 0) return null;

  // Header dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".controls-body") || (e.target as HTMLElement).closest(".drawer-close-btn")) {
      return;
    }

    const drawer = drawerRef.current;
    if (!drawer) return;

    const rect = drawer.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialLeft = rect.left;
    const initialTop = rect.top;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newLeft = Math.max(12, Math.min(window.innerWidth - drawer.offsetWidth - 12, initialLeft + deltaX));
      const newTop = Math.max(12, Math.min(window.innerHeight - drawer.offsetHeight - 12, initialTop + deltaY));

      setPosition({ x: newLeft, y: newTop });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const dynamicStyle: React.CSSProperties = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        bottom: "auto",
        right: "auto",
        transform: "none",
      }
    : {};

  return (
    <div
      ref={drawerRef}
      className={`controls-drawer ${isOpen ? "open" : ""}`}
      style={dynamicStyle}
      aria-label="Component Parameters"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Draggable Header */}
      <div className="controls-drawer-header" onMouseDown={handleMouseDown}>
        <span>Parameters</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close Controls"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Scrubber and Switch Controls Body */}
      <div ref={bodyRef} className="controls-body">
        {controls.map((ctrl, idx) => {
          const val = values[ctrl.key] ?? ctrl.default;
          const uniqueKey = `${ctrl.key}-${ctrl.label}-${idx}`;

          // Slider / Number controls rendered as Inset Scrubber Rows
          if (ctrl.type === "slider") {
            const min = ctrl.min ?? 0;
            const max = ctrl.max ?? 100;
            const step = ctrl.step ?? (max <= 2 ? 0.01 : 1);
            const numVal = Number(val);
            const pct = Math.max(0, Math.min(100, ((numVal - min) / (max - min)) * 100));

            return (
              <div key={uniqueKey} className="scrubber-row">
                <div className="scrubber-fill" style={{ width: `${pct}%` }} />
                <span className="scrubber-label">{ctrl.label}</span>
                <span className="scrubber-val">
                  {step < 1 ? numVal.toFixed(2) : numVal}
                  {ctrl.unit || ""}
                </span>
                <input
                  type="range"
                  className="scrubber-input"
                  min={min}
                  max={max}
                  step={step}
                  value={numVal}
                  onChange={(e) => onChange(ctrl.key, parseFloat(e.target.value))}
                />
              </div>
            );
          }

          // Select / Segmented switch controls
          if (ctrl.type === "select" && ctrl.options) {
            return (
              <div key={uniqueKey} className="segmented-switch">
                {ctrl.options.map((opt) => {
                  const optVal = typeof opt === "string" ? opt : opt.value;
                  const optLabel = typeof opt === "string" ? opt : opt.label;
                  const isActive = String(val) === String(optVal);

                  return (
                    <button
                      key={optVal}
                      type="button"
                      className={`segment-btn ${isActive ? "active" : ""}`}
                      onClick={() => onChange(ctrl.key, optVal)}
                    >
                      {optLabel}
                    </button>
                  );
                })}
              </div>
            );
          }

          // Toggle switch controls
          if (ctrl.type === "toggle") {
            const isChecked = Boolean(val);
            return (
              <div key={uniqueKey} className="segmented-switch">
                <button
                  type="button"
                  className={`segment-btn ${!isChecked ? "active" : ""}`}
                  onClick={() => onChange(ctrl.key, false)}
                >
                  Off
                </button>
                <button
                  type="button"
                  className={`segment-btn ${isChecked ? "active" : ""}`}
                  onClick={() => onChange(ctrl.key, true)}
                >
                  {ctrl.label}: On
                </button>
              </div>
            );
          }

          return null;
        })}

        {/* Reset Defaults Button */}
        {onReset && (
          <button
            type="button"
            className="controls-action-btn"
            onClick={onReset}
          >
            Reset defaults
          </button>
        )}
      </div>
    </div>
  );
}
