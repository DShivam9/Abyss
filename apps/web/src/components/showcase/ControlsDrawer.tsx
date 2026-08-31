"use client";

import React, { useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { ControlConfig } from "@/lib/registry";
import { useSmoothScroll } from "@/lib/hooks/useSmoothScroll";

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
  const [isDragging, setIsDragging] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Header dragging logic (Pointer Capture with zero frame drop)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".drawer-close-btn")) {
      return;
    }
    const drawer = drawerRef.current;
    if (!drawer) return;

    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const rect = drawer.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setIsDragging(true);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const newLeft = Math.max(
        12,
        Math.min(window.innerWidth - drawer.offsetWidth - 12, moveEvent.clientX - offsetX)
      );
      const newTop = Math.max(
        12,
        Math.min(window.innerHeight - drawer.offsetHeight - 12, moveEvent.clientY - offsetY)
      );
      setPosition({ x: newLeft, y: newTop });
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(upEvent.pointerId);
      } catch {
        // ignore
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  const dynamicStyle: React.CSSProperties = {
    ...(position
      ? {
          left: `${position.x}px`,
          top: `${position.y}px`,
          bottom: "auto",
          right: "auto",
          transform: isDragging ? "scale(1.015)" : "none",
        }
      : {}),
    ...(isDragging ? { transition: "none", userSelect: "none" } : {}),
  };

  return (
    <div
      ref={drawerRef}
      className={`controls-drawer ${isOpen ? "open" : ""} ${isDragging ? "is-dragging" : ""}`}
      style={dynamicStyle}
      aria-label="Component Parameters"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Draggable Header */}
      <div className="controls-drawer-header" onPointerDown={handlePointerDown}>
        <span>Parameters</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <SlidersHorizontal size={13} strokeWidth={2} color="#71717a" />
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close Controls"
          >
            <X size={13} strokeWidth={2} />
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
              const percentage = Math.min(100, Math.max(0, ((numVal - min) / (max - min)) * 100));

              return (
                <div key={uniqueKey} className="scrubber-row">
                  <div
                    className="scrubber-fill"
                    style={{ width: `${percentage}%` }}
                  />
                  <span className="scrubber-label">{ctrl.label}</span>
                  <span className="scrubber-val">
                    {numVal.toFixed(step < 1 ? 2 : 0)}
                    {ctrl.unit || ""}
                  </span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={numVal}
                    onChange={(e) => onChange(ctrl.key, parseFloat(e.target.value))}
                    className="scrubber-input"
                    aria-label={ctrl.label}
                  />
                </div>
              );
            }

            // Select controls rendered as Segmented Monochrome Switches
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
