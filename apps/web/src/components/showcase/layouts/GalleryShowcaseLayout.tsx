"use client";

import React from "react";

interface GalleryShowcaseLayoutProps {
  children: React.ReactNode;
}

export function GalleryShowcaseLayout({ children }: GalleryShowcaseLayoutProps) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#070708] cursor-grab active:cursor-grabbing">
      {children}
    </div>
  );
}
