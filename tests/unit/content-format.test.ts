// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  formatMonth,
  formatMonthRange,
  isExternalLink,
  paragraphs,
  statusLabel,
} from "@/lib/content/format";
import { hasResume, paletteItems, socialLinks } from "@/lib/content/site";
import { publicStorageUrl } from "@/lib/content/storage";
import { profileSchema, projectSchema } from "@/lib/validation/content";
import { profileRow, projectRow } from "./fixtures";

describe("dates", () => {
  it("formats a month without time-zone drift", () => {
    expect(formatMonth("2026-05-01")).toBe("May 2026");
    expect(formatMonth("2024-12-01")).toBe("Dec 2024");
  });

  it("formats a range, and an open range as present", () => {
    expect(formatMonthRange("2026-05-01", "2026-08-01")).toBe(
      "May 2026 to Aug 2026",
    );
    expect(formatMonthRange("2026-02-01", null)).toBe("Feb 2026 to present");
  });
});

describe("statusLabel", () => {
  it("labels each status", () => {
    expect(statusLabel("live")).toBe("Live");
    expect(statusLabel("in_development")).toBe("In development");
    expect(statusLabel("archived")).toBe("Archived");
  });
});

describe("paragraphs", () => {
  it("splits on blank lines and drops empty pieces", () => {
    expect(paragraphs("One.\n\nTwo.\n  \n\nThree.")).toEqual([
      "One.",
      "Two.",
      "Three.",
    ]);
  });
});

describe("isExternalLink", () => {
  it("is true for https only", () => {
    expect(isExternalLink("https://sauce.froches.tech")).toBe(true);
    expect(isExternalLink("/projects/aidready")).toBe(false);
  });
});

describe("publicStorageUrl", () => {
  it("builds a public Storage URL and encodes each path segment", () => {
    expect(publicStorageUrl("documents", "resume/favour michael.pdf")).toBe(
      "http://127.0.0.1:54321/storage/v1/object/public/documents/resume/favour%20michael.pdf",
    );
  });
});

describe("site helpers", () => {
  const profile = profileSchema.parse(profileRow);
  const projects = [projectSchema.parse(projectRow())];

  it("has no resume until a path is set", () => {
    expect(hasResume(profile)).toBe(false);
    expect(
      hasResume({ ...profile, resume_path: "resume/favour-michael.pdf" }),
    ).toBe(true);
  });

  it("only returns social links that exist", () => {
    expect(socialLinks({ ...profile, x_url: null })).toEqual({
      github: "https://github.com/froches2025",
      linkedin: "https://www.linkedin.com/in/froches",
      email: "f.michael@alustudent.com",
    });
  });

  it("lists pages, case studies, actions and links in the palette", () => {
    const labels = paletteItems(profile, projects).map((item) => item.label);
    expect(labels).toEqual([
      "Home",
      "Projects",
      "About",
      "AidReady case study",
      "Email Favour",
      "GitHub",
      "LinkedIn",
      "X",
    ]);
  });

  it("adds Download resume when there is one", () => {
    const items = paletteItems(
      { ...profile, resume_path: "resume/favour-michael.pdf" },
      projects,
    );
    expect(items.find((item) => item.label === "Download resume")?.href).toBe(
      "/resume",
    );
  });
});
