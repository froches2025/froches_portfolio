"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";

const SECTIONS = [
  { label: "OVERVIEW", num: "01" },
  { label: "PROJECTS", num: "02" },
  { label: "ABOUT", num: "03" },
];

interface TelemetryTrackerProps {
  activeIndex: number;
}

/**
 * Fixed right-edge flight-progress readout, desktop only.
 * Marker position is tied to scroll progress within the current page.
 */
export function TelemetryTracker({ activeIndex }: TelemetryTrackerProps) {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.3,
  });
  const markerY = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  const active = SECTIONS[activeIndex] ?? SECTIONS[0];

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 font-mono text-[10px] tracking-[0.2em] text-text-secondary md:flex"
    >
      <div className="text-right leading-tight">
        <div className="text-text-secondary">SECTION</div>
        <div className="text-text-primary">
          {active.num} <span className="text-text-secondary">/ 03</span>
        </div>
      </div>

      <div className="relative h-40 w-px bg-line">
        <motion.div
          className="absolute left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal-amber shadow-[0_0_8px_rgba(255,166,48,0.7)]"
          style={{ top: markerY }}
        />
      </div>

      <div className="text-data-cyan">── {active.label} ──</div>
    </div>
  );
}
