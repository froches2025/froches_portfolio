// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { profileRow } from "./fixtures";

const getProjectSlugs = vi.fn();
vi.mock("@/lib/content/queries", () => ({ getProjectSlugs }));

const { pageMetadata } = await import("@/lib/seo/metadata");
const { personJsonLd, serializeJsonLd } = await import("@/lib/seo/person");
const { isIndexable, robotsHeaders } = await import("@/lib/seo/indexing");
const { default: robots } = await import("@/app/robots");
const { default: sitemap } = await import("@/app/sitemap");

const siteImage = {
  url: "/opengraph-image",
  alt: "Favour Michael, software engineer",
  width: 1200,
  height: 630,
  type: "image/png",
};

describe("pageMetadata (FR-10.1)", () => {
  it("fills title, description, canonical, Open Graph and Twitter together", () => {
    expect(
      pageMetadata({
        title: "About",
        description: "About me.",
        path: "/about",
      }),
    ).toEqual({
      title: "About",
      description: "About me.",
      alternates: { canonical: "/about" },
      openGraph: {
        type: "website",
        siteName: "Favour Michael",
        title: "About · Favour Michael",
        description: "About me.",
        url: "/about",
        images: [siteImage],
      },
      twitter: {
        card: "summary_large_image",
        title: "About · Favour Michael",
        description: "About me.",
        images: [siteImage],
      },
    });
  });

  it("leaves the image to a same-folder opengraph-image file when asked", () => {
    const metadata = pageMetadata({
      description: "Home.",
      path: "/",
      image: "file",
    });
    expect(metadata.openGraph).not.toHaveProperty("images");
    expect(metadata.twitter).not.toHaveProperty("images");
  });

  it("uses the site name alone without a page title", () => {
    const metadata = pageMetadata({ description: "Home.", path: "/" });
    expect(metadata.title).toBeUndefined();
    expect(metadata.openGraph?.title).toBe("Favour Michael");
  });

  it("puts a case study's own share image and alt on both cards", () => {
    const metadata = pageMetadata({
      title: "AidReady",
      description: "One-liner.",
      path: "/projects/aidready",
      image: {
        url: "/projects/aidready/share.png",
        alt: "AidReady: case study by Favour Michael",
      },
    });
    const image = {
      url: "/projects/aidready/share.png",
      alt: "AidReady: case study by Favour Michael",
      width: 1200,
      height: 630,
      type: "image/png",
    };
    expect(metadata.openGraph?.images).toEqual([image]);
    expect(metadata.twitter?.images).toEqual([image]);
  });
});

describe("personJsonLd", () => {
  it("describes Favour from the profile row", () => {
    expect(personJsonLd(profileRow, "https://froches.tech")).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Favour Michael",
      jobTitle: "Software engineer",
      url: "https://froches.tech/",
      sameAs: [
        "https://github.com/froches2025",
        "https://www.linkedin.com/in/froches",
        "https://x.com/froches_",
      ],
    });
  });

  it("leaves out links the profile does not have", () => {
    const data = personJsonLd(
      { ...profileRow, linkedin_url: null, x_url: null },
      "https://froches.tech",
    );
    expect(data.sameAs).toEqual(["https://github.com/froches2025"]);
    const none = personJsonLd(
      { ...profileRow, github_url: null, linkedin_url: null, x_url: null },
      "https://froches.tech",
    );
    expect(none).not.toHaveProperty("sameAs");
  });

  it("escapes < so profile text cannot close the script tag", () => {
    const json = serializeJsonLd({
      name: "</script><script>alert(1)</script>",
    });
    expect(json).not.toContain("<");
    expect(JSON.parse(json).name).toBe("</script><script>alert(1)</script>");
  });
});

describe("indexing (only production is indexed)", () => {
  it.each(["preview", "development"] as const)(
    "sends noindex on every path for %s deployments",
    (vercelEnv) => {
      expect(isIndexable(vercelEnv)).toBe(false);
      expect(robotsHeaders(vercelEnv)).toEqual([
        {
          source: "/:path*",
          headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
        },
      ]);
    },
  );

  it.each(["production", undefined] as const)(
    "sends no robots header for %s (production, or local and CI)",
    (vercelEnv) => {
      expect(isIndexable(vercelEnv)).toBe(true);
      expect(robotsHeaders(vercelEnv)).toEqual([]);
    },
  );
});

describe("robots.txt (FR-10.2)", () => {
  it("allows the site, blocks /admin and names the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/admin" },
      sitemap: "http://localhost:3000/sitemap.xml",
    });
  });
});

describe("sitemap.xml (FR-10.2)", () => {
  it("lists the public pages and each published case study", async () => {
    getProjectSlugs.mockResolvedValue(["aidready", "lifetrack"]);
    expect((await sitemap()).map((entry) => entry.url)).toEqual([
      "http://localhost:3000/",
      "http://localhost:3000/projects",
      "http://localhost:3000/about",
      "http://localhost:3000/privacy",
      "http://localhost:3000/projects/aidready",
      "http://localhost:3000/projects/lifetrack",
    ]);
  });
});
