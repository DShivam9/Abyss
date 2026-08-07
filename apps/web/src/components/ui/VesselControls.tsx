"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, RotateCcw, SlidersHorizontal } from "lucide-react";
import { ControlConfig } from "@/lib/component-registry";

export interface VesselControlsProps {
  categoryDefaults?: ControlConfig[];
  componentControls?: ControlConfig[];
  values: Record<string, number | boolean | string>;
  onChange: (key: string, value: number | boolean | string) => void;
  onReset?: () => void;
  onClose?: () => void;
}

function LineSheetVariantBar({
  value,
  options = [],
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 bg-[#0E0E12] p-1.5 rounded-xl border border-white/10 shadow-inner select-none">
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`py-2 px-1 text-xs font-sans transition-all cursor-pointer text-center rounded-lg ${
              isSelected
                ? "bg-white text-black font-bold shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04] font-medium"
            }`}
          >
            <span className="truncate block">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function NonReversingResetButton({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
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
      className="flex items-center gap-1.5 font-sans text-xs font-medium text-neutral-300 hover:text-white transition-all cursor-pointer py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 shadow-sm"
    >
      <RotateCcw
        style={{ transform: `rotate(${rotation}deg)` }}
        className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
      />
      <span>Reset</span>
    </button>
  );
}

function HairlineGridRow({
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

  // Smooth lerp value interpolation using Abyss exponential decay
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const lerp = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      setDisplayVal((prev) => {
        const diff = value - prev;
        if (Math.abs(diff) < 0.001) return value;
        const smoothFactor = 1 - Math.pow(1 - 0.22, dt * 60);
        return prev + diff * smoothFactor;
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
      className="p-3.5 space-y-2.5 hover:bg-white/[0.02] transition-colors group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Label Left, Monospace Badge Right */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-neutral-300 group-hover:text-white transition-colors">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {!isDefault && defaultValue !== undefined && (
            <button
              type="button"
              title={`Reset parameter (${defaultValue}${unit})`}
              onClick={() => onChange(defaultValue)}
              className="p-1 text-neutral-400 hover:text-white bg-black/80 hover:bg-neutral-900 rounded border border-white/10 transition-all cursor-pointer flex items-center justify-center active:scale-90"
            >
              <RotateCcw className="w-2.5 h-2.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            </button>
          )}
          <span className="font-mono text-xs font-bold text-white bg-black/90 px-2 py-0.5 rounded border border-white/15 tracking-tight shadow-inner min-w-[42px] text-right">
            {formattedDisplay}
            {unit}
          </span>
        </div>
      </div>

      {/* Hairline Range Slider Track */}
      <div className="relative flex items-center h-4 select-none cursor-pointer">
        {/* Track Base */}
        <div className="relative w-full h-[2px] rounded-full bg-neutral-800 group-hover:bg-neutral-700/80 transition-colors overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isDragging ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-neutral-300 group-hover:bg-white"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Default Baseline Indicator Tick */}
        {defPct !== undefined && defaultValue !== undefined && Math.abs(pct - defPct) > 4 && (
          <div
            title={`Default: ${defaultValue}${unit}`}
            onClick={() => onChange(defaultValue)}
            className="absolute top-1/2 -translate-y-1/2 w-[1.5px] h-2.5 bg-neutral-500/70 hover:bg-white z-10 cursor-pointer transition-colors"
            style={{ left: `calc(${defPct}%)` }}
          />
        )}

        {/* 2px Hairline Vertical Needle Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] z-20 ${
            isDragging
              ? "w-[2.5px] h-4 scale-y-110"
              : isHovered
              ? "w-[2px] h-3.5"
              : "w-[2px] h-3 opacity-90"
          }`}
          style={{ left: `calc(${pct}% - ${isDragging ? 1.25 : 1}px)` }}
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
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
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

  const selectControl = componentControls.find((c) => c.type === "select");
  const otherControls = componentControls.filter((c) => c.type !== "select");

  const renderControl = (ctrl: ControlConfig) => {
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
        <HairlineGridRow
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
        <div key={ctrl.key} className="p-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors select-none">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
            {ctrl.label}
          </span>
          <button
            type="button"
            onClick={() => onChange(ctrl.key, !boolVal)}
            className={`px-3 py-1 text-xs font-sans font-bold rounded-md border transition-all cursor-pointer ${
              boolVal
                ? "bg-white text-black border-white shadow-sm"
                : "bg-neutral-900 text-neutral-400 border-white/10 hover:text-white"
            }`}
          >
            {boolVal ? "ACTIVE" : "DISABLED"}
          </button>
        </div>
      );
    }

    if (ctrl.type === "color") {
      const strVal = String(val);
      return (
        <div key={ctrl.key} className="p-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors select-none">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
            {ctrl.label}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-white font-bold">{strVal}</span>
            <input
              type="color"
              value={strVal}
              onChange={(e) => onChange(ctrl.key, e.target.value)}
              className="w-5 h-5 rounded border border-white/20 bg-transparent cursor-pointer"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  const handleSelectChange = (newVariant: string) => {
    if (selectControl) {
      onChange(selectControl.key, newVariant);
      if (selectControl.key === "motionVariant") {
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
    }
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: "0%", opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="fixed top-16 right-6 bottom-6 z-50 w-full sm:w-[350px] bg-[#09090C]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.1)] flex flex-col font-sans text-white overflow-hidden select-none"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.01] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center shadow-inner text-white">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-sans text-xs font-semibold text-white tracking-tight leading-none">
              Tuning Inspector
            </h3>
            <p className="font-sans text-[10px] text-neutral-400 leading-none mt-1">
              Live Component Parameters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onReset && (
            <NonReversingResetButton
              title="Reset all parameters to default"
              onClick={onReset}
            />
          )}
          <button
            onClick={handleClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer group/close rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10"
            title="Close controls (ESC)"
          >
            <X className="w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/close:rotate-90" />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 custom-scrollbar overscroll-contain"
      >
        {/* Variant Hairline Box */}
        {selectControl && (
          <div className="space-y-2">
            <label className="block font-sans text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              {selectControl.label}
            </label>
            <LineSheetVariantBar
              value={String(values[selectControl.key] ?? selectControl.default)}
              options={selectControl.options || []}
              onChange={handleSelectChange}
            />
          </div>
        )}

        {/* Single Architectural Hairline Grid Table */}
        {otherControls.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              <span>Parameters</span>
              <span className="font-mono text-[10px] text-neutral-500 font-normal">{otherControls.length} PROPS</span>
            </div>

            <div className="bg-[#0E0E12]/80 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/10 shadow-sm">
              {otherControls.map(renderControl)}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-neutral-400 font-sans">
            No configurable controls for this component.
          </div>
        )}
      </div>
    </motion.div>
  );
}
