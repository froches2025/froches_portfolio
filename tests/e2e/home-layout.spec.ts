import { expect, test } from "@playwright/test";

// FR-1.2, design 13: the sticky left column on desktop home fits the window,
// stops at the end of its grid, and never runs over the site footer.

test.skip(
  ({ isMobile }) => isMobile,
  "the sticky two-column layout is desktop only",
);

for (const viewport of [
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
]) {
  test(`home column fits and clears the footer at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const socials = page.locator("[data-home-socials]");
    const column = page.locator("[data-home-column]");
    const footer = page.locator("footer");

    // On load, the column's socials are on screen without scrolling.
    await expect(socials.getByRole("link", { name: /^GitHub/ })).toBeVisible();
    const socialsBox = (await socials.boundingBox())!;
    expect(socialsBox.y).toBeGreaterThanOrEqual(0);
    expect(socialsBox.y + socialsBox.height).toBeLessThanOrEqual(
      viewport.height,
    );

    // The footer does not repeat them on desktop home.
    await expect(footer.getByRole("link", { name: /^GitHub/ })).toBeHidden();

    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(0);

    const columnBox = (await column.boundingBox())!;
    const footerBox = (await footer.boundingBox())!;
    expect(columnBox.y + columnBox.height).toBeLessThanOrEqual(footerBox.y);
  });
}

test("the footer keeps its socials on other desktop pages", async ({
  page,
}) => {
  await page.goto("/about");
  await expect(
    page.locator("footer").getByRole("link", { name: /^GitHub/ }),
  ).toBeVisible();
});
