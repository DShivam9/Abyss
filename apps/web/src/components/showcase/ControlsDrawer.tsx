"use client";

import React, { useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
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
    e.stopPropagation();
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
      moveEvent.stopPropagation();
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newLeft = Math.max(12, Math.min(window.innerWidth - drawer.offsetWidth - 12, initialLeft + deltaX));
      const newTop = Math.max(12, Math.min(window.innerHeight - drawer.offsetHeight - 12, initialTop + deltaY));

      setPosition({ x: newLeft, y: newTop });
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      upEvent.stopPropagation();
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
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {/* Draggable Header */}
      <div className="controls-drawer-header" onMouseDown={handleMouseDown}>
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
