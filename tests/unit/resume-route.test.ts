// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

const getProfile = vi.fn();
vi.mock("@/lib/content/queries", () => ({ getProfile }));

const { GET } = await import("@/app/resume/route");

describe("GET /resume", () => {
  it("redirects to the current resume in Storage", async () => {
    getProfile.mockResolvedValue({ resume_path: "resume/favour-michael.pdf" });
    const response = await GET();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://127.0.0.1:54321/storage/v1/object/public/documents/resume/favour-michael.pdf",
    );
  });

  it("is 404 until a resume is published", async () => {
    getProfile.mockResolvedValue({ resume_path: null });
    expect((await GET()).status).toBe(404);
  });
});
