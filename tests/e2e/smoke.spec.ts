import { expect, test } from "@playwright/test";
import { expectNoSeriousViolations, waitForHydration } from "./axe";

const PAGES = [
  { name: "home", path: "/", heading: /Favour\s*Michael/ },
  { name: "projects", path: "/projects", heading: "Projects" },
  {
    name: "case-study-aidready",
    path: "/projects/aidready",
    heading: "AidReady",
  },
  {
    name: "case-study-campusnav",
    path: "/projects/campusnav",
    heading: "CampusNav AI",
  },
  { name: "about", path: "/about", heading: /^(About|Hi, I am Favour\.)$/ },
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
      // axe on a long page takes about 2.6 s in WebKit alone and far longer on a
      // loaded machine with parallel workers; 30 s timed out locally (17 Nov).
      test.setTimeout(60_000);

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
