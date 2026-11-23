import { expect, test, type Page } from "@playwright/test";

// FR-10.1 to 10.3 and NFR-6 on the real build. CI's e2e job has no database
// at all, so every page and share image here must come from build output:
// a request-time Supabase query would fail these tests.

test.skip(
  ({ isMobile }) => isMobile,
  "head tags and files are the same on every device",
);

const PAGES = [
  { path: "/", title: "Favour Michael", image: "/opengraph-image" },
  {
    path: "/projects",
    title: "Projects · Favour Michael",
    image: "/opengraph-image",
  },
  {
    path: "/about",
    title: "About · Favour Michael",
    image: "/opengraph-image",
  },
  {
    path: "/privacy",
    title: "Privacy · Favour Michael",
    image: "/opengraph-image",
  },
  {
    path: "/projects/aidready",
    title: "AidReady · Favour Michael",
    image: "/projects/aidready/share.png",
    alt: "AidReady: case study by Favour Michael",
  },
  {
    path: "/projects/campusnav",
    title: "CampusNav AI · Favour Michael",
    image: "/projects/campusnav/share.png",
    alt: "CampusNav AI: case study by Favour Michael",
  },
] as const;

const meta = (page: Page, selector: string) =>
  page.locator(selector).first().getAttribute("content");

for (const entry of PAGES) {
  test(`${entry.path} has its title, description, canonical and share card`, async ({
    page,
    baseURL,
  }) => {
    await page.goto(entry.path);
    const url = new URL(entry.path, baseURL).toString().replace(/\/$/, "");

    await expect(page).toHaveTitle(entry.title);
    const description = await meta(page, 'meta[name="description"]');
    expect(description?.length).toBeGreaterThan(20);
    expect(
      (
        await page.locator('link[rel="canonical"]').getAttribute("href")
      )?.replace(/\/$/, ""),
    ).toBe(url);

    expect(await meta(page, 'meta[property="og:title"]')).toBe(entry.title);
    expect(await meta(page, 'meta[property="og:description"]')).toBe(
      description,
    );
    expect(
      (await meta(page, 'meta[property="og:url"]'))?.replace(/\/$/, ""),
    ).toBe(url);
    expect(await meta(page, 'meta[name="twitter:card"]')).toBe(
      "summary_large_image",
    );

    // Exactly one share image, so platforms cannot pick the wrong one.
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    const image = await meta(page, 'meta[property="og:image"]');
    expect(new URL(image!).pathname).toBe(entry.image);
    expect(await meta(page, 'meta[name="twitter:image"]')).toBe(image);
    if ("alt" in entry) {
      expect(await meta(page, 'meta[property="og:image:alt"]')).toBe(entry.alt);
    }

    const response = await page.request.get(image!);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
  });
}

test("home describes Favour as a schema.org Person", async ({ page }) => {
  await page.goto("/");
  const json = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  const person = JSON.parse(json!);
  expect(person).toMatchObject({
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Favour Michael",
    jobTitle: expect.any(String),
    url: expect.stringMatching(/^https?:\/\//),
  });
  expect(person.sameAs).toEqual(
    expect.arrayContaining([expect.stringContaining("github.com/froches2025")]),
  );
});

test("robots.txt allows the site, blocks /admin and names the sitemap", async ({
  request,
}) => {
  const body = await (await request.get("/robots.txt")).text();
  expect(body).toContain("Allow: /");
  expect(body).toContain("Disallow: /admin");
  expect(body).toMatch(/Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/);
});

test("the sitemap lists the public pages and published case studies only", async ({
  request,
}) => {
  const body = await (await request.get("/sitemap.xml")).text();
  const paths = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, loc]) => new URL(loc).pathname,
  );
  expect(paths).toEqual(
    expect.arrayContaining([
      "/",
      "/projects",
      "/about",
      "/privacy",
      "/projects/aidready",
    ]),
  );
  expect(paths.filter((path) => path.startsWith("/projects/"))).toHaveLength(4);
});

test("a local or CI build is indexable: no X-Robots-Tag", async ({
  request,
}) => {
  const response = await request.get("/");
  expect(response.headers()["x-robots-tag"]).toBeUndefined();
});

test("an unknown slug's share image is a 404, answered without the database", async ({
  request,
}) => {
  const response = await request.get("/projects/does-not-exist/share.png");
  expect(response.status()).toBe(404);
});

test("the footer links to the privacy note in the same tab", async ({
  page,
}) => {
  await page.goto("/about");
  const link = page.locator("footer").getByRole("link", { name: "Privacy" });
  await expect(link).toHaveAttribute("href", "/privacy");
  await expect(link).not.toHaveAttribute("target", "_blank");
  await link.click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Privacy" }),
  ).toBeVisible();
});
