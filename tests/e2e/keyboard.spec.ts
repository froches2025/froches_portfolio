import { expect, test } from "@playwright/test";
import { waitForHydration } from "./axe";

const focusedName = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    return (
      element?.getAttribute("aria-label") ?? element?.textContent?.trim() ?? ""
    );
  });

test.describe("keyboard-only navigation (desktop)", () => {
  test.skip(
    ({ isMobile }) => isMobile,
    "Phones are covered by the touch test below",
  );

  test("Tab reaches the skip link first, then every header control", async ({
    page,
  }) => {
    await page.goto("/this-page-does-not-exist");

    await page.keyboard.press("Tab");
    expect(await focusedName(page)).toBe("Skip to content");
    await page.keyboard.press("Tab");
    expect(await focusedName(page)).toBe("Favour Michael");
    await page.keyboard.press("Tab");
    expect(await focusedName(page)).toBe("Projects");
    await page.keyboard.press("Tab");
    expect(await focusedName(page)).toBe("About");
    // Resume appears only when a resume is published.
    if (
      (await page
        .getByRole("navigation", { name: "Main" })
        .getByRole("link", { name: "Resume" })
        .count()) > 0
    ) {
      await page.keyboard.press("Tab");
      expect(await focusedName(page)).toBe("Resume");
    }
    await page.keyboard.press("Tab");
    expect(await focusedName(page)).toBe("Open quick search, Ctrl K");
  });

  test("the skip link moves focus to the main content", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("main");
    await page.keyboard.press("Tab");
    expect(await focusedName(page)).toBe("Go to projects");
  });

  test("Ctrl K opens the palette, typing filters, arrows move, Enter navigates", async ({
    page,
  }) => {
    await page.goto("/this-page-does-not-exist");
    await waitForHydration(page);
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Jump to a page or action" }),
    ).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await expect(dialog.getByRole("option", { selected: true })).toHaveText(
      /Projects/,
    );

    // The palette now holds real entries, so search for an exact page name.
    await page.keyboard.type("about");
    await expect(dialog.getByRole("option").first()).toHaveText(/^About/);
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/about$/);
    await expect(dialog).toBeHidden();
  });

  test("Escape closes the palette and returns focus to the control that opened it", async ({
    page,
  }) => {
    await page.goto("/this-page-does-not-exist");
    const hint = page.getByRole("button", {
      name: "Open quick search, Ctrl K",
    });
    await waitForHydration(page);
    await hint.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(hint).toBeFocused();
  });

  test("Tab stays inside the open palette", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await waitForHydration(page);
    await page.keyboard.press("Control+k");
    // The palette loads on first open; wait until it is there and focused.
    await expect(
      page.getByRole("combobox", { name: "Jump to a page or action" }),
    ).toBeFocused();
    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press("Tab");
      expect(
        await page.evaluate(
          () => !!document.activeElement?.closest('[role="dialog"]'),
        ),
      ).toBe(true);
    }
  });
});

test.describe("menu on phones", () => {
  test.skip(({ isMobile }) => !isMobile, "Desktop uses the header and Ctrl K");

  test("the 44 px menu button opens the palette and closes it again", async ({
    page,
  }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "Open menu and search" });
    const box = await button.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);

    await button.tap();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    await page.getByRole("button", { name: "Close menu" }).tap();
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
