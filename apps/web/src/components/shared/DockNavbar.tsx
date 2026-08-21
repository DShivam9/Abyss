"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

interface DockNavbarProps {
  onOpenSearch?: () => void;
  threshold?: number;
}

export function DockNavbar({ onOpenSearch, threshold = 40 }: DockNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // ponytail: native passive scroll listener for pill condensation
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const handleCollectionClick = (e: React.MouseEvent) => {
    if (pathname === "/components") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDocsClick = (e: React.MouseEvent) => {
    if (pathname === "/docs") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="dock-wrapper" id="dockWrapper">
      <header className={`dock-nav ${isScrolled ? "dock-pill" : "dock-flush"}`}>
        {/* Brand */}
        <Link href="/" className="dock-brand">
          <div
            className="abyss-celestial-logo"
            aria-hidden="true"
            style={{ cursor: "pointer", display: "inline-flex" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path
                d="m50 7.5234 2.2461 29.645 5.9648-15.68-5.2891 24.566 0.089844 1.0898 37.09-22.633-27.855 22.355 20.266-5.3906-24.645 10.09 42.133 11.113-39.566-5.5469 21.109 12.812-25.188-11.445 15.898 34.777-19.363-30.055 3.1523 22.242-7.2656-24.844-21.031 32.656 14.41-31.531-16.945 14.586 17.043-19.578-42.254 5.9141 36.457-9.6016-24.191-3.6328 29.801 0.89844-32.168-25.82 28.945 17.656-11.887-17.145 19.934 22.055 0.097656 0.066406z"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <span>ABYSS</span>
        </Link>

        {/* Links */}
        <nav className="dock-nav-links">
          <Link
            href="/components"
            className="dock-nav-link shutter-hover"
            onClick={handleCollectionClick}
          >
            Collection
          </Link>
          <Link
            href="/docs"
            className="dock-nav-link shutter-hover"
            onClick={handleDocsClick}
          >
            Docs
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="dock-nav-actions">
          <button
            type="button"
            className="dock-action-btn shutter-hover"
            onClick={onOpenSearch}
            title="Open Universal Search (Cmd+K)"
            aria-label="Search"
          >
            <Search size={15} />
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="dock-action-btn shutter-hover"
            aria-label="GitHub Repository"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
        </div>
      </header>
    </div>
  );
}
