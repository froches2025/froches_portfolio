import { expect, test } from "@playwright/test";

// FR-1.4: going back restores the scroll position.

test("nothing turns off the browser's scroll restoration", async ({ page }) => {
  await page.goto("/");
  expect(await page.evaluate(() => history.scrollRestoration)).toBe("auto");
});

// Needs two real pages. In step 3 every route except / is a 404, and Next.js
// loads a 404 with a full document request (its client fetch gets a 404 and
// falls back), so going back reloads the page and nothing injected to make it
// tall survives. Traced on 16 Nov: `document GET /projects -> 404`, then
// `document GET /this-page-does-not-exist` on back. Step 4 replaces this with
// home -> case study -> back on real content.
test.fixme("going back from a case study restores the home scroll position", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page
    .getByRole("link", { name: /case study/i })
    .first()
    .click();
  await page.goBack();
  await expect
    .poll(() => page.evaluate(() => Math.abs(window.scrollY - 1500)))
    .toBeLessThanOrEqual(2);
});
