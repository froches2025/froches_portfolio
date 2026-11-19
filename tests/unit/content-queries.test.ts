// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { profileRow, projectRow } from "./fixtures";

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

type Result = { data: unknown; error: { message: string } | null };
const results = new Map<string, Result>();
const calls: string[] = [];

// A chainable stand-in for the Supabase query builder: every call returns the
// builder, and awaiting it resolves to the result set for its table.
function builder(table: string) {
  const chain: Record<string, unknown> = {};
  for (const method of ["select", "eq", "order", "limit"])
    chain[method] = () => chain;
  chain.then = (resolve: (value: Result) => unknown) =>
    resolve(results.get(table) ?? { data: [], error: null });
  return chain;
}

vi.mock("@/lib/supabase/server", () => ({
  createPublicSupabase: () => ({
    from: (table: string) => {
      calls.push(table);
      return builder(table);
    },
  }),
}));

const queries = await import("@/lib/content/queries");

describe("content queries", () => {
  beforeEach(() => {
    results.clear();
    calls.length = 0;
  });

  it("parses the profile", async () => {
    results.set("profile", { data: [profileRow], error: null });
    expect((await queries.getProfile()).full_name).toBe("Favour Michael");
  });

  it("throws when Supabase fails, so the build fails loudly", async () => {
    results.set("profile", { data: null, error: { message: "paused" } });
    await expect(queries.getProfile()).rejects.toThrow(
      "Could not read profile from Supabase: paused",
    );
  });

  it("throws when there is no profile row", async () => {
    results.set("profile", { data: [], error: null });
    await expect(queries.getProfile()).rejects.toThrow(/no profile row/);
  });

  it("throws on a row that breaks the schema", async () => {
    results.set("projects", {
      data: [projectRow({ live_url: "http://x" })],
      error: null,
    });
    await expect(queries.getPublishedProjects()).rejects.toThrow(
      /Invalid project row/,
    );
  });

  it("returns featured projects in featured order", async () => {
    results.set("projects", {
      data: [
        projectRow({ slug: "a", featured_order: 2, sort_order: 1 }),
        projectRow({
          slug: "b",
          is_featured: false,
          featured_order: null,
          sort_order: 2,
        }),
        projectRow({ slug: "c", featured_order: 1, sort_order: 3 }),
      ],
      error: null,
    });
    expect((await queries.getFeaturedProjects()).map((p) => p.slug)).toEqual([
      "c",
      "a",
    ]);
  });

  it("finds a project by slug from the same published list", async () => {
    results.set("projects", { data: [projectRow()], error: null });
    expect((await queries.getProjectBySlug("aidready"))?.title).toBe(
      "AidReady",
    );
    expect(await queries.getProjectBySlug("nope")).toBeNull();
    expect(await queries.getProjectSlugs()).toEqual(["aidready"]);
    expect(new Set(calls)).toEqual(new Set(["projects"]));
  });

  it("reads every About table and reports which one failed", async () => {
    results.set("roles", { data: null, error: { message: "denied" } });
    await expect(queries.getAbout()).rejects.toThrow(
      "Could not read roles from Supabase: denied",
    );
    expect(calls.sort()).toEqual([
      "about_facts",
      "education",
      "experience",
      "roles",
      "skills",
    ]);
  });
});
