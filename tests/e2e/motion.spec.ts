import { expect, test, type Page } from "@playwright/test";

// The contour field's vertical offset, read from its computed transform.
const contourOffsetY = (page: Page) =>
  page.evaluate(() => {
    const drift = document.querySelector("[data-contours]")?.parentElement;
    if (!drift) return Number.NaN;
    const transform = getComputedStyle(drift).transform;
    return transform === "none" ? 0 : new DOMMatrix(transform).m42;
  });

async function makeTallAndScroll(page: Page) {
  await page.addStyleTag({ content: "#main { min-height: 4000px; }" });
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
}

test.describe("full motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("contour lines drift with the scroll", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
    expect(await contourOffsetY(page)).toBe(0);
    await makeTallAndScroll(page);
    await expect.poll(() => contourOffsetY(page)).toBeGreaterThan(0);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("marks the page and keeps the contour lines still", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion",
      "reduced",
    );
    await makeTallAndScroll(page);
    expect(await contourOffsetY(page)).toBe(0);
  });

  test("the page entrance shows content in its final state at once", async ({
    page,
  }) => {
    await page.goto("/this-page-does-not-exist");
    const opacity = await page.evaluate(
      () => getComputedStyle(document.querySelector(".entrance")!).opacity,
    );
    expect(opacity).toBe("1");
  });
});
