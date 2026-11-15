// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

type Factory = (...args: unknown[]) => string;
const createServerClient = vi.fn<Factory>(() => "server-client");
const createBrowserClient = vi.fn<Factory>(() => "browser-client");
const createClient = vi.fn<Factory>(() => "public-client");
const cookieStore = {
  getAll: vi.fn(() => [{ name: "a", value: "1" }]),
  set: vi.fn(),
};

vi.mock("@supabase/ssr", () => ({ createServerClient, createBrowserClient }));
vi.mock("@supabase/supabase-js", () => ({ createClient }));
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));

const { createServerSupabase, createPublicSupabase } =
  await import("@/lib/supabase/server");
const { createBrowserSupabase } = await import("@/lib/supabase/browser");

const URL = "http://127.0.0.1:54321";
const KEY = "sb_publishable_test";

type CookieOptions = {
  cookies: {
    getAll: () => unknown;
    setAll: (
      cookies: { name: string; value: string; options: object }[],
    ) => void;
  };
};

describe("Supabase clients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("browser client uses the public URL and publishable key", () => {
    expect(createBrowserSupabase()).toBe("browser-client");
    expect(createBrowserClient).toHaveBeenCalledWith(URL, KEY);
  });

  it("public client never persists or refreshes a session", () => {
    expect(createPublicSupabase()).toBe("public-client");
    expect(createClient).toHaveBeenCalledWith(URL, KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  });

  it("server client reads and writes request cookies", async () => {
    expect(await createServerSupabase()).toBe("server-client");
    const [url, key, options] = createServerClient.mock.calls[0] as [
      string,
      string,
      CookieOptions,
    ];
    expect([url, key]).toEqual([URL, KEY]);

    expect(options.cookies.getAll()).toEqual([{ name: "a", value: "1" }]);
    options.cookies.setAll([
      { name: "sb", value: "token", options: { path: "/" } },
    ]);
    expect(cookieStore.set).toHaveBeenCalledWith("sb", "token", { path: "/" });
  });

  it("server client ignores cookie writes where Next.js forbids them", async () => {
    await createServerSupabase();
    const options = createServerClient.mock.calls[0][2] as CookieOptions;
    cookieStore.set.mockImplementationOnce(() => {
      throw new Error("Cookies can only be modified in a Server Action");
    });
    expect(() =>
      options.cookies.setAll([{ name: "sb", value: "t", options: {} }]),
    ).not.toThrow();
  });
});
