"use client";

import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-bg-base/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="font-sans text-lg font-black tracking-[-0.04em] text-fg-primary select-none uppercase"
          >
            ABSOLUTE<span className="text-accent">UI</span>
          </Link>
        </div>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8 font-sans text-[11px] font-medium uppercase tracking-wider text-fg-secondary">
          <a
            href="#components"
            className="relative py-2 hover:text-fg-primary transition-colors duration-150 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:scale-x-0 hover:after:scale-x-100 after:bg-accent after:transition-transform after:duration-250 after:ease-fluid"
          >
            components
          </a>
          <a
            href="#showcase"
            className="relative py-2 hover:text-fg-primary transition-colors duration-150 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:scale-x-0 hover:after:scale-x-100 after:bg-accent after:transition-transform after:duration-250 after:ease-fluid"
          >
            showcase
          </a>
          <a
            href="#docs"
            className="relative py-2 hover:text-fg-primary transition-colors duration-150 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:scale-x-0 hover:after:scale-x-100 after:bg-accent after:transition-transform after:duration-250 after:ease-fluid"
          >
            docs
          </a>
        </nav>

        {/* Action / External Link */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[11px] font-medium uppercase tracking-wider text-fg-secondary hover:text-fg-primary border border-border-clean px-4 py-1.5 rounded-sm bg-bg-surface hover:bg-bg-elevated transition-all duration-150"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
