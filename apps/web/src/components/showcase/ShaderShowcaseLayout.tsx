"use client";

import React from "react";

interface ShaderShowcaseLayoutProps {
  children: React.ReactNode;
}

export function ShaderShowcaseLayout({ children }: ShaderShowcaseLayoutProps) {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#070708] p-6 sm:p-12">
      {/* Soft Ambient Backdrop Aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[480px] h-[480px] rounded-full bg-white/[0.025] blur-[100px]" />
      </div>
      <div className="relative flex h-[72vh] max-h-[660px] aspect-[3/4] w-full max-w-[500px] items-center justify-center rounded-[8px] shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-neutral-800/80 overflow-hidden bg-[#0a0a0c]">
        {children}
      </div>
    </div>
  );
}
