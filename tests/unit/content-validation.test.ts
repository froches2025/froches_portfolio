// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  aboutFactSchema,
  experienceSchema,
  parseRows,
  profileSchema,
  projectSchema,
} from "@/lib/validation/content";
import { profileRow, projectRow } from "./fixtures";

describe("projectSchema", () => {
  it("accepts a seed-shaped project", () => {
    expect(projectSchema.parse(projectRow()).slug).toBe("aidready");
  });

  it("turns empty or whitespace-only sections into null so they are hidden", () => {
    const project = projectSchema.parse(projectRow());
    expect(project.approach_md).toBeNull();
    expect(project.challenges_md).toBeNull();
    expect(project.problem_md).toBeNull();
    expect(project.role_md).toBe("I built it.");
  });

  it("sorts images by sort_order so the first is the cover", () => {
    const project = projectSchema.parse(
      projectRow({
        project_images: [
          {
            storage_path: "b.png",
            alt: "B",
            caption: null,
            width: 10,
            height: 10,
            sort_order: 2,
          },
          {
            storage_path: "a.png",
            alt: "A",
            caption: "",
            width: 10,
            height: 10,
            sort_order: 1,
          },
        ],
      }),
    );
    expect(project.project_images.map((image) => image.storage_path)).toEqual([
      "a.png",
      "b.png",
    ]);
    expect(project.project_images[0]?.caption).toBeNull();
  });

  it.each([
    ["an http live URL", { live_url: "http://example.com" }],
    ["13 stack tags", { stack: Array.from({ length: 13 }, (_, i) => `t${i}`) }],
    ["a tag of 31 characters", { stack: ["a".repeat(31)] }],
    ["a one-liner of 201 characters", { one_liner: "a".repeat(201) }],
    ["a tagline of 81 characters", { tagline: "a".repeat(81) }],
    ["a missing tagline", { tagline: undefined }],
    ["an unknown status", { status: "paused" }],
    ["a slug with capitals", { slug: "AidReady" }],
    ["a year before 2015", { year: 2014 }],
    [
      "an image without alt text",
      {
        project_images: [
          {
            storage_path: "a.png",
            alt: "",
            caption: null,
            width: 1,
            height: 1,
            sort_order: 1,
          },
        ],
      },
    ],
  ])("rejects %s", (_name, overrides) => {
    expect(projectSchema.safeParse(projectRow(overrides)).success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("accepts the seed profile", () => {
    expect(profileSchema.parse(profileRow).email).toBe(
      "f.michael@alustudent.com",
    );
  });

  it("rejects an http social link and a bad email", () => {
    expect(
      profileSchema.safeParse({ ...profileRow, x_url: "http://x.com/froches_" })
        .success,
    ).toBe(false);
    expect(
      profileSchema.safeParse({ ...profileRow, email: "not-an-email" }).success,
    ).toBe(false);
  });

  it("requires the pitch", () => {
    expect(profileSchema.safeParse({ ...profileRow, pitch: "" }).success).toBe(
      false,
    );
  });
});

describe("experienceSchema", () => {
  const row = {
    role: "Frontend Intern",
    organisation: "HNG Internship (Cohort 11, frontend track)",
    org_url: null,
    location: "Remote",
    engagement: null,
    start_month: "2024-07-01",
    end_month: "2024-09-01",
    bullets: ["Finished all stages."],
    certificate_path: null,
    sort_order: 3,
  };

  it("accepts a seed-shaped row and an open end date", () => {
    expect(experienceSchema.parse(row).role).toBe("Frontend Intern");
    expect(
      experienceSchema.parse({ ...row, end_month: null }).end_month,
    ).toBeNull();
  });

  it("rejects 9 bullets and a non-date month", () => {
    expect(
      experienceSchema.safeParse({ ...row, bullets: Array(9).fill("x") })
        .success,
    ).toBe(false);
    expect(
      experienceSchema.safeParse({ ...row, start_month: "July 2024" }).success,
    ).toBe(false);
  });
});

describe("aboutFactSchema", () => {
  const fact = {
    title: "Top 5 of 35 teams",
    body_md: "At the Frontiers GenAI Hackathon.",
    link_url: "/projects/aidready",
    link_label: "Read the case study",
    doodle: "trophy",
    size: "normal",
    sort_order: 1,
  };

  it("accepts a site path and an https link", () => {
    expect(aboutFactSchema.safeParse(fact).success).toBe(true);
    expect(
      aboutFactSchema.safeParse({
        ...fact,
        link_url: "https://sauce.froches.tech",
      }).success,
    ).toBe(true);
  });

  it.each([
    "//evil.com",
    "/\\evil.com",
    "http://example.com",
    "javascript:alert(1)",
  ])("rejects the link %s", (link_url) => {
    expect(aboutFactSchema.safeParse({ ...fact, link_url }).success).toBe(
      false,
    );
  });

  it("needs a label exactly when there is a link", () => {
    expect(
      aboutFactSchema.safeParse({ ...fact, link_label: null }).success,
    ).toBe(false);
    expect(aboutFactSchema.safeParse({ ...fact, link_url: null }).success).toBe(
      false,
    );
    expect(
      aboutFactSchema.safeParse({ ...fact, link_url: null, link_label: null })
        .success,
    ).toBe(true);
  });

  it("rejects an unknown doodle or size", () => {
    expect(
      aboutFactSchema.safeParse({ ...fact, doodle: "rocket" }).success,
    ).toBe(false);
    expect(aboutFactSchema.safeParse({ ...fact, size: "huge" }).success).toBe(
      false,
    );
  });
});

describe("parseRows", () => {
  it("returns parsed rows", () => {
    expect(parseRows(profileSchema, [profileRow], "profile")).toHaveLength(1);
  });

  it("names the table and field when a row is invalid", () => {
    expect(() =>
      parseRows(
        projectSchema,
        [projectRow({ live_url: "http://x" })],
        "project",
      ),
    ).toThrow(/Invalid project row from Supabase at 0\.live_url/);
  });
});
