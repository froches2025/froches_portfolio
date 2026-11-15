// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const limit = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createPublicSupabase: () => ({
    from: () => ({ select: () => ({ limit }) }),
  }),
}));

const { GET } = await import("@/app/api/cron/keepalive/route");

const secret = "test-cron-secret-0123456789abcdef0123";
const call = (authorization?: string) =>
  GET(
    new Request("http://localhost/api/cron/keepalive", {
      headers: authorization ? { authorization } : {},
    }),
  );

describe("GET /api/cron/keepalive", () => {
  beforeEach(() => {
    limit.mockReset();
  });

  it("returns 401 without a token and does not query", async () => {
    const response = await call();
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(limit).not.toHaveBeenCalled();
  });

  it("returns 401 with a wrong token", async () => {
    const response = await call("Bearer wrong");
    expect(response.status).toBe(401);
    expect(limit).not.toHaveBeenCalled();
  });

  it("runs one query and returns 200 with the right token", async () => {
    limit.mockResolvedValue({ error: null });
    const response = await call(`Bearer ${secret}`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(limit).toHaveBeenCalledTimes(1);
  });

  it("returns 503 when the query fails", async () => {
    limit.mockResolvedValue({ error: { message: "paused" } });
    const response = await call(`Bearer ${secret}`);
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
