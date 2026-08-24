"use client";

import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { TelemetryTracker } from "./telemetry-tracker";

function sectionIndex(pathname: string) {
  if (pathname.startsWith("/projects")) return 1;
  if (pathname.startsWith("/about")) return 2;
  return 0;
}

export function TelemetryTrackerMount() {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (reduced) return null;

  return <TelemetryTracker activeIndex={sectionIndex(pathname)} />;
}
