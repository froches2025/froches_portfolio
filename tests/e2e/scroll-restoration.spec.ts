import { expect, test } from "@playwright/test";

// FR-1.4: going back from a case study returns to the same place on home.

test("nothing turns off the browser's scroll restoration", async ({ page }) => {
  await page.goto("/");
  expect(await page.evaluate(() => history.scrollRestoration)).toBe("auto");
});

test("going back from a case study restores the home scroll position", async ({
  page,
}) => {
  await page.goto("/");
  const card = page.getByRole("link", {
    name: "Read case study: CampusNav AI",
  });
  await card.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(300);

  await card.click();
  await expect(page).toHaveURL(/\/projects\/campusnav$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "CampusNav AI" }),
  ).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect
    .poll(() =>
      page.evaluate((target) => Math.abs(window.scrollY - target), before),
    )
    .toBeLessThanOrEqual(2);
});
