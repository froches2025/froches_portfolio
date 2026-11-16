"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type PaletteState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Puts focus back where it was before the palette opened. */
  restoreFocus: () => void;
};

const PaletteContext = createContext<PaletteState | null>(null);

// One palette for the whole site: the phone menu button, the desktop hint and
// Ctrl K / Cmd K all open the same dialog (FR-1.6). Because several controls
// open it, there is no single Radix trigger to return focus to, so the opener
// is remembered here.
export function PaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  const setOpen = useCallback((next: boolean) => {
    if (next && document.activeElement instanceof HTMLElement) {
      returnFocusTo.current = document.activeElement;
    }
    setOpenState(next);
  }, []);

  const restoreFocus = useCallback(() => {
    const target = returnFocusTo.current;
    returnFocusTo.current = null;
    if (target?.isConnected) target.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpenState((current) => {
          if (!current && document.activeElement instanceof HTMLElement) {
            returnFocusTo.current = document.activeElement;
          }
          return !current;
        });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(() => ({ open, setOpen, restoreFocus }), [open, setOpen, restoreFocus]);
  return <PaletteContext value={value}>{children}</PaletteContext>;
}

export function usePalette(): PaletteState {
  const context = useContext(PaletteContext);
  if (!context) throw new Error("usePalette must be used inside PaletteProvider");
  return context;
}
