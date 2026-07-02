"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type CursorState = "default" | "hover-image" | "hover-link" | "hover-interactive" | "hidden";

interface CursorContextType {
  cursorState: CursorState;
  setCursorState: (state: CursorState) => void;
  customLabel: string;
  setCustomLabel: (label: string) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function CursorProvider({ children }: { children: ReactNode }) {
  const [cursorState, setCursorState] = useState<CursorState>("default");
  const [customLabel, setCustomLabel] = useState<string>("");

  return (
    <CursorContext.Provider value={{ cursorState, setCursorState, customLabel, setCustomLabel }}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
}
