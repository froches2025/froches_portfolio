// @vitest-environment node
import { describe, expect, it } from "vitest";
import { detectLowPower, shouldReduceMotion } from "@/lib/motion/preferences";

describe("detectLowPower", () => {
  it("is off when the browser gives no hints", () => {
    expect(detectLowPower({})).toBe(false);
  });

  it("is on when the visitor asked to save data", () => {
    expect(detectLowPower({ connection: { saveData: true } })).toBe(true);
    expect(detectLowPower({ connection: { saveData: false } })).toBe(false);
  });

  it("is on at 2 GB of memory or less, off above", () => {
    expect(detectLowPower({ deviceMemory: 1 })).toBe(true);
    expect(detectLowPower({ deviceMemory: 2 })).toBe(true);
    expect(detectLowPower({ deviceMemory: 4 })).toBe(false);
  });

  it("is on at 2 cores or fewer, off above", () => {
    expect(detectLowPower({ hardwareConcurrency: 2 })).toBe(true);
    expect(detectLowPower({ hardwareConcurrency: 4 })).toBe(false);
    expect(detectLowPower({ hardwareConcurrency: 8 })).toBe(false);
  });

  it("ignores a core count of 0, which means unknown", () => {
    expect(detectLowPower({ hardwareConcurrency: 0 })).toBe(false);
  });

  it("keeps full motion on a mid-range phone", () => {
    expect(
      detectLowPower({
        deviceMemory: 4,
        hardwareConcurrency: 8,
        connection: { saveData: false },
      }),
    ).toBe(false);
  });
});

describe("shouldReduceMotion", () => {
  it("follows the reduced-motion setting on a capable device", () => {
    expect(shouldReduceMotion({ prefersReducedMotion: true, hints: {} })).toBe(
      true,
    );
    expect(shouldReduceMotion({ prefersReducedMotion: false, hints: {} })).toBe(
      false,
    );
  });

  it("reduces motion on a low-power device even without the setting", () => {
    expect(
      shouldReduceMotion({
        prefersReducedMotion: false,
        hints: { deviceMemory: 1 },
      }),
    ).toBe(true);
  });
});
