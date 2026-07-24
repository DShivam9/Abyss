"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
import { ControlConfig } from "@/lib/component-registry";

export interface VesselControlsProps {
  categoryDefaults: ControlConfig[];
  componentControls?: ControlConfig[];
  values: Record<string, number | boolean | string>;
  onChange: (key: string, value: number | boolean | string) => void;
  onReset?: () => void;
  onClose?: () => void;
}

function TactileSlider({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (val: number) => void;
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="space-y-2 pt-1 group">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-400 group-hover:text-neutral-200 transition-colors">
          {label}
        </span>
        <span className="font-mono text-xs font-bold text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 tracking-wider">
          {value}
          {unit}
        </span>
      </div>

      <div className="relative flex items-center h-5 select-none">
        {/* Hairline Base Track */}
        <div className="relative w-full h-[2px] bg-neutral-800 rounded-full overflow-hidden">
          {/* Active Fill Bar */}
          <div
            className="h-full bg-white transition-[width] duration-75 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Precision Vertical Reticle Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[3px] h-4 bg-white rounded-[1px] pointer-events-none transition-transform duration-100 group-hover:scale-125"
          style={{ left: `calc(${pct}% - 1.5px)` }}
        />

        {/* Native Touch/Mouse Event Overlay */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
        />
      </div>
    </div>
  );
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

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const renderControl = (ctrl: ControlConfig) => {
    const val = values[ctrl.key] ?? ctrl.default;

    if (ctrl.type === "slider") {
      const min = ctrl.min ?? 0;
      const max = ctrl.max ?? 100;
      const step = ctrl.step ?? 1;
      const numericVal = typeof val === "number" ? val : Number(val) || 0;

      return (
        <TactileSlider
          key={ctrl.key}
          label={ctrl.label}
          value={numericVal}
          min={min}
          max={max}
          step={step}
          unit={ctrl.unit}
          onChange={(newVal) => onChange(ctrl.key, newVal)}
        />
      );
    }

    if (ctrl.type === "toggle") {
      const boolVal = Boolean(val);
      return (
        <div key={ctrl.key} className="flex items-center justify-between py-2 border-b border-neutral-900/60">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            {ctrl.label}
          </span>
          <button
            type="button"
            onClick={() => onChange(ctrl.key, !boolVal)}
            className={`px-3 py-1 text-[11px] font-mono font-bold tracking-wider rounded-lg border transition-all cursor-pointer ${
              boolVal
                ? "bg-white text-black border-white"
                : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:text-white"
            }`}
          >
            {boolVal ? "ACTIVE" : "DISABLED"}
          </button>
        </div>
      );
    }

    if (ctrl.type === "select") {
      const strVal = String(val);
      return (
        <div key={ctrl.key} className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              {ctrl.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {ctrl.options?.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(ctrl.key, opt.value)}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider rounded-md transition-all cursor-pointer ${
                  strVal === String(opt.value)
                    ? "bg-white text-black font-extrabold"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (ctrl.type === "color") {
      const strVal = String(val);
      return (
        <div key={ctrl.key} className="flex items-center justify-between py-2 border-b border-neutral-900/60">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            {ctrl.label}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-neutral-300 font-bold">{strVal}</span>
            <input
              type="color"
              value={strVal}
              onChange={(e) => onChange(ctrl.key, e.target.value)}
              className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: "0%" }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed top-[52px] bottom-0 right-0 z-50 w-full sm:w-[380px] bg-[#0A0A0A]/98 backdrop-blur-2xl border-l border-neutral-800/90 shadow-2xl flex flex-col font-mono text-white"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-900 bg-neutral-950/60 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold tracking-widest uppercase text-neutral-300">
            TUNING INSPECTOR
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Reset all parameters to default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>RESET</span>
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer group"
            title="Close controls (ESC)"
          >
            <X className="w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90" />
          </button>
        </div>
      </div>

      {/* Parameters Controls Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {componentControls.length > 0 ? (
          <div className="space-y-4">
            <div className="text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase pb-1 border-b border-neutral-900">
              COMPONENT PARAMETERS
            </div>
            <div className="space-y-4">{componentControls.map(renderControl)}</div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-neutral-500 font-mono">
            No configurable controls for this component.
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-neutral-900 bg-neutral-950/80 text-[10px] font-mono text-neutral-500 flex items-center justify-between shrink-0">
        <span>LIVE INTERACTIVE TUNER</span>
        <span>ESC TO CLOSE</span>
      </div>
    </motion.div>
  );
}
