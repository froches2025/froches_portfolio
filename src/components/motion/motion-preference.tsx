"use client";

import { MotionConfig, useReducedMotion } from "motion/react";
import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { detectLowPower, type DeviceHints } from "@/lib/motion/preferences";

const ReducedMotionContext = createContext(false);

// Device hints never change during a visit, so there is nothing to subscribe to.
const subscribe = () => () => {};
const readLowPower = () => detectLowPower(navigator as DeviceHints);
// The server cannot know the device; it renders full motion markup, which is
// identical content either way.
const readLowPowerOnServer = () => false;

export function MotionPreferenceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const lowPower = useSyncExternalStore(
    subscribe,
    readLowPower,
    readLowPowerOnServer,
  );
  const reduced = prefersReducedMotion || lowPower;

  // CSS micro-interactions read this attribute; JS motion reads the context.
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);

  return (
    <ReducedMotionContext value={reduced}>
      <MotionConfig reducedMotion={reduced ? "always" : "user"}>
        {children}
      </MotionConfig>
    </ReducedMotionContext>
  );
}

export function useReducedMotionPreference(): boolean {
  return useContext(ReducedMotionContext);
}
