import { expect, test } from "@playwright/test";

// Content rules on the real pages, against the seeded data the build used.

test("a case study hides its empty sections and has no gallery without images", async ({
  page,
}) => {
  await page.goto("/projects/campusnav");
  const headings = await page
    .getByRole("heading", { level: 2 })
    .allTextContents();
  expect(headings).toEqual(expect.arrayContaining(["Approach", "Stack"]));
  for (const empty of ["Problem", "My role", "Challenges", "Outcome"]) {
    expect(headings).not.toContain(empty);
  }
  await expect(page.getByRole("region", { name: /screenshots/ })).toHaveCount(
    0,
  );
  await expect(page.getByText("In development")).toBeVisible();
});

test("the AidReady case study shows its sections, status and links", async ({
  page,
}) => {
  await page.goto("/projects/aidready");
  const headings = await page
    .getByRole("heading", { level: 2 })
    .allTextContents();
  expect(headings).toEqual(["My role", "Approach", "Stack", "Outcome"]);
  await expect(
    page.getByRole("link", { name: /Visit Help Finder/ }),
  ).toHaveAttribute("href", "https://aidready-finder.froches.tech");
  await expect(
    page.getByRole("navigation", { name: "More projects" }),
  ).toContainText("LifeTrack");
});

// The e2e job in CI has no database at all, so these answer only if no query happens.
for (const path of [
  "/projects/does-not-exist",
  "/projects/draft-project",
  "/projects/AidReady",
]) {
  test(`unknown slug ${path} is a real 404 without a database call`, async ({
    page,
  }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "This page moved or never existed.",
      }),
    ).toBeVisible();
  });
}

test("the v1 resume link redirects permanently to /resume", async ({
  request,
}) => {
  const response = await request.get("/resume-favour-michael.pdf", {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/resume");
});

test("/resume matches whether a resume is published", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const hasButton =
    (await page.getByRole("link", { name: "Download resume" }).count()) > 0;
  const response = await request.get("/resume", { maxRedirects: 0 });
  if (hasButton) {
    expect(response.status()).toBe(307);
    expect(response.headers().location).toMatch(
      /\/storage\/v1\/object\/public\/documents\/.+\.pdf$/,
    );
  } else {
    // No resume uploaded (CI's seed): the route is 404 and no button points at it.
    expect(response.status()).toBe(404);
  }
});

test("About shows the doodles and the distance card's fallback without location headers", async ({
  page,
}) => {
  await page.goto("/about");
  // Seven fact-card doodles, plus the pin on the distance card's unknown state.
  await expect(
    page.locator("svg[data-doodle]:not([data-doodle=pin])"),
  ).toHaveCount(7);
  const card = page.locator("li[data-state]");
  await expect(card).toHaveAttribute("data-state", "unknown");
  await expect(card.locator('svg[data-doodle="pin"]')).toBeVisible();
  await expect(
    page.getByText("I am from Nigeria and live in Kigali, Rwanda.", {
      exact: true,
    }),
  ).toBeVisible();
  // The other states stay in the DOM to hold the card's size, hidden.
  for (const line of await page.getByText(/Nothing is stored/).all()) {
    await expect(line).toBeHidden();
  }
  await expect(page.getByRole("heading", { name: "Leadership" })).toBeVisible();
});

test("the palette lists the case studies and links", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", /.+/);
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu and search" }).click();
  } else {
    await page.keyboard.press("Control+k");
  }
  await page
    .getByRole("combobox", { name: "Jump to a page or action" })
    .fill("case study");
  await expect(page.getByRole("option")).toHaveCount(4);
  await page.getByRole("combobox").fill("github");
  await expect(page.getByRole("option")).toHaveText(["GitHubLink"]);
});
