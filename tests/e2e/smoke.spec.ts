import { expect, test } from "@playwright/test";
import { expectNoSeriousViolations, waitForHydration } from "./axe";

const PAGES = [
  { name: "home", path: "/", heading: "Favour Michael" },
  {
    name: "404",
    path: "/this-page-does-not-exist",
    heading: "This page moved or never existed.",
  },
] as const;

for (const colorScheme of ["light", "dark"] as const) {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test.describe(`${colorScheme} theme, motion ${reducedMotion}`, () => {
      test.use({ colorScheme, reducedMotion });

      for (const { name, path, heading } of PAGES) {
        test(`${name} renders and has no serious accessibility violations`, async ({
          page,
        }, testInfo) => {
          await page.goto(path);
          await expect(
            page.getByRole("heading", { level: 1, name: heading }),
          ).toBeVisible();
          await expectNoSeriousViolations(
            page,
            testInfo,
            `${name}-${colorScheme}-${reducedMotion}`,
          );
        });
      }

      test("the open command palette has no serious accessibility violations", async ({
        page,
        isMobile,
      }, testInfo) => {
        await page.goto("/this-page-does-not-exist");
        if (isMobile) {
          await page
            .getByRole("button", { name: "Open menu and search" })
            .click();
        } else {
          await waitForHydration(page);
          await page.keyboard.press("Control+k");
        }
        await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
        await expectNoSeriousViolations(
          page,
          testInfo,
          `palette-${colorScheme}-${reducedMotion}`,
        );
      });
    });
  }
}
