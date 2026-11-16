// Low-power mode (NFR-2): same content, no motion. Chrome-only hints are
// ignored where the browser does not provide them.

export type DeviceHints = {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
  hardwareConcurrency?: number;
};

// Approved 16 Nov: only clearly weak devices; mid-range phones (4 GB, 8 cores) keep motion.
const MAX_LOW_MEMORY_GB = 2;
const MAX_LOW_CORES = 2;

export function detectLowPower(hints: DeviceHints): boolean {
  if (hints.connection?.saveData === true) return true;
  if (
    typeof hints.deviceMemory === "number" &&
    hints.deviceMemory <= MAX_LOW_MEMORY_GB
  ) {
    return true;
  }
  if (
    typeof hints.hardwareConcurrency === "number" &&
    hints.hardwareConcurrency > 0 &&
    hints.hardwareConcurrency <= MAX_LOW_CORES
  ) {
    return true;
  }
  return false;
}

export function shouldReduceMotion(options: {
  prefersReducedMotion: boolean;
  hints: DeviceHints;
}): boolean {
  return options.prefersReducedMotion || detectLowPower(options.hints);
}
