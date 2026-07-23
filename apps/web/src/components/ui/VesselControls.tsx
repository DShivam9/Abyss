"use client";

import React, { useState, useEffect } from "react";
import { ControlConfig } from "@/lib/component-registry";

export interface VesselControlsProps {
  categoryDefaults: ControlConfig[];
  componentControls?: ControlConfig[];
  values: Record<string, number | boolean | string>;
  onChange: (key: string, value: number | boolean | string) => void;
  onReset?: () => void;
  onClose?: () => void;
}

export function VesselControls({
  componentControls = [],
  values,
  onChange,
  onReset,
  onClose,
}: VesselControlsProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const renderControl = (ctrl: ControlConfig) => {
    const val = values[ctrl.key] ?? ctrl.default;

    if (ctrl.type === "slider") {
      const min = ctrl.min ?? 0;
      const max = ctrl.max ?? 100;
      const step = ctrl.step ?? 1;
      const numericVal = typeof val === "number" ? val : Number(val) || 0;

      return (
        <div key={ctrl.key} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
              {ctrl.label}
            </span>
            <span className="font-mono text-xs text-neutral-200">
              {numericVal}
              {ctrl.unit || ""}
            </span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={numericVal}
            onChange={(e) => onChange(ctrl.key, parseFloat(e.target.value))}
            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white hover:bg-neutral-700 transition-colors"
          />
        </div>
      );
    }

    if (ctrl.type === "toggle") {
      const boolVal = Boolean(val);
      return (
        <div key={ctrl.key} className="flex items-center justify-between py-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
            {ctrl.label}
          </span>
          <button
            type="button"
            onClick={() => onChange(ctrl.key, !boolVal)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              boolVal ? "bg-white" : "bg-neutral-800"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-neutral-900 shadow-lg ring-0 transition duration-200 ease-in-out ${
                boolVal ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      );
    }

    if (ctrl.type === "select") {
      const strVal = String(val);
      return (
        <div key={ctrl.key} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
              {ctrl.label}
            </span>
          </div>
          <select
            value={strVal}
            onChange={(e) => onChange(ctrl.key, e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 rounded px-2.5 py-1.5 font-sans text-xs text-neutral-200 focus:outline-none focus:border-white/30 transition-colors"
          >
            {ctrl.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (ctrl.type === "color") {
      const strVal = String(val);
      return (
        <div key={ctrl.key} className="flex items-center justify-between py-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
            {ctrl.label}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-neutral-300">{strVal}</span>
            <input
              type="color"
              value={strVal}
              onChange={(e) => onChange(ctrl.key, e.target.value)}
              className="w-6 h-6 rounded border border-white/10 bg-transparent cursor-pointer"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed top-16 right-6 z-[1000] font-sans">
      {/* Toggle Button */}
      {!isOpen && !onClose && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-[#111113]/90 hover:bg-[#111113] border border-white/10 hover:border-white/20 rounded-lg shadow-2xl text-neutral-300 hover:text-white transition-all backdrop-blur-md group cursor-pointer"
          title="Open Controls (ESC to close)"
        >
          <svg
            className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0m-9.75 0h9.75"
            />
          </svg>
          <span className="font-mono text-xs tracking-wider uppercase">Controls</span>
        </button>
      )}

      {/* Drawer Panel */}
      {isOpen && (
        <div
          className="w-88 sm:w-[360px] bg-[#0d0d10]/95 border border-neutral-800/90 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-900 bg-black/40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs font-medium tracking-wider uppercase text-neutral-200">
                Tuning Panel
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onReset && (
                <button
                  onClick={onReset}
                  className="font-mono text-[10px] uppercase text-neutral-400 hover:text-white transition-colors"
                  title="Reset to defaults"
                >
                  Reset
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
                className="text-neutral-400 hover:text-white transition-colors p-1"
                title="Close controls (ESC)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Controls Body */}
          <div className="p-4 space-y-4 max-h-[88vh] overflow-y-auto custom-scrollbar">
            {/* Component Controls Section */}
            {componentControls.length > 0 && (
              <div className="space-y-3">
                <div className="space-y-3">{componentControls.map(renderControl)}</div>
              </div>
            )}

            {componentControls.length === 0 && (
              <div className="text-center py-4 font-mono text-xs text-neutral-500">
                No configurable controls for this component.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
