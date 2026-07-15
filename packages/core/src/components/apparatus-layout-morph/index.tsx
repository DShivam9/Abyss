import React from "react";
import { ApparatusLayoutMorphProps } from "./types";

export const ApparatusLayoutMorph: React.FC<ApparatusLayoutMorphProps> = ({
  className = "",
  style,
}) => {
  return (
    <div
      className={`w-full h-full min-h-[300px] bg-[#070708] border border-neutral-900 flex flex-col items-center justify-center gap-4 text-center p-8 select-none ${className}`}
      style={{
        ...style,
      }}
    >
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-white">
          APPARATUS LAYOUT MORPH
        </span>
        <span className="font-mono text-[8px] tracking-widest text-neutral-500 uppercase">
          Full Viewport Interactive Scroll Experience
        </span>
      </div>

      <a
        href="/morph-showcase"
        className="font-mono text-[9px] font-bold tracking-wider text-black bg-[#10b981] hover:bg-[#059669] px-6 py-2.5 rounded-[4px] uppercase transition-colors"
      >
        Open Stand-alone Experience
      </a>
    </div>
  );
};

export default ApparatusLayoutMorph;
