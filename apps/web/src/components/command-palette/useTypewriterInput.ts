import { useState, useRef, useEffect, useCallback } from "react";
import { useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { TYPEWRITER_PHRASES } from "./constants";

export function useTypewriterInput(isOpen: boolean) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const caretX = useMotionValue(0);
  const caretOpacity = useMotionValue(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const springCaretX = useSpring(
    caretX,
    prefersReducedMotion
      ? { stiffness: 10000, damping: 100, mass: 0.1 }
      : { stiffness: 500, damping: 30, mass: 0.5 }
  );

  const syncMeasureSpan = useCallback(() => {
    const input = inputRef.current;
    const measureSpan = measureRef.current;
    if (!input || !measureSpan) return;

    const styles = window.getComputedStyle(input);
    measureSpan.style.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
    measureSpan.style.letterSpacing = styles.letterSpacing;
    measureSpan.style.fontFeatureSettings = styles.fontFeatureSettings;
    measureSpan.style.fontVariationSettings = styles.fontVariationSettings;
  }, []);

  const measurePrefixWidth = useCallback(
    (text: string) => {
      const input = inputRef.current;
      const measureSpan = measureRef.current;
      if (!input || !measureSpan) return null;

      syncMeasureSpan();
      measureSpan.textContent = text;

      const paddingLeft =
        parseFloat(window.getComputedStyle(input).paddingLeft) || 0;

      return text.length > 0
        ? measureSpan.offsetWidth + paddingLeft
        : paddingLeft;
    },
    [syncMeasureSpan]
  );

  const updateCaret = useCallback(
    (target?: HTMLInputElement | null) => {
      const input = target || inputRef.current;
      if (!input) return;

      const selectionStart = input.selectionStart ?? 0;
      const selectionEnd = input.selectionEnd ?? 0;
      const hasSelection = selectionStart !== selectionEnd;
      const textBeforeCaret = input.value.slice(0, selectionStart);

      const absoluteWidth = measurePrefixWidth(textBeforeCaret);
      if (absoluteWidth === null) return;

      const styles = window.getComputedStyle(input);
      const paddingRight = parseFloat(styles.paddingRight) || 0;
      const caretPosition = absoluteWidth - input.scrollLeft;
      const maxX = input.clientWidth - paddingRight;

      caretX.set(Math.min(caretPosition, maxX));

      if (hasSelection) {
        caretOpacity.set(0);
      } else {
        caretOpacity.set(1);
      }
    },
    [measurePrefixWidth, caretX, caretOpacity]
  );

  // Dynamic Typewriter Effect directly on input placeholder (0 React re-renders)
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
        if (inputRef.current) {
          inputRef.current.placeholder = currentPhrase.slice(0, charIdx);
        }

        if (charIdx === currentPhrase.length) {
          isDeleting = true;
          timeoutId = setTimeout(tick, 1800);
          return;
        }
        timeoutId = setTimeout(tick, 55);
      } else {
        charIdx--;
        if (inputRef.current) {
          inputRef.current.placeholder = currentPhrase.slice(0, charIdx);
        }

        if (charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % TYPEWRITER_PHRASES.length;
          timeoutId = setTimeout(tick, 280);
          return;
        }
        timeoutId = setTimeout(tick, 25);
      }
    };

    if (inputRef.current) {
      inputRef.current.placeholder = TYPEWRITER_PHRASES[0];
    }
    timeoutId = setTimeout(tick, 800);
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  // Selectionchange listener & font load synchronization
  useEffect(() => {
    if (!isOpen) return;
    const input = inputRef.current;
    if (!input) return;

    const handleSelectionChange = () => {
      if (document.activeElement !== input) return;
      requestAnimationFrame(() => updateCaret(input));
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    void document.fonts.ready.then(() => updateCaret(input));

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [isOpen, updateCaret]);

  // Reset & focus on modal open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      caretX.set(0);
      caretOpacity.set(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setIsFocused(true);
        caretOpacity.set(1);
        updateCaret(inputRef.current);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, caretX, caretOpacity, updateCaret]);

  return {
    query,
    setQuery,
    isFocused,
    setIsFocused,
    inputRef,
    measureRef,
    springCaretX,
    caretOpacity,
    updateCaret,
  };
}
