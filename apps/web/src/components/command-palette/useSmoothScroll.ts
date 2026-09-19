import { useRef } from "react";

export function useSmoothScroll() {
  const listRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);
  const isKeyboardNavRef = useRef(false);

  // Auto scroll active item into view only during keyboard navigation
  const scrollSelectedIntoView = () => {
    if (isKeyboardNavRef.current && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "auto",
      });
      isKeyboardNavRef.current = false;
    }
  };

  return {
    listRef,
    activeItemRef,
    isKeyboardNavRef,
    scrollSelectedIntoView,
  };
}
