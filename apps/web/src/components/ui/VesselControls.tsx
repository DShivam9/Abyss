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

function NonReversingResetButton({
  title,
  onClick,
  className,
  iconClassName = "w-3 h-3",
  children
}: {
  title: string;
  onClick: () => void;
  className: string;
  iconClassName?: string;
  children?: React.ReactNode;
}) {
  const [rotation, setRotation] = useState(0);

  const handleHover = () => {
    setRotation((prev) => prev - 360);
  };

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onMouseEnter={handleHover}
      className={className}
    >
      <RotateCcw
        style={{ transform: `rotate(${rotation}deg)` }}
        className={`${iconClassName} transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`}
      />
      {children}
    </button>
  );
}

function TactileSlider({
  label,
  value,
  defaultValue,
  min,
  max,
  step,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  defaultValue?: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (val: number) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [displayVal, setDisplayVal] = useState(value);

  // Smooth lerp value interpolation for readout badge
  useEffect(() => {
    let frameId: number;
    const lerp = () => {
      setDisplayVal((prev) => {
        const diff = value - prev;
        if (Math.abs(diff) < 0.005) return value;
        return prev + diff * 0.25;
      });
      frameId = requestAnimationFrame(lerp);
    };
    frameId = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const defPct = defaultValue !== undefined ? Math.max(0, Math.min(100, ((defaultValue - min) / (max - min)) * 100)) : undefined;
  const isDefault = defaultValue !== undefined && Math.abs(value - defaultValue) < 0.001;
  const decimalPlaces = step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0;
  const formattedDisplay = displayVal.toFixed(decimalPlaces);

  return (
    <div
      className="space-y-2 pt-1 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-400 group-hover:text-neutral-200 transition-colors">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {!isDefault && defaultValue !== undefined && (
            <NonReversingResetButton
              title={`Reset parameter to default (${defaultValue}${unit})`}
              onClick={() => onChange(defaultValue)}
              className="p-1 text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded border border-neutral-800 transition-all cursor-pointer shadow-sm flex items-center justify-center"
              iconClassName="w-3 h-3 text-neutral-300 hover:text-white"
            />
          )}
          <span className="font-mono text-xs font-bold text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 tracking-wider transition-all duration-150 shadow-inner">
            {formattedDisplay}
            {unit}
          </span>
        </div>
      </div>

      <div className="relative flex items-center h-6 select-none">
        {/* Track Base */}
        <div className={`relative w-full h-[3px] rounded-full overflow-hidden transition-all duration-200 ${
          isDragging ? "bg-neutral-700/80 shadow-[0_0_8px_rgba(255,255,255,0.15)]" : "bg-neutral-800"
        }`}>
          {/* Active Tension Fill Bar */}
          <div
            className={`h-full transition-[width] duration-100 ease-out ${
              isDragging ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "bg-neutral-200 group-hover:bg-white"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Default Baseline Reticle Hairline Notch Tick Mark */}
        {defPct !== undefined && defaultValue !== undefined && (
          <div
            title={`Default Baseline: ${defaultValue}${unit}`}
            onClick={() => onChange(defaultValue)}
            className="absolute top-1/2 -translate-y-1/2 w-[2px] h-3.5 bg-neutral-500/70 hover:bg-emerald-400 rounded-full z-15 cursor-pointer transition-colors"
            style={{ left: `calc(${defPct}% - 1px)` }}
          />
        )}

        {/* Micro-deforming Tactile Reticle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150 ease-out rounded-[1px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)] ${
            isDragging
              ? "w-[5px] h-5 scale-y-110 shadow-[0_0_12px_rgba(255,255,255,0.6)]"
              : isHovered
              ? "w-[3px] h-4.5 scale-110 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
              : "w-[2.5px] h-3.5 opacity-90"
          }`}
          style={{ left: `calc(${pct}% - ${isDragging ? 2.5 : 1.25}px)` }}
        />

        {/* Input Overlay */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
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
    // Conditional control filtering
    if (ctrl.dependsOn) {
      const parentVal = values[ctrl.dependsOn.key];
      if (parentVal !== undefined && String(parentVal) !== String(ctrl.dependsOn.value)) {
        return null;
      }
    }

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
          defaultValue={ctrl.default as number}
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
      const handleVariantSelect = (newVariant: string) => {
        onChange(ctrl.key, newVariant);
        // Automatically apply hand-calibrated preset defaults for the selected variant
        if (ctrl.key === "motionVariant") {
          if (newVariant === "classic") {
            onChange("cropAmount", 15);
            onChange("parallaxIntensity", 70);
            onChange("borderRadius", 12);
            onChange("columnGap", 16);
            onChange("imageGap", 16);
          } else if (newVariant === "cylinder") {
            onChange("concaveDepth", 520);
            onChange("concaveTilt", 42);
            onChange("parallaxIntensity", 40);
            onChange("borderRadius", 8);
            onChange("columnGap", 20);
            onChange("imageGap", 0);
          } else if (newVariant === "convex") {
            onChange("convexBulge", 480);
            onChange("convexTilt", 38);
            onChange("parallaxIntensity", 40);
            onChange("borderRadius", 8);
            onChange("columnGap", 20);
            onChange("imageGap", 0);
          }
        }
      };

      return (
        <div key={ctrl.key} className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              {ctrl.label}
            </span>
          </div>
          <div className="relative group/select">
            <select
              value={strVal}
              onChange={(e) => handleVariantSelect(e.target.value)}
              className="w-full bg-neutral-900 text-white font-mono text-xs font-bold px-3 py-2 rounded-md border border-neutral-800 hover:border-neutral-700 focus:outline-none focus:border-white transition-colors cursor-pointer appearance-none tracking-wider pr-8"
            >
              {ctrl.options?.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white py-1">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-[9px] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-within/select:rotate-180 group-hover/select:translate-y-[-40%]">
              ▼
            </div>
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
      className="fixed top-[52px] bottom-0 right-0 z-50 w-full sm:w-[380px] max-h-[calc(100vh-52px)] bg-zinc-950/40 backdrop-blur-2xl border-l border-white/10 shadow-[-10px_0_30px_0_rgba(0,0,0,0.5)] flex flex-col font-mono text-white overflow-hidden"
    >
      {/* Header Bar (Glassmorphic) */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-900/30 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold tracking-widest uppercase text-neutral-300">
            TUNING INSPECTOR
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onReset && (
            <NonReversingResetButton
              title="Reset all parameters to default"
              onClick={onReset}
              className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-white/10 border border-transparent hover:border-white/10"
              iconClassName="w-3.5 h-3.5 text-neutral-400 group-hover:text-white"
            >
              <span>RESET</span>
            </NonReversingResetButton>
          )}
          <button
            onClick={handleClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer group/close rounded-md hover:bg-white/10 border border-transparent hover:border-white/10"
            title="Close controls (ESC)"
          >
            <X className="w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/close:rotate-90 group-hover/close:scale-110" />
          </button>
        </div>
      </div>

      {/* Parameters Controls Body */}
      <div
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        style={{ overflowY: "auto" }}
        className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5 custom-scrollbar overscroll-contain"
      >
        {componentControls.length > 0 ? (
          <div className="space-y-4">
            <div className="text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase pb-1 border-b border-white/10">
              COMPONENT PARAMETERS
            </div>
            <div className="space-y-4">{componentControls.map(renderControl)}</div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-neutral-400 font-mono">
            No configurable controls for this component.
          </div>
        )}
      </div>

      {/* Footer Info (Glassmorphic) */}
      <div className="p-4 border-t border-white/10 bg-zinc-900/30 backdrop-blur-md text-[10px] font-mono text-neutral-400 flex items-center justify-between shrink-0">
        <span>LIVE INTERACTIVE TUNER</span>
        <span>ESC TO CLOSE</span>
      </div>
    </motion.div>
  );
}
