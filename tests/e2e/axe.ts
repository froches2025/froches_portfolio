import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";

const WCAG_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22a",
  "wcag22aa",
];

// Every violation is attached to the report; only serious and critical ones
// fail the run (technical-design section 7).
export async function expectNoSeriousViolations(
  page: Page,
  testInfo: TestInfo,
  name: string,
) {
  // Audit the settled page: mid-fade frames of the entrance have lower contrast
  // than the final state, and that is not what a visitor reads.
  await page.waitForFunction(
    () =>
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getComputedTiming().iterations !== Infinity,
        )
        .every((animation) => animation.playState === "finished"),
    null,
    // A fixed interval, not requestAnimationFrame: WebKit can stop firing
    // frames for a page it treats as hidden during parallel runs.
    { polling: 100, timeout: 10_000 },
  );
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  await testInfo.attach(`axe-${name}.json`, {
    body: JSON.stringify(results.violations, null, 2),
    contentType: "application/json",
  });
  const blocking = results.violations.filter(
    (violation) =>
      violation.impact === "serious" || violation.impact === "critical",
  );
  expect(blocking, `serious or critical axe violations on ${name}`).toEqual([]);
}

// Keyboard shortcuts work once React has hydrated. MotionPreferenceProvider
// sets data-motion on <html> in an effect, so its presence means the page is
// interactive.
export async function waitForHydration(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("data-motion", /.+/);
}
