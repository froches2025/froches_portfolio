// @vitest-environment node
import { describe, expect, it } from "vitest";
import { env, parseEnv, parseServerEnv } from "@/lib/env";

const valid = {
  NEXT_PUBLIC_SITE_URL: "https://froches.tech",
  NEXT_PUBLIC_SUPABASE_URL: "https://vkkygdflseadsodyqdbz.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_abc123",
};

describe("parseEnv", () => {
  it("accepts the production values", () => {
    expect(parseEnv(valid)).toEqual(valid);
  });

  it("accepts the local http URLs used in development and CI", () => {
    const local = {
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_local",
    };
    expect(parseEnv(local)).toEqual(local);
  });

  it.each(Object.keys(valid))("rejects a missing %s and names it", (name) => {
    expect(() => parseEnv({ ...valid, [name]: undefined })).toThrow(
      new RegExp(name),
    );
  });

  it("rejects an empty site URL", () => {
    expect(() => parseEnv({ ...valid, NEXT_PUBLIC_SITE_URL: "" })).toThrow(
      /NEXT_PUBLIC_SITE_URL/,
    );
  });

  it("rejects a value that is not a URL", () => {
    expect(() =>
      parseEnv({ ...valid, NEXT_PUBLIC_SITE_URL: "froches.tech" }),
    ).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it.each(["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_SUPABASE_URL"])(
    "rejects a %s that is not http or https",
    (name) => {
      expect(() =>
        parseEnv({ ...valid, [name]: "ftp://froches.tech" }),
      ).toThrow(new RegExp(name));
    },
  );

  it("rejects a secret key in the public key variable", () => {
    expect(() =>
      parseEnv({
        ...valid,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_abc123",
      }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  });
});

describe("parseServerEnv", () => {
  it("accepts a CRON_SECRET of 32 characters or more", () => {
    const secret = "a".repeat(32);
    expect(parseServerEnv({ CRON_SECRET: secret })).toEqual({
      CRON_SECRET: secret,
    });
  });

  it("rejects a missing CRON_SECRET", () => {
    expect(() => parseServerEnv({})).toThrow(/CRON_SECRET/);
  });

  it("rejects a short CRON_SECRET without printing it", () => {
    const secret = "short-secret-value";
    let message = "";
    try {
      parseServerEnv({ CRON_SECRET: secret });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/CRON_SECRET/);
    expect(message).not.toContain(secret);
  });
});

describe("env", () => {
  it("is parsed from process.env at import", () => {
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("http://127.0.0.1:54321");
  });
});
