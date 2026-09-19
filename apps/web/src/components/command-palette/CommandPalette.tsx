"use client";

import React, { useEffect, useState, useRef, useDeferredValue, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Compass, CornerDownLeft, Cuboid } from "lucide-react";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { useSmoothScroll } from "@/lib/hooks/useSmoothScroll";
import { ComponentDetail, SearchIndexItem } from "@/lib/registry";
import { STATIC_PAGES } from "./constants";
import { PaletteItemRow } from "./PaletteItemRow";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  components: (SearchIndexItem | ComponentDetail)[];
  onSelectComponent?: (slug: string) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  components,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const [caretOffset, setCaretOffset] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const listRef = useSmoothScroll<HTMLDivElement>();
  const activeItemRef = useRef<HTMLButtonElement | null>(null);
  const isKeyboardNavRef = useRef(false);

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

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setCursorPos(0);
      setCaretOffset(0);
      setSelectedIndex(0);
      isKeyboardNavRef.current = false;
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setIsFocused(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const cleanQuery = deferredQuery.toLowerCase().trim();

  // Filtered pages with keyword & relevance scoring
  const filteredPages = useMemo(() => {
    if (!cleanQuery) return STATIC_PAGES;
    const scored: Array<{ item: (typeof STATIC_PAGES)[0]; score: number }> = [];

    for (const p of STATIC_PAGES) {
      const nameLower = p.name.toLowerCase();
      let score = 0;
      if (nameLower === cleanQuery) score = 1000;
      else if (nameLower.startsWith(cleanQuery)) score = 600;
      else if (nameLower.includes(` ${cleanQuery}`)) score = 400;
      else if (nameLower.includes(cleanQuery)) score = 250;
      else if (p.keywords?.some((k) => k === cleanQuery)) score = 200;
      else if (p.keywords?.some((k) => k.includes(cleanQuery))) score = 100;

      if (score > 0) scored.push({ item: p, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.item);
  }, [cleanQuery]);

  // Filtered components with keyword & relevance scoring
  const filteredComponents = useMemo(() => {
    if (!cleanQuery) return components;
    const scored: Array<{ item: SearchIndexItem | ComponentDetail; score: number }> = [];

    for (const c of components) {
      const labelLower = c.label.toLowerCase();
      const slugLower = c.slug.toLowerCase();
      const descLower = ("description" in c && typeof (c as any).description === "string" ? (c as any).description : "").toLowerCase();
      const tags = (c.tags ?? []).map((t) => String(t).toLowerCase());

      const exactTag = tags.includes(cleanQuery);
      const tagIncludes = tags.some((t) => t.includes(cleanQuery));

      let score = 0;
      if (labelLower === cleanQuery || slugLower === cleanQuery) {
        score = 1000;
      } else if (labelLower.startsWith(cleanQuery)) {
        score = 600;
      } else if (labelLower.includes(` ${cleanQuery}`) || labelLower.includes(`-${cleanQuery}`)) {
        score = 400;
      } else if (labelLower.includes(cleanQuery)) {
        score = 250;
      } else if (exactTag) {
        score = 120;
      } else if (tagIncludes) {
        score = 60;
      } else if (descLower.includes(cleanQuery)) {
        score = 20;
      }

      if (score > 0) {
        scored.push({ item: c, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.item);
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
        return;
      }

      if (allItems.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        isKeyboardNavRef.current = true;
        setSelectedIndex((prev) => (prev + 1) % allItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        isKeyboardNavRef.current = true;
        setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = allItems[selectedIndex];
        if (!selected) return;

        if (selected.type === "page") {
          handleSelect(selected.item.path);
        } else {
          handleSelect(`/showcase/${selected.item.slug}`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, allItems, selectedIndex, handleSelect, onClose]);

  const canSelectOnHover = useCallback((e: React.MouseEvent) => {
    if (isKeyboardNavRef.current) {
      if (Math.abs(e.movementX) > 1 || Math.abs(e.movementY) > 1) {
        isKeyboardNavRef.current = false;
        return true;
      }
      return false;
    }
    return true;
  }, []);

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <div
      className={`modal-overlay ${isOpen ? "open" : ""}`}
      onClick={onClose}
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div
        className="search-modal"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar with true iOS-style glassmorphism */}
        <div className="search-header">
          <div className="search-capsule">
            <div
              className="abyss-celestial-logo"
              role="button"
              aria-label="Abyss Home"
              onClick={() => handleSelect("/")}
              style={{ cursor: "pointer", display: "inline-flex", flexShrink: 0 }}
            >
              <svg
                width="20"
                height="20"
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
                placeholder="Search components or pages..."
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
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="results-list"
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {filteredPages.length > 0 && (
            <div className="category-group">
              <div className="category-title">PAGES</div>
              {filteredPages.map((page) => {
                const currentIndex = flatIndex++;
                const isSelected = selectedIndex === currentIndex;

                return (
                  <PaletteItemRow
                    key={page.path}
                    activeRef={isSelected ? activeItemRef : null}
                    isSelected={isSelected}
                    label={page.name}
                    icon={page.icon}
                    iconType={page.iconType}
                    isPage={true}
                    onSelect={() => handleSelect(page.path)}
                    onMouseMove={(e) => {
                      if (canSelectOnHover(e)) {
                        isKeyboardNavRef.current = false;
                        setSelectedIndex(currentIndex);
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (canSelectOnHover(e)) {
                        isKeyboardNavRef.current = false;
                        setSelectedIndex(currentIndex);
                      }
                    }}
                  />
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
                  <PaletteItemRow
                    key={comp.slug}
                    activeRef={isSelected ? activeItemRef : null}
                    isSelected={isSelected}
                    label={comp.label}
                    icon={Cuboid}
                    iconType="cuboid"
                    isPage={false}
                    onSelect={() => handleSelect(`/showcase/${comp.slug}`)}
                    onMouseMove={(e) => {
                      if (canSelectOnHover(e)) {
                        isKeyboardNavRef.current = false;
                        setSelectedIndex(currentIndex);
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (canSelectOnHover(e)) {
                        isKeyboardNavRef.current = false;
                        setSelectedIndex(currentIndex);
                      }
                    }}
                  />
                );
              })}
            </div>
          )}

          {allItems.length === 0 && (
            <div className="search-empty-state">
              <div className="empty-state-icon">
                <Compass size={20} strokeWidth={1.6} />
              </div>
              <p className="empty-state-title">
                No matching results for <span className="empty-state-query">&ldquo;{query}&rdquo;</span>
              </p>
              <span className="empty-state-hint">
                Try searching for a component name, keyword, or page
              </span>
            </div>
          )}
        </div>

        {/* Seamless Footer */}
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
            <CornerDownLeft size={13} style={{ color: "var(--text-muted)" }} />
          </span>
        </div>
      </div>
    </div>
  );
}
