"use client";

import React from "react";

interface GalleryShowcaseLayoutProps {
  children: React.ReactNode;
}

export function GalleryShowcaseLayout({ children }: GalleryShowcaseLayoutProps) {
  return (
    <div
      className="h-screen w-screen overflow-y-auto overflow-x-hidden bg-[#070708]"
      data-lenis-prevent
    >
      {children}
    </div>
  );
}
