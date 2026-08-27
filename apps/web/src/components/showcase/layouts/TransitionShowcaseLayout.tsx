"use client";

import React, { useEffect, useState } from "react";

interface TransitionShowcaseLayoutProps {
  children: React.ReactNode;
  runwayHeight?: string;
}

export function TransitionShowcaseLayout({
  children,
  runwayHeight = "500vh",
}: TransitionShowcaseLayoutProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const current = window.scrollY;
        setScrollProgress(Math.min(1, Math.max(0, current / totalScroll)));
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { scrollProgress } as React.Attributes & { scrollProgress?: number });
    }
    return child;
  });

  return (
    <div className="relative w-full" style={{ height: runwayHeight }}>
      {/* Sticky Full-Viewport Container */}
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-[#070708]">
        {childrenWithProps}
      </div>
    </div>
  );
}
