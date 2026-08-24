"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useFinePointer } from "@/hooks/use-fine-pointer";

/**
 * Small crosshair cursor that snaps onto interactive elements.
 * Disabled on touch devices and under reduced motion.
 */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const isFine = useFinePointer();
  const enabled = isFine && !reduced;

  useEffect(() => {
    document.documentElement.classList.toggle("custom-cursor", enabled);
    if (!enabled) return;

    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      const hovering = (e.target as HTMLElement)?.closest?.(
        "a, button, [role='button'], input, textarea"
      );
      el.dataset.hover = hovering ? "true" : "false";
    };

    const tick = () => {
      el.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[200] -translate-x-1/2 -translate-y-1/2 transition-[width,height,border-color] duration-150 ease-out data-[hover=true]:w-6 data-[hover=true]:h-6 data-[hover=true]:border-signal-amber w-4 h-4 border border-data-cyan/80 rounded-full"
    >
      <span className="absolute left-1/2 top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 bg-current opacity-60" />
      <span className="absolute left-1/2 top-1/2 h-px w-2 -translate-x-1/2 -translate-y-1/2 bg-current opacity-60" />
    </div>
  );
}
