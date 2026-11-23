// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

// Slugs come from tests/unit/stubs/project-slugs.json (aliased in vitest.config.mts).

const { proxy, config } = await import("@/proxy");

const request = (path: string) =>
  new NextRequest(new URL(path, "https://froches.tech"));

describe("proxy (unknown case-study slugs)", () => {
  it("only runs on case studies and the files under them", () => {
    expect(config.matcher).toEqual([
      "/projects/:slug",
      "/projects/:slug/:rest*",
    ]);
  });

  it("lets a published slug's share image through", () => {
    const response = proxy(request("/projects/aidready/opengraph-image/card"));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("lets a published slug through", () => {
    const response = proxy(request("/projects/aidready"));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it.each([
    "/projects/does-not-exist",
    "/projects/draft-project",
    "/projects/AidReady",
    "/projects/does-not-exist/opengraph-image/card",
  ])(
    "rewrites %s to the 404 page with status 404, without a redirect",
    (path) => {
      const response = proxy(request(path));
      expect(response.status).toBe(404);
      expect(response.headers.get("x-middleware-rewrite")).toBe(
        "https://froches.tech/_project-not-found",
      );
      expect(response.headers.get("location")).toBeNull();
    },
  );
});
