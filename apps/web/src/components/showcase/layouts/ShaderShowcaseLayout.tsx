"use client";

import React from "react";

interface ShaderShowcaseLayoutProps {
  children: React.ReactNode;
  fullBleed?: boolean;
}

export function ShaderShowcaseLayout({ children, fullBleed = false }: ShaderShowcaseLayoutProps) {
  return (
    <div className={`relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#070708] ${fullBleed ? "p-0" : "p-6 sm:p-12"}`}>
      {/* Soft Ambient Backdrop Aura */}
      {!fullBleed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[480px] h-[480px] rounded-full bg-white/[0.025] blur-[100px]" />
        </div>
      )}
      <div className="relative flex h-full w-full items-center justify-center bg-transparent">
        {children}
      </div>
    </div>
  );
}
