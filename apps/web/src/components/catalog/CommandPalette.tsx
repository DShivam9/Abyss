"use client";

import React, { useEffect, useState, useRef, useDeferredValue, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  LayoutGrid,
  BookOpen,
  ArrowUpRight,
  ArrowRight,
  CornerDownLeft,
} from "lucide-react";
import { useScrollLock } from "@/lib/useScrollLock";
import { useSmoothScroll } from "@/lib/useSmoothScroll";
import { ComponentDetail } from "@/lib/registry";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  components: ComponentDetail[];
  onSelectComponent?: (slug: string) => void;
}

const STATIC_PAGES = [
  { name: "Home", path: "/", icon: FileText },
  { name: "Collection Grid", path: "/components", icon: LayoutGrid },
  { name: "Documentation Specs", path: "/docs", icon: BookOpen },
];

const TYPEWRITER_PHRASES = [
  "Type to filter components...",
  "Type 'Dual Wave'...",
  "Type 'Raymarching'...",
  "Type '3D Shatter'...",
  "Type 'Kinetic Typo'...",
  "Type 'Bronze Patina'...",
];

export function CommandPalette({
  isOpen,
  onClose,
  components,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [placeholder, setPlaceholder] = useState(TYPEWRITER_PHRASES[0]);
  const [cursorPos, setCursorPos] = useState(0);
  const [caretOffset, setCaretOffset] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const listRef = useSmoothScroll<HTMLDivElement>();
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  useScrollLock(isOpen);

  // Measure caret offset whenever query or cursorPos changes
  useEffect(() => {
    if (mirrorRef.current) {
      setCaretOffset(mirrorRef.current.offsetWidth);
    }
  }, [query, cursorPos]);

  const updateCursorPosition = () => {
    if (inputRef.current) {
      setCursorPos(inputRef.current.selectionStart ?? query.length);
    }
  };

  // Dynamic Typewriter Effect for placeholder
  useEffect(() => {
    if (!isOpen) return;

    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const tick = () => {
      const currentPhrase = TYPEWRITER_PHRASES[phraseIdx];

      if (!isDeleting) {
        charIdx++;
        setPlaceholder(currentPhrase.slice(0, charIdx));

        if (charIdx === currentPhrase.length) {
          isDeleting = true;
          timeoutId = setTimeout(tick, 1800);
          return;
        }
        timeoutId = setTimeout(tick, 55);
      } else {
        charIdx--;
        setPlaceholder(currentPhrase.slice(0, charIdx));

        if (charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % TYPEWRITER_PHRASES.length;
          timeoutId = setTimeout(tick, 280);
          return;
        }
        timeoutId = setTimeout(tick, 25);
      }
    };

    timeoutId = setTimeout(tick, 800);
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setCursorPos(0);
      setCaretOffset(0);
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setIsFocused(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const cleanQuery = deferredQuery.toLowerCase().trim();

  // Filtered pages
  const filteredPages = useMemo(() => {
    return STATIC_PAGES.filter((p) => {
      if (!cleanQuery) return true;
      return p.name.toLowerCase().includes(cleanQuery);
    });
  }, [cleanQuery]);

  // Filtered components
  const filteredComponents = useMemo(() => {
    return components.filter((c) => {
      if (!cleanQuery) return true;
      const nameMatch = c.label.toLowerCase().includes(cleanQuery);
      const descMatch = c.desc ? c.desc.toLowerCase().includes(cleanQuery) : false;
      const tagMatch = c.tags?.some((t) => t.toLowerCase().includes(cleanQuery));
      return nameMatch || descMatch || tagMatch;
    });
  }, [components, cleanQuery]);

  const allItems = useMemo(() => [
    ...filteredPages.map((p) => ({ type: "page" as const, item: p })),
    ...filteredComponents.map((c) => ({ type: "comp" as const, item: c })),
  ], [filteredPages, filteredComponents]);

  // Auto scroll active item into view
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  // Navigate selection
  const handleSelect = useCallback((path: string) => {
    onClose();
    router.push(path);
  }, [onClose, router]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          allItems.length === 0 ? 0 : (prev + 1) % allItems.length
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          allItems.length === 0 ? 0 : (prev - 1 + allItems.length) % allItems.length
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = allItems[selectedIndex];
        if (selected) {
          if (selected.type === "page") {
            handleSelect(selected.item.path);
          } else {
            handleSelect(`/showcase/${selected.item.slug}`);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, allItems, onClose, handleSelect]);

  let flatIndex = 0;

  return (
    <div
      className={`modal-overlay ${isOpen ? "open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      aria-hidden={!isOpen}
      role="dialog"
    >
      <div
        className="search-modal"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="search-header">
          <div
            className="abyss-celestial-logo"
            aria-hidden="true"
            style={{ cursor: "default" }}
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

          <div className="search-input-wrap">
            <span ref={mirrorRef} className="search-input-mirror" aria-hidden="true">
              {query.slice(0, cursorPos)}
            </span>
            {isFocused && (
              <span
                className="smooth-caret"
                style={{ transform: `translateX(${caretOffset}px)` }}
                aria-hidden="true"
              />
            )}
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCursorPos(e.target.selectionStart ?? e.target.value.length);
                setSelectedIndex(0);
              }}
              onSelect={updateCursorPosition}
              onKeyUp={updateCursorPosition}
              onFocus={() => {
                setIsFocused(true);
                updateCursorPosition();
              }}
              onBlur={() => setIsFocused(false)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <kbd className="kbd-esc" onClick={onClose}>
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="results-list"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {filteredPages.length > 0 && (
            <div className="category-group">
              <div className="category-title">PAGES</div>
              {filteredPages.map((page) => {
                const currentIndex = flatIndex++;
                const isSelected = selectedIndex === currentIndex;
                const IconComponent = page.icon;

                return (
                  <button
                    key={page.path}
                    ref={isSelected ? activeItemRef : null}
                    type="button"
                    className={`result-item ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelect(page.path)}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <IconComponent size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                      <span className="item-name">{page.name}</span>
                    </div>
                    <ArrowUpRight size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          )}

          {filteredComponents.length > 0 && (
            <div className="category-group" style={{ marginTop: filteredPages.length > 0 ? "10px" : "0" }}>
              <div className="category-title">COMPONENTS</div>
              {filteredComponents.map((comp) => {
                const currentIndex = flatIndex++;
                const isSelected = selectedIndex === currentIndex;

                return (
                  <button
                    key={comp.slug}
                    ref={isSelected ? activeItemRef : null}
                    type="button"
                    className={`result-item ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelect(`/showcase/${comp.slug}`)}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "var(--text-muted)", flexShrink: 0 }}
                      >
                        <path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z" />
                        <path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z" />
                        <path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z" />
                        <path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z" />
                      </svg>
                      <span className="item-name">{comp.label}</span>
                    </div>
                    <ArrowRight size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          )}

          {allItems.length === 0 && (
            <div
              className="no-results-box"
              style={{
                padding: "32px 14px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "14px",
              }}
            >
              No matches found for &quot;{query}&quot;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="search-footer">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            Go to page
            <CornerDownLeft size={12} style={{ color: "var(--text-muted)" }} />
          </span>
        </div>
      </div>
    </div>
  );
}
